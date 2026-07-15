import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MdOutlineEdit, MdDeleteOutline, MdDesignServices } from "react-icons/md";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import LayoutFilter from "./LayoutFilter";
import toaster from "../../../components/toster";
import { useGetMasterLayoutsQuery, useDeleteMasterLayoutMutation } from "../../../redux/layout/layoutAPI";
import { useFilter } from "../../../hooks/useFilter";

interface IFilter {
  name: string;
}

const LayoutList = () => {
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
    defaultValues: { name: "" },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetMasterLayoutsQuery({
    query: searchText,
    limit,
    offset,
    ...filterData,
  });

  const [deleteLayout, { isLoading: deleting }] = useDeleteMasterLayoutMutation();

  const handleDelete = async (layoutGuid: string) => {
    if (!confirm("Delete this layout? Pages using it will fall back to no layout.")) return;
    try {
      await deleteLayout(layoutGuid).unwrap();
      toaster.success("Layout deleted");
      refetch();
    } catch {
      toaster.error("Failed to delete layout");
    }
  };

  useEffect(() => {
    const d = data as any;
    const items: any[] = d?.Data ?? d?.data ?? [];
    if (items.length > 0) {
      setRowTotal(items[0]?.RowTotal ?? 0);
    } else {
      setRowTotal(0);
    }
  }, [data]);

  const columns = [
    {
      key: "Name",
      label: "Name",
      render: (row: any) => (
        <span className="font-medium text-gray-900 dark:text-white">{row.Name || "N/A"}</span>
      ),
    },
    {
      key: "Description",
      label: "Description",
      render: (row: any) => (
        <span className="text-gray-500 dark:text-gray-400">{row.Description || "-"}</span>
      ),
    },
    {
      key: "HasHeader",
      label: "Header",
      render: (row: any) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${row.HasHeader ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
          {row.HasHeader ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "HasFooter",
      label: "Footer",
      render: (row: any) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${row.HasFooter ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
          {row.HasFooter ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "Sidebar",
      label: "Sidebar",
      render: (row: any) => (
        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {row.Sidebar || "none"}
        </span>
      ),
    },
    {
      key: "YOThemeId",
      label: "Theme",
      render: (row: any) => (
        <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {row.YOThemeId ? "Assigned" : "Default"}
        </span>
      ),
    },
    {
      key: "IsSystem",
      label: "System",
      render: (row: any) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${row.IsSystem ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
          {row.IsSystem ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            title="Edit Design"
            onClick={() => navigate(`/admin/layout/design?id=${row.MasterLayoutUniqueId}`)}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-brand-600 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20"
          >
            <MdDesignServices size={20} />
          </button>
          <button
            title="Edit Settings"
            onClick={() => navigate(`/admin/layout/edit?id=${row.MasterLayoutUniqueId}`)}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary"
          >
            <MdOutlineEdit size={20} />
          </button>
          {!row.IsSystem && (
            <button
              title="Delete"
              onClick={() => handleDelete(row.MasterLayoutUniqueId)}
              className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
              disabled={deleting}
            >
              <MdDeleteOutline size={20} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ComponentCard title="Master Layouts">
        <>
          <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <LayoutFilter
              control={control}
              handleSubmit={handleSubmit}
              onFilterSubmit={onFilterSubmit}
              handleFilterRemove={handleFilterRemove}
              handleFilterReset={handleFilterReset}
              handleFilterSearch={handleFilterSearch}
              filterList={filterList}
              setFilter={setFilter}
            />
            <div className="relative">
              <button
                type="button"
                onClick={() => navigate("/admin/layout/new")}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                New Layout
              </button>
            </div>
          </div>

          <DataGrid
            columns={columns}
            isLoading={isLoading}
            data={(data as any)?.Data ?? (data as any)?.data ?? []}
            text={`Total: ${rowTotal}`}
            currentPage={offset}
            totalPage={Math.ceil(rowTotal / limit) || 1}
            isLine={true}
            onPageChange={handlePagination}
            isShadow
          />
        </>
      </ComponentCard>
    </div>
  );
};

export default LayoutList;
