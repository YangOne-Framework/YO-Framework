import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { MdOutlineEdit, MdDeleteOutline } from "react-icons/md";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import FilterRoleManagement from "./FilterRoleManagement";
import toaster from "../../../components/toster";
import { useGetRolesQuery, useDeleteRoleMutation } from "../../../redux/user/userAPI";
import { useFilter } from "../../../hooks/useFilter";

interface IFilter {
  roleName: string;
}

const RoleManagement = () => {
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
      roleName: "",
    },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetRolesQuery({
    query: searchText,
    limit,
    offset,
    ...filterData,
  });

  const [deleteRole, { isLoading: deleting }] = useDeleteRoleMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteRole(id).unwrap();
      toaster.success(t("RoleManagement.Deleted"));
      refetch();
    } catch {
      toaster.error(t("RoleManagement.DeleteFailed"));
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
      label: t("RoleManagement.Name"),
      render: (row: any) => (
        <Link
          to={`/admin/role/edit?id=${row.Id}`}
          className="flex items-center gap-2 group-hover:text-primary pr-2"
        >
          {row.Name || "N/A"}
        </Link>
      ),
    },
    {
      key: "IsActive",
      label: t("RoleManagement.IsActive"),
      render: (row: any) => (
<span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${row.IsActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}>
          {row.IsActive ? t("Common.Yes") : t("Common.No")}
        </span>
      ),
    },
    {
      key: "IsSystem",
      label: t("RoleManagement.IsSystem"),
      render: (row: any) => (
<span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${row.IsSystem ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}>
          {row.IsSystem ? t("Common.Yes") : t("Common.No")}
        </span>
      ),
    },
    {
      key: "IsTemporary",
      label: t("RoleManagement.IsTemporary"),
      render: (row: any) => (
<span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${row.IsTemporary ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}>
          {row.IsTemporary ? t("Common.Yes") : t("Common.No")}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("RoleManagement.Actions"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            title={t("Form.Edit")}
            onClick={() => {
              navigate(`/admin/role/edit?id=${row.Id}`);
            }}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary"
          >
            <MdOutlineEdit size={20} />
          </button>
          <button
            title={t("Form.Delete")}
            onClick={() => {
              if (confirm(t("Common.Yes"))) {
                handleDelete(row.Id);
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
      <ComponentCard title={t("RoleManagement.Title")}>
        <>
          <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <FilterRoleManagement
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
                onClick={() => {
                  navigate("/admin/role/new");
                }}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                {t("RoleManagement.AddNew")}
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

export default RoleManagement;
