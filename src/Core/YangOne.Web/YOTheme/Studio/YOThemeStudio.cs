using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web;

/* ================================================================== */
/*  YOTheme Studio — entities (blueprint §101) and request/response   */
/*  DTOs. Theme lifecycle core lives in procs; satellite config rows  */
/*  are accessed with parameterized Dapper queries.                    */
/* ================================================================== */

[Table("YOBrandKit")]
public class YOBrandKit
{
    [Key]
    public long BrandKitId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public long? LogoAssetId { get; set; }
    public long? CompactLogoAssetId { get; set; }
    public long? DarkLogoAssetId { get; set; }
    public long? LightLogoAssetId { get; set; }
    public long? FaviconAssetId { get; set; }
    public string PrimaryColor { get; set; }
    public string SecondaryColor { get; set; }
    public string AccentColor { get; set; }
    public string PrimaryFont { get; set; }
    public string HeadingFont { get; set; }
    public string ConfigurationJson { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public long UpdatedBy { get; set; }
}

[Table("YOThemeAssignment")]
public class YOThemeAssignmentEntry
{
    [Key]
    public long ThemeAssignmentId { get; set; }
    public long YOThemeId { get; set; }
    public string TargetType { get; set; }   // global | product | application | website | portal | pagegroup | route | feature | campaign
    public string TargetKey { get; set; }
    public int Priority { get; set; }
    public DateTime? ActiveFrom { get; set; }
    public DateTime? ActiveTo { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public long UpdatedBy { get; set; }

    /* joined display fields */
    [IgnoreAll]
    public string ThemeName { get; set; }
    [IgnoreAll]
    public string YOThemeUniqueId { get; set; }
}

[Table("YOComponentRegistry")]
public class YOComponentRegistryEntry
{
    [Key]
    public long ComponentRegistryId { get; set; }
    public string ComponentKey { get; set; }
    public string DisplayName { get; set; }
    public string Category { get; set; }
    public string SupportedVariantsJson { get; set; }
    public string SupportedSizesJson { get; set; }
    public string SupportedStatesJson { get; set; }
    public string SupportedSlotsJson { get; set; }
    public string RequiredTokensJson { get; set; }
    public string OptionalTokensJson { get; set; }
    public string PreviewRenderer { get; set; }
    public string FallbackStyleJson { get; set; }
    public string Documentation { get; set; }
    public bool IsActive { get; set; }
}

[Table("YOThemeComponent")]
public class YOThemeComponentEntry
{
    [Key]
    public long ThemeComponentId { get; set; }
    public long YOThemeId { get; set; }
    public string ComponentKey { get; set; }
    public string ConfigurationJson { get; set; }
    public bool IsConfigured { get; set; }
    public bool IsActive { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public long UpdatedBy { get; set; }
}

[Table("YOThemeLayout")]
public class YOThemeLayoutEntry
{
    [Key]
    public long ThemeLayoutId { get; set; }
    public long YOThemeId { get; set; }
    public string Name { get; set; }
    public string LayoutType { get; set; }
    public string ConfigurationJson { get; set; }
    public string PreviewImage { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public long UpdatedBy { get; set; }
}

[Table("YOThemeTemplate")]
public class YOThemeTemplateEntry
{
    [Key]
    public long ThemeTemplateId { get; set; }
    public long YOThemeId { get; set; }
    public long? ThemeLayoutId { get; set; }
    public string Name { get; set; }
    public string TemplateType { get; set; }
    public string ConfigurationJson { get; set; }
    public string PreviewImage { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public long UpdatedBy { get; set; }
}

[Table("YOThemeScopedStyle")]
public class YOThemeScopedStyleEntry
{
    [Key]
    public long ScopedStyleId { get; set; }
    public long YOThemeId { get; set; }
    public string Name { get; set; }
    public string ScopeKey { get; set; }
    public string Selector { get; set; }
    public string OverrideJson { get; set; }
    public bool IsActive { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public long UpdatedBy { get; set; }
}

[Table("YOThemeValidation")]
public class YOThemeValidationEntry
{
    [Key]
    public long ThemeValidationId { get; set; }
    public long YOThemeId { get; set; }
    public string ValidationType { get; set; }
    public string Severity { get; set; }   // error | warning | info
    public string Section { get; set; }
    public string PropertyPath { get; set; }
    public string Message { get; set; }
    public string SuggestedFix { get; set; }
    public bool IsResolved { get; set; }
    public DateTime ValidatedOn { get; set; }
}

[Table("YOThemeAuditLog")]
public class YOThemeAuditEntry
{
    [Key]
    public long ThemeAuditLogId { get; set; }
    public long? YOThemeId { get; set; }
    public string Action { get; set; }
    public string Section { get; set; }
    public string PropertyPath { get; set; }
    public string OldValue { get; set; }
    public string NewValue { get; set; }
    public long PerformedBy { get; set; }
    public DateTime PerformedOn { get; set; }
    public string IPAddress { get; set; }
    public string Remarks { get; set; }
}

[Table("YOThemeApproval")]
public class YOThemeApprovalEntry
{
    [Key]
    public long ThemeApprovalId { get; set; }
    public long YOThemeId { get; set; }
    public string ApprovalType { get; set; }   // brand | accessibility | technical
    public long ReviewerId { get; set; }
    public string Status { get; set; }         // pending | approved | rejected | changes_requested
    public string Remarks { get; set; }
    public DateTime? ReviewedOn { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }

