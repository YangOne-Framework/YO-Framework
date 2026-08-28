import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import type { ApiResponse } from "../../types/common";
import { API } from "../../config/apiUrls";
import type { YOTheme, YOThemeSaveRequest, YOThemeDeleteRequest } from "../../types/yoThemeTypes";
import type { ParsedThemeConfig } from "../../types/yoThemeTypes";
import type {
  AuditEntry,
  BrandKit,
  CompileResult,
  ComponentRegistryRow,
  StudioThemeRow,
  ThemeApproval,
  ThemeAssetRow,
  ThemeAssignment,
  ThemeComment,
  ThemeExperiment,
  ThemeFixture,
  ThemeHealth,
  ThemeLayoutRow,
  ThemeAnalyticsSummary,
  ThemeIntegration,
  ThemePlugin,
  ThemePublishReadiness,
  ThemeResolveResponse,
  ThemeReviewQueueItem,
  ThemeSchedule,
  ThemeScheduleConflict,
  ThemeScopeRow,
  ThemeStatus,
  ThemeTemplateRow,
  ValidationItem,
} from "../../types/yoThemeStudioTypes";

export interface StudioConfigPayload {
  row: StudioThemeRow | null;
  config: ParsedThemeConfig | Record<string, unknown> | null;
  /** Raw stored config JSON (v2 authoring model after migration) */
  rawConfig: Record<string, unknown> | null;
}

const unwrap = <T>(r: ApiResponse<T> | undefined): T => r?.Data as T;

export const themeStudioAPI = createApi({
  reducerPath: "themeStudioAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    "StudioTheme",
    "Assignments",
    "BrandKits",
    "ThemeLayouts",
    "ThemeTemplates",
    "ThemeScopes",
    "Registry",
    "ThemeComponents",
    "Audit",
    "Health",
  ],
  endpoints: (build) => ({
    /* ── theme CRUD (blueprint §68) ── */
    getStudioThemes: build.query<
      YOTheme[],
      { offset?: number; limit?: number; search?: string; status?: string }
    >({
      query: (params) => ({
        ...{ url: API.YOTHEME_STUDIO.THEMES },
        params: { offset: params.offset ?? 1, limit: params.limit ?? 20, search: params.search ?? "", status: params.status ?? "all" },
      }),
      transformResponse: (response: ApiResponse<YOTheme[]>) => unwrap(response) ?? [],
      providesTags: ["StudioTheme"],
    }),
    getStudioTheme: build.query<YOTheme | null, string>({
      query: (guid) => ({ url: API.YOTHEME_STUDIO.THEME(guid) }),
      transformResponse: (response: ApiResponse<YOTheme>) => unwrap(response) ?? null,
      providesTags: (_r, _e, guid) => [{ type: "StudioTheme", id: guid }],
    }),
    getActiveStudioTheme: build.query<YOTheme | null, void>({
      query: () => ({ url: API.YOTHEME_STUDIO.THEMES_ACTIVE }),
      transformResponse: (response: ApiResponse<YOTheme>) => unwrap(response) ?? null,
      providesTags: ["StudioTheme"],
    }),
    /* Portable ZIP package (theme.json + assets/**) — binary download. */
    exportThemeZip: build.mutation<Blob, string>({
      query: (guid) => ({
        url: API.YOTHEME_STUDIO.THEME_PACKAGE(guid),
        responseHandler: (response: any) => response.blob(),
      }),
    }),
    importThemeZip: build.mutation<
      ApiResponse<{ YOThemeUniqueId?: string; InstalledFiles?: number; Warnings?: string[] }>,
      File
    >({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: API.YOTHEME_STUDIO.IMPORT_ZIP, method: "POST", body: formData };
      },
      invalidatesTags: ["StudioTheme"],
    }),
    createStudioTheme: build.mutation<{ YOThemeUniqueId: string }, YOThemeSaveRequest>({
      query: (body) => ({
        ...{ url: API.YOTHEME_STUDIO.THEMES },
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<{ YOThemeUniqueId: string }>) => unwrap(response),
      invalidatesTags: ["StudioTheme"],
    }),
    deleteStudioTheme: build.mutation<void, YOThemeDeleteRequest>({
      query: ({ YOThemeUniqueId, CascadeLayouts }) => ({
        ...{ url: API.YOTHEME_STUDIO.THEME_DELETE(YOThemeUniqueId) },
        method: "DELETE",
        params: { cascadeLayouts: CascadeLayouts ?? false },
      }),
      invalidatesTags: ["StudioTheme"],
    }),

    /* ── config / lifecycle ── */
    getStudioConfig: build.query<StudioConfigPayload, string>({
      query: (guid) => ({ url: API.YOTHEME_STUDIO.CONFIG(guid) }),
      transformResponse: (response: ApiResponse<StudioThemeRow>): StudioConfigPayload => {
        const row = unwrap(response) ?? null;
        let rawConfig: Record<string, unknown> | null = null;
        if (row?.Config) {
          try {
            rawConfig = JSON.parse(row.Config);
          } catch {
            rawConfig = null;
          }
        }
        return { row, config: rawConfig as StudioConfigPayload["config"], rawConfig };
      },
      providesTags: (_r, _e, guid) => [{ type: "StudioTheme", id: guid }],
    }),
    saveStudioConfig: build.mutation<
      ApiResponse<{ YOThemeId: number; Status: ThemeStatus }>,
      { guid: string; config: Record<string, unknown>; schemaVersion?: number }
    >({
      query: ({ guid, config, schemaVersion }) => ({
        ...{ url: API.YOTHEME_STUDIO.CONFIG(guid) },
        method: "PUT",
        body: { YOThemeUniqueId: guid, Config: JSON.stringify(config), SchemaVersion: schemaVersion ?? 2 },
      }),
      invalidatesTags: (_r, _e, { guid }) => [
        { type: "StudioTheme", id: guid },
        "Health",
      ],
    }),
    setThemeStatus: build.mutation<
      ApiResponse<{ YOThemeId: number; Status: ThemeStatus }>,
      { guid: string; status: ThemeStatus }
    >({
      query: ({ guid, status }) => ({
        ...{ url: API.YOTHEME_STUDIO.STATUS },
        method: "POST",
        body: { YOThemeUniqueId: guid, Status: status },
      }),
      invalidatesTags: ["StudioTheme"],
    }),
    publishTheme: build.mutation<
      ApiResponse<{ YOThemeId: number; Status: ThemeStatus }>,
      { guid: string; config: Record<string, unknown>; compiledCss?: string }
    >({
      query: ({ guid, config, compiledCss }) => ({
        ...{ url: API.YOTHEME_STUDIO.PUBLISH },
        method: "POST",
        body: {
          YOThemeUniqueId: guid,
          Config: config ? JSON.stringify(config) : null,
          CompiledCss: compiledCss ?? null,
        },
      }),
      invalidatesTags: ["StudioTheme", "Health"],
    }),
    setDefaultTheme: build.mutation<ApiResponse<object>, string>({
      query: (guid) => ({
        ...{ url: API.YOTHEME_STUDIO.SET_DEFAULT(guid) },
        method: "POST",
      }),
      invalidatesTags: ["StudioTheme"],
    }),
    duplicateTheme: build.mutation<
      ApiResponse<{ YOThemeUniqueId: string }>,
      { guid: string; name?: string }
    >({
      query: ({ guid, name }) => ({
        ...{ url: API.YOTHEME_STUDIO.DUPLICATE },
        method: "POST",
        body: { YOThemeUniqueId: guid, Name: name ?? null },
      }),
      invalidatesTags: ["StudioTheme"],
    }),

    /* ── compile / validate ── */
    compileTheme: build.mutation<CompileResult, { guid?: string; config?: Record<string, unknown> }>({
      query: ({ guid, config }) => ({
        ...{ url: API.YOTHEME_STUDIO.COMPILE },
        method: "POST",
        body: { YOThemeUniqueId: guid ?? null, Config: config ? JSON.stringify(config) : null },
      }),
      transformResponse: (response: ApiResponse<CompileResult>) => unwrap(response),
    }),
    validateTheme: build.mutation<ValidationItem[], { guid?: string; config?: Record<string, unknown> }>({
      query: ({ guid, config }) => ({
        ...{ url: API.YOTHEME_STUDIO.VALIDATE },
        method: "POST",
        body: { YOThemeUniqueId: guid ?? null, Config: config ? JSON.stringify(config) : null },
      }),
      transformResponse: (response: ApiResponse<ValidationItem[]>) => unwrap(response) ?? [],
    }),
    getValidation: build.query<ValidationItem[], string>({
      query: (guid) => ({ url: API.YOTHEME_STUDIO.VALIDATION(guid) }),
      transformResponse: (response: ApiResponse<ValidationItem[]>) => unwrap(response) ?? [],
      providesTags: (_r, _e, guid) => [{ type: "StudioTheme", id: `${guid}-validation` }],
    }),

    /* ── runtime resolution ── */
    resolveTheme: build.query<
      ThemeResolveResponse | null,
      { application?: string; targetType?: string; targetKey?: string; route?: string }
    >({
      query: (args) => ({
        ...{ url: API.YOTHEME_STUDIO.RESOLVE },
        params: args,
      }),
      transformResponse: (response: ApiResponse<ThemeResolveResponse>) => unwrap(response) ?? null,
    }),

    /* ── assignments ── */
    getAssignments: build.query<ThemeAssignment[], string | undefined>({
      query: (theme) => ({
        ...{ url: API.YOTHEME_STUDIO.ASSIGNMENTS },
        params: theme ? { theme } : {},
      }),
      transformResponse: (response: ApiResponse<ThemeAssignment[]>) => unwrap(response) ?? [],
      providesTags: ["Assignments"],
    }),
    saveAssignment: build.mutation<ApiResponse<object>, Partial<ThemeAssignment> & { YOThemeUniqueId: string }>({
      query: (body) => ({
        ...{ url: API.YOTHEME_STUDIO.ASSIGNMENTS },
        method: "POST",
        body,
      }),
      invalidatesTags: ["Assignments"],
    }),
    deleteAssignment: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({
        ...{ url: API.YOTHEME_STUDIO.ASSIGNMENT_DELETE(id) },
        method: "DELETE",
      }),
      invalidatesTags: ["Assignments"],
    }),

    /* ── brand kits ── */
    getBrandKits: build.query<BrandKit[], void>({
      query: () => ({ url: API.YOTHEME_STUDIO.BRAND_KITS }),
      transformResponse: (response: ApiResponse<BrandKit[]>) => unwrap(response) ?? [],
      providesTags: ["BrandKits"],
    }),
    saveBrandKit: build.mutation<ApiResponse<object>, Partial<BrandKit>>({
      query: (body) => ({
        ...{ url: API.YOTHEME_STUDIO.BRAND_KITS },
        method: "POST",
        body,
      }),
      invalidatesTags: ["BrandKits"],
    }),
    deleteBrandKit: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({
        ...{ url: API.YOTHEME_STUDIO.BRAND_KIT_DELETE(id) },
        method: "DELETE",
      }),
      invalidatesTags: ["BrandKits"],
    }),

    /* ── layouts / templates / scopes ── */
    getThemeLayouts: build.query<ThemeLayoutRow[], string>({
      query: (theme) => ({ ...{ url: API.YOTHEME_STUDIO.LAYOUTS }, params: { theme } }),
      transformResponse: (response: ApiResponse<ThemeLayoutRow[]>) => unwrap(response) ?? [],
      providesTags: ["ThemeLayouts"],
    }),
    saveThemeLayout: build.mutation<ApiResponse<object>, Partial<ThemeLayoutRow> & { YOThemeUniqueId: string }>({
      query: (body) => ({ ...{ url: API.YOTHEME_STUDIO.LAYOUTS }, method: "POST", body }),
      invalidatesTags: ["ThemeLayouts"],
    }),
    deleteThemeLayout: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({ ...{ url: API.YOTHEME_STUDIO.LAYOUT_DELETE(id) }, method: "DELETE" }),
      invalidatesTags: ["ThemeLayouts"],
    }),
    getThemeTemplates: build.query<ThemeTemplateRow[], string>({
      query: (theme) => ({ ...{ url: API.YOTHEME_STUDIO.TEMPLATES }, params: { theme } }),
      transformResponse: (response: ApiResponse<ThemeTemplateRow[]>) => unwrap(response) ?? [],
      providesTags: ["ThemeTemplates"],
    }),
    saveThemeTemplate: build.mutation<ApiResponse<object>, Partial<ThemeTemplateRow> & { YOThemeUniqueId: string }>({
      query: (body) => ({ ...{ url: API.YOTHEME_STUDIO.TEMPLATES }, method: "POST", body }),
      invalidatesTags: ["ThemeTemplates"],
    }),
    deleteThemeTemplate: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({ ...{ url: API.YOTHEME_STUDIO.TEMPLATE_DELETE(id) }, method: "DELETE" }),
      invalidatesTags: ["ThemeTemplates"],
    }),
    getThemeScopes: build.query<ThemeScopeRow[], string>({
      query: (theme) => ({ ...{ url: API.YOTHEME_STUDIO.SCOPES }, params: { theme } }),
      transformResponse: (response: ApiResponse<ThemeScopeRow[]>) => unwrap(response) ?? [],
      providesTags: ["ThemeScopes"],
    }),
    saveThemeScope: build.mutation<ApiResponse<object>, Partial<ThemeScopeRow> & { YOThemeUniqueId: string }>({
      query: (body) => ({ ...{ url: API.YOTHEME_STUDIO.SCOPES }, method: "POST", body }),
      invalidatesTags: ["ThemeScopes"],
    }),
    deleteThemeScope: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({ ...{ url: API.YOTHEME_STUDIO.SCOPE_DELETE(id) }, method: "DELETE" }),
      invalidatesTags: ["ThemeScopes"],
    }),

    /* ── components ── */
    getComponentRegistry: build.query<ComponentRegistryRow[], void>({
      query: () => ({ url: API.YOTHEME_STUDIO.REGISTRY }),
      transformResponse: (response: ApiResponse<ComponentRegistryRow[]>) => unwrap(response) ?? [],
      providesTags: ["Registry"],
    }),

    /* ── assets (blueprint §64) ── */
    getThemeAssets: build.query<ThemeAssetRow[], string>({
      query: (guid) => ({ url: API.YOTHEME_STUDIO.ASSETS, params: { theme: guid } }),
      transformResponse: (response: ApiResponse<ThemeAssetRow[]>) => unwrap(response) ?? [],
      providesTags: ["ThemeComponents"],
    }),
    addThemeAsset: build.mutation<
      ApiResponse<object>,
      { guid: string; assetType: string; assetPath: string; assetName?: string; mimeType?: string; altText?: string; metadataJson?: string }
    >({
      query: ({ guid, assetType, assetPath, assetName, mimeType, altText, metadataJson }) => ({
        url: API.YOTHEME_STUDIO.ASSETS,
        method: "POST",
        body: { YOThemeUniqueId: guid, AssetType: assetType, AssetPath: assetPath, AssetName: assetName, MimeType: mimeType, AltText: altText, MetadataJson: metadataJson },
      }),
      invalidatesTags: ["ThemeComponents"],
    }),
    deleteThemeAsset: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({ url: API.YOTHEME_STUDIO.ASSET_DELETE(id), method: "DELETE" }),
      invalidatesTags: ["ThemeComponents"],
    }),

    /* ── governance / scheduling / plugins ── */
    getReviewQueue: build.query<ThemeReviewQueueItem[], void>({
      query: () => ({ url: API.YOTHEME_STUDIO.REVIEW_QUEUE }),
      transformResponse: (response: ApiResponse<ThemeReviewQueueItem[]>) => unwrap(response) ?? [],
      providesTags: ["StudioTheme"],
    }),
    getApprovals: build.query<ThemeApproval[], string>({
      query: (theme) => ({ url: API.YOTHEME_STUDIO.APPROVALS, params: { theme } }),
      transformResponse: (response: ApiResponse<ThemeApproval[]>) => unwrap(response) ?? [],
      providesTags: (_r, _e, theme) => [{ type: "StudioTheme", id: `${theme}-approvals` }],
    }),
    reviewTheme: build.mutation<ApiResponse<object>, { YOThemeUniqueId: string; ApprovalType: string; Status: string; Remarks?: string }>({
      query: (body) => ({ url: API.YOTHEME_STUDIO.APPROVAL_REVIEW, method: "POST", body }),
      invalidatesTags: ["StudioTheme"],
    }),
    getThemeComments: build.query<ThemeComment[], { theme: string; includeResolved?: boolean }>({
      query: ({ theme, includeResolved }) => ({ url: API.YOTHEME_STUDIO.COMMENTS, params: { theme, includeResolved: includeResolved ?? false } }),
      transformResponse: (response: ApiResponse<ThemeComment[]>) => unwrap(response) ?? [],
      providesTags: (_r, _e, { theme }) => [{ type: "StudioTheme", id: `${theme}-comments` }],
    }),
    addThemeComment: build.mutation<ApiResponse<object>, { YOThemeUniqueId: string; Section?: string; PropertyPath?: string; Comment: string; ParentCommentId?: number | null }>({
      query: (body) => ({ url: API.YOTHEME_STUDIO.COMMENTS, method: "POST", body }),
      invalidatesTags: (_r, _e, { YOThemeUniqueId }) => [{ type: "StudioTheme", id: `${YOThemeUniqueId}-comments` }],
    }),
    resolveThemeComment: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({ url: API.YOTHEME_STUDIO.COMMENT_RESOLVE(id), method: "POST" }),
      invalidatesTags: ["StudioTheme"],
    }),
    getThemeSchedules: build.query<ThemeSchedule[], string | undefined>({
      query: (theme) => ({ url: API.YOTHEME_STUDIO.SCHEDULES, params: theme ? { theme } : {} }),
      transformResponse: (response: ApiResponse<ThemeSchedule[]>) => unwrap(response) ?? [],
      providesTags: ["StudioTheme"],
    }),
    saveThemeSchedule: build.mutation<ApiResponse<object>, { ThemeScheduleId?: number; YOThemeUniqueId: string; ThemeAssignmentId?: number | null; StartDate: string; EndDate?: string | null }>({
      query: (body) => ({ url: API.YOTHEME_STUDIO.SCHEDULES, method: "POST", body }),
      invalidatesTags: ["StudioTheme", "Health"],
    }),
    deleteThemeSchedule: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({ url: API.YOTHEME_STUDIO.SCHEDULE_DELETE(id), method: "DELETE" }),
      invalidatesTags: ["StudioTheme", "Health"],
    }),
    checkThemeScheduleConflicts: build.mutation<ThemeScheduleConflict[], { ThemeScheduleId?: number; YOThemeUniqueId: string; ThemeAssignmentId?: number | null; StartDate: string; EndDate?: string | null }>({
      query: (body) => ({ url: API.YOTHEME_STUDIO.SCHEDULE_CONFLICTS, method: "POST", body }),
      transformResponse: (response: ApiResponse<ThemeScheduleConflict[]>) => unwrap(response) ?? [],
    }),
    getThemePlugins: build.query<ThemePlugin[], void>({
      query: () => ({ url: API.YOTHEME_STUDIO.PLUGINS }),
      transformResponse: (response: ApiResponse<ThemePlugin[]>) => unwrap(response) ?? [],
      providesTags: ["StudioTheme"],
    }),
    toggleThemePlugin: build.mutation<ApiResponse<object>, { id: number; enabled: boolean }>({
      query: ({ id, enabled }) => ({ url: API.YOTHEME_STUDIO.PLUGIN_TOGGLE(id), method: "POST", params: { enabled } }),
      invalidatesTags: ["StudioTheme"],
    }),

    /* ── experiments / fixtures / integrations / operations ── */
    getThemeExperiments: build.query<ThemeExperiment[], void>({
      query: () => ({ url: API.YOTHEME_STUDIO.EXPERIMENTS }),
      transformResponse: (response: ApiResponse<ThemeExperiment[]>) => unwrap(response) ?? [],
      providesTags: ["StudioTheme"],
    }),
    saveThemeExperiment: build.mutation<ApiResponse<object>, Partial<ThemeExperiment> & { Name: string; TargetType: string }>({
      query: (body) => ({ url: API.YOTHEME_STUDIO.EXPERIMENTS, method: "POST", body }),
      invalidatesTags: ["StudioTheme"],
    }),
    setThemeExperimentStatus: build.mutation<ApiResponse<object>, { id: number; status: ThemeExperiment["Status"] }>({
      query: ({ id, status }) => ({ url: API.YOTHEME_STUDIO.EXPERIMENT_STATUS(id), method: "POST", params: { status } }),
      invalidatesTags: ["StudioTheme"],
    }),
    getThemeFixtures: build.query<ThemeFixture[], string | undefined>({
      query: (application) => ({ url: API.YOTHEME_STUDIO.FIXTURES, params: application ? { application } : {} }),
      transformResponse: (response: ApiResponse<ThemeFixture[]>) => unwrap(response) ?? [],
      providesTags: ["StudioTheme"],
    }),
    saveThemeFixture: build.mutation<ApiResponse<object>, Partial<ThemeFixture> & { ApplicationKey: string; Name: string; Scenario: string }>({
      query: (body) => ({ url: API.YOTHEME_STUDIO.FIXTURES, method: "POST", body }),
      invalidatesTags: ["StudioTheme"],
    }),
    deleteThemeFixture: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({ url: API.YOTHEME_STUDIO.FIXTURE_DELETE(id), method: "DELETE" }),
      invalidatesTags: ["StudioTheme"],
    }),
    getThemeIntegrations: build.query<ThemeIntegration[], string>({
      query: (theme) => ({ url: API.YOTHEME_STUDIO.INTEGRATIONS, params: { theme } }),
      transformResponse: (response: ApiResponse<ThemeIntegration[]>) => unwrap(response) ?? [],
      providesTags: ["StudioTheme"],
    }),
    saveThemeIntegration: build.mutation<ApiResponse<object>, Partial<ThemeIntegration> & { YOThemeUniqueId: string; IntegrationType: ThemeIntegration["IntegrationType"] }>({
      query: (body) => ({ url: API.YOTHEME_STUDIO.INTEGRATIONS, method: "POST", body }),
      invalidatesTags: ["StudioTheme"],
    }),
    deleteThemeIntegration: build.mutation<ApiResponse<object>, number>({
      query: (id) => ({ url: API.YOTHEME_STUDIO.INTEGRATION_DELETE(id), method: "DELETE" }),
      invalidatesTags: ["StudioTheme"],
    }),
    bulkEditThemeTokens: build.mutation<ApiResponse<object>, { YOThemeUniqueId: string; Values: Record<string, string> }>({
      query: (body) => ({ url: API.YOTHEME_STUDIO.BULK_TOKENS, method: "POST", body }),
      invalidatesTags: ["StudioTheme", "Health"],
    }),
    getThemeAnalytics: build.query<ThemeAnalyticsSummary, string | undefined>({
      query: (theme) => ({ url: API.YOTHEME_STUDIO.ANALYTICS, params: theme ? { theme } : {} }),
      transformResponse: (response: ApiResponse<ThemeAnalyticsSummary>) => unwrap(response),
      providesTags: ["StudioTheme"],
    }),
    getThemeReadiness: build.query<ThemePublishReadiness, string>({
      query: (guid) => ({ url: API.YOTHEME_STUDIO.READINESS(guid) }),
      transformResponse: (response: ApiResponse<ThemePublishReadiness>) => unwrap(response),
      providesTags: ["Health"],
    }),

    /* ── audit / health ── */
    getAudit: build.query<AuditEntry[], string>({
      query: (guid) => ({ url: API.YOTHEME_STUDIO.AUDIT(guid) }),
      transformResponse: (response: ApiResponse<AuditEntry[]>) => unwrap(response) ?? [],
      providesTags: ["Audit"],
    }),
    getThemeHealth: build.query<ThemeHealth, string>({
      query: (guid) => ({ url: API.YOTHEME_STUDIO.HEALTH(guid) }),
      transformResponse: (response: ApiResponse<ThemeHealth>) => unwrap(response),
      providesTags: ["Health"],
    }),
  }),
});

