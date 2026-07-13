import { useMemo } from "react";
import { PageRenderer } from "../../renderer/PageRenderer";
import type { YoPage } from "../../types/yoPageTypes";

interface DynamicPageProps {
  page?: YoPage;
}

export default function DynamicPage({ page }: DynamicPageProps) {
  if (!page) return null;

  return (
    <div className="min-h-screen bg-white">
      <PageRenderer page={page} />
    </div>
  );
}
