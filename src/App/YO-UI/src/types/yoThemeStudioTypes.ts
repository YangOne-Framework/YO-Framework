/**
 * YOTheme Studio — three-level token architecture and studio domain types
 * (blueprint §6, §7, §101).
 *
 * Storage/authoring model is StudioThemeConfig (version 2). The legacy flat
 * ParsedThemeConfig remains the runtime view — see themeMigration.ts for the
 * bidirectional mapping that keeps every existing consumer working.
 */

import type {
  ComponentVariantConfig,
  FontConfig,
  LayoutDefinition,
  ParsedThemeConfig,
  TemplateDefinition,
  ThemeStructure,
} from './yoThemeTypes';

export type TokenType = 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'cubicBezier' | 'shadow' | 'string';

/** A single design token. value may be a raw value or a "{token.path}" reference. */
export interface StudioToken {
  value?: string;
  /** Explicit reference target without braces, e.g. "color.brand.primary" */
  ref?: string;
  /** Dark-appearance value (raw or "{ref}") */
  dark?: string;
  /** Dark-appearance reference target */
  darkRef?: string;
  type?: TokenType;
  /** Original flat-token key (e.g. "primary") — the compiler keeps emitting
   *  the matching legacy CSS variables so existing classes keep working. */
  legacyKey?: string;
  description?: string;
  /** true when the value comes from the parent theme rather than this draft */
  inherited?: boolean;
}

export type TokenDict = Record<string, StudioToken>;

export interface StudioAppearance {
  defaultMode: 'light' | 'dark';
  supportedModes: Array<'light' | 'dark'>;
  highContrast?: boolean;
  /** Theme favicon applied to document.head when the theme renders a page. */
  faviconUrl?: string | null;
}

export interface StudioScope {
  selector: string;
  overrides: TokenDict;
}

export interface StudioBreakpoint {
  minWidth: string;
  tokens: TokenDict;
}

export interface StudioBrand {
  brandKitId?: number | null;
  logoAssetId?: number | null;
  faviconAssetId?: number | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  primaryFont?: string;
  headingFont?: string;
}

/** Version 2 theme configuration — the studio authoring model. */
export interface StudioThemeConfig {
  version: 2;
  appearance: StudioAppearance;
  brand?: StudioBrand;
  tokens: {
    primitive: TokenDict;
    semantic: TokenDict;
    component: TokenDict;
  };
  typography: {
    fonts: Record<string, FontConfig>;
    fluid: NonNullable<ParsedThemeConfig['tokens']['fluid']>;
  };
  spacing: { scale: Record<string, string> };
  shape: {
    radius: Record<string, string>;
    focus: { width: string; color: string; offset: string };
  };
  elevation: { shadows: Record<string, string> };
  motion: { duration: string; easing: string; reduced?: boolean };
  /** Legacy component customization map (variants/style overrides per component) */
  components: Record<string, ComponentVariantConfig>;
  structure: ThemeStructure;
  layouts: Record<string, LayoutDefinition>;
  templates: Record<string, TemplateDefinition>;
  responsive: Record<string, StudioBreakpoint>;
  scopes: Record<string, StudioScope>;
  assets: Record<string, unknown>;
  accessibility: Record<string, unknown>;
  /** Unknown/legacy fields preserved verbatim (blueprint §3) */
  extensions: Record<string, unknown>;
  customCss?: string;
}

/* ── Lifecycle ── */

export type ThemeStatus = 'draft' | 'under_review' | 'approved' | 'published' | 'archived';

export const THEME_STATUS_LABELS: Record<ThemeStatus, string> = {
  draft: 'Draft',
  under_review: 'Under Review',
  approved: 'Approved',
  published: 'Published',
  archived: 'Archived',
};

/* ── DTOs mirroring the backend (Core/YangOne.Web/YOTheme/Studio) ── */

