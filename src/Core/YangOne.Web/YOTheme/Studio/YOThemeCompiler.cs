using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

namespace YangOne.Web;

/// <summary>
/// Server-side YOTheme Studio compiler (blueprint §20).
/// Compiles the three-level token architecture into the token CSS layer:
/// CSS variables (+ legacy --c-*/--yo-* aliases), appearance-mode blocks,
/// scoped selectors, responsive rules and sanitized custom CSS.
/// The component .yo-* class layer stays versioned with the application
/// runtime and consumes these variables, so both layers remain compatible
/// with pre-studio themes.
/// </summary>
public static class YOThemeCompiler
{
    private static readonly Regex RefPattern = new(@"^\{(.+)\}$", RegexOptions.Compiled);
    private static readonly Regex TokenNamePattern = new(@"^[a-z][a-z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$", RegexOptions.Compiled);
    public static readonly Regex HexPattern = new(@"^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$", RegexOptions.Compiled);

    /* Required semantic tokens for a publishable theme (blueprint §84). */
    private static readonly string[] RequiredSemanticTokens =
    {
        "color.background.page",
        "color.background.surface",
        "color.text.primary",
        "color.action.primary",
        "color.border.default"
    };

    public static YOThemeCompileResult Compile(string configJson)
    {
        var result = new YOThemeCompileResult();
        var validation = result.Validation;

        JObject config;
        try
        {
            config = JObject.Parse(configJson ?? "{}");
        }
        catch (Exception ex)
        {
            validation.Add(Item("schema", "error", "config", null, $"Invalid JSON: {ex.Message}", "Fix the JSON syntax and try again."));
            result.Message = "Invalid configuration";
            return result;
        }

        var version = config["version"]?.Value<int?>() ?? 1;
        if (version < 2)
        {
            validation.Add(Item("schema", "error", "config", "version",
                "Legacy flat-token configuration must be migrated to the three-level token structure before compiling.",
                "Open the theme in Theme Studio to run the migration."));
            result.Message = "Legacy configuration";
            return result;
        }

        var tokens = config["tokens"] as JObject ?? new JObject();
        var primitive = tokens["primitive"] as JObject ?? new JObject();
        var semantic = tokens["semantic"] as JObject ?? new JObject();
        var component = tokens["component"] as JObject ?? new JObject();

        /* ── 1. Token naming lint (blueprint §37) ── */
        foreach (var (group, obj) in new[] { ("primitive", primitive), ("semantic", semantic), ("component", component) })
        {
            foreach (var prop in obj.Properties())
            {
                if (!TokenNamePattern.IsMatch(prop.Name))
                    validation.Add(Item("naming", "error", group, prop.Name,
                        $"Token \"{prop.Name}\" does not follow the {{category}}.{{property}}[.{{variant}}][.{{state}}] naming standard.",
                        "Rename using dotted segments, e.g. color.action.primary."));
            }
        }

        /* ── 2. Reference resolution with circular-reference detection ── */
        var all = new Dictionary<string, JToken>(StringComparer.OrdinalIgnoreCase);
        foreach (var obj in new[] { primitive, semantic, component })
            foreach (var prop in obj.Properties())
                all[prop.Name] = prop.Value;

        var resolved = new Dictionary<string, ResolvedToken>(StringComparer.OrdinalIgnoreCase);
        foreach (var prop in all.Keys)
            ResolveToken(prop, all, resolved, new List<string>(), validation);

        /* ── 3. Required semantic tokens ── */
        foreach (var req in RequiredSemanticTokens)
        {
            if (!all.ContainsKey(req))
                validation.Add(Item("schema", "error", "semantic", req,
                    $"Required semantic token \"{req}\" is missing.",
                    "Add the token so components receive safe fallback values."));
        }

        /* ── 4. Accessibility — contrast of core text/action pairs (§61) ── */
        CheckContrast(validation, resolved, "color.text.primary", "color.background.page", 4.5, "Body text");
        CheckContrast(validation, resolved, "color.text.inverse", "color.action.primary", 4.5, "Primary button text");
        CheckContrast(validation, resolved, "color.text.muted", "color.background.page", 3.0, "Muted text");

        /* ── 5. Dark-mode coverage ── */
        foreach (var prop in primitive.Properties())
        {
            var tok = prop.Value as JObject;
            if (tok == null) continue;
            var type = tok["type"]?.ToString();
            if (type == "color" && tok["dark"] == null)
                validation.Add(Item("accessibility", "warning", "appearance", prop.Name,
                    $"Color token \"{prop.Name}\" has no dark-mode value.",
                    "Add a dark value so dark mode stays complete."));
        }

        /* ── 8. Full token linter — all 17 rules (blueprint §38) ── */
        RunFullLinter(validation, config, primitive, semantic, component, resolved, all);

        /* ── 9. Custom CSS safety scan (§66) ── */
        var customCss = config["customCss"]?.ToString() ?? "";
        var sanitizedCss = SanitizeCustomCss(customCss, validation);

        /* ── 7. Emit CSS variables ── */
        var rootVars = new StringBuilder();
        var darkVars = new StringBuilder();
        var resolvedOut = new JObject();

        foreach (var prop in primitive.Properties())
        {
            if (!resolved.TryGetValue(prop.Name, out var tok) || tok.Value == null) continue;
            var varName = "--yo-" + VarName(prop.Name);
            rootVars.AppendLine($"  {varName}: {tok.Value};");

            var legacyKey = (prop.Value as JObject)?["legacyKey"]?.ToString();
            if (!string.IsNullOrEmpty(legacyKey))
            {
                rootVars.AppendLine($"  --yo-{legacyKey}: {tok.Value};");
                if (tok.IsColor)
                {
                    var channels = RgbChannels(tok.Value);
                    rootVars.AppendLine($"  --c-{legacyKey}: {channels};");
                    rootVars.AppendLine($"  --yo-{legacyKey}-rgb: {channels};");
                    rootVars.AppendLine($"  --yo-{legacyKey}-hsl: {HslChannels(tok.Value)};");
                }
            }
            else if (tok.IsColor)
            {
                rootVars.AppendLine($"  --yo-{VarName(prop.Name)}-rgb: {RgbChannels(tok.Value)};");
            }

            if (tok.DarkValue != null)
            {
                darkVars.AppendLine($"  {varName}: {tok.DarkValue};");
                if (!string.IsNullOrEmpty(legacyKey))
                {
                    darkVars.AppendLine($"  --yo-{legacyKey}: {tok.DarkValue};");
                    if (tok.IsColor)
                        darkVars.AppendLine($"  --c-{legacyKey}: {RgbChannels(tok.DarkValue)};");
                }
            }

            resolvedOut[prop.Name] = tok.Value;
        }

        /* Semantic + component tokens emit as var-chained references */
        foreach (var (group, obj) in new[] { ("semantic", semantic), ("component", component) })
        {
            foreach (var prop in obj.Properties())
            {
                if (!resolved.TryGetValue(prop.Name, out var tok) || tok.Value == null) continue;
                var varName = "--yo-" + VarName(prop.Name);
                var refMatch = RefPattern.Match((prop.Value as JObject)?["ref"]?.ToString() ?? "");
                if (refMatch.Success)
                    rootVars.AppendLine($"  {varName}: var(--yo-{VarName(refMatch.Groups[1].Value)}, {tok.Value});");
                else
                    rootVars.AppendLine($"  {varName}: {tok.Value};");
                resolvedOut[prop.Name] = tok.Value;
            }
        }

        /* ── 8. Typography / spacing / shape / elevation / motion groups ── */
        EmitGroupVars(config, rootVars, validation);

        var variablesCss = new StringBuilder();
        variablesCss.AppendLine(":root {");
        variablesCss.Append(rootVars);
        variablesCss.AppendLine("}");

        if (darkVars.Length > 0)
        {
            variablesCss.AppendLine();
            variablesCss.AppendLine("@media (prefers-color-scheme: dark) {");
            variablesCss.AppendLine(":root {");
            variablesCss.Append(darkVars);
            variablesCss.AppendLine("}");
            variablesCss.AppendLine("}");
            variablesCss.AppendLine();
            variablesCss.AppendLine("[data-yo-theme-mode='dark'] {");
            variablesCss.Append(darkVars);
            variablesCss.AppendLine("}");
        }

        /* ── 9. Scoped section themes (§56) ── */
        var scopesCss = new StringBuilder();
        var scopes = config["scopes"] as JObject;
        if (scopes != null)
        {
            foreach (var scope in scopes.Properties())
            {
                var s = scope.Value as JObject;
                var selector = s?["selector"]?.ToString();
                var overrides = s?["overrides"] as JObject;
                if (string.IsNullOrEmpty(selector) || overrides == null) continue;
                if (!IsSafeSelector(selector))
                {
                    validation.Add(Item("css", "error", "scopes", scope.Name,
                        $"Scope selector \"{selector}\" is not allowed.", "Use a [data-theme-scope='key'] attribute selector."));
                    continue;
                }
                scopesCss.AppendLine($"{selector} {{");
                foreach (var ov in overrides.Properties())
                {
                    if (!resolved.TryGetValue(ov.Name, out var tok) || tok.Value == null)
                    {
                        validation.Add(Item("reference", "warning", "scopes", ov.Name,
                            $"Scope override references unknown token \"{ov.Name}\".", null));
                        continue;
                    }
                    scopesCss.AppendLine($"  --yo-{VarName(ov.Name)}: {tok.Value};");
                    var legacyKey = (all.TryGetValue(ov.Name, out var raw) ? (raw as JObject)?["legacyKey"]?.ToString() : null);
                    if (!string.IsNullOrEmpty(legacyKey))
                    {
                        scopesCss.AppendLine($"  --yo-{legacyKey}: {tok.Value};");
                        if (tok.IsColor) scopesCss.AppendLine($"  --c-{legacyKey}: {RgbChannels(tok.Value)};");
                    }
                }
                scopesCss.AppendLine("}");
            }
        }

        /* ── 10. Responsive token rules (§57) ── */
        var responsiveCss = new StringBuilder();
        var responsive = config["responsive"] as JObject;
        if (responsive != null)
        {
            foreach (var bp in responsive.Properties())
            {
                var minWidth = (bp.Value as JObject)?["minWidth"]?.ToString();
                var overrides = (bp.Value as JObject)?["tokens"] as JObject;
                if (string.IsNullOrEmpty(minWidth) || overrides == null) continue;
                responsiveCss.AppendLine($"@media (min-width: {minWidth}) {{");
                responsiveCss.AppendLine(":root {");
                foreach (var ov in overrides.Properties())
                {
                    if (ov.Name.StartsWith("spacing."))
                    {
                        var sv = ov.Value["value"]?.ToString();
                        if (!string.IsNullOrEmpty(sv))
                            responsiveCss.AppendLine($"  --spacing-{ov.Name.Substring("spacing.".Length)}: {sv};");
                    }
                    else if (resolved.TryGetValue(ov.Name, out var tok) && tok.Value != null)
                        responsiveCss.AppendLine($"  --yo-{VarName(ov.Name)}: {tok.Value};");
                }
                responsiveCss.AppendLine("}");
                responsiveCss.AppendLine("}");
            }
        }

        /* ── 11. Compose outputs ── */
        var fullCss = new StringBuilder();
        fullCss.Append(variablesCss);
        if (scopesCss.Length > 0) { fullCss.AppendLine(); fullCss.Append(scopesCss); }
        if (responsiveCss.Length > 0) { fullCss.AppendLine(); fullCss.Append(responsiveCss); }
        if (!string.IsNullOrWhiteSpace(sanitizedCss)) { fullCss.AppendLine(); fullCss.AppendLine(sanitizedCss); }

        result.VariablesCss = variablesCss.ToString();
        result.Css = fullCss.ToString();
        result.CriticalCss = BuildCriticalCss(resolved);
        result.ResolvedTokensJson = resolvedOut.ToString(Newtonsoft.Json.Formatting.None);
        result.SizeBytes = Encoding.UTF8.GetByteCount(result.Css);
        result.Success = !validation.Any(v => v.Severity == "error");
        result.Message = result.Success ? "Compiled" : "Compilation finished with errors";

        if (result.SizeBytes > 30 * 1024)
            validation.Add(Item("performance", "warning", "css", null,
                $"Compiled token CSS is {result.SizeBytes / 1024} KB (budget target: under 15 KB gzip).",
                "Remove unused tokens and duplicate declarations."));

        return result;
    }

