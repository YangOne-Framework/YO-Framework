import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Search, ShieldCheck, ShieldOff, X } from "lucide-react";
import ComponentCard from "../../../components/common/ComponentCard";
import toaster from "../../../components/toster";
import {
  useGetRolesQuery,
  useGetRolePermissionsQuery,
  useSaveRolePermissionsMutation,
  PermissionAction,
  PermissionGroup,
  SavePermissionPayload,
} from "../../../redux/setting/permissionAPI";

const PermissionManagement = () => {
  const { t } = useTranslation();
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedControllers, setExpandedControllers] = useState<Set<number>>(new Set());
  const [localPermissions, setLocalPermissions] = useState<Map<number, boolean>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  const { data: roles, isLoading: rolesLoading } = useGetRolesQuery();
  const { data: serverPermissions, isLoading: permissionsLoading } =
    useGetRolePermissionsQuery(selectedRoleId, { skip: selectedRoleId === 0 });
  const [savePermissions, { isLoading: saving }] = useSaveRolePermissionsMutation();

  const permissionGroups = useMemo<PermissionGroup[]>(() => {
    if (!serverPermissions) return [];
    const grouped = new Map<number, PermissionGroup>();
    for (const p of serverPermissions) {
      if (!grouped.has(p.ApplicationControllerId)) {
        grouped.set(p.ApplicationControllerId, {
          controllerId: p.ApplicationControllerId,
          controllerName: p.ControllerName || t("PermissionManagement.Unknown"),
          actions: [],
        });
      }
      grouped.get(p.ApplicationControllerId)!.actions.push(p);
    }
    const groups = Array.from(grouped.values()).sort((a, b) =>
      a.controllerName.localeCompare(b.controllerName)
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return groups
        .map((g) => ({
          ...g,
          actions: g.actions.filter(
            (a) =>
              (a.FriendlyName || "").toLowerCase().includes(q) ||
              (a.RouteUrl || "").toLowerCase().includes(q) ||
              (a.ActionUrl || "").toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.actions.length > 0);
    }
    return groups;
  }, [serverPermissions, searchQuery]);

  const getEffectiveAccess = useCallback(
    (action: PermissionAction): boolean => {
      if (localPermissions.has(action.ApplicationControllerActionId)) {
        return localPermissions.get(action.ApplicationControllerActionId)!;
      }
      return action.AllowAccess;
    },
    [localPermissions]
  );

  const setActionState = useCallback((actionId: number, allow: boolean) => {
    setLocalPermissions((prev) => {
      const next = new Map(prev);
      next.set(actionId, allow);
      return next;
    });
    setHasChanges(true);
  }, []);

  const setControllerState = useCallback(
    (controllerId: number, allow: boolean) => {
      const group = permissionGroups.find((g) => g.controllerId === controllerId);
      if (!group) return;
      setLocalPermissions((prev) => {
        const next = new Map(prev);
        for (const action of group.actions) {
          next.set(action.ApplicationControllerActionId, allow);
        }
        return next;
      });
      setHasChanges(true);
    },
    [permissionGroups]
  );

  const setAllState = useCallback(
    (allow: boolean) => {
      setLocalPermissions((prev) => {
        const next = new Map<number, boolean>();
        for (const group of permissionGroups) {
          for (const action of group.actions) {
            next.set(action.ApplicationControllerActionId, allow);
          }
        }
        return next;
      });
      setHasChanges(true);
    },
    [permissionGroups]
  );

  const handleSave = async () => {
    if (selectedRoleId === 0 || !serverPermissions) return;

    const payload: SavePermissionPayload[] = serverPermissions.map((action) => {
      if (localPermissions.has(action.ApplicationControllerActionId)) {
        return {
          ApplicationControllerActionId: action.ApplicationControllerActionId,
          ApplicationControllerId: action.ApplicationControllerId,
          RoleId: selectedRoleId,
          AllowAccess: localPermissions.get(action.ApplicationControllerActionId)!,
        };
      }
      return {
        ApplicationControllerActionId: action.ApplicationControllerActionId,
        ApplicationControllerId: action.ApplicationControllerId,
        RoleId: selectedRoleId,
        AllowAccess: action.AllowAccess,
      };
    });

    try {
      await savePermissions({
        roleId: selectedRoleId,
        data: { RolePermission: payload },
      }).unwrap();
      toaster.success(t("PermissionManagement.SaveChanges"));
      setHasChanges(false);
      setLocalPermissions(new Map());
    } catch {
      toaster.error(t("PermissionManagement.SaveChanges"));
    }
  };

  const handleReset = () => {
    setLocalPermissions(new Map());
    setHasChanges(false);
  };

  const toggleExpand = (controllerId: number) => {
    setExpandedControllers((prev) => {
      const next = new Set(prev);
      if (next.has(controllerId)) next.delete(controllerId);
      else next.add(controllerId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedControllers(new Set(permissionGroups.map((g) => g.controllerId)));
  };

  const collapseAll = () => {
    setExpandedControllers(new Set());
  };

  const totalActions = permissionGroups.reduce((sum, g) => sum + g.actions.length, 0);
  const allowedActions = permissionGroups.reduce(
    (sum, g) => sum + g.actions.filter((a) => getEffectiveAccess(a)).length,
    0
  );
  const deniedActions = totalActions - allowedActions;

  return (
    <div className="space-y-6">
      <ComponentCard title={t("PermissionManagement.Title")} desc={t("PermissionManagement.SelectRole")}>
        <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
            <div className="relative">
              <select
                value={selectedRoleId}
                onChange={(e) => {
                  setSelectedRoleId(Number(e.target.value));
                  setLocalPermissions(new Map());
                  setHasChanges(false);
                  setSearchQuery("");
                  setExpandedControllers(new Set());
                }}
                disabled={rolesLoading}
                className="w-full sm:w-64 appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value={0}>
                  {rolesLoading ? t("Common.Loading") : t("PermissionManagement.SelectRole")}
                </option>
                {roles?.map((role) => (
                  <option key={role.RoleId} value={role.RoleId}>
                    {role.Name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {selectedRoleId > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("PermissionManagement.Search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
          </div>

          {selectedRoleId > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t("PermissionManagement.ShowAll")}
              </button>
              <button
                onClick={collapseAll}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {t("PermissionManagement.HideAll")}
              </button>
            </div>
          )}
        </div>

        {selectedRoleId > 0 && !permissionsLoading && (
          <div className="px-6 mb-4">
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
             <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("PermissionManagement.HideAll")}</span>
                <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {totalActions}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("PermissionManagement.Grant")}</span>
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success dark:bg-success/20">
                  {allowedActions}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("PermissionManagement.Deny")}</span>
                <span className="inline-flex items-center rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error dark:bg-error/20">
                  {deniedActions}
                </span>
             </div>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAllState(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("PermissionManagement.Grant")}
                </button>
                <button
                  onClick={() => setAllState(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-error/10 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/20"
                >
                  <ShieldOff className="h-3.5 w-3.5" />
                  {t("PermissionManagement.Deny")}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedRoleId > 0 && !permissionsLoading && (
          <div className="px-6 mb-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-600 dark:text-gray-300">{t("PermissionManagement.HideAll")}:</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-success/10 text-success">
                <Check className="h-3 w-3" />
              </span>
              {t("PermissionManagement.Grant")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-error/10 text-error">
                <X className="h-3 w-3" />
              </span>
              {t("PermissionManagement.Deny")}
            </span>
          </div>
        )}

        {permissionsLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        )}

        {selectedRoleId === 0 && !permissionsLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("PermissionManagement.NoRole")}</p>
          </div>
        )}

        {selectedRoleId > 0 && !permissionsLoading && permissionGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? t("PermissionManagement.Search") : t("PermissionManagement.HideAll")}
            </p>
          </div>
        )}

        {selectedRoleId > 0 && !permissionsLoading && permissionGroups.length > 0 && (
          <div className="space-y-2 px-6 pb-4">
            {permissionGroups.map((group) => {
              const isExpanded = expandedControllers.has(group.controllerId);
              const groupAllowed = group.actions.filter((a) => getEffectiveAccess(a)).length;
              const groupDenied = group.actions.length - groupAllowed;
              const groupTotal = group.actions.length;
              const allAllowed = groupAllowed === groupTotal;
              const allDenied = groupDenied === groupTotal;

              return (
                <div
                  key={group.controllerId}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <button
                    onClick={() => toggleExpand(group.controllerId)}
                    className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <svg
                        className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                      <span className="truncate text-sm font-semibold text-gray-800 dark:text-white">
                        {group.controllerName}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {groupAllowed}/{groupTotal} {t("PermissionManagement.Grant")}
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {groupAllowed > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          <Check className="h-3 w-3" /> {groupAllowed}
                        </span>
                      )}
                      {groupDenied > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                          <X className="h-3 w-3" /> {groupDenied}
                        </span>
                      )}
                      <div className="ml-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setControllerState(group.controllerId, true)}
                          title={t("PermissionManagement.Grant")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
                            allAllowed
                              ? "bg-success text-white"
                              : "bg-success/10 text-success hover:bg-success/20"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setControllerState(group.controllerId, false)}
                          title={t("PermissionManagement.Deny")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
                            allDenied
                              ? "bg-error text-white"
                              : "bg-error/10 text-error hover:bg-error/20"
                          }`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      {group.actions.map((action) => {
                        const isAllowed = getEffectiveAccess(action);
                        const label = action.FriendlyName || action.RouteUrl || action.ActionUrl;
                        return (
                          <div
                            key={action.ApplicationControllerActionId}
                            className="flex flex-col gap-2 border-b border-gray-50 px-5 py-3 last:border-b-0 hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-gray-800 dark:hover:bg-gray-800/30"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={`inline-flex h-2 w-2 flex-shrink-0 rounded-full ${
                                  isAllowed ? "bg-success" : "bg-error"
                                }`}
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm text-gray-700 dark:text-gray-300">
                                  {label}
                                </p>
                                {action.RouteUrl && action.FriendlyName && (
                                  <p className="truncate text-xs text-gray-400">
                                    {action.RouteUrl}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                  isAllowed
                                    ? "bg-success/10 text-success"
                                    : "bg-error/10 text-error"
                                }`}
                              >
                                {isAllowed ? t("PermissionManagement.Grant") : t("PermissionManagement.Deny")}
                              </span>
                              <div
                                className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800"
                                role="group"
                                aria-label={t("PermissionManagement.Title")}
                              >
                                <button
                                  type="button"
                                  onClick={() => setActionState(action.ApplicationControllerActionId, true)}
                                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                    isAllowed
                                      ? "bg-success text-white"
                                      : "text-gray-600 hover:bg-success/10 hover:text-success dark:text-gray-300"
                                  }`}
                                  title={t("PermissionManagement.Grant")}
                                >
                                  <Check className="h-3 w-3" />
                                  {t("PermissionManagement.Grant")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActionState(action.ApplicationControllerActionId, false)}
                                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                    !isAllowed
                                      ? "bg-error text-white"
                                      : "text-gray-600 hover:bg-error/10 hover:text-error dark:text-gray-300"
                                  }`}
                                  title={t("PermissionManagement.Deny")}
                                >
                                  <X className="h-3 w-3" />
                                  {t("PermissionManagement.Deny")}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ComponentCard>

      {selectedRoleId > 0 && hasChanges && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-lg transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {t("GridFilter.ResetFilter")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-600 hover:shadow-xl disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t("Common.Saving")}
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17,21 17,13 7,13 7,21" />
                  <polyline points="7,3 7,8 15,8" />
                </svg>
                {t("PermissionManagement.SaveChanges")}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;
