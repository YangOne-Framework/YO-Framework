import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useLocation } from "react-router-dom";
import {
  useGetAssistantDetailQuery,
  useSaveAssistantConfigMutation,
  useGetAssistantConfigQuery,
  useSaveThemeConfigMutation,
  useGetThemeConfigQuery,
  useSaveModelConfigMutation,
  useGetModelConfigQuery,
} from "../../../redux/aibot/aiAssistantAPI";
import ComponentCard from "../../../components/common/ComponentCard";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import toaster from "../../../components/toster";
import KnowledgeBaseSection from "./AIAssistantSettingKB";
import { useTranslation } from "react-i18next";

interface AIAssistantSettingProps { }

const AIAssistantSetting: React.FC<AIAssistantSettingProps> = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [aiAssistantId, setAiAssistantId] = useState<number | null>(null);
    const [knowledgeBaseCollectionId, setKnowledgeBaseCollectionId] = useState<number | null>(null);
  
  const [activeTab, setActiveTab] = useState("config");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const idParam = queryParams.get("id");
    if (idParam) {
      setAiAssistantId(parseInt(idParam, 10));
    }
  }, [location.search]);

  const { data: assistantData, isLoading: isAssistantLoading } = useGetAssistantDetailQuery(
    { aiAssistantId: aiAssistantId || 0 },
    { skip: !aiAssistantId }
  );

  const { data: assistantConfigData, isLoading: isConfigLoading } = useGetAssistantConfigQuery(
    { aiAssistantId: aiAssistantId || 0 },
    { skip: !aiAssistantId }
  );
  const { data: themeConfigData, isLoading: isThemeLoading } = useGetThemeConfigQuery(
    { aiAssistantId: aiAssistantId || 0 },
    { skip: !aiAssistantId }
  );
  const { data: modelConfigData, isLoading: isModelLoading } = useGetModelConfigQuery(
    { aiAssistantId: aiAssistantId || 0 },
    { skip: !aiAssistantId }
  );

  const handleError = useCallback((error: any, message: string) => {
    toaster.error(error?.data?.message || message || t("AIAssistantSetting.ErrorOccurred"));
  }, [t]);

  if (isAssistantLoading || isConfigLoading || isThemeLoading || isModelLoading) {
    return <div>{t("AIAssistantSetting.Loading")}</div>;
  }

  if (!aiAssistantId) {
    return <div>{t("AIAssistantSetting.MissingId")}</div>;
  }

  if (!assistantData) {
    return <div>{t("AIAssistantSetting.NoData")}</div>;
  }

