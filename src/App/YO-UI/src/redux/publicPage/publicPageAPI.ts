import { createApi } from "../createUncachedApi";
import { baseQueryWithoutAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { ApiResponse } from "../../types/common";
import { PublicPageResponse } from "../../types/yoPageApiTypes";
import type { ThemeResolveResponse } from "../../types/yoThemeStudioTypes";

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
    /**
     * Anonymous runtime theme resolution (blueprint §21) — resolves the
     * effective published theme for an application/route through the studio
     * assignment pipeline.
     */
    resolvePublicTheme: builder.query<
      ThemeResolveResponse | null,
      { application?: string; route?: string }
    >({
      query: (args) => ({
        url: API.YOTHEME_STUDIO.RESOLVE,
        method: "GET",
        params: args,
      }),
      transformResponse: (response: ApiResponse<ThemeResolveResponse>) =>
        response?.Data ?? null,
    }),
  }),
});

export const { useGetPublicPageBySlugQuery, useResolvePublicThemeQuery } = publicPageAPI;
