import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { PageRenderer } from "../../../renderer/PageRenderer";
import { localStorageDb } from "../../../services/localStorageDb";
import type { YoPage } from "../../../types/yoPageTypes";

export default function PreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pageId = searchParams.get("id");
  const [page, setPage] = useState<YoPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (pageId) {
      localStorageDb.getPage(pageId).then(p => {
        setPage(p);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [pageId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!page) return <div className="p-8 text-center text-gray-500">Page not found</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b bg-white/95 px-4 py-2 backdrop-blur">
        <span className="text-sm font-medium text-gray-500">Preview: {page.title}</span>
        <button
          onClick={() => navigate(`/admin/yopage/builder?id=${pageId}`)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
        >
          Back to Editor
        </button>
      </div>
      <PageRenderer page={page} />
    </div>
  );
}
