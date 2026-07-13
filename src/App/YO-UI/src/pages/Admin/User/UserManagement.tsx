import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { MdOutlineEdit, MdDeleteOutline, MdAdminPanelSettings } from "react-icons/md";
import { BiHistory } from "react-icons/bi";
import { AiOutlineLock } from "react-icons/ai";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import FilterUserManagement from "./FilterUserManagement";
import ResetPasswordModal from "./ResetPasswordModal";
import LoginHistoryModal from "./LoginHistoryModal";
import toaster from "../../../components/toster";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useGetRolesQuery
} from "../../../redux/user/userAPI";
import { useFilter } from "../../../hooks/useFilter";
import { PermissionGate } from "../../../components/guards/PermissionGate";
import { API } from "../../../config/apiUrls";

interface IFilter {
  email: string;
  roleId: string[];
}

const UserManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isResetPassword, setIsResetPassword] = useState<any | null>(null);
  const [loginHistoryUser, setLoginHistoryUser] = useState<any | null>(null);
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
      email: "",
      roleId: []
    },
    limit,
    enableFilterList: true,
  });

  const { data, isLoading, refetch } = useGetUsersQuery({
    search: searchText,
    limit,
    offset,
    ...filterData,
  });

  const { data: roleData } = useGetRolesQuery({
    offset: 1,
    limit: 1000,
  });


  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id).unwrap();
      toaster.success(t("UserManagement.Deleted"));
      refetch();
    } catch {
      toaster.error(t("UserManagement.DeleteFailed"));
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
      label: t("UserManagement.Name"),
      render: (row: any) => (
        <Link
          to={`/admin/user/edit?id=${row.AppUserId}`}
          className="flex items-center gap-2 group-hover:text-primary pr-2"
        >
          {row.FirstName + " " + row.LastName || "N/A"}
        </Link>
      ),
    },
    { key: "Email", label: t("UserManagement.Email") },
    {
      key: "PhoneNumber", label: t("UserManagement.PhoneNumber"),
    },
    { key: "RoleName", label: t("UserManagement.Roles"), render: (row: any) => row.RoleName || "N/A" },
    {
      key: "IsActive",
      label: t("UserManagement.Status"),
      render: (row: any) => (
<span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${row.IsActive ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            }`}>
          {row.IsActive ? t("Common.Active") : t("Common.Inactive")}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("UserManagement.Actions"),
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <PermissionGate routeUrl={API.USER.MANAGEMENT_SAVE}>
            <button
              title={t("Form.Edit")}
              onClick={() => {
                navigate(`/admin/user/edit?id=${row.AppUserId}`);
              }}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary"
            >
              <MdOutlineEdit size={20} />
            </button>
          </PermissionGate>
          <PermissionGate routeUrl={API.USER.MANAGEMENT_DELETE}>
            <button
              title={t("Form.Delete")}
              onClick={() => {
                if (confirm(t("Common.Yes"))) {
                  handleDelete(row.AppUserId);
                }
              }}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
              disabled={deleting}
            >
              <MdDeleteOutline size={20} />
            </button>
          </PermissionGate>
          <PermissionGate routeUrl={API.USER.MANAGEMENT_RESET_PASSWORD}>
            <button
              title={t("UserManagement.ResetPassword")}
              onClick={() => {
                setIsResetPassword(row);
              }}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-yellow-500 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            >
              <AiOutlineLock size={20} />
            </button>
          </PermissionGate>
          <PermissionGate routeUrl={API.USER.MANAGEMENT_LOGIN_HISTORY(0).replace("0", "")}>
            <button
              title={t("UserManagement.LoginHistory")}
              onClick={() => {
                setLoginHistoryUser(row);
              }}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-green-500 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <BiHistory size={20} />
            </button>
          </PermissionGate>
          <PermissionGate routeUrl={API.PERMISSION.USER_BY_ID(0).replace("0", "")}>
            <button
              title={t("UserManagement.Permissions")}
              onClick={() => {
                navigate(`/admin/user/permission?userId=${row.AppUserId}`);
              }}
               className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-purple-500 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <MdAdminPanelSettings size={20} />
            </button>
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ComponentCard title={t("UserManagement.Title")}>
        <>
          <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <FilterUserManagement
              control={control}
              handleSubmit={handleSubmit}
              onFilterSubmit={onFilterSubmit}
              handleFilterRemove={handleFilterRemove}
              handleFilterReset={handleFilterReset}
              handleFilterSearch={handleFilterSearch}
              filterList={filterList}
              setFilter={setFilter}
              roles={roleData?.Data || []}
            />
            <div className="relative">
              <PermissionGate routeUrl={API.USER.MANAGEMENT_SAVE}>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/admin/user/new");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  {t("UserManagement.AddNew")}
                </button>
              </PermissionGate>
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

      <ResetPasswordModal
        isOpen={!!isResetPassword}
        user={isResetPassword}
        onClose={() => setIsResetPassword(null)}
      />
      <LoginHistoryModal
        isOpen={!!loginHistoryUser}
        user={loginHistoryUser}
        onClose={() => setLoginHistoryUser(null)}
      />
    </div>
  );
};

export default UserManagement;
