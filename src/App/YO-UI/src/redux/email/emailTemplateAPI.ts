import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { SaveEmailTemplate } from "../../types/emailTemplateTypes";

export const emailTemplateApi = createApi({
  reducerPath: "emailTemplateApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["EmailTemplates"],
  endpoints: (builder) => ({
    getEmailTemplates: builder.query<any, { query?: string; limit: number; offset: number }>({
      query: ({ query, limit, offset }) => ({
        url: API.EMAIL_TEMPLATE.ALL,
        method: "GET",
        params: { query, limit, offset },
      }),
      providesTags: ["EmailTemplates"],
    }),

    getEmailTemplateById: builder.query<any, number>({
      query: (id) => ({
        url: API.EMAIL_TEMPLATE.BY_ID(id),
        method: "GET",
      }),
      providesTags: ["EmailTemplates"],
    }),

    getEmailTemplateFull: builder.query<any, number>({
      query: (id) => ({
        url: API.EMAIL_TEMPLATE.FULL(id),
        method: "GET",
      }),
      providesTags: ["EmailTemplates"],
    }),

    getEmailTemplateDefaults: builder.query<any, void>({
      query: () => ({
        url: API.EMAIL_TEMPLATE.DEFAULTS,
        method: "GET",
      }),
    }),

    saveEmailTemplate: builder.mutation<any, SaveEmailTemplate>({
      query: (data) => ({
        url: API.EMAIL_TEMPLATE.SAVE,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["EmailTemplates"],
    }),

    deleteEmailTemplate: builder.mutation<any, number>({
      query: (id) => ({
        url: API.EMAIL_TEMPLATE.DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["EmailTemplates"],
    }),
  }),
});

export const {
  useGetEmailTemplatesQuery,
  useLazyGetEmailTemplatesQuery,
  useGetEmailTemplateByIdQuery,
  useGetEmailTemplateFullQuery,
  useGetEmailTemplateDefaultsQuery,
  useSaveEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
} = emailTemplateApi;
