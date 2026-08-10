import type { ParsedThemeConfig, ThemeTokens, ComponentVariantConfig } from "../../../types/yoThemeTypes";

/* ================================================================== */
/*  Color math                                                        */
/* ================================================================== */

export function hexToHsl(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      default: hue = (r - g) / d + 4;
    }
    hue /= 6;
  }
  return [Math.round(hue * 360), Math.round(sat * 100), Math.round(light * 100)];
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function isValidHex(hex: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

function luminance(hex: string): number {
  if (!isValidHex(hex)) return 0;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const rgb = [0, 2, 4].map((i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/** Returns near-black or near-white — whichever is most readable on `bg`. */
export function readableForeground(bg: string): string {
  return luminance(bg) > 0.42 ? "#0f172a" : "#f8fafc";
}

/**
 * Darken a color (in HSL) until white text on it meets at least `minRatio`
 * (WCAG AA normal text = 4.5:1). Used for action/button surfaces so the
 * publish accessibility gate never blocks on brand colors.
 */
export function darkenForWhiteText(hex: string, minRatio = 4.5, maxSteps = 60): string {
  if (!isValidHex(hex)) return hex;
  let [h, s, l] = hexToHsl(hex);
  let current = hslToHex(h, s, l);
  let steps = 0;
  while (contrastRatio("#ffffff", current) < minRatio && steps < maxSteps) {
    l = Math.max(0, l - 1);
    current = hslToHex(h, s, l);
    steps++;
  }
  return current;
}

/**
 * Ensure an action surface carries white text at AA while keeping it visually
 * close to the brand seed. Prefers darkening over hue/saturation shifts, so a
 * light cyan seed becomes a deep teal rather than a gray.
 */
export function accessibleActionColor(hex: string, minRatio = 4.5): string {
  return darkenForWhiteText(hex, minRatio);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return Math.round(((light + 0.05) / (dark + 0.05)) * 100) / 100;
}

function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.min(100, l + amount));
}

function darken(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, Math.max(0, l - amount));
}

function rotate(hex: string, deg: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h + deg, s, l);
}

/* ================================================================== */
/*  Palette generation from a single brand color                       */
/* ================================================================== */

export type Harmony = "monochrome" | "complementary" | "analogous" | "triadic";

export interface GeneratedPalette {
  light: Record<string, string>;
  dark: Record<string, string>;
}

/**
 * Generate a full, accessible color-token set from one seed brand color.
 * Produces matching light + dark palettes covering every editor token.
 */
export function generatePalette(seed: string, harmony: Harmony = "complementary"): GeneratedPalette {
  const [h, s] = hexToHsl(seed);
  const primary = seed;

  let secondary: string;
  let accent: string;
  switch (harmony) {
    case "monochrome":
      secondary = hslToHex(h, Math.max(10, s - 35), 46);
      accent = hslToHex(h, Math.min(100, s + 8), 62);
      break;
    case "analogous":
      secondary = rotate(seed, 30);
      accent = rotate(seed, -30);
      break;
    case "triadic":
      secondary = rotate(seed, 120);
      accent = rotate(seed, 240);
      break;
    default: // complementary
      secondary = hslToHex(h, Math.max(8, s - 40), 45);
      accent = rotate(seed, 180);
  }

  const light: Record<string, string> = {
    primary: accessibleActionColor(primary),
    secondary: accessibleActionColor(secondary),
    accent: accessibleActionColor(accent),
    bg: "#ffffff",
    foreground: "#0f172a",
    card: "#ffffff",
    cardForeground: "#0f172a",
    popover: "#ffffff",
    popoverForeground: "#0f172a",
    text: "#0f172a",
    muted: "#64748b",
    mutedForeground: "#64748b",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    success: "#16a34a",
    warning: "#d97706",
    error: "#dc2626",
    info: "#0284c7",
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: accessibleActionColor(primary),
    sidebarBackground: hslToHex(h, Math.min(30, s), 97),
    sidebarForeground: "#334155",
    sidebarPrimary: accessibleActionColor(primary),
    sidebarAccent: hslToHex(h, Math.min(40, s), 92),
    sidebarBorder: "#e2e8f0",
    sidebarRing: accessibleActionColor(primary),
    chart1: accessibleActionColor(primary),
    chart2: rotate(seed, 45),
    chart3: rotate(seed, 90),
    chart4: rotate(seed, 180),
    chart5: rotate(seed, 270),
  };

  const dark: Record<string, string> = {
    primary: lighten(accessibleActionColor(primary), 4),
    secondary: lighten(accessibleActionColor(secondary), 4),
    accent: lighten(accessibleActionColor(accent), 4),
    bg: "#0b1120",
    foreground: "#e2e8f0",
    card: "#111827",
    cardForeground: "#e2e8f0",
    popover: "#111827",
    popoverForeground: "#e2e8f0",
    text: "#e2e8f0",
    muted: "#94a3b8",
    mutedForeground: "#94a3b8",
    destructive: "#f87171",
    destructiveForeground: "#0b1120",
    success: "#4ade80",
    warning: "#fbbf24",
    error: "#f87171",
    info: "#38bdf8",
    border: "#1e293b",
    input: "#1e293b",
    ring: lighten(accessibleActionColor(primary), 4),
    sidebarBackground: "#0f172a",
    sidebarForeground: "#cbd5e1",
    sidebarPrimary: lighten(accessibleActionColor(primary), 4),
    sidebarAccent: "#1e293b",
    sidebarBorder: "#1e293b",
    sidebarRing: lighten(accessibleActionColor(primary), 4),
    chart1: lighten(accessibleActionColor(primary), 4),
    chart2: lighten(rotate(seed, 45), 6),
    chart3: lighten(rotate(seed, 90), 6),
    chart4: lighten(rotate(seed, 180), 6),
    chart5: lighten(rotate(seed, 270), 6),
  };

  return { light, dark };
}

