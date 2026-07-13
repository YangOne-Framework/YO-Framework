import { createApi } from "../createUncachedApi";
import { ITokenResponse } from "../../types";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

export const userAPI = createApi({
    reducerPath: "userAPI",
    baseQuery: baseQueryWithAuth,
    endpoints: (builder) => ({
        getUserProfile: builder.query<ITokenResponse, undefined | void>({
            query: () => ({
                url: API.USER.PROFILE,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
        }),
        getRoles: builder.query<any, any>({
            query: (params) => ({
                url: API.ROLE.ALL,
                params,
            }),
        }),
        addRole: builder.mutation<any, any>({
            query: (body) => ({
                url: API.ROLE.SAVE,
                method: "POST",
                body: body,
            }),
        }),
        updateRole: builder.mutation<any, any>({
            query: (body) => ({
                url: API.ROLE.SAVE,
                method: "POST",
                body: body,
            }),
        }),
        deleteRole: builder.mutation<any, number>({
            query: (body) => ({
                url: API.ROLE.DELETE,
                method: "POST",
                body: { Id: body },
            }),
        }),

        getUsers: builder.query<any, any>({
            query: (params) => ({
                url: API.USER.MANAGEMENT_ALL,
                params,
            }),
        }),
        addUser: builder.mutation<any, any>({
            query: (body) => ({
                url: API.USER.MANAGEMENT_SAVE,
                method: "POST",
                body,
            }),
        }),
        updateUser: builder.mutation<any, any>({
            query: (body) => ({
                url: API.USER.MANAGEMENT_SAVE,
                method: "POST",
                body,
            }),
        }),
        deleteUser: builder.mutation<any, number>({
            query: (body) => ({
                url: API.USER.MANAGEMENT_DELETE,
                method: "POST",
                body,
            }),
        }),
        resetPassword: builder.mutation<any, any>({
            query: (body) => ({
                url: API.USER.MANAGEMENT_RESET_PASSWORD,
                method: "POST",
                body,
            }),
        }),
        getLoginHistory: builder.query<any, number>({
            query: (userId) => ({
                url: API.USER.MANAGEMENT_LOGIN_HISTORY(userId),
            }),
        }),
        getOrganizations: builder.query<any, any>({
            query: (params) => ({
                url: API.ORGANIZATION.ALL,
                params,
            }),
        }),
        getUserById: builder.query<any, number>({
            query: (id) => ({
                url: API.USER.MANAGEMENT_BY_ID(id),
            }),
        }),

        getRoleById: builder.query<any, number>({
            query: (id) => ({
                url: API.ROLE.BY_ID(id),
            }),
        }),

    }),
});

export const {
    useGetUserProfileQuery,
    useLazyGetUserProfileQuery,
    useGetRolesQuery,
    useLazyGetRolesQuery,
    useAddRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
    useGetRoleByIdQuery,
    useGetUsersQuery,
    useLazyGetUsersQuery,
    useAddUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useResetPasswordMutation,
    useGetLoginHistoryQuery,
    useLazyGetLoginHistoryQuery,
    useGetUserByIdQuery,
} = userAPI;
