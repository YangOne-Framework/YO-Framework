const routeToParent: Record<string, string> = {
  "/admin/dashboard": "/admin/dashboard",
  "/admin/menu": "/admin/menu",
  "/admin/seo": "/admin/seo",
  "/admin/seo/new": "/admin/seo",
  "/admin/seo/edit": "/admin/seo",
  "/admin/media": "/admin/media",
  "/admin/content/studio": "/admin/content/studio",
  "/admin/htmlbuilder": "/admin/htmlbuilder",
  "/admin/componentbuilder": "/admin/componentbuilder",
  "/admin/componentbuilder/new": "/admin/componentbuilder",
  "/admin/componentbuilder/edit": "/admin/componentbuilder",
  "/admin/user": "/admin/user",
  "/admin/user/new": "/admin/user",
  "/admin/user/edit": "/admin/user",
  "/admin/role": "/admin/role",
  "/admin/role/new": "/admin/role",
  "/admin/role/edit": "/admin/role",
  "/admin/permission": "/admin/permission",
  "/admin/user/permission": "/admin/user/permission",
  "/admin/client": "/admin/client",
  "/admin/client/new": "/admin/client",
  "/admin/client/edit": "/admin/client",
  "/admin/localization": "/admin/localization",
  "/admin/localization/new": "/admin/localization",
  "/admin/localization/edit": "/admin/localization",
  "/admin/setting/basic": "/admin/setting/basic",
  "/admin/setting/csp": "/admin/setting/csp",
  "/admin/setting/api": "/admin/setting/api",
  "/admin/setting/optimization": "/admin/setting/optimization",
  "/admin/setting/file": "/admin/setting/file",
  "/admin/setting/web": "/admin/setting/web",
  "/admin/setting/caching": "/admin/setting/caching",
  "/admin/logs": "/admin/logs",
  "/admin/module": "/admin/module",
  "/admin/llmprovider": "/admin/llmprovider",
  "/admin/llmprovider/new": "/admin/llmprovider",
  "/admin/llmprovider/edit": "/admin/llmprovider",
  "/admin/aiassistant": "/admin/aiassistant",
  "/admin/aiassistant/new": "/admin/aiassistant",
  "/admin/aiassistant/edit": "/admin/aiassistant",
  "/admin/aiassistant/setting": "/admin/aiassistant/setting",
  "/admin/aiassistant/prompt": "/admin/aiassistant/prompt",
  "/admin/category": "/admin/category",
  "/admin/category/new": "/admin/category",
  "/admin/category/edit": "/admin/category",
  "/admin/systemprompt": "/admin/systemprompt",
  "/admin/systemprompt/new": "/admin/systemprompt",
  "/admin/systemprompt/edit": "/admin/systemprompt",
  "/admin/moderation": "/admin/moderation",
  "/admin/assistant/theme": "/admin/assistant/theme",
  "/admin/assistant/theme/new": "/admin/assistant/theme",
  "/admin/assistant/theme/edit": "/admin/assistant/theme",
  "/admin/agent/taskbuilder": "/admin/agent/taskbuilder",
  "/admin/openiddict/grant": "/admin/openiddict/grant",
  "/admin/openiddict/grant/new": "/admin/openiddict/grant",
  "/admin/openiddict/grant/edit": "/admin/openiddict/grant",
  "/admin/openiddict/apiresource": "/admin/openiddict/apiresource",
  "/admin/openiddict/apiresource/new": "/admin/openiddict/apiresource",
  "/admin/openiddict/apiresource/edit": "/admin/openiddict/apiresource",
  "/admin/openiddict/apiscope": "/admin/openiddict/apiscope",
  "/admin/openiddict/apiscope/new": "/admin/openiddict/apiscope",
  "/admin/openiddict/apiscope/edit": "/admin/openiddict/apiscope",
  "/admin/openiddict/identityresource": "/admin/openiddict/identityresource",
  "/admin/openiddict/identityresource/new": "/admin/openiddict/identityresource",
  "/admin/openiddict/identityresource/edit": "/admin/openiddict/identityresource",
};

export function getParentRoute(path: string): string {
  if (routeToParent[path]) return routeToParent[path];

  const segments = path.split("/").filter(Boolean);
  for (let i = segments.length; i >= 2; i--) {
    const candidate = "/" + segments.slice(0, i).join("/");
    if (routeToParent[candidate]) return routeToParent[candidate];
  }
  return path;
}

export function isRouteAllowed(currentPath: string, allowedUrls: string[]): boolean {
  if (!allowedUrls || allowedUrls.length === 0) return false;

  const parent = getParentRoute(currentPath);

  return allowedUrls.some((allowed) => {
    const normalized = allowed.endsWith("/") ? allowed.slice(0, -1) : allowed;
    return (
      parent === normalized ||
      parent === normalized + "/dashboard" ||
      currentPath === normalized ||
      currentPath.startsWith(normalized + "/") ||
      currentPath.startsWith(normalized + "?")
    );
  });
}