    /* ── Reference resolution ── */

    private class ResolvedToken
    {
        public string Value;
        public string DarkValue;
        public bool IsColor;
    }

    private static void ResolveToken(
        string path,
        Dictionary<string, JToken> all,
        Dictionary<string, ResolvedToken> resolved,
        List<string> stack,
        List<YOThemeValidationItem> validation)
    {
        if (resolved.ContainsKey(path)) return;

        if (stack.Contains(path, StringComparer.OrdinalIgnoreCase))
        {
            validation.Add(Item("reference", "error", "tokens", path,
                $"Circular token reference detected: {string.Join(" → ", stack)} → {path}.",
                "Break the reference cycle."));
            resolved[path] = new ResolvedToken { Value = null };
            return;
        }

        if (!all.TryGetValue(path, out var raw))
        {
            validation.Add(Item("reference", "error", "tokens", path,
                $"Token reference \"{path}\" could not be resolved.", "Create the missing token or fix the reference."));
            resolved[path] = new ResolvedToken { Value = null };
            return;
        }

        var obj = raw as JObject;
        if (obj == null)
        {
            var v = raw.ToString();
            resolved[path] = new ResolvedToken { Value = v, IsColor = HexPattern.IsMatch(v) };
            return;
        }

        stack.Add(path);
        var value = obj["value"]?.ToString();
        var dark = obj["dark"]?.ToString();
        var refPath = obj["ref"]?.ToString();

        if (!string.IsNullOrEmpty(refPath))
        {
            var m = RefPattern.Match(refPath);
            var target = m.Success ? m.Groups[1].Value : refPath;
            ResolveToken(target, all, resolved, stack, validation);
            var rt = resolved.TryGetValue(target, out var t) ? t : null;
            resolved[path] = new ResolvedToken
            {
                Value = value ?? rt?.Value,
                DarkValue = dark ?? rt?.DarkValue,
                IsColor = (obj["type"]?.ToString() == "color") || (rt?.IsColor ?? false)
            };
        }
        else
        {
            resolved[path] = new ResolvedToken
            {
                Value = value,
                DarkValue = dark,
                IsColor = (obj["type"]?.ToString() == "color") || (value != null && HexPattern.IsMatch(value))
            };
        }
        stack.Remove(path);
    }

