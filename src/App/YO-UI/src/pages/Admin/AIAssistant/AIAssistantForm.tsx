import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import {
  useSaveAssistantCreateMutation,
  useSaveAssistantMutation,
  useGetAssistantDetailQuery,
} from "../../../redux/aibot/aiAssistantAPI";
import { useGetProvidersQuery } from "../../../redux/aibot/llmProviderAPI";
import ComponentCard from "../../../components/common/ComponentCard";
import InputField from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import toaster from "../../../components/toster";
import TextArea from "../../../components/form/input/TextArea";
import Select from "../../../components/form/Select";
import { useGetAllThemesQuery } from "../../../redux/aibot/themeAPI";
import { BaseEndpoints } from "../../../config/BaseEndpoints";
import { useTranslation } from "react-i18next";

interface AIAssistantFormValues {
  AIAssistantId: number;
  Name: string;
  Description: string;
  IsActive: boolean;
  ImageFile: FileList | null;
  LLMProviderId: number;
  SystemPrompt: string;
  Website: string;
  AssistantTone: string;
  AIAssistantThemeId: number;
}

const AIAssistantForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [AIAssistantId, setAIAssistantId] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    register,
  } = useForm<AIAssistantFormValues>({
    defaultValues: {
      AIAssistantId: 0,
      Name: "",
      Description: "",
      IsActive: true,
      ImageFile: null,
      LLMProviderId: 0,
      SystemPrompt: "",
      Website: "",
      AssistantTone: "",
      AIAssistantThemeId: 0
    },
  });

  const [saveAssistantCreate, { isLoading: isSaving }] = useSaveAssistantCreateMutation();
  const [saveAssistant] = useSaveAssistantMutation();
  const { data: assistantData, isLoading: isAssistantLoading, isSuccess } =
    useGetAssistantDetailQuery({ aiAssistantId: AIAssistantId }, { skip: !isEditMode });
  const { data: providersData, isLoading: isProvidersLoading } = useGetProvidersQuery("");
  const { data: themeData, isLoading: isThemeLoading } = useGetAllThemesQuery("");

  useEffect(() => {
    if (location.pathname.includes("edit") && id) {
      setIsEditMode(true);
      setAIAssistantId(parseInt(id, 10));
    } else {
      setIsEditMode(false);
      setAIAssistantId(0);
    }
  }, [location, id]);

  useEffect(() => {
    if (isSuccess && assistantData) {
      reset({
        AIAssistantId: assistantData?.Data?.AIAssistantId,
        Name: assistantData?.Data?.Name,
        Description: assistantData?.Data?.Description,
        IsActive: assistantData?.Data?.IsActive,
        LLMProviderId: assistantData?.Data?.LLMProviderId,
        SystemPrompt: assistantData?.Data?.SystemPrompt,
        Website: assistantData?.Data?.Website,
        AssistantTone: assistantData?.Data?.AssistantTone,
        AIAssistantThemeId: assistantData?.Data?.AIAssistantThemeId,
      });
      setImageUrl(BaseEndpoints.base + assistantData?.Data?.ImageUrl || null);
    }
  }, [assistantData, reset, isSuccess]);

  const onSubmit = async (formData: any) => {
    try {
      const mutation = isEditMode ? saveAssistant : saveAssistantCreate;

      const apiData = {
        AIAssistantId: formData.AIAssistantId,
        Name: formData.Name,
        Description: formData.Description,
        SystemPrompt: '',
        Website: formData.Website,
        LLMProviderId: formData.LLMProviderId,
        AssistantTone: formData.AssistantTone,
        AIAssistantThemeId: formData.AIAssistantThemeId,
        IsActive: formData.IsActive,
        ImageFile: formData.ImageFile?.[0] || null,
      };

      const response = await mutation(apiData).unwrap();

      if (response.Code == 200) {
        setAIAssistantId(response.Data);
        toaster.success(t("AIAssistantForm.SavedSuccess"));
        navigate("/admin/aiassistant");
      } else {
        toaster.error(t("AIAssistantForm.SaveFailed"));
      }
    } catch (error: any) {
      toaster.error(error.data?.message || t("AIAssistantForm.ErrorOccurred"));
    }
  };

  const handleImageChange = (e: any) => {
    const fileList = e.target.files;
    if (fileList && fileList[0]) {
      setImageUrl(URL.createObjectURL(fileList[0]));
    } else {
      setImageUrl(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <ComponentCard title={`${isEditMode ? t("AIAssistantForm.EditTitle") : t("AIAssistantForm.AddTitle")}`}>
            <InputField
              type="text"
              id="Name"
              labelName={t("AIAssistantForm.Name")}
              placeholder={t("AIAssistantForm.Name")}
              {...register("Name", { required: t("AIAssistantForm.NameRequired") })}
              error={!!errors?.Name}
              errorMsg={errors?.Name?.message}
            />

            <TextArea
              id="Description"
              labelName={t("AIAssistantForm.Description")}
              placeholder={t("AIAssistantForm.Description")}
              error={!!errors?.Description}
              errorMsg={errors?.Description?.message}
              {...register("Description", { required: t("AIAssistantForm.DescriptionRequired") })}
            />
            <InputField
              type="text"
              id="AssistantTone"
              labelName={t("AIAssistantForm.Tone")}
              placeholder={t("AIAssistantForm.Tone")}
              {...register("AssistantTone")}
              error={!!errors?.AssistantTone}
              errorMsg={errors?.AssistantTone?.message}
            />
            <InputField
              type="text"
              id="Website"
              labelName={t("AIAssistantForm.Website")}
              placeholder={t("AIAssistantForm.Website")}
              {...register("Website")}
              error={!!errors?.Website}
              errorMsg={errors?.Website?.message}
            />

            <div className="w-full px-2.5">
              <label htmlFor="ImageUrlFile" className="block text-sm font-medium text-gray-700">
                {t("AIAssistantForm.Logo")}
              </label>
              <input
                type="file"
                accept="image/jpeg, image/png"

                {...register("ImageFile", { onChange: handleImageChange })}
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={t("AIAssistantForm.PreviewAlt")}
                  className="mt-2 w-32 h-32 object-cover rounded-md"
                />
              )}
            </div>

            <Select
              labelName={t("AIAssistantForm.LLMProvider")}
              placeholder={t("AIAssistantForm.Select")}
              options={providersData?.Data?.map((provider: any) => {
                return { label: provider.Name, value: provider.LLMProviderId };
              }) || []}
              error={!!errors?.LLMProviderId}
              errorMsg={errors?.LLMProviderId?.message}
              {...register("LLMProviderId", { valueAsNumber: true, required: t("AIAssistantForm.LLMProviderRequired") })}
            >
            </Select>

            <Select
              labelName={t("AIAssistantForm.Theme")}
              placeholder={t("AIAssistantForm.Select")}
              options={themeData?.Data?.map((provider: any) => {
                return { label: provider.Name, value: provider.AIAssistantThemeId };
              }) || []}
              error={!!errors?.AIAssistantThemeId}
              errorMsg={errors?.AIAssistantThemeId?.message}
              {...register("AIAssistantThemeId", { valueAsNumber: true, required: t("AIAssistantForm.ThemeRequired") })}
            >
            </Select>

            <Checkbox label={t("AIAssistantForm.Active")} {...register("IsActive")} />
          </ComponentCard>
        </div>

        <div className="mt-3 flex justify-end gap-3">
          <button
            type="reset"
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("Form.Cancel")}
          </button>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white "
            disabled={isSaving || isProvidersLoading}
          >
            {isSaving ? t("Common.Saving") : isProvidersLoading ? t("AIAssistantForm.LoadingProviders") : t("Form.Save")}
          </button>
        </div>
      </form>
    </>
  );
};

export default AIAssistantForm;
