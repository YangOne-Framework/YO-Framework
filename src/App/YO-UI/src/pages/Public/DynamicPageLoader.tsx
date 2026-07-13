import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import DynamicPage from "./DynamicPage";
import NotFound from "../OtherPage/NotFound";
import { useGetPublicPageBySlugQuery } from "../../redux/publicPage/publicPageAPI";
import { mapLayoutDtoToDefinition } from "../../services/localStorageDb";
import type { PublicPageResponse } from "../../types/yoPageApiTypes";
import type { YoPage, YoComponentInstance, YoComponentStyle, MasterLayoutConfig, MasterLayoutDefinition, SeoSettings } from "../../types/yoPageTypes";

function pascalToCamel(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function deepCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(deepCamelCase);
  }
  if (obj && typeof obj === "object" && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      result[pascalToCamel(key)] = deepCamelCase((obj as Record<string, unknown>)[key]);
    }
    return result;
  }
  return obj;
}

function mapPublicPageToYoPage(dto: PublicPageResponse): YoPage {
  const d = dto as any;
  const rawMasterLayout = d.masterLayout ?? d.MasterLayout ?? null;
  let masterLayout: MasterLayoutDefinition | null = null;
  if (rawMasterLayout && typeof rawMasterLayout === 'object') {
    masterLayout = mapLayoutDtoToDefinition(rawMasterLayout as Record<string, unknown>);
  }
  return {
    id: (d.pageId ?? d.PageId ?? "") as string,
    title: (d.title ?? d.Title ?? "") as string,
    slug: (d.slug ?? d.Slug ?? "") as string,
    status: (d.status ?? d.Status ?? "published") as YoPage["status"],
    masterLayoutId: (d.masterLayoutId ?? d.MasterLayoutId ?? null) as string | null,
    masterLayoutConfig: deepCamelCase(d.masterLayoutConfig ?? d.MasterLayoutConfig ?? {}) as MasterLayoutConfig,
    masterLayout,
    seo: deepCamelCase(d.seo ?? d.Seo ?? {}) as SeoSettings,
    settings: deepCamelCase(d.settings ?? d.Settings ?? {}) as YoPage["settings"],
    sections: deepCamelCase(d.sections ?? d.Sections ?? []) as YoPage["sections"],
    components: deepCamelCase(d.components ?? d.Components ?? {}) as Record<string, YoComponentInstance>,
    version: (d.version ?? d.Version ?? 1) as number,
    createdAt: (d.createdAt ?? d.CreatedAt ?? new Date().toISOString()) as string,
    updatedAt: (d.updatedAt ?? d.UpdatedAt ?? new Date().toISOString()) as string,
    publishedAt: (d.publishedAt ?? d.PublishedAt ?? null) as string | null,
  };
}

export default function DynamicPageLoader() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\//, "") || "home";

  const { data, isLoading } = useGetPublicPageBySlugQuery(slug);

  const pageData = useMemo(() => {
    if (!data?.Data) return undefined;
    return mapPublicPageToYoPage(data.Data as any);
  }, [data]);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: 80, color: "#999" }}>Loading...</div>;
  }

  if (!pageData) return <NotFound />;

  return <DynamicPage key={pathname} page={pageData} />;
}
