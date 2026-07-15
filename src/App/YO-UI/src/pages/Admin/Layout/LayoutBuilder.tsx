import { useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ComponentPalette } from "../CmsPage/editor/ComponentPalette";
import { CanvasEditor } from "../CmsPage/editor/CanvasEditor";
import { PropertiesPanel } from "../CmsPage/editor/PropertiesPanel";
import { EditorToolbar } from "../CmsPage/editor/EditorToolbar";
import { editorStore, createEmptyPage } from "../../../store/editorStore";
import { mapLayoutDtoToDefinition } from "../../../services/localStorageDb";
import { useGetMasterLayoutByIdQuery } from "../../../redux/layout/layoutAPI";
import { componentRegistry } from "../../../registry/componentRegistry";
import type { YoSection, MasterLayoutDefinition, YoComponentInstance, LayoutZoneMap } from "../../../types/yoPageTypes";

export const LAYOUT_ZONE_IDS = ["layout-header", "layout-sidebar", "layout-footer"] as const;

const ZONE_MAP: Record<string, { sectionId: string; colId: string; componentType: string }> = {
  header: { sectionId: "layout-header", colId: "header-col", componentType: "layout-header" },
  sidebar: { sectionId: "layout-sidebar", colId: "sidebar-col", componentType: "layout-sidebar" },
  footer: { sectionId: "layout-footer", colId: "footer-col", componentType: "layout-footer" },
};

function createInstance(type: string, zone: string): YoComponentInstance {
  const def = componentRegistry[type];
  const id = `layout-cmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    type,
    name: def?.label ?? type,
    config: { ...def?.defaultConfig, __layoutZone: zone },
    style: { ...def?.defaultStyle },
    visibility: { desktop: true, tablet: true, mobile: true },
    locked: false,
  };
}

function buildLayoutSections(layout: MasterLayoutDefinition) {
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
    if (!zoneInfo) return;
    const section = sections.find(s => s.id === zoneInfo.sectionId);
    if (!section) return;
    const col = section.columns.find(c => c.id === zoneInfo.colId);
    if (!col) return;
    if (col.components.length > 0) return;
    const instance = createInstance(zoneInfo.componentType, zone);
    col.components.push(instance.id);
    components[instance.id] = instance;
  }

  if (layout.hasHeader) {
    sections.push({
      id: "layout-header",
      name: "Header",
      layoutPresetId: "1-column",
      settings: { layoutMode: "boxed", fullWidth: false, paddingY: "md", backgroundColor: "#ffffff" },
      columns: [{ id: "header-col", title: "Header", span: { desktop: 12, tablet: 12, mobile: 12 }, components: [] as string[] }],
    });
  }

  if (layout.sidebar && layout.sidebar !== "none") {
    const width = layout.sidebar === "left" ? 3 : 9;
    sections.push({
      id: "layout-sidebar",
      name: `${layout.sidebar === "left" ? "Left" : "Right"} Sidebar`,
      layoutPresetId: "1-column",
      settings: { layoutMode: "boxed", fullWidth: false, paddingY: "md", backgroundColor: "#ffffff" },
      columns: [{ id: "sidebar-col", title: "Sidebar", span: { desktop: width, tablet: 4, mobile: 12 }, components: [] as string[] }],
    });
  }

  if (layout.hasFooter) {
    sections.push({
      id: "layout-footer",
      name: "Footer",
      layoutPresetId: "1-column",
      settings: { layoutMode: "boxed", fullWidth: false, paddingY: "md", backgroundColor: "#ffffff" },
      columns: [{ id: "footer-col", title: "Footer", span: { desktop: 12, tablet: 12, mobile: 12 }, components: [] as string[] }],
    });
  }

  const zoneMap = layout.zones ?? { header: [], sidebar: [], footer: [] };
  if (layout.components) {
    for (const [zoneKey, ids] of Object.entries(zoneMap)) {
      for (const id of ids) {
        const comp = layout.components[id];
        if (comp) addToCol(zoneKey, id, structuredClone(comp));
      }
    }
    for (const id of layout.componentIds ?? []) {
      if (components[id] || zoneMap.header.includes(id) || zoneMap.sidebar.includes(id) || zoneMap.footer.includes(id)) continue;
      const comp = layout.components[id];
      if (!comp) continue;
      const zone = (comp.config?.__layoutZone as string) || (comp.type === 'layout-footer' ? 'footer' : comp.type === 'layout-sidebar' ? 'sidebar' : 'header');
      addToCol(zone, id, structuredClone(comp));
    }
  }

  ensureSeeded("header");
  if (layout.sidebar && layout.sidebar !== "none") ensureSeeded("sidebar");
  ensureSeeded("footer");

  return { sections, components };
}

export default function LayoutBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const layoutId = searchParams.get("id");
  const { data: layoutApi } = useGetMasterLayoutByIdQuery(layoutId!, { skip: !layoutId });

  const layout = useMemo(() => {
    if (!layoutApi?.Data) return null;
    return mapLayoutDtoToDefinition(layoutApi.Data as any);
  }, [layoutApi]);

  useEffect(() => {
    if (!layout) return;

    const { sections, components } = buildLayoutSections(layout);
    const page = createEmptyPage();
    page.title = `Layout: ${layout.name}`;
    page.slug = `layout-${layout.id}`;
    page.masterLayoutId = "none";
    page.sections = sections;
    page.components = components;
    editorStore.loadPage(page);
    editorStore.setEditingLayout(layoutId!);
  }, [layout, layoutId]);

  const handleNavigate = useCallback((view: string) => {
    if (view === "layouts" || view === "pages") navigate("/admin/layout");
  }, [navigate]);

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col rounded-2xl bg-gray-50 dark:bg-gray-900">
      <EditorToolbar onNavigate={handleNavigate} />
      <div className="flex min-h-0 flex-1">
        <div className="w-[310px] min-w-0 flex-shrink-0">
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
