import { useMemo } from "react";
import { PageRenderer } from "../../renderer/PageRenderer";
import { YOThemeProvider, buildTokenCss } from "../../context/YOThemeContext";
import type { YoPage } from "../../types/yoPageTypes";
import type { ParsedThemeConfig, TemplateDefinition, LayoutDefinition } from "../../types/yoThemeTypes";

interface DynamicPageProps {
  page: YoPage;
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

// ── Google Font Loader ──────────────────────────────────

function GoogleFontLoader({ fonts }: { fonts: ParsedThemeConfig["tokens"]["fonts"] }) {
  if (!fonts) return null;

  const families = Object.values(fonts)
    .filter((f) => f.source === "google")
    .map((f) => `${f.family.replace(/ /g, "+")}:wght@${f.weights.join(";")}`)
    .join("&family=");

  if (!families) return null;

  return (
    <link
      rel="stylesheet"
      href={`https://fonts.googleapis.com/css2?family=${families}&display=swap`}
    />
  );
}

// ── DynamicPage Component ───────────────────────────────

export default function DynamicPage({ page }: DynamicPageProps) {
  const themeConfig = page.themeConfig as ParsedThemeConfig | null;

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
      <style>{`:root { ${cssVars} }`}</style>
      {themeConfig.tokens?.fonts && <GoogleFontLoader fonts={themeConfig.tokens.fonts} />}
      <Shell>
        <PageRenderer page={page} />
      </Shell>
    </YOThemeProvider>
  );
}
