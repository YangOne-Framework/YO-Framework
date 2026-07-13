import { useTranslation } from "react-i18next";
import { usePermission } from "../../hooks/usePermission";

interface PermissionGateProps {
  routeUrl: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  routeUrl,
  children,
  fallback,
}) => {
  const { t } = useTranslation();
  const { can } = usePermission();
  const resolvedFallback = fallback !== undefined ? fallback : <p className="text-gray-500 p-4">{t('Permission.Denied')}</p>;
  if (can.access(routeUrl)) return <>{children}</>;
  return <>{resolvedFallback}</>;
};

interface MultiPermissionGateProps {
  routeUrls: string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const MultiPermissionGate: React.FC<MultiPermissionGateProps> = ({
  routeUrls,
  requireAll = false,
  children,
  fallback,
}) => {
  const { t } = useTranslation();
  const { can } = usePermission();
  const allowed = requireAll
    ? routeUrls.every((r) => can.access(r))
    : can.accessAny(routeUrls);
  const resolvedFallback = fallback !== undefined ? fallback : <p className="text-gray-500 p-4">{t('Permission.Denied')}</p>;
  if (allowed) return <>{children}</>;
  return <>{resolvedFallback}</>;
};
