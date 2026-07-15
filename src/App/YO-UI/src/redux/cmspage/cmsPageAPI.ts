import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { ApiResponse } from "../../types/common";
import { YoPageDto, YoPageSaveRequest, YoPagePublishRequest, YoPageListResponse, YoPageApiResponse } from "../../types/yoPageApiTypes";

export const yoPageAPI = createApi({
  reducerPath: "yoPageAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["YoPage"],
  endpoints: (builder) => ({
    getYoPageList: builder.query<YoPageListResponse, { offset?: number; limit?: number; status?: string; search?: string }>({
      query: ({ offset = 1, limit = 20, status = "all", search = "" }) => ({
        url: API.YO_PAGE.LIST,
        method: "GET",
        params: { offset, limit, status, search },
      }),
      providesTags: ["YoPage"],
    }),

    getYoPageById: builder.query<YoPageApiResponse, string>({
      query: (pageId) => ({
        url: API.YO_PAGE.BY_ID(pageId),
        method: "GET",
      }),
      providesTags: ["YoPage"],
    }),

    saveYoPage: builder.mutation<YoPageApiResponse, YoPageSaveRequest>({
      query: (data) => ({
        url: API.YO_PAGE.SAVE,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["YoPage"],
    }),

    publishYoPage: builder.mutation<YoPageApiResponse, YoPagePublishRequest>({
      query: (data) => ({
        url: API.YO_PAGE.PUBLISH,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["YoPage"],
    }),

    deleteYoPage: builder.mutation<{ success: boolean }, string>({
      query: (pageId) => ({
        url: API.YO_PAGE.DELETE(pageId),
        method: "DELETE",
      }),
      invalidatesTags: ["YoPage"],
    }),

    checkYoPageSlug: builder.query<ApiResponse<boolean>, { slug: string; excludePageUniqueId?: string }>({
      query: ({ slug, excludePageUniqueId }) => ({
        url: API.YO_PAGE.CHECK_SLUG(slug, excludePageUniqueId),
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetYoPageListQuery,
  useGetYoPageByIdQuery,
  useSaveYoPageMutation,
  usePublishYoPageMutation,
  useDeleteYoPageMutation,
  useCheckYoPageSlugQuery,
} = yoPageAPI;