    /* ── Group variables (typography/spacing/shape/elevation/motion) ── */

    private static void EmitGroupVars(JObject config, StringBuilder rootVars, List<YOThemeValidationItem> validation)
    {
        var fonts = config["typography"]?["fonts"] as JObject;
        if (fonts != null)
            foreach (var f in fonts.Properties())
            {
                var family = (f.Value as JObject)?["family"]?.ToString();
                if (!string.IsNullOrEmpty(family))
                    rootVars.AppendLine($"  --font-{f.Name}: '{family}', system-ui, sans-serif;");
            }

        var fluid = config["typography"]?["fluid"] as JObject;
        if (fluid != null)
        {
            var baseSize = fluid["base"]?.ToString();
            if (!string.IsNullOrEmpty(baseSize))
                rootVars.AppendLine($"  --yo-fluid-base: {baseSize};");
            var ratio = fluid["ratio"]?.Value<double?>() ?? 1.25;
            var steps = new[] { 0.75, 0.875, 1.0, 1.125, 1.333, 1.618, 2.0, 2.5 };
            var basePx = ParsePx(baseSize) ?? 16;
            for (var i = 0; i < steps.Length; i++)
                rootVars.AppendLine($"  --yo-fs-{i}: {Math.Round(basePx * Math.Pow(ratio, i - 2) / 16.0, 3)}rem;");
        }

        var spacing = config["spacing"]?["scale"] as JObject;
        if (spacing != null)
            foreach (var s in spacing.Properties())
                rootVars.AppendLine($"  --spacing-{s.Name}: {s.Value};");

        var radius = config["shape"]?["radius"] as JObject;
        if (radius != null)
            foreach (var r in radius.Properties())
                rootVars.AppendLine($"  --radius-{r.Name}: {r.Value};");

        var focus = config["shape"]?["focus"] as JObject;
        rootVars.AppendLine($"  --yo-focus-ring-width: {focus?["width"]?.ToString() ?? "2px"};");
        rootVars.AppendLine($"  --yo-focus-ring-color: {focus?["color"]?.ToString() ?? "rgb(var(--c-primary))"};");
        rootVars.AppendLine($"  --yo-focus-ring-offset: {focus?["offset"]?.ToString() ?? "2px"};");

        var shadows = config["elevation"]?["shadows"] as JObject;
        if (shadows != null)
            foreach (var s in shadows.Properties())
                rootVars.AppendLine($"  --shadow-{s.Name}: {s.Value};");

        var motion = config["motion"] as JObject;
        rootVars.AppendLine($"  --yo-transition-duration: {motion?["duration"]?.ToString() ?? "0.2s"};");
        rootVars.AppendLine($"  --yo-transition-easing: {motion?["easing"]?.ToString() ?? "cubic-bezier(0.4, 0, 0.2, 1)"};");
    }

