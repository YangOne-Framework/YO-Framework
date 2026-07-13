import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { NavItem } from "../const/navigation";
import { useGetAdminMenusQuery } from "../redux/menu/menuAPI";
import { AdminMenuItem } from "../types/menu";
import { getMenuIcon } from "../utils/menuIconMap";


export const AIAssistantIcon: React.FC<AIAssistantIconProps> = ({
  className,
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM19 5V10H5V5H19ZM5 12V14H11V12H5ZM13 12V14H19V12H13ZM5 16V19H11V16H5ZM13 16V19H19V16H13Z"
        fill="currentColor"
      />
    </svg>
  );
};
interface SupportIconProps {
  className?: string;
}

export const SupportIcon: React.FC<SupportIconProps> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2 4C2 3.44772 2.44772 3 3 3H22C22.5523 3 23 3.44772 23 4V14C23 14.5523 22.5523 15 22 15H2C2.44772 15 3 15.4477 3 16V21C3 21.5523 2.55228 22 2 22C1.44772 22 1 21.5523 1 21V16C1 15.4477 1.44772 15 2 15H3V4H2ZM5 6H19V8H5V6ZM5 10H19V12H5V10ZM5 17H11V19H5V17ZM13 17H19V19H13V17Z"
        fill="currentColor"
      />
    </svg>
  );
};
interface AgentIconProps {
  className?: string;
}

export const AgentIcon: React.FC<AgentIconProps> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 7H20V9H4V7ZM4 11H20V13H4V11ZM4 15H14V17H4V15Z"
        fill="currentColor"
      />
    </svg>
  );
};
interface ThemeIconProps {
  className?: string;
}

export const ThemeIcon: React.FC<ThemeIconProps> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM4.36396 19.636C5.57669 17.6637 8.52649 13.4998 12 13.4998C15.4735 13.4998 18.4233 17.6637 19.636 19.636C17.6637 18.4233 13.4998 15.4735 13.4998 12C13.4998 8.52649 17.6637 5.57669 19.636 4.36396C18.4233 5.57669 13.4998 8.52649 13.4998 12C13.4998 15.4735 8.52649 18.4233 5.57669 19.636C4.36396 17.6637 5.57669 8.52649 4.36396 4.36396C8.52649 5.57669 18.4233 8.52649 19.636 4.36396C17.6637 5.57669 8.52649 13.4998 12 13.4998C5.57669 8.52649 4.36396 5.57669 4.36396 4.36396C5.57669 5.57669 8.52649 18.4233 4.36396 19.636Z"
        fill="currentColor"
      />
    </svg>
  );
};
interface ContentIconProps {
  className?: string;
}

export const ContentIcon: React.FC<ContentIconProps> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 3H20C21.1046 3 22 3.89543 22 5V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V5C2 3.89543 2.89543 3 4 3ZM4 5V8H20V5H4ZM4 16V19H20V16H4ZM4 10V13H20V10H4Z"
        fill="currentColor"
      />
    </svg>
  );
};
interface SettingsIconProps {
  className?: string;
}

