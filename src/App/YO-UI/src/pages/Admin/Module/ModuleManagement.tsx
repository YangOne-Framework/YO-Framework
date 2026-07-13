import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import {
  MdOutlineUpload,
  MdOutlineVisibility,
  MdDeleteOutline,
  MdUpdate,
  MdUndo,
  MdPlayArrow,
  MdStop,
} from "react-icons/md";
import DataGrid from "../../../components/dataGrid/dataGrid";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  useGetModulesQuery,
  useEnableModuleMutation,
  useDisableModuleMutation,
  useUpgradeModuleMutation,
  useRollbackModuleMutation,
  useUninstallModuleMutation,
  moduleAPI,
} from "../../../redux/setting/moduleAPI";
import { useFilter } from "../../../hooks/useFilter";
import { ModuleInfo } from "../../../types/moduleTypes";
import ModuleDetailDrawer from "./ModuleDetailDrawer";
import InstallModuleModal from "./InstallModuleModal";
import toaster from "../../../components/toster";
import FilterModule from "./FilterModule";

const statusTabs = [
  { id: "1", label: "Installed" },
  { id: "0", label: "Disabled" },
  { id: "-1", label: "All" },
  { id: "2", label: "Uninstalled" },
];

const ModuleManagement = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("1");
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [limit] = useState(20);

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
  } = useFilter<any>({
    defaultValues: {},
    limit,
    enableFilterList: true,
  });

  const { data, isLoading } = useGetModulesQuery({
    pageNo: offset,
    pageSize: limit,
    status: Number(activeTab),
    query: searchText,
  });

  const dispatch = useDispatch();

  const invalidateModules = () => {
    dispatch(moduleAPI.util.invalidateTags(["Module"]));
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    handlePagination(1);
  };

  const [enableModule] = useEnableModuleMutation();
  const [disableModule] = useDisableModuleMutation();
  const [upgradeModule] = useUpgradeModuleMutation();
  const [rollbackModule] = useRollbackModuleMutation();
  const [uninstallModule] = useUninstallModuleMutation();

  const modules: ModuleInfo[] = data?.Data || [];
  const rowTotal = modules.length > 0 && modules[0]?.RowTotal !== undefined ? modules[0].RowTotal : 0;

  const handleAction = async (
    action: string,
    module: ModuleInfo,
    extra?: { version?: string; purgeData?: boolean }
  ) => {
    const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);
    if (!window.confirm(`${actionLabel} module "${module.Name}"?`)) return;
    try {
      let result: any;
      const payload = { moduleName: module.Name, ...extra };
      switch (action) {
        case "enable":
          result = await enableModule(payload).unwrap();
          break;
        case "disable":
          result = await disableModule(payload).unwrap();
          break;
        case "upgrade":
          result = await upgradeModule(payload).unwrap();
          break;
        case "rollback":
          result = await rollbackModule({ ...payload, version: extra?.version || module.Version }).unwrap();
          break;
        case "uninstall":
          result = await uninstallModule({ ...payload, purgeData: extra?.purgeData ?? false }).unwrap();
          break;
      }
      if (result?.Succeeded !== false) {
        toaster.success(result?.Message || `${actionLabel} successful`);
        invalidateModules();
      } else {
        toaster.error(result?.Message || `${actionLabel} failed`);
      }
    } catch (err: any) {
      toaster.error(err?.data?.Message || err?.message || `${actionLabel} failed`);
    }
  };

  const columns = [
    {
      key: "DisplayName",
      label: "Module",
      render: (row: ModuleInfo) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 dark:text-white/90">{row.DisplayName || row.Name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{row.Name}</span>
        </div>
      ),
    },
    {
      key: "Version",
      label: "Version",
      render: (row: ModuleInfo) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{row.ActiveVersion || row.Version || "-"}</span>
      ),
    },
    {
      key: "LifecycleState",
      label: "State",
      render: (row: ModuleInfo) => {
        const state = row.LifecycleState?.toLowerCase() || "";
        const isEnabled = state === "enabled";
        const isDisabled = state === "disabled" || state === "installeddisabled";
        const isUninstalled = state === "uninstalled";
        const isFailed = state === "failed";
        let colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        if (isEnabled) colorClass = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        else if (isDisabled) colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        else if (isUninstalled) colorClass = "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
        else if (isFailed) colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        return (
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${colorClass}`}>
            {row.LifecycleState || "N/A"}
          </span>
        );
      },
    },
    {
      key: "RuntimeState",
      label: "Runtime",
      render: (row: ModuleInfo) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">{row.RuntimeState || "-"}</span>
      ),
    },
    {
      key: "IsBuiltIn",
      label: "Type",
      render: (row: ModuleInfo) =>
        row.IsBuiltIn ? (
          <span className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
            Built-in
          </span>
        ) : (
          <span className="inline-flex rounded-full px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            Package
          </span>
        ),
    },
    {
      key: "IsActive",
      label: "Active",
      render: (row: ModuleInfo) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            row.IsActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {row.IsActive ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: ModuleInfo) => {
        const state = row.LifecycleState?.toLowerCase() || "";
        const isPackage = !row.IsBuiltIn;
        const isEnabled = state === "enabled";
        const isDisabled = state === "disabled" || state === "installeddisabled";
        const isInstalled = row.IsInstalled;
        const canEnable = isDisabled && isInstalled;
        const canDisable = isEnabled;
        const canUpgrade = isEnabled && !!row.StagedVersion;
        const canRollback = isInstalled;
        const canUninstall = isPackage && isInstalled;

        return (
          <div className="flex items-center gap-2">
            <button
              title="Details"
              onClick={() => setSelectedModule(row)}
              className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-primary"
            >
              <MdOutlineVisibility size={20} />
            </button>
            {canEnable && (
              <button
                title="Enable"
                onClick={() => handleAction("enable", row)}
                className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-green-500"
              >
                <MdPlayArrow size={20} />
              </button>
            )}
            {canDisable && (
              <button
                title="Disable"
                onClick={() => handleAction("disable", row)}
                className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-orange-500"
              >
                <MdStop size={20} />
              </button>
            )}
            {canUpgrade && (
              <button
                title={`Upgrade to ${row.StagedVersion}`}
                onClick={() => handleAction("upgrade", row, { version: row.StagedVersion })}
                className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-purple-500"
              >
                <MdUpdate size={20} />
              </button>
            )}
            {canRollback && (
              <button
                title="Rollback"
                onClick={() => handleAction("rollback", row)}
                className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-base cursor-pointer hover:text-yellow-500"
              >
                <MdUndo size={20} />
              </button>
            )}
            {canUninstall && (
              <button
                title="Uninstall"
                onClick={() => handleAction("uninstall", row, { purgeData: false })}
                className="border p-2 rounded-md border-gray-300 dark:border-strokedark text-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <MdDeleteOutline size={20} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <ComponentCard title="Module Management">
        <>
          <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              {statusTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus:outline-none ${
                      isActive
                        ? "text-primary dark:text-white"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <FilterModule
                control={control}
                handleSubmit={handleSubmit}
                onFilterSubmit={onFilterSubmit}
                handleFilterRemove={handleFilterRemove}
                handleFilterReset={handleFilterReset}
                handleFilterSearch={handleFilterSearch}
                filterList={filterList}
                setFilter={setFilter}
              />
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
              >
                <MdOutlineUpload size={18} />
                Upload & Install
              </button>
            </div>
          </div>

          <DataGrid
            columns={columns}
            isLoading={isLoading}
            data={modules}
            text={t("DataGrid.TotalRecords", { count: rowTotal })}
            currentPage={offset}
            totalPage={Math.ceil(rowTotal / limit) || 1}
            isLine
            onPageChange={handlePagination}
            isShadow
          />
        </>
      </ComponentCard>

      <ModuleDetailDrawer
        module={selectedModule}
        onClose={() => setSelectedModule(null)}
        onAction={handleAction}
      />

      <InstallModuleModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        onSuccess={() => {
          setShowInstallModal(false);
          invalidateModules();
        }}
      />
    </div>
  );
};

export default ModuleManagement;
