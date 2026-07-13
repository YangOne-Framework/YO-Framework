import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

import { CspConfig, ApiConfig, AppBasicSecurity, FileConfig, WebSetting, OptimizationConfig, CacheInfo, CacheInfoResponse, CacheProvidersResponse, SwitchProviderRequest, SwitchProviderResponse } from "../../types/settingTypes";
import { ApiResponse } from "../../types/common";

export const settingAPI = createApi({
    reducerPath: "settingAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["Setting", "CSP", "ApiConfig", "Optimization", "FileConfig", "BasicSecurity"],
    endpoints: (builder) => ({
        getWebSetting: builder.query<ApiResponse<WebSetting>, void>({
            query: () => ({ url: API.SETTING.WEB, method: "GET" }),
            providesTags: ["Setting"],
        }),

        saveWebSetting: builder.mutation<ApiResponse<any>, WebSetting>({
            query: (data) => {
                const formData = new FormData();
                Object.entries(data ?? {}).forEach(([k, v]) => {
                    if (v === undefined || v === null) return;
                    if (v instanceof File) formData.append(k, v);
                    else formData.append(k, String(v));
                });
                return {
                    url: API.SETTING.WEB_SAVE,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["Setting"],
        }),

        restartApp: builder.mutation<any, void>({
            query: () => ({
                url: API.SETTING.APP_RESTART,
                method: "POST",
            }),
        }),

        getCspConfig: builder.query<ApiResponse<CspConfig>, void>({
            query: () => ({ url: API.SETTING.CSP, method: "GET" }),
            providesTags: ["CSP"],
        }),
        saveCspConfig: builder.mutation<ApiResponse<any>, CspConfig>({
            query: (data) => ({ url: API.SETTING.CSP_SAVE, method: "POST", body: data }),
            invalidatesTags: ["CSP"],
        }),

        getApiConfig: builder.query<ApiResponse<ApiConfig>, void>({
            query: () => ({ url: API.SETTING.API, method: "GET" }),
            providesTags: ["ApiConfig"],
        }),
        saveApiConfig: builder.mutation<ApiResponse<any>, ApiConfig>({
            query: (data) => ({ url: API.SETTING.API_SAVE, method: "POST", body: data }),
            invalidatesTags: ["ApiConfig"],
        }),

        getOptimizationConfig: builder.query<ApiResponse<OptimizationConfig>, void>({
            query: () => ({ url: API.SETTING.OPTIMIZATION, method: "GET" }),
            providesTags: ["Optimization"],
        }),
        saveOptimizationConfig: builder.mutation<ApiResponse<any>, OptimizationConfig>({
            query: (data) => ({ url: API.SETTING.OPTIMIZATION_SAVE, method: "POST", body: data }),
            invalidatesTags: ["Optimization"],
        }),
        getCacheInfo: builder.query<ApiResponse<CacheInfo>, void>({
            query: () => ({ url: API.OPTIMIZATION.CACHE_INFO, method: "GET" }),
            providesTags: ["Optimization"],
        }),
        clearCache: builder.mutation<ApiResponse<any>, void>({
            query: () => ({ url: API.OPTIMIZATION.CACHE_CLEAR, method: "POST" }),
            invalidatesTags: ["Optimization"],
        }),
        incrementVersion: builder.mutation<ApiResponse<{ Version: string }>, void>({
            query: () => ({ url: API.OPTIMIZATION.VERSION_INCREMENT, method: "POST" }),
            invalidatesTags: ["Optimization"],
        }),
        rebuildBundles: builder.mutation<ApiResponse<{ Version: string }>, void>({
            query: () => ({ url: API.OPTIMIZATION.REBUILD, method: "POST" }),
            invalidatesTags: ["Optimization"],
        }),

        getFileConfig: builder.query<ApiResponse<FileConfig>, void>({
            query: () => ({ url: API.SETTING.FILE, method: "GET" }),
            providesTags: ["FileConfig"],
        }),
        saveFileConfig: builder.mutation<ApiResponse<any>, FileConfig>({
            query: (data) => ({ url: API.SETTING.FILE_SAVE, method: "POST", body: data }),
            invalidatesTags: ["FileConfig"],
        }),

        getBasicSecurityConfig: builder.query<ApiResponse<AppBasicSecurity>, void>({
            query: () => ({ url: API.SETTING.BASIC, method: "GET" }),
            providesTags: ["BasicSecurity"],
        }),
        saveBasicSecurityConfig: builder.mutation<ApiResponse<any>, AppBasicSecurity>({
            query: (data) => ({ url: API.SETTING.BASIC_SAVE, method: "POST", body: data }),
            invalidatesTags: ["BasicSecurity"],
        }),

        getCacheInfoList: builder.query<ApiResponse<CacheInfoResponse>, void>({
            query: () => ({ url: API.CACHE.INFO, method: "GET" }),
            providesTags: ["Setting"],
        }),
        flushCache: builder.mutation<ApiResponse<any>, void>({
            query: () => ({ url: API.CACHE.FLUSH, method: "POST" }),
            invalidatesTags: ["Setting"],
        }),
        refreshCacheKey: builder.mutation<ApiResponse<any>, string>({
            query: (key) => ({ url: API.CACHE.REFRESH(key), method: "POST" }),
            invalidatesTags: ["Setting"],
        }),
        getCacheProviders: builder.query<ApiResponse<CacheProvidersResponse>, void>({
            query: () => ({ url: API.CACHE.PROVIDERS, method: "GET" }),
            providesTags: ["Setting"],
        }),
        switchCacheProvider: builder.mutation<ApiResponse<SwitchProviderResponse>, SwitchProviderRequest>({
            query: (data) => ({ url: API.CACHE.SWITCH_PROVIDER, method: "POST", body: data }),
            invalidatesTags: ["Setting"],
        }),
        restartCacheApp: builder.mutation<ApiResponse<any>, void>({
            query: () => ({ url: API.CACHE.RESTART, method: "POST" }),
        }),
    }),
});

export const {
    useGetWebSettingQuery,
    useSaveWebSettingMutation,
    useRestartAppMutation,
    useGetCspConfigQuery,
    useSaveCspConfigMutation,
    useGetApiConfigQuery,
    useSaveApiConfigMutation,
    useGetOptimizationConfigQuery,
    useSaveOptimizationConfigMutation,
    useGetCacheInfoQuery,
    useClearCacheMutation,
    useIncrementVersionMutation,
    useRebuildBundlesMutation,
    useGetFileConfigQuery,
    useSaveFileConfigMutation,
    useGetBasicSecurityConfigQuery,
    useSaveBasicSecurityConfigMutation,
    useGetCacheInfoListQuery,
    useFlushCacheMutation,
    useRefreshCacheKeyMutation,
    useGetCacheProvidersQuery,
    useSwitchCacheProviderMutation,
    useRestartCacheAppMutation,
} = settingAPI;
