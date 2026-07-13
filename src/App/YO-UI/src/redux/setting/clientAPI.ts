import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

export type ApiResponse<T> = {
    Code?: number;
    Message?: string;
    Data?: T;
    Errors?: any[];
};

export type PagedRows<T> = {
    RowTotal: number;
    Rows: T[];
};

export type PagingQuery = { offset?: number; limit?: number; search?: string };

// ---------- Dashboard ----------
export type DashboardDto = {
    applicationCount: number;
    scopeCount: number;
    tokenCount: number;
    authorizationCount: number;
};

// ---------- Clients ----------
export type ClientListItemDto = {
    Id: string;
    ClientId: string;
    DisplayName?: string | null;
    ClientType?: string | null;
    ConsentType?: string | null;
};

export type ClientDetailsDto = ClientListItemDto & {
    RedirectUris: string[];
    PostLogoutRedirectUris: string[];
    Permissions: string[];
    Requirements: string[];
    GrantTypes: string[];
};

export type CreateOrUpdateClientRequest = {
    clientId: string;
    clientSecret?: string | null; // optional on update
    displayName?: string | null;
    clientType?: string | null;
    consentType?: string | null;
    redirectUris: string[];
    postLogoutRedirectUris: string[];
    permissions: string[];
};

// ---------- Applications ----------
export type ApplicationListItemDto = {
    Id: string;
    ClientId: string;
    DisplayName?: string | null;
    ClientType?: string | null;
    ConsentType?: string | null;
};

export type ApplicationDetailsDto = ApplicationListItemDto & {
    RedirectUris: string[];
    PostLogoutRedirectUris: string[];
    Permissions: string[];
    Requirements: string[];
    GrantTypes: string[];
};

export type CreateOrUpdateApplicationRequest = {
    id?: string; // Required for edit mode
    clientId: string;
    clientSecret?: string | null; // optional on update
    displayName?: string | null;
    clientType?: string | null;
    consentType?: string | null;
    redirectUris: string[];
    postLogoutRedirectUris: string[];
    permissions: string[];
};

// ---------- Scopes / Resources ----------
export type ApiResourceDto = {
    id: string;
    name: string; // without rs_ in API surface
    displayName?: string | null;
    description?: string | null;
};

export type ApiScopeDto = {
    id: string;
    name: string; // without api_ in API surface
    displayName?: string | null;
    description?: string | null;
};

export type IdentityResourceDto = {
    id: string;
    name: string;
    displayName?: string | null;
    description?: string | null;
};

// ---------- Grants ----------
export type GrantListItemDto = {
    id: string;
    subject?: string | null;
    applicationName?: string | null;
    creationDate?: string | null; // DateTimeOffset serialized
    status?: string | null;
    scopes: string[];
};

export type CreateGrantRequest = {
    subject: string;
    status?: string;
    applicationId?: string | null;
    scopes: string[];
};

export type UpdateGrantRequest = {
    id: string;
    status: string;
};

