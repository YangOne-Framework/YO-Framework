import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useCreateStudioThemeMutation, useUpdateStudioThemeMutation, useGetStudioConfigQuery, useGetStudioThemesQuery } from "../../../redux/theme/themeStudioAPI";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import TextareaField from "../../../components/form/input/TextareaField";
import CreatableSelect from "react-select/creatable";
import ComponentCard from "../../../components/common/ComponentCard";
import { createEmptyStudioConfig } from "../../../services/themeMigration";

interface IFormTheme {
  Name: string;
  Slug: string;
  Version: string;
  Description: string;
  Config: string;
  SchemaVersion: number;
}

const defaultValues: IFormTheme = {
  Name: "",
  Slug: "",
  Version: "1.0.0",
  Description: "",
  Config: JSON.stringify(createEmptyStudioConfig(), null, 2),
  SchemaVersion: 2,
};

const FormTheme = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [themeId, setThemeId] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IFormTheme>({
    defaultValues,
  });

  const { data: themesData } = useGetStudioThemesQuery({ limit: 1000 });
  const { data: themeData, isSuccess } = useGetStudioConfigQuery(themeId, { skip: !themeId });

  const [createTheme] = useCreateStudioThemeMutation();
  const [updateTheme] = useUpdateStudioThemeMutation();

  useEffect(() => {
    if (id) {
      setThemeId(id);
    } else {
      setThemeId("");
      reset(defaultValues);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isSuccess && themeData && themeData.Data) {
      const theme = themeData.Data;
      reset({
        Name: theme.Name,
        Slug: theme.Slug,
        Version: theme.Version || "1.0.0",
        Description: theme.Description || "",
        Config: JSON.stringify(theme.Config || createEmptyStudioConfig(), null, 2),
        SchemaVersion: theme.SchemaVersion || 2,
      });
    }
  }, [themeData, isSuccess, reset]);

  const onSubmit = async (data: IFormTheme) => {
    try {
      let config: Record<string, unknown>;
      try {
        config = JSON.parse(data.Config);
      } catch {
        toaster.error(t("ThemeManagement.ConfigInvalid"));
        return;
      }

      const payload = {
        Name: data.Name,
        Slug: data.Slug || data.Name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        Version: data.Version,
        Description: data.Description,
        Config: JSON.stringify(config),
        SchemaVersion: data.SchemaVersion,
      };

      if (themeId) {
        await updateTheme({ YOThemeUniqueId: themeId, ...payload }).unwrap();
        toaster.success(t("ThemeManagement.UpdateSuccess"));
      } else {
        await createTheme(payload).unwrap();
        toaster.success(t("ThemeManagement.CreateSuccess"));
      }
      navigate("/admin/theme");
    } catch (error) {
      toaster.error(t("ThemeManagement.SaveFailed"));
    }
  };

  const isEditMode = !!themeId;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ComponentCard title={isEditMode ? t("ThemeManagement.Form.EditTitle") : t("ThemeManagement.Form.AddTitle")}>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                type="text"
                id="name"
                labelName={t("ThemeManagement.Form.Name")}
                placeholder={t("ThemeManagement.Form.Name.Placeholder")}
                {...register("Name", { required: t("ThemeManagement.Form.Name.Required") })}
                error={!!errors.Name}
                errorMsg={errors.Name?.message as string}
              />
              <InputField
                type="text"
                id="slug"
                labelName={t("ThemeManagement.Form.Slug")}
                placeholder={t("ThemeManagement.Form.Slug.Placeholder")}
                {...register("Slug")}
                error={!!errors.Slug}
                errorMsg={errors.Slug?.message as string}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                type="text"
                id="version"
                labelName={t("ThemeManagement.Form.Version")}
                placeholder={t("ThemeManagement.Form.Version.Placeholder")}
                {...register("Version", { required: t("ThemeManagement.Form.Version.Required") })}
                error={!!errors.Version}
                errorMsg={errors.Version?.message as string}
              />
              <Controller
                name="SchemaVersion"
                control={control}
                render={({ field }) => (
                  <InputField
                    type="number"
                    id="schemaVersion"
                    labelName={t("ThemeManagement.Form.SchemaVersion")}
                    {...field}
                    {...register("SchemaVersion", { required: true })}
                    error={!!errors.SchemaVersion}
                    errorMsg={errors.SchemaVersion?.message as string}
                  />
                )}
              />
            </div>

            <TextareaField
              id="description"
              labelName={t("ThemeManagement.Form.Description")}
              placeholder={t("ThemeManagement.Form.Description.Placeholder")}
              {...register("Description")}
              rows={3}
            />

            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("ThemeManagement.Form.Config")}
              </label>
              <textarea
                {...register("Config", { required: t("ThemeManagement.Form.Config.Required") })}
                className="w-full font-mono text-[11px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 min-h-[300px] resize-y outline-none focus:border-primary"
                placeholder={t("ThemeManagement.Form.Config.Placeholder")}
              />
              {errors.Config && (
                <p className="mt-1 text-sm text-red-500">{errors.Config.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/admin/theme")}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              {t("Common.Cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? t("Common.Saving") : (isEditMode ? t("Common.Update") : t("Common.Save"))}
            </button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default FormTheme;