namespace YangOne.Web;

public interface IYOThemeStudioService
{
    /* ── Theme CRUD (blueprint §68) ── */
    Task<YOThemeStudioListResult<YOThemeListItem>> ListThemesAsync(int offset, int limit, string search, string status);
    Task<YOThemeResult> GetActiveThemeAsync();
    Task<YOThemeStudioResult> CreateThemeAsync(YOThemeSaveRequest request, string ipAddress = null);
    Task<YOThemeStudioResult> DeleteThemeAsync(string yOThemeGUID, bool cascadeLayouts);

    /* ── Config / lifecycle (blueprint §8, §18) ── */
    Task<YOThemeResult> GetConfigAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> SaveConfigAsync(YOThemeConfigSaveRequest request, string ipAddress = null);
    Task<YOThemeStudioResult> SetStatusAsync(YOThemeStatusRequest request, string ipAddress = null);
    Task<YOThemeStudioResult> PublishAsync(YOThemePublishRequest request, string ipAddress = null);
    Task<YOThemeStudioResult> SetDefaultAsync(string yOThemeGUID, string ipAddress = null);
    Task<YOThemeStudioResult> DuplicateAsync(YOThemeDuplicateRequest request);

    /* ── Compile / validate (blueprint §20, §84) ── */
    Task<YOThemeCompileResult> CompileAsync(YOThemeCompileRequest request);
    Task<YOThemeStudioListResult<YOThemeValidationEntry>> GetValidationAsync(string yOThemeGUID);

    /* ── Runtime resolution (blueprint §10, §21) ── */
    Task<YOThemeResolveResponse> ResolveAsync(string targetType, string targetKey, string route);
    Task<string> GetPublishedCssAsync(string targetType, string targetKey, string route, string themeGuid = null);

    /* ── Assignments (blueprint §10) ── */
    Task<YOThemeStudioListResult<YOThemeAssignmentEntry>> ListAssignmentsAsync(string yOThemeGUID = null);
    Task<YOThemeStudioResult> SaveAssignmentAsync(YOThemeAssignmentSaveRequest request);
    Task<YOThemeStudioResult> DeleteAssignmentAsync(long assignmentId);

    /* ── Brand kits (blueprint §32) ── */
    Task<YOThemeStudioListResult<YOBrandKit>> ListBrandKitsAsync();
    Task<YOThemeStudioResult> SaveBrandKitAsync(YOBrandKitSaveRequest request);
    Task<YOThemeStudioResult> DeleteBrandKitAsync(long brandKitId);

    /* ── Layouts / templates / scopes (blueprint §53, §54, §56) ── */
    Task<YOThemeStudioListResult<YOThemeLayoutEntry>> ListLayoutsAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> SaveLayoutAsync(YOThemeLayoutSaveRequest request);
    Task<YOThemeStudioResult> DeleteLayoutAsync(long layoutId);
    Task<YOThemeStudioListResult<YOThemeTemplateEntry>> ListTemplatesAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> SaveTemplateAsync(YOThemeTemplateSaveRequest request);
    Task<YOThemeStudioResult> DeleteTemplateAsync(long templateId);
    Task<YOThemeStudioListResult<YOThemeScopedStyleEntry>> ListScopesAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> SaveScopeAsync(YOThemeScopedStyleSaveRequest request);
    Task<YOThemeStudioResult> DeleteScopeAsync(long scopeId);

    /* ── Components (blueprint §23, §49) ── */
    Task<YOThemeStudioListResult<YOComponentRegistryEntry>> ListRegistryAsync();
    Task<YOThemeStudioListResult<YOThemeComponentEntry>> ListThemeComponentsAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> SaveThemeComponentAsync(YOThemeComponentSaveRequest request);

    /* ── Assets (blueprint §64) ── */
    Task<YOThemeStudioListResult<YOThemeAsset>> ListAssetsAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> SaveAssetAsync(YOThemeAssetSaveRequest request);
    Task<YOThemeStudioResult> DeleteAssetAsync(long assetId);

    /* ── Governance: approvals / comments (blueprint §80, §81) ── */
    Task<YOThemeStudioListResult<YOThemeReviewQueueItem>> ListReviewQueueAsync();
    Task<YOThemeStudioListResult<YOThemeApprovalEntry>> ListApprovalsAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> ReviewAsync(YOThemeApprovalSaveRequest request, long reviewerId, string ipAddress = null);
    Task<YOThemeStudioListResult<YOThemeCommentEntry>> ListCommentsAsync(string yOThemeGUID, bool includeResolved = false);
    Task<YOThemeStudioResult> SaveCommentAsync(YOThemeCommentSaveRequest request, long authorId);
    Task<YOThemeStudioResult> ResolveCommentAsync(long commentId, long resolvedBy);

    /* ── Scheduling (blueprint §86) ── */
    Task<YOThemeStudioListResult<YOThemeScheduleEntry>> ListSchedulesAsync(string yOThemeGUID = null);
    Task<YOThemeStudioResult> SaveScheduleAsync(YOThemeScheduleSaveRequest request);
    Task<YOThemeStudioResult> DeleteScheduleAsync(long scheduleId);
    Task<YOThemeStudioListResult<YOThemeScheduleConflict>> CheckScheduleConflictsAsync(YOThemeScheduleSaveRequest request);

    /* ── Plugins (blueprint §75) ── */
    Task<YOThemeStudioListResult<YOThemePluginEntry>> ListPluginsAsync();
    Task<YOThemeStudioResult> SetPluginEnabledAsync(long pluginId, bool enabled);