    [IgnoreAll]
    public string ThemeName { get; set; }
    [IgnoreAll]
    public string YOThemeUniqueId { get; set; }
}

[Table("YOThemeComment")]
public class YOThemeCommentEntry
{
    [Key]
    public long ThemeCommentId { get; set; }
    public long YOThemeId { get; set; }
    public string Section { get; set; }
    public string PropertyPath { get; set; }
    public string Comment { get; set; }
    public long? ParentCommentId { get; set; }
    public long AddedBy { get; set; }
    public DateTime AddedOn { get; set; }
    public bool IsResolved { get; set; }
    public long? ResolvedBy { get; set; }
    public DateTime? ResolvedOn { get; set; }
}

[Table("YOThemeSchedule")]
public class YOThemeScheduleEntry
{
    [Key]
    public long ThemeScheduleId { get; set; }
    public long YOThemeId { get; set; }
    public long? ThemeAssignmentId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; }         // scheduled | active | completed | cancelled
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }

    [IgnoreAll]
    public string ThemeName { get; set; }
    [IgnoreAll]
    public string YOThemeUniqueId { get; set; }
    [IgnoreAll]
    public string TargetType { get; set; }
    [IgnoreAll]
    public string TargetKey { get; set; }
}

[Table("YOThemePlugin")]
public class YOThemePluginEntry
{
    [Key]
    public long ThemePluginId { get; set; }
    public string PluginKey { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string ConfigurationSchema { get; set; }
    public string RegisteredComponentsJson { get; set; }
    public string RegisteredTokensJson { get; set; }
    public bool IsEnabled { get; set; }
    public bool IsActive { get; set; }
}

[Table("YOThemeExperiment")]
public class YOThemeExperimentEntry
{
    [Key]
    public long ThemeExperimentId { get; set; }
    public string Name { get; set; }
    public string TargetType { get; set; }
    public string TargetKey { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; }
    public string SuccessMetric { get; set; }
    public string ConfigurationJson { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
}

[Table("YOThemeFixture")]
public class YOThemeFixtureEntry
{
    [Key]
    public long ThemeFixtureId { get; set; }
    public string ApplicationKey { get; set; }
    public string Name { get; set; }
    public string Scenario { get; set; }
    public string FixtureJson { get; set; }
    public bool IsActive { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
}

[Table("YOThemeIntegration")]
public class YOThemeIntegrationEntry
{
    [Key]
    public long ThemeIntegrationId { get; set; }
    public long YOThemeId { get; set; }
    public string IntegrationType { get; set; }
    public string ExternalReference { get; set; }
    public string ConfigurationJson { get; set; }
    public DateTime? LastSyncOn { get; set; }
    public string LastSyncStatus { get; set; }
    public bool IsEnabled { get; set; }
    public DateTime AddedOn { get; set; }
    public long AddedBy { get; set; }
    public DateTime? UpdatedOn { get; set; }
    public long UpdatedBy { get; set; }
}

[Table("YOThemeAnalyticsEvent")]
public class YOThemeAnalyticsEventEntry
{
    [Key]
    public long ThemeAnalyticsEventId { get; set; }
    public long? YOThemeId { get; set; }
    public long? ThemeExperimentId { get; set; }
    public string EventType { get; set; }
    public string VariantKey { get; set; }
    public string TargetType { get; set; }
    public string TargetKey { get; set; }
    public decimal EventValue { get; set; }
    public DateTime OccurredOn { get; set; }

