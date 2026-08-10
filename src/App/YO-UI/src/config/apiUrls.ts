export const API = {
  AUTH: {
    TOKEN: "/connect/token",
  },

  YOTHEME_STUDIO: {
    THEMES: "/api/v1/yotheme-studio/themes",
    THEMES_ACTIVE: "/api/v1/yotheme-studio/themes/active",
    THEME: (guid: string) => `/api/v1/yotheme-studio/themes/${guid}`,
    THEME_DELETE: (guid: string) => `/api/v1/yotheme-studio/themes/${guid}`,
    CONFIG: (guid: string) => `/api/v1/yotheme-studio/config/${guid}`,
    COMPILE: "/api/v1/yotheme-studio/compile",
    VALIDATE: "/api/v1/yotheme-studio/validate",
    VALIDATION: (guid: string) => `/api/v1/yotheme-studio/validation/${guid}`,
    STATUS: "/api/v1/yotheme-studio/status",
    PUBLISH: "/api/v1/yotheme-studio/publish",
    SET_DEFAULT: (guid: string) => `/api/v1/yotheme-studio/set-default/${guid}`,
    DUPLICATE: "/api/v1/yotheme-studio/duplicate",
    RESOLVE: "/api/v1/yotheme-studio/resolve",
    CSS: "/api/v1/yotheme-studio/css",
    ASSIGNMENTS: "/api/v1/yotheme-studio/assignments",
    ASSIGNMENT_DELETE: (id: number | string) => `/api/v1/yotheme-studio/assignments/${id}`,
    BRAND_KITS: "/api/v1/yotheme-studio/brand-kits",
    BRAND_KIT_DELETE: (id: number | string) => `/api/v1/yotheme-studio/brand-kits/${id}`,
    LAYOUTS: "/api/v1/yotheme-studio/layouts",
    LAYOUT_DELETE: (id: number | string) => `/api/v1/yotheme-studio/layouts/${id}`,
    TEMPLATES: "/api/v1/yotheme-studio/templates",
    TEMPLATE_DELETE: (id: number | string) => `/api/v1/yotheme-studio/templates/${id}`,
    SCOPES: "/api/v1/yotheme-studio/scopes",
    SCOPE_DELETE: (id: number | string) => `/api/v1/yotheme-studio/scopes/${id}`,
    REGISTRY: "/api/v1/yotheme-studio/registry",
    COMPONENTS: "/api/v1/yotheme-studio/components",
    ASSETS: "/api/v1/yotheme-studio/assets",
    ASSET_DELETE: (id: number | string) => `/api/v1/yotheme-studio/assets/${id}`,
    REVIEW_QUEUE: "/api/v1/yotheme-studio/review-queue",
    APPROVALS: "/api/v1/yotheme-studio/approvals",
    APPROVAL_REVIEW: "/api/v1/yotheme-studio/approvals/review",
    COMMENTS: "/api/v1/yotheme-studio/comments",
    COMMENT_RESOLVE: (id: number | string) => `/api/v1/yotheme-studio/comments/${id}/resolve`,
    SCHEDULES: "/api/v1/yotheme-studio/schedules",
    SCHEDULE_DELETE: (id: number | string) => `/api/v1/yotheme-studio/schedules/${id}`,
    SCHEDULE_CONFLICTS: "/api/v1/yotheme-studio/schedules/conflicts",
    PLUGINS: "/api/v1/yotheme-studio/plugins",
    PLUGIN_TOGGLE: (id: number | string) => `/api/v1/yotheme-studio/plugins/${id}/toggle`,
    EXPERIMENTS: "/api/v1/yotheme-studio/experiments",
    EXPERIMENT_STATUS: (id: number | string) => `/api/v1/yotheme-studio/experiments/${id}/status`,
    FIXTURES: "/api/v1/yotheme-studio/fixtures",
    FIXTURE_DELETE: (id: number | string) => `/api/v1/yotheme-studio/fixtures/${id}`,
    INTEGRATIONS: "/api/v1/yotheme-studio/integrations",
    INTEGRATION_DELETE: (id: number | string) => `/api/v1/yotheme-studio/integrations/${id}`,
    BULK_TOKENS: "/api/v1/yotheme-studio/bulk-tokens",
    ANALYTICS: "/api/v1/yotheme-studio/analytics",
    ANALYTICS_EVENTS: "/api/v1/yotheme-studio/analytics/events",
    READINESS: (guid: string) => `/api/v1/yotheme-studio/readiness/${guid}`,
    AUDIT: (guid: string) => `/api/v1/yotheme-studio/audit/${guid}`,
    HEALTH: (guid: string) => `/api/v1/yotheme-studio/health/${guid}`,
  },

  USER: {
    PROFILE: "/api/v1/user/profile",
    MANAGEMENT_ALL: "/api/v1/user/management/all",
    MANAGEMENT_SAVE: "/api/v1/user/management/save",
    MANAGEMENT_DELETE: "/api/v1/user/management/delete",
    MANAGEMENT_RESET_PASSWORD: "/api/v1/user/management/resetpassword",
    MANAGEMENT_LOGIN_HISTORY: (userId: number | string) =>
      `/api/v1/user/management/login-history/${userId}`,
    MANAGEMENT_BY_ID: (id: number | string) =>
      `/api/v1/user/management/${id}`,
  },

  ROLE: {
    ALL: "/api/v1/role/all",
    SAVE: "/api/v1/role/save",
    DELETE: "/api/v1/role/delete",
    BY_ID: (id: number | string) => `/api/v1/role/${id}`,
  },

  PERMISSION: {
    ROLE_ALL: "/api/v1/permission/role/all",
    ROLE_BY_ID: (roleId: number | string) =>
      `/api/v1/permission/role/${roleId}`,
    ROLE_SAVE: (roleId: number | string) =>
      `/api/v1/permission/role/${roleId}/save`,
    MY: "/api/v1/permission/my",
    USER_BY_ID: (userId: number | string) =>
      `/api/v1/permission/user/${userId}`,
    USER_SAVE: (userId: number | string) =>
      `/api/v1/permission/user/${userId}/save`,
  },

  MENU: {
    GROUP: (groupId: number | string) =>
      `/api/v1/menu/group?groupId=${groupId}`,
    BY_ID: (id: number | string) => `/api/v1/menu/${id}`,
    SAVE: "/api/v1/menu/save",
    ORDER_SAVE: "/api/v1/menu/order/save",
    ROLES: "/api/v1/menu/roles",
    GROUPS: "/api/v1/menu/groups",
    GROUPS_SAVE: "/api/v1/menu/groups/save",
    GROUPS_DELETE: (id: number | string) =>
      `/api/v1/menu/groups/delete/${id}`,
    ADMIN_MENUS: "/api/v1/menu/admin-menus",
    MAIN_NAVIGATION: "/api/v1/menu/mainnavigation",
  },

  SETTING: {
    WEB: "/api/v1/setting/web",
    WEB_SAVE: "/api/v1/setting/web/save",
    APP_RESTART: "/api/v1/setting/app/restart",
    CSP: "/api/v1/setting/csp",
    CSP_SAVE: "/api/v1/setting/csp/save",
    API: "/api/v1/setting/api",
    API_SAVE: "/api/v1/setting/api/save",
    OPTIMIZATION: "/api/v1/setting/optimization",
    OPTIMIZATION_SAVE: "/api/v1/setting/optimization/save",
    FILE: "/api/v1/setting/file",
    FILE_SAVE: "/api/v1/setting/file/save",
    BASIC: "/api/v1/setting/basic",
    BASIC_SAVE: "/api/v1/setting/basic/save",
  },

  EMAIL_SERVICE_PROVIDER: {
    ALL: "/api/v1/emailserviceprovider/all",
    BY_ID: (id: number | string) => `/api/v1/emailserviceprovider/${id}`,
    DEFAULT: "/api/v1/emailserviceprovider/default",
    SETTINGS: (id: number | string) => `/api/v1/emailserviceprovider/${id}/settings`,
    SAVE: "/api/v1/emailserviceprovider/save",
    SET_DEFAULT: "/api/v1/emailserviceprovider/set-default",
    UPDATE_STATUS: "/api/v1/emailserviceprovider/update-status",
    UPDATE_SETTINGS: "/api/v1/emailserviceprovider/settings/update",
    DELETE: (name: string) => `/api/v1/emailserviceprovider/${name}`,
  },

  SMS_SERVICE_PROVIDER: {
    ALL: "/api/v1/smsserviceprovider/all",
    BY_ID: (id: number | string) => `/api/v1/smsserviceprovider/${id}`,
    DEFAULT: "/api/v1/smsserviceprovider/default",
    SETTINGS: (id: number | string) => `/api/v1/smsserviceprovider/${id}/settings`,
    SAVE: "/api/v1/smsserviceprovider/save",
    SET_DEFAULT: "/api/v1/smsserviceprovider/set-default",
    UPDATE_STATUS: "/api/v1/smsserviceprovider/update-status",
    UPDATE_SETTINGS: "/api/v1/smsserviceprovider/settings/update",
    DELETE: (id: number | string) => `/api/v1/smsserviceprovider/${id}`,
  },

  EMAIL_TEMPLATE: {
    ALL: "/api/v1/emailtemplate/all",
    BY_ID: (id: number | string) => `/api/v1/emailtemplate/${id}`,
    FULL: (id: number | string) => `/api/v1/emailtemplate/${id}/full`,
    DEFAULTS: "/api/v1/emailtemplate/defaults",
    SAVE: "/api/v1/emailtemplate/save",
    UPLOAD_IMAGE: "/api/v1/emailtemplate/upload-image",
    DELETE: (id: number | string) => `/api/v1/emailtemplate/${id}`,
  },

  TIMEZONE: {
    ALL: "/api/v1/timezone/all",
    BY_ID: (id: number | string) => `/api/v1/timezone/${id}`,
    CHECK_USER: "/api/v1/timezone/check/user",
    SAVE_USER: "/api/v1/timezone/save/user-timezone",
  },

  OPTIMIZATION: {
    CONFIG: "/api/v1/optimization/config",
    CONFIG_SAVE: "/api/v1/optimization/config/save",
    CACHE_INFO: "/api/v1/optimization/cache/info",
    CACHE_CLEAR: "/api/v1/optimization/cache/clear",
    VERSION_INCREMENT: "/api/v1/optimization/version/increment",
    REBUILD: "/api/v1/optimization/rebuild",
  },

  CACHE: {
    INFO: "/api/v1/cache/info",
    LIST: "/api/v1/cache/list",
    FLUSH: "/api/v1/cache/flush",
    REFRESH: (key: string) => `/api/v1/cache/refresh/${encodeURIComponent(key)}`,
    PROVIDERS: "/api/v1/cache/providers",
    SWITCH_PROVIDER: "/api/v1/cache/provider/switch",
    RESTART: "/api/v1/cache/restart",
  },

  MEDIA_LIBRARY: {
    DIRECTORY_SAVE: "/api/v1/media-library/directory/save",
    FILE_RENAME: "/api/v1/media-library/file/rename",
    CONTENT_ALL: (currentDir: string) =>
      `/api/v1/media-library/content/all?currentDir=${encodeURIComponent(currentDir)}`,
    DIRECTORY_ALL: (currentDir: string) =>
      `/api/v1/media-library/directory/all?currentDir=${encodeURIComponent(currentDir)}`,
    FILE_UPLOAD: "/api/v1/media-library/file/upload",
    FILE_COPY: "/api/v1/media-library/file/copy",
    FILE_MOVE: "/api/v1/media-library/file/move",
    FILE_DELETE: "/api/v1/media-library/file/delete",
  },

  LOCALIZATION: {
    REGION_ALL: (pageNo: number, rowsPerPage: number, query: string) =>
      `/api/v1/localization/region/all?pageNo=${pageNo}&rowsPerPage=${rowsPerPage}&query=${encodeURIComponent(query)}`,
    REGION_BY_ID: (id: number | string) =>
      `/api/v1/localization/region/byid/${id}`,
    COUNTRY_ALL: "/api/v1/localization/country/all",
    IMPORT: "/api/v1/localization/import",
    REGION_NEW: "/api/v1/localization/region/new",
    REGION_UPDATE: "/api/v1/localization/region/update",
    RESOURCE_ALL: (localRegionId: number | string, pageNo: number, limit: number, query: string) =>
      `/api/v1/localization/region/${localRegionId}/resource/all?pageNo=${pageNo}&limit=${limit}&query=${encodeURIComponent(query)}`,
    EXPORT: (localRegionId: number | string) =>
      `/api/v1/localization/export/${localRegionId}`,
    SET_DEFAULT: "/api/v1/localization/set-default",
    RESOURCE_SAVE: "/api/v1/localization/resource/save",
    DELETE: "/api/v1/localization/delete",
    LANGUAGE: "/api/v1/localization/language",
  },

  MODULE: {
    ALL: (pageNo: number, pageSize: number, status: string, query: string) =>
      `/api/v1/module/all?pageNo=${pageNo}&pageSize=${pageSize}&status=${status}&query=${encodeURIComponent(query)}`,
    INSTALL: "/api/v1/module/install",
    UNINSTALL: "/api/v1/module/uninstall",
    UPLOAD: "/api/v1/module/upload",
    ENABLE: "/api/v1/module/enable",
    DISABLE: "/api/v1/module/disable",
    UPGRADE: "/api/v1/module/upgrade",
    ROLLBACK: "/api/v1/module/rollback",
    JOURNAL: (moduleName: string) => `/api/v1/module/${encodeURIComponent(moduleName)}/journal`,
    PING: (moduleName: string) => `/api/v1/module/${encodeURIComponent(moduleName)}/ping`,
  },

  SEO: {
    ALL: (offset: number, limit: number, query: string) =>
      `/api/v1/seo/all?offset=${offset}&limit=${limit}&query=${encodeURIComponent(query)}`,
    BY_URL: (url: string, type: string) =>
      `/api/v1/seo/by-url?url=${encodeURIComponent(url)}&type=${type}`,
    META: (url: string, type: string) =>
      `/api/v1/seo/meta?url=${encodeURIComponent(url)}&type=${type}`,
    BY_ID: (seoId: number | string) =>
      `/api/v1/seo/by-id/${seoId}`,
    BY_SEO_TYPE: (seoType: string, id: number | string) =>
      `/api/v1/seo/by-seotype?seoType=${seoType}&id=${id}`,
    BY_PRODUCT: (productId: number | string, type: string) =>
      `/api/v1/seo/by-product?productId=${productId}&type=${type}`,
    CHECK_URL: "/api/v1/seo/check-url",
    NEW: "/api/v1/seo/new",
    UPDATE: "/api/v1/seo/update",
    DELETE: (seoId: number | string) => `/api/v1/seo/${seoId}`,
    JSONLD_WEBSITE: "/api/v1/seo/jsonld/website",
    JSONLD_PAGE: "/api/v1/seo/jsonld/page",
    JSONLD_PAGE_BY_PRODUCT: (page: string, productId: number | string, type: string) =>
      `/api/v1/seo/jsonld/page/by-product?page=${page}&productId=${productId}&type=${type}`,
    META_GENERATE: "/api/v1/seo/meta/generate",
  },

  MISC: {
    COUNTRY_ALL: "/api/v1/misc/country/all",
  },

  HTML_COMPONENT: {
    ALL_ACTIVE: (offset: number, limit: number, query: string) =>
      `/api/v1/html-component/all/active?offset=${offset}&limit=${limit}&query=${encodeURIComponent(query)}`,
    ALL: (offset: number, limit: number, query: string) =>
      `/api/v1/html-component/all?offset=${offset}&limit=${limit}&query=${encodeURIComponent(query)}`,
    BY_ID: (id: number | string) =>
      `/api/v1/html-component/${id}`,
    CHECK_UNIQUE: (name: string, oldName: string, htmlComponentId: number | string) =>
      `/api/v1/html-component/check/unique?name=${encodeURIComponent(name)}&oldName=${encodeURIComponent(oldName)}&htmlComponentId=${htmlComponentId}`,
    SAVE: "/api/v1/html-component/save",
    DELETE: (id: number | string) => `/api/v1/html-component/${id}`,
  },

  OPENIDICT: {
    CLIENT_ALL: "/api/v1/openiddict/client/all",
    CLIENT_SAVE: "/api/v1/openiddict/client/save",
    CLIENT_DELETE: (id: number | string) => `/api/v1/openiddict/client/${id}`,
    APPLICATION_ALL: "/api/v1/openiddict/application/all",
    APPLICATION_SAVE: "/api/v1/openiddict/application/save",
    APPLICATION_DELETE: (id: number | string) => `/api/v1/openiddict/application/${id}`,
    SCOPE_ALL: "/api/v1/openiddict/scope/all",
    SCOPE_SAVE: "/api/v1/openiddict/scope/save",
    SCOPE_DELETE: (id: number | string) => `/api/v1/openiddict/scope/${id}`,
    RESOURCE_ALL: "/api/v1/openiddict/resource/all",
    RESOURCE_SAVE: "/api/v1/openiddict/resource/save",
    RESOURCE_DELETE: (id: number | string) => `/api/v1/openiddict/resource/${id}`,
    GRANT_ALL: "/api/v1/openiddict/grant/all",
    GRANT_DELETE: (id: number | string) => `/api/v1/openiddict/grant/${id}`,
    PERMISSION_ALL: "/api/v1/openiddict/permission/all",
  },

  ORGANIZATION: {
    ALL: "/api/v1/organization/all",
  },

  AI_ASSISTANT: {
    ALL: "/api/v1/aiassistant/all",
    SAVE: "/api/v1/aiassistant/save",
    DELETE: (id: number | string) => `/api/v1/aiassistant/${id}`,
    BY_ID: (id: number | string) => `/api/v1/aiassistant/${id}`,
  },

  CATEGORY: {
    ALL: "/api/v1/category/all",
    SAVE: "/api/v1/category/save",
    DELETE: (id: number | string) => `/api/v1/category/${id}`,
  },

  COLLECTION: {
    ALL: "/api/v1/collection/all",
    SAVE: "/api/v1/collection/save",
    DELETE: (id: number | string) => `/api/v1/collection/${id}`,
  },

  KNOWLEDGE_BASE: {
    ALL: "/api/v1/knowledgebase/all",
    SAVE: "/api/v1/knowledgebase/save",
    DELETE: (id: number | string) => `/api/v1/knowledgebase/${id}`,
  },

  LLM_PROVIDER: {
    ALL: "/api/v1/llmprovider/all",
    SAVE: "/api/v1/llmprovider/save",
    DELETE: (id: number | string) => `/api/v1/llmprovider/${id}`,
  },

  MODERATION: {
    ALL: "/api/v1/moderation/all",
    SAVE: "/api/v1/moderation/save",
    DELETE: (id: number | string) => `/api/v1/moderation/${id}`,
  },

  SYSTEM_PROMPT: {
    ALL: "/api/v1/systemprompt/all",
    SAVE: "/api/v1/systemprompt/save",
    DELETE: (id: number | string) => `/api/v1/systemprompt/${id}`,
  },

  THEME: {
    ALL: "/api/v1/theme/all",
    SAVE: "/api/v1/theme/save",
    DELETE: (id: number | string) => `/api/v1/theme/${id}`,
  },

  SUPPORT: {
    ALL: "/api/v1/support/all",
    SAVE: "/api/v1/support/save",
    DELETE: (id: number | string) => `/api/v1/support/${id}`,
  },

  YO_PAGE: {
    LIST: "/api/v1/page/list",
    BY_ID: (pageId: string) => `/api/v1/page/${pageId}`,
    SAVE: "/api/v1/page/save",
    PUBLISH: "/api/v1/page/publish",
    DELETE: (pageId: string) => `/api/v1/page/${pageId}`,
    CHECK_SLUG: (slug: string, excludePageUniqueId?: string) =>
      `/api/v1/page/check-slug?slug=${encodeURIComponent(slug)}${excludePageUniqueId ? `&excludePageUniqueId=${excludePageUniqueId}` : ""}`,
    LAYOUT_LIST: "/api/v1/page/layout/list",
    LAYOUT_LIST_LIGHT: "/api/v1/page/layout/list-light",
    LAYOUT_BY_ID: (layoutGuid: string) => `/api/v1/page/layout/${layoutGuid}`,
    LAYOUT_SAVE: "/api/v1/page/layout/save",
    LAYOUT_DELETE: (layoutGuid: string) => `/api/v1/page/layout/${layoutGuid}`,
    LAYOUT_IMAGE_ADD: "/api/v1/page/layout/image/add",
  },

  PUBLIC_PAGE: {
    BY_SLUG: (slug: string) => `/api/public/pages/${encodeURIComponent(slug)}`,
  },

  RESTRICTION: {
    KEY_ALL: "/api/v1/restriction/key/all",
    KEY_SAVE: "/api/v1/restriction/key/save",
    KEY_DELETE: (id: number | string) => `/api/v1/restriction/key/${id}`,
    KEY_BY_ID: (id: number | string) => `/api/v1/restriction/key/${id}`,

    ALL: "/api/v1/restriction/all",
    SAVE: "/api/v1/restriction/save",
    DELETE: (id: number | string) => `/api/v1/restriction/${id}`,
    BY_ID: (id: number | string) => `/api/v1/restriction/${id}`,
    BY_KEY_ID: (keyId: number | string) => `/api/v1/restriction/by-key/${keyId}`,

    ADMIN_IP_ALL: "/api/v1/restriction/admin-ip/all",
    ADMIN_IP_SAVE: "/api/v1/restriction/admin-ip/save",
    ADMIN_IP_DELETE: (id: number | string) => `/api/v1/restriction/admin-ip/${id}`,
    ADMIN_IP_BY_ID: (id: number | string) => `/api/v1/restriction/admin-ip/${id}`,
  },
} as const;
