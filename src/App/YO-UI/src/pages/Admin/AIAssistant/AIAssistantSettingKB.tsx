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
import {
    useSaveFilesMutation,
    useSaveTextMutation,
    useDeleteFileMutation,
    useSaveAudiencesMutation,
    useGetCategoriesByAssistantQuery,
    useGetByCategoryQuery,
} from "../../../redux/aibot/knowledgebaseAPI";
import { Modal } from "../../../components/ui/modal";
import { useSaveCategoryMutation } from "../../../redux/aibot/categoryAPI";
import { useTranslation } from "react-i18next";

interface ConfigSectionProps {
    aiAssistantId: number;
    configData: any;
    handleError: (error: any, message: string) => void;
}

interface KnowledgeBaseWithFilesSaveDto {
    KnowledgeBaseCategoryId: number;
    KnowledgeBaseCollectionId: number;
    Version: string;
    Locale: string;
    Visibility: string;
    EffectiveDate: Date | null;
    ExpiryDate: Date | null;
    Owner: string;
    SourceUrl: string;
    AddedBy: number;
    Files: FileList | null;
}
interface KnowledgeBaseDataOnlySaveDto {
    KnowledgeBaseId: number;
    KnowledgeBaseCategoryId: number;
    KnowledgeBaseCollectionId: number;
    Content: string;
    Version: string;
    Locale: string;
    Visibility: string;
    EffectiveDate: Date | null;
    ExpiryDate: Date | null;
    Owner: string;
    SourceUrl: string;
    ModifiedBy: number;
}
interface KnowledgeBaseAudienceSaveDto {
    KnowledgeBaseId: number;
    ModifiedBy: number;
    Audiences: KnowledgeBaseAudienceEntryDto[];
}
interface KnowledgeBaseAudienceEntryDto {
    KnowledgeBaseTargetAudienceId: number;
    TargetRoles: string[];
    TargetUserIds: number[];
}
interface KnowledgeBaseCategoryDto {
    KnowledgeBaseCategoryId: number;
    KnowledgeBaseCollectionId: number;
    Name: string;
    IsActive: boolean;
    RowTotal: number;
}
interface KnowledgeBaseListDto {
    KnowledgeBaseId: number;
    KnowledgeBaseCategoryId: number;
    KnowledgeBaseCollectionId: number;
    IsFile: boolean;
    FileType: string;
    Version: string;
    Locale: string;
    Visibility: string;
    EffectiveDate: Date | null;
    ExpiryDate: Date | null;
    Owner: string;
    SourceUrl: string;
    AddedOn: Date;
    RowTotal: number;
}

const CreateCategoryModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    aiAssistantId: number,
    handleError: (error: any, message: string) => void;
    reloadCategory: () => void
}> = ({
    isOpen,
    onClose,
    aiAssistantId,
    handleError,
    reloadCategory
}) => {
    const { t } = useTranslation();
        const [saveCategory, { isLoading: isSavingCategory }] = useSaveCategoryMutation();
        const { register, handleSubmit, reset, formState: { errors } } = useForm({
            defaultValues: {
                KnowledgeBaseCollectionId: aiAssistantId,
                Name: "",
            },
        });

        useEffect(() => {
            if (isOpen) {
                reset({
                    KnowledgeBaseCollectionId: aiAssistantId,
                    Name: "",
                });
            }
        }, [isOpen, reset, aiAssistantId]);

        const onSubmit = async (data: any) => {
            try {
                console.log(data);
                const response = await saveCategory(data).unwrap();
                if (response.Code === 200) {
                    toaster.success(t("KB.CategorySavedSuccess"));
                    reloadCategory();
                    reset();
                    onClose();
                } else {
                    handleError(response, t("KB.CategorySaveFailed"));
                }
            } catch (error: any) {
                handleError(error, t("KB.CategorySaveFailed"));
            }
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} showCloseButton={true}>
                <ComponentCard title={t("KB.NewCategory")}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <InputField
                            type="text"
                            id="Name"
                            labelName={t("KB.CategoryName")}
                            placeholder={t("KB.CategoryName")}
                            {...register("Name", { required: t("KB.CategoryNameRequired") })}
                            error={!!errors?.Name}
                            errorMsg={errors?.Name?.message}
                        />
                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white"
                                disabled={isSavingCategory}
                            >
                                {isSavingCategory ? t("Common.Saving") : t("KB.SaveCategory")}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-300 hover:bg-gray-400 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-700"
                            >
                                {t("Form.Cancel")}
                            </button>
                        </div>
                    </form>
                </ComponentCard>
            </Modal>
        );
    };

