import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

const objectToFormData = (obj: Record<string, any>) => {
  const fd = new FormData();
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(`${key}[]`, v instanceof Blob ? v : String(v)));
    } else if (value instanceof Blob) {
      fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  });
  return fd;
};

export const themeAPI = createApi({
  reducerPath: "themeAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    // Get all categories
    getAllThemes: builder.query({
      query: (params) => ({
        url: "/api/v1/theme/all",
        method: "GET",
        params, // expects { offset, limit, query }
      }),
    }),
   getThemeDetail: builder.query({
      query: (id) => ({
        url: "/api/v1/theme/detail",
        method: "GET",
        params: { id }, // expects { KnowledgeBaseCategoryId }
      }),
    }),
    // Save category (create or update)
    saveTheme: builder.mutation({
      query: (data) => ({
        url: "/api/v1/theme/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Delete category
    deleteTheme: builder.mutation({
      query: (data) => ({
        url: "/api/v1/theme/delete",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
  }),
});

export const {
useGetAllThemesQuery,
useGetThemeDetailQuery,
useSaveThemeMutation,
useDeleteThemeMutation
} = themeAPI;
