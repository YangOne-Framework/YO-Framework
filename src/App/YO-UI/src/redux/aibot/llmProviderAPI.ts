import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";

function objectToFormData(obj:any, form = new FormData(), namespace = "") {
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
// function objectToFormData(
//   obj: any,
//   form: FormData = new FormData(),
//   namespace = ""
// ): FormData {
//   if (obj == null) return form;

//   const isPrimitive = (v: any) =>
//     v === null || typeof v !== "object" || v instanceof Date || v instanceof File || v instanceof Blob;

//   const makeKey = (parent: string, child: string | number, useDot = true) =>
//     parent ? (useDot ? `${parent}.${child}` : `${parent}[${child}]`) : String(child);

//   for (const key of Object.keys(obj)) {
//     const value = obj[key];

//     // base key for this level (objects use dot-join)
//     const baseKey = makeKey(namespace, key, true);

//     if (value === undefined || value === null) {
//       continue;
//     }

//     if (value instanceof Date) {
//       form.append(baseKey, value.toISOString());
//       continue;
//     }

//     if (value instanceof File || value instanceof Blob) {
//       form.append(baseKey, value);
//       continue;
//     }

//     if (Array.isArray(value)) {
//       // Arrays: ParentKey[0], and if element is object => ParentKey[0].Prop
//       value.forEach((el, i) => {
//         const arrKey = makeKey(baseKey, i, false); // baseKey[0]
//         if (el instanceof Date) {
//           form.append(arrKey, el.toISOString());
//         } else if (el instanceof File || el instanceof Blob) {
//           form.append(arrKey, el);
//         } else if (isPrimitive(el)) {
//           form.append(arrKey, String(el));
//         } else {
//           // array element is an object -> recurse with dot after index: baseKey[0].Prop
//           objectToFormData(el, form, arrKey);
//         }
//       });
//       continue;
//     }

//     if (typeof value === "object") {
//       // Objects: Parent.Child
//       objectToFormData(value, form, baseKey);
//       continue;
//     }

//     // primitives
//     form.append(baseKey, String(value));
//   }

//   return form;
// }

export const llmProviderAPI = createApi({
  reducerPath: "llmProviderAPI",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    // --- Provider lifecycle ---
    saveProvider: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    deleteProvider: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/delete",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveProviderActive: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/save/active",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // --- Provider Configs ---
    saveProviderConfig: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/config/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    deleteProviderConfig: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/config/delete",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    getProviderConfigs: builder.query({
      query: (params) => ({
        url: "/api/v1/llmprovider/config/get",
        method: "GET",
        params,
      }),
    }),

    // --- Model Configs ---
    saveProviderModelConfig: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/model/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    deleteProviderModelConfig: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/model/delete",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    getProviderModelConfigsByProvider: builder.query({
      query: (params) => ({
        url: "/api/v1/llmprovider/model/all",
        method: "GET",
        params,
      }),
    }),
    getProviderDefaultModel: builder.query({
      query: (params) => ({
        url: "/api/v1/llmprovider/model/default",
        method: "GET",
        params,
      }),
    }),
    saveProviderDefaultModel: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/model/default/save",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),
    saveEnsureDefaultModel: builder.mutation({
      query: (data) => ({
        url: "/api/v1/llmprovider/model/default/ensure",
        method: "POST",
        body: objectToFormData(data),
      }),
    }),

    // --- Lists & Details ---
    getProviders: builder.query({
      query: (params) => ({
        url: "/api/v1/llmprovider/all",
        method: "GET",
        params,
      }),
    }),
    getProviderDetail: builder.query({
      query: (params) => ({
        url: "/api/v1/llmprovider/detail",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useSaveProviderMutation,
  useDeleteProviderMutation,
  useSaveProviderActiveMutation,
  useSaveProviderConfigMutation,
  useDeleteProviderConfigMutation,
  useGetProviderConfigsQuery,
  useSaveProviderModelConfigMutation,
  useDeleteProviderModelConfigMutation,
  useGetProviderModelConfigsByProviderQuery,
  useGetProviderDefaultModelQuery,
  useSaveProviderDefaultModelMutation,
  useSaveEnsureDefaultModelMutation,
  useGetProvidersQuery,
  useGetProviderDetailQuery,
} = llmProviderAPI;