const KnowledgeBaseSection: React.FC<ConfigSectionProps> = ({
    aiAssistantId,
    configData, handleError }) => {
    const { t } = useTranslation();
    const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
    const [saveFiles, { isLoading: isSavingFiles }] = useSaveFilesMutation();
    const [saveText, { isLoading: isSavingText }] = useSaveTextMutation();
    const [deleteFile, { isLoading: isDeletingFile }] = useDeleteFileMutation();
    const [saveAudiences, { isLoading: isSavingAudiences }] = useSaveAudiencesMutation();
    const { data: categoriesData, isLoading: isCategoriesLoading, error: categoriesError, refetch: reloadCategory } = useGetCategoriesByAssistantQuery({ aiAssistantId: aiAssistantId || 0 });

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<KnowledgeBaseWithFilesSaveDto>({
        defaultValues: {
            KnowledgeBaseCategoryId: 0,
            KnowledgeBaseCollectionId: 0,
            Version: "",
            Locale: "en",
            Visibility: "p",
            EffectiveDate: null,
            ExpiryDate: null,
            Owner: "",
            SourceUrl: "",
            AddedBy: 1,
            Files: null,
        },
    });

    useEffect(() => {
        setValue("AddedBy", 1);
    }, [setValue]);

    const files = watch("Files");

    const handleCategoryClick = (categoryId: number) => {
        setExpandedCategoryId((prevId) => (prevId === categoryId ? null : categoryId));
    };

    const { data: kbItems, isLoading: isKbItemsLoading, error: kbItemsError, refetch } = useGetByCategoryQuery({
        aiAssistantId: aiAssistantId || 0,
        categoryId: expandedCategoryId || 0,
    }, { skip: !expandedCategoryId });

    useEffect(() => {
        if (kbItems) {
            refetch();
        }
    }, [kbItems, refetch]);

    const onSubmit = async (data: KnowledgeBaseWithFilesSaveDto) => {
        console.log("asdf", configData, data);
        if (!data.Files || data.Files.length === 0) {
            toaster.error(t("KB.SelectFileError"));
            return;
        }
        data["KnowledgeBaseCollectionId"] = configData?.KnowledgeBaseCollectionId;
        try {
            const response = await saveFiles(data).unwrap();
            if (response.Code === 200) {
                toaster.success(t("KB.FilesSavedSuccess"));
                reset();
                refetch();
            } else {
                handleError(response, t("KB.FilesSaveFailed"));
            }
        } catch (error: any) {
            handleError(error, t("KB.FilesSaveFailed"));
        }
    };

    const onSubmitDataOnly = async (data: KnowledgeBaseWithFilesSaveDto) => {
        try {
            const response = await saveText(data).unwrap();
            if (response.Code === 200) {
                toaster.success(t("KB.DataSavedSuccess"));
                reset();
                refetch();
            } else {
                handleError(response, t("KB.DataSaveFailed"));
            }
        } catch (error: any) {
            handleError(error, t("KB.DataSaveFailed"));
        }
    };
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const allowedTypes = ["application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        const filteredFiles: any = files.filter(file => allowedTypes.includes(file.type));

        if (filteredFiles.length !== files.length) {
            toaster.error(t("KB.FileValidation"));
            return;
        }
        setSelectedFiles(filteredFiles);
        setValue("Files", filteredFiles);
        console.log("Files", filteredFiles)
        handleSubmit(onSubmit)();
    };

    const handleAddFilesClick = () => {
        const fileInput: any = document.createElement("input");
        fileInput.type = "file";
        fileInput.multiple = true;
        fileInput.accept = ".pdf,.txt,.doc,.docx";
        fileInput.onchange = handleFileUpload;
        fileInput.click();
    };
    useEffect(() => {
        if (expandedCategoryId) {
            setValue("KnowledgeBaseCategoryId", expandedCategoryId);
        }
    }, [expandedCategoryId, setValue]);
    if (isCategoriesLoading) return <div>{t("KB.LoadingCategories")}</div>;
    if (categoriesError) return <div>{t("KB.ErrorLoadingCategories")}</div>;

    return (
        <>
            <ComponentCard title={t("KB.Title")}>
                <button
                    onClick={() => setIsCreateCategoryModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    {t("KB.AddCategory")}
                </button>
                {!categoriesData?.Data || categoriesData?.Data?.length === 0 ? (
                    <div className="flex items-center gap-4">
                        {t("KB.NoCategories")}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {categoriesData?.Data?.map((category: KnowledgeBaseCategoryDto) => (
                            <div key={category.KnowledgeBaseCategoryId} className="border rounded-md shadow-sm">
                                <button
                                    onClick={() => handleCategoryClick(category.KnowledgeBaseCategoryId)}
                                    className="flex items-center justify-between w-full px-4 py-2 text-left font-semibold text-gray-700 bg-gray-100 rounded-t-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {category.Name}
                                    <span>({category.RowTotal} {t("KB.Items")})</span>
                                    <svg
                                        className={`w-4 h-4 transition-transform transform ${expandedCategoryId === category.KnowledgeBaseCategoryId ? "rotate-180" : ""
                                            }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {expandedCategoryId === category.KnowledgeBaseCategoryId && (
                                    <div className="p-4">
                                        {isKbItemsLoading ? (
                                            <div>{t("KB.LoadingItems")}</div>
                                        ) : kbItemsError ? (
                                            <div>{t("KB.ErrorLoadingItems")}</div>
                                        ) : (!kbItems?.Data || kbItems?.Data?.length === 0) ? (
                                            <div>{t("KB.NoItemsInCategory")}</div>
                                        ) : (
                                            <div className="space-y-4">
                                                {kbItems?.Data?.map((item: KnowledgeBaseListDto) => (
                                                    <div key={item.KnowledgeBaseId} className="border rounded-md shadow-sm p-4">
                                                        <form onSubmit={handleSubmit(onSubmitDataOnly)} className="space-y-4">
                                                            <input type="hidden" name="KnowledgeBaseId" defaultValue={item.KnowledgeBaseId} />
                                                            <input type="hidden" name="KnowledgeBaseCategoryId" defaultValue={item.KnowledgeBaseCategoryId} />
                                                            <input type="hidden" name="KnowledgeBaseCollectionId" defaultValue={item.KnowledgeBaseCollectionId} />
                                                            <InputField
                                                                type="text"
                                                                id="Version"
                                                                labelName={t("KB.Version")}
                                                                placeholder={t("KB.Version")}
                                                                {...register("Version")}
                                                                error={!!errors?.Version}
                                                                errorMsg={errors?.Version?.message}
                                                            />
                                                            <InputField
                                                                type="text"
                                                                id="Locale"
                                                                labelName={t("KB.Locale")}
                                                                placeholder={t("KB.Locale")}
                                                                {...register("Locale")}
                                                                error={!!errors?.Locale}
                                                                errorMsg={errors?.Locale?.message}
                                                            />
                                                            <InputField
                                                                type="text"
                                                                id="Visibility"
                                                                labelName={t("KB.Visibility")}
                                                                placeholder={t("KB.Visibility")}
                                                                {...register("Visibility")}
                                                                error={!!errors?.Visibility}
                                                                errorMsg={errors?.Visibility?.message}
                                                            />
                                                            <InputField
                                                                type="date"
                                                                id="ExpiryDate"
                                                                labelName={t("KB.ExpiryDate")}
                                                                placeholder={t("KB.ExpiryDate")}
                                                                {...register("ExpiryDate")}
                                                                error={!!errors?.ExpiryDate}
                                                                errorMsg={errors?.ExpiryDate?.message}
                                                            />
                                                            <InputField
                                                                type="text"
                                                                id="Owner"
                                                                labelName={t("KB.Owner")}
                                                                placeholder={t("KB.Owner")}
                                                                {...register("Owner")}
                                                                error={!!errors?.Owner}
                                                                errorMsg={errors?.Owner?.message}
                                                            />
                                                            <InputField
                                                                type="text"
                                                                id="SourceUrl"
                                                                labelName={t("KB.SourceUrl")}
                                                                placeholder={t("KB.SourceUrl")}
                                                                {...register("SourceUrl")}
                                                                error={!!errors?.SourceUrl}
                                                                errorMsg={errors?.SourceUrl?.message}
                                                            />
                                                            <button
                                                                type="submit"
                                                                className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white"
                                                                disabled={isSavingFiles}
                                                            >
                                                                {isSavingFiles ? t("Common.Saving") : t("KB.Save")}
                                                            </button>
                                                        </form>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <button
                                            onClick={handleAddFilesClick}
                                            className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {t("KB.AddFiles")}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ComponentCard>
            {aiAssistantId && <CreateCategoryModal
                isOpen={isCreateCategoryModalOpen}
                onClose={() => setIsCreateCategoryModalOpen(false)}
                aiAssistantId={aiAssistantId}
                handleError={handleError}
                reloadCategory={reloadCategory}
            />}
        </>
    );
};
export default KnowledgeBaseSection;
