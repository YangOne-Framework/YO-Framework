import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Minus, Search, ShieldCheck, ShieldOff, User as UserIcon, X } from "lucide-react";
import { useSearchParams } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import toaster from "../../../components/toster";
import {
  useGetUserPermissionsQuery,
  useSaveUserPermissionsMutation,
  UserPermissionAction,
  UserPermissionGroup,
  SaveUserPermissionPayload,
} from "../../../redux/setting/permissionAPI";
import { useGetUserByIdQuery } from "../../../redux/user/userAPI";

type OverrideState = "default" | true | false;

const UserPermissionManagement = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const userId = Number(searchParams.get("userId")) || 0;
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedControllers, setExpandedControllers] = useState<Set<number>>(new Set());
  const [localPermissions, setLocalPermissions] = useState<Map<number, OverrideState>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  const { data: serverPermissions, isLoading: permissionsLoading } =
    useGetUserPermissionsQuery(userId, { skip: userId === 0 });
  const { data: userDetail } = useGetUserByIdQuery(userId, { skip: userId === 0 });
  const [savePermissions, { isLoading: saving }] = useSaveUserPermissionsMutation();

  const selectedUserMeta = useMemo(() => {
    if (!userDetail?.Data) return null;
    const u = userDetail.Data;
    const roles = (u.Roles || []).map((r: any) => r.Name || r.RoleName).filter(Boolean);
    return {
      name: `${u.FirstName ?? ""} ${u.LastName ?? ""}`.trim() || u.UserName || u.Email,
      email: u.Email,
      roles,
    };
  }, [userDetail]);

  useEffect(() => {
    return () => {
      // cleanup local state on unmount
    };
  }, []);

  useEffect(() => {
    if (serverPermissions) {
      const next = new Map<number, OverrideState>();
      for (const action of serverPermissions) {
        if (action.HasUserOverride) {
          next.set(action.ApplicationControllerActionId, action.UserOverrideAccess);
        }
      }
      setLocalPermissions(next);
      setHasChanges(false);
    }
  }, [serverPermissions]);

  const permissionGroups = useMemo<UserPermissionGroup[]>(() => {
    if (!serverPermissions) return [];
    const grouped = new Map<number, UserPermissionGroup>();
    for (const p of serverPermissions) {
      if (!grouped.has(p.ApplicationControllerId)) {
        grouped.set(p.ApplicationControllerId, {
          controllerId: p.ApplicationControllerId,
          controllerName: p.ControllerName || "Unknown",
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
              (a.FriendlyUrl || "").toLowerCase().includes(q) ||
              (a.RouteUrl || "").toLowerCase().includes(q) ||
              (a.ActionUrl || "").toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.actions.length > 0);
    }
    return groups;
  }, [serverPermissions, searchQuery]);

  const getEffectiveAccess = useCallback(
    (action: UserPermissionAction): boolean => {
      if (localPermissions.has(action.ApplicationControllerActionId)) {
        const override = localPermissions.get(action.ApplicationControllerActionId)!;
        if (override === "default") return action.EffectiveAccess;
        return override;
      }
      return action.EffectiveAccess;
    },
    [localPermissions]
  );

  const getDisplayState = useCallback(
    (action: UserPermissionAction): OverrideState => {
      if (localPermissions.has(action.ApplicationControllerActionId)) {
        return localPermissions.get(action.ApplicationControllerActionId)!;
      }
      return action.HasUserOverride ? action.UserOverrideAccess : "default";
    },
    [localPermissions]
  );

  const setActionState = useCallback((actionId: number, state: OverrideState) => {
    setLocalPermissions((prev) => {
      const next = new Map(prev);
      const current = next.get(actionId);
      const originalState: OverrideState = current === undefined ? "default" : current;
      if (state === originalState) {
        next.delete(actionId);
      } else {
        next.set(actionId, state);
      }
      return next;
    });
    setHasChanges(true);
  }, []);

  const setControllerState = useCallback(
    (controllerId: number, state: OverrideState) => {
      const group = permissionGroups.find((g) => g.controllerId === controllerId);
      if (!group) return;
      setLocalPermissions((prev) => {
        const next = new Map(prev);
        for (const action of group.actions) {
          if (state === "default") {
            next.delete(action.ApplicationControllerActionId);
          } else {
            next.set(action.ApplicationControllerActionId, state);
          }
        }
        return next;
      });
      setHasChanges(true);
    },
    [permissionGroups]
  );

  const setAllState = useCallback(
    (state: OverrideState) => {
      setLocalPermissions((prev) => {
        if (state === "default") return new Map();
        const next = new Map<number, OverrideState>();
        for (const group of permissionGroups) {
          for (const action of group.actions) {
            next.set(action.ApplicationControllerActionId, state);
          }
        }
        return next;
      });
      setHasChanges(true);
    },
    [permissionGroups]
  );

  const handleSave = async () => {
    if (userId === 0 || !serverPermissions) return;

    const payload: SaveUserPermissionPayload[] = serverPermissions
      .filter((action) => localPermissions.has(action.ApplicationControllerActionId))
      .map((action) => {
        const state = localPermissions.get(action.ApplicationControllerActionId)!;
        return {
          ApplicationControllerActionId: action.ApplicationControllerActionId,
          ApplicationControllerId: action.ApplicationControllerId,
          UserId: userId,
          AllowAccess: state === true,
          HasUserOverride: state !== "default",
          UserOverrideAccess: state === true,
        };
      });

    try {
      await savePermissions({
        userId,
        data: { UserPermission: payload },
      }).unwrap();
      toaster.success(t("UserPermission.SaveChanges"));
      setHasChanges(false);
    } catch {
      toaster.error(t("UserPermission.SaveChanges"));
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
  const effectiveAllowed = permissionGroups.reduce(
    (sum, g) => sum + g.actions.filter((a) => getEffectiveAccess(a)).length,
    0
  );
  const effectiveDenied = totalActions - effectiveAllowed;
  const overrideAllow = permissionGroups.reduce(
    (sum, g) =>
      sum +
      g.actions.filter(
        (a) => getDisplayState(a) === true
      ).length,
    0
  );
  const overrideDeny = permissionGroups.reduce(
    (sum, g) =>
      sum +
      g.actions.filter(
        (a) => getDisplayState(a) === false
      ).length,
    0
  );
  const useRoleDefault = totalActions - overrideAllow - overrideDeny;

  if (userId === 0) {
    return (
      <div className="space-y-6">
        <ComponentCard
          title={t("UserPermission.Title")}
          desc={t("UserPermission.Title")}
        >
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
              <UserIcon className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("UserPermission.Title")}
            </p>
          </div>
        </ComponentCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ComponentCard
        title={t("UserPermission.Title")}
        desc={t("UserPermission.Title")}
      >
        <div className="flex flex-col gap-5 px-6 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
            {userId > 0 && (
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("UserPermission.Search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 shadow-theme-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            )}
          </div>

          {userId > 0 && (
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

        {userId > 0 && selectedUserMeta && (
          <div className="px-6 mb-4">
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-800 dark:text-white">
                  {selectedUserMeta.name}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {selectedUserMeta.email}
                </p>
              </div>
              {selectedUserMeta.roles.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedUserMeta.roles.map((role: string) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-blue-light-50 px-2.5 py-0.5 text-xs font-medium text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {userId > 0 && !permissionsLoading && (
          <div className="px-6 mb-4">
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("PermissionManagement.ShowAll")}</span>
                <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {totalActions}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("UserPermission.Grant")}
                </span>
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                  {effectiveAllowed}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("UserPermission.Deny")}
                </span>
                <span className="inline-flex items-center rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error">
                  {effectiveDenied}
                </span>
              </div>
              <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("UserPermission.Grant")}
                </span>
                <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                  {overrideAllow}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("UserPermission.Deny")}
                </span>
                <span className="inline-flex items-center rounded-full bg-error/10 px-2.5 py-0.5 text-xs font-semibold text-error">
                  {overrideDeny}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {t("UserPermission.Default")}
                </span>
                <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                  {useRoleDefault}
                </span>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAllState(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("UserPermission.Grant")}
                </button>
                <button
                  onClick={() => setAllState(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-error/10 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/20"
                >
                  <ShieldOff className="h-3.5 w-3.5" />
                  {t("UserPermission.Deny")}
                </button>
                <button
                  onClick={() => setAllState("default")}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {t("UserPermission.Default")}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 mb-2 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-600 dark:text-gray-300">{t("PermissionManagement.HideAll")}:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
              <Minus className="h-3 w-3" />
            </span>
            {t("UserPermission.Default")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-success/10 text-success">
              <Check className="h-3 w-3" />
            </span>
            {t("UserPermission.Grant")}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-error/10 text-error">
              <X className="h-3 w-3" />
            </span>
            {t("UserPermission.Deny")}
          </span>
        </div>

        {permissionsLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        )}

        {userId > 0 && !permissionsLoading && permissionGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? t("UserPermission.Search") : t("PermissionManagement.HideAll")}
            </p>
          </div>
        )}

        {userId > 0 && !permissionsLoading && permissionGroups.length > 0 && (
          <div className="space-y-2 px-6 pb-4">
            {permissionGroups.map((group) => {
              const isExpanded = expandedControllers.has(group.controllerId);
              const groupEffectiveAllow = group.actions.filter((a) => getEffectiveAccess(a)).length;
              const groupOverrideAllow = group.actions.filter(
                (a) => getDisplayState(a) === true
              ).length;
              const groupOverrideDeny = group.actions.filter(
                (a) => getDisplayState(a) === false
              ).length;
              const groupDefault = group.actions.length - groupOverrideAllow - groupOverrideDeny;
              const groupTotal = group.actions.length;
              const allAllowed = groupOverrideAllow === groupTotal;
              const allDenied = groupOverrideDeny === groupTotal;
              const allDefault = groupDefault === groupTotal;

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
                        className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
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
                        {groupEffectiveAllow}/{groupTotal} {t("PermissionManagement.Grant")}
                      </span>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {groupOverrideAllow > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          <Check className="h-3 w-3" /> {groupOverrideAllow}
                        </span>
                      )}
                      {groupOverrideDeny > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                          <X className="h-3 w-3" /> {groupOverrideDeny}
                        </span>
                      )}
                      {groupDefault > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                          <Minus className="h-3 w-3" /> {groupDefault}
                        </span>
                      )}
                      <div className="ml-2 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setControllerState(group.controllerId, true)}
                          title={t("UserPermission.Grant")}
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
                          title={t("UserPermission.Deny")}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
                            allDenied
                              ? "bg-error text-white"
                              : "bg-error/10 text-error hover:bg-error/20"
                          }`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setControllerState(group.controllerId, "default")}
                          title={t("UserPermission.Default")}
                          disabled={allDefault}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-500 transition hover:bg-gray-200 disabled:opacity-40 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      {group.actions.map((action) => {
                        const state = getDisplayState(action);
                        const effective = getEffectiveAccess(action);
                        const roleDefault = action.RoleAllowAccess;
                        const label = action.FriendlyUrl || action.RouteUrl || action.ActionUrl;
                        return (
                          <div
                            key={action.ApplicationControllerActionId}
                            className="flex flex-col gap-2 border-b border-gray-50 px-5 py-3 last:border-b-0 hover:bg-gray-50/50 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:border-gray-800 dark:hover:bg-gray-800/30"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={`inline-flex h-2 w-2 flex-shrink-0 rounded-full ${
                                  effective
                                    ? "bg-success"
                                    : "bg-error"
                                }`}
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm text-gray-700 dark:text-gray-300">
                                  {label}
                                </p>
                                {action.RouteUrl && action.FriendlyUrl && (
                                  <p className="truncate text-xs text-gray-400">
                                    {action.RouteUrl}
                                  </p>
                                )}
                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                  {t("UserPermission.Default")}:{" "}
                                  <span
                                    className={
                                      roleDefault
                                        ? "font-medium text-success"
                                        : "font-medium text-error"
                                    }
                                  >
                                    {roleDefault ? t("UserPermission.Grant") : t("UserPermission.Deny")}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                  state === "default"
                                    ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                                    : state === true
                                    ? "bg-success/10 text-success"
                                    : "bg-error/10 text-error"
                                }`}
                              >
                                {state === "default"
                                  ? t("UserPermission.Default")
                                  : state === true
                                  ? t("UserPermission.Grant")
                                  : t("UserPermission.Deny")}
                              </span>
                              <div
                                className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800"
                                role="group"
                                aria-label={t("UserPermission.Title")}
                              >
                                <button
                                  type="button"
                                  onClick={() => setActionState(action.ApplicationControllerActionId, "default")}
                                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                    state === "default"
                                      ? "bg-brand-600 text-white"
                                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                  }`}
                                  title={t("UserPermission.Default")}
                                >
                                  <Minus className="h-3 w-3" />
                                  {t("UserPermission.Default")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActionState(action.ApplicationControllerActionId, true)}
                                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                    state === true
                                      ? "bg-success text-white"
                                      : "text-gray-600 hover:bg-success/10 hover:text-success dark:text-gray-300"
                                  }`}
                                  title={t("UserPermission.Grant")}
                                >
                                  <Check className="h-3 w-3" />
                                  {t("UserPermission.Grant")}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActionState(action.ApplicationControllerActionId, false)}
                                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                    state === false
                                      ? "bg-error text-white"
                                      : "text-gray-600 hover:bg-error/10 hover:text-error dark:text-gray-300"
                                  }`}
                                  title={t("UserPermission.Deny")}
                                >
                                  <X className="h-3 w-3" />
                                  {t("UserPermission.Deny")}
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

      {userId > 0 && hasChanges && (
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
                  <polyline points="7,3 7,3 15,8" />
                </svg>
                {t("UserPermission.SaveChanges")}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPermissionManagement;