    [IgnoreAll]
    public string ThemeName { get; set; }
}

/* ================================================================== */
/*  Request DTOs                                                       */
/* ================================================================== */

public class YOThemeConfigSaveRequest
{
    public string YOThemeUniqueId { get; set; }
    public string Config { get; set; }          // full theme config JSON (v2)
    public int SchemaVersion { get; set; } = 2;
    public bool PreserveStatus { get; set; }    // keep current lifecycle status (used during publish)
}

public class YOThemeStatusRequest
{
    public string YOThemeUniqueId { get; set; }
    public string Status { get; set; }          // draft | under_review | approved | archived
}

public class YOThemePublishRequest
{
    public string YOThemeUniqueId { get; set; }
    public string CompiledCss { get; set; }     // studio-compiled CSS (full fidelity)
    public string Config { get; set; }          // exact config being published — validated server-side
}

public class YOThemeCompileRequest
{
    public string YOThemeUniqueId { get; set; } // compile the stored draft
    public string Config { get; set; }          // …or an ad-hoc config payload
}

public class YOThemeValidateRequest
{
    public string YOThemeUniqueId { get; set; }
    public string Config { get; set; }
}

public class YOThemeAssignmentSaveRequest
{
    public long ThemeAssignmentId { get; set; }
    public string YOThemeUniqueId { get; set; }
    public string TargetType { get; set; }
    public string TargetKey { get; set; }
    public int Priority { get; set; }
    public DateTime? ActiveFrom { get; set; }
    public DateTime? ActiveTo { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
}

public class YOBrandKitSaveRequest
{
    public long BrandKitId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public long? LogoAssetId { get; set; }
    public long? CompactLogoAssetId { get; set; }
    public long? DarkLogoAssetId { get; set; }
    public long? LightLogoAssetId { get; set; }
    public long? FaviconAssetId { get; set; }
    public string PrimaryColor { get; set; }
    public string SecondaryColor { get; set; }
    public string AccentColor { get; set; }
    public string PrimaryFont { get; set; }
    public string HeadingFont { get; set; }
    public string ConfigurationJson { get; set; }
}

public class YOThemeLayoutSaveRequest
{
    public long ThemeLayoutId { get; set; }
    public string YOThemeUniqueId { get; set; }
    public string Name { get; set; }
    public string LayoutType { get; set; }
    public string ConfigurationJson { get; set; }
    public string PreviewImage { get; set; }
    public bool IsDefault { get; set; }
}

public class YOThemeTemplateSaveRequest
{
    public long ThemeTemplateId { get; set; }
    public string YOThemeUniqueId { get; set; }
    public long? ThemeLayoutId { get; set; }
    public string Name { get; set; }
    public string TemplateType { get; set; }
    public string ConfigurationJson { get; set; }
    public string PreviewImage { get; set; }
}

public class YOThemeScopedStyleSaveRequest
{
    public long ScopedStyleId { get; set; }
    public string YOThemeUniqueId { get; set; }
    public string Name { get; set; }
    public string ScopeKey { get; set; }
    public string Selector { get; set; }
    public string OverrideJson { get; set; }
}

public class YOThemeComponentSaveRequest
{
    public string YOThemeUniqueId { get; set; }
    public string ComponentKey { get; set; }
    public string ConfigurationJson { get; set; }
    public bool IsConfigured { get; set; } = true;
}

public class YOThemeDuplicateRequest
{
    public string YOThemeUniqueId { get; set; }
    public string Name { get; set; }
}

public class YOThemeAssetSaveRequest
{
    public string YOThemeUniqueId { get; set; }
    public string AssetType { get; set; }
    public string AssetPath { get; set; }
    public string AssetName { get; set; }
    public string MimeType { get; set; }
    public string AltText { get; set; }
    public string MetadataJson { get; set; }
}

public class YOThemeApprovalSaveRequest
{
    public string YOThemeUniqueId { get; set; }
    public string ApprovalType { get; set; } = "technical";
    public string Status { get; set; }         // approved | rejected | changes_requested
    public string Remarks { get; set; }
}

public class YOThemeCommentSaveRequest
{
    public string YOThemeUniqueId { get; set; }
    public string Section { get; set; }
    public string PropertyPath { get; set; }
    public string Comment { get; set; }
    public long? ParentCommentId { get; set; }
}

public class YOThemeScheduleSaveRequest
{
    public long ThemeScheduleId { get; set; }
    public string YOThemeUniqueId { get; set; }
    public long? ThemeAssignmentId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class YOThemeExperimentSaveRequest
{
    public long ThemeExperimentId { get; set; }
    public string Name { get; set; }
    public string TargetType { get; set; }
    public string TargetKey { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Status { get; set; } = "draft";
    public string SuccessMetric { get; set; }
    public string ConfigurationJson { get; set; }
}

public class YOThemeFixtureSaveRequest
{
    public long ThemeFixtureId { get; set; }
    public string ApplicationKey { get; set; }
    public string Name { get; set; }
    public string Scenario { get; set; }
    public string FixtureJson { get; set; }
    public bool IsActive { get; set; } = true;
}

public class YOThemeIntegrationSaveRequest
{
    public long ThemeIntegrationId { get; set; }
    public string YOThemeUniqueId { get; set; }
    public string IntegrationType { get; set; }
    public string ExternalReference { get; set; }
    public string ConfigurationJson { get; set; }
    public bool IsEnabled { get; set; } = true;
}

    public class YOThemeAnalyticsEventRequest
    {
        public string YOThemeUniqueId { get; set; }
        public long? ThemeExperimentId { get; set; }
        public string EventType { get; set; }
        public string VariantKey { get; set; }
        public string TargetType { get; set; }
        public string TargetKey { get; set; }
        public decimal EventValue { get; set; } = 1;
    }

    public class YOThemeBulkTokenEditRequest
    {
        public string YOThemeUniqueId { get; set; }
        public Dictionary<string, string> Values { get; set; } = new();
    }

    /// <summary>Concurrent editing lock (blueprint §82).</summary>
    public class YOThemeEditLock
    {
        public long EditLockId { get; set; }
        public long YOThemeId { get; set; }
        public string FieldPath { get; set; }
        public long LockedBy { get; set; }
        public DateTime LockedAt { get; set; }
        public string Token { get; set; }
        public string KeptValue { get; set; }
        public string AcceptedValue { get; set; }
    }

public class YOThemeCVDRequest
{
    public string YOThemeUniqueId { get; set; }
    public string SimulationType { get; set; }
}

public class YOThemeLockRequest
{
    public string YOThemeUniqueId { get; set; }
    public string FieldPath { get; set; }
    public string UserId { get; set; }
}

public class YOThemeRoleRequest
{
    public long UserId { get; set; }
    public string Role { get; set; }
}

public class YOThemePerformanceRequest
{
    public string Metric { get; set; }
    public double Value { get; set; }
    public string Unit { get; set; }
}

public class YOThemeDocRequest
{
    public string Format { get; set; }
}

public class YOThemeBulkReplaceRequest
{
    public Dictionary<string, string> Replacements { get; set; } = new();
    public bool DryRun { get; set; } = true;
}

public class YOThemeFigmaWebhookRequest
{
    public long IntegrationId { get; set; }
    public string FigmaFileKey { get; set; }
    public string Payload { get; set; }
}

/// <summary>Schedule conflict descriptor returned by conflict checks (§86).</summary>
    public class YOThemeScheduleConflict
    {
        public long ThemeScheduleId { get; set; }
        public string ThemeName { get; set; }
        public string TargetType { get; set; }
        public string TargetKey { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Reason { get; set; }
    }

    public class YOThemeReviewQueueItem
    {
        public string YOThemeUniqueId { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public string Status { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public int PendingApprovals { get; set; }
        public int OpenComments { get; set; }
    }

/* ================================================================== */
/*  Response DTOs                                                      */
/* ================================================================== */

public class YOThemeStudioResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public object Data { get; set; }
    public string Action { get; set; }
    public int RowTotal { get; set; }
}

public class YOThemeStudioListResult<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public List<T> Data { get; set; } = new();
}

public class YOThemeValidationItem
{
    public string Type { get; set; }            // schema | naming | reference | accessibility | component | css
    public string Severity { get; set; }        // error | warning | info
    public string Section { get; set; }
    public string PropertyPath { get; set; }
    public string Message { get; set; }
    public string SuggestedFix { get; set; }
}

public class YOThemeCompileResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public string Css { get; set; }             // token layer: variables + modes + scopes + responsive + custom css
    public string VariablesCss { get; set; }
    public string CriticalCss { get; set; }
    public string ResolvedTokensJson { get; set; }
    public int SizeBytes { get; set; }
    public List<YOThemeValidationItem> Validation { get; set; } = new();
}

/// <summary>Runtime resolution payload consumed by applications (blueprint §21).</summary>
public class YOThemeResolveResponse
{
    public string YOThemeUniqueId { get; set; }
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Config { get; set; }          // published config (falls back to draft config for legacy themes)
    public string CompiledCss { get; set; }
    public string Hash { get; set; }
    public int SchemaVersion { get; set; }
    public string ResolvedVia { get; set; }     // assignment | default | legacy
    public string ResolvedTargetType { get; set; }
    public string ResolvedTargetKey { get; set; }
}

/// <summary>Theme health summary for the studio dashboard (blueprint §62).</summary>
public class YOThemeHealthResult
{
    public int PrimitiveCount { get; set; }
    public int SemanticCount { get; set; }
    public int ComponentTokenCount { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public double DarkModeCoverage { get; set; }   // % of color primitives with a dark value
    public double ComponentCoverage { get; set; }  // % of registry components with theme configuration
    public int Score { get; set; }                 // 0-100 overall
}

public class YOThemeAnalyticsSummary
{
    public long TotalEvents { get; set; }
    public decimal TotalValue { get; set; }
    public int ActiveExperiments { get; set; }
    public int PublishedThemes { get; set; }
    public List<YOThemeAnalyticsBreakdown> ByEvent { get; set; } = new();
    public List<YOThemeAnalyticsBreakdown> ByVariant { get; set; } = new();
}

public class YOThemeAnalyticsBreakdown
{
    public string Key { get; set; }
    public long Count { get; set; }
    public decimal Value { get; set; }
}

public class YOThemePublishReadiness
{
    public bool Ready { get; set; }
    public int ErrorCount { get; set; }
    public int WarningCount { get; set; }
    public int OpenComments { get; set; }
    public int ApprovalCount { get; set; }
    public int ActiveFixtureCount { get; set; }
    public int Score { get; set; }
    public List<string> Blockers { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}

public class YOThemeUrlAnalysisRequest
{
    public string YOThemeGUID { get; set; }
    public string Url { get; set; }
}

public class YOThemeImageStyleRequest
{
    public string YOThemeGUID { get; set; }
    public long AssetId { get; set; }
}

public class YOThemeContentContextRequest
{
    public string YOThemeGUID { get; set; }
    public string ContextJson { get; set; }
}

public class YOThemeRtlRequest
{
    public string YOThemeGUID { get; set; }
    public bool Enabled { get; set; }
}

public class YOThemeHighContrastRequest
{
    public string YOThemeGUID { get; set; }
    public bool Enabled { get; set; }
}

public class YOThemeMarketplaceValidationRequest
{
    public string PackageJson { get; set; }
}

public class YOThemeMarketplaceValidationResult
{
    public bool Valid { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<string> Warnings { get; set; } = new();
}
