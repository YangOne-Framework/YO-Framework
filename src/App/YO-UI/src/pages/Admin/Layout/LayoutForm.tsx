import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useSaveMasterLayoutMutation, useGetMasterLayoutByIdQuery } from "../../../redux/layout/layoutAPI";
import { useGetThemeListQuery } from "../../../redux/theme/themeAPI";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import ComponentCard from "../../../components/common/ComponentCard";

interface LayoutFormData {
  MasterLayoutUniqueId: string;
  Name: string;
  Description: string;
  HasHeader: boolean;
  HasFooter: boolean;
  Sidebar: string;
  IsSystem: boolean;
  LayoutConfig: string;
  YOThemeId: number | null;
}

const defaultValues: LayoutFormData = {
  MasterLayoutUniqueId: "",
  Name: "",
  Description: "",
  HasHeader: true,
  HasFooter: true,
  Sidebar: "none",
  IsSystem: false,
  LayoutConfig: "{}",
  YOThemeId: null,
};

const LayoutForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [layoutGuid, setLayoutGuid] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LayoutFormData>({ defaultValues });

  const { data: layoutData, isSuccess } = useGetMasterLayoutByIdQuery(layoutGuid, { skip: !isEditMode || !layoutGuid });
  const { data: themes = [] } = useGetThemeListQuery({ search: "", limit: 100 });

  const [saveLayout, { isLoading: saving }] = useSaveMasterLayoutMutation();

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setLayoutGuid(id);
    } else {
      setIsEditMode(false);
      setLayoutGuid("");
      reset(defaultValues);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isSuccess && layoutData) {
      const dto: any = (layoutData as any).Data ?? (layoutData as any).data;
      if (!dto) return;
      reset({
        MasterLayoutUniqueId: dto.MasterLayoutUniqueId,
        Name: dto.Name,
        Description: dto.Description ?? "",
        HasHeader: dto.HasHeader,
        HasFooter: dto.HasFooter,
        Sidebar: dto.Sidebar || "none",
        IsSystem: dto.IsSystem,
        LayoutConfig: dto.LayoutConfig ?? "{}",
        YOThemeId: dto.YOThemeId ?? null,
      });
    }
  }, [layoutData, isSuccess, reset]);

  const onSubmit = async (data: LayoutFormData) => {
    try {
      await saveLayout({
        ...data,
        MasterLayoutUniqueId: isEditMode ? layoutGuid : "",
      } as any).unwrap();
      toaster.success(isEditMode ? "Layout updated" : "Layout created");
      navigate("/admin/layout");
    } catch {
      toaster.error("Failed to save layout");
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ComponentCard title={isEditMode ? "Edit Layout" : "New Layout"}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              type="text"
              id="Name"
              labelName="Layout Name"
              placeholder="e.g. Marketing Site"
              {...register("Name", { required: "Name is required" })}
              error={!!errors.Name}
              errorMsg={errors.Name?.message as string}
            />
            <InputField
              type="text"
              id="Description"
              labelName="Description"
              placeholder="Brief description"
              {...register("Description")}
            />
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" {...register("HasHeader")} />
              Show Header
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500" {...register("HasFooter")} />
              Show Footer
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Sidebar</label>
              <select {...register("Sidebar")}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90 dark:bg-gray-900">
                <option value="none">No sidebar</option>
                <option value="left">Left sidebar</option>
                <option value="right">Right sidebar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Theme</label>
              <select {...register("YOThemeId", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 focus:outline-hidden dark:border-gray-700 dark:text-white/90 dark:bg-gray-900">
                <option value="">Site default</option>
                {themes.map((t: any) => (
                  <option key={t.YOThemeId} value={t.YOThemeId}>
                    {t.Name}{t.IsActive ? " (active)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ComponentCard>

        <div className="mt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/layout")}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            disabled={saving || isSubmitting}
          >
            {isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LayoutForm;
