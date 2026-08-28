import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageRenderer } from "../../renderer/PageRenderer";
import { StudioThemeProvider } from "../../context/StudioThemeContext";
import { buildTokenCss, parseThemeConfig } from "../../services/runtimeThemeCss";
import { sanitizeCustomCss } from "../../services/themeCompiler";
import { decodeBase64Url } from "../../services/previewEncoding";
import { getValidToken } from "../../services/tokenManager";
import { GoogleFontLoader } from "../../components/GoogleFontLoader";
import { useGetStudioConfigQuery, useGetStudioThemesQuery } from "../../redux/theme/themeStudioAPI";
import { useResolvePublicThemeQuery } from "../../redux/publicPage/publicPageAPI";
import type { YoPage } from "../../types/yoPageTypes";
import type { ParsedThemeConfig, TemplateDefinition, LayoutDefinition } from "../../types/yoThemeTypes";

interface DynamicPageProps {
  page: YoPage;
  /** Preview mode enables ?theme=<guid> override + the floating theme switcher. */
  preview?: boolean;
}

// ── Shell Registry ──────────────────────────────────────

interface ShellProps {
  children: React.ReactNode;
}

function DefaultShell({ children }: ShellProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--yo-bg, #ffffff)",
        color: "var(--yo-text, #1e293b)",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      {children}
    </div>
  );
}

function SidebarRightShell({ children }: ShellProps) {
  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: "var(--yo-bg, #ffffff)",
        color: "var(--yo-text, #1e293b)",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      <main className="min-w-0 flex-1">{children}</main>
      <aside
        className="hidden w-64 shrink-0 border-l lg:block"
        style={{ borderColor: "rgb(var(--c-border, 226 232 240))", backgroundColor: "var(--yo-card, #ffffff)" }}
      >
        <div className="space-y-3 p-5">
          <div className="h-2.5 w-24 rounded-full" style={{ backgroundColor: "rgb(var(--c-primary))", opacity: 0.85 }} />
          {[80, 65, 72].map((w) => (
            <div key={w} className="h-2 rounded-full" style={{ width: `${w}%`, backgroundColor: "rgb(var(--c-border, 226 232 240))" }} />
          ))}
        </div>
      </aside>
    </div>
  );
}

function SidebarLeftShell({ children }: ShellProps) {
  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: "var(--yo-bg, #ffffff)",
        color: "var(--yo-text, #1e293b)",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      <aside
        className="hidden w-64 shrink-0 border-r md:block"
        style={{ borderColor: "rgb(var(--c-border, 226 232 240))", backgroundColor: "var(--yo-card, #ffffff)" }}
      >
        <div className="space-y-3 p-5">
          <div className="h-2.5 w-24 rounded-full" style={{ backgroundColor: "rgb(var(--c-primary))", opacity: 0.85 }} />
          {[70, 88, 60, 76].map((w) => (
            <div key={w} className="h-2 rounded-full" style={{ width: `${w}%`, backgroundColor: "rgb(var(--c-border, 226 232 240))" }} />
          ))}
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function TopNavShell({ children }: ShellProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--yo-bg, #ffffff)",
        color: "var(--yo-text, #1e293b)",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      <header
        className="sticky top-0 z-40 flex items-center gap-6 border-b px-6 py-3"
        style={{ borderColor: "rgb(var(--c-border, 226 232 240))", backgroundColor: "var(--yo-card, #ffffff)" }}
      >
        <span className="h-7 w-7 rounded-lg" style={{ backgroundColor: "rgb(var(--c-primary))" }} />
        <nav className="flex items-center gap-4 text-sm">
          {["Home", "Features", "About"].map((label) => (
            <span key={label} style={{ color: "rgb(var(--c-muted, 100 116 139))" }}>{label}</span>
          ))}
        </nav>
        <button type="button" className="yo-btn yo-btn-primary ml-auto !py-2 !text-xs">Sign up</button>
      </header>
      <main>{children}</main>
    </div>
  );
}

function MinimalShell({ children }: ShellProps) {
  return (
    <div
      className="min-h-screen px-4 py-16"
      style={{
        backgroundColor: "var(--yo-bg, #ffffff)",
        color: "var(--yo-text, #1e293b)",
        fontFamily: "var(--font-body, system-ui, sans-serif)",
      }}
    >
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );
}

const ShellRegistry: Record<string, React.ComponentType<ShellProps>> = {
  DefaultShell,
  SidebarLeftShell,
  SidebarRightShell,
  TopNavShell,
  MinimalShell,
};

// ── Template Resolver ───────────────────────────────────

