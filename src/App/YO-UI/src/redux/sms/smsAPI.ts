import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";
import { SMSGatewaySetting, SaveSMSGateway } from "../../types/smsTypes";

export const smsApi = createApi({
  reducerPath: "smsApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["SmsServiceProviders"],
  endpoints: (builder) => ({
    getSmsServiceProviders: builder.query<any, { query?: string; limit: number; offset: number }>({
      query: ({ query, limit, offset }) => ({
        url: API.SMS_SERVICE_PROVIDER.ALL,
        method: "GET",
        params: { query, limit, offset },
      }),
      providesTags: ["SmsServiceProviders"],
    }),

    getSmsServiceProviderById: builder.query<any, number>({
      query: (id) => ({
        url: API.SMS_SERVICE_PROVIDER.BY_ID(id),
        method: "GET",
      }),
      providesTags: ["SmsServiceProviders"],
    }),

    getSmsServiceProviderSettings: builder.query<any, number>({
      query: (id) => ({
        url: API.SMS_SERVICE_PROVIDER.SETTINGS(id),
        method: "GET",
      }),
      providesTags: ["SmsServiceProviders"],
    }),

    saveSmsServiceProvider: builder.mutation<any, SaveSMSGateway>({
      query: (data) => {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (k === "SMSGatewaySettings" && Array.isArray(v)) {
            v.forEach((s: any, i: number) => {
              formData.append(`SMSGatewaySettings[${i}].GatewayKey`, s.GatewayKey);
              formData.append(`SMSGatewaySettings[${i}].GatewayValue`, s.GatewayValue);
            });
          } else if (v instanceof File) {
            formData.append(k, v);
          } else {
            formData.append(k, String(v));
          }
        });
        return { url: API.SMS_SERVICE_PROVIDER.SAVE, method: "POST", body: formData };
      },
      invalidatesTags: ["SmsServiceProviders"],
    }),

    setDefaultSmsProvider: builder.mutation<any, number>({
      query: (id) => ({
        url: API.SMS_SERVICE_PROVIDER.SET_DEFAULT,
        method: "POST",
        body: { Id: id },
      }),
      invalidatesTags: ["SmsServiceProviders"],
    }),

    updateSmsStatus: builder.mutation<any, { smsGatewayId: number; isActive: boolean }>({
      query: (body) => ({
        url: API.SMS_SERVICE_PROVIDER.UPDATE_STATUS,
        method: "POST",
        body: { SMSGatewayId: body.smsGatewayId, IsActive: body.isActive },
      }),
      invalidatesTags: ["SmsServiceProviders"],
    }),

    updateSmsSettings: builder.mutation<any, Partial<SMSGatewaySetting>[]>({
      query: (body) => ({
        url: API.SMS_SERVICE_PROVIDER.UPDATE_SETTINGS,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SmsServiceProviders"],
    }),

    deleteSmsServiceProvider: builder.mutation<any, number>({
      query: (id) => ({
        url: API.SMS_SERVICE_PROVIDER.DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: ["SmsServiceProviders"],
    }),
  }),
});

export const {
  useGetSmsServiceProvidersQuery,
  useLazyGetSmsServiceProvidersQuery,
  useGetSmsServiceProviderByIdQuery,
  useGetSmsServiceProviderSettingsQuery,
  useSaveSmsServiceProviderMutation,
  useSetDefaultSmsProviderMutation,
  useUpdateSmsStatusMutation,
  useUpdateSmsSettingsMutation,
  useDeleteSmsServiceProviderMutation,
} = smsApi;
