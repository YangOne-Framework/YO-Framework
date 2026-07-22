import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

interface MasterLayoutDto {
  MasterLayoutUniqueId: string;
  Name: string;
  Description: string;
  HasHeader: boolean;
  HasFooter: boolean;
  Sidebar: string;
  IsSystem: boolean;
  LayoutConfig: string | null;
  IsActive: boolean;
  AddedOn: string;
  RowTotal: number;
  YOThemeId?: number | null;
}

interface MasterLayoutListResponse {
  Code: number;
  Message: string;
  Data: MasterLayoutDto[];
}

interface MasterLayoutApiResponse {
  Code: number;
  Message: string;
  Data: MasterLayoutDto;
}

export interface MasterLayoutSaveRequest {
  MasterLayoutUniqueId: string;
  Name: string;
  Description: string;
  HasHeader: boolean;
  HasFooter: boolean;
  Sidebar: string;
  IsSystem: boolean;
  LayoutConfig: string;
  YOThemeId?: number | null;
}

export const layoutAPI = createApi({
  reducerPath: "layoutAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["MasterLayout"],
  endpoints: (builder) => ({
    getMasterLayouts: builder.query<MasterLayoutListResponse, { offset?: number; limit?: number; query?: string }>({
      query: ({ offset = 1, limit = 20, query = "" }) => ({
        url: API.YO_PAGE.LAYOUT_LIST,
        method: "GET",
        params: { offset, limit, query },
      }),
      providesTags: ["MasterLayout"],
    }),

    getMasterLayoutById: builder.query<MasterLayoutApiResponse, string>({
      query: (layoutGuid) => ({
        url: API.YO_PAGE.LAYOUT_BY_ID(layoutGuid),
        method: "GET",
      }),
      providesTags: ["MasterLayout"],
    }),

    saveMasterLayout: builder.mutation<MasterLayoutApiResponse, MasterLayoutSaveRequest>({
      query: (data) => ({
        url: API.YO_PAGE.LAYOUT_SAVE,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MasterLayout"],
    }),

    deleteMasterLayout: builder.mutation<{ success: boolean }, string>({
      query: (layoutGuid) => ({
        url: API.YO_PAGE.LAYOUT_DELETE(layoutGuid),
        method: "DELETE",
      }),
      invalidatesTags: ["MasterLayout"],
    }),

    uploadLayoutImage: builder.mutation<{ url: string }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: API.YO_PAGE.LAYOUT_IMAGE_ADD,
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (response: any) => (response?.Data as { url: string }) ?? { url: "" },
    }),
  }),
});

export const {
  useGetMasterLayoutsQuery,
  useGetMasterLayoutByIdQuery,
  useSaveMasterLayoutMutation,
  useDeleteMasterLayoutMutation,
  useUploadLayoutImageMutation,
} = layoutAPI;