export interface StudioThemeRow {
  YOThemeId: number;
  YOThemeUniqueId: string;
  Name: string;
  Slug: string;
  Version?: string;
  Author?: string;
  Description?: string;
  Tags?: string;
  Config?: string;
  PublishedConfig?: string;
  CompiledCss?: string;
  PublishedCss?: string;
  ConfigHash?: string;
  PublishedConfigHash?: string;
  Status: ThemeStatus;
  IsDefault: boolean;
  IsPublished: boolean;
  IsActive: boolean;
  IsSystem: boolean;
  PublishedOn?: string;
  SchemaVersion: number;
  Thumbnail?: string;
  BrandKitId?: number | null;
  ParentYOThemeId?: number | null;
  ParentThemeName?: string;
  AddedOn?: string;
  UpdatedOn?: string;
}

export interface ThemeAssignment {
  ThemeAssignmentId: number;
  YOThemeId: number;
  YOThemeUniqueId?: string;
  ThemeName?: string;
  TargetType: string;
  TargetKey?: string;
  Priority: number;
  ActiveFrom?: string;
  ActiveTo?: string;
  IsDefault: boolean;
  IsActive: boolean;
}

export interface BrandKit {
  BrandKitId: number;
  Name: string;
  Description?: string;
  LogoAssetId?: number | null;
  CompactLogoAssetId?: number | null;
  DarkLogoAssetId?: number | null;
  LightLogoAssetId?: number | null;
  FaviconAssetId?: number | null;
  PrimaryColor?: string;
  SecondaryColor?: string;
  AccentColor?: string;
  PrimaryFont?: string;
  HeadingFont?: string;
  ConfigurationJson?: string;
}

export interface ThemeLayoutRow {
  ThemeLayoutId: number;
  YOThemeId: number;
  Name: string;
  LayoutType: string;
  ConfigurationJson?: string;
  PreviewImage?: string;
  IsDefault: boolean;
}

export interface ThemeTemplateRow {
  ThemeTemplateId: number;
  YOThemeId: number;
  ThemeLayoutId?: number | null;
  Name: string;
  TemplateType: string;
  ConfigurationJson?: string;
  PreviewImage?: string;
}

export interface ThemeScopeRow {
  ScopedStyleId: number;
  YOThemeId: number;
  Name: string;
  ScopeKey: string;
  Selector: string;
  OverrideJson?: string;
}

export interface ComponentRegistryRow {
  ComponentRegistryId: number;
  ComponentKey: string;
  DisplayName: string;
  Category?: string;
  SupportedVariantsJson?: string;
  SupportedSizesJson?: string;
  SupportedStatesJson?: string;
  SupportedSlotsJson?: string;
  RequiredTokensJson?: string;
  OptionalTokensJson?: string;
}

export interface ValidationItem {
  Type: string;
  Severity: 'error' | 'warning' | 'info';
  Section?: string;
  PropertyPath?: string;
  Message: string;
  SuggestedFix?: string;
}

export interface CompileResult {
  Success: boolean;
  Message: string;
  Css: string;
  VariablesCss: string;
  CriticalCss: string;
  ResolvedTokensJson?: string;
  SizeBytes: number;
  Validation: ValidationItem[];
}

export interface ThemeResolveResponse {
  YOThemeUniqueId: string;
  Name: string;
  Slug: string;
  Config?: string;
  CompiledCss?: string;
  Hash?: string;
  SchemaVersion: number;
  ResolvedVia?: string;
  ResolvedTargetType?: string;
  ResolvedTargetKey?: string;
}

export interface ThemeHealth {
  PrimitiveCount: number;
  SemanticCount: number;
  ComponentTokenCount: number;
  ErrorCount: number;
  WarningCount: number;
  DarkModeCoverage: number;
  ComponentCoverage: number;
  Score: number;
}

export interface AuditEntry {
  ThemeAuditLogId: number;
  Action: string;
  Section?: string;
  PropertyPath?: string;
  OldValue?: string;
  NewValue?: string;
  PerformedBy: number;
  PerformedOn: string;
  Remarks?: string;
}

export interface ThemeAssetRow {
  YOThemeAssetId: number;
  AssetType: string;
  AssetPath: string;
  AssetName?: string;
  MimeType?: string;
  AltText?: string;
  MetadataJson?: string;
}

