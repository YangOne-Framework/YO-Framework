import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

export const seoAPI = createApi({
    reducerPath: "seoAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["SEO"],
    endpoints: (builder) => ({
        getSeoAll: builder.query<any, { offset: number, limit: number, query: string }>({
            query: ({ offset, limit, query }) => ({
                url: API.SEO.ALL(offset, limit, query),
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        getSeoByUrl: builder.query<any, { url: string; type: string }>({
            query: ({ url, type }) => ({
                url: API.SEO.BY_URL(url, type),
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        getSeoMetaContents: builder.query<any, { url: string; type: string }>({
            query: ({ url, type }) => ({
                url: API.SEO.META(url, type),
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        getSeoById: builder.query<any, number>({
            query: (seoId) => ({
                url: API.SEO.BY_ID(seoId),
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        getSeoBySeoType: builder.query<any, { seoType: string; id: number }>({
            query: ({ seoType, id }) => ({
                url: API.SEO.BY_SEO_TYPE(seoType, id),
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        getSeoByProductId: builder.query<any, { productId: number; type: string }>({
            query: ({ productId, type }) => ({
                url: API.SEO.BY_PRODUCT(productId, type),
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        checkUrlExist: builder.mutation<any, { url: string; type: string }>({
            query: (body) => ({
                url: API.SEO.CHECK_URL,
                method: "POST",
                body,
            }),
        }),

        createSeo: builder.mutation<any, any>({
            query: (body) => ({
                url: API.SEO.NEW,
                method: "POST",
                body,
            }),
            invalidatesTags: ["SEO"],
        }),

        updateSeo: builder.mutation<any, any>({
            query: (body) => ({
                url: API.SEO.UPDATE,
                method: "POST",
                body,
            }),
            invalidatesTags: ["SEO"],
        }),

        deleteSeo: builder.mutation<any, number>({
            query: (seoId) => ({
                url: API.SEO.DELETE(seoId),
                method: "DELETE",
            }),
            invalidatesTags: ["SEO"],
        }),

        generateJsonLdForWebsite: builder.query<any, void>({
            query: () => ({
                url: API.SEO.JSONLD_WEBSITE,
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        generateJsonLdForPage: builder.query<any, void>({
            query: () => ({
                url: API.SEO.JSONLD_PAGE,
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        generateJsonLdForPageByProduct: builder.query<any, { page: string; productId: number; type: string }>({
            query: ({ page, productId, type }) => ({
                url: API.SEO.JSONLD_PAGE_BY_PRODUCT(page, productId, type),
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),

        generateMetaContents: builder.query<any, void>({
            query: () => ({
                url: API.SEO.META_GENERATE,
                method: "GET",
            }),
            providesTags: ["SEO"],
        }),
    }),
});

export const {
    useGetSeoAllQuery,
    useGetSeoByUrlQuery,
    useGetSeoMetaContentsQuery,
    useGetSeoByIdQuery,
    useGetSeoBySeoTypeQuery,
    useGetSeoByProductIdQuery,
    useCheckUrlExistMutation,
    useCreateSeoMutation,
    useUpdateSeoMutation,
    useDeleteSeoMutation,
    useGenerateJsonLdForWebsiteQuery,
    useGenerateJsonLdForPageQuery,
    useGenerateJsonLdForPageByProductQuery,
    useGenerateMetaContentsQuery,
} = seoAPI;