    /* ── Experiments / fixtures / integrations (blueprint §60, §74, §87) ── */
    Task<YOThemeStudioListResult<YOThemeExperimentEntry>> ListExperimentsAsync();
    Task<YOThemeStudioResult> SaveExperimentAsync(YOThemeExperimentSaveRequest request);
    Task<YOThemeStudioResult> SetExperimentStatusAsync(long experimentId, string status);
    Task<YOThemeStudioListResult<YOThemeFixtureEntry>> ListFixturesAsync(string applicationKey = null);
    Task<YOThemeStudioResult> SaveFixtureAsync(YOThemeFixtureSaveRequest request);
    Task<YOThemeStudioResult> DeleteFixtureAsync(long fixtureId);
    Task<YOThemeStudioListResult<YOThemeIntegrationEntry>> ListIntegrationsAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> SaveIntegrationAsync(YOThemeIntegrationSaveRequest request);
    Task<YOThemeStudioResult> DeleteIntegrationAsync(long integrationId);

    /* ── Bulk editing / analytics / readiness (blueprint §84, §90, §94) ── */
    Task<YOThemeStudioResult> BulkEditTokensAsync(YOThemeBulkTokenEditRequest request, string ipAddress = null);
    Task<YOThemeStudioResult> TrackAnalyticsAsync(YOThemeAnalyticsEventRequest request);
    Task<YOThemeAnalyticsSummary> GetAnalyticsAsync(string yOThemeGUID = null);
    Task<YOThemePublishReadiness> GetPublishReadinessAsync(string yOThemeGUID);

    /* ── CVD Simulation (blueprint §41) ── */
    Task<YOThemeStudioResult> RunCVDAnalysisAsync(string yOThemeGUID, string simulationType);

    /* ── Token Dependency Graph (blueprint §39) ── */
    Task<YOThemeStudioResult> GetTokenDependencyGraphAsync(string yOThemeGUID);

    /* ── Concurrent Editing (blueprint §82) ── */
    Task<YOThemeStudioResult> LockFieldAsync(string yOThemeGUID, string fieldPath, string userId);
    Task<YOThemeStudioResult> UnlockFieldAsync(string yOThemeGUID, string fieldPath, string userId);
    Task<YOThemeStudioListResult<YOThemeEditLock>> ListActiveLocksAsync(string yOThemeGUID);

    /* ── Roles & Permissions (blueprint §79) ── */
    Task<YOThemeStudioListResult<object>> ListRolesAsync(string yOThemeGUID);
    Task<YOThemeStudioResult> AssignRoleAsync(string yOThemeGUID, long userId, string role);

    /* ── Performance Budget (blueprint §85) ── */
    Task<YOThemeStudioResult> RecordPerformanceBudgetAsync(string yOThemeGUID, string metric, double value, string unit = "");
    Task<YOThemeStudioListResult<object>> GetPerformanceBudgetAsync(string yOThemeGUID);

    /* ── Documentation Generator (blueprint §76) ── */
    Task<YOThemeStudioResult> GenerateDocumentationAsync(string yOThemeGUID, string format);

    /* ── Complete Export Pipeline (blueprint §72) ── */
    Task<YOThemeStudioResult> ExportPlatformAsync(string yOThemeGUID, string platform);

    /* ── Bulk Editing (blueprint §97) ── */
    Task<YOThemeStudioResult> BulkReplaceTokensAsync(string yOThemeGUID, Dictionary<string, string> replacements, bool dryRun = true);

    /* ── Figma Live Sync Webhooks (blueprint §74) ── */
    Task<YOThemeStudioResult> ProcessFigmaWebhookAsync(long integrationId, string figmaFileKey, string payload);
    Task<YOThemeStudioResult> PushToFigmaAsync(string yOThemeGUID);

     /* ── Collab presence & activity ── */
     Task<YOThemeStudioResult> RecordCollaborationActivityAsync(string yOThemeGUID, string userId, string action, string fieldPath = null);

     /* ── Admin audit & health (blueprint §71, §75) ── */
     Task<YOThemeStudioListResult<YOThemeAuditEntry>> ListAuditAsync(string yOThemeGUID, int limit = 100);
     Task<YOThemeHealthResult> GetHealthAsync(string yOThemeGUID);

     /* ── Phase 6: AI, Multi-Channel, Localization (blueprint §90, §91, §92, §93, §95, §96) ── */
     Task<YOThemeStudioResult> AnalyzeUrlAsync(string yOThemeGUID, string url);
     Task<YOThemeStudioResult> ExtractImageStyleAsync(string yOThemeGUID, long assetId);
     Task<YOThemeStudioResult> ApplyContentContextRulesAsync(string yOThemeGUID, string contextJson);
     Task<YOThemeStudioResult> SetRtlSupportAsync(string yOThemeGUID, bool enabled);
     Task<YOThemeStudioResult> SetHighContrastSupportAsync(string yOThemeGUID, bool enabled);
     Task<YOThemeStudioResult> GeneratePrintCssAsync(string yOThemeGUID);
     Task<YOThemeStudioResult> GenerateEmailTemplateAsync(string yOThemeGUID);
     Task<YOThemeStudioResult> GeneratePdfGuideAsync(string yOThemeGUID);
     Task<YOThemeStudioResult> ValidateMarketplacePackageAsync(string packageJson);
 }
