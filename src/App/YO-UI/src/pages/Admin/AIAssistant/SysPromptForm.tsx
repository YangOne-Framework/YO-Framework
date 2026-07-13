import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import {
    useSaveSystemPromptMutation,
    useGetSystemPromptDetailQuery
} from "../../../redux/aibot/systemPromptAPI";
import ComponentCard from "../../../components/common/ComponentCard";
import InputField from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import TextArea from "../../../components/form/input/TextArea";
import toaster from "../../../components/toster";
import { useTranslation } from "react-i18next";

const SysPromptForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [systemPromptId, setSystemPromptId] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        register,
        setValue,
    } = useForm({
        defaultValues: {
            SystemPromptId: 0,
            Code: "",
            Name: "",
            Prompt: "",
            IsActive: true,
            ModifiedBy: 0,
        },
    });

    const [saveSystemPrompt, { isLoading: isSaving }] = useSaveSystemPromptMutation();
    const {
        data: systemPromptDetail,
        isLoading: isDetailLoading,
        isSuccess,
    } = useGetSystemPromptDetailQuery(systemPromptId, { skip: !isEditMode || !systemPromptId });

    useEffect(() => {
        if (location.pathname.includes("edit") && id) {
            setIsEditMode(true);
            setSystemPromptId(parseInt(id, 10));
        } else {
            setIsEditMode(false);
            setSystemPromptId(0);
        }
    }, [location, id, setValue]);

    useEffect(() => {
        if (isSuccess && systemPromptDetail && systemPromptDetail.Data) {
            reset({
                SystemPromptId: systemPromptDetail.Data.SystemPromptId,
                Code: systemPromptDetail.Data.Code,
                Name: systemPromptDetail.Data.Name,
                Prompt: systemPromptDetail.Data.Prompt || "",
                IsActive: systemPromptDetail.Data.isActive
            });
        }
    }, [systemPromptDetail, reset, isSuccess]);

    const onSubmit = async (formData: any) => {
        try {
            const response: any = await saveSystemPrompt(formData).unwrap();
            if (response.Code == 200) {
                toaster.success(t("SysPromptForm.SavedSuccess"));
                navigate("/admin/systemprompt");
            }
            if (response.Code == 600) {
                toaster.warning(t("SysPromptForm.CodeInUse"));
            } else {
                toaster.error(t("SysPromptForm.SaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error.data?.message || t("SysPromptForm.ErrorOccurred"));
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <ComponentCard title={`${isEditMode ? t("SysPromptForm.EditTitle") : t("SysPromptForm.AddTitle")}`}>
                    <InputField
                        type="text"
                        id="Code"
                        labelName={t("SysPromptForm.Code")}
                        placeholder={t("SysPromptForm.Code")}
                        {...register("Code", { required: t("SysPromptForm.CodeRequired") })}
                        error={!!errors?.Code}
                        errorMsg={errors?.Code?.message}
                    />
                    <InputField
                        type="text"
                        id="Name"
                        labelName={t("SysPromptForm.Name")}
                        placeholder={t("SysPromptForm.Name")}
                        {...register("Name", { required: t("SysPromptForm.NameRequired") })}
                        error={!!errors?.Name}
                        errorMsg={errors?.Name?.message}
                    />
                    <TextArea
                        id="Prompt"
                        labelName={t("SysPromptForm.Prompt")}
                        placeholder={t("SysPromptForm.Prompt")}
                        {...register("Prompt")}
                        error={!!errors?.Prompt}
                        errorMsg={errors?.Prompt?.message}
                    />

                    <Checkbox label={t("SysPromptForm.Active")} {...register("IsActive")} />

                    <InputField type="hidden" id="ModifiedBy" {...register("ModifiedBy")} />

                    <div className="mt-3 flex justify-end gap-3">
                        <button
                            type="reset"
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03 dark:hover:text-gray-200"
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
                </ComponentCard>
            </form>
        </>
    );
};

export default SysPromptForm;
