import { Navigate, RouteObject } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import Dashboard from "../pages/Dashboard/Home";
import NotFound from "../pages/OtherPage/NotFound";
import LLMProvider from "../pages/Admin/AIAssistant/LLMProvider";
import NewLLMProvider from "../pages/Admin/AIAssistant/NewLLMProvider";
import SignIn from "../pages/AuthPages/SignIn";
import AIAssistant from "../pages/Admin/AIAssistant/AIAssistant";
import AIAssistantForm from "../pages/Admin/AIAssistant/AIAssistantForm";
import TaskBuilder from "../pages/Admin/BrowserAgentTask/TaskBuilder";
import AIAssistantSetting from "../pages/Admin/AIAssistant/AIAssistantSetting";
import Category from "../pages/Admin/AIAssistant/Category";
import CategoryForm from "../pages/Admin/AIAssistant/CategoryForm";
import SysPrompt from "../pages/Admin/AIAssistant/SysPrompt";
import SysPromptForm from "../pages/Admin/AIAssistant/SysPromptForm";
import Moderation from "../pages/Admin/AIAssistant/Moderation";
import Theme from "../pages/Admin/AIAssistant/Theme";
import ThemeForm from "../pages/Admin/AIAssistant/ThemeForm";
import AIAssistantPromt from "../pages/Admin/AIAssistant/AIAssistantPromt";
import MenuManagement from "../pages/Admin/Menu/MenuManagement";
import CSP from "../pages/Admin/Setting/CSP";
import API from "../pages/Admin/Setting/API";
import Basic from "../pages/Admin/Setting/Basic";
import File from "../pages/Admin/Setting/File";
import Web from "../pages/Admin/Setting/Web";
import Optimization from "../pages/Admin/Setting/Optimization";
import Caching from "../pages/Admin/Setting/Caching";
import Localization from "../pages/Admin/Sys/Localization";
import LocalizationForm from "../pages/Admin/Sys/LocalizationForm";
import SEOList from "../pages/Admin/SEO/SEOList";
import SEOForm from "../pages/Admin/SEO/SEOForm";
import BuilderPage from "../pages/Admin/HtmlBuilder/BuilderPage";
import MediaLibraryPage from "../pages/Admin/MediaLibrary/MediaLibraryPage";
import ComponentBuilderList from "../pages/Admin/HtmlBuilder/ComponentBuilderList";
import ComponentBuilder from "../pages/Admin/HtmlBuilder/ComponentBuilder";
import UserManagement from "../pages/Admin/User/UserManagement";
import FormUser from "../pages/Admin/User/FormUser";
import RoleManagement from "../pages/Admin/Role/RoleManagement";
import FormRole from "../pages/Admin/Role/FormRole";
import PermissionManagement from "../pages/Admin/Permission/PermissionManagement";
import UserPermissionManagement from "../pages/Admin/Permission/UserPermissionManagement";
import ClientList from "../pages/Admin/Client/ClientList";
import ClientForm from "../pages/Admin/Client/ClientForm";
import GrantList from "../pages/Admin/Client/GrantList";
import GrantForm from "../pages/Admin/Client/GrantForm";
import ApiResourceList from "../pages/Admin/Client/ApiResourceList";
import ApiResourceForm from "../pages/Admin/Client/ApiResourceForm";
import ApiScopeList from "../pages/Admin/Client/ApiScopeList";
import ApiScopeForm from "../pages/Admin/Client/ApiScopeForm";
import IdentityResourceList from "../pages/Admin/Client/IdentityResourceList";
import IdentityResourceForm from "../pages/Admin/Client/IdentityResourceForm";
import AuthCallback from "../pages/AuthPages/AuthCallback";
import RouteGuard from "../components/guards/RouteGuard";
import AccessDenied from "../pages/AccessDenied";
import EmailServiceProviderList from "../pages/Admin/EmailServiceProvider/EmailServiceProviderList";
import EmailServiceProviderForm from "../pages/Admin/EmailServiceProvider/EmailServiceProviderForm";
import EmailServiceProviderEditForm from "../pages/Admin/EmailServiceProvider/EmailServiceProviderEditForm";
import EmailServiceProviderSettingForm from "../pages/Admin/EmailServiceProvider/EmailServiceProviderSettingForm";
import SmsServiceProviderList from "../pages/Admin/SmsServiceProvider/SmsServiceProviderList";
import SmsServiceProviderForm from "../pages/Admin/SmsServiceProvider/SmsServiceProviderForm";
import SmsServiceProviderEditForm from "../pages/Admin/SmsServiceProvider/SmsServiceProviderEditForm";
import SmsServiceProviderSettingForm from "../pages/Admin/SmsServiceProvider/SmsServiceProviderSettingForm";
import EmailTemplateList from "../pages/Admin/EmailTemplate/EmailTemplateList";
import EmailTemplateForm from "../pages/Admin/EmailTemplate/EmailTemplateForm";
import IPAccessList from "../pages/Admin/Restriction/IPAccessList";
import IPAccessForm from "../pages/Admin/Restriction/IPAccessForm";
import RestrictionList from "../pages/Admin/Restriction/RestrictionList";
import RestrictionForm from "../pages/Admin/Restriction/RestrictionForm";
import YoPageList from "../pages/Admin/CmsPage/CmsPageList";
import YoPageForm from "../pages/Admin/CmsPage/CmsPageForm";
import YoPageBuilder from "../pages/Admin/CmsPage/CmsPageBuilder";
import YoPagePreview from "../pages/Admin/CmsPage/PreviewPage";
import LayoutList from "../pages/Admin/Layout/LayoutList";
import LayoutForm from "../pages/Admin/Layout/LayoutForm";
import LayoutBuilder from "../pages/Admin/Layout/LayoutBuilder";
import ModuleManagement from "../pages/Admin/Module/ModuleManagement";
import DynamicPageLoader from "../pages/Public/DynamicPageLoader";
import PreviewPageLoader from "../pages/Public/PreviewPageLoader";
import ThemeManager from "../pages/Admin/Theme/ThemeManager";
import ThemeDetail from "../pages/Admin/Theme/ThemeDetail";
import ThemeEditor from "../pages/Admin/Theme/ThemeEditor";

