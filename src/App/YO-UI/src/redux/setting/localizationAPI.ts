import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { ApiResponse, PaginatedResponse } from "../../types/common";
import {
    LocaleRegion,
    Country,
    LocalizationImportRequest,
    SetDefaultLocaleRequest,
    SetLanguageRequest,
    LocaleResource
} from "../../types/settingTypes";

export const localizationAPI = createApi({
    reducerPath: "localizationAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["LocaleRegion", "LocaleResource", "Country"],
    endpoints: (builder) => ({
        getRegions: builder.query<PaginatedResponse<LocaleRegion>, { pageNo?: number; rowsPerPage?: number; query?: string }>({
            query: ({ pageNo = 1, rowsPerPage = 10, query = "" }) => ({
                url: API.LOCALIZATION.REGION_ALL(pageNo, rowsPerPage, query),
                method: "GET",
            }),
            providesTags: ["LocaleRegion"],
        }),

        getRegion: builder.query<ApiResponse<LocaleRegion>, number>({
            query: (id) => ({
                url: API.LOCALIZATION.REGION_BY_ID(id),
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "LocaleRegion", id }],
        }),

        getCountries: builder.query<ApiResponse<Country[]>, void>({
            query: () => ({ url: API.LOCALIZATION.COUNTRY_ALL, method: "GET" }),
            providesTags: ["Country"],
        }),

        importLocalization: builder.mutation<ApiResponse<any>, LocalizationImportRequest>({
            query: ({ ImportFile }) => {
                const formData = new FormData();
                if (ImportFile) formData.append("ImportFile", ImportFile);
                return {
                    url: API.LOCALIZATION.IMPORT,
                    method: "POST",
                    body: formData,
                };
            },
            invalidatesTags: ["LocaleRegion", "LocaleResource"],
        }),

        createRegion: builder.mutation<ApiResponse<any>, Partial<LocaleRegion>>({
            query: (data) => ({
                url: API.LOCALIZATION.REGION_NEW,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["LocaleRegion"],
        }),

        updateRegion: builder.mutation<ApiResponse<any>, LocaleRegion>({
            query: (data) => ({
                url: API.LOCALIZATION.REGION_UPDATE,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["LocaleRegion"],
        }),

        getResources: builder.query<PaginatedResponse<LocaleResource>, { localRegionId: number; pageNo?: number; limit?: number; query?: string }>({
            query: ({ localRegionId, pageNo = 1, limit = 20, query = "" }) => ({
                url: API.LOCALIZATION.RESOURCE_ALL(localRegionId, pageNo, limit, query),
                method: "GET",
            }),
            transformResponse: (response: ApiResponse<any>) => {
                return {
                    Code: response.Code,
                    Message: response.Message,
                    Data: response.Data.Resources,
                    RowTotal: response.Data.Resources && response.Data.Resources.length > 0
                        ? response.Data.Resources[0].RowTotal
                        : response.Data.RowTotal,
                    Errors: response.Errors
                };
            },
            providesTags: ["LocaleResource"],
        }),

        exportLocalization: builder.query<Blob, { localRegionId: number }>({
            query: ({ localRegionId }) => ({
                url: API.LOCALIZATION.EXPORT(localRegionId),
                method: "GET",
                responseHandler: async (response) => await response.blob(),
            }),
        }),

        setDefaultLocale: builder.mutation<ApiResponse<any>, SetDefaultLocaleRequest>({
            query: (data) => ({
                url: API.LOCALIZATION.SET_DEFAULT,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["LocaleRegion", "LocaleResource"],
        }),

        saveLocaleResource: builder.mutation<ApiResponse<any>, LocaleResource>({
            query: (data) => ({
                url: API.LOCALIZATION.RESOURCE_SAVE,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["LocaleResource"],
        }),

        deleteRegion: builder.mutation<ApiResponse<any>, number>({
            query: (id) => ({
                url: API.LOCALIZATION.DELETE,
                method: "POST",
                body: { id }
            }),
            invalidatesTags: ["LocaleRegion", "LocaleResource"],
        }),

        setLanguage: builder.mutation<ApiResponse<any>, SetLanguageRequest>({
            query: (data) => ({
                url: API.LOCALIZATION.LANGUAGE,
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetRegionsQuery,
    useGetRegionQuery,
    useGetCountriesQuery,
    useImportLocalizationMutation,
    useCreateRegionMutation,
    useUpdateRegionMutation,
    useGetResourcesQuery,
    useExportLocalizationQuery,
    useLazyExportLocalizationQuery,
    useSetDefaultLocaleMutation,
    useSaveLocaleResourceMutation,
    useDeleteRegionMutation,
    useSetLanguageMutation,
} = localizationAPI;
