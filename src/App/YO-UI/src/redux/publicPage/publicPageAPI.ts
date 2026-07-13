import { createApi } from "../createUncachedApi";
import { baseQueryWithoutAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { ApiResponse } from "../../types/common";
import { PublicPageResponse } from "../../types/yoPageApiTypes";

export const publicPageAPI = createApi({
  reducerPath: "publicPageAPI",
  baseQuery: baseQueryWithoutAuth,
  endpoints: (builder) => ({
    getPublicPageBySlug: builder.query<ApiResponse<PublicPageResponse>, string>({
      query: (slug) => ({
        url: API.PUBLIC_PAGE.BY_SLUG(slug),
        method: "GET",
      }),
    }),
  }),
});

export const { useGetPublicPageBySlugQuery } = publicPageAPI;
