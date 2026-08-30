import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { MdOutlineEdit, MdDeleteOutline, MdContentCopy } from "react-icons/md";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import FilterThemeManagement from "./FilterThemeManagement";
import toaster from "../../../components/toster";
import {
  useGetStudioThemesQuery,
  useDeleteStudioThemeMutation,
  useDuplicateThemeMutation,
  useSetDefaultThemeMutation,
  useSetThemeStatusMutation,
} from "../../../redux/theme/themeStudioAPI";
import { useFilter } from "../../../hooks/useFilter";
import { PermissionGate } from "../../../components/guards/PermissionGate";

interface IFilter {
  name: string;
  status: string[];
}

const ThemeManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rowTotal, setRowTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const {
    control,
    handleSubmit,
    onFilterSubmit,
    handleFilterReset,
    handleFilterRemove,
    handleFilterSearch,
    handlePagination,
    filterList,
    setFilter,
    offset,
    searchText,
    filterData,
  } = useFilter<IFilter>({
    defaultValues: {
      name: "",
      status: [],
    },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetStudioThemesQuery({
    search: searchText,
    limit,
    offset,
    status: filterData.status?.join(",") || "all",
  });

  const [deleteTheme] = useDeleteStudioThemeMutation();
  const [duplicateTheme] = useDuplicateThemeMutation();
  const [setDefault] = useSetDefaultThemeMutation();
  const [setStatus] = useSetThemeStatusMutation();

  const handleDelete = async (guid: string) => {
    try {
      await deleteTheme({ YOThemeUniqueId: guid, cascadeLayouts: false }).unwrap();
      toaster.success(t("ThemeManagement.Deleted"));
      refetch();
    } catch {
      toaster.error(t("ThemeManagement.DeleteFailed"));
    }
  };

  const handleDuplicate = async (guid: string) => {
    try {
      const result = await duplicateTheme({ YOThemeUniqueId: guid }).unwrap();
      const newGuid = result?.YOThemeUniqueId;
      toaster.success(t("ThemeManagement.Duplicated"));
      refetch();
      if (newGuid) navigate(`/admin/theme/editor/${newGuid}`);
    } catch {
      toaster.error(t("ThemeManagement.DuplicateFailed"));
    }
  };

  const handleSetDefault = async (guid: string) => {
    try {
      await setDefault(guid).unwrap();
      toaster.success(t("ThemeManagement.DefaultSet"));
      refetch();
    } catch {
      toaster.error(t("ThemeManagement.DefaultFailed"));
    }
  };

  const handleSetStatus = async (guid: string, status: string) => {
    try {
      await setStatus({ YOThemeUniqueId: guid, Status: status }).unwrap();
      toaster.success(t("ThemeManagement.StatusChanged"));
      refetch();
    } catch {
      toaster.error(t("ThemeManagement.StatusChangeFailed"));
    }
  };

  useEffect(() => {
    if (data && data.Data) {
      if (data.Data.length > 0) {
        setRowTotal(data.Data[0]?.RowTotal || 0);
      } else {
        setRowTotal(0);
      }
    }
  }, [data]);

  const columns = [
    {
      key: "Name",
      label: t("ThemeManagement.Name"),
      render: (row: any) => (
        <Link
          to={`/admin/theme/editor/${row.YOThemeUniqueId}`}
          className="flex items-center gap-2 group-hover:text-primary pr-2"
        >
          <span className="font-medium">{row.Name || "N/A"}</span>
          <span className="text-xs text-gray-400">({row.Slug})</span>
        </Link>
      ),
    },
    { key: "Slug", label: t("ThemeManagement.Slug") },
    {
      key: "Status",
      label: t("ThemeManagement.Status"),
      render: (row: any) => {
        const status = row.Status ?? (row.IsActive ? "published" : "draft");
        const statusColors: Record<string, string> = {
          draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
          published: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
          under_review: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
          approved: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
          archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
        };
        return (
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusColors[status] || statusColors.draft}`}>
            {t(`ThemeManagement.Status.${status}`) || status}
          </span>
        );
      },
    },
    {
      key: "IsDefault",
      label: t("ThemeManagement.Default"),
      render: (row: any) => (
        <span className="inline-flex items-center justify-center">
          {row.IsDefault ? (
            <span className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
              {t("Common.Yes")}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">{t("Common.No")}</span>
          )}
        </span>
      ),
    },
    {
      key: "UpdatedOn",
      label: t("ThemeManagement.Updated"),
      render: (row: any) => row.UpdatedOn ? new Date(row.UpdatedOn).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      label: t("ThemeManagement.Actions"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/theme/editor/${row.YOThemeUniqueId}`}
            title={t("ThemeManagement.EditStudio")}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Link>
          <button
            title={t("ThemeManagement.Duplicate")}
            onClick={() => handleDuplicate(row.YOThemeUniqueId)}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <MdContentCopy size={20} />
          </button>
          {!row.IsDefault && row.Status === "published" && (
            <button
              title={t("ThemeManagement.SetDefault")}
              onClick={() => handleSetDefault(row.YOThemeUniqueId)}
              className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-amber-600 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          )}
          <button
            title={t("ThemeManagement.ChangeStatus")}
            onClick={() => handleSetStatus(row.YOThemeUniqueId, row.IsActive ? "archived" : "published")}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            title={t("Form.Delete")}
            onClick={() => {
              if (confirm(t("Common.ConfirmDelete"))) {
                handleDelete(row.YOThemeUniqueId);
              }
            }}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <MdDeleteOutline size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("ThemeManagement.Title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t("ThemeManagement.Subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/theme/create"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{t("ThemeManagement.CreateNew")}</span>
          </Link>
        </div>
      </div>

      <ComponentCard>
        <FilterThemeManagement
          control={control}
          handleSubmit={handleSubmit}
          onFilterSubmit={onFilterSubmit}
          handleFilterReset={handleFilterReset}
          handleFilterRemove={handleFilterRemove}
          handleFilterSearch={handleFilterSearch}
          filterList={filterList}
          setFilter={setFilter}
        />
        <DataGrid
          columns={columns}
          data={data?.Data || []}
          isLoading={isLoading}
          rowTotal={rowTotal}
          limit={limit}
          onLimitChange={setLimit}
          onPageChange={handlePagination}
          offset={offset}
          emptyMessage={t("ThemeManagement.EmptyMessage")}
        />
      </ComponentCard>
    </div>
  );
};

export default ThemeManagement;