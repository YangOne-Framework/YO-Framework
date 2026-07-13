import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { MdOutlineEdit, MdDeleteOutline, MdOutlinePreview, MdDesignServices } from "react-icons/md";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import CmsPageFilter from "./CmsPageFilter";
import toaster from "../../../components/toster";
import { useGetYoPageListQuery, useDeleteYoPageMutation } from "../../../redux/cmspage/cmsPageAPI";
import { useFilter } from "../../../hooks/useFilter";

interface IFilter {
  title: string;
  status: string;
}

const YoPageList = () => {
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
    defaultValues: { title: "", status: "" },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetYoPageListQuery({
    search: searchText,
    limit,
    offset,
    ...filterData,
  });

  const [deletePage, { isLoading: deleting }] = useDeleteYoPageMutation();

  const handleDelete = async (pageId: string) => {
    if (!pageId) {
      toaster.error("Cannot delete page: missing identifier");
      return;
    }
    if (!confirm("Delete this page?")) return;
    try {
      await deletePage(pageId).unwrap();
      toaster.success("Page deleted");
      refetch();
    } catch {
      toaster.error("Failed to delete page");
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

  const isGuidValid = (guid: string) => guid && guid.length > 0;

  const statusBadge = (status: string) => {
    const isPublished = status === "published";
    return (
      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
        isPublished
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
      }`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "Name",
      label: "Title",
      render: (row: any) => (
        isGuidValid(row.PageGUID) ? (
          <Link
            to={`/admin/yopage/edit?id=${row.PageGUID}`}
            className="flex items-center gap-2 group-hover:text-primary pr-2"
          >
            {row.Name || "N/A"}
          </Link>
        ) : (
          <span className="flex items-center gap-2 pr-2 text-gray-400">
            {row.Name || "N/A"}
          </span>
        )
      ),
    },
    {
      key: "Slug",
      label: "Slug",
      render: (row: any) => (
        <span className="text-gray-500 dark:text-gray-400">/{row.Slug}</span>
      ),
    },
    {
      key: "Status",
      label: "Status",
      render: (row: any) => statusBadge(row.Status),
    },
    {
      key: "Version",
      label: "Version",
      render: (row: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">v{row.Version}</span>
      ),
    },
    {
      key: "UpdatedOn",
      label: "Last Modified",
      render: (row: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {row.UpdatedOn ? new Date(row.UpdatedOn).toLocaleString() : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            title="Open Builder"
            onClick={() => navigate(`/admin/yopage/builder?id=${row.PageGUID}`)}
            disabled={!isGuidValid(row.PageGUID)}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-brand-600 cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <MdDesignServices size={20} />
          </button>
          <button
            title="Preview"
            onClick={() => navigate(`/admin/yopage/preview?id=${row.PageGUID}`)}
            disabled={!isGuidValid(row.PageGUID)}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <MdOutlinePreview size={20} />
          </button>
          <button
            title="Edit"
            onClick={() => navigate(`/admin/yopage/edit?id=${row.PageGUID}`)}
            disabled={!isGuidValid(row.PageGUID)}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <MdOutlineEdit size={20} />
          </button>
          <button
            title="Delete"
            onClick={() => handleDelete(row.PageGUID)}
            disabled={deleting || !isGuidValid(row.PageGUID)}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <MdDeleteOutline size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ComponentCard title="CMS Pages">
        <>
          <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <CmsPageFilter
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
                onClick={() => navigate("/admin/yopage/new")}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                New Page
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

export default YoPageList;
