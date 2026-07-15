import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import type {
  YOTheme,
  YOThemeOverride,
  YOThemeSaveRequest,
  YOThemeActivateRequest,
  YOThemeDeleteRequest,
  YOThemeOverrideSaveRequest,
} from "../../types/yoThemeTypes";

interface ThemeAssignment {
  EntityType: string;
  EntityId: number;
  EntityGUID: string;
  EntityName: string;
}

interface YOThemeExportData {
  Name: string;
  Slug: string;
  Version: string;
  Author: string;
  Description: string;
  Tags: string;
  Config: string;
}

export const yoThemeAPI = createApi({
  reducerPath: "yoThemeAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Theme", "ThemeOverride", "ThemeAssignment"],
  endpoints: (builder) => ({
    getThemeList: builder.query<YOTheme[], { offset?: number; limit?: number; search?: string; status?: string }>({
      query: ({ offset = 1, limit = 20, search = "", status = "all" }) => ({
        url: API.YOTHEME.LIST,
        method: "GET",
        params: { offset, limit, search, status },
      }),
      providesTags: ["Theme"],
      transformResponse: (res: any) => res?.Data ?? [],
    }),

    getTheme: builder.query<YOTheme, string>({
      query: (guid) => ({ url: API.YOTHEME.GET(guid), method: "GET" }),
      providesTags: (_result, _error, guid) => [{ type: "Theme", id: guid }],
      transformResponse: (res: any) => res?.Data ?? null,
    }),

    getActiveTheme: builder.query<YOTheme | null, void>({
      query: () => ({ url: API.YOTHEME.ACTIVE, method: "GET" }),
      providesTags: ["Theme"],
      transformResponse: (res: any) => res?.Data ?? null,
    }),

    saveTheme: builder.mutation<YOTheme, YOThemeSaveRequest>({
      query: (body) => ({
        url: API.YOTHEME.SAVE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Theme"],
    }),

    activateTheme: builder.mutation<void, YOThemeActivateRequest>({
      query: (body) => ({
        url: API.YOTHEME.ACTIVATE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Theme"],
    }),

    deleteTheme: builder.mutation<void, YOThemeDeleteRequest>({
      query: (body) => ({
        url: API.YOTHEME.DELETE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Theme"],
    }),

    getThemeOverrides: builder.query<YOThemeOverride[], number>({
      query: (themeId) => ({ url: API.YOTHEME.OVERRIDES(themeId), method: "GET" }),
      providesTags: (_result, _error, themeId) => [{ type: "ThemeOverride", id: themeId }],
      transformResponse: (res: any) => res?.Data ?? [],
    }),

    saveThemeOverrides: builder.mutation<void, YOThemeOverrideSaveRequest>({
      query: (body) => ({
        url: API.YOTHEME.OVERRIDES_SAVE,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Theme", "ThemeOverride"],
    }),

    clearThemeOverrides: builder.mutation<void, number>({
      query: (themeId) => ({
        url: API.YOTHEME.OVERRIDES_CLEAR(themeId),
        method: "POST",
      }),
      invalidatesTags: ["Theme", "ThemeOverride"],
    }),

    exportTheme: builder.query<YOThemeExportData, string>({
      query: (guid) => ({ url: API.YOTHEME.EXPORT(guid), method: "GET" }),
      transformResponse: (res: any) => res?.Data ?? null,
    }),

    importTheme: builder.mutation<YOTheme, any>({
      query: (body) => ({
        url: API.YOTHEME.IMPORT,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Theme"],
    }),

    getThemeAssignments: builder.query<ThemeAssignment[], number>({
      query: (themeId) => ({ url: API.YOTHEME.ASSIGNMENTS(themeId), method: "GET" }),
      providesTags: (_result, _error, themeId) => [{ type: "ThemeAssignment", id: themeId }],
      transformResponse: (res: any) => res?.Data ?? [],
    }),
  }),
});

export const {
  useGetThemeListQuery,
  useGetThemeQuery,
  useGetActiveThemeQuery,
  useSaveThemeMutation,
  useActivateThemeMutation,
  useDeleteThemeMutation,
  useGetThemeOverridesQuery,
  useSaveThemeOverridesMutation,
  useClearThemeOverridesMutation,
  useExportThemeQuery,
  useImportThemeMutation,
  useGetThemeAssignmentsQuery,
} = yoThemeAPI;
