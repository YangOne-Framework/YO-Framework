import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { EmailServiceProviderSetting, SaveEmailServiceProvider } from "../../types/emailTypes";

export const emailApi = createApi({
  reducerPath: "emailApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["EmailServiceProviders"],
  endpoints: (builder) => ({
    getEmailServiceProviders: builder.query<any, { query?: string; limit: number; offset: number }>({
      query: ({ query, limit, offset }) => ({
        url: API.EMAIL_SERVICE_PROVIDER.ALL,
        method: "GET",
        params: { query, limit, offset },
      }),
      providesTags: ["EmailServiceProviders"],
    }),

    getEmailServiceProviderById: builder.query<any, number>({
      query: (id) => ({
        url: API.EMAIL_SERVICE_PROVIDER.BY_ID(id),
        method: "GET",
      }),
      providesTags: ["EmailServiceProviders"],
    }),

    getEmailServiceProviderSettings: builder.query<any, number>({
      query: (id) => ({
        url: API.EMAIL_SERVICE_PROVIDER.SETTINGS(id),
        method: "GET",
      }),
      providesTags: ["EmailServiceProviders"],
    }),

    saveEmailServiceProvider: builder.mutation<any, SaveEmailServiceProvider>({
      query: (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (k === "EmailServiceProviderSettings" && Array.isArray(v)) {
            v.forEach((s: any, i: number) => {
              formData.append(`EmailServiceProviderSettings[${i}].ProviderKey`, s.ProviderKey);
              formData.append(`EmailServiceProviderSettings[${i}].ProviderValue`, s.ProviderValue);
            });
          } else if (v instanceof File) {
            formData.append(k, v);
          } else {
            formData.append(k, String(v));
          }
        });
        return { url: API.EMAIL_SERVICE_PROVIDER.SAVE, method: "POST", body: formData };
      },
      invalidatesTags: ["EmailServiceProviders"],
    }),

    setDefaultProvider: builder.mutation<any, number>({
      query: (id) => ({
        url: API.EMAIL_SERVICE_PROVIDER.SET_DEFAULT,
        method: "POST",
        body: { Id: id },
      }),
      invalidatesTags: ["EmailServiceProviders"],
    }),

    updateStatus: builder.mutation<any, { emailServiceProviderId: number; isActive: boolean }>({
      query: (body) => ({
        url: API.EMAIL_SERVICE_PROVIDER.UPDATE_STATUS,
        method: "POST",
        body: { EmailServiceProviderId: body.emailServiceProviderId, IsActive: body.isActive },
      }),
      invalidatesTags: ["EmailServiceProviders"],
    }),

    updateSettings: builder.mutation<any, Partial<EmailServiceProviderSetting>[]>({
      query: (body) => ({
        url: API.EMAIL_SERVICE_PROVIDER.UPDATE_SETTINGS,
        method: "POST",
        body,
      }),
      invalidatesTags: ["EmailServiceProviders"],
    }),

    deleteEmailServiceProvider: builder.mutation<any, string>({
      query: (name) => ({
        url: API.EMAIL_SERVICE_PROVIDER.DELETE(name),
        method: "DELETE",
      }),
      invalidatesTags: ["EmailServiceProviders"],
    }),
  }),
});

export const {
  useGetEmailServiceProvidersQuery,
  useLazyGetEmailServiceProvidersQuery,
  useGetEmailServiceProviderByIdQuery,
  useGetEmailServiceProviderSettingsQuery,
  useSaveEmailServiceProviderMutation,
  useSetDefaultProviderMutation,
  useUpdateStatusMutation,
  useUpdateSettingsMutation,
  useDeleteEmailServiceProviderMutation,
} = emailApi;
