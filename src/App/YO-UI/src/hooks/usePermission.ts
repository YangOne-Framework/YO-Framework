import { useMemo } from "react";
import { useGetMyPermissionsQuery } from "../redux/setting/permissionAPI";
import AuthHelper from "../utils/AuthHelper";

export function usePermission() {
  const userRoles = AuthHelper.getUserRoles();
  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles].filter(Boolean);
  const isSuperAdmin = rolesArray.includes("SuperAdmin");

  const { data: myPermissions } = useGetMyPermissionsQuery(undefined, {
    skip: isSuperAdmin,
  });

  const allowedActions = useMemo(() => {
    return new Set((myPermissions ?? []).map((r) => r.toLowerCase()));
  }, [myPermissions]);

  const can = useMemo(() => {
    return {
      access: (routeUrl: string): boolean => {
        if (isSuperAdmin) return true;
        return allowedActions.has(routeUrl.toLowerCase());
      },
      accessAny: (routeUrls: string[]): boolean => {
        if (isSuperAdmin) return true;
        return routeUrls.some((r) => allowedActions.has(r.toLowerCase()));
      },
    };
  }, [allowedActions, isSuperAdmin]);

  return { can, allowedActions, isSuperAdmin };
}
