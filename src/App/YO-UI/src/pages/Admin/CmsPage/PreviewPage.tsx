import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import DynamicPage from "../../Public/DynamicPage";
import { useGetYoPageByIdQuery } from "../../../redux/cmspage/cmsPageAPI";
import { useGetActiveThemeQuery } from "../../../redux/theme/themeAPI";
import { useGetMasterLayoutByIdQuery } from "../../../redux/layout/layoutAPI";
import { parseThemeConfig } from "../../../context/YOThemeContext";
import { mapPageDtoToYoPage, mapLayoutDtoToDefinition } from "../../../services/localStorageDb";

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pageId = searchParams.get("id");

  const { data: apiResponse, isLoading } = useGetYoPageByIdQuery(pageId!, { skip: !pageId });
  const { data: activeTheme } = useGetActiveThemeQuery();

  const pageData = apiResponse?.Data as any;
  const masterLayoutId = pageData?.MasterLayoutId ?? pageData?.masterLayoutId ?? null;

  const { data: layoutApi } = useGetMasterLayoutByIdQuery(masterLayoutId!, { skip: !masterLayoutId || masterLayoutId === "none" });

  const page = useMemo(() => {
    if (!pageData) return null;
    const base = mapPageDtoToYoPage(pageData);
    if (activeTheme?.Config) {
      base.themeConfig = parseThemeConfig(activeTheme.Config);
    }
    if (layoutApi?.Data) {
      base.masterLayout = mapLayoutDtoToDefinition(layoutApi.Data as any);
    }
    return base;
  }, [pageData, activeTheme, layoutApi]);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!page) return <div className="p-8 text-center text-gray-500">Page not found</div>;

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white/95 px-4 py-2 backdrop-blur">
        <span className="text-sm font-medium text-gray-500">Preview: {page.title}</span>
        <button
          onClick={() => navigate(`/admin/yopage/builder?id=${pageId}`)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
        >
          Back to Editor
        </button>
      </div>
      <DynamicPage page={page} />
    </>
  );
}
