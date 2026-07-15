import type { ParsedThemeConfig, ThemeTokens } from "../../../types/yoThemeTypes";

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
    primary,
    secondary,
    accent,
    bg: "#ffffff",
    foreground: "#0f172a",
    card: "#ffffff",
    cardForeground: "#0f172a",
    popover: "#ffffff",
    popoverForeground: "#0f172a",
    text: "#0f172a",
    muted: "#64748b",
    mutedForeground: "#64748b",
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: primary,
    sidebarBackground: hslToHex(h, Math.min(30, s), 97),
    sidebarForeground: "#334155",
    sidebarPrimary: primary,
    sidebarAccent: hslToHex(h, Math.min(40, s), 92),
    sidebarBorder: "#e2e8f0",
    sidebarRing: primary,
    chart1: primary,
    chart2: rotate(seed, 45),
    chart3: rotate(seed, 90),
    chart4: rotate(seed, 180),
    chart5: rotate(seed, 270),
  };

  const darkPrimary = lighten(primary, 8);
  const dark: Record<string, string> = {
    primary: darkPrimary,
    secondary: lighten(secondary, 6),
    accent: lighten(accent, 6),
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
    border: "#1e293b",
    input: "#1e293b",
    ring: darkPrimary,
    sidebarBackground: "#0f172a",
    sidebarForeground: "#cbd5e1",
    sidebarPrimary: darkPrimary,
    sidebarAccent: "#1e293b",
    sidebarBorder: "#1e293b",
    sidebarRing: darkPrimary,
    chart1: darkPrimary,
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