/** Derive a dark value for every existing color token from its light value. */
export function deriveDarkFromLight(colors: ThemeTokens["colors"]): ThemeTokens["colors"] {
  const out: ThemeTokens["colors"] = {};
  for (const [name, val] of Object.entries(colors)) {
    const base = val.default;
    if (!isValidHex(base)) { out[name] = { ...val }; continue; }
    const lum = luminance(base);
    // Backgrounds/surfaces flip dark; text/foreground flip light; brand colors nudge lighter.
    let dark: string;
    if (/bg|background|card|popover|input|border|sidebarBackground/i.test(name)) {
      dark = darken(base, Math.min(80, 90 - lum * 100));
    } else if (/foreground|text|muted/i.test(name)) {
      dark = lighten(base, Math.min(85, lum < 0.3 ? 70 : 20));
    } else {
      dark = lighten(base, 8);
    }
    out[name] = { ...val, dark };
  }
  return out;
}

/* ================================================================== */
/*  Curated theme presets (one-click starting points)                  */
/* ================================================================== */

export interface ThemePreset {
  id: string;
  name: string;
  seed: string;
  harmony: Harmony;
  radius: string;
  fonts: { heading: string; body: string };
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: "indigo", name: "Indigo Pro", seed: "#6366f1", harmony: "complementary", radius: "0.75rem", fonts: { heading: "Plus Jakarta Sans", body: "Inter" } },
  { id: "emerald", name: "Emerald", seed: "#10b981", harmony: "analogous", radius: "0.5rem", fonts: { heading: "Manrope", body: "Inter" } },
  { id: "rose", name: "Rose", seed: "#f43f5e", harmony: "complementary", radius: "1rem", fonts: { heading: "Poppins", body: "DM Sans" } },
  { id: "amber", name: "Amber", seed: "#f59e0b", harmony: "analogous", radius: "0.5rem", fonts: { heading: "Outfit", body: "Inter" } },
  { id: "sky", name: "Sky", seed: "#0ea5e9", harmony: "monochrome", radius: "0.75rem", fonts: { heading: "Figtree", body: "Inter" } },
  { id: "violet", name: "Violet", seed: "#8b5cf6", harmony: "triadic", radius: "1rem", fonts: { heading: "Space Grotesk", body: "Inter" } },
  { id: "slate", name: "Slate Mono", seed: "#475569", harmony: "monochrome", radius: "0.375rem", fonts: { heading: "Inter", body: "Inter" } },
  { id: "teal", name: "Teal", seed: "#14b8a6", harmony: "complementary", radius: "0.75rem", fonts: { heading: "Work Sans", body: "Inter" } },
];

/* ================================================================== */
/*  Font pairings                                                       */
/* ================================================================== */

export interface FontPairing {
  id: string;
  name: string;
  heading: string;
  body: string;
}

