import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ParsedThemeConfig, TemplateDefinition, LayoutDefinition } from "../types/yoThemeTypes";
import { buildFluidScale } from "../pages/Admin/Theme/themeUtils";

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

/* ── Color channel helpers (for runtime-switchable / alpha CSS) ── */
function hexToRgbChannels(hex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return "0 0 0";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

function hexToHslChannels(hex: string): [number, number, number] {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return [0, 0, 0];
  const [r, g, b] = hexToRgbChannels(hex).split(" ").map(Number);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0; const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      default: h = (rn - gn) / d + 4;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Compiles Theme design tokens AND a comprehensive suite of premium,
 * world-wide ready standard components CSS classes (.yo-*) into a single stylesheet.
 * Leverages native modern color-mix() and variables to support fluid dark/light rendering.
 */
export function buildTokenCss(tokens: ParsedThemeConfig["tokens"], components?: ParsedThemeConfig["components"]): string {
  if (!tokens) return "";
  const rules: string[] = [];

  /* ── 1. Compile Core Design Token Variables ── */
  if (tokens.colors) {
    for (const [name, val] of Object.entries(tokens.colors)) {
      if (typeof val === "object" && val.default) {
        const channels = hexToRgbChannels(val.default);
        rules.push(`  --yo-${name}: ${val.default};`);
        rules.push(`  --c-${name}: ${channels};`);
        const [h, s, l] = hexToHslChannels(val.default);
        rules.push(`  --yo-${name}-rgb: ${channels};`);
        rules.push(`  --yo-${name}-hsl: ${h} ${s}% ${l}%;`);
        if (val.dark) {
          rules.push(`  --yo-${name}-dark: ${val.dark};`);
          rules.push(`  --c-${name}-dark: ${hexToRgbChannels(val.dark)};`);
        }
      }
    }
  }
  /* Motion — always emitted so the editor's Motion controls reflect live */
  rules.push(`  --yo-transition-duration: ${tokens.motion?.duration ?? "0.2s"};`);
  rules.push(`  --yo-transition-easing: ${tokens.motion?.easing ?? "cubic-bezier(0.4, 0, 0.2, 1)"};`);
  /* Focus ring (ADA) — always available for the Focus Ring control */
  rules.push(`  --yo-focus-ring-width: ${tokens.focus?.width ?? "2px"};`);
  rules.push(`  --yo-focus-ring-color: ${tokens.focus?.color ?? "rgb(var(--c-primary))"};`);
  rules.push(`  --yo-focus-ring-offset: ${tokens.focus?.offset ?? "2px"};`);
  /* Fluid modular type scale (always emitted so headings track the slider) */
  if (tokens.fluid?.base) rules.push(`  --yo-fluid-base: ${tokens.fluid.base};`);
  const fluidScale = buildFluidScale(tokens.fluid);
  for (const [k, v] of Object.entries(fluidScale)) rules.push(`  ${k}: ${v};`);
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

  let cssOutput = `:root {\n${rules.join("\n")}\n}\n\n`;

  /* ── Dark mode overrides ── */
  const darkRules: string[] = [];
  if (tokens.colors) {
    for (const [name, val] of Object.entries(tokens.colors)) {
      if (typeof val === "object" && val.dark) {
        darkRules.push(`  --c-${name}: ${hexToRgbChannels(val.dark)};`);
        darkRules.push(`  --yo-${name}: ${val.dark};`);
      }
    }
  }
  if (darkRules.length > 0) {
    cssOutput += `@media (prefers-color-scheme: dark) {\n:root {\n${darkRules.join("\n")}\n}\n}\n\n`;
  }

  /* ── 2. Component Customization Fallbacks ── */
  const compButton = components?.button as any;
  const btnPx = compButton?.paddingX ?? "1.25rem";
  const btnPy = compButton?.paddingY ?? "0.625rem";
  const btnRadius = compButton?.borderRadius ?? "var(--radius-md, 0.5rem)";
  const btnShadow = compButton?.shadow ?? "var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))";
  const btnTransition = compButton?.transition ?? "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";

  const compCard = components?.card as any;
  const cardPadding = compCard?.padding ?? "1.5rem";
  const cardRadius = compCard?.borderRadius ?? "var(--radius-lg, 0.75rem)";
  const cardShadow = compCard?.shadow ?? "var(--shadow-md)";

  const compInput = components?.input as any;
  const inputRadius = compInput?.borderRadius ?? "var(--radius-md, 0.5rem)";
  const inputPadding = compInput?.padding ?? "0.625rem 0.875rem";

  /* ── 3. Compile Premium Platform Standard Component Classes (.yo-*) ── */
  cssOutput += `
/* ================================================================== */
/*  PLATFORM STANDARD COMPONENT STYLES                                */
/* ================================================================== */

/* ── Typography Resets ── */
.yo-heading-1, .yo-heading-2, .yo-heading-3 {
  font-family: var(--font-heading, system-ui, sans-serif);
  color: rgb(var(--c-text));
  font-weight: 700;
  letter-spacing: -0.02em;
}
.yo-heading-1 { font-size: var(--yo-fs-6); line-height: 1.1; }
.yo-heading-2 { font-size: var(--yo-fs-5); line-height: 1.15; }
.yo-heading-3 { font-size: var(--yo-fs-4); line-height: 1.2; }
.yo-body {
  font-family: var(--font-body, system-ui, sans-serif);
  color: rgb(var(--c-text));
  font-size: var(--yo-fs-2);
}

/* ── Buttons ── */
.yo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body, system-ui, sans-serif);
  font-weight: 600;
  font-size: 0.875rem;
  padding: ${btnPy} ${btnPx};
  border-radius: ${btnRadius};
  box-shadow: ${btnShadow};
  transition: background-color var(--yo-transition-duration) var(--yo-transition-easing),
              box-shadow var(--yo-transition-duration) var(--yo-transition-easing),
              transform var(--yo-transition-duration) var(--yo-transition-easing);
  cursor: pointer;
  border: 1px solid transparent;
  gap: 0.5rem;
  user-select: none;
}
.yo-btn:active {
  transform: scale(0.97);
}
.yo-btn-primary {
  background-color: rgb(var(--c-primary));
  color: #ffffff;
}
.yo-btn-primary:hover {
  filter: brightness(1.1);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.yo-btn-secondary {
  background-color: rgb(var(--c-secondary));
  color: #ffffff;
}
.yo-btn-secondary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
.yo-btn-outline {
  background-color: transparent;
  border-color: rgb(var(--c-border));
  color: rgb(var(--c-text));
  box-shadow: none;
}
.yo-btn-outline:hover {
  background-color: color-mix(in srgb, rgb(var(--c-text)) 4%, transparent);
  border-color: rgb(var(--c-text));
}
.yo-btn-text {
  background-color: transparent;
  color: rgb(var(--c-primary));
  box-shadow: none;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.yo-btn-text:hover {
  background-color: color-mix(in srgb, rgb(var(--c-primary)) 8%, transparent);
}

/* ── Cards ── */
.yo-card {
  background-color: var(--yo-card, #ffffff);
  color: var(--yo-cardForeground, rgb(var(--c-text)));
  border-radius: ${cardRadius};
  border: 1px solid rgb(var(--c-border));
  box-shadow: ${cardShadow};
  overflow: hidden;
  transition: transform var(--yo-transition-duration) var(--yo-transition-easing), box-shadow var(--yo-transition-duration) var(--yo-transition-easing);
}
.yo-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1));
}
.yo-card-header {
  padding: ${cardPadding};
  border-bottom: 1px solid rgb(var(--c-border));
  font-family: var(--font-heading, system-ui, sans-serif);
  font-weight: 700;
  font-size: 1rem;
}
.yo-card-body {
  padding: ${cardPadding};
}
.yo-card-footer {
  padding: ${cardPadding};
  border-top: 1px solid rgb(var(--c-border));
  background-color: color-mix(in srgb, rgb(var(--c-text)) 1.5%, transparent);
}

/* ── Badges ── */
.yo-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full, 9999px);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid transparent;
}
.yo-badge-primary {
  background-color: color-mix(in srgb, rgb(var(--c-primary)) 12%, transparent);
  color: rgb(var(--c-primary));
  border-color: color-mix(in srgb, rgb(var(--c-primary)) 20%, transparent);
}
.yo-badge-secondary {
  background-color: color-mix(in srgb, rgb(var(--c-secondary)) 12%, transparent);
  color: rgb(var(--c-secondary));
  border-color: color-mix(in srgb, rgb(var(--c-secondary)) 20%, transparent);
}
.yo-badge-accent {
  background-color: color-mix(in srgb, rgb(var(--c-accent)) 12%, transparent);
  color: rgb(var(--c-accent));
  border-color: color-mix(in srgb, rgb(var(--c-accent)) 20%, transparent);
}
.yo-badge-success {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.2);
}
.yo-badge-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.2);
}

/* ── Form inputs ── */
.yo-form-group {
  margin-bottom: 1.25rem;
}
.yo-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.375rem;
  color: rgb(var(--c-text));
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.85;
}
.yo-input, .yo-textarea, .yo-select {
  width: 100%;
  padding: ${inputPadding};
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 0.875rem;
  background-color: rgb(var(--c-bg));
  color: rgb(var(--c-text));
  border: 1px solid rgb(var(--c-border));
  border-radius: ${inputRadius};
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.yo-input::placeholder {
  color: color-mix(in srgb, rgb(var(--c-text)) 40%, transparent);
}
.yo-input:focus, .yo-textarea:focus, .yo-select:focus {
  border-color: var(--yo-ring, rgb(var(--c-primary)));
  outline: none;
  box-shadow: 0 0 0 var(--yo-focus-ring-offset, 3px) var(--yo-bg, #fff),
              0 0 0 calc(var(--yo-focus-ring-offset, 3px) + var(--yo-focus-ring-width, 2px)) var(--yo-focus-ring-color, rgb(var(--c-primary)));
}

/* ── Alerts ── */
.yo-alert {
  padding: 1rem 1.25rem;
  border-radius: var(--radius-md, 0.5rem);
  border: 1px solid transparent;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
}
.yo-alert-success {
  background-color: rgba(34, 197, 94, 0.05);
  border-color: rgba(34, 197, 94, 0.15);
  color: #15803d;
}
.yo-alert-info {
  background-color: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
}
.yo-alert-warning {
  background-color: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.15);
  color: #b45309;
}
.yo-alert-error {
  background-color: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

/* ── Navigation Shell ── */
.yo-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: var(--yo-card, #ffffff);
  border-bottom: 1px solid rgb(var(--c-border));
}
.yo-navbar-brand {
  font-family: var(--font-heading, system-ui, sans-serif);
  font-weight: 850;
  font-size: 1.25rem;
  letter-spacing: -0.03em;
  color: rgb(var(--c-primary));
}
.yo-navbar-link {
  font-family: var(--font-body, system-ui, sans-serif);
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--c-text));
  opacity: 0.8;
  transition: opacity 0.15s, color 0.15s;
  cursor: pointer;
}
.yo-navbar-link:hover {
  opacity: 1;
  color: rgb(var(--c-primary));
}
.yo-navbar-link-active {
  opacity: 1;
  color: rgb(var(--c-primary));
  border-bottom: 2px solid rgb(var(--c-primary));
  padding-bottom: 0.25rem;
}

/* ── Sidebar ── */
.yo-sidebar {
  background-color: var(--yo-sidebarBackground, var(--yo-card, #ffffff));
  border-right: 1px solid var(--yo-sidebarBorder, rgb(var(--c-border)));
  color: var(--yo-sidebarForeground, rgb(var(--c-text)));
  padding: 1.5rem 1rem;
}
.yo-sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: var(--radius-md, 0.5rem);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s;
  cursor: pointer;
}
.yo-sidebar-item:hover {
  background-color: color-mix(in srgb, var(--yo-sidebarForeground, rgb(var(--c-text))) 6%, transparent);
}
.yo-sidebar-item-active {
  background-color: var(--yo-sidebarPrimary, rgb(var(--c-primary)));
  color: #ffffff;
  font-weight: 600;
}

/* ── Accordions ── */
.yo-accordion {
  border: 1px solid rgb(var(--c-border));
  border-radius: var(--radius-md, 0.5rem);
  background-color: var(--yo-card, #ffffff);
  overflow: hidden;
}
.yo-accordion-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 1px solid rgb(var(--c-border));
  cursor: pointer;
}
.yo-accordion-content {
  padding: 1rem 1.25rem;
  font-size: 0.875rem;
  color: rgb(var(--c-text));
  opacity: 0.9;
}

/* ── Tables ── */
.yo-table-container {
  overflow-x: auto;
  border: 1px solid rgb(var(--c-border));
  border-radius: var(--radius-md, 0.5rem);
}
.yo-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}
.yo-table-header {
  background-color: color-mix(in srgb, rgb(var(--c-text)) 3%, transparent);
  border-bottom: 1px solid rgb(var(--c-border));
  font-weight: 700;
  color: rgb(var(--c-text));
  padding: 0.875rem 1rem;
}
.yo-table-cell {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgb(var(--c-border));
}
.yo-table-row:hover {
  background-color: color-mix(in srgb, rgb(var(--c-text)) 1.5%, transparent);
}

/* ── Footer ── */
.yo-footer {
  background-color: var(--yo-card, #ffffff);
  border-top: 1px solid rgb(var(--c-border));
  padding: 3rem 1.5rem;
}
.yo-footer-column {
  display: flex;
  flex-col: column;
  gap: 0.625rem;
}
.yo-footer-link {
  font-size: 0.825rem;
  color: rgb(var(--c-text));
  opacity: 0.75;
  transition: opacity 0.15s, color 0.15s;
}
.yo-footer-link:hover {
  opacity: 1;
  color: rgb(var(--c-primary));
}

/* ── Extended Standard Components ── */
.yo-accordion { border: 1px solid rgb(var(--c-border)); border-radius: var(--radius-md); overflow: hidden; }
.yo-accordion-item { border-bottom: 1px solid rgb(var(--c-border)); }
.yo-accordion-item:last-child { border-bottom: 0; }
.yo-accordion-trigger { width: 100%; text-align: left; padding: 0.75rem 1rem; font-weight: 600; background: transparent; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
.yo-accordion-content { padding: 0 1rem 0.75rem; color: rgb(var(--c-muted)); font-size: 0.875rem; }

.yo-modal { background: rgb(var(--c-card)); border: 1px solid rgb(var(--c-border)); border-radius: var(--radius-lg); box-shadow: var(--shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.15)); padding: 1.25rem; max-width: 28rem; }
.yo-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; padding: 1rem; }

.yo-tabs { display: flex; gap: 0.25rem; border-bottom: 1px solid rgb(var(--c-border)); }
.yo-tab { padding: 0.5rem 0.875rem; font-weight: 500; color: rgb(var(--c-muted)); border-bottom: 2px solid transparent; cursor: pointer; }
.yo-tab-active { color: rgb(var(--c-primary)); border-bottom-color: rgb(var(--c-primary)); }

.yo-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: rgb(var(--c-muted)); }
.yo-breadcrumb-sep { opacity: 0.5; }
.yo-breadcrumb-current { color: rgb(var(--c-text)); font-weight: 600; }

.yo-avatar { display: inline-flex; align-items: center; justify-content: center; height: 2.5rem; width: 2.5rem; border-radius: var(--radius-md); background: color-mix(in srgb, rgb(var(--c-primary)) 15%, transparent); color: rgb(var(--c-primary)); font-weight: 600; }

.yo-switch { position: relative; display: inline-flex; height: 1.5rem; width: 2.75rem; border-radius: 9999px; background: rgb(var(--c-muted)); transition: background var(--yo-transition-duration) var(--yo-transition-easing); }
.yo-switch[data-on="true"] { background: rgb(var(--c-primary)); }
.yo-switch-thumb { position: absolute; top: 0.15rem; left: 0.15rem; height: 1.2rem; width: 1.2rem; border-radius: 9999px; background: #fff; transition: transform var(--yo-transition-duration) var(--yo-transition-easing); }
.yo-switch[data-on="true"] .yo-switch-thumb { transform: translateX(1.25rem); }

.yo-progress { width: 100%; height: 0.5rem; background: rgb(var(--c-muted)); border-radius: 9999px; overflow: hidden; }
.yo-progress-bar { height: 100%; background: rgb(var(--c-primary)); border-radius: 9999px; }

.yo-toast { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: var(--radius-md); background: rgb(var(--c-card)); border: 1px solid rgb(var(--c-border)); box-shadow: var(--shadow-md); font-size: 0.875rem; }
.yo-toast-success { border-color: color-mix(in srgb, var(--yo-success, #22c55e) 40%, transparent); }

.yo-tooltip { display: inline-block; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); background: rgb(var(--c-text)); color: rgb(var(--c-bg)); font-size: 0.75rem; }

.yo-pagination { display: flex; gap: 0.25rem; }
.yo-page { min-width: 2rem; height: 2rem; display: inline-flex; align-items: center; justify-content: center; padding: 0 0.5rem; border-radius: var(--radius-md); border: 1px solid rgb(var(--c-border)); font-size: 0.875rem; cursor: pointer; }
.yo-page-active { background: rgb(var(--c-primary)); color: var(--yo-primary-foreground, #fff); border-color: rgb(var(--c-primary)); }

/* ── Spacing & Layout (consume --spacing-* tokens) ── */
.yo-section {
  padding: var(--spacing-section-padding, 5rem 1rem);
}
@media (min-width: 768px) {
  .yo-section {
    padding: var(--spacing-section-padding-md, 5rem 2rem);
  }
}
.yo-container {
  max-width: var(--spacing-container-max, 1280px);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-container-padding, 1rem);
  padding-right: var(--spacing-container-padding, 1rem);
}
.yo-container-fluid {
  width: 100%;
  padding-left: var(--spacing-container-padding, 1rem);
  padding-right: var(--spacing-container-padding, 1rem);
}
.yo-grid {
  display: grid;
  gap: var(--spacing-gap, 1.5rem);
}
.yo-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.yo-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.yo-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.yo-grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
@media (min-width: 768px) {
  .md\:yo-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:yo-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .md\:yo-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  .md\:yo-grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
}
@media (min-width: 1024px) {
  .lg\:yo-grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .lg\:yo-grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:yo-grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
  .lg\:yo-grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
}

/* ── Component Variants ── */
.yo-btn-pill { border-radius: 9999px; }
.yo-btn-shadow { box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1)); }
.yo-card-shadow { box-shadow: var(--shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.15)); }

/* ── Global Focus Ring Standardization (ADA compliance) ── */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--yo-focus-ring-offset, 2px) var(--yo-bg, #fff),
              0 0 0 calc(var(--yo-focus-ring-offset, 2px) + var(--yo-focus-ring-width, 2px)) var(--yo-focus-ring-color, rgb(var(--c-primary)));
  border-radius: var(--radius-sm, 0.25rem);
}
`;

  /* Reduced motion toggle (from the Motion control) */
  if (tokens.motion?.reduced) {
    cssOutput += `
.yo-reduced-motion *, .yo-reduced-motion *::before, .yo-reduced-motion *::after {
  transition: none !important;
  animation: none !important;
}
`;
  }

  return cssOutput;
}

export function parseThemeConfig(configJson: string | null | undefined): ParsedThemeConfig | null {
  if (!configJson) return null;
  try {
    return JSON.parse(configJson) as ParsedThemeConfig;
  } catch {
    return null;
  }
}
