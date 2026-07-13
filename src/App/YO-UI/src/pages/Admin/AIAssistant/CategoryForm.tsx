import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import {
    useSaveCategoryMutation,
    useGetCategoryDetailQuery,
} from "../../../redux/aibot/categoryAPI";
import ComponentCard from "../../../components/common/ComponentCard";
import InputField from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import toaster from "../../../components/toster";
import { useTranslation } from "react-i18next";

interface CategoryFormValues {
    KnowledgeBaseCategoryId: number;
    KnowledgeBaseCollectionId: number;
    Name: string;
    IsActive: boolean;
}

const CategoryForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [categoryId, setCategoryId] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
        register,
    } = useForm<CategoryFormValues>({
        defaultValues: {
            KnowledgeBaseCategoryId: 0,
            KnowledgeBaseCollectionId: 1,
            Name: "",
            IsActive: true,
        },
    });

    const [saveCategory, { isLoading: isSaving }] = useSaveCategoryMutation();
    const { data: categoryDetail, isLoading: isCategoryLoading, isSuccess } = useGetCategoryDetailQuery(categoryId, { skip: !isEditMode || !categoryId });

    useEffect(() => {
        if (location.pathname.includes("edit") && id) {
            setIsEditMode(true);
            setCategoryId(parseInt(id, 10));
        } else {
            setIsEditMode(false);
            setCategoryId(0);
        }
    }, [location, id]);

    useEffect(() => {
        if (isSuccess && categoryDetail) {
            reset({
                KnowledgeBaseCategoryId: categoryDetail?.Data?.KnowledgeBaseCategoryId,
                KnowledgeBaseCollectionId: categoryDetail?.Data?.KnowledgeBaseCollectionId,
                Name: categoryDetail?.Data?.Name,
                IsActive: categoryDetail?.Data?.IsActive,
            });
        }
    }, [categoryDetail, reset, isSuccess]);

    const onSubmit = async (formData: CategoryFormValues) => {
        try {
            const response: any = await saveCategory(formData).unwrap();
            if (response.Code === 200) {
                toaster.success(t("CategoryForm.SavedSuccess"));
                navigate("/admin/category");
            } else {
                toaster.error(t("CategoryForm.SaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error.data?.message || t("CategoryForm.ErrorOccurred"));
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <ComponentCard title={`${isEditMode ? t("CategoryForm.EditTitle") : t("CategoryForm.AddTitle")}`}>
                    <InputField
                        type="hidden"
                        id="KnowledgeBaseCategoryId"
                        {...register("KnowledgeBaseCategoryId")}
                    />
                    <InputField
                        type="hidden"
                        id="KnowledgeBaseCollectionId"
                        {...register("KnowledgeBaseCollectionId")}
                    />
                    <InputField
                        type="text"
                        id="Name"
                        labelName={t("CategoryForm.Name")}
                        placeholder={t("CategoryForm.Name")}
                        {...register("Name", { required: t("CategoryForm.NameRequired") })}
                        error={!!errors?.Name}
                        errorMsg={errors?.Name?.message}
                    />
                    <Checkbox label={t("CategoryForm.Active")} {...register("IsActive")} />
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
                </ComponentCard>
            </form>
        </>
    );
};

export default CategoryForm;
