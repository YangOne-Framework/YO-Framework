import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import {
    useSaveThemeMutation,
    useGetThemeDetailQuery
} from "../../../redux/aibot/themeAPI";
import ComponentCard from "../../../components/common/ComponentCard";
import InputField from "../../../components/form/input/InputField";
import toaster from "../../../components/toster";
import Checkbox from "../../../components/form/input/Checkbox";
import { useTranslation } from "react-i18next";

interface ThemeFormValues {
    AIAssistantThemeId: number;
    Name: string;
    PrimaryColor: string;
    SecondaryColor: string;
    IsActive: boolean;
    AddedBy: number;
    Layout: string;
}

const ThemeForm = () => {
    const { t } = useTranslation();
    const Navigate = useNavigate();
    const Location = useLocation();
    const [ThemeId, setThemeId] = useState(0);
    const [IsEditMode, setIsEditMode] = useState(false);
    const QueryParams = new URLSearchParams(Location.search);
    const Id = QueryParams.get("id");

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        register,
        setValue
    } = useForm<ThemeFormValues>({
        defaultValues: {
            AIAssistantThemeId: 0,
            Name: "",
            PrimaryColor: "",
            SecondaryColor: "",
            IsActive: true,
            Layout: "",
        },
    });
    useEffect(() => {

    }, [setValue]);
    const [SaveTheme, { isLoading: IsSaving }] = useSaveThemeMutation();
    const { data: ThemeDetail, isLoading: IsThemeDetailLoading, isSuccess } = useGetThemeDetailQuery(ThemeId, { skip: !IsEditMode || !ThemeId });
    useEffect(() => {
        if (Location.pathname.includes("edit") && Id) {
            setIsEditMode(true);
            setThemeId(parseInt(Id, 10));
        } else {
            setIsEditMode(false);
            setThemeId(0);
        }
    }, [Location, Id]);
    useEffect(() => {
        if (isSuccess && ThemeDetail && ThemeDetail.Data) {
            reset({
                AIAssistantThemeId: ThemeDetail.Data.AIAssistantThemeId,
                Name: ThemeDetail.Data.Name,
                PrimaryColor: ThemeDetail.Data.PrimaryColor,
                SecondaryColor: ThemeDetail.Data.SecondaryColor,
                IsActive: ThemeDetail.Data.IsActive,
                Layout: ThemeDetail.Data.Layout,
            });
        }
    }, [ThemeDetail, reset, isSuccess]);
    const onSubmit = async (FormData: ThemeFormValues) => {
        try {
            const Response: any = await SaveTheme(FormData).unwrap();
            if (Response.Code === 200) {
                toaster.success(t("ThemeForm.SavedSuccess"));
                Navigate("/admin/assistant/theme");
            } else {
                toaster.error(t("ThemeForm.SaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error.data?.message || t("ThemeForm.ErrorOccurred"));
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <ComponentCard title={`${IsEditMode ? t("ThemeForm.EditTitle") : t("ThemeForm.AddTitle")}`}>
                    <InputField
                        type="text"
                        id="Name"
                        labelName={t("ThemeForm.Name")}
                        placeholder={t("ThemeForm.Name")}
                        {...register("Name", { required: t("ThemeForm.NameRequired") })}
                        error={!!errors?.Name}
                        errorMsg={errors?.Name?.message}
                    />
                    <InputField
                        type="color"
                        id="PrimaryColor"
                        labelName={t("ThemeForm.PrimaryColor")}
                        placeholder={t("ThemeForm.PrimaryColor")}
                        {...register("PrimaryColor", { required: t("ThemeForm.PrimaryColorRequired") })}
                        error={!!errors?.PrimaryColor}
                        errorMsg={errors?.PrimaryColor?.message}
                    />
                    <InputField
                        type="color"
                        id="SecondaryColor"
                        labelName={t("ThemeForm.SecondaryColor")}
                        placeholder={t("ThemeForm.SecondaryColor")}
                        {...register("SecondaryColor", { required: t("ThemeForm.SecondaryColorRequired") })}
                        error={!!errors?.SecondaryColor}
                        errorMsg={errors?.SecondaryColor?.message}
                    />
                    <InputField
                        type="text"
                        id="Layout"
                        labelName={t("ThemeForm.Layout")}
                        placeholder="L1,L2"
                        {...register("Layout", { required: t("ThemeForm.LayoutRequired") })}
                        error={!!errors?.Layout}
                        errorMsg={errors?.Layout?.message}
                    />
                    <Checkbox label={t("ThemeForm.Active")} {...register("IsActive")} />
                    <InputField
                        type="hidden"
                        id="AddedBy"
                        {...register("AddedBy")}
                    />
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
                            disabled={IsSaving}
                        >
                            {IsSaving ? t("Common.Saving") : t("Form.Save")}
                        </button>
                    </div>
                </ComponentCard>
            </form>
        </>
    );
};

export default ThemeForm;
