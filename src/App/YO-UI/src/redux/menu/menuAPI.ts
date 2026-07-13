import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { AdminMenuItem, MenuGroup, MenuOrderSaveRequest, MenuRole, MenuSaveRequest } from "../../types/menu";
import { API } from "../../config/apiUrls";

export const menuAPI = createApi({
    reducerPath: "menuAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["Menu", "MenuRole", "MenuGroup"],
    endpoints: (builder) => ({
        getMenusByGroup: builder.query<any, number>({
            query: (groupId) => ({
                url: API.MENU.GROUP(groupId),
                method: "GET",
            }),
            providesTags: ["Menu"],
        }),
        getMenuById: builder.query<any, number>({
            query: (id) => ({
                url: API.MENU.BY_ID(id),
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Menu", id }],
        }),

        deleteMenu: builder.mutation<any, number>({
            query: (id) => ({
                url: API.MENU.BY_ID(id),
                method: "DELETE",
            }),
            invalidatesTags: ["Menu"],
        }),

        saveMenu: builder.mutation<any, MenuSaveRequest>({
            query: (data) => ({
                url: API.MENU.SAVE,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Menu"],
        }),

        saveMenuOrder: builder.mutation<any, MenuOrderSaveRequest>({
            query: (orders) => ({
                url: API.MENU.ORDER_SAVE,
                method: "POST",
                body: orders,
            }),
            invalidatesTags: ["Menu"],
        }),

        getMenuRoles: builder.query<any, void>({
            query: () => ({
                url: API.MENU.ROLES,
                method: "GET",
            }),
            providesTags: ["MenuRole"],
        }),

        getMenuGroups: builder.query<any, void>({
            query: () => ({
                url: API.MENU.GROUPS,
                method: "GET",
            }),
            providesTags: ["MenuGroup"],
        }),

        saveMenuGroup: builder.mutation<any, MenuGroup>({
            query: (data) => ({
                url: API.MENU.GROUPS_SAVE,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["MenuGroup"],
        }),

        deleteMenuGroup: builder.mutation<any, number>({
            query: (id) => ({
                url: API.MENU.GROUPS_DELETE(id),
                method: "DELETE",
            }),
            invalidatesTags: ["MenuGroup"],
        }),

        getAdminMenus: builder.query<AdminMenuItem[], void>({
            query: () => ({
                url: API.MENU.ADMIN_MENUS,
                method: "GET",
            }),
            transformResponse: (response: { Data: AdminMenuItem[] }) => response.Data,
        }),
    }),
});

export const {
    useGetMenusByGroupQuery,
    useGetMenuByIdQuery,
    useDeleteMenuMutation,
    useSaveMenuMutation,
    useSaveMenuOrderMutation,
    useGetMenuRolesQuery,
    useGetMenuGroupsQuery,
    useSaveMenuGroupMutation,
    useDeleteMenuGroupMutation,
    useGetAdminMenusQuery,
} = menuAPI;
