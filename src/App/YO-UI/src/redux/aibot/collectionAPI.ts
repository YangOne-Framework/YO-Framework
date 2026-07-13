import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

// Utility: Converts objects to FormData for multipart requests
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

export const collectionAPI = createApi({
  reducerPath: "collectionAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    // Get all collections
    getAllCollections: builder.query({
      query: (params) => ({
        url: "/api/v1/collection/all",
        method: "GET",
        params, // expects { offset, limit, query }
      }),
    }),

    // Get collections by assistant
    getCollectionsByAssistant: builder.query({
      query: (params) => ({
        url: "/api/v1/collection/assistant/all",
        method: "GET",
        params, // expects { assistantId, offset, limit, query }
      }),
    }),

    // Save collection (create or update)
    saveCollection: builder.mutation({
      query: (data) => ({
        url: "/api/v1/collection/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Delete collection
    deleteCollection: builder.mutation({
      query: (data) => ({
        url: "/api/v1/collection/delete",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
  }),
});

export const {
  useGetAllCollectionsQuery,
  useGetCollectionsByAssistantQuery,
  useSaveCollectionMutation,
  useDeleteCollectionMutation,
} = collectionAPI;