export const FONT_PAIRINGS: FontPairing[] = [
  { id: "modern", name: "Modern", heading: "Plus Jakarta Sans", body: "Inter" },
  { id: "clean", name: "Clean", heading: "Manrope", body: "Inter" },
  { id: "editorial", name: "Editorial", heading: "Playfair Display", body: "Source Sans Pro" },
  { id: "friendly", name: "Friendly", heading: "Poppins", body: "DM Sans" },
  { id: "geometric", name: "Geometric", heading: "Outfit", body: "Inter" },
  { id: "classic", name: "Classic", heading: "Merriweather", body: "Work Sans" },
  { id: "tech", name: "Tech", heading: "Space Grotesk", body: "Inter" },
  { id: "system", name: "System", heading: "Inter", body: "Inter" },
];

/* ================================================================== */
/*  Radius scale — one control drives the whole scale                  */
/* ================================================================== */

export function scaleRadius(baseRem: number): Record<string, string> {
  const r = (m: number) => `${Math.round(baseRem * m * 1000) / 1000}rem`;
  return {
    none: "0px",
    sm: r(0.5),
    md: r(1),
    lg: r(1.5),
    xl: r(2),
    full: "9999px",
  };
}

/* ================================================================== */
/*  Apply helpers                                                       */
/* ================================================================== */

export function applyPaletteToConfig(
  config: ParsedThemeConfig,
  palette: GeneratedPalette,
): ParsedThemeConfig {
  const colors: ThemeTokens["colors"] = { ...config.tokens.colors };
  for (const [name, light] of Object.entries(palette.light)) {
    colors[name] = { default: light, dark: palette.dark[name] ?? light };
  }
  return { ...config, tokens: { ...config.tokens, colors } };
}

export function applyPresetToConfig(config: ParsedThemeConfig, preset: ThemePreset): ParsedThemeConfig {
  let next = applyPaletteToConfig(config, generatePalette(preset.seed, preset.harmony));
  const base = parseFloat(preset.radius) || 0.75;
  next = {
    ...next,
    tokens: {
      ...next.tokens,
      "border-radius": { ...next.tokens["border-radius"], ...scaleRadius(base) },
      fonts: {
        ...next.tokens.fonts,
        heading: { ...(next.tokens.fonts.heading ?? { source: "google", weights: [400, 600, 700] }), family: preset.fonts.heading },
        body: { ...(next.tokens.fonts.body ?? { source: "google", weights: [400, 500, 600] }), family: preset.fonts.body },
      },
    },
  };
  return next;
}

/* ================================================================== */
/*  Standard Premium Component Library (.yo-* classes)                 */
/* ================================================================== */

/**
 * The complete set of platform-standard components. Each maps to the
 * generated `.yo-*` CSS classes so pages render consistently and admins
 * can restyle everything from one place — like a sellable premium theme.
 */
