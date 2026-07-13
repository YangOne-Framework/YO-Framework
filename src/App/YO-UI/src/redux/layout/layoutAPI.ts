import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

interface MasterLayoutDto {
  LayoutGUID: string;
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
  LayoutGUID: string;
  Name: string;
  Description: string;
  HasHeader: boolean;
  HasFooter: boolean;
  Sidebar: string;
  IsSystem: boolean;
  LayoutConfig: string;
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
  }),
});

export const {
  useGetMasterLayoutsQuery,
  useGetMasterLayoutByIdQuery,
  useSaveMasterLayoutMutation,
  useDeleteMasterLayoutMutation,
} = layoutAPI;