export interface ThemeApproval {
  ThemeApprovalId: number;
  YOThemeId: number;
  ApprovalType: string;
  ReviewerId: number;
  Status: "pending" | "approved" | "rejected" | "changes_requested";
  Remarks?: string;
  ReviewedOn?: string;
  AddedOn: string;
  ThemeName?: string;
  YOThemeUniqueId?: string;
}

export interface ThemeComment {
  ThemeCommentId: number;
  YOThemeId: number;
  Section?: string;
  PropertyPath?: string;
  Comment: string;
  ParentCommentId?: number | null;
  AddedBy: number;
  AddedOn: string;
  IsResolved: boolean;
  ResolvedBy?: number | null;
  ResolvedOn?: string;
}

export interface ThemeSchedule {
  ThemeScheduleId: number;
  YOThemeId: number;
  ThemeAssignmentId?: number | null;
  StartDate: string;
  EndDate?: string | null;
  Status: "scheduled" | "active" | "completed" | "cancelled";
  AddedOn: string;
  ThemeName?: string;
  YOThemeUniqueId?: string;
  TargetType?: string;
  TargetKey?: string;
}

export interface ThemeScheduleConflict {
  ThemeScheduleId: number;
  ThemeName?: string;
  TargetType?: string;
  TargetKey?: string;
  StartDate: string;
  EndDate?: string | null;
  Reason: string;
}

export interface ThemePlugin {
  ThemePluginId: number;
  PluginKey: string;
  Name: string;
  Description?: string;
  ConfigurationSchema?: string;
  RegisteredComponentsJson?: string;
  RegisteredTokensJson?: string;
  IsEnabled: boolean;
  IsActive: boolean;
}

export interface ThemeReviewQueueItem {
  YOThemeUniqueId: string;
  Name: string;
  Slug: string;
  Status: ThemeStatus;
  UpdatedOn?: string;
  PendingApprovals: number;
  OpenComments: number;
}

export interface ThemeExperiment {
  ThemeExperimentId: number;
  Name: string;
  TargetType: string;
  TargetKey?: string;
  StartDate?: string;
  EndDate?: string;
  Status: "draft" | "running" | "stopped" | "completed";
  SuccessMetric?: string;
  ConfigurationJson?: string;
  AddedOn?: string;
}

export interface ThemeFixture {
  ThemeFixtureId: number;
  ApplicationKey: string;
  Name: string;
  Scenario: string;
  FixtureJson?: string;
  IsActive: boolean;
  AddedOn?: string;
}

export interface ThemeIntegration {
  ThemeIntegrationId: number;
  YOThemeId: number;
  IntegrationType: "figma" | "storybook" | "ci" | "ai" | "marketplace" | "analytics";
  ExternalReference?: string;
  ConfigurationJson?: string;
  LastSyncOn?: string;
  LastSyncStatus?: string;
  IsEnabled: boolean;
  AddedOn?: string;
  UpdatedOn?: string;
}

export interface ThemeAnalyticsBreakdown {
  Key: string;
  Count: number;
  Value: number;
}

export interface ThemeAnalyticsSummary {
  TotalEvents: number;
  TotalValue: number;
  ActiveExperiments: number;
  PublishedThemes: number;
  ByEvent: ThemeAnalyticsBreakdown[];
  ByVariant: ThemeAnalyticsBreakdown[];
}

export interface ThemePublishReadiness {
  Ready: boolean;
  ErrorCount: number;
  WarningCount: number;
  OpenComments: number;
  ApprovalCount: number;
  ActiveFixtureCount: number;
  Score: number;
  Blockers: string[];
  Warnings: string[];
}

/** Migration summary shown when a legacy theme opens in the studio (blueprint §14). */
export interface MigrationSummary {
  recognizedTokens: number;
  generatedPrimitives: string[];
  generatedSemanticMappings: string[];
  componentMappings: string[];
  unknownFieldsPreserved: string[];
  missingDarkModeValues: string[];
  accessibilityIssues: string[];
  requiresManualReview: boolean;
}
