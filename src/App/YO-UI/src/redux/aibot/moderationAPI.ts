// src/services/moderationAPI.ts
import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

export const moderationAPI = createApi({
  reducerPath: "moderationAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    // Get all moderation logs
    getAllModerationLogs: builder.query({
      query: (params) => ({
        url: "/api/v1/moderation/all",
        method: "GET",
        params, // { offset, limit, aiAssistantId, userId, isBlocked, flaggedOnly, startDate, endDate, query }
      }),
    }),

    // Get detail for a specific moderation log
    getModerationDetail: builder.query({
      query: (params) => ({
        url: "/api/v1/moderation/detail",
        method: "GET",
        params, // { aiAssistantModerationLogId }
      }),
    }),

    // Get moderation statistics
    getModerationStats: builder.query({
      query: (params) => ({
        url: "/api/v1/moderation/stats",
        method: "GET",
        params, // { aiAssistantId, startDate, endDate }
      }),
    }),
  }),
});

export const {
  useGetAllModerationLogsQuery,
  useGetModerationDetailQuery,
  useGetModerationStatsQuery,
} = moderationAPI;
