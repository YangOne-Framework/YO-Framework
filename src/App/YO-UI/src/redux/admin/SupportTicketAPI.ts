// src/services/support.api.ts
import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

/** Same behavior as your category.api.ts helper */
export function objectToFormData(obj: any, form = new FormData(), namespace = ""): FormData {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

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
        } else if (typeof el === "object" && el !== null) {
          objectToFormData(el, form, arrayKey);
        } else if (el !== undefined && el !== null) {
          form.append(arrayKey, el);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      objectToFormData(value, form, formKey);
    } else if (value !== undefined && value !== null) {
      form.append(formKey, value as any);
    }
  }
  return form;
}

export const supportAPI = createApi({
  reducerPath: "supportAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    /* ---------- Public/User endpoints ---------- */
    getAllPriorities: builder.query<any, void>({
      query: () => ({ url: "/api/v1/support/priority/all", method: "GET" }),
    }),
    getAllStatuses: builder.query<any, void>({
      query: () => ({ url: "/api/v1/support/status/all", method: "GET" }),
    }),
    getUserTickets: builder.query<any, void>({
      query: () => ({ url: "/api/v1/support/user/ticket/all", method: "GET" }),
    }),
    saveUserTicket: builder.mutation<any, any>({
      // Supports both create and update; controller decides by SupportTicketId
      query: (data) => ({
        url: "/api/v1/support/user/ticket/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    /* ---------- Management: form datasource ---------- */
    getManagementFormDatasource: builder.query<
      any,
      { statusId?: number; priorityId?: number; assignedTo?: number; raisedBy?: number }
    >({
      query: ({ statusId = 0, priorityId = 0, assignedTo = 0, raisedBy = 0 }) => ({
        url: "/api/v1/support/management/form/datasource",
        method: "GET",
        params: { statusId, priorityId, assignedTo, raisedBy },
      }),
    }),

    /* ---------- Management: teams ---------- */
    getAllSupportTeams: builder.query<any, { offset?: number; limit?: number; query?: string } | void>({
      query: (params) => ({
        url: "/api/v1/support/management/team/all",
        method: "GET",
        params: { offset: 1, limit: 10, query: "", ...(params || {}) },
      }),
    }),
    saveSupportTeam: builder.mutation<any, any>({
      // create/update, mirrors controller SaveSupportTeam
      query: (data) => ({
        url: "/api/v1/support/management/team/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    deleteSupportTeam: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: "/api/v1/support/management/team/delete",
        method: "POST",
        body: objectToFormData({ id }),
      }),
    }),

    /* ---------- Management: tickets (list/detail/save/delete/bulk) ---------- */
    getManagementTickets: builder.query<
      any,
      {
        offset?: number;
        limit?: number;
        query?: string;
        priorities?: string; // e.g. "1,2"
        statuses?: string;   // e.g. "1,3"
        date?: string;       // server expects string
      } | void
    >({
      query: (params) => ({
        url: "/api/v1/support/management/ticket",
        method: "GET",
        params: {
          offset: 1,
          limit: 10,
          query: "",
          priorities: "",
          statuses: "",
          date: "",
          ...(params || {}),
        },
      }),
    }),

    getManagementTicketDetail: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: "/api/v1/support/management/ticket/detail",
        method: "GET",
        params: { id },
      }),
    }),

    saveManagementTicket: builder.mutation<any, any>({
      // Handles files: ensure payload has `Files?: File[]` or single File
      query: (data) => {
        const fd = new FormData();

        // Prefer explicit handling for files to match ASP.NET Core model binder
        // If data.Files is File or File[], append as Files or Files[i]
        const files = (data?.Files ?? data?.files) as File | File[] | undefined;
        if (files instanceof File) {
          fd.append("Files", files);
        } else if (Array.isArray(files)) {
          files.forEach((f, i) => {
            // Both "Files" and "Files[i]" are generally acceptable; we'll use indexed
            fd.append(`Files[${i}]`, f);
          });
        }

        // Append remaining fields using helper (excluding Files to avoid duplication)
        const { Files, files: filesLower, ...rest } = data || {};
        objectToFormData(rest, fd);

        return {
          url: "/api/v1/support/management/ticket/save",
          method: "POST",
          body: fd,
        };
      },
    }),

    deleteManagementTicket: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: "/api/v1/support/management/ticket/delete",
        method: "POST",
        body: objectToFormData({ id }),
      }),
    }),

    bulkDeleteManagementTickets: builder.mutation<any, { ids: string }>({
      // ids should be a comma-separated string as per controller signature
      query: ({ ids }) => ({
        url: "/api/v1/support/management/ticket/bulk/delete",
        method: "POST",
        body: objectToFormData({ ids }),
      }),
    }),

    /* ---------- Management: replies ---------- */
    getTicketReplies: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: "/api/v1/support/management/ticket/reply/all",
        method: "GET",
        params: { id },
      }),
    }),
    saveTicketReply: builder.mutation<any, any>({
      // create/update reply; controller decides based on SupportTicketReplyId
      query: (data) => ({
        url: "/api/v1/support/management/ticket/reply/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
  }),
});

export const {
  /* user */
  useGetAllPrioritiesQuery,
  useGetAllStatusesQuery,
  useGetUserTicketsQuery,
  useSaveUserTicketMutation,

  /* management: form datasource */
  useGetManagementFormDatasourceQuery,

  /* management: teams */
  useGetAllSupportTeamsQuery,
  useSaveSupportTeamMutation,
  useDeleteSupportTeamMutation,

  /* management: tickets */
  useGetManagementTicketsQuery,
  useGetManagementTicketDetailQuery,
  useSaveManagementTicketMutation,
  useDeleteManagementTicketMutation,
  useBulkDeleteManagementTicketsMutation,

  /* management: replies */
  useGetTicketRepliesQuery,
  useSaveTicketReplyMutation,
} = supportAPI;
