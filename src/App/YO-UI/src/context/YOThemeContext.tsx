import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ParsedThemeConfig, TemplateDefinition, LayoutDefinition } from "../types/yoThemeTypes";

interface ResolvedComponentVariant {
  classes: string;
  [key: string]: unknown;
}

interface YOThemeContextValue {
  themeConfig: ParsedThemeConfig | null;
  template: TemplateDefinition | null;
  layout: LayoutDefinition | null;
  resolveComponent: (type: string) => ResolvedComponentVariant;
  resolveToken: (path: string) => string;
}

const YOThemeContext = createContext<YOThemeContextValue | null>(null);

interface YOThemeProviderProps {
  themeConfig: ParsedThemeConfig | null;
  template?: TemplateDefinition | null;
  layout?: LayoutDefinition | null;
  children: ReactNode;
}

export function YOThemeProvider({ themeConfig, template, layout, children }: YOThemeProviderProps) {
  const value = useMemo<YOThemeContextValue>(() => ({
    themeConfig,
    template: template ?? null,
    layout: layout ?? null,
    resolveComponent: (type: string) => {
      if (!themeConfig?.components) return { classes: "" };
      const comp = themeConfig.components[type];
      if (!comp) return { classes: "" };
      return comp.variants?.[comp.variant] ?? { classes: "" };
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

  return <YOThemeContext.Provider value={value}>{children}</YOThemeContext.Provider>;
}

export function useYOTheme(): YOThemeContextValue {
  const ctx = useContext(YOThemeContext);
  if (!ctx) throw new Error("useYOTheme must be used inside <YOThemeProvider>");
  return ctx;
}

export function buildTokenCss(tokens: ParsedThemeConfig["tokens"]): string {
  if (!tokens) return "";
  const rules: string[] = [];

  if (tokens.colors) {
    for (const [name, val] of Object.entries(tokens.colors)) {
      if (typeof val === "object" && val.default) {
        rules.push(`  --yo-${name}: ${val.default};`);
        if (val.dark) {
          rules.push(`  --yo-${name}-dark: ${val.dark};`);
        }
      }
    }
  }
  if (tokens.fonts) {
    for (const [name, val] of Object.entries(tokens.fonts)) {
      if (typeof val === "object" && val.family) {
        rules.push(`  --font-${name}: '${val.family}', system-ui, sans-serif;`);
      }
    }
  }
  if (tokens.spacing) {
    for (const [name, val] of Object.entries(tokens.spacing)) {
      rules.push(`  --spacing-${name}: ${val};`);
    }
  }
  if (tokens["border-radius"]) {
    for (const [name, val] of Object.entries(tokens["border-radius"])) {
      rules.push(`  --radius-${name}: ${val};`);
    }
  }
  if (tokens.shadows) {
    for (const [name, val] of Object.entries(tokens.shadows)) {
      rules.push(`  --shadow-${name}: ${val};`);
    }
  }

  return rules.join("\n");
}

export function parseThemeConfig(configJson: string | null | undefined): ParsedThemeConfig | null {
  if (!configJson) return null;
  try {
    return JSON.parse(configJson) as ParsedThemeConfig;
  } catch {
    return null;
  }
}
