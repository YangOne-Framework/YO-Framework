import { Navigate, useLocation } from "react-router-dom";
import { useGetAdminMenusQuery } from "../../redux/menu/menuAPI";
import { isRouteAllowed, getParentRoute } from "../../config/routePermissions";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const location = useLocation();
  const { data: menus, isLoading } = useGetAdminMenusQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const menuUrls = (menus || []).map((m: any) => m.Url).filter(Boolean);

  const isKnownRoute = !!getParentRoute(location.pathname);

  const isAllowed = isKnownRoute || isRouteAllowed(location.pathname, menuUrls);

  if (!isAllowed) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