// ---------- RTK Query API ----------
export const openIddictAdminAPI = createApi({
    reducerPath: "openIddictAdminAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["Dashboard", "Client", "Application", "ApiResource", "ApiScope", "IdentityResource", "Grant", "Meta"],
    endpoints: (builder) => ({
        // -------- Dashboard --------
        getDashboardStat: builder.query<DashboardDto, void>({
            query: () => ({ url: "/api/v1/openiddict/dashboard/stat", method: "GET" }),
            providesTags: ["Dashboard"]
        }),

        // -------- Helpers / Metadata --------
        getConsentTypes: builder.query<ApiResponse<string[]>, void>({
            query: () => ({ url: "/api/v1/openiddict/consenttype/all", method: "GET" }),
            providesTags: ["Meta"]
        }),

        getClientTypes: builder.query<ApiResponse<string[]>, void>({
            query: () => ({ url: "/api/v1/openiddict/clienttype/all", method: "GET" }),
            providesTags: ["Meta"]
        }),

        getPermissions: builder.query<ApiResponse<string[]>, void>({
            query: () => ({ url: "/api/v1/openiddict/permission/all", method: "GET" }),
            providesTags: ["Meta"]
        }),



        // -------- Applications --------
        getApplications: builder.query<ApiResponse<PagedRows<ApplicationListItemDto>>, PagingQuery>({
            query: ({ offset = 1, limit = 20, search = "" }) => ({
                url: `/api/v1/openiddict/application/all?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result?.Data?.Rows
                    ? [
                        ...result.Data.Rows.map((x) => ({ type: "Application" as const, id: x.Id })),
                        { type: "Application" as const, id: "LIST" },
                    ]
                    : [{ type: "Application" as const, id: "LIST" }],
        }),

        getApplicationDetails: builder.query<ApiResponse<ApplicationDetailsDto>, string>({
            query: (id) => ({ url: `/api/v1/openiddict/application/detail/${encodeURIComponent(id)}`, method: "GET" }),
            providesTags: (_r, _e, id) => [{ type: "Application", id }],
        }),

        updateApplication: builder.mutation<ApiResponse<boolean>, CreateOrUpdateApplicationRequest>({
            query: (body) => ({ url: "/api/v1/openiddict/application/save", method: "POST", body }),
            invalidatesTags: (_r, _e, body) => [{ type: "Application", id: body.clientId }, { type: "Application", id: "LIST" }],
        }),

        deleteApplication: builder.mutation<ApiResponse<boolean>, string>({
            query: (id) => ({ url: `/api/v1/openiddict/application/delete/${encodeURIComponent(id)}`, method: "DELETE" }),
            invalidatesTags: (_r, _e, id) => [{ type: "Application", id }, { type: "Application", id: "LIST" }],
        }),

        // -------- API Resources (rs_*) --------
        getApiResources: builder.query<PagedRows<ApiResourceDto>, PagingQuery>({
            query: ({ offset = 1, limit = 20, search = "" }) => ({
                url: `/api/v1/openiddict/apiresource/all?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.Rows.map((x) => ({ type: "ApiResource" as const, id: x.id })),
                        { type: "ApiResource" as const, id: "LIST" },
                    ]
                    : [{ type: "ApiResource" as const, id: "LIST" }],
        }),

        getApiResourceDetails: builder.query<any, string>({
            query: (id) => ({ url: `/api/v1/openiddict/apiresource/${encodeURIComponent(id)}`, method: "GET" }),
            providesTags: (_r, _e, id) => [{ type: "ApiResource", id }],
        }),

        createApiResource: builder.mutation<boolean, ApiResourceDto>({
            query: (body) => ({ url: "/api/v1/openiddict/apiresource/save", method: "POST", body }),
            invalidatesTags: [{ type: "ApiResource", id: "LIST" }],
        }),

        updateApiResource: builder.mutation<boolean, ApiResourceDto>({
            query: (body) => ({ url: "/api/v1/openiddict/apiresource/update", method: "POST", body }),
            invalidatesTags: (_r, _e, body) => [{ type: "ApiResource", id: body.id }, { type: "ApiResource", id: "LIST" }],
        }),

        deleteApiResource: builder.mutation<boolean, string>({
            query: (id) => ({ url: `/api/v1/openiddict/apiresource/${encodeURIComponent(id)}`, method: "DELETE" }),
            invalidatesTags: (_r, _e, id) => [{ type: "ApiResource", id }, { type: "ApiResource", id: "LIST" }],
        }),

        // -------- Identity Resources (not rs_, not api_) --------
        getIdentityResources: builder.query<PagedRows<IdentityResourceDto>, PagingQuery>({
            query: ({ offset = 1, limit = 20, search = "" }) => ({
                url: `/api/v1/openiddict/identityresource/all?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result?.Rows
                    ? [
                        ...result.Rows.map((x) => ({ type: "IdentityResource" as const, id: x.id })),
                        { type: "IdentityResource" as const, id: "LIST" },
                    ]
                    : [{ type: "IdentityResource" as const, id: "LIST" }],
        }),

        getIdentityResourceDetails: builder.query<IdentityResourceDto, string>({
            query: (id) => ({ url: `/api/v1/openiddict/identityresource/${encodeURIComponent(id)}`, method: "GET" }),
            providesTags: (_r, _e, id) => [{ type: "IdentityResource", id }],
        }),

        createIdentityResource: builder.mutation<boolean, IdentityResourceDto>({
            query: (body) => ({ url: "/api/v1/openiddict/identityresource/save", method: "POST", body }),
            invalidatesTags: [{ type: "IdentityResource", id: "LIST" }],
        }),

        updateIdentityResource: builder.mutation<boolean, IdentityResourceDto>({
            query: (body) => ({ url: "/api/v1/openiddict/identityresource/update", method: "POST", body }),
            invalidatesTags: (_r, _e, body) => [{ type: "IdentityResource", id: body.id }, { type: "IdentityResource", id: "LIST" }],
        }),

        deleteIdentityResource: builder.mutation<boolean, string>({
            query: (id) => ({ url: `/api/v1/openiddict/identityresource/${encodeURIComponent(id)}`, method: "DELETE" }),
            invalidatesTags: (_r, _e, id) => [{ type: "IdentityResource", id }, { type: "IdentityResource", id: "LIST" }],
        }),

        // -------- API Scopes (api_*) --------
        getApiScopes: builder.query<PagedRows<ApiScopeDto>, PagingQuery>({
            query: ({ offset = 1, limit = 20, search = "" }) => ({
                url: `/api/v1/openiddict/apiscope/all?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result?.Rows
                    ? [
                        ...result.Rows.map((x) => ({ type: "ApiScope" as const, id: x.id })),
                        { type: "ApiScope" as const, id: "LIST" },
                    ]
                    : [{ type: "ApiScope" as const, id: "LIST" }],
        }),

        getApiScopeDetails: builder.query<ApiScopeDto, string>({
            query: (id) => ({ url: `/api/v1/openiddict/apiscope/${encodeURIComponent(id)}`, method: "GET" }),
            providesTags: (_r, _e, id) => [{ type: "ApiScope", id }],
        }),

        createApiScope: builder.mutation<boolean, ApiScopeDto>({
            query: (body) => ({ url: "/api/v1/openiddict/apiscope/save", method: "POST", body }),
            invalidatesTags: [{ type: "ApiScope", id: "LIST" }],
        }),

        updateApiScope: builder.mutation<boolean, ApiScopeDto>({
            query: (body) => ({ url: "/api/v1/openiddict/apiscope/update", method: "POST", body }),
            invalidatesTags: (_r, _e, body) => [{ type: "ApiScope", id: body.id }, { type: "ApiScope", id: "LIST" }],
        }),

        deleteApiScope: builder.mutation<boolean, string>({
            query: (id) => ({ url: `/api/v1/openiddict/apiscope/${encodeURIComponent(id)}`, method: "DELETE" }),
            invalidatesTags: (_r, _e, id) => [{ type: "ApiScope", id }, { type: "ApiScope", id: "LIST" }],
        }),

        // -------- Grants / Authorizations --------
        getGrants: builder.query<PagedRows<GrantListItemDto>, PagingQuery>({
            query: ({ offset = 1, limit = 20, search = "" }) => ({
                url: `/api/v1/openiddict/grant/all?offset=${offset}&limit=${limit}&search=${encodeURIComponent(search)}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result?.Rows
                    ? [
                        ...result.Rows.map((x) => ({ type: "Grant" as const, id: x.id })),
                        { type: "Grant" as const, id: "LIST" },
                    ]
                    : [{ type: "Grant" as const, id: "LIST" }],
        }),

        getGrantDetails: builder.query<GrantListItemDto, string>({
            query: (id) => ({ url: `/api/v1/openiddict/grant/${encodeURIComponent(id)}`, method: "GET" }),
            providesTags: (_r, _e, id) => [{ type: "Grant", id }],
        }),

        createGrant: builder.mutation<boolean, CreateGrantRequest>({
            query: (body) => ({ url: "/api/v1/openiddict/grant/save", method: "POST", body }),
            invalidatesTags: [{ type: "Grant", id: "LIST" }],
        }),

        updateGrant: builder.mutation<boolean, UpdateGrantRequest>({
            query: (body) => ({ url: "/api/v1/openiddict/grant/update", method: "POST", body }),
            invalidatesTags: (_r, _e, body) => [{ type: "Grant", id: body.id }, { type: "Grant", id: "LIST" }],
        }),

        deleteGrant: builder.mutation<boolean, string>({
            query: (id) => ({ url: `/api/v1/openiddict/grant/${encodeURIComponent(id)}`, method: "DELETE" }),
            invalidatesTags: (_r, _e, id) => [{ type: "Grant", id }, { type: "Grant", id: "LIST" }],
        }),

        revokeGrant: builder.mutation<boolean, string>({
            query: (id) => ({
                url: `/api/v1/openiddict/grant/revoke?id=${encodeURIComponent(id)}`,
                method: "POST",
            }),
            invalidatesTags: (_r, _e, id) => [{ type: "Grant", id }, { type: "Grant", id: "LIST" }],
        }),
    }),
});

export const {
    // Dashboard
    useGetDashboardStatQuery,

    // Meta
    useGetConsentTypesQuery,
    useGetClientTypesQuery,
    useGetPermissionsQuery,

    // Applications
    useGetApplicationsQuery,
    useGetApplicationDetailsQuery,
    useUpdateApplicationMutation,
    useDeleteApplicationMutation,

    // API Resources
    useGetApiResourcesQuery,
    useGetApiResourceDetailsQuery,
    useCreateApiResourceMutation,
    useUpdateApiResourceMutation,
    useDeleteApiResourceMutation,

    // Identity Resources
    useGetIdentityResourcesQuery,
    useGetIdentityResourceDetailsQuery,
    useCreateIdentityResourceMutation,
    useUpdateIdentityResourceMutation,
    useDeleteIdentityResourceMutation,

    // API Scopes
    useGetApiScopesQuery,
    useGetApiScopeDetailsQuery,
    useCreateApiScopeMutation,
    useUpdateApiScopeMutation,
    useDeleteApiScopeMutation,

    // Grants
    useGetGrantsQuery,
    useGetGrantDetailsQuery,
    useCreateGrantMutation,
    useUpdateGrantMutation,
    useDeleteGrantMutation,
    useRevokeGrantMutation,
} = openIddictAdminAPI;
