import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import toaster from "../../../components/toster";
import { useGetRestrictionsQuery, useDeleteRestrictionMutation } from "../../../redux/restriction/restrictionAPI";
import { useFilter } from "../../../hooks/useFilter";

interface IFilter {
  query: string;
}

const RestrictionList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [rowTotal, setRowTotal] = useState(0);
  const [limit, setLimit] = useState(10);

  const {
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
    defaultValues: { query: "" },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetRestrictionsQuery({
    query: searchText,
    limit,
    offset,
    ...filterData,
  });

  const [deleteRestriction, { isLoading: deleting }] = useDeleteRestrictionMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteRestriction(id).unwrap();
      toaster.success(t("Common.Deleted"));
      refetch();
    } catch {
      toaster.error(t("Common.DeleteFailed"));
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
      key: "Value",
      label: t("Restriction.Value"),
      render: (row: any) => (
        <span className="font-mono text-sm font-medium">{row.Value || "N/A"}</span>
      ),
    },
    {
      key: "Reason",
      label: t("Restriction.Reason"),
      render: (row: any) => (
        <span className="text-sm">{row.Reason || "—"}</span>
      ),
    },
    {
      key: "Narration",
      label: t("Restriction.Narration"),
      render: (row: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] inline-block">
          {row.Narration || "—"}
        </span>
      ),
    },
    {
      key: "IsActive",
      label: t("Restriction.IsActive"),
      render: (row: any) => (
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${row.IsActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
          {row.IsActive ? t("Common.Yes") : t("Common.No")}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("Common.Actions"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            title={t("Form.Edit")}
            onClick={() => navigate(`/admin/setting/restriction/edit?id=${row.RestrictionId}`)}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary"
          >
            <MdOutlineEdit size={20} />
          </button>
          <button
            title={t("Form.Delete")}
            onClick={() => {
              if (confirm(t("Common.ConfirmDelete"))) {
                handleDelete(row.RestrictionId);
              }
            }}
            className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={deleting}
          >
            <MdDeleteOutline size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ComponentCard title={t("Restriction.Title")}>
        <>
          <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder={t("Common.Search")}
                value={searchText}
                onChange={(e) => handleFilterSearch(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate("/admin/setting/restriction/new")}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                {t("Restriction.AddNew")}
              </button>
            </div>
          </div>

          <DataGrid
            columns={columns}
            isLoading={isLoading}
            data={data?.Data || []}
            text={t("DataGrid.TotalRecords", { count: rowTotal })}
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

export default RestrictionList;
