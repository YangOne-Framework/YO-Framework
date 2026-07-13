import type { YoComponentInstance, YoPage, YoPageVersion, MasterLayoutConfig, MasterLayoutDefinition, LayoutZoneMap } from '../types/yoPageTypes';
import { API } from '../config/apiUrls';
import { BaseEndpoints } from '../config/BaseEndpoints';
import { getValidToken, clearToken } from './tokenManager';

const SEED_LAYOUTS: MasterLayoutDefinition[] = [
  { id: 'none', name: 'Standalone / No Master', description: 'Only page content is rendered.', hasHeader: false, hasFooter: false, sidebar: 'none', isSystem: true },
  { id: 'default-site', name: 'Default Website', description: 'Editable header and footer around page content.', hasHeader: true, hasFooter: true, sidebar: 'none', isSystem: true },
  { id: 'landing', name: 'Landing Page', description: 'Minimal campaign layout with compact nav.', hasHeader: true, hasFooter: true, sidebar: 'none', isSystem: true },
  { id: 'docs-left-sidebar', name: 'Docs Left Sidebar', description: 'Header, footer, and editable left sidebar shell.', hasHeader: true, hasFooter: true, sidebar: 'left', isSystem: true }
];

let layoutsCache: MasterLayoutDefinition[] = [...SEED_LAYOUTS];
let layoutsRefreshPromise: Promise<void> | null = null;
let lastRefreshTime = 0;
const CACHE_TTL = 30_000;

async function refreshLayoutsFromApi(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastRefreshTime < CACHE_TTL) return;
  if (layoutsRefreshPromise && !force) return layoutsRefreshPromise;
  layoutsRefreshPromise = (async () => {
    try {
      const data = await apiRequest<Array<Record<string, unknown>>>(API.YO_PAGE.LAYOUT_LIST);
      if (data && Array.isArray(data)) {
        const apiLayouts = data.map(mapLayoutDtoToDefinition);
        const seedMap = new Map(SEED_LAYOUTS.map(l => [l.id, l]));
        for (const api of apiLayouts) seedMap.set(api.id, api);
        layoutsCache = Array.from(seedMap.values());
      }
      lastRefreshTime = Date.now();
    } catch {
      layoutsCache = [...SEED_LAYOUTS];
    }
  })();
  await layoutsRefreshPromise;
  layoutsRefreshPromise = null;
}

function resolveUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = BaseEndpoints.base || '';
  return base + path;
}

async function apiRequest<T>(url: string, options?: RequestInit, retried = false): Promise<T | null> {
  try {
    const token = await getValidToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string> ?? {}),
    };
    const res = await fetch(resolveUrl(url), { ...options, headers });
    if (res.status === 401 && !retried) {
      clearToken();
      return apiRequest<T>(url, options, true);
    }
    if (!res.ok) return null;
    const json = await res.json();
    return json?.Data ?? json;
  } catch {
    return null;
  }
}

