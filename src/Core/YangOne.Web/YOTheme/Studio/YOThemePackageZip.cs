// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;

namespace YangOne.Web;

/// <summary>
/// Portable theme package as a ZIP archive (blueprint §73):
///
///   theme.json          — YOThemePackage JSON (meta, config, assets manifest, SHA-256 signature)
///   assets/&lt;key&gt;        — binary files preserving folder structure (logos, fonts, images)
///
/// Inside theme.json every packaged file is referenced by its relative
/// "assets/{key}" path, so the archive is portable between installations.
/// Import installs files under the physical Themes/{slug}/ folder where the
/// standard static-file middleware serves them at /themes/{slug}/... — the
/// same load path dynamic pages use at runtime.
/// The signature matches `yo-theme verify`: SHA-256 over the compact JSON of
/// the package with the signature node removed.
/// </summary>
public static class YOThemePackageZip
{
    public sealed class ExportResult
    {
        public byte[] Zip { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = "theme.yo-theme.zip";
        public List<string> MissingFiles { get; } = new();
    }

    public sealed class ImportResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";
        public string? YOThemeUniqueId { get; set; }
        public int InstalledFiles { get; set; }
        public List<string> Warnings { get; } = new();
    }

    private static readonly HashSet<string> AllowedAssetExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".bmp",
        ".woff", ".woff2", ".ttf", ".otf", ".eot",
        ".css", ".json", ".txt", ".map"
    };
    private const int MaxZipEntries = 2000;
    private const long MaxFileBytes = 50L * 1024 * 1024;
    private const long MaxTotalBytes = 300L * 1024 * 1024;

    /* ── Export ─────────────────────────────────────────────────────────── */

    public static ExportResult Export(
        YOTheme? theme,
        IEnumerable<YOThemeAsset> assets,
        string themesRoot,
        string webRoot)
    {
        var result = new ExportResult();
        if (theme == null) throw new InvalidOperationException("Theme not found");

        var slug = Slugify(theme.Slug ?? theme.Name ?? "theme");
        var configJson = theme.PublishedConfig ?? theme.Config ?? "{}";

        /* Map each asset row to a stable key inside the archive. Paths that
           already live under a themes folder keep their sub-structure; others
           are flattened with an index guard against collisions. */
        var usedKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var rewriteMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var entries = new List<(string Key, string SourcePath, string Mime)>();

        foreach (var asset in assets.Where(a => !a.IsDeleted && !string.IsNullOrEmpty(a.AssetPath)))
        {
            var key = DeriveKey(asset.AssetPath!, usedKeys);
            rewriteMap[asset.AssetPath!] = $"assets/{key}";
            entries.Add((key, asset.AssetPath!, asset.MimeType ?? GuessMime(key)));
        }

        /* Rewrite absolute asset URLs inside the config so references become
           portable relative keys (covers customCss and component configs). */
        foreach (var pair in rewriteMap.OrderByDescending(p => p.Key.Length))
            configJson = configJson.Replace(pair.Key, pair.Value);

        var manifest = new JArray();
        foreach (var (key, _, mime) in entries)
            manifest.Add(new JObject { ["path"] = $"assets/{key}", ["mime"] = mime, ["filename"] = Path.GetFileName(key) });

        var packageJson = BuildPackageJson(theme, slug, configJson, manifest);

        using var ms = new MemoryStream();
        using (var zip = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
        {
            var entry = zip.CreateEntry("theme.json", CompressionLevel.Optimal);
            using (var w = new StreamWriter(entry.Open()))
                w.Write(packageJson.ToString(Newtonsoft.Json.Formatting.Indented));

            foreach (var (key, sourcePath, _) in entries)
            {
                var bytes = TryReadAssetBytes(sourcePath, themesRoot, webRoot);
                if (bytes == null) { result.MissingFiles.Add(sourcePath); continue; }
                var fileEntry = zip.CreateEntry($"assets/{key}", CompressionLevel.Optimal);
                using var fs = fileEntry.Open();
                fs.Write(bytes, 0, bytes.Length);
            }
        }

        result.Zip = ms.ToArray();
        result.FileName = $"{slug}.yo-theme.zip";
        return result;
    }

    /* ── Import ─────────────────────────────────────────────────────────── */

    public static async Task<ImportResult> ImportAsync(
        Stream zipStream,
        string themesRoot,
        Func<YOThemeSaveRequest, Task<(bool Ok, string? Guid, string Error)>> createTheme,
        Func<YOThemeAssetSaveRequest, Task<bool>> saveAsset,
        bool allowUnsigned = false)
    {
        var result = new ImportResult();
        string? installDir = null;
        var createdInstallDir = false;
        try
        {
            using var archive = new ZipArchive(zipStream, ZipArchiveMode.Read, leaveOpen: false);
            var themeEntry = archive.GetEntry("theme.json")
                ?? archive.Entries.FirstOrDefault(e => e.FullName.Equals("theme.json", StringComparison.OrdinalIgnoreCase));
            if (themeEntry == null)
            {
                throw new InvalidOperationException("theme.json not found in archive root");
            }

            string packageText;
            using (var r = new StreamReader(themeEntry.Open()))
                packageText = await r.ReadToEndAsync();

            JObject package;
            try { package = JObject.Parse(packageText); }
            catch (Exception ex) { throw new InvalidOperationException($"Invalid theme.json: {ex.Message}"); }

            /* Integrity gate — identical to `yo-theme verify`. */
            var expected = package["signature"]?["hash"]?.ToString();
            if (!string.IsNullOrEmpty(expected))
            {
                var actual = ComputeSignature(package);
                if (!string.Equals(expected, actual, StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException("Package signature mismatch — the archive may be corrupted or tampered with");
                }
            }
            else if (!allowUnsigned)
            {
                result.Message = "Package has no signature — refusing unverified import (pass allowUnsigned=true to override)";
                return result;
            }
            else
            {
                result.Warnings.Add("Package has no signature — integrity was not verified");
            }

            var meta = package["meta"] as JObject ?? new JObject();
            var name = meta["name"]?.ToString();
            if (string.IsNullOrWhiteSpace(name)) throw new InvalidOperationException("meta.name is required");

            var configToken = package["config"];
            var configRaw = configToken?.Type == JTokenType.String
                ? configToken.Value<string>()!
                : (configToken ?? new JObject()).ToString(Newtonsoft.Json.Formatting.None);

            var slugBase = Slugify(meta["slug"]?.ToString() ?? name);
            var slug = $"{slugBase}-{DateTime.UtcNow.Ticks.ToString("x").Substring(0, 6)}";
            installDir = Path.Combine(themesRoot, slug);
            Directory.CreateDirectory(installDir);
            createdInstallDir = true;

            /* Extract assets/** and build old→new reference rewrites.
               Hardened: entry-count cap, per-file + total decompression caps,
               and a disallowed-extension deny-list to avoid publishing
               arbitrary executables under the public /themes path. */
            var installed = 0;
            var rewrites = new List<(string From, string To)>();
            string? faviconKey = null;
            var entryCount = 0;
            long totalBytes = 0;
            foreach (var e in archive.Entries.Where(e => e.FullName.StartsWith("assets/", StringComparison.OrdinalIgnoreCase) && e.Name.Length > 0))
            {
                if (++entryCount > MaxZipEntries)
                    throw new InvalidOperationException($"Refusing import: too many entries (limit {MaxZipEntries})");

                var key = SafeKey(e.FullName.Substring("assets/".Length));
                if (key.Length == 0) continue;

                var ext = Path.GetExtension(key);
                if (!AllowedAssetExtensions.Contains(ext))
                    throw new InvalidOperationException($"Refusing import: disallowed file type '{ext}' in archive ({key})");

                var target = Path.Combine(installDir, key.Replace('/', Path.DirectorySeparatorChar));
                Directory.CreateDirectory(Path.GetDirectoryName(target)!);

                long written = 0;
                using (var es = e.Open())
                using (var fs = File.Create(target))
                {
                    var buf = new byte[81920];
                    int n;
                    while ((n = es.Read(buf, 0, buf.Length)) > 0)
                    {
                        written += n;
                        totalBytes += n;
                        if (written > MaxFileBytes)
                            throw new InvalidOperationException($"Refusing import: file '{key}' exceeds {MaxFileBytes / (1024 * 1024)} MB");
                        if (totalBytes > MaxTotalBytes)
                            throw new InvalidOperationException($"Refusing import: total payload exceeds {MaxTotalBytes / (1024 * 1024)} MB");
                        fs.Write(buf, 0, n);
                    }
                }

                installed++;
                var publicPath = $"/themes/{slug}/{key}";
                rewrites.Add(($"assets/{key}", publicPath));
                if (key.StartsWith("favicon", StringComparison.OrdinalIgnoreCase)) faviconKey = publicPath;
            }

            /* Point the config at this installation's paths. Boundary-safe so a
               path is never replaced as a substring of a longer, different path. */
            foreach (var (from, to) in rewrites.OrderByDescending(r => r.From.Length))
            {
                var escaped = Regex.Escape(from);
                configRaw = Regex.Replace(
                    configRaw,
                    $"(?<![:/A-Za-z0-9_.-]){escaped}(?![:/A-Za-z0-9_.-])",
                    to);
            }

            JObject config;
            try { config = JObject.Parse(configRaw); }
            catch (Exception ex) { throw new InvalidOperationException($"Invalid theme config inside package: {ex.Message}"); }
            config["version"] = Math.Max(config["version"]?.Value<int?>() ?? 2, 2); // compiler auto-upgrades legacy shapes

            /* Convenience: a favicon-named asset becomes the active favicon. */
            if (faviconKey != null)
            {
                var appearance = config["appearance"] as JObject ?? new JObject();
                appearance["faviconUrl"] = faviconKey;
                config["appearance"] = appearance;
            }

            var create = await createTheme(new YOThemeSaveRequest
            {
                Name = $"{name}",
                Slug = slug,
                Version = meta["version"]?.ToString() ?? "1.0.0",
                Author = meta["author"]?.ToString(),
                Description = meta["description"]?.ToString(),
                Tags = meta["tags"]?.ToString(),
                Config = config.ToString(Newtonsoft.Json.Formatting.None),
                SchemaVersion = 2,
            });
            if (!create.Ok || create.Guid == null)
            {
                result.Message = create.Error;
                return result;
            }

            /* Re-create asset rows against this installation's paths. */
            if (package["assets"] is JArray list)
            {
                foreach (var item in list.OfType<JObject>())
                {
                    var rel = item["path"]?.ToString() ?? "";
                    var key = rel.StartsWith("assets/") ? rel.Substring("assets/".Length) : rel;
                    var mime = item["mime"]?.ToString() ?? "";
                    await saveAsset(new YOThemeAssetSaveRequest
                    {
                        YOThemeUniqueId = create.Guid,
                        AssetType = GuessAssetType(mime, key),
                        AssetPath = $"/themes/{slug}/{key}",
                        AssetName = Path.GetFileName(key),
                        MimeType = mime,
                        AltText = "",
                    });
                }
            }

            result.Success = true;
            result.Message = "Theme package imported";
            result.YOThemeUniqueId = create.Guid;
            result.InstalledFiles = installed;
            if (result.Warnings.Count > 0 && installed == 0)
                result.Warnings.Add("No asset files were found in the archive");
            return result;
        }
        catch (Exception ex)
        {
            /* Best-effort rollback: if we extracted anything before failing,
               remove the install folder so we don't leave orphan files. The
               theme row (if already created) is rolled back by the caller's
               transaction; files here are outside that transaction. */
            if (createdInstallDir && installDir != null && Directory.Exists(installDir))
            {
                try { Directory.Delete(installDir, true); }
                catch { /* nothing more we can do */ }
            }
            result.Message = ex.Message;
            return result;
        }
    }

    /* ── Helpers ────────────────────────────────────────────────────────── */

    private static JObject BuildPackageJson(YOTheme theme, string slug, string configJson, JArray manifest)
    {
        var package = new JObject
        {
            ["manifestVersion"] = "1.0",
            ["exportedAt"] = DateTime.UtcNow.ToString("o"),
            ["meta"] = new JObject
            {
                ["name"] = theme.Name ?? slug,
                ["slug"] = slug,
                ["version"] = theme.Version ?? "1.0.0",
                ["author"] = theme.Author ?? "",
                ["description"] = theme.Description ?? "",
                ["tags"] = theme.Tags ?? ""
            },
            ["config"] = JToken.Parse(configJson),
            ["assets"] = manifest
        };
        var hash = ComputeSignature(package);
        package["signature"] = new JObject { ["hash"] = hash, ["hashAlgorithm"] = "sha256" };
        return package;
    }

    /// <summary>SHA-256 hex over the compact JSON of the package minus the
    /// signature node — byte-compatible with yo-theme CLI verify.</summary>
    public static string ComputeSignature(JObject package)
    {
        var clone = (JObject)package.DeepClone();
        clone.Remove("signature");
        var canonical = clone.ToString(Newtonsoft.Json.Formatting.None);
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(canonical));
        var sb = new StringBuilder(bytes.Length * 2);
        foreach (var b in bytes) sb.Append(b.ToString("x2"));
        return sb.ToString();
    }

    private static byte[]? TryReadAssetBytes(string assetPath, string themesRoot, string webRoot)
    {
        var clean = Uri.UnescapeDataString(assetPath.Split('?')[0].Split('#')[0]);
        string? candidate = null;
        if (clean.StartsWith("/themes/", StringComparison.OrdinalIgnoreCase))
            candidate = Path.Combine(themesRoot, SafeKey(clean.Substring("/themes/".Length)).Replace('/', Path.DirectorySeparatorChar));
        else if (clean.StartsWith("/uploads/media/", StringComparison.OrdinalIgnoreCase))
            candidate = Path.Combine(webRoot ?? "", "media", SafeKey(clean.Substring("/uploads/media/".Length)).Replace('/', Path.DirectorySeparatorChar));
        else if (Uri.TryCreate(clean, UriKind.Absolute, out var uri) &&
                 (uri.PathAndQuery.StartsWith("/themes/") || uri.PathAndQuery.StartsWith("/uploads/media/")))
            return TryReadAssetBytes(uri.PathAndQuery, themesRoot, webRoot);

        if (candidate != null && File.Exists(candidate))
            return File.ReadAllBytes(candidate);
        return null;
    }

    private static string DeriveKey(string assetPath, ISet<string> used)
    {
        var clean = Uri.UnescapeDataString(assetPath.Split('?')[0]);
        var marker = "/themes/";
        var idx = clean.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        string baseKey;
        if (idx >= 0)
        {
            var rest = clean[(idx + marker.Length)..];
            var slash = rest.IndexOf('/');
            baseKey = slash >= 0 ? rest[(slash + 1)..] : rest; // drop the original slug segment
        }
        else
        {
            baseKey = Path.GetFileName(clean);
        }
        baseKey = SafeKey(baseKey);
        if (string.IsNullOrWhiteSpace(baseKey)) baseKey = "file.bin";
        var key = baseKey;
        var i = 1;
        while (!used.Add(key))
        {
            var dir = Path.GetDirectoryName(baseKey)?.Replace('\\', '/');
            var name = Path.GetFileNameWithoutExtension(baseKey);
            var ext = Path.GetExtension(baseKey);
            key = $"{dir}{(dir.Length > 0 ? "/" : "")}{name}-{i++}{ext}";
        }
        return key;
    }

    private static string SafeKey(string key)
    {
        var normalized = key.Replace('\\', '/');
        var parts = normalized.Split('/', StringSplitOptions.RemoveEmptyEntries);
        var safe = parts.Where(p => p != "." && p != ".." && !p.Contains(':')).Select(p => Regex.Replace(p, @"[^\w\.\- ]", "-")).ToList();
        if (safe.Count == 0) return "";
        return string.Join('/', safe).TrimStart('/');
    }

    private static string Slugify(string value)
    {
        var s = Regex.Replace(value.Trim().ToLowerInvariant(), @"[^a-z0-9]+", "-").Trim('-');
        return s.Length > 0 ? s : "theme";
    }

    public static string GuessMime(string key)
    {
        var ext = Path.GetExtension(key).ToLowerInvariant();
        return ext switch
        {
            ".svg" => "image/svg+xml",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            ".ico" => "image/x-icon",
            ".woff" => "font/woff",
            ".woff2" => "font/woff2",
            ".ttf" => "font/ttf",
            ".otf" => "font/otf",
            ".eot" => "application/vnd.ms-fontobject",
            ".css" => "text/css",
            ".js" => "text/javascript",
            ".json" => "application/json",
            _ => "application/octet-stream"
        };
    }

    private static string GuessAssetType(string mime, string key) =>
        new Func<string>(() =>
        {
            if (key.Contains("favicon", StringComparison.OrdinalIgnoreCase)) return "favicon";
            if (mime.StartsWith("font") || key.Contains("fonts/")) return "font";
            if (mime == "image/svg+xml")
            {
                if (key.Contains("logo-dark")) return "logo-dark";
                if (key.Contains("logo")) return "logo";
                return "image";
            }
            if (mime.StartsWith("image/")) return "image";
            if (mime.StartsWith("video/")) return "video";
            return "file";
        })();
}