export const STANDARD_COMPONENTS: Record<string, ComponentVariantConfig> = {
  button: {
    variant: "primary",
    variants: {
      primary: { classes: "yo-btn yo-btn-primary" },
      secondary: { classes: "yo-btn yo-btn-secondary" },
      outline: { classes: "yo-btn yo-btn-outline" },
      text: { classes: "yo-btn yo-btn-text" },
    },
    paddingX: "1.25rem",
    paddingY: "0.625rem",
    borderRadius: "var(--radius-md, 0.5rem)",
    shadow: "var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  card: {
    variant: "default",
    variants: {
      default: { classes: "yo-card" },
      elevated: { classes: "yo-card yo-card-hover" },
      bordered: { classes: "yo-card border-2" },
      flat: { classes: "yo-card !shadow-none" },
    },
    padding: "1.5rem",
    borderRadius: "var(--radius-lg, 0.75rem)",
    shadow: "var(--shadow-md)",
  },
  badge: {
    variant: "primary",
    variants: {
      primary: { classes: "yo-badge yo-badge-primary" },
      secondary: { classes: "yo-badge yo-badge-secondary" },
      accent: { classes: "yo-badge yo-badge-accent" },
      success: { classes: "yo-badge yo-badge-success" },
      danger: { classes: "yo-badge yo-badge-danger" },
    },
  },
  input: {
    variant: "default",
    variants: {
      default: { classes: "yo-input" },
      filled: { classes: "yo-input bg-[rgb(var(--c-muted))]" },
      underlined: { classes: "yo-input !border-0 !border-b-2 !rounded-none" },
    },
    borderRadius: "var(--radius-md, 0.5rem)",
    padding: "0.625rem 0.875rem",
  },
  alert: {
    variant: "info",
    variants: {
      info: { classes: "yo-alert yo-alert-info" },
      success: { classes: "yo-alert yo-alert-success" },
      warning: { classes: "yo-alert yo-alert-warning" },
      error: { classes: "yo-alert yo-alert-error" },
    },
  },
  navbar: {
    variant: "default",
    variants: {
      default: { classes: "yo-navbar" },
      dark: { classes: "yo-navbar !bg-[rgb(var(--c-text))] !text-[rgb(var(--c-bg))]" },
    },
  },
  sidebar: {
    variant: "default",
    variants: {
      default: { classes: "yo-sidebar" },
      clean: { classes: "yo-sidebar !border-0" },
    },
  },
  table: {
    variant: "default",
    variants: {
      default: { classes: "yo-table-container yo-table" },
      striped: { classes: "yo-table-container yo-table [&_.yo-table-row:nth-child(even)]:bg-black/5" },
      bordered: { classes: "yo-table-container yo-table !border-2" },
    },
  },
  footer: {
    variant: "default",
    variants: {
      default: { classes: "yo-footer" },
      minimal: { classes: "yo-footer !py-8" },
      columns: { classes: "yo-footer grid grid-cols-1 sm:grid-cols-4 gap-6" },
    },
  },
  accordion: {
    variant: "default",
    variants: {
      default: { classes: "yo-accordion" },
      flush: { classes: "yo-accordion !border-0" },
    },
  },
  modal: {
    variant: "default",
    variants: {
      default: { classes: "yo-modal" },
      centered: { classes: "yo-modal !items-center" },
    },
  },
  tabs: {
    variant: "default",
    variants: {
      default: { classes: "yo-tabs" },
      pills: { classes: "yo-tabs !gap-1" },
    },
  },
  breadcrumb: {
    variant: "default",
    variants: {
      default: { classes: "yo-breadcrumb" },
    },
  },
  avatar: {
    variant: "default",
    variants: {
      default: { classes: "yo-avatar" },
      rounded: { classes: "yo-avatar !rounded-full" },
    },
  },
  switch: {
    variant: "default",
    variants: {
      default: { classes: "yo-switch" },
    },
  },
  progress: {
    variant: "default",
    variants: {
      default: { classes: "yo-progress" },
      striped: { classes: "yo-progress !bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,.3)_6px,rgba(255,255,255,.3)_12px)]" },
    },
  },
  toast: {
    variant: "default",
    variants: {
      default: { classes: "yo-toast" },
      success: { classes: "yo-toast yo-toast-success" },
    },
  },
  tooltip: {
    variant: "default",
    variants: {
      default: { classes: "yo-tooltip" },
    },
  },
  pagination: {
    variant: "default",
    variants: {
      default: { classes: "yo-pagination" },
    },
  },
};

/** Merge any missing standard components into a config (non-destructive). */
export function mergeStandardComponents(config: ParsedThemeConfig): ParsedThemeConfig {
  const merged: Record<string, ComponentVariantConfig> = { ...STANDARD_COMPONENTS };
  for (const [k, v] of Object.entries(config.components ?? {})) {
    merged[k] = v;
  }
  return { ...config, components: merged };
}

/* ================================================================== */
/*  Code Export & Framework Integration                               */
/* ================================================================== */

function hexToRgbChannels(hex: string): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return "0 0 0";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

