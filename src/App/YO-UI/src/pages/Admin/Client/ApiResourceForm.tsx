import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import InputField from "../../../components/form/input/InputField";
import toaster from "../../../components/toster";
import { useGetApiResourceDetailsQuery, useCreateApiResourceMutation, useUpdateApiResourceMutation, ApiResourceDto } from "../../../redux/setting/clientAPI";

const ApiResourceForm = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [resourceId, setResourceId] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get("id");

    const {
        handleSubmit,
        reset,
        formState: { errors },
        register,
    } = useForm<ApiResourceDto>({
        defaultValues: {
            id: "",
            name: "",
            displayName: "",
            description: "",
        },
    });

    const [createApiResource, { isLoading: isCreating }] = useCreateApiResourceMutation();
    const [updateApiResource, { isLoading: isUpdating }] = useUpdateApiResourceMutation();
    const { data: detailData, isSuccess } = useGetApiResourceDetailsQuery(resourceId, { skip: !isEditMode || !resourceId });

    useEffect(() => {
        if (location.pathname.includes("edit") && id) {
            setIsEditMode(true);
            setResourceId(id);
        } else {
            setIsEditMode(false);
            setResourceId("");
        }
    }, [location, id]);

    useEffect(() => {
        if (isSuccess && detailData) {
            reset({
                id: detailData.id,
                name: detailData.name,
                displayName: detailData.displayName || "",
                description: detailData.description || "",
            });
        }
    }, [detailData, reset, isSuccess]);

    const onSubmit = async (formData: ApiResourceDto) => {
        try {
            const apiData = {
                ...formData,
                id: isEditMode ? resourceId : formData.id,
            };

            if (isEditMode) {
                const response = await updateApiResource(apiData).unwrap();
                toaster.success(t('ApiResource.UpdateSuccess', 'API Resource updated successfully!'));
            } else {
                const response = await createApiResource(apiData).unwrap();
                toaster.success(t('ApiResource.CreateSuccess', 'API Resource created successfully!'));
            }
            navigate("/admin/openiddict/apiresource");
        } catch (error: any) {
            toaster.error(error.data?.message || t('Common.Error', 'An error occurred.'));
        }
    };

    const isSaving = isCreating || isUpdating;

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                    <ComponentCard title={`${isEditMode ? t('Form.Edit', 'Edit') : t('Form.New', 'New')} ${t('ApiResource.FormTitle', 'API Resource')}`}>
                        <InputField
                            type="text"
                            id="name"
                            labelName={t('ApiResource.Name', 'Name')}
                            placeholder={t('ApiResource.NamePlaceholder', 'e.g., my-api')}
                            {...register("name", { required: t('ApiResource.NameRequired', 'Name is required') })}
                            error={!!errors?.name}
                            errorMsg={errors?.name?.message}
                            disabled={isEditMode}
                        />
                        {isEditMode && (
                            <p className="text-xs text-gray-500 -mt-2">{t('ApiResource.NameLocked', 'Name cannot be changed after creation')}</p>
                        )}

                        <InputField
                            type="text"
                            id="displayName"
                            labelName={t('ApiResource.DisplayName', 'Display Name')}
                            placeholder={t('ApiResource.DisplayNamePlaceholder', 'e.g., My API')}
                            {...register("displayName")}
                            error={!!errors?.displayName}
                            errorMsg={errors?.displayName?.message}
                        />

                        <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('ApiResource.Description', 'Description')}
                                </label>
                                <textarea
                                    {...register("description")}
                                    rows={4}
                                    placeholder={t('ApiResource.DescriptionPlaceholder', 'Describe this API resource...')}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-brand-500/50 outline-none resize-none"
                            />
                        </div>
                    </ComponentCard>
                </div>

                <div className="mt-3 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/openiddict/apiresource")}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                    >
                        {t('Form.Cancel', 'Cancel')}
                    </button>
                    <button
                        type="submit"
                        className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white"
                        disabled={isSaving}
                    >
                        {isSaving ? t('Common.Saving', 'Saving...') : t('Form.Save', 'Save')}
                    </button>
                </div>
            </form>
        </>
    );
};

export default ApiResourceForm;
