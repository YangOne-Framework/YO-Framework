import type React from 'react';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type PageStatus = 'draft' | 'published' | 'archived';
export type FieldType = 'text' | 'textarea' | 'richtext' | 'number' | 'select' | 'color' | 'boolean' | 'image' | 'url';

export interface SelectOption { label: string; value: string; }

export interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  helpText?: string;
  required?: boolean;
  min?: number;
  max?: number;
  options?: SelectOption[];
  defaultValue?: unknown;
  placeholder?: string;
}

export interface YoComponentState {
  hover?: Record<string, string>;
  focus?: Record<string, string>;
  active?: Record<string, string>;
  disabled?: Record<string, string>;
}

export interface ComponentBreakpointOverrides {
  desktop?: Record<string, string>;
  tablet?: Record<string, string>;
  mobile?: Record<string, string>;
}

export interface ComponentPropSchema {
  key: string;
  label: string;
  type: FieldType | 'color' | 'select';
  required?: boolean;
  defaultValue?: unknown;
  options?: SelectOption[];
  min?: number;
  max?: number;
  placeholder?: string;
  helpText?: string;
}

export interface StyleSlotDefinition {
  slot: string;
  label: string;
  cssProperties: string[];
  defaultStyle?: Record<string, string>;
  allowedUnits?: string[];
}

export interface YoComponentDefinition {
  type: string;
  label: string;
  group: 'Basic' | 'Marketing' | 'Media' | 'Data' | 'Layout';
  description: string;
  previewImage?: string;
  defaultConfig: Record<string, unknown>;
  defaultStyle: YoComponentStyle;
  defaultAnimation?: YoAnimationConfig;
  configSchema: ConfigField[];
  renderer: (props: YoRendererProps) => React.ReactElement;
  /** Blueprint: style slots for per-part styling (root, container, title, body, etc.) */
  styleSlots?: StyleSlotDefinition[];
  /** Blueprint: interactive states with overridable CSS properties */
  states?: YoComponentState;
  /** Blueprint: responsive breakpoint style overrides */
  breakpoints?: ComponentBreakpointOverrides;
  /** Blueprint: structured prop schema for type-safe config editing */
  props?: ComponentPropSchema[];
}

export interface YoRendererProps {
  config: Record<string, unknown>;
  style: YoComponentStyle;
  isEditing?: boolean;
}

export interface YoComponentStyle {
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface YoAnimationConfig {
  presetId: string;
  trigger: 'onLoad' | 'onView' | 'onHover';
  duration: number;
  delay: number;
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  initial: Record<string, unknown>;
  animate: Record<string, unknown>;
}

export interface YoComponentInstance {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  style: YoComponentStyle;
  animation?: YoAnimationConfig;
  visibility: { desktop: boolean; tablet: boolean; mobile: boolean; };
  locked: boolean;
}

export interface YoColumn {
  id: string;
  title: string;
  span: { desktop: number; tablet: number; mobile: number; };
  components: string[];
}

export interface YoSection {
  id: string;
  name: string;
  layoutPresetId: string;
  collapsed?: boolean;
  settings: {
    layoutMode: 'boxed' | 'fluid';
    fullWidth: boolean;
    paddingY: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    backgroundColor?: string;
    backgroundImage?: string;
    className?: string;
    /** Per-region max-width override (Layout Builder regions) */
    maxWidth?: string;
    /** Per-region theme style overrides (reflex system) */
    styleOverrides?: string;
  };
  columns: YoColumn[];
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage?: string;
}

export interface MasterLayoutConfig {
  brandName: string;
  navItems: string;
  ctaLabel: string;
  ctaUrl: string;
  footerText: string;
  headerStyle: 'clean' | 'glass' | 'dark';
  containerMode: 'boxed' | 'fluid';
}

export interface YoPage {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  masterLayoutId: string | null;
  masterLayoutConfig: MasterLayoutConfig;
  masterLayout?: MasterLayoutDefinition | null;
  seo: SeoSettings;
  settings: {
    containerMode: 'boxed' | 'fluid';
    backgroundColor?: string;
    customCss?: string;
  };
  sections: YoSection[];
  components: Record<string, YoComponentInstance>;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  templateType?: string;
  themeConfig?: unknown | null;
  /** Server-compiled theme CSS delivered by the public page API (published snapshot). */
  themeCompiledCss?: string | null;
}

export interface YoPageVersion {
  id: string;
  pageId: string;
  version: number;
  type: 'draft' | 'published' | 'snapshot';
  page: YoPage;
  createdAt: string;
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  columns: Array<{ desktop: number; tablet: number; mobile: number }>;
}

export interface LayoutZoneMap {
  header: string[];
  sidebar: string[];
  footer: string[];
}

export interface MasterLayoutDefinition {
  id: string;
  name: string;
  description: string;
  hasHeader: boolean;
  hasFooter: boolean;
  sidebar: 'none' | 'left' | 'right';
  isSystem?: boolean;
  /** Component IDs grouped by zone */
  zones?: LayoutZoneMap;
  /** Flat list of all component IDs (legacy) */
  componentIds?: string[];
  /** Component instances for all layout zones */
  components?: Record<string, YoComponentInstance>;
  /** Display config used by legacy render */
  brandName?: string;
  navItems?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerText?: string;
  headerStyle?: 'clean' | 'glass' | 'dark';
  containerMode?: 'boxed' | 'fluid';
}

export interface ValidationIssue {
  id: string;
  level: 'error' | 'warning';
  message: string;
  target: 'page' | 'section' | 'component';
  targetId?: string;
}