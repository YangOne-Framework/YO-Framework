import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

function objectToFormData(obj: any, form = new FormData(), namespace = "") {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const formKey = namespace ? `${namespace}[${key}]` : key;

    if (value instanceof Date) {
      form.append(formKey, value.toISOString());
    } else if (value instanceof File) {
      form.append(formKey, value);
    } else if (Array.isArray(value)) {
      value.forEach((el, i) => {
        const arrayKey = `${formKey}[${i}]`;
        if (el instanceof File) {
          form.append(arrayKey, el);
        } else if (typeof el === "object") {
          objectToFormData(el, form, arrayKey);
        } else {
          form.append(arrayKey, el);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      objectToFormData(value, form, formKey); // recursive for nested objects
    } else if (value !== undefined && value !== null) {
      form.append(formKey, value);
    }
  }

  return form;
}

export const aiAssistantAPI = createApi({
  reducerPath: "aiAssistantAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    // Assistants
    saveAssistantCreate: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/save/create",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveAssistantPrompt: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/prompt/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveAssistant: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    deleteAssistant: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/delete",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveAssistantActive: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/save/active",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Theme configuration
    saveThemeConfigFromTheme: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/theme/save-from-theme",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveThemeConfig: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/theme/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    getThemeConfig: builder.query({
      query: (params) => ({
        url: "/api/v1/assistant/theme/get",
        method: "GET",
        params,
      }),
    }),

    // Model configuration
    saveModelConfigFromProvider: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/model/save-from-provider",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveModelConfig: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/model/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    getModelConfig: builder.query({
      query: (params) => ({
        url: "/api/v1/assistant/model/get",
        method: "GET",
        params,
      }),
    }),
    saveSwitchProvider: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/save/switch-provider",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Config and collections
    saveAssistantConfig: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/config/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    getAssistantConfig: builder.query({
      query: (params) => ({
        url: "/api/v1/assistant/config/get",
        method: "GET",
        params,
      }),
    }),
    saveEnsureDefaultCollection: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/collection/save/ensure-default",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Assistant lists and details
    getAssistants: builder.query({
      query: (params) => ({
        url: "/api/v1/assistant/all",
        method: "GET",
        params,
      }),
    }),
    getAssistantDetail: builder.query({
      query: (params) => ({
        url: "/api/v1/assistant/detail",
        method: "GET",
        params,
      }),
    }),

    // Chat
    saveChat: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/chat/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveChatHistory: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/chat/history/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveChatHistoryBatch: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/chat/history/save-batch",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    getChatHistory: builder.query({
      query: (params) => ({
        url: "/api/v1/assistant/chat/history",
        method: "GET",
        params,
      }),
    }),
    deleteChatHistory: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/chat/history/delete",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Feedback and logs
    saveChatFeedback: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/chat/feedback/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveModerationLog: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/moderation/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveQuotaLog: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/quota/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveUsageSummary: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/usage/summary/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    getUsageSummary: builder.query({
      query: (params) => ({
        url: "/api/v1/assistant/usage/summary",
        method: "GET",
        params,
      }),
    }),

    // Ask endpoint
    ask: builder.mutation({
      query: (data) => ({
        url: "/api/v1/assistant/chat/ask",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
  }),
});

export const {
  useSaveAssistantCreateMutation,
  useSaveAssistantMutation,
  useDeleteAssistantMutation,
  useSaveAssistantActiveMutation,
  useSaveThemeConfigFromThemeMutation,
  useSaveThemeConfigMutation,
  useGetThemeConfigQuery,
  useSaveModelConfigFromProviderMutation,
  useSaveModelConfigMutation,
  useGetModelConfigQuery,
  useSaveSwitchProviderMutation,
  useSaveAssistantConfigMutation,
  useGetAssistantConfigQuery,
  useSaveEnsureDefaultCollectionMutation,
  useGetAssistantsQuery,
  useGetAssistantDetailQuery,
  useSaveChatMutation,
  useSaveChatHistoryMutation,
  useSaveChatHistoryBatchMutation,
  useGetChatHistoryQuery,
  useDeleteChatHistoryMutation,
  useSaveChatFeedbackMutation,
  useSaveModerationLogMutation,
  useSaveQuotaLogMutation,
  useSaveUsageSummaryMutation,
  useGetUsageSummaryQuery,
  useAskMutation,
  useSaveAssistantPromptMutation
} = aiAssistantAPI;
