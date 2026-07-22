export interface YOTheme {
  YOThemeId: number;
  YOThemeUniqueId: string;
  Name: string;
  Slug: string;
  Version: string;
  Author: string;
  Description: string;
  Tags: string;
  Screenshot: string;
  Config: string;  // JSON string of ParsedThemeConfig
  IsActive: boolean;
  IsSystem: boolean;
  ParentYOThemeId: number | null;
  PackagePath: string;
  PackageHash: string;
  OverrideCount: number;
  ParentThemeName: string;
  RowTotal: number;
}

export interface ParsedThemeConfig {
  tokens: ThemeTokens;
  components: Record<string, ComponentVariantConfig>;
  structure: ThemeStructure;
  layouts: Record<string, LayoutDefinition>;
  templates: Record<string, TemplateDefinition>;
  customizer?: CustomizerSchema;
  /** Custom CSS injected into the page when this theme is active */
  customCss?: string;
}

export interface ThemeTokens {
  colors: Record<string, { default: string; dark?: string }>;
  fonts: Record<string, FontConfig>;
  spacing: Record<string, string>;
  'border-radius': Record<string, string>;
  shadows: Record<string, string>;
  /** Global motion tokens — drive transition duration/easing across components */
  motion?: { duration?: string; easing?: string; reduced?: boolean };
  /** Global focus-ring standardization for ADA compliance */
  focus?: { width?: string; color?: string; offset?: string };
  /** Fluid modular scale for inherently responsive typography/spacing */
  fluid?: { base?: string; ratio?: number; min?: number; max?: number };
}

export interface FontConfig {
  family: string;
  source: 'google' | 'self-hosted';
  weights: number[];
}

export interface ComponentVariantConfig {
  variant: string;
  variants: Record<string, { classes: string; [key: string]: unknown }>;
  /** Style customization consumed by buildTokenCss to compile standard .yo-* classes */
  paddingX?: string;
  paddingY?: string;
  padding?: string;
  borderRadius?: string;
  shadow?: string;
  transition?: string;
  [key: string]: unknown;
}

export interface ThemeStructure {
  layoutType: string;
  layoutTypes: Record<string, { shell: string }>;
}

export interface LayoutDefinition {
  name: string;
  shell: string;
  zones: Record<string, { order: number; container?: string; width?: string }>;
  components?: Record<string, LayoutComponentRef>;
}

export interface LayoutComponentRef {
  type: string;
  config: Record<string, unknown>;
}

export interface TemplateDefinition {
  name: string;
  description?: string;
  layout: string;
  thumbnail?: string;
  zones: Record<string, string[]>;
  settings?: Record<string, unknown>;
}

export interface CustomizerSchema {
  controls: Record<string, Record<string, CustomizerControlDef>>;
}

export interface CustomizerControlDef {
  type: 'color' | 'font' | 'select' | 'text' | 'css';
  label: string;
  options?: Array<{ value: string; label: string }>;
}

export interface YOThemeOverride {
  YOThemeOverrideId: number;
  YOThemeId: number;
  KeyPath: string;
  Value: string;
}

export interface YOThemeSaveRequest {
  YOThemeUniqueId?: string;
  Name: string;
  Slug: string;
  Version: string;
  Author?: string;
  Description?: string;
  Tags?: string;
  Config?: string;
  IsSystem?: boolean;
  ParentYOThemeId?: number | null;
}

export interface YOThemeActivateRequest {
  YOThemeUniqueId: string;
}

export interface YOThemeDeleteRequest {
  YOThemeUniqueId: string;
  CascadeLayouts: boolean;
}

export interface YOThemeOverrideSaveRequest {
  YOThemeUniqueId: string;
  Overrides: Record<string, unknown>;
}

/**
 * Comprehensive export/import package format.
 * Mirrors "folder with all files" — config, assets, layouts, templates + integrity signature.
 */
/**
 * Comprehensive export/import package format.
 * Mirrors "folder with all files" — config, assets, layouts, templates + integrity signature.
 */
export interface YOThemePackage {
  manifestVersion: "1.0";
  exportedAt: string;
  signature: {
    hash: string;
    hashAlgorithm: "sha256";
  };
  meta: {
    name: string;
    slug: string;
    version: string;
    author: string;
    description: string;
    tags: string;
  };
  /** Full theme configuration */
  config: ParsedThemeConfig;
  /** Embedded assets keyed by identifier (screenshot, logo, etc.) */
  assets: Record<string, { data: string; mime: string; filename: string }>;
}

/** Generate SHA-256 hex hash of a string using the Web Crypto API */
export async function sha256Hex(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Build a complete YOThemePackage from a theme + config.
 * Excludes layouts/templates from this layer (they live in the page system).
 */
export async function buildThemePackage(
  theme: YOTheme,
  config: ParsedThemeConfig,
  assets?: Record<string, { data: string; mime: string; filename: string }>,
): Promise<YOThemePackage> {
  const payload: Omit<YOThemePackage, "signature"> = {
    manifestVersion: "1.0",
    exportedAt: new Date().toISOString(),
    meta: {
      name: theme.Name,
      slug: theme.Slug,
      version: theme.Version,
      author: theme.Author ?? "",
      description: theme.Description ?? "",
      tags: theme.Tags ?? "",
    },
    config,
    assets: assets ?? {},
  };
  const hash = await sha256Hex(JSON.stringify(payload));
  return { ...payload, signature: { hash, hashAlgorithm: "sha256" } };
}

/**
 * Verify package integrity by re-hashing and comparing signatures.
 */
export async function verifyThemePackage(pkg: YOThemePackage): Promise<boolean> {
  const { signature, ...rest } = pkg;
  const hash = await sha256Hex(JSON.stringify(rest));
  return hash === signature.hash;
}

/**
 * Block Style Engine value modes:
 * - "token": resolve value as a theme token name → emits rgb(var(--c-{value}))
 * - "raw":    emit value as-is (e.g. "16px", "#fff")
 * - "cssVar": emit value wrapped in var() (e.g. "my-var" → var(--my-var))
 */
export type StyleValueMode = "token" | "raw" | "cssVar";

export interface StyleValue {
  mode: StyleValueMode;
  value: string;
}

export type BlockStyleOverrides = Record<string, StyleValue>;
export type ComponentStyleSlots = Record<string, Record<string, StyleValue>>;