export const SettingsIcon: React.FC<SettingsIconProps> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M19.7396 12.4311C19.8358 12.0964 19.8889 11.7447 19.8889 11.3872C19.8889 11.0297 19.8358 10.678 19.7396 10.3433L21.534 8.80882C21.9964 8.43368 22.1697 7.82376 21.9769 7.26057C21.784 6.69738 21.3458 6.25921 20.7826 6.06638L19.1604 5.4895C18.8335 5.38909 18.5137 5.24148 18.2061 5.05151L17.5755 3.34534C17.3094 2.76635 16.8221 2.33121 16.2397 2.11244C15.6574 1.89367 15.0249 2.00333 14.5308 2.43784L13.0551 3.64927C12.7861 3.53674 12.5127 3.44922 12.2372 3.38822V3.3872C11.7632 3.2912 11.2747 3.2912 10.7997 3.3872V3.38822C10.5242 3.44922 10.2508 3.53674 9.98178 3.64927L8.5061 2.43784C8.012 2.00333 7.37951 1.89367 6.79716 2.11244C6.21481 2.33121 5.72752 2.76635 5.46141 3.34534L4.83083 5.05151C4.52322 5.24148 4.20344 5.38909 3.87651 5.4895L2.25432 6.06638C1.69113 6.25921 1.25297 6.69738 1.06014 7.26057C0.867314 7.82376 1.04061 8.43368 1.50304 8.80882L3.29745 10.3433C3.20126 10.678 3.14817 11.0297 3.14817 11.3872C3.14817 11.7447 3.20126 12.0964 3.29745 12.4311L1.50304 13.9656C1.04061 14.3407 0.867314 14.9507 1.06014 15.5139C1.25297 16.0771 1.69113 16.5153 2.25432 16.7081L3.87651 17.285C4.20344 17.3854 4.52322 17.533 4.83083 17.7229L5.46141 19.4291C5.72752 20.0081 6.21481 20.4432 6.79716 20.662C7.37951 20.8808 8.012 20.7711 8.5061 20.3366L9.98178 19.1252C10.2508 19.2377 10.5242 19.3252 10.7997 19.3862V19.3872C11.2747 19.4832 11.7632 19.4832 12.2372 19.3872V19.3862C12.5127 19.3252 12.7861 19.2377 13.0551 19.1252L14.5308 20.3366C15.0249 20.7711 15.6574 20.8808 16.2397 20.662C16.8221 20.4432 17.3094 20.0081 17.5755 19.4291L18.2061 17.7229C18.5137 17.533 18.8335 17.3854 19.1604 17.285L19.7883 16.7081C20.3515 16.5153 20.7896 16.0771 20.9825 15.5139C21.1754 14.9507 20.9964 14.3407 20.534 13.9656L18.7396 12.4311H19.7396ZM12.2372 16.9998C14.9806 16.9998 17.2372 14.7432 17.2372 11.9998C17.2372 9.25641 14.9806 6.9998 12.2372 6.9998C9.49379 6.9998 7.23718 9.25641 7.23718 11.9998C7.23718 14.7432 9.49379 16.9998 12.2372 16.9998Z"
        fill="currentColor"
      />
    </svg>
  );
};
interface SystemIconProps {
  className?: string;
}

export const SystemIcon: React.FC<SystemIconProps> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4 8H6V16H4V8ZM10 16H8V8H10V16ZM14 8H16V16H14V8ZM20 8H18V16H20V8Z"
        fill="currentColor"
      />
    </svg>
  );
};



const othersItems: NavItem[] = [];

function buildMenuTree(items: AdminMenuItem[]): NavItem[] {
  const roots = items.filter((item) => item.ParentId === 0);
  return roots.map((root) => {
    const children = items.filter((item) => item.ParentId === root.MenuId);
    if (children.length > 0) {
      return {
        name: root.Name,
        icon: getMenuIcon(root.Icon),
        subItems: children.map((child) => ({
          name: child.Name,
          path: child.Url,
        })),
      };
    }
    return {
      name: root.Name,
      icon: getMenuIcon(root.Icon),
      path: root.Url,
    };
  });
}

interface AIAssistantIconProps {
  className?: string;
}

const AppSidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => {
      const currentPath = location.pathname;
      if (currentPath === path) return true;
      if (path === "/") return false;
      return currentPath.startsWith(path + "/");
    },
    [location.pathname]
  );
  const { data: menuData } = useGetAdminMenusQuery();

  const mainNavItems = useMemo(() => {
    if (menuData && Array.isArray(menuData) && menuData.length > 0) {
      return buildMenuTree(menuData);
    }
    return [];
  }, [menuData]);

  useEffect(() => {
    let submenuMatched = false;

    ["main", "others"].forEach((menuType) => {


      const items = menuType === "main" ? mainNavItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleNavClick = () => {
    if (isMobileOpen) {
      toggleMobileSidebar();
    }
  };

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                onClick={handleNavClick}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      onClick={handleNavClick}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed flex flex-col top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                  {isExpanded || isHovered || isMobileOpen ? (
                    t("Sidebar.Menu")
                  ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(mainNavItems, "main")}
            </div>
            {/* <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div> */}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;

