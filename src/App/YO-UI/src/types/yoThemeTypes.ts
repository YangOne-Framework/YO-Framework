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