interface ConfigSectionProps {
    aiAssistantId: number;
    configData: any;
    handleError: (error: any, message: string) => void;
}

  interface AIAssistantConfigSaveDto {
    AIAssistantId: number;
    KnowledgeBaseCollectionId: number;
    PerUserDailyQuotaLimit: number;
    DailyQuotaLimit: number;
    MonthlyQuotaLimit: number;
    MaxQuotaLimit: number;
    ModifiedBy: number;
  }

  const AssistantConfigSection: React.FC<ConfigSectionProps> = ({ aiAssistantId, configData, handleError }) => {
    const [saveAssistantConfig, { isLoading: isSavingConfig }] = useSaveAssistantConfigMutation();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AIAssistantConfigSaveDto>({
      defaultValues: {
        AIAssistantId: aiAssistantId,
        KnowledgeBaseCollectionId: 0,
        PerUserDailyQuotaLimit: 0,
        DailyQuotaLimit: 0,
        MonthlyQuotaLimit: 0,
        MaxQuotaLimit: 0,
        ModifiedBy: 0,
      },
    });

    useEffect(() => {
      if (configData) {
        reset(configData);
      }
    }, [configData, reset]);

    const onSubmit = async (data: AIAssistantConfigSaveDto) => {
      try {
        const response = await saveAssistantConfig(data).unwrap();
        if (response.Code === 200) {
          toaster.success(t("AIAssistantSetting.ConfigSavedSuccess"));
        } else {
          handleError(response, t("AIAssistantSetting.ConfigSaveFailed"));
        }
      } catch (error: any) {
        handleError(error, t("AIAssistantSetting.ConfigSaveFailed"));
      }
    };

    return (
      <ComponentCard title={t("AIAssistantSetting.Configuration")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            type="number"
            id="KnowledgeBaseCollectionId"
            labelName={t("AIAssistantSetting.KBCollectionId")}
            placeholder={t("AIAssistantSetting.KBCollectionId")}
            {...register("KnowledgeBaseCollectionId", { valueAsNumber: true })}
            error={!!errors?.KnowledgeBaseCollectionId}
            errorMsg={errors?.KnowledgeBaseCollectionId?.message}
          />
          <InputField
            type="number"
            id="PerUserDailyQuotaLimit"
            labelName={t("AIAssistantSetting.PerUserDailyQuota")}
            placeholder={t("AIAssistantSetting.PerUserDailyQuota")}
            {...register("PerUserDailyQuotaLimit", { valueAsNumber: true })}
            error={!!errors?.PerUserDailyQuotaLimit}
            errorMsg={errors?.PerUserDailyQuotaLimit?.message}
          />
          <InputField
            type="number"
            id="DailyQuotaLimit"
            labelName={t("AIAssistantSetting.DailyQuota")}
            placeholder={t("AIAssistantSetting.DailyQuota")}
            {...register("DailyQuotaLimit", { valueAsNumber: true })}
            error={!!errors?.DailyQuotaLimit}
            errorMsg={errors?.DailyQuotaLimit?.message}
          />
          <InputField
            type="number"
            id="MonthlyQuotaLimit"
            labelName={t("AIAssistantSetting.MonthlyQuota")}
            placeholder={t("AIAssistantSetting.MonthlyQuota")}
            {...register("MonthlyQuotaLimit", { valueAsNumber: true })}
            error={!!errors?.MonthlyQuotaLimit}
            errorMsg={errors?.MonthlyQuotaLimit?.message}
          />
          <InputField
            type="number"
            id="MaxQuotaLimit"
            labelName={t("AIAssistantSetting.MaxQuota")}
            placeholder={t("AIAssistantSetting.MaxQuota")}
            {...register("MaxQuotaLimit", { valueAsNumber: true })}
            error={!!errors?.MaxQuotaLimit}
            errorMsg={errors?.MaxQuotaLimit?.message}
          />

          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white"
            disabled={isSavingConfig}
          >
            {isSavingConfig ? t("Common.Saving") : t("AIAssistantSetting.SaveConfig")}
          </button>
        </form>
      </ComponentCard>
    );
  };

  interface AIAssistantThemeConfigSaveDto {
    AIAssistantId: number;
    AIAssistantThemeId: number;
    PrimaryColor: string;
    SecondaryColor: string;
    Layout: string;
    ModifiedBy: number;
  }

  const ThemeConfigSection: React.FC<ConfigSectionProps> = ({ aiAssistantId, configData, handleError }) => {
    const [saveThemeConfig, { isLoading: isSavingTheme }] = useSaveThemeConfigMutation();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AIAssistantThemeConfigSaveDto>({
      defaultValues: {
        AIAssistantId: aiAssistantId,
        AIAssistantThemeId: 0,
        PrimaryColor: "",
        SecondaryColor: "",
        Layout: "",
        ModifiedBy: 0,
      },
    });

    useEffect(() => {
      if (configData) {
        reset(configData);
      }
    }, [configData, reset]);

    const onSubmit = async (data: AIAssistantThemeConfigSaveDto) => {
      try {
        const response = await saveThemeConfig(data).unwrap();
        if (response.Code === 200) {
          toaster.success(t("AIAssistantSetting.ThemeSavedSuccess"));
        } else {
          handleError(response, t("AIAssistantSetting.ThemeSaveFailed"));
        }
      } catch (error: any) {
        handleError(error, t("AIAssistantSetting.ThemeSaveFailed"));
      }
    };

    return (
      <ComponentCard title={t("AIAssistantSetting.Theme")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            type="number"
            id="AIAssistantThemeId"
            labelName={t("AIAssistantSetting.ThemeId")}
            placeholder={t("AIAssistantSetting.ThemeId")}
            {...register("AIAssistantThemeId", { valueAsNumber: true })}
            error={!!errors?.AIAssistantThemeId}
            errorMsg={errors?.AIAssistantThemeId?.message}
          />
          <InputField
            type="text"
            id="PrimaryColor"
            labelName={t("AIAssistantSetting.PrimaryColor")}
            placeholder={t("AIAssistantSetting.PrimaryColor")}
            {...register("PrimaryColor")}
            error={!!errors?.PrimaryColor}
            errorMsg={errors?.PrimaryColor?.message}
          />
          <InputField
            type="text"
            id="SecondaryColor"
            labelName={t("AIAssistantSetting.SecondaryColor")}
            placeholder={t("AIAssistantSetting.SecondaryColor")}
            {...register("SecondaryColor")}
            error={!!errors?.SecondaryColor}
            errorMsg={errors?.SecondaryColor?.message}
          />
          <InputField
            type="text"
            id="Layout"
            labelName={t("AIAssistantSetting.Layout")}
            placeholder={t("AIAssistantSetting.Layout")}
            {...register("Layout")}
            error={!!errors?.Layout}
            errorMsg={errors?.Layout?.message}
          />

          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white"
            disabled={isSavingTheme}
          >
            {isSavingTheme ? t("Common.Saving") : t("AIAssistantSetting.SaveThemeConfig")}
          </button>
        </form>
      </ComponentCard>
    );
  };

  interface AIAssistantModelConfigSaveDto {
    AIAssistantId: number;
    ModelName: string;
    Temperature: number;
    TopP: number;
    MaxTokens: number;
    FrequencyPenalty: number;
    PresencePenalty: number;
    ModifiedBy: number;
  }

  const ModelConfigSection: React.FC<ConfigSectionProps> = ({ aiAssistantId, configData, handleError }) => {
    const [saveModelConfig, { isLoading: isSavingModel }] = useSaveModelConfigMutation();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AIAssistantModelConfigSaveDto>({
      defaultValues: {
        AIAssistantId: aiAssistantId,
        ModelName: "",
        Temperature: 0.7,
        TopP: 1.0,
        MaxTokens: 1024,
        FrequencyPenalty: 0.0,
        PresencePenalty: 0.0,
        ModifiedBy: 0,
      },
    });

    useEffect(() => {
      if (configData) {
        reset(configData);
      }
    }, [configData, reset]);

    const onSubmit = async (data: AIAssistantModelConfigSaveDto) => {
      try {
        const response = await saveModelConfig(data).unwrap();
        if (response.Code === 200) {
          toaster.success(t("AIAssistantSetting.ModelSavedSuccess"));
        } else {
          handleError(response, t("AIAssistantSetting.ModelSaveFailed"));
        }
      } catch (error: any) {
        handleError(error, t("AIAssistantSetting.ModelSaveFailed"));
      }
    };

    return (
      <ComponentCard title={t("AIAssistantSetting.Model")}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            type="text"
            id="ModelName"
            labelName={t("AIAssistantSetting.ModelName")}
            placeholder={t("AIAssistantSetting.ModelName")}
            {...register("ModelName")}
            error={!!errors?.ModelName}
            errorMsg={errors?.ModelName?.message}
          />
          <InputField
            type="number"
            id="Temperature"
            labelName={t("AIAssistantSetting.Temperature")}
            placeholder={t("AIAssistantSetting.Temperature")}
            step={0.01}
            {...register("Temperature", { valueAsNumber: true })}
            error={!!errors?.Temperature}
            errorMsg={errors?.Temperature?.message}
          />
          <InputField
            type="number"
            id="TopP"
            labelName={t("AIAssistantSetting.TopP")}
            placeholder={t("AIAssistantSetting.TopP")}
            step={0.01}
            {...register("TopP", { valueAsNumber: true })}
            error={!!errors?.TopP}
            errorMsg={errors?.TopP?.message}
          />
          <InputField
            type="number"
            id="MaxTokens"
            labelName={t("AIAssistantSetting.MaxTokens")}
            placeholder={t("AIAssistantSetting.MaxTokens")}
            {...register("MaxTokens", { valueAsNumber: true })}
            error={!!errors?.MaxTokens}
            errorMsg={errors?.MaxTokens?.message}
          />
          <InputField
            type="number"
            id="FrequencyPenalty"
            labelName={t("AIAssistantSetting.FrequencyPenalty")}
            placeholder={t("AIAssistantSetting.FrequencyPenalty")}
            step={0.01}
            {...register("FrequencyPenalty", { valueAsNumber: true })}
            error={!!errors?.FrequencyPenalty}
            errorMsg={errors?.FrequencyPenalty?.message}
          />
          <InputField
            type="number"
            id="PresencePenalty"
            labelName={t("AIAssistantSetting.PresencePenalty")}
            placeholder={t("AIAssistantSetting.PresencePenalty")}
            step={0.01}
            {...register("PresencePenalty", { valueAsNumber: true })}
            error={!!errors?.PresencePenalty}
            errorMsg={errors?.PresencePenalty?.message}
          />

          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white"
            disabled={isSavingModel}
          >
            {isSavingModel ? t("Common.Saving") : t("AIAssistantSetting.SaveModelConfig")}
          </button>
        </form>
      </ComponentCard>
    );
  };
  

  return (
    <>
      <ComponentCard title={t("AIAssistantSetting.Details")}>
        <p>{t("AIAssistantSetting.Name")} {assistantData.Data.Name}</p>
        <p>{t("AIAssistantSetting.Description")} {assistantData.Data.Description}</p>
      </ComponentCard>
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${activeTab === "config" ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500" : ""}`}
              aria-current={activeTab === "config" ? "page" : undefined}
              onClick={() => setActiveTab("config")}
            >
              {t("AIAssistantSetting.Configuration")}
            </a>
          </li>
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${activeTab === "theme" ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500" : ""}`}
              aria-current={activeTab === "theme" ? "page" : undefined}
              onClick={() => setActiveTab("theme")}
            >
              {t("AIAssistantSetting.Theme")}
            </a>
          </li>
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${activeTab === "model" ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500" : ""}`}
              aria-current={activeTab === "model" ? "page" : undefined}
              onClick={() => setActiveTab("model")}
            >
              {t("AIAssistantSetting.Model")}
            </a>
          </li>
          <li className="me-2">
            <a
              href="#"
              className={`inline-block p-4 border-b-2 border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${activeTab === "kb" ? "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500" : ""}`}
              aria-current={activeTab === "kb" ? "page" : undefined}
              onClick={() => setActiveTab("kb")}
            >
              {t("AIAssistantSetting.KnowledgeBase")}
            </a>
          </li>
        </ul>
      </div>
      {activeTab === "config" && (
        <AssistantConfigSection
          aiAssistantId={aiAssistantId}
          configData={assistantConfigData?.Data}
          handleError={handleError}
        />
      )}
      {activeTab === "theme" && (
        <ThemeConfigSection
          aiAssistantId={aiAssistantId}
          configData={themeConfigData?.Data}
          handleError={handleError}
        />
      )}
      {activeTab === "model" && (
        <ModelConfigSection
          aiAssistantId={aiAssistantId}
          configData={modelConfigData?.Data}
          handleError={handleError}
        />
      )}
      {activeTab === "kb" && (
        <KnowledgeBaseSection
          aiAssistantId={aiAssistantId}
          configData={assistantData?.Data?.Config}
          handleError={handleError}
        />
      )}
    </>
  );
};
export default AIAssistantSetting;
