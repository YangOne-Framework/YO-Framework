import { useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ComponentPalette } from "./editor/ComponentPalette";
import { CanvasEditor } from "./editor/CanvasEditor";
import { CanvasStatusBar } from "./editor/CanvasStatusBar";
import { EditorToolbar } from "./editor/EditorToolbar";
import { PropertiesPanel } from "./editor/PropertiesPanel";
import { editorStore } from "../../../store/editorStore";
import { useGetYoPageByIdQuery } from "../../../redux/cmspage/cmsPageAPI";
import { mapPageDtoToYoPage } from "../../../services/localStorageDb";
import { useGetActiveHtmlComponentsQuery } from "../../../redux/htmlbuilder/htmlBuilderAPI";
import { registerDynamicDefinition } from "../../../registry/componentRegistry";
import { toYoDefinition } from "../../../registry/htmlComponentRegistry";

export default function YoPageBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pageId = searchParams.get("id");
  const { data: htmlComponentsData } = useGetActiveHtmlComponentsQuery({ offset: 1, limit: 200, query: "" });
  const { data: pageApi } = useGetYoPageByIdQuery(pageId!, { skip: !pageId });

  const pageData = useMemo(() => {
    if (!pageApi?.Data) return null;
    return mapPageDtoToYoPage(pageApi.Data as any);
  }, [pageApi]);

  useEffect(() => {
    if (htmlComponentsData?.Data) {
      for (const item of htmlComponentsData.Data) {
        const def = toYoDefinition(item);
        registerDynamicDefinition(def);
      }
    }
  }, [htmlComponentsData]);

  useEffect(() => {
    if (pageData) {
      editorStore.loadPage(pageData);
    }
  }, [pageData]);

  const handleNavigate = useCallback((view: string) => {
    if (view === "pages") navigate("/admin/yopage");
    else if (view === "preview") navigate(`/admin/yopage/preview?id=${pageId}`);
  }, [navigate, pageId]);

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <EditorToolbar onNavigate={handleNavigate} />
      <div className="flex min-h-0 flex-1">
        <div className="w-[280px] min-w-0 flex-shrink-0">
          <ComponentPalette />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <CanvasEditor />
          </div>
          <CanvasStatusBar />
        </div>
        <div className="w-[360px] min-w-0 flex-shrink-0">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
