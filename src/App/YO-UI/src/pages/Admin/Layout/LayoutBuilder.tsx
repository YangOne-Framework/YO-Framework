import { useEffect, useMemo, useCallback, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ComponentPalette } from "../CmsPage/editor/ComponentPalette";
import { CanvasEditor } from "../CmsPage/editor/CanvasEditor";
import { PropertiesPanel } from "../CmsPage/editor/PropertiesPanel";
import { EditorToolbar } from "../CmsPage/editor/EditorToolbar";
import { editorStore, createEmptyPage } from "../../../store/editorStore";
import { mapLayoutDtoToDefinition } from "../../../services/localStorageDb";
import { useGetMasterLayoutByIdQuery } from "../../../redux/layout/layoutAPI";
import { componentRegistry } from "../../../registry/componentRegistry";
import type { YoSection, MasterLayoutDefinition, YoComponentInstance, LayoutZoneMap, DeviceMode } from "../../../types/yoPageTypes";

export const LAYOUT_ZONE_IDS = ["layout-header", "layout-sidebar", "layout-footer"] as const;

export interface RegionConfig {
  id: string;
  label: string;
  componentType: string;
  containerMode: "boxed" | "fluid";
  maxWidth?: string;
  paddingY: string;
  backgroundColor?: string;
  enabled: boolean;
  deviceVisibility: Record<DeviceMode, boolean>;
}

const DEFAULT_REGIONS: RegionConfig[] = [
  { id: "header", label: "Header", componentType: "layout-header", containerMode: "boxed", maxWidth: "1200px", paddingY: "md", backgroundColor: "", enabled: true, deviceVisibility: { desktop: true, tablet: true, mobile: true } },
  { id: "sidebar", label: "Sidebar", componentType: "layout-sidebar", containerMode: "boxed", maxWidth: "300px", paddingY: "md", backgroundColor: "", enabled: false, deviceVisibility: { desktop: true, tablet: true, mobile: false } },
  { id: "body", label: "Body (Content)", componentType: "", containerMode: "boxed", maxWidth: "1200px", paddingY: "md", backgroundColor: "", enabled: true, deviceVisibility: { desktop: true, tablet: true, mobile: true } },
  { id: "footer", label: "Footer", componentType: "layout-footer", containerMode: "boxed", maxWidth: "1200px", paddingY: "md", backgroundColor: "", enabled: true, deviceVisibility: { desktop: true, tablet: true, mobile: true } },
];

const ZONE_MAP: Record<string, { sectionId: string; colId: string; componentType: string }> = {
  header: { sectionId: "layout-header", colId: "header-col", componentType: "layout-header" },
  sidebar: { sectionId: "layout-sidebar", colId: "sidebar-col", componentType: "layout-sidebar" },
  body: { sectionId: "layout-body", colId: "body-col", componentType: "" },
  footer: { sectionId: "layout-footer", colId: "footer-col", componentType: "layout-footer" },
};