export const localStorageDb = {
  async listPages(): Promise<YoPage[]> {
    const data = await apiRequest<Array<Record<string, unknown>>>(API.YO_PAGE.LIST + '?offset=1&limit=200&status=all');
    if (data && Array.isArray(data)) {
      return data.map(mapPageDtoToYoPage);
    }
    return [];
  },

  async getPage(id: string): Promise<YoPage | null> {
    const data = await apiRequest<Record<string, unknown>>(API.YO_PAGE.BY_ID(id));
    return data ? mapPageDtoToYoPage(data) : null;
  },

  async getPageBySlug(slug: string): Promise<YoPage | null> {
    const data = await apiRequest<Record<string, unknown>>(API.PUBLIC_PAGE.BY_SLUG(slug));
    return data ? mapPublicPageToYoPage(data) : null;
  },

  async savePage(page: YoPage): Promise<YoPage> {
    const payload = {
      PageId: page.id,
      Title: page.title,
      Slug: page.slug,
      Status: page.status,
      MasterLayoutId: page.masterLayoutId,
      MasterLayoutConfig: JSON.stringify(page.masterLayoutConfig),
      SeoSettings: JSON.stringify(page.seo),
      PageSettings: JSON.stringify(page.settings),
      Sections: JSON.stringify(page.sections),
      Components: JSON.stringify(page.components),
      Version: page.version,
      PublishedAt: page.publishedAt ?? null,
      Culture: 'en-US',
    };

    const result = await apiRequest<Record<string, unknown>>(API.YO_PAGE.SAVE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result) {
      return mapPageDtoToYoPage(result);
    }

    throw new Error('Failed to save page');
  },

  async publishPage(page: YoPage): Promise<YoPage> {
    // First save the latest content as draft
    const saved = await this.savePage(page);

    // Then publish (copies ContentConfigDraft → ContentConfig on server)
    const result = await apiRequest<Record<string, unknown>>(API.YO_PAGE.PUBLISH, {
      method: 'POST',
      body: JSON.stringify({ pageId: page.id }),
    });

    if (result) {
      return mapPageDtoToYoPage(result);
    }

    throw new Error('Failed to publish page');
  },

  async deletePage(id: string): Promise<void> {
    await apiRequest(API.YO_PAGE.DELETE(id), { method: 'DELETE' });
  },

  listVersions(_pageId: string): YoPageVersion[] {
    return [];
  },

  addVersion(_page: YoPage, _type: YoPageVersion['type']): void {
  },

  listMasterLayouts(): MasterLayoutDefinition[] {
    refreshLayoutsFromApi();
    return layoutsCache;
  },

  getMasterLayoutSync(id: string): MasterLayoutDefinition | null {
    return layoutsCache.find(l => l.id === id) ?? null;
  },

  async getMasterLayout(id: string): Promise<MasterLayoutDefinition | null> {
    const cached = layoutsCache.find(l => l.id === id);
    if (cached && (cached.componentIds || cached.zones)) return cached;
    const data = await apiRequest<Record<string, unknown>>(API.YO_PAGE.LAYOUT_BY_ID(id));
    if (data) {
      const def = mapLayoutDtoToDefinition(data);
      const idx = layoutsCache.findIndex(l => l.id === id);
      if (idx >= 0) layoutsCache[idx] = def;
      else layoutsCache.push(def);
      return def;
    }
    await refreshLayoutsFromApi();
    return layoutsCache.find(l => l.id === id) ?? null;
  },

  async saveMasterLayout(layout: MasterLayoutDefinition): Promise<MasterLayoutDefinition[]> {
    const zones = layout.zones ?? { header: [], sidebar: [], footer: [] };
    const allIds = [...zones.header, ...zones.sidebar, ...zones.footer];
    const payload: Record<string, unknown> = {
      layoutGUID: layout.id,
      name: layout.name,
      description: layout.description ?? '',
      hasHeader: layout.hasHeader,
      hasFooter: layout.hasFooter,
      sidebar: layout.sidebar,
      isSystem: layout.isSystem ?? false,
      layoutConfig: JSON.stringify({
        zones,
        componentIds: allIds,
        components: layout.components ?? {},
        brandName: layout.brandName ?? '',
        navItems: layout.navItems ?? '',
        ctaLabel: layout.ctaLabel ?? '',
        ctaUrl: layout.ctaUrl ?? '',
        footerText: layout.footerText ?? '',
        headerStyle: layout.headerStyle ?? 'clean',
        containerMode: layout.containerMode ?? 'boxed',
      }),
    };
    await apiRequest(API.YO_PAGE.LAYOUT_SAVE, { method: 'POST', body: JSON.stringify(payload) });
    await refreshLayoutsFromApi();
    return layoutsCache;
  },

  async saveLayoutDesign(id: string, zones: LayoutZoneMap, components: Record<string, YoComponentInstance>): Promise<void> {
    const layout = layoutsCache.find(l => l.id === id);
    if (!layout) return;
    await this.saveMasterLayout({ ...layout, zones, components });
  },

  async deleteMasterLayout(id: string): Promise<boolean> {
    await apiRequest(API.YO_PAGE.LAYOUT_DELETE(id), { method: 'DELETE' });
    await refreshLayoutsFromApi();
    return true;
  },

  exportAll(): string {
    return '{}';
  },

  importAll(_json: string): void {
  }
};

function mapPageDtoToYoPage(dto: Record<string, unknown>): YoPage {
  const contentConfig = safeJsonParse(dto.contentConfigDraft ?? dto.ContentConfigDraft ?? dto.contentConfig ?? dto.ContentConfig, {}) as Record<string, unknown>;
  const rawLayoutConfig = contentConfig.masterLayoutConfig as MasterLayoutConfig | undefined;

  return {
    id: (dto.pageGUID ?? dto.PageGUID ?? dto.pageId ?? dto.PageId ?? '') as string,
    title: (dto.name ?? dto.Name ?? dto.title ?? '') as string,
    slug: (dto.slug ?? dto.Slug ?? dto.url ?? dto.Url ?? '') as string,
    status: (dto.status ?? dto.Status ?? (dto.isPublished || dto.IsPublished ? 'published' : 'draft')) as YoPage['status'],
    masterLayoutId: (dto.masterLayoutId ?? dto.MasterLayoutId ?? null) as string | null,
    masterLayoutConfig: rawLayoutConfig ?? {
      brandName: 'StudioSite', navItems: 'Home, Work, Pricing, Contact',
      ctaLabel: 'Get started', ctaUrl: '#', footerText: 'Designed with CMS Studio',
      headerStyle: 'glass', containerMode: 'boxed'
    } as MasterLayoutConfig,
    seo: (contentConfig.seo ?? { metaTitle: dto.name ?? dto.Name ?? '', metaDescription: '', keywords: '' }) as YoPage['seo'],
    settings: (contentConfig.pageSettings ?? { containerMode: 'boxed', backgroundColor: '#f8fafc' }) as YoPage['settings'],
    sections: (Array.isArray(contentConfig.sections) ? contentConfig.sections : []) as YoPage['sections'],
    components: (contentConfig.components && typeof contentConfig.components === 'object' && !Array.isArray(contentConfig.components) ? contentConfig.components : {}) as Record<string, YoComponentInstance>,
    version: (dto.version ?? dto.Version ?? 1) as number,
    createdAt: (dto.addedOn ?? dto.AddedOn ?? new Date().toISOString()) as string,
    updatedAt: (dto.lastModified ?? dto.LastModified ?? dto.updatedOn ?? dto.UpdatedOn ?? new Date().toISOString()) as string,
    publishedAt: (dto.publishedAt ?? dto.PublishedAt ?? null) as string | null,
  };
}

