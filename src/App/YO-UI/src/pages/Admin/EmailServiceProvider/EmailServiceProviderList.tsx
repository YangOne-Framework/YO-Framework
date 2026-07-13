import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MdOutlineEdit, MdDeleteOutline, MdStar, MdStarBorder, MdSettings } from "react-icons/md";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import FilterEmailServiceProvider from "./FilterEmailServiceProvider";
import toaster from "../../../components/toster";
import {
  useGetEmailServiceProvidersQuery,
  useDeleteEmailServiceProviderMutation,
  useSetDefaultProviderMutation,
  useUpdateStatusMutation,
} from "../../../redux/email/emailAPI";
import { useFilter } from "../../../hooks/useFilter";
import { useTranslation } from "react-i18next";

interface IFilter {
  name: string;
}

const EmailServiceProviderList = () => {
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
    defaultValues: { name: "" },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetEmailServiceProvidersQuery({
    query: searchText,
    limit,
    offset,
    ...filterData,
  });

  const [deleteProvider] = useDeleteEmailServiceProviderMutation();
  const [setDefault] = useSetDefaultProviderMutation();
  const [updateStatus] = useUpdateStatusMutation();

  const handleDelete = async (name: string) => {
    try {
      await deleteProvider(name).unwrap();
      toaster.success(t("EmailProvider.Actions"));
      refetch();
    } catch {
      toaster.error(t("EmailProvider.Actions"));
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefault(id).unwrap();
      toaster.success(t("EmailProvider.SetDefault"));
      refetch();
    } catch {
      toaster.error(t("EmailProvider.Actions"));
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await updateStatus({ emailServiceProviderId: id, isActive }).unwrap();
      toaster.success(t("Common.Status"));
      refetch();
    } catch {
      toaster.error(t("EmailProvider.Actions"));
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
      label: t("EmailProvider.Name"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          {row.IsDefault && <MdStar className="text-yellow-500" size={18} />}
          <button
            onClick={() => navigate(`/admin/setting/emailserviceprovider/edit?id=${row.EmailServiceProviderId}`)}
            className="hover:text-primary pr-2 cursor-pointer"
          >
            {row.Name || "N/A"}
          </button>
        </div>
      ),
    },
    {
      key: "Description",
      label: t("EmailProvider.Description"),
      render: (row: any) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] block">
          {row.Description || "\u2014"}
        </span>
      ),
    },
    {
      key: "IsDefault",
      label: t("EmailProvider.IsDefault"),
      render: (row: any) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            row.IsDefault ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {row.IsDefault ? t("Common.Yes") : t("Common.No")}
        </span>
      ),
    },
    {
      key: "IsActive",
      label: t("EmailProvider.Status"),
      render: (row: any) => (
        <span
          onClick={() => handleToggleStatus(row.EmailServiceProviderId, !row.IsActive)}
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium cursor-pointer ${
            row.IsActive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {row.IsActive ? t("EmailProvider.Active") : t("EmailProvider.Inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("EmailProvider.Actions"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          {!row.IsDefault && (
            <button
              title={t("EmailProvider.SetDefault")}
              onClick={() => handleSetDefault(row.EmailServiceProviderId)}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-yellow-500"
            >
              <MdStarBorder size={20} />
            </button>
          )}
          <button
            title={t("EmailProvider.Settings")}
            onClick={() => navigate(`/admin/setting/emailserviceprovider/${row.EmailServiceProviderId}/settings`)}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-blue-500"
          >
            <MdSettings size={20} />
          </button>
          <button
            title={t("EmailProvider.Edit")}
            onClick={() => navigate(`/admin/setting/emailserviceprovider/edit?id=${row.EmailServiceProviderId}`)}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary"
          >
            <MdOutlineEdit size={20} />
          </button>
          <button
            title={t("EmailProvider.Delete")}
            onClick={() => {
              if (confirm(t("Common.Yes"))) {
                handleDelete(row.Name);
              }
            }}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <MdDeleteOutline size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ComponentCard title={t("EmailProvider.Title")}>
        <>
          <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <FilterEmailServiceProvider
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
                onClick={() => navigate("/admin/setting/emailserviceprovider/new")}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                {t("EmailProvider.AddNew")}
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

export default EmailServiceProviderList;
