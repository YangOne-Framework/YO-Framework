import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import {
  useSaveProviderMutation,
  useGetProviderDetailQuery,
} from "../../../redux/aibot/llmProviderAPI";
import ComponentCard from "../../../components/common/ComponentCard";
import { MdAdd, MdDelete, MdPlusOne } from "react-icons/md";
import InputField from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import toaster from "../../../components/toster";
import { useTranslation } from "react-i18next";

interface LLMProviderFormValues {
  LLMProviderId: number;
  Name: string;
  IsCloudBased: boolean;
  IsActive: boolean;
  LLMMs: { LLMProviderModelConfigId: number; UseDefault: boolean; ModelName: string; Temperature: number; TopP: number; MaxTokens: number; FrequencyPenalty: number; PresencePenalty: number }[];
  Configs: { LLMProviderConfigId: number; SettingKey: string; SettingValue: string; }[];
}

const NewLLMProvider = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [providerId, setProviderId] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const { control, handleSubmit, reset, formState: { errors }, register, getValues, setValue } = useForm<LLMProviderFormValues>({
    defaultValues: {
      LLMProviderId: 0,
      Name: '',
      IsCloudBased: true,
      IsActive: true,
      LLMMs: [],
      Configs: [],
    }
  });

  const { fields: configFields, append: configAppend, remove: configRemove } = useFieldArray({ control, name: "Configs" });
  const { fields: modelFields, append: modelAppend, remove: modelRemove } = useFieldArray({ control, name: "LLMMs" });

  const [saveProvider, { isLoading: isSaving }] = useSaveProviderMutation();
  const { data: providerData, isLoading: isProviderLoading, isSuccess } = useGetProviderDetailQuery({ llmProviderId: providerId }, { skip: !isEditMode });

  useEffect(() => {
    if (location.pathname.includes("edit") && id) {
      setIsEditMode(true);
      setProviderId(parseInt(id, 10));
    } else {
      setIsEditMode(false);
      setProviderId(0);
    }
  }, [location, id]);
  useEffect(() => {
    if (isSuccess && providerData) {
      reset({
        LLMProviderId: providerData?.Data?.LLMProviderId,
        Name: providerData?.Data?.Name,
        IsCloudBased: providerData?.Data?.IsCloudBased,
        IsActive: providerData?.Data?.IsActive,
        Configs: providerData?.Data?.Configs || [],
        LLMMs: providerData?.Data?.Models || []
      });
    }
  }, [providerData, reset, isSuccess]);

  const onSubmit = async (formData: any) => {
    try {
      const response = await saveProvider(formData).unwrap();
      if (response.Code == 200) {
        setProviderId(response.Data);
        toaster.success(t("LLMProviderForm.SavedSuccess"))
        navigate('/admin/llmprovider');
      } else {
        toaster.error(t("LLMProviderForm.SaveFailed"));
      }
    } catch (error: any) {
      toaster.error(error.data?.message || t("LLMProviderForm.ErrorOccurred"))
    }
  };
  const handleDefaultChange = (clickedIndex: any) => {
    const allModels = getValues("LLMMs");
    allModels.forEach((model: any, index: number) => {
      if (index !== clickedIndex) {
        setValue(`LLMMs.${index}.UseDefault`, false, { shouldValidate: true });
      }
    });
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <ComponentCard title={`${providerId ? t("LLMProviderForm.EditTitle") : t("LLMProviderForm.AddTitle")}`}>
            <InputField
              type="text"
              id="Name"
              labelName={t("LLMProviderForm.ProviderName")}
              placeholder={t("LLMProviderForm.ProviderName")}
              {...register("Name", { required: t("LLMProviderForm.ProviderNameRequired") })}
              error={!!errors?.Name}
              errorMsg={errors?.Name?.message}
            />
            <Checkbox
              label={t("LLMProviderForm.CloudBased")}
              {...register("IsCloudBased")}
            />
            <Checkbox
              label={t("LLMProviderForm.Active")}
              {...register("IsActive")}
            />
          </ComponentCard>
          <ComponentCard className="col-span-2" title={t("LLMProviderForm.Config")}>
            <div className="grid grid-flow-row auto-rows-max">

              {configFields.map((item, index) => (
                <div key={item.id} className="flex items-end gap-2 mb-2">

                  <InputField
                    type="hidden"
                    {...register(`Configs.${index}.LLMProviderConfigId`)}
                  />
                  <InputField
                    type="text"
                    labelName={t("LLMProviderForm.SettingKey")}
                    placeholder={t("LLMProviderForm.SettingKey")}
                    {...register(`Configs.${index}.SettingKey`, { required: t("LLMProviderForm.SettingKeyRequired") })}
                    error={!!errors.Configs?.[index]?.SettingKey}
                    errorMsg={errors.Configs?.[index]?.SettingKey?.message}
                  />
                  <InputField
                    type="text"
                    labelName={t("LLMProviderForm.SettingValue")}
                    placeholder={t("LLMProviderForm.SettingValue")}
                    {...register(`Configs.${index}.SettingValue`, { required: t("LLMProviderForm.SettingValueRequired") })}
                    error={!!errors.Configs?.[index]?.SettingValue}
                    errorMsg={errors.Configs?.[index]?.SettingValue?.message}
                  />
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-700 text-white font-bold rounded h-10 w-10 flex items-center justify-center"
                    onClick={() => configRemove(index)}
                  >
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-brand-500 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => configAppend({ LLMProviderConfigId: 0, SettingKey: '', SettingValue: '' })}
              >
                <MdAdd />
              </button>
            </div>
          </ComponentCard>
        </div>
        <div className="container mx-auto p-4">

          {/* Models */}
          <div className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-lg font-semibold mb-2">{t("LLMProviderForm.Models")}</h2>
            {modelFields.map((item, index) => (
              <div key={item.id} className="grid grid-cols-4 gap-4">
                <input type="hidden" {...register(`LLMMs.${index}.LLMProviderModelConfigId`)} />

                <InputField
                  type="text"

                  placeholder={t("LLMProviderForm.ModelName")}
                  labelName={t("LLMProviderForm.ModelName")}
                  {...register(`LLMMs.${index}.ModelName`, { required: true })}
                  error={!!errors?.LLMMs?.[index]?.ModelName}
                  errorMsg={errors?.LLMMs?.[index]?.ModelName?.message}
                />

                <InputField
                  type="number"
                  step={0.01}

                  placeholder={t("LLMProviderForm.Temperature")}
                  labelName={t("LLMProviderForm.Temperature")}
                  {...register(`LLMMs.${index}.Temperature`, { required: true, valueAsNumber: true })}
                  error={!!errors?.LLMMs?.[index]?.Temperature}
                  errorMsg={errors?.LLMMs?.[index]?.Temperature?.message}
                />

                <InputField
                  type="number"
                  placeholder={t("LLMProviderForm.TopP")}
                  labelName={t("LLMProviderForm.TopP")}
                  {...register(`LLMMs.${index}.TopP`, { required: true, valueAsNumber: true })}
                  error={!!errors?.LLMMs?.[index]?.TopP}
                  errorMsg={errors?.LLMMs?.[index]?.TopP?.message}
                />

                <InputField
                  type="number"

                  placeholder={t("LLMProviderForm.MaxTokens")}
                  labelName={t("LLMProviderForm.MaxTokens")}
                  {...register(`LLMMs.${index}.MaxTokens`, { required: true, valueAsNumber: true })}
                  error={!!errors?.LLMMs?.[index]?.MaxTokens}
                  errorMsg={errors?.LLMMs?.[index]?.MaxTokens?.message}
                />

                <InputField
                  type="number"
                  step={0.01}

                  placeholder={t("LLMProviderForm.FrequencyPenalty")}
                  labelName={t("LLMProviderForm.FrequencyPenalty")}
                  {...register(`LLMMs.${index}.FrequencyPenalty`, { required: true, valueAsNumber: true })}
                  error={!!errors?.LLMMs?.[index]?.FrequencyPenalty}
                  errorMsg={errors?.LLMMs?.[index]?.FrequencyPenalty?.message}
                />

                <InputField
                  type="number"
                  step={0.01}

                  placeholder={t("LLMProviderForm.PresencePenalty")}
                  labelName={t("LLMProviderForm.PresencePenalty")}
                  {...register(`LLMMs.${index}.PresencePenalty`, { required: true, valueAsNumber: true })}
                  error={!!errors?.LLMMs?.[index]?.PresencePenalty}
                  errorMsg={errors?.LLMMs?.[index]?.PresencePenalty?.message}
                />

                <Checkbox
                  label={t("LLMProviderForm.UseDefault")}

                  {...register(`LLMMs.${index}.UseDefault`, {

                    validate: () => {
                      const allModels = getValues("LLMMs");
                      const isAtLeastOneChecked = allModels.some(model => model.UseDefault);
                      return isAtLeastOneChecked || t("LLMProviderForm.UseDefaultRequired");
                    }
                  })}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleDefaultChange(index);
                    }
                  }}
                  error={!!errors?.LLMMs?.[index]?.UseDefault}
                  hint={errors?.LLMMs?.[index]?.UseDefault?.message}
                />

                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-700 text-white font-bold rounded h-10 w-10 flex items-center justify-center"

                  onClick={() => modelRemove(index)}
                >
                  <MdDelete />
                </button>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-brand-500 hover:bg-brand-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => modelAppend({ LLMProviderModelConfigId: 0, UseDefault: false, ModelName: '', Temperature: 0.7, TopP: 1.0, MaxTokens: 1024, FrequencyPenalty: 0.0, PresencePenalty: 0.0 })}
              >
                <MdAdd />
              </button>
            </div>

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
              disabled={isSaving}
            >
              {isSaving ? t("Common.Saving") : t("Form.Save")}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default NewLLMProvider;