function mapPublicPageToYoPage(dto: Record<string, unknown>): YoPage {
  return {
    id: (dto.pageId ?? dto.PageId ?? '') as string,
    title: (dto.title ?? dto.Title ?? '') as string,
    slug: (dto.slug ?? dto.Slug ?? '') as string,
    status: (dto.status ?? dto.Status ?? 'published') as YoPage['status'],
    masterLayoutId: (dto.masterLayoutId ?? dto.MasterLayoutId ?? null) as string | null,
    masterLayoutConfig: deepCamelCase(dto.masterLayoutConfig ?? dto.MasterLayoutConfig ?? {
      brandName: 'StudioSite', navItems: 'Home, Work, Pricing, Contact',
      ctaLabel: 'Get started', ctaUrl: '#', footerText: 'Designed with CMS Studio',
      headerStyle: 'glass', containerMode: 'boxed'
    }) as YoPage['masterLayoutConfig'],
    seo: deepCamelCase(dto.seo ?? dto.Seo ?? { metaTitle: dto.title ?? dto.Title ?? '', metaDescription: '', keywords: '' }) as YoPage['seo'],
    settings: deepCamelCase(dto.settings ?? dto.Settings ?? { containerMode: 'boxed', backgroundColor: '#f8fafc' }) as YoPage['settings'],
    sections: deepCamelCase(dto.sections ?? dto.Sections ?? []) as YoPage['sections'],
    components: deepCamelCase(dto.components ?? dto.Components ?? {}) as YoPage['components'],
    version: (dto.version ?? dto.Version ?? 1) as number,
    createdAt: (dto.createdAt ?? dto.CreatedAt ?? new Date().toISOString()) as string,
    updatedAt: (dto.updatedAt ?? dto.UpdatedAt ?? new Date().toISOString()) as string,
    publishedAt: (dto.publishedAt ?? dto.PublishedAt ?? null) as string | null,
  };
}

function pascalToCamel(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function deepCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(deepCamelCase);
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      result[pascalToCamel(key)] = deepCamelCase((obj as Record<string, unknown>)[key]);
    }
    return result;
  }
  return obj;
}

export function mapLayoutDtoToDefinition(dto: Record<string, unknown>): MasterLayoutDefinition {
  const config = safeJsonParse(dto.LayoutConfig ?? dto.layoutConfig, {}) as Record<string, unknown>;
  const zones = config.zones as LayoutZoneMap | undefined;
  return {
    id: (dto.LayoutGUID ?? dto.layoutGUID ?? '') as string,
    name: (dto.Name ?? dto.name ?? '') as string,
    description: (dto.Description ?? dto.description ?? '') as string,
    hasHeader: (dto.HasHeader ?? dto.hasHeader ?? true) as boolean,
    hasFooter: (dto.HasFooter ?? dto.hasFooter ?? true) as boolean,
    sidebar: (dto.Sidebar ?? dto.sidebar ?? 'none') as 'none' | 'left' | 'right',
    isSystem: (dto.IsSystem ?? dto.isSystem ?? false) as boolean,
    zones: zones ?? { header: [], sidebar: [], footer: [] },
    componentIds: (config.componentIds ?? []) as string[],
    components: (config.components ?? {}) as Record<string, YoComponentInstance>,
    ...config.brandName ? {
      brandName: config.brandName as string,
      navItems: config.navItems as string,
      ctaLabel: config.ctaLabel as string,
      ctaUrl: config.ctaUrl as string,
      footerText: config.footerText as string,
      headerStyle: config.headerStyle as 'clean' | 'glass' | 'dark' ?? 'clean',
      containerMode: config.containerMode as 'boxed' | 'fluid' ?? 'boxed',
    } : {},
  };
}

function safeJsonParse(value: unknown, fallback: unknown): unknown {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value as string);
  } catch {
    return fallback;
  }
}
