import { useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ComponentPalette } from "./editor/ComponentPalette";
import { CanvasEditor } from "./editor/CanvasEditor";
import { EditorToolbar } from "./editor/EditorToolbar";
import { PropertiesPanel } from "./editor/PropertiesPanel";
import { editorStore } from "../../../store/editorStore";
import { localStorageDb } from "../../../services/localStorageDb";
import { useGetActiveHtmlComponentsQuery } from "../../../redux/htmlbuilder/htmlBuilderAPI";
import { registerDynamicDefinition } from "../../../registry/componentRegistry";
import { toYoDefinition } from "../../../registry/htmlComponentRegistry";

export default function YoPageBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pageId = searchParams.get("id");
  const { data: htmlComponentsData } = useGetActiveHtmlComponentsQuery({ offset: 1, limit: 200, query: "" });

  useEffect(() => {
    if (htmlComponentsData?.Data) {
      for (const item of htmlComponentsData.Data) {
        const def = toYoDefinition(item);
        registerDynamicDefinition(def);
      }
    }
  }, [htmlComponentsData]);

  useEffect(() => {
    if (pageId) {
      localStorageDb.getPage(pageId).then(page => {
        if (page) editorStore.loadPage(page);
      });
    }
  }, [pageId]);

  const handleNavigate = useCallback((view: string) => {
    if (view === "pages") navigate("/admin/yopage");
    else if (view === "preview") navigate(`/admin/yopage/preview?id=${pageId}`);
  }, [navigate, pageId]);

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
