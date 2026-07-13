import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useSaveYoPageMutation, useGetYoPageByIdQuery, useCheckYoPageSlugQuery } from "../../../redux/cmspage/cmsPageAPI";
import { useGetMasterLayoutsQuery } from "../../../redux/layout/layoutAPI";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import ComponentCard from "../../../components/common/ComponentCard";

interface YoPageFormData {
  pageGUID: string;
  name: string;
  slug: string;
  status: string;
  masterLayoutId: string;
}

const defaultValues: YoPageFormData = {
  pageGUID: "",
  name: "",
  slug: "",
  status: "draft",
  masterLayoutId: "none",
};

const YoPageForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [pageId, setPageId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [lastLoadedSlug, setLastLoadedSlug] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<YoPageFormData>({ defaultValues });

  register("slug", { required: "Slug is required" });

  const currentSlug = watch("slug");

  const { data: pageData, isSuccess } = useGetYoPageByIdQuery(pageId, { skip: !isEditMode || !pageId });

  const [savePage, { isLoading: saving }] = useSaveYoPageMutation();

  const { data: layoutsData } = useGetMasterLayoutsQuery({ offset: 1, limit: 200, query: "" });
  const layouts = ((layoutsData as any)?.Data ?? (layoutsData as any)?.data ?? []) as any[];

  const slugToCheck = currentSlug && currentSlug !== lastLoadedSlug ? currentSlug : "";
  const { data: slugCheckData, isFetching: slugChecking } = useCheckYoPageSlugQuery(
    { slug: slugToCheck, excludePageGuid: isEditMode ? pageId : undefined },
    { skip: !slugToCheck },
  );
  const slugExists = slugToCheck ? (slugCheckData as any)?.Data ?? false : false;

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setPageId(id);
    } else {
      setIsEditMode(false);
      setPageId("");
      reset(defaultValues);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isSuccess && pageData && (pageData as any).Data) {
      const dto: any = (pageData as any).Data;
      const loadedSlug = dto.Slug ?? "";
      setLastLoadedSlug(loadedSlug);
      reset({
        pageGUID: dto.PageGUID ?? "",
        name: dto.Name ?? "",
        slug: loadedSlug,
        status: dto.Status ?? "draft",
        masterLayoutId: dto.MasterLayoutId ?? "none",
      });
    }
  }, [pageData, isSuccess, reset]);

  const slugError = slugExists ? "This URL slug is already taken" : (errors.slug?.message as string);
  const canSubmit = !slugChecking && !slugExists;

  const onSubmit = async (data: YoPageFormData) => {
    if (!canSubmit || slugChecking || slugExists) return;
    const cleanSlug = data.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-_]/g, "").replace(/^\/+/, "");
    try {
      await savePage({
        PageId: isEditMode ? pageId : "",
        Title: data.name,
        Slug: cleanSlug,
        Status: data.status,
        MasterLayoutId: data.masterLayoutId === "none" ? null : data.masterLayoutId,
        Version: 1,
      } as any).unwrap();
      toaster.success(isEditMode ? "Page updated" : "Page created");
      navigate("/admin/yopage");
    } catch {
      toaster.error("Failed to save page");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ComponentCard title={isEditMode ? "Edit Page" : "New Page"}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              type="text"
              id="name"
              labelName="Page Title"
              placeholder="e.g. About Us"
              {...register("name", { required: "Title is required" })}
              error={!!errors.name}
              errorMsg={errors.name?.message as string}
            />
            <div className="relative">
              <div className="w-full px-2.5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  URL Slug
                </label>
                <input
                  id="slug"
                  placeholder="about-us"
                  name="slug"
                  value={currentSlug}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9\-_]/g, "")
                      .replace(/^\/+/, "");
                    setValue("slug", cleaned, { shouldDirty: true, shouldValidate: true });
                  }}
                  className={`w-full rounded-lg border bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-400 ${
                    slugExists || errors.slug
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 text-gray-800 dark:text-white/90"
                  }`}
                />
                {slugChecking && (
                  <p className="mt-1 text-xs text-gray-500">Checking availability...</p>
                )}
                {slugError && !slugChecking && (
                  <p className="mt-1 text-xs text-red-500">{slugError}</p>
                )}
                {currentSlug && !slugExists && !slugChecking && !errors.slug && (
                  <p className="mt-1 text-xs text-green-600">Slug is available</p>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="w-full px-2.5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90 dark:bg-gray-900"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <div className="w-full px-2.5">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Master Layout
                </label>
                <select
                  {...register("masterLayoutId")}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90 dark:bg-gray-900"
                >
                  <option value="none">No layout</option>
                  {layouts.map((layout: any) => (
                    <option key={layout.LayoutGUID} value={layout.LayoutGUID}>
                      {layout.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </ComponentCard>

        <div className="mt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/yopage")}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Cancel
          </button>
          {isEditMode && (
            <button
              type="button"
              onClick={() => navigate(`/admin/yopage/builder?id=${pageId}`)}
              className="flex items-center justify-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:border-brand-500/30 dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-brand-500/10"
            >
              Open Builder
            </button>
          )}
          <button
            type="submit"
            disabled={saving || isSubmitting || !canSubmit}
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default YoPageForm;