    /* ── Critical CSS (blueprint §22) ── */

    private static string BuildCriticalCss(Dictionary<string, ResolvedToken> resolved)
    {
        string Get(string path, string fallback) =>
            resolved.TryGetValue(path, out var t) && t.Value != null ? t.Value : fallback;

        var sb = new StringBuilder();
        sb.AppendLine(":root {");
        sb.AppendLine($"  --yo-background-page: {Get("color.background.page", "#ffffff")};");
        sb.AppendLine($"  --yo-text-primary: {Get("color.text.primary", "#1e293b")};");
        sb.AppendLine($"  --yo-action-primary: {Get("color.action.primary", "#2563eb")};");
        sb.AppendLine($"  --yo-border-default: {Get("color.border.default", "#e2e8f0")};");
        sb.AppendLine("}");
        sb.AppendLine("html, body { background: var(--yo-background-page); color: var(--yo-text-primary); margin: 0; }");
        return sb.ToString();
    }

    /* ── Custom CSS sanitization (§66) ── */

    private static string SanitizeCustomCss(string css, List<YOThemeValidationItem> validation)
    {
        if (string.IsNullOrWhiteSpace(css)) return "";
        var unsafePatterns = new (string pattern, string label)[]
        {
            (@"@import", "External imports are blocked"),
            (@"url\s*\(\s*['""]?https?://", "External url() references are blocked"),
            (@"expression\s*\(", "CSS expressions are not allowed"),
            (@"javascript\s*:", "javascript: URLs are not allowed"),
            (@"behavior\s*:", "IE behavior property is not allowed")
        };
        var lines = css.Split('\n');
        var kept = new List<string>();
        foreach (var line in lines)
        {
            var blocked = unsafePatterns.FirstOrDefault(p => Regex.IsMatch(line, p.pattern, RegexOptions.IgnoreCase));
            if (blocked.pattern != null)
            {
                validation.Add(Item("css", "error", "customCss", null,
                    $"{blocked.label}: \"{line.Trim()}\"", "Replace with token-based values or theme assets."));
                continue;
            }
            kept.Add(line);
        }
        return string.Join("\n", kept).Trim();
    }

    /* ── Contrast helpers (§61) ── */

    private static void CheckContrast(
        List<YOThemeValidationItem> validation,
        Dictionary<string, ResolvedToken> resolved,
        string fgPath, string bgPath, double minRatio, string label)
    {
        if (!resolved.TryGetValue(fgPath, out var fg) || fg?.Value == null) return;
        if (!resolved.TryGetValue(bgPath, out var bg) || bg?.Value == null) return;
        if (!HexPattern.IsMatch(fg.Value) || !HexPattern.IsMatch(bg.Value)) return;

        var ratio = ContrastRatio(fg.Value, bg.Value);
        if (ratio < minRatio)
            validation.Add(Item("accessibility", "error", "colors", fgPath,
                $"{label} contrast is {ratio:0.##}:1 (minimum {minRatio:0.#}:1) — this text may be difficult to read.",
                "Use a darker text color or a lighter background."));
    }

    public static double ContrastRatio(string hexA, string hexB)
    {
        var la = Luminance(hexA);
        var lb = Luminance(hexB);
        var light = Math.Max(la, lb);
        var dark = Math.Min(la, lb);
        return (light + 0.05) / (dark + 0.05);
    }

    public static double Luminance(string hex)
    {
        var h = hex.TrimStart('#');
        if (h.Length == 3) h = string.Concat(h.Select(c => $"{c}{c}"));
        if (h.Length != 6) return 0;
        double Channel(int i)
        {
            var v = Convert.ToInt32(h.Substring(i, 2), 16) / 255.0;
            return v <= 0.03928 ? v / 12.92 : Math.Pow((v + 0.055) / 1.055, 2.4);
        }
        return 0.2126 * Channel(0) + 0.7152 * Channel(2) + 0.0722 * Channel(4);
    }

    /* ── Misc helpers ── */

    private static string VarName(string tokenPath) =>
        tokenPath.Replace(".", "-").ToLowerInvariant();

    private static string RgbChannels(string hex)
    {
        var h = hex.TrimStart('#');
        if (h.Length == 3) h = string.Concat(h.Select(c => $"{c}{c}"));
        if (h.Length != 6) return "0 0 0";
        return $"{Convert.ToInt32(h.Substring(0, 2), 16)} {Convert.ToInt32(h.Substring(2, 2), 16)} {Convert.ToInt32(h.Substring(4, 2), 16)}";
    }

    public static string HslChannels(string hex)
    {
        var h = hex.TrimStart('#');
        if (h.Length == 3) h = string.Concat(h.Select(c => $"{c}{c}"));
        if (h.Length != 6) return "0 0% 0%";
        var r = Convert.ToInt32(h.Substring(0, 2), 16) / 255.0;
        var g = Convert.ToInt32(h.Substring(2, 2), 16) / 255.0;
        var b = Convert.ToInt32(h.Substring(4, 2), 16) / 255.0;
        var max = Math.Max(r, Math.Max(g, b));
        var min = Math.Min(r, Math.Min(g, b));
        var l = (max + min) / 2;
        double hue = 0, sat = 0;
        var d = max - min;
        if (d != 0)
        {
            sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max == r) hue = (g - b) / d + (g < b ? 6 : 0);
            else if (max == g) hue = (b - r) / d + 2;
            else hue = (r - g) / d + 4;
            hue /= 6;
        }
        return $"{Math.Round(hue * 360)} {Math.Round(sat * 100)}% {Math.Round(l * 100)}%";
    }

    private static double? ParsePx(string value)
    {
        if (string.IsNullOrEmpty(value)) return null;
        var m = Regex.Match(value, @"^([\d.]+)px$");
        return m.Success && double.TryParse(m.Groups[1].Value, out var v) ? v : (double?)null;
    }

    private static bool IsSafeSelector(string selector) =>
        !string.IsNullOrEmpty(selector)
        && selector.StartsWith("[data-theme-scope=", StringComparison.OrdinalIgnoreCase)
        && !selector.Contains('{') && !selector.Contains('}') && !selector.Contains(';');

    private static YOThemeValidationItem Item(string type, string severity, string section, string path, string message, string fix) =>
        new()
        {
            Type = type,
            Severity = severity,
            Section = section,
            PropertyPath = path,
            Message = message,
            SuggestedFix = fix
        };

    /* ── Full token linter — all 17 rules (blueprint §38) ── */

    private static void RunFullLinter(
        List<YOThemeValidationItem> validation,
        JObject config,
        JObject primitive,
        JObject semantic,
        JObject component,
        Dictionary<string, ResolvedToken> resolved,
        Dictionary<string, JToken> all)
    {
        /* Collect all token paths by group */
        var allTokens = new Dictionary<string, (string group, JObject obj)>();
        foreach (var (group, obj) in new[] { ("primitive", primitive), ("semantic", semantic), ("component", component) })
            foreach (var prop in obj.Properties())
                allTokens[prop.Name] = (group, prop.Value as JObject ?? new JObject());

        /* Rule 1: invalid naming (already done in step 1 above) — skip here */

        /* Rule 2: duplicate token path */
        var seenPaths = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var path in allTokens.Keys)
        {
            var lower = path.ToLowerInvariant();
            if (!seenPaths.Add(lower))
                validation.Add(Item("naming", "error", "tokens", path,
                    $"Duplicate token path \"{path}\".", "Remove or rename the duplicate token."));
        }

        /* Rule 3: missing description */
        foreach (var (path, (group, obj)) in allTokens)
        {
            if (string.IsNullOrWhiteSpace(obj["description"]?.ToString()))
                validation.Add(Item("naming", "warning", group, path,
                    $"Token \"{path}\" is missing a description.", "Add a description so users understand the token's purpose."));
        }

        /* Rule 4: wrong token type */
        foreach (var (path, (group, obj)) in allTokens)
        {
            var type = obj["type"]?.ToString();
            if (!string.IsNullOrEmpty(type) && type is not ("color" or "number" or "length" or "fontFamily" or "fontWeight" or "fontSize" or "lineHeight" or "letterSpacing" or "radius" or "shadow" or "duration" or "cubicBezier" or "boolean" or "string" or "assetReference" or "gradient"))
                validation.Add(Item("naming", "warning", group, path,
                    $"Token type \"{type}\" is not a recognized type.", "Use one of: color, number, length, fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, radius, shadow, duration, cubicBezier, boolean, string, assetReference, gradient."));
        }

        /* Rule 5: invalid reference direction */
        var refPattern = new Regex(@"^\{(.+)\}$", RegexOptions.Compiled);
        foreach (var (path, (group, obj)) in allTokens)
        {
            var refStr = obj["ref"]?.ToString();
            if (!string.IsNullOrEmpty(refStr) && refPattern.IsMatch(refStr))
            {
                var target = refPattern.Match(refStr).Groups[1].Value;
                if (!allTokens.ContainsKey(target))
                    validation.Add(Item("reference", "error", group, path,
                        $"Token \"{path}\" references unknown token \"{target}\".", "Check the target token path and fix the reference."));
            }
        }

        /* Rule 6: primitive used directly where semantic token is required */
        var semanticPaths = semantic?.Properties()?.Select(p => p.Name).ToHashSet(StringComparer.OrdinalIgnoreCase) ?? new HashSet<string>();
        var componentPaths = component?.Properties()?.Select(p => p.Name).ToHashSet(StringComparer.OrdinalIgnoreCase) ?? new HashSet<string>();

        /* Rule 7: semantic token referencing a component token */
        foreach (var (path, (group, obj)) in allTokens)
        {
            if (group != "semantic") continue;
            var refStr = obj["ref"]?.ToString();
            if (!string.IsNullOrEmpty(refStr) && refPattern.IsMatch(refStr))
            {
                var target = refPattern.Match(refStr).Groups[1].Value;
                if (componentPaths.Contains(target))
                    validation.Add(Item("reference", "error", "semantic", path,
                        $"Semantic token \"{path}\" references a component token \"{target}\".", "Reference a primitive or another semantic token instead."));
            }
        }

        /* Rule 8: circular reference (already handled in ResolveToken) — skip here */

        /* Rule 9: unused token */
        var referencedTokens = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var (path, (group, obj)) in allTokens)
        {
            var refStr = obj["ref"]?.ToString();
            if (!string.IsNullOrEmpty(refStr) && refPattern.IsMatch(refStr))
            {
                var target = refPattern.Match(refStr).Groups[1].Value;
                referencedTokens.Add(target);
            }
            /* Also check if this token's value references another token */
            var value = obj["value"]?.ToString();
            if (!string.IsNullOrEmpty(value) && refPattern.IsMatch(value))
            {
                var target = refPattern.Match(value).Groups[1].Value;
                referencedTokens.Add(target);
            }
            var dark = obj["dark"]?.ToString();
            if (!string.IsNullOrEmpty(dark) && refPattern.IsMatch(dark))
            {
                var target = refPattern.Match(dark).Groups[1].Value;
                referencedTokens.Add(target);
            }
        }
        foreach (var (path, _) in allTokens)
        {
            if (!referencedTokens.Contains(path) && !path.StartsWith("color.") && !path.StartsWith("spacing.") && !path.StartsWith("radius."))
                validation.Add(Item("usage", "warning", "tokens", path,
                    $"Token \"{path}\" appears unused.", "Consider removing it or confirming it is intentionally unused."));
        }

        /* Rule 10: missing appearance value */
        foreach (var (path, (group, obj)) in allTokens)
        {
            if (group != "primitive") continue;
            var type = obj["type"]?.ToString();
            if (type == "color" && obj["dark"] == null && obj["value"] != null)
                validation.Add(Item("appearance", "warning", "appearance", path,
                    $"Color token \"{path}\" has no dark-mode value.", "Add a dark value so dark mode stays complete."));
        }

        /* Rule 11: hardcoded CSS value */
        foreach (var (path, (group, obj)) in allTokens)
        {
            if (group != "primitive") continue;
            var value = obj["value"]?.ToString();
            if (!string.IsNullOrEmpty(value) && !value.StartsWith("{") && !HexPattern.IsMatch(value) && !value.StartsWith("var(") && !value.EndsWith("px") && !value.EndsWith("rem") && !value.EndsWith("em") && !value.EndsWith("%") && !value.EndsWith("s") && !value.EndsWith("ms") && !value.Equals("true", StringComparison.OrdinalIgnoreCase) && !value.Equals("false", StringComparison.OrdinalIgnoreCase) && !decimal.TryParse(value, out _))
                validation.Add(Item("css", "warning", "tokens", path,
                    $"Token \"{path}\" has a value \"{value}\" that may be a hardcoded CSS value.", "Use a token reference or a design-token value instead."));
        }

        /* Rule 12: unknown component token */
        var knownComponentKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var registryData = config["componentRegistry"] as JArray;
        if (registryData != null)
            foreach (var entry in registryData)
                knownComponentKeys.Add(entry["componentKey"]?.ToString() ?? "");

        foreach (var path in componentPaths)
        {
            var parts = path.Split('.');
            if (parts.Length > 0 && !knownComponentKeys.Contains(parts[0]))
                validation.Add(Item("reference", "warning", "component", path,
                    $"Component token \"{path}\" uses an unknown component key \"{parts[0]}\".", "Register the component in the component registry first."));
        }

        /* Rule 13: inaccessible semantic mapping */
        /* (Checked via contrast checks in step 4 — not duplicable here) */

        /* Rule 14: inconsistent state naming */
        var validStates = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "default", "hover", "focus", "active", "disabled", "loading", "selected", "error", "success" };
        foreach (var (path, _) in allTokens)
        {
            var parts = path.Split('.');
            var lastPart = parts[^1];
            /* If the last segment looks like a state but isn't recognized */
            if (lastPart.Contains("-") || lastPart.Length > 10)
            {
                var candidates = validStates.Where(s => lastPart.StartsWith(s, StringComparison.OrdinalIgnoreCase)).ToList();
                if (candidates.Count > 0)
                    validation.Add(Item("naming", "warning", "tokens", path,
                        $"Token \"{path}\" uses an inconsistent state naming convention. Expected: {string.Join(", ", candidates)}.", "Use a consistent state name like error, success, or loading."));
            }
        }

        /* Rule 15: invalid responsive value */
        var responsive = config["responsive"] as JObject;
        if (responsive != null)
        {
            foreach (var bp in responsive.Properties())
            {
                var minWidth = (bp.Value as JObject)?["minWidth"]?.ToString();
                if (!string.IsNullOrEmpty(minWidth) && !Regex.IsMatch(minWidth, @"^\d+(px|em|rem|vh|vw|%)?$"))
                    validation.Add(Item("responsive", "error", "responsive", bp.Name,
                        $"Responsive breakpoint \"{bp.Name}\" has an invalid minWidth value \"{minWidth}\".", "Use a valid CSS length value, e.g. 768px or 48rem."));
            }
        }
    }
}