const appRoutes: RouteObject[] = [
  {
    path: "/",
    element: <DynamicPageLoader />,
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/signup",
    element: <SignIn />
  },
  {
    path: "/access-denied",
    element: <AccessDenied />
  },
  {
    path: "/preview/:slug",
    element: <PreviewPageLoader />,
  }

];

const notFound: RouteObject = {
  path: "*",
  element: <NotFound />,
};

const superUserRoutes: RouteObject = {
  path: "/admin",
  element: <RouteGuard><AdminLayout /></RouteGuard>,
  children: [
    { path: "dashboard", element: <Dashboard /> },
    { path: "menu", element: <MenuManagement /> },
    { path: "setting/csp", element: <CSP /> },
    { path: "setting/api", element: <API /> },
    { path: "setting/basic", element: <Basic /> },
    { path: "setting/file", element: <File /> },
    { path: "setting/web", element: <Web /> },
    { path: "htmlbuilder", element: <BuilderPage /> },
    { path: "componentbuilder", element: <ComponentBuilderList /> },
    { path: "componentbuilder/new", element: <ComponentBuilder /> },
    { path: "componentbuilder/edit", element: <ComponentBuilder /> },
    { path: "content/studio", element: <Navigate to="/admin/yopage" replace /> },
    { path: "yopage", element: <YoPageList /> },
    { path: "yopage/new", element: <YoPageForm /> },
    { path: "yopage/edit", element: <YoPageForm /> },
    { path: "yopage/builder", element: <YoPageBuilder /> },
    { path: "yopage/preview", element: <YoPagePreview /> },
    { path: "layout", element: <LayoutList /> },
    { path: "layout/new", element: <LayoutForm /> },
    { path: "layout/edit", element: <LayoutForm /> },
    { path: "layout/design", element: <LayoutBuilder /> },
    { path: "theme", element: <ThemeManager /> },
    { path: "theme/:guid", element: <ThemeDetail /> },
    { path: "theme/editor/:guid", element: <ThemeEditor /> },
    { path: "media", element: <MediaLibraryPage /> },
    { path: "user", element: <UserManagement /> },
    { path: "user/new", element: <FormUser /> },
    { path: "user/edit", element: <FormUser /> },
    { path: "role", element: <RoleManagement /> },
    { path: "role/new", element: <FormRole /> },
    { path: "role/edit", element: <FormRole /> },
    { path: "permission", element: <PermissionManagement /> },
    { path: "user/permission", element: <UserPermissionManagement /> },

    { path: "client", element: <ClientList /> },
    { path: "client/new", element: <ClientForm /> },
    { path: "client/edit/:id", element: <ClientForm /> },

    // OpenIddict - Grants
    { path: "openiddict/grant", element: <GrantList /> },
    { path: "openiddict/grant/new", element: <GrantForm /> },
    { path: "openiddict/grant/edit", element: <GrantForm /> },

    // OpenIddict - API Resources
    { path: "openiddict/apiresource", element: <ApiResourceList /> },
    { path: "openiddict/apiresource/new", element: <ApiResourceForm /> },
    { path: "openiddict/apiresource/edit", element: <ApiResourceForm /> },

    // OpenIddict - API Scopes
    { path: "openiddict/apiscope", element: <ApiScopeList /> },
    { path: "openiddict/apiscope/new", element: <ApiScopeForm /> },
    { path: "openiddict/apiscope/edit", element: <ApiScopeForm /> },

    // OpenIddict - Identity Resources
    { path: "openiddict/identityresource", element: <IdentityResourceList /> },
    { path: "openiddict/identityresource/new", element: <IdentityResourceForm /> },
    { path: "openiddict/identityresource/edit", element: <IdentityResourceForm /> },

    { path: "setting/optimization", element: <Optimization /> },
    { path: "setting/caching", element: <Caching /> },

    { path: "localization", element: <Localization /> },
    { path: "localization/new", element: <LocalizationForm /> },
    { path: "localization/edit/:id", element: <LocalizationForm /> },


    { path: "seo", element: <SEOList /> },
    { path: "seo/new", element: <SEOForm /> },
    { path: "seo/edit", element: <SEOForm /> },


    { path: "llmprovider", element: <LLMProvider /> },
    { path: "llmprovider/new", element: <NewLLMProvider /> },
    { path: "llmprovider/edit", element: <NewLLMProvider /> },

    { path: "aiassistant", element: <AIAssistant /> },
    { path: "aiassistant/new", element: <AIAssistantForm /> },
    { path: "aiassistant/edit", element: <AIAssistantForm /> },
    { path: "aiassistant/setting", element: <AIAssistantSetting /> },
    { path: "aiassistant/prompt", element: <AIAssistantPromt /> },
    { path: "category", element: <Category /> },
    { path: "category/new", element: <CategoryForm /> },
    { path: "category/edit", element: <CategoryForm /> },

    { path: "systemprompt", element: <SysPrompt /> },
    { path: "systemprompt/new", element: <SysPromptForm /> },
    { path: "systemprompt/edit", element: <SysPromptForm /> },
    { path: "moderation", element: <Moderation /> },
    { path: "assistant/theme", element: <Theme /> },
    { path: "assistant/theme/new", element: <ThemeForm /> },
    { path: "assistant/theme/edit", element: <ThemeForm /> },


    { path: "agent/taskbuilder", element: <TaskBuilder /> },

    { path: "setting/emailserviceprovider", element: <EmailServiceProviderList /> },
    { path: "setting/emailserviceprovider/new", element: <EmailServiceProviderForm /> },
    { path: "setting/emailserviceprovider/edit", element: <EmailServiceProviderEditForm /> },
    { path: "setting/emailserviceprovider/:id/settings", element: <EmailServiceProviderSettingForm /> },

    { path: "setting/smsserviceprovider", element: <SmsServiceProviderList /> },
    { path: "setting/smsserviceprovider/new", element: <SmsServiceProviderForm /> },
    { path: "setting/smsserviceprovider/edit", element: <SmsServiceProviderEditForm /> },
    { path: "setting/smsserviceprovider/:id/settings", element: <SmsServiceProviderSettingForm /> },

    { path: "setting/emailtemplate", element: <EmailTemplateList /> },
    { path: "setting/emailtemplate/new", element: <EmailTemplateForm /> },
    { path: "setting/emailtemplate/edit", element: <EmailTemplateForm /> },

    { path: "setting/ipaccess", element: <IPAccessList /> },
    { path: "setting/ipaccess/new", element: <IPAccessForm /> },
    { path: "setting/ipaccess/edit", element: <IPAccessForm /> },

    { path: "setting/restriction", element: <RestrictionList /> },
    { path: "setting/restriction/new", element: <RestrictionForm /> },
    { path: "setting/restriction/edit", element: <RestrictionForm /> },

    { path: "module", element: <ModuleManagement /> },

  ],
};


const dynamicRoutes: RouteObject = {
  path: "/:path*",
  element: <DynamicPageLoader />,
};

const registerdRoutes: RouteObject[] = [
  ...appRoutes,
  superUserRoutes,
  dynamicRoutes,
  notFound,
];

export default registerdRoutes;