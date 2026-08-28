/**
 * YOTheme Studio runtime (blueprint §10/§21) — React context that exposes the
 * resolved theme to page renderers. Replaces the legacy v1 YOThemeContext.
 *
 * The provider receives the runtime view (ParsedThemeConfig) produced by
 * normalizeToRuntimeConfig (services/themeMigration) so v1 and v2 configs
 * render identically on public pages and CMS previews.
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ParsedThemeConfig, TemplateDefinition, LayoutDefinition } from "../types/yoThemeTypes";

interface ResolvedComponentVariant {
  classes: string;
  [key: string]: unknown;
}

interface StudioThemeContextValue {
  themeConfig: ParsedThemeConfig | null;
  template: TemplateDefinition | null;
  layout: LayoutDefinition | null;
  resolveComponent: (type: string) => ResolvedComponentVariant;
  resolveToken: (path: string) => string;
}

const StudioThemeContext = createContext<StudioThemeContextValue | null>(null);

interface StudioThemeProviderProps {
  themeConfig: ParsedThemeConfig | null;
  template?: TemplateDefinition | null;
  layout?: LayoutDefinition | null;
  children: ReactNode;
}

export function StudioThemeProvider({ themeConfig, template, layout, children }: StudioThemeProviderProps) {
  const value = useMemo<StudioThemeContextValue>(() => ({
    themeConfig,
    template: template ?? null,
    layout: layout ?? null,
    resolveComponent: (type: string) => {
      if (!themeConfig?.components) return { classes: "" };
      const comp = themeConfig.components[type];
      if (!comp) return { classes: "" };
      const entry = comp.variants?.[comp.variant ?? ""];
      if (entry) return entry;
      /* Registry/plugin variants without a variants-map entry still resolve to
         the compiled convention class so the choice reflects at runtime. */
      if (comp.variant) return { classes: `yo-${type} yo-${type}-${comp.variant}` };
      return { classes: "" };
    },
    resolveToken: (path: string) => {
      if (!themeConfig?.tokens) return "";
      const parts = path.split(".");
      let val: unknown = themeConfig.tokens;
      for (const part of parts) {
        if (val == null || typeof val !== "object") return "";
        val = (val as Record<string, unknown>)[part];
      }
      return typeof val === "string" ? val : String(val ?? "");
    },
  }), [themeConfig, template, layout]);

  return <StudioThemeContext.Provider value={value}>{children}</StudioThemeContext.Provider>;
}

export function useStudioTheme(): StudioThemeContextValue {
  const ctx = useContext(StudioThemeContext);
  if (!ctx) throw new Error("useStudioTheme must be used inside <StudioThemeProvider>");
  return ctx;
}
