import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

export const restrictionAPI = createApi({
    reducerPath: "restrictionAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["RestrictionKey", "Restriction", "AdminIP"],
    endpoints: (builder) => ({
        // === Restriction Keys ===
        getRestrictionKeys: builder.query<any, { offset: number; limit: number; query: string }>({
            query: ({ offset, limit, query }) => ({
                url: API.RESTRICTION.KEY_ALL,
                params: { offset, limit, query },
            }),
            providesTags: ["RestrictionKey"],
        }),
        getRestrictionKeyById: builder.query<any, number>({
            query: (id) => ({
                url: API.RESTRICTION.KEY_BY_ID(id),
            }),
            providesTags: (_result, _error, id) => [{ type: "RestrictionKey", id }],
        }),
        saveRestrictionKey: builder.mutation<any, any>({
            query: (body) => ({
                url: API.RESTRICTION.KEY_SAVE,
                method: "POST",
                body,
            }),
            invalidatesTags: ["RestrictionKey"],
        }),
        deleteRestrictionKey: builder.mutation<any, number>({
            query: (id) => ({
                url: API.RESTRICTION.KEY_DELETE(id),
                method: "DELETE",
            }),
            invalidatesTags: ["RestrictionKey"],
        }),

        // === Restrictions ===
        getRestrictions: builder.query<any, { offset: number; limit: number; query: string }>({
            query: ({ offset, limit, query }) => ({
                url: API.RESTRICTION.ALL,
                params: { offset, limit, query },
            }),
            providesTags: ["Restriction"],
        }),
        getRestrictionById: builder.query<any, number>({
            query: (id) => ({
                url: API.RESTRICTION.BY_ID(id),
            }),
            providesTags: (_result, _error, id) => [{ type: "Restriction", id }],
        }),
        getRestrictionsByKeyId: builder.query<any, { keyId: number; offset: number; limit: number }>({
            query: ({ keyId, offset, limit }) => ({
                url: API.RESTRICTION.BY_KEY_ID(keyId),
                params: { offset, limit },
            }),
            providesTags: (_result, _error, { keyId }) => [{ type: "Restriction", keyId }],
        }),
        saveRestriction: builder.mutation<any, any>({
            query: (body) => ({
                url: API.RESTRICTION.SAVE,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Restriction"],
        }),
        deleteRestriction: builder.mutation<any, number>({
            query: (id) => ({
                url: API.RESTRICTION.DELETE(id),
                method: "DELETE",
            }),
            invalidatesTags: ["Restriction"],
        }),

        // === Admin IP Access ===
        getAdminIPs: builder.query<any, { offset: number; limit: number; query: string }>({
            query: ({ offset, limit, query }) => ({
                url: API.RESTRICTION.ADMIN_IP_ALL,
                params: { offset, limit, query },
            }),
            providesTags: ["AdminIP"],
        }),
        getAdminIPById: builder.query<any, number>({
            query: (id) => ({
                url: API.RESTRICTION.ADMIN_IP_BY_ID(id),
            }),
            providesTags: (_result, _error, id) => [{ type: "AdminIP", id }],
        }),
        saveAdminIP: builder.mutation<any, any>({
            query: (body) => ({
                url: API.RESTRICTION.ADMIN_IP_SAVE,
                method: "POST",
                body,
            }),
            invalidatesTags: ["AdminIP"],
        }),
        deleteAdminIP: builder.mutation<any, number>({
            query: (id) => ({
                url: API.RESTRICTION.ADMIN_IP_DELETE(id),
                method: "DELETE",
            }),
            invalidatesTags: ["AdminIP"],
        }),
    }),
});

export const {
    useGetRestrictionKeysQuery,
    useGetRestrictionKeyByIdQuery,
    useSaveRestrictionKeyMutation,
    useDeleteRestrictionKeyMutation,

    useGetRestrictionsQuery,
    useGetRestrictionByIdQuery,
    useGetRestrictionsByKeyIdQuery,
    useSaveRestrictionMutation,
    useDeleteRestrictionMutation,

    useGetAdminIPsQuery,
    useGetAdminIPByIdQuery,
    useSaveAdminIPMutation,
    useDeleteAdminIPMutation,
} = restrictionAPI;
