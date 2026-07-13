import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { PaginationParams } from "../../types/trekTypes";

import {
    HtmlComponentSaveRequest,
    HtmlComponentDetailDto,
    HtmlComponentItemDto,
} from "../../types/builderTypes";

export type CheckUniqueParams = {
    name: string;
    oldName?: string;
    htmlComponentId?: number;
};

export const htmlBuilderAPI = createApi({
    reducerPath: "htmlBuilderAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["HtmlComponent"],
    endpoints: (builder) => ({
        getActiveHtmlComponents: builder.query<any, PaginationParams>({
            query: ({ offset = 1, limit = 20, query = "" }: any) => ({
                url: API.HTML_COMPONENT.ALL_ACTIVE(offset, limit, query ?? ""),
                method: "GET",
            }),
            providesTags: ["HtmlComponent"],
        }),

        getAllHtmlComponents: builder.query<any, PaginationParams>({
            query: ({ offset = 1, limit = 20, query = "" }: any) => ({
                url: API.HTML_COMPONENT.ALL(offset, limit, query ?? ""),
                method: "GET",
            }),
            providesTags: ["HtmlComponent"],
        }),

        getHtmlComponentById: builder.query<any, number>({
            query: (id) => ({
                url: API.HTML_COMPONENT.BY_ID(id),
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "HtmlComponent", id }],
        }),

        checkHtmlComponentNameUnique: builder.query<any, CheckUniqueParams>({
            query: ({ name, oldName = "", htmlComponentId = 0 }) => ({
                url: API.HTML_COMPONENT.CHECK_UNIQUE(name, oldName, htmlComponentId ?? 0),
                method: "GET",
            }),
        }),

        saveHtmlComponent: builder.mutation<any, HtmlComponentSaveRequest>({
            query: (data) => ({
                url: API.HTML_COMPONENT.SAVE,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["HtmlComponent"],
        }),

        deleteHtmlComponent: builder.mutation<any, number>({
            query: (id) => ({
                url: API.HTML_COMPONENT.DELETE(id),
                method: "DELETE",
            }),
            invalidatesTags: ["HtmlComponent"],
        }),
    }),
});

export const {
    useGetActiveHtmlComponentsQuery,
    useGetAllHtmlComponentsQuery,
    useGetHtmlComponentByIdQuery,
    useCheckHtmlComponentNameUniqueQuery,
    useSaveHtmlComponentMutation,
    useDeleteHtmlComponentMutation,
    useLazyCheckHtmlComponentNameUniqueQuery
} = htmlBuilderAPI;
