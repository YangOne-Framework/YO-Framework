import { useTranslation } from "react-i18next";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import AdminThemeBridge from "./AdminThemeBridge";
import AuthHelper from "../utils/AuthHelper";
import { useEffect } from "react";
import { adminnavItems, sunavItems } from "../const/navigation";

const LayoutContent: React.FC = () => {
  const { t } = useTranslation();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let userRoles = AuthHelper.getUserRoles();
    let isUserSuperAdmin = false;
    if (Array.isArray(userRoles)) {
      isUserSuperAdmin = userRoles.includes("SuperAdmin");
    } else {
      isUserSuperAdmin = userRoles === "SuperAdmin";
    }

    const navItems = isUserSuperAdmin ? sunavItems : adminnavItems;
    let title = t('Nav.Dashboard');

    // Helper to find title in nested items
    const findTitle = (path: string) => {
      // Try exact match first
      for (const item of navItems) {
        if (item.path === path) return item.name;
        if (item.subItems) {
          const subItem = item.subItems.find(sub => sub.path === path);
          if (subItem) return subItem.name;
        }
      }

      // Try matching the prefix for common patterns
      // e.g., /admin/blog/new -> should probably say something about Blog
      const pathParts = path.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        // Look for the parent menu name
        for (const item of navItems) {
          if (item.subItems) {
            const subItemMatch = item.subItems.find(sub => {
              const subParts = sub.path?.split('/').filter(Boolean) || [];
              return subParts.length > 0 && pathParts.join('/').startsWith(subParts.join('/'));
            });
            if (subItemMatch) {
              const action = pathParts[pathParts.length - 1];
              const isAction = ['new', 'edit', 'detail', 'view'].includes(action.toLowerCase());
              return isAction ? `${action.charAt(0).toUpperCase() + action.slice(1)} ${subItemMatch.name}` : subItemMatch.name;
            }
          }
        }
      }

      // Fallback: Capitalize the last part of the path
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
      }

      return null;
    };

    const foundTitle = findTitle(location.pathname);
    if (foundTitle) {
      // Clean up common prefixes like "Admin" if it's too redundant
      title = `${foundTitle} | ${t('Nav.Dashboard')}`;
    }

    document.title = title;
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    if (!AuthHelper.isLoggedIn()) {
      navigate("/signin");
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <AdminThemeBridge />
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AdminLayout;
