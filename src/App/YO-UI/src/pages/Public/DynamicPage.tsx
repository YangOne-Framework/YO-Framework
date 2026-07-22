import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { PageRenderer } from "../../renderer/PageRenderer";
import { YOThemeProvider, buildTokenCss, parseThemeConfig } from "../../context/YOThemeContext";
import { GoogleFontLoader } from "../../components/GoogleFontLoader";
import { useGetThemeQuery, useGetThemeListQuery } from "../../redux/theme/themeAPI";
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
      <main className="flex-1">{children}</main>
    </div>
  );
}

const ShellRegistry: Record<string, React.ComponentType<ShellProps>> = {
  DefaultShell,
  SidebarRightShell,
  SidebarLeftShell: DefaultShell,
  TopNavShell: DefaultShell,
  MinimalShell: DefaultShell,
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
  const { data: themes = [] } = useGetThemeListQuery({ limit: 50 });
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

  // The published page API (api/public/pages/{slug}) already resolves and returns
  // the theme + layout server-side (active theme, or the page's linked theme) as
  // `ThemeConfig` / `MasterLayout`. So the real page consumes the theme straight
  // from the page payload — no separate auth-gated /yotheme/active call, which
  // meant an extra round-trip and broke anonymous/public rendering.
  const { data: overrideTheme } = useGetThemeQuery(themeParam ?? "", { skip: !themeParam });

  // Theme resolution precedence:
  //   1. ?theme=<guid>  (preview route only — force a specific theme for testing)
  //   2. the theme delivered by the page API itself (single smooth load)
  const themeConfig = useMemo<ParsedThemeConfig | null>(() => {
    if (themeParam && overrideTheme?.Config) return parseThemeConfig(overrideTheme.Config);
    return (page.themeConfig as ParsedThemeConfig) ?? null;
  }, [themeParam, overrideTheme, page.themeConfig]);

  const resolved = useMemo(() => {
    if (!themeConfig) return { template: null, layout: null, Shell: DefaultShell };

    const { template, layout } = resolveTemplate(themeConfig, page.templateType ?? "page", page.slug);
    const layoutType = themeConfig.structure?.layoutType;
    const Shell = (layoutType && ShellRegistry[layoutType]) || DefaultShell;

    return { template, layout, Shell };
  }, [themeConfig, page.templateType, page.slug]);

  const cssVars = useMemo(() => {
    if (!themeConfig?.tokens) return "";
    return buildTokenCss(themeConfig.tokens);
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
    <YOThemeProvider themeConfig={themeConfig} template={resolved.template} layout={resolved.layout}>
      <style>{cssVars}</style>
      {themeConfig.tokens?.fonts && <GoogleFontLoader fonts={themeConfig.tokens.fonts} />}
      <Shell>
        <PageRenderer page={page} />
      </Shell>
      {preview && <PublicThemeSwitcher />}
    </YOThemeProvider>
  );
}
