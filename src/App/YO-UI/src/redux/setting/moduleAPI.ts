import { createApi } from "../createUncachedApi";
import { baseQueryWithAuth } from "../../config/apiConfig";
import { API } from "../../config/apiUrls";

export type ModuleActionRequest = {
  moduleName: string;
  version?: string;
  purgeData?: boolean;
};

export const moduleAPI = createApi({
  reducerPath: "moduleAPI",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Module", "ModuleJournal"],
  refetchOnMountOrArgChange: true,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getModules: builder.query<any, { pageNo?: number; pageSize?: number; status?: number; query?: string }>({
      query: ({ pageNo = 1, pageSize = 50, status = 1, query = "" }) => ({
        url: API.MODULE.ALL(pageNo, pageSize, String(status), query),
        method: "GET",
      }),
      providesTags: ["Module"],
    }),

    uploadModule: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: API.MODULE.UPLOAD,
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Module"],
    }),

    installModule: builder.mutation<any, ModuleActionRequest>({
      query: (data) => ({
        url: API.MODULE.INSTALL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Module"],
    }),

    enableModule: builder.mutation<any, ModuleActionRequest>({
      query: (data) => ({
        url: API.MODULE.ENABLE,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Module"],
    }),

    disableModule: builder.mutation<any, ModuleActionRequest>({
      query: (data) => ({
        url: API.MODULE.DISABLE,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Module"],
    }),

    upgradeModule: builder.mutation<any, ModuleActionRequest>({
      query: (data) => ({
        url: API.MODULE.UPGRADE,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Module"],
    }),

    rollbackModule: builder.mutation<any, ModuleActionRequest>({
      query: (data) => ({
        url: API.MODULE.ROLLBACK,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Module"],
    }),

    uninstallModule: builder.mutation<any, ModuleActionRequest>({
      query: (data) => ({
        url: API.MODULE.UNINSTALL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Module"],
    }),

    pingModule: builder.mutation<any, { moduleName: string }>({
      query: (data) => ({
        url: API.MODULE.PING(data.moduleName),
        method: "GET",
      }),
    }),

    getModuleJournal: builder.query<any, { moduleName: string; count?: number }>({
      query: ({ moduleName, count = 50 }) => ({
        url: API.MODULE.JOURNAL(moduleName),
        method: "GET",
        params: { count },
      }),
      providesTags: ["ModuleJournal"],
    }),
  }),
});

export const {
  useGetModulesQuery,
  useLazyGetModulesQuery,
  useUploadModuleMutation,
  useInstallModuleMutation,
  useEnableModuleMutation,
  useDisableModuleMutation,
  useUpgradeModuleMutation,
  useRollbackModuleMutation,
  useUninstallModuleMutation,
  usePingModuleMutation,
  useGetModuleJournalQuery,
  useLazyGetModuleJournalQuery,
} = moduleAPI;
