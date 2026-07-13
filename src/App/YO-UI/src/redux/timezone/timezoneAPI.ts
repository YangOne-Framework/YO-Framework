import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { Timezone } from "../../types/settingTypes";
import { ApiResponse } from "../../types/common";

export const timezoneAPI = createApi({
    reducerPath: "timezoneAPI",
    baseQuery: baseQueryWithAuth,
    tagTypes: ["Timezone"],
    endpoints: (builder) => ({
        getAllTimezones: builder.query<ApiResponse<Timezone[]>, void>({
            query: () => ({ url: API.TIMEZONE.ALL, method: "GET" }),
            providesTags: ["Timezone"],
        }),

        getTimezoneById: builder.query<ApiResponse<Timezone>, number | string>({
            query: (id) => ({ url: API.TIMEZONE.BY_ID(id), method: "GET" }),
            providesTags: ["Timezone"],
        }),

        checkUserHasTimezone: builder.query<ApiResponse<Timezone>, void>({
            query: () => ({ url: API.TIMEZONE.CHECK_USER, method: "GET" }),
            providesTags: ["Timezone"],
        }),

        saveUserTimezone: builder.mutation<ApiResponse<Timezone>, { UserId: number; TimeZoneId: number }>({
            query: (data) => ({
                url: API.TIMEZONE.SAVE_USER,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Timezone"],
        }),
    }),
});

export const {
    useGetAllTimezonesQuery,
    useGetTimezoneByIdQuery,
    useCheckUserHasTimezoneQuery,
    useSaveUserTimezoneMutation,
} = timezoneAPI;
