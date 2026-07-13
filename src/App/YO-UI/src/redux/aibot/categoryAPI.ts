import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

export function objectToFormData(obj: any, form = new FormData(), namespace = "") {
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
  console.log("form", form);
  return form;
}

export const categoryAPI = createApi({
  reducerPath: "categoryAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    // Get all categories
    getAllCategories: builder.query({
      query: (params) => ({
        url: "/api/v1/collection/category/all",
        method: "GET",
        params, // expects { offset, limit, query }
      }),
    }),
    // Get category detail by ID
     getCategoryDetail: builder.query({
      query: (id) => ({
        url: "/api/v1/collection/category/detail",
        method: "GET",
        params: { id }, // expects { KnowledgeBaseCategoryId }
      }),
    }),

    // Save category (create or update)
    saveCategory: builder.mutation({
      query: (data) => ({
        url: "/api/v1/collection/category/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // Delete category
    deleteCategory: builder.mutation({
      query: (data) => ({
        url: "/api/v1/collection/category/delete",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useSaveCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoryDetailQuery,
} = categoryAPI;