/** 1. Runtime-switchable CSS custom properties (rgb + hsl channels). */
export function buildCssVariablesExport(config: ParsedThemeConfig): string {
  const t = config.tokens;
  const lines: string[] = [];
  for (const [name, val] of Object.entries(t.colors ?? {})) {
    if (val?.default) {
      const channels = hexToRgbChannels(val.default);
      lines.push(`  --c-${name}: ${channels};`);
      lines.push(`  --yo-${name}: ${val.default};`);
      lines.push(`  --yo-${name}-rgb: ${channels};`);
      const [h, s, l] = hexToHsl(val.default);
      lines.push(`  --yo-${name}-hsl: ${h} ${s}% ${l}%;`);
    }
  }
  if (t.motion?.duration) lines.push(`  --yo-transition-duration: ${t.motion.duration};`);
  if (t.motion?.easing) lines.push(`  --yo-transition-easing: ${t.motion.easing};`);
  if (t.focus?.width) lines.push(`  --yo-focus-ring-width: ${t.focus.width};`);
  if (t.focus?.color) lines.push(`  --yo-focus-ring-color: ${t.focus.color};`);
  if (t.focus?.offset) lines.push(`  --yo-focus-ring-offset: ${t.focus.offset};`);
  if (t.fluid?.base) lines.push(`  --yo-fluid-base: ${t.fluid.base};`);
  if (t.fluid) {
    const scale = buildFluidScale(t.fluid);
    for (const [k, v] of Object.entries(scale)) lines.push(`  ${k}: ${v};`);
  }
  return `:root {\n${lines.join("\n")}\n}`;
}

/** 2. tailwind.config.ts that maps tokens to CSS variables. */
export function buildTailwindConfig(config: ParsedThemeConfig): string {
  const t = config.tokens;
  const colorEntries = Object.entries(t.colors ?? {})
    .filter(([, v]) => v?.default)
    .map(([name]) => `        "${name}": "rgb(var(--c-${name}) / <alpha-value>)",`)
    .join("\n");
  const fontEntries = Object.entries(t.fonts ?? {})
    .map(([name, v]) => `        "${name}": ["${v.family}", "system-ui", "sans-serif"],`)
    .join("\n");
  return `import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
${colorEntries}
      },
      fontFamily: {
${fontEntries}
      },
      borderRadius: {
${Object.entries(t["border-radius"] ?? {}).map(([n, v]) => `        "${n}": "${v}",`).join("\n")}
      },
      boxShadow: {
${Object.entries(t.shadows ?? {}).map(([n, v]) => `        "${n}": "${v}",`).join("\n")}
      },
    },
  },
  plugins: [],
} satisfies Config;
`;
}

/** 3. Typed React theme object (drop-in). */
export function buildReactTheme(config: ParsedThemeConfig): string {
  const t = config.tokens;
  const colors = Object.fromEntries(
    Object.entries(t.colors ?? {}).filter(([, v]) => v?.default).map(([n, v]) => [n, v.default]),
  );
  const fonts = Object.fromEntries(Object.entries(t.fonts ?? {}).map(([n, v]) => [n, v.family]));
  const obj = {
    colors,
    fonts,
    radius: t["border-radius"] ?? {},
    shadows: t.shadows ?? {},
    motion: t.motion ?? {},
    focus: t.focus ?? {},
  };
  return `export const theme = ${JSON.stringify(obj, null, 2)} as const;

// Usage: import { theme } from "./theme";
// style={{ color: theme.colors.primary }}
`;
}

/** 4. Multi-tenant scoped stylesheet (data-theme scoping). */
export function buildMultiTenantCss(config: ParsedThemeConfig, scope = "client-a"): string {
  const base = buildCssVariablesExport(config);
  const vars = base.replace(/^:root\s*\{\n?/, "").replace(/\n\}\s*$/, "").trim();
  return `/* Scope this theme to a tenant without conflicting with others */
[data-theme="${scope}"] {
${vars}
}

/* Example: <html data-theme="${scope}"> or <div data-theme="${scope}"> */
`;
}

/** 5. Tailwind CSS v4 native @theme (CSS-first) configuration. */
export function buildTailwindV4(config: ParsedThemeConfig): string {
  const t = config.tokens;
  const colorLines = Object.entries(t.colors ?? {})
    .filter(([, v]) => v?.default)
    .map(([name, v]) => `    --color-${name}: ${v.default};`)
    .join("\n");
  const fontLines = Object.entries(t.fonts ?? {})
    .map(([name, v]) => `    --font-${name}: "${v.family}", system-ui, sans-serif;`)
    .join("\n");
  const radiusLines = Object.entries(t["border-radius"] ?? {})
    .map(([n, v]) => `    --radius-${n}: ${v};`)
    .join("\n");
  const shadowLines = Object.entries(t.shadows ?? {})
    .map(([n, v]) => `    --shadow-${n}: ${v};`)
    .join("\n");
  return `@import "tailwindcss";

/* Native CSS-first theme — no tailwind.config.js required */
@theme {
${colorLines}
${fontLines}
${radiusLines}
${shadowLines}
}

/* Custom plugin-free utilities map directly to the tokens above */
@utility btn-primary {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground, #fff);
  border-radius: var(--radius-md);
}
`;
}

