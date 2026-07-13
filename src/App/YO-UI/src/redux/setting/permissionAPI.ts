import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

export interface RoleOption {
  RoleId: number;
  IsSelected: boolean;
  Name: string;
}

export interface PermissionAction {
  ApplicationControllerActionId: number;
  ApplicationControllerId: number;
  RouteUrl: string;
  FriendlyName: string;
  ActionUrl: string;
  RoleId: number;
  AllowAccess: boolean;
  ControllerName: string;
}

export interface UserPermissionAction {
  UserPermissionId: number;
  ApplicationControllerActionId: number;
  ApplicationControllerId: number;
  UserId: number;
  AllowAccess: boolean;
  ActionUrl: string;
  RouteUrl: string;
  FriendlyUrl: string;
  ControllerName: string;
  RoleAllowAccess: boolean;
  HasUserOverride: boolean;
  UserOverrideAccess: boolean;
  EffectiveAccess: boolean;
}

export interface PermissionGroup {
  controllerId: number;
  controllerName: string;
  actions: PermissionAction[];
}

export interface UserPermissionGroup {
  controllerId: number;
  controllerName: string;
  actions: UserPermissionAction[];
}

export interface SavePermissionPayload {
  ApplicationControllerActionId: number;
  ApplicationControllerId: number;
  RoleId: number;
  AllowAccess: boolean;
}

export interface SaveUserPermissionPayload {
  ApplicationControllerActionId: number;
  ApplicationControllerId: number;
  UserId: number;
  AllowAccess: boolean;
  HasUserOverride: boolean;
  UserOverrideAccess: boolean;
}

export const permissionAPI = createApi({
    reducerPath: "permissionAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["Permission", "Role", "UserPermission"],
    endpoints: (builder) => ({
        getRoles: builder.query<RoleOption[], void>({
            query: () => ({ url: API.PERMISSION.ROLE_ALL, method: "GET" }),
            providesTags: ["Role"],
            transformResponse: (response: { Data: RoleOption[] }) => response.Data ?? [],
        }),

        getRolePermissions: builder.query<PermissionAction[], number>({
            query: (roleId) => ({
                url: API.PERMISSION.ROLE_BY_ID(roleId),
                method: "GET",
            }),
            providesTags: (result, error, roleId) => [{ type: "Permission", id: roleId }],
            transformResponse: (response: { Data: { RolePermission: PermissionAction[] } }) =>
                response.Data?.RolePermission ?? [],
        }),

        saveRolePermissions: builder.mutation<any, { roleId: number; data: { RolePermission: SavePermissionPayload[] } }>({
            query: ({ roleId, data }) => ({
                url: API.PERMISSION.ROLE_SAVE(roleId),
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "Permission", id: arg.roleId },
                "Role",
            ],
        }),

        getMyPermissions: builder.query<string[], void>({
            query: () => ({ url: API.PERMISSION.MY, method: "GET" }),
            transformResponse: (response: { Data: string[] }) => response.Data ?? [],
        }),

        getUserPermissions: builder.query<UserPermissionAction[], number>({
            query: (userId) => ({
                url: API.PERMISSION.USER_BY_ID(userId),
                method: "GET",
            }),
            providesTags: (result, error, userId) => [{ type: "UserPermission", id: userId }],
            transformResponse: (response: { Data: { UserPermission: UserPermissionAction[] } }) =>
                response.Data?.UserPermission ?? [],
        }),

        saveUserPermissions: builder.mutation<any, { userId: number; data: { UserPermission: SaveUserPermissionPayload[] } }>({
            query: ({ userId, data }) => ({
                url: API.PERMISSION.USER_SAVE(userId),
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: "UserPermission", id: arg.userId },
            ],
        }),
    }),
});

export const {
    useGetRolesQuery,
    useGetRolePermissionsQuery,
    useSaveRolePermissionsMutation,
    useGetMyPermissionsQuery,
    useGetUserPermissionsQuery,
    useSaveUserPermissionsMutation,
} = permissionAPI;
