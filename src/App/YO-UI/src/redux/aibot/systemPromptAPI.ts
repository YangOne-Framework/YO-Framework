import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";


/** unwrap helper for { data: ... } envelopes (safe if already raw) */
const unwrap = <T>(resp: any): T => (resp && "data" in resp ? resp.data : resp);

/** Build FormData from a plain object (supports File/Blob, arrays, and primitives) */
const toFormData = (obj: Record<string, any>) => {
  const fd = new FormData();
  Object.entries(obj ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // arrays -> key[]=v1, key[]=v2
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v instanceof Blob) {
          fd.append(`${key}[]`, v);
        } else {
          fd.append(`${key}[]`, String(v));
        }
      });
      return;
    }

    if (value instanceof Blob) {
      fd.append(key, value); // File/Blob kept as-is
    } else if (typeof value === "object") {
      // flatten shallow objects as JSON string if backend expects a string field
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  });
  return fd;
};

/** ----- API Slice ----- */
export const systemPromptAPI = createApi({
  reducerPath: "systemPromptAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["SystemPrompt", "SystemPromptList"],
  endpoints: (builder) => ({
    /** GET /api/v1/systemprompt/all?offset=&limit=&query= */
    getAllSystemPrompts: builder.query({
      query: (params:any) => ({
        url: "/api/v1/systemprompt/all",
        method: "GET",
        params: params,
      })
    }),

    /** GET /api/v1/systemprompt/detail?systemPromptId= */
    getSystemPromptDetail: builder.query({
      query: (systemPromptId) => ({
        url: "/api/v1/systemprompt/detail",
        method: "GET",
        params: { systemPromptId },
      })
    }),

    /** GET /api/v1/systemprompt/bycode?code= */
    getSystemPromptByCode: builder.query({
      query: (code) => ({
        url: "/api/v1/systemprompt/bycode",
        method: "GET",
        params: { code },
      })
    }),

    /** POST (multipart) /api/v1/systemprompt/save */
    saveSystemPrompt: builder.mutation({
      query: (body) => {
        const form = toFormData(body);
        return {
          url: "/api/v1/systemprompt/save",
          method: "POST",
          // IMPORTANT: do NOT set Content-Type manually; let the browser add the boundary
          body: form,
        };
      }
    }),

    /** POST (multipart) /api/v1/systemprompt/delete */
    deleteSystemPrompt: builder.mutation({
      query: (body) => {
        const form = toFormData(body);
        return {
          url: "/api/v1/systemprompt/delete",
          method: "POST",
          body: form,
        };
      }
    }),

    /** POST (multipart) /api/v1/systemprompt/save/active */
    saveActiveSystemPrompt: builder.mutation({
      query: (body) => {
        const form = toFormData(body);
        return {
          url: "/api/v1/systemprompt/save/active",
          method: "POST",
          body: form,
        };
      }
    }),
  }),
});

export const {
  useGetAllSystemPromptsQuery,
  useGetSystemPromptDetailQuery,
  useGetSystemPromptByCodeQuery,
  useSaveSystemPromptMutation,
  useDeleteSystemPromptMutation,
  useSaveActiveSystemPromptMutation,
  useLazyGetAllSystemPromptsQuery,
  useLazyGetSystemPromptDetailQuery,
  useLazyGetSystemPromptByCodeQuery,
} = systemPromptAPI;