/** 6. Style Dictionary cross-platform token format. */
export function buildStyleDictionary(config: ParsedThemeConfig): string {
  const t = config.tokens;
  const colors: Record<string, any> = {};
  for (const [name, v] of Object.entries(t.colors ?? {})) {
    if (v?.default) colors[name] = { value: v.default, type: "color" };
  }
  const sd = {
    $schema: "https://tr.designtokens.org/format/",
    name: "YangOne Theme",
    tokens: {
      color: colors,
      font: Object.fromEntries(Object.entries(t.fonts ?? {}).map(([n, v]) => [n, { value: v.family, type: "fontFamily" }])),
      radius: Object.fromEntries(Object.entries(t["border-radius"] ?? {}).map(([n, v]) => [n, { value: v, type: "dimension" }])),
      shadow: Object.fromEntries(Object.entries(t.shadows ?? {}).map(([n, v]) => [n, { value: v, type: "shadow" }])),
    },
  };
  return JSON.stringify(sd, null, 2);
}

/** Build a primitive 50–950 scale from a single base color. */
export function buildColorScale(base: string, name: string): Record<string, { default: string }> {
  if (!/^#[0-9a-fA-F]{6}$/.test(base)) return {};
  const [h, s, l] = hexToHsl(base);
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const out: Record<string, { default: string }> = {};
  for (const step of steps) {
    let L: number;
    if (step <= 500) L = 96 - ((500 - step) / 500) * (96 - l);
    else L = l - ((step - 500) / 450) * (l - 14);
    const S = Math.max(8, Math.min(100, step <= 100 ? s + 12 : s));
    out[`${name}-${step}`] = { default: hslToHex(h, S, Math.max(6, Math.min(97, L))) };
  }
  return out;
}

/** Merge a primitive scale into a config's colors. */
export function applyScaleToConfig(config: ParsedThemeConfig, scale: Record<string, { default: string }>): ParsedThemeConfig {
  return {
    ...config,
    tokens: { ...config.tokens, colors: { ...config.tokens.colors, ...scale } },
  };
}

/** Convert hex → rgba() string for opacity-scale previews. */
export function hexToRgba(hex: string, alpha: number): string {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return `rgba(0,0,0,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Build a fluid modular type scale (clamp-based) from fluid tokens. */
export function buildFluidScale(fluid?: { base?: string; ratio?: number; min?: number; max?: number }): Record<string, string> {
  const base = parseFloat(fluid?.base ?? "1") || 1;
  const ratio = fluid?.ratio ?? 1.25;
  const minVW = fluid?.min ?? 360;
  const maxVW = fluid?.max ?? 1280;
  const out: Record<string, string> = {};
  for (let step = 0; step <= 6; step++) {
    const minS = base * Math.pow(ratio, step - 2) * 0.85;
    const maxS = base * Math.pow(ratio, step - 2) * 1.15;
    const slope = (maxS - minS) / (maxVW - minVW);
    const intercept = minS - slope * minVW;
    out[`--yo-fs-${step}`] = `clamp(${minS.toFixed(3)}rem, ${(slope * 100).toFixed(4)}vw + ${intercept.toFixed(3)}rem, ${maxS.toFixed(3)}rem)`;
  }
  return out;
}

/**
 * Best-effort Figma Variables JSON → color map.
 * Handles the Figma Variables REST export shape
 * ({ variables: { id: { name, resolvedValues: { color: { r,g,b,a } } } } }).
 */
export function parseFigmaVariables(input: string): Record<string, { default: string }> | null {
  try {
    const json = JSON.parse(input);
    const vars = json?.variables ?? json?.meta?.variables;
    if (!vars || typeof vars !== "object") return null;
    const out: Record<string, { default: string }> = {};
    for (const v of Object.values<any>(vars)) {
      const name: string = v?.name ?? "";
      const color = v?.resolvedValues?.color ?? v?.values?.[Object.keys(v.values ?? {})[0]]?.color;
      if (!color || typeof color.r !== "number") continue;
      const toHex = (n: number) => Math.round(Math.min(1, Math.max(0, n)) * 255).toString(16).padStart(2, "0");
      out[name] = { default: `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}` };
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}