export const {
  useGetStudioThemesQuery,
  useGetStudioThemeQuery,
  useGetActiveStudioThemeQuery,
  useExportThemeZipMutation,
  useImportThemeZipMutation,
  useCreateStudioThemeMutation,
  useDeleteStudioThemeMutation,
  useGetStudioConfigQuery,
  useSaveStudioConfigMutation,
  useSetThemeStatusMutation,
  usePublishThemeMutation,
  useSetDefaultThemeMutation,
  useDuplicateThemeMutation,
  useCompileThemeMutation,
  useValidateThemeMutation,
  useGetValidationQuery,
  useResolveThemeQuery,
  useLazyResolveThemeQuery,
  useGetAssignmentsQuery,
  useSaveAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetBrandKitsQuery,
  useSaveBrandKitMutation,
  useDeleteBrandKitMutation,
  useGetThemeLayoutsQuery,
  useSaveThemeLayoutMutation,
  useDeleteThemeLayoutMutation,
  useGetThemeTemplatesQuery,
  useSaveThemeTemplateMutation,
  useDeleteThemeTemplateMutation,
  useGetThemeScopesQuery,
  useSaveThemeScopeMutation,
  useDeleteThemeScopeMutation,
  useGetComponentRegistryQuery,
  useGetThemeAssetsQuery,
  useAddThemeAssetMutation,
  useDeleteThemeAssetMutation,
  useGetReviewQueueQuery,
  useGetApprovalsQuery,
  useReviewThemeMutation,
  useGetThemeCommentsQuery,
  useAddThemeCommentMutation,
  useResolveThemeCommentMutation,
  useGetThemeSchedulesQuery,
  useSaveThemeScheduleMutation,
  useDeleteThemeScheduleMutation,
  useCheckThemeScheduleConflictsMutation,
  useGetThemePluginsQuery,
  useToggleThemePluginMutation,
  useGetThemeExperimentsQuery,
  useSaveThemeExperimentMutation,
  useSetThemeExperimentStatusMutation,
  useGetThemeFixturesQuery,
  useSaveThemeFixtureMutation,
  useDeleteThemeFixtureMutation,
  useGetThemeIntegrationsQuery,
  useSaveThemeIntegrationMutation,
  useDeleteThemeIntegrationMutation,
  useBulkEditThemeTokensMutation,
  useGetThemeAnalyticsQuery,
  useGetThemeReadinessQuery,
  useGetAuditQuery,
  useGetThemeHealthQuery,
} = themeStudioAPI;
