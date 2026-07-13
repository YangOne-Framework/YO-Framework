import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

// Utility to build FormData for multipart form requests
function objectToFormData(obj: any, form = new FormData(), namespace = ""): FormData {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const formKey = namespace ? `${namespace}[${key}]` : key;

    if (value instanceof Date) {
      form.append(formKey, value.toISOString());
    } else if (value instanceof File) {
      // SPECIAL HANDLING FOR FILES: Don't use array notation for files
      if (namespace) {
        // If nested, use the nested key
        form.append(formKey, value);
      } else {
        // For top-level files, use simple field name (important for C# List<IFormFile>)
        form.append(key, value);
      }
    } else if (Array.isArray(value)) {
      value.forEach((el, i) => {
        if (el instanceof File) {
          // SPECIAL HANDLING FOR FILE ARRAYS: Use same field name for all files
          form.append(key, el); // Use simple key, not arrayKey
        } else {
          const arrayKey = `${formKey}[${i}]`;
          if (typeof el === "object" && el !== null) {
            objectToFormData(el, form, arrayKey);
          } else {
            form.append(arrayKey, el.toString());
          }
        }
      });
    } else if (typeof value === "object" && value !== null) {
      objectToFormData(value, form, formKey);
    } else if (value !== undefined && value !== null) {
      form.append(formKey, value.toString());
    }
  }

  return form;
}

export const knowledgeBaseAPI = createApi({
  reducerPath: "knowledgeBaseAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    // Save knowledge base files
    saveFiles: builder.mutation({
      query: (data) => ({
        url: "/api/v1/knowledgebase/save/files",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Save text-only KB content
    saveText: builder.mutation({
      query: (data) => ({
        url: "/api/v1/knowledgebase/save/text",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Delete a knowledge base file
    deleteFile: builder.mutation({
      query: (data) => ({
        url: "/api/v1/knowledgebase/delete/file",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Save target audiences for a KB entry
    saveAudiences: builder.mutation({
      query: (data) => ({
        url: "/api/v1/knowledgebase/audience/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Get categories available to an assistant
    getCategoriesByAssistant: builder.query({
      query: (params) => ({
        url: "/api/v1/knowledgebase/category/by-assistant",
        method: "GET",
        params, // expects { categoryId, aiAssistantId }
      }),
    }),

    // Get KB items by category and assistant
    getByCategory: builder.query({
      query: (params) => ({
        url: "/api/v1/knowledgebase/by-category",
        method: "GET",
        params, // expects { categoryId, aiAssistantId }
      }),
    }),
  }),
});

export const {
  useSaveFilesMutation,
  useSaveTextMutation,
  useDeleteFileMutation,
  useSaveAudiencesMutation,
  useGetCategoriesByAssistantQuery,
  useGetByCategoryQuery,
} = knowledgeBaseAPI;