function createInstance(type: string, zone: string): YoComponentInstance {
  const def = componentRegistry[type];
  const id = `layout-cmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id, type,
    name: def?.label ?? type,
    config: { ...def?.defaultConfig, __layoutZone: zone },
    style: { ...def?.defaultStyle },
    visibility: { desktop: true, tablet: true, mobile: true },
    locked: false,
  };
}

function buildLayoutSections(layout: MasterLayoutDefinition, regions: RegionConfig[]) {
  const sections: YoSection[] = [];
  const components: Record<string, YoComponentInstance> = {};

  function addToCol(zone: string, componentId: string, comp: YoComponentInstance) {
    const zoneInfo = ZONE_MAP[zone];
    if (!zoneInfo) return;
    const section = sections.find(s => s.id === zoneInfo.sectionId);
    if (!section) return;
    const col = section.columns.find(c => c.id === zoneInfo.colId);
    if (!col) return;
    col.components.push(componentId);
    components[componentId] = comp;
  }

  function ensureSeeded(zone: string) {
    const zoneInfo = ZONE_MAP[zone];
    if (!zoneInfo || !zoneInfo.componentType) return;
    const section = sections.find(s => s.id === zoneInfo.sectionId);
    if (!section) return;
    const col = section.columns.find(c => c.id === zoneInfo.colId);
    if (!col) return;
    if (col.components.length > 0) return;
    const instance = createInstance(zoneInfo.componentType, zone);
    col.components.push(instance.id);
    components[instance.id] = instance;
  }

  for (const reg of regions) {
    if (!reg.enabled) continue;
    const zi = ZONE_MAP[reg.id];
    if (!zi) continue;
    const isSidebar = reg.id === "sidebar";
    const layoutSidebar = layout.sidebar ?? "none";
    if (reg.id === "sidebar" && layoutSidebar === "none") continue;
    sections.push({
      id: zi.sectionId,
      name: reg.label,
      layoutPresetId: "1-column",
      settings: {
        layoutMode: reg.containerMode,
        fullWidth: reg.containerMode === "fluid",
        paddingY: reg.paddingY as any,
        backgroundColor: reg.backgroundColor || "#ffffff",
        maxWidth: reg.maxWidth,
      },
      columns: [{
        id: zi.colId,
        title: reg.label,
        span: { desktop: isSidebar ? (layoutSidebar === "left" ? 3 : 9) : 12, tablet: isSidebar ? 4 : 12, mobile: 12 },
        components: [] as string[],
      }],
    });
  }

  const zoneMap = layout.zones ?? { header: [], sidebar: [], footer: [], body: [] };
  if (layout.components) {
    for (const [zoneKey, ids] of Object.entries(zoneMap)) {
      for (const id of ids) {
        const comp = layout.components[id];
        if (comp) addToCol(zoneKey, id, structuredClone(comp));
      }
    }
    for (const id of layout.componentIds ?? []) {
      if (components[id]) continue;
      const comp = layout.components[id];
      if (!comp) continue;
      const zone = (comp.config?.__layoutZone as string) || (comp.type === 'layout-footer' ? 'footer' : comp.type === 'layout-sidebar' ? 'sidebar' : 'header');
      addToCol(zone, id, structuredClone(comp));
    }
  }

  if (regions.find(r => r.id === "header")?.enabled) ensureSeeded("header");
  if (layout.sidebar && layout.sidebar !== "none" && regions.find(r => r.id === "sidebar")?.enabled) ensureSeeded("sidebar");
  if (regions.find(r => r.id === "footer")?.enabled) ensureSeeded("footer");

  return { sections, components };
}

export default function LayoutBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const layoutId = searchParams.get("id");
  const { data: layoutApi } = useGetMasterLayoutByIdQuery(layoutId!, { skip: !layoutId });
  const [regions, setRegions] = useState<RegionConfig[]>(DEFAULT_REGIONS);

  const layout = useMemo(() => {
    if (!layoutApi?.Data) return null;
    return mapLayoutDtoToDefinition(layoutApi.Data as any);
  }, [layoutApi]);

  useEffect(() => {
    if (!layout) return;
    const active = DEFAULT_REGIONS.map(r => ({
      ...r,
      enabled: r.id === "header" ? (layout.hasHeader ?? true) : r.id === "footer" ? (layout.hasFooter ?? true) : r.id === "sidebar" ? (layout.sidebar && layout.sidebar !== "none") : true,
    }));
    setRegions(active);
  }, [layout]);

  useEffect(() => {
    if (!layout) return;
    const { sections, components } = buildLayoutSections(layout, regions);
    const page = createEmptyPage();
    page.title = `Layout: ${layout.name}`;
    page.slug = `layout-${layout.id}`;
    page.masterLayoutId = "none";
    page.sections = sections;
    page.components = components;
    editorStore.loadPage(page);
    editorStore.setEditingLayout(layoutId!);
  }, [layout, layoutId, regions]);

  const handleNavigate = useCallback((view: string) => {
    if (view === "layouts" || view === "pages") navigate("/admin/layout");
  }, [navigate]);

  const toggleRegion = useCallback((id: string) => {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  }, []);

  const updateRegionConfig = useCallback((id: string, patch: Partial<RegionConfig>) => {
    setRegions(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col rounded-2xl bg-gray-50 dark:bg-gray-900">
      <EditorToolbar onNavigate={handleNavigate} />
      <div className="flex min-h-0 flex-1">
        <div className="w-[310px] min-w-0 flex-shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <RegionPanel regions={regions} onToggle={toggleRegion} onUpdate={updateRegionConfig} />
          <ComponentPalette />
        </div>
        <div className="flex-1 min-w-0">
          <CanvasEditor />
        </div>
        <div className="w-[390px] min-w-0 flex-shrink-0">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}

function RegionPanel({ regions, onToggle, onUpdate }: {
  regions: RegionConfig[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: Partial<RegionConfig>) => void;
}) {
  return (
    <div className="border-b border-gray-200 p-3 dark:border-gray-700">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Layout Regions</h3>
      <div className="space-y-1.5">
        {regions.map(reg => (
          <div key={reg.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={reg.enabled} onChange={() => onToggle(reg.id)} className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600" />
              <span className={`font-medium ${reg.enabled ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>{reg.label}</span>
            </div>
            {reg.enabled && (
              <select value={reg.containerMode} onChange={e => onUpdate(reg.id, { containerMode: e.target.value as any })}
                className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                <option value="boxed">Boxed</option>
                <option value="fluid">Fluid</option>
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