function resolveTemplate(
  theme: ParsedThemeConfig,
  templateType: string,
  slug: string,
): { template: TemplateDefinition | null; layout: LayoutDefinition | null } {
  const templates = theme.templates ?? {};
  const layouts = theme.layouts ?? {};

  // 1. page-specific override
  if (slug && templates[`${templateType}-${slug}`]) {
    const t = templates[`${templateType}-${slug}`];
    return { template: t, layout: layouts[t.layout] ?? null };
  }

  // 2. template type
  if (templates[templateType]) {
    const t = templates[templateType];
    return { template: t, layout: layouts[t.layout] ?? null };
  }

  // 3. default template
  if (templates.default) {
    const t = templates.default;
    return { template: t, layout: layouts[t.layout] ?? null };
  }

  // 4. fallback — first layout
  const firstLayoutKey = Object.keys(layouts)[0];
  return {
    template: null,
    layout: firstLayoutKey ? layouts[firstLayoutKey] : null,
  };
}

// ── Public Theme Switcher (testing aid) ─────────────────

function PublicThemeSwitcher() {
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get("theme");
  const { data: themes = [] } = useGetStudioThemesQuery({ limit: 50 });
  if (!themes.length) return null;

  const setTheme = (guid: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (guid) next.set("theme", guid);
    else next.delete("theme");
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rounded-xl border border-[rgb(var(--c-border))] bg-[var(--yo-card)] p-3 shadow-lg" style={{ fontFamily: "var(--font-body, system-ui, sans-serif)" }}>
      <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--c-muted))" }}>Preview Theme</div>
      <div className="flex max-w-[220px] flex-col gap-1">
        <button
          onClick={() => setTheme(null)}
          className="rounded-lg px-3 py-1.5 text-left text-xs font-medium transition"
          style={{
            color: !current ? "rgb(var(--c-primary))" : "rgb(var(--c-text))",
            background: !current ? "color-mix(in srgb, rgb(var(--c-primary)) 12%, transparent)" : "transparent",
          }}
        >
          ◉ Active theme
        </button>
        {themes.map((t: any) => (
          <button
            key={t.YOThemeUniqueId}
            onClick={() => setTheme(t.YOThemeUniqueId)}
            className="rounded-lg px-3 py-1.5 text-left text-xs font-medium transition hover:bg-[color-mix(in_srgb,rgb(var(--c-text))_6%,transparent)]"
            style={{
              color: current === t.YOThemeUniqueId ? "rgb(var(--c-primary))" : "rgb(var(--c-text))",
              background: current === t.YOThemeUniqueId ? "color-mix(in srgb, rgb(var(--c-primary)) 12%, transparent)" : "transparent",
            }}
          >
            {t.IsActive ? "● " : ""}{t.Name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── DynamicPage Component ───────────────────────────────

export default function DynamicPage({ page, preview = false }: DynamicPageProps) {
  const [searchParams] = useSearchParams();
  // Theme override is only allowed in preview mode (separate /preview route),
  // never on the real published page.
  const themeParam = preview ? searchParams.get("theme") : null;
  // Unsaved studio draft injected by the Theme Studio live preview.
  const previewConfigParam = preview ? searchParams.get("themeConfig") : null;
  const darkMode = preview && searchParams.get("mode") === "dark";

  // The published page API (api/public/pages/{slug}) already resolves and returns
  // the theme + layout server-side (active theme, or the page's linked theme) as
  // `ThemeConfig` / `MasterLayout`, along with `ThemeCompiledCss` — the sanitized,
  // server-compiled CSS snapshot. The ?theme= override reads the selected theme's
  // draft via config/{guid} — an authenticated admin endpoint, so anonymous
  // visitors skip it and fall through to the published resolution chain.
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    let mounted = true;
    if (!themeParam) return;
    getValidToken()
      .then((token) => { if (mounted) setHasSession(!!token); })
      .catch(() => { if (mounted) setHasSession(false); });
    return () => { mounted = false; };
  }, [themeParam]);
  const { data: overrideCfg } = useGetStudioConfigQuery(themeParam ?? "", { skip: !themeParam || !hasSession });

  // Studio assignment pipeline fallback (blueprint §10/§21): when the page API
  // did not deliver a theme (no linked theme and the server cache predates an
  // assignment), resolve the effective published theme for this route through
  // the anonymous resolve endpoint.
  const { data: resolvedTheme } = useResolvePublicThemeQuery(
    { route: page.slug ? `/${page.slug}` : undefined },
    { skip: !!page.themeConfig || !!themeParam || !!previewConfigParam },
  );

  // Theme resolution precedence:
  //   1. ?theme=<guid>  (preview theme switcher — explicit choice, wins)
  //   2. ?themeConfig=<base64url>  (studio live preview — the unsaved draft)
  //   3. the theme delivered by the page API itself (single smooth load)
  //   4. studio assignment resolution for this route
  const themeConfig = useMemo<ParsedThemeConfig | null>(() => {
    if (themeParam && overrideCfg?.row?.Config) return parseThemeConfig(overrideCfg.row.Config);
    if (previewConfigParam) {
      try {
        return parseThemeConfig(decodeBase64Url(previewConfigParam));
      } catch {
        // fall through to the other resolution sources
      }
    }
    if (page.themeConfig) return page.themeConfig as ParsedThemeConfig;
    if (resolvedTheme?.Config) return parseThemeConfig(resolvedTheme.Config);
    return null;
  }, [themeParam, overrideCfg, previewConfigParam, page.themeConfig, resolvedTheme]);

  const resolved = useMemo(() => {
    if (!themeConfig) return { template: null, layout: null, Shell: DefaultShell };

    const { template, layout } = resolveTemplate(themeConfig, page.templateType ?? "page", page.slug);
    const layoutType = themeConfig.structure?.layoutType;
    const Shell = (layoutType && ShellRegistry[layoutType]) || DefaultShell;

    return { template, layout, Shell };
  }, [themeConfig, page.templateType, page.slug]);

  const cssVars = useMemo(() => {
    // Production path: the published page payload ships the server-compiled CSS
    // (sanitized + gate-validated at publish time). Applying it directly avoids
    // recompiling in the browser and can never drift from what was published.
    // Studio preview (?theme=, ?themeConfig=) always compiles locally — drafts
    // have no server snapshot yet.
    if (!preview && !themeParam && !previewConfigParam && page.themeCompiledCss) {
      return page.themeCompiledCss;
    }
    if (!themeConfig?.tokens) return "";
    // Preview forces light/dark explicitly; the real published page honors the
    // theme's defaultMode (light/dark) and falls back to the OS preference.
    const pageMode = themeConfig.appearance?.defaultMode;
    const mode = !preview
      ? pageMode === "dark" || pageMode === "light"
        ? pageMode
        : "auto"
      : darkMode
        ? "dark"
        : "light";
    const customCss = sanitizeCustomCss(themeConfig.customCss ?? "").css;
    const base = buildTokenCss(themeConfig.tokens, themeConfig.components, mode);
    return customCss ? `${base}\n${customCss}` : base;
  }, [themeConfig, preview, darkMode, themeParam, previewConfigParam, page.themeCompiledCss]);

  // Forced dark/light for the studio live preview and for themes with an
  // explicit defaultMode — never touches the site when the theme is "auto".
  useEffect(() => {
    const pageMode = themeConfig?.appearance?.defaultMode;
    const forced = preview
      ? darkMode
        ? "dark"
        : "light"
      : pageMode === "dark" || pageMode === "light"
        ? pageMode
        : null;
    if (!forced) return;
    document.documentElement.setAttribute("data-yo-theme-mode", forced);
    document.documentElement.style.colorScheme = forced;
    return () => {
      document.documentElement.removeAttribute("data-yo-theme-mode");
      document.documentElement.style.colorScheme = "";
    };
  }, [preview, darkMode, themeConfig]);

  // Theme favicon (appearance.faviconUrl) — applied while the theme is active,
  // restored to whatever the app shipped when the theme goes away.
  useEffect(() => {
    const faviconUrl = themeConfig?.appearance?.faviconUrl;
    if (!faviconUrl) return;
    const original = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    const created = document.createElement("link");
    created.rel = "icon";
    created.href = faviconUrl;
    document.head.appendChild(created);
    return () => {
      created.remove();
      if (original) document.head.appendChild(original);
    };
  }, [themeConfig]);

  // Reduced-motion authoring toggle — applies the kill-switch class while this
  // theme renders, restores the previous state when the theme goes away.
  useEffect(() => {
    const reduced = !!(themeConfig as { motion?: { reduced?: boolean } } | null)?.motion?.reduced;
    if (!reduced) return;
    document.documentElement.classList.add("yo-reduced-motion");
    return () => document.documentElement.classList.remove("yo-reduced-motion");
  }, [themeConfig]);

  if (!themeConfig) {
    // No theme — render page directly
    return (
      <div className="min-h-screen bg-white">
        <PageRenderer page={page} />
      </div>
    );
  }

  const Shell = resolved.Shell;

  return (
    <StudioThemeProvider themeConfig={themeConfig} template={resolved.template} layout={resolved.layout}>
      <style>{cssVars}</style>
      {themeConfig.tokens?.fonts && <GoogleFontLoader fonts={themeConfig.tokens.fonts} />}
      <Shell>
        <PageRenderer page={page} />
      </Shell>
      {preview && <PublicThemeSwitcher />}
    </StudioThemeProvider>
  );
}
