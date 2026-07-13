import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import ComponentCard from "../../../components/common/ComponentCard";
import toaster from "../../../components/toster";
import { useGetFileConfigQuery, useSaveFileConfigMutation } from "../../../redux/setting/settingAPI";
import { FileConfig } from "../../../types/settingTypes";

const File = () => {
    const { t } = useTranslation();
    const { data: apiResponse, isSuccess, isLoading } = useGetFileConfigQuery();
    const [saveFileConfig, { isLoading: isSaving }] = useSaveFileConfigMutation();

    // State to track which rows are in edit mode for extension
    const [editingIds, setEditingIds] = React.useState<Set<string>>(new Set());

    const toggleEdit = (id: string) => {
        setEditingIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Internal form state
    interface FormFileType {
        Extension: string;
        MimeTypes: string;
    }

    interface FormFileConfig {
        FileTypes: FormFileType[];
    }

    const {
        control,
        handleSubmit,
        register,
        reset,
        getValues,
        formState: { errors },
    } = useForm<FormFileConfig>({
        defaultValues: {
            FileTypes: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "FileTypes",
    });

    // Load and transform API data
    useEffect(() => {
        if (isSuccess && apiResponse?.Data?.AllowFileTypes) {
            const allowFileTypes = apiResponse.Data.AllowFileTypes;
            const formFileTypes = Object.entries(allowFileTypes).map(([ext, mimes]) => ({
                Extension: ext,
                MimeTypes: mimes.join(", "),
            }));
            reset({ FileTypes: formFileTypes });
        }
    }, [isSuccess, apiResponse, reset]);

    const onSubmit = async (formData: FormFileConfig) => {
        try {
            // Transform Form Array back to API Dictionary
            const apiAllowFileTypes: Record<string, string[]> = {};
            formData.FileTypes.forEach((d) => {
                const extInput = d.Extension;
                // Split by comma to allow multiple extensions per row (e.g. "jpg, jpeg")
                const extensions = extInput.split(",").map((s) => s.trim()).filter((s) => s.length > 0);

                extensions.forEach((ext) => {
                    apiAllowFileTypes[ext] = d.MimeTypes.split(",")
                        .map((v) => v.trim())
                        .filter((v) => v.length > 0);
                });
            });

            const payload: FileConfig = {
                AllowFileTypes: apiAllowFileTypes
            };

            const response = await saveFileConfig(payload).unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.FileSaved"));
                setEditingIds(new Set());
            } else {
                toaster.error(t("Setting.FileSaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    // Helper to parse values string into array
    const parseValues = (str: string) => {
        if (!str) return [];
        return str.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    };

    // Helper to join array into string
    const stringifyValues = (arr: string[]) => arr.join(", ");

    return (
        <div className="grid grid-cols-1 gap-4">
            <ComponentCard title={t('File.Title')}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
                            <h3 className="font-medium text-black dark:text-white">
                                {t('File.AllowedFileTypes')}
                            </h3>
                            <button
                                type="button"
                                onClick={() => append({ Extension: "", MimeTypes: "" })}
                                className="inline-flex items-center justify-center rounded-md bg-brand-500 py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-8"
                            >
                                {t('File.AddFileType')}
                            </button>
                        </div>
                        <div className="p-6.5">
                            <div className="max-w-full overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                            <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                                                {t('File.Extension')}
                                            </th>
                                            <th className="min-w-[400px] py-4 px-4 font-medium text-black dark:text-white">
                                                {t('File.MIMETypes')}
                                            </th>
                                            <th className="py-4 px-4 font-medium text-black dark:text-white"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((field, index) => {
                                            const isEditing = editingIds.has(field.id) || !field.Extension;
                                            return (
                                                <tr key={field.id}>
                                                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11 align-top">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    className={`w-full rounded border-[1.5px] bg-transparent px-5 py-3 font-medium outline-none transition disabled:cursor-default disabled:bg-whiter dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-400 ${errors.FileTypes?.[index]?.Extension
                                                                        ? "border-red-500 focus:border-red-500 active:border-red-500"
                                                                        : "border-stroke focus:border-primary active:border-primary dark:border-form-strokedark dark:focus:border-primary"
                                                                        }`}
                                                                    placeholder={t('File.ExtensionPlaceholder')}
                                                                    {...register(`FileTypes.${index}.Extension`, {
                                                                        required: t('File.ExtensionRequired'),
                                                                        pattern: {
                                                                            value: /^[a-zA-Z0-9]+$/,
                                                                            message: t('File.ExtensionAlphaNum'),
                                                                        },
                                                                        validate: (value) => {
                                                                            const currentValues = getValues("FileTypes");
                                                                            const isDuplicate = currentValues.some(
                                                                                (item, i) => i !== index && item.Extension?.toLowerCase() === value?.toLowerCase()
                                                                            );
                                                                            return isDuplicate ? t('File.ExtensionUnique') : true;
                                                                        },
                                                                    })}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleEdit(field.id)}
                                                                    className="text-primary hover:text-opacity-90"
                                                                    title={t('File.DoneEditing')}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 py-3 px-5">
                                                                <span className="font-medium text-black dark:text-white">
                                                                    {getValues(`FileTypes.${index}.Extension`) || field.Extension}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleEdit(field.id)}
                                                                    className="text-primary hover:text-opacity-90"
                                                                    title={t('File.EditExtension')}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        )}

                                                        {errors.FileTypes?.[index]?.Extension && (
                                                            <span className="mt-1 block text-sm text-red-500">
                                                                {errors.FileTypes[index]?.Extension?.message}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark align-top">
                                                        <Controller
                                                            control={control}
                                                            name={`FileTypes.${index}.MimeTypes`}
                                                            render={({ field: { onChange, value } }) => {
                                                                const tags = parseValues(value);

                                                                const addTag = (newTag: string) => {
                                                                    const trimmed = newTag.trim();
                                                                    if (!trimmed) return;

                                                                    // MIME type validation
                                                                    const mimeRegex = /^[-\w.]+\/[-\w.+]+$/;
                                                                    if (!mimeRegex.test(trimmed)) {
                                                                        toaster.error(t("Setting.InvalidMimeType", { mime: trimmed }));
                                                                        return;
                                                                    }

                                                                    if (tags.includes(trimmed)) return;
                                                                    onChange(stringifyValues([...tags, trimmed]));
                                                                };

                                                                const removeTag = (tagToRemove: string) => {
                                                                    onChange(
                                                                        stringifyValues(
                                                                            tags.filter((t) => t !== tagToRemove)
                                                                        )
                                                                    );
                                                                };

                                                                return (
                                                                    <div className="w-full">
                                                                        <div className="mb-2 flex flex-wrap gap-2">
                                                                            {tags.map((tag, i) => (
                                                                                <span
                                                                                    key={i}
                                                                                    className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300"
                                                                                >
                                                                                    {tag}
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeTag(tag)}
                                                                                        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:bg-gray-500 focus:text-white focus:outline-none dark:hover:bg-gray-600"
                                                                                    >
                                                                                        <span className="sr-only">{t('File.RemoveTag')} {tag}</span>
                                                                                        <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                                                                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                        <input
                                                                            type="text"
                                                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-400 dark:focus:border-primary"
                                                                            placeholder={t('File.MIMEPlaceholder')}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter" || e.key === ",") {
                                                                                    e.preventDefault();
                                                                                    addTag(e.currentTarget.value);
                                                                                    e.currentTarget.value = "";
                                                                                }
                                                                            }}
                                                                            onBlur={(e) => {
                                                                                addTag(e.target.value);
                                                                                e.target.value = "";
                                                                            }}
                                                                        />
                                                                        <p className="mt-1 text-xs text-gray-500">
                                                                            {t('File.MIMEExample')} <code>image/png, image/x-png</code>
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-right align-top">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (window.confirm(t('File.DeleteConfirm'))) {
                                                                    remove(index);
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700 font-medium text-sm border border-red-500 hover:bg-red-50 rounded px-3 py-1 transition"
                                                        >
                                                            {t('Form.Delete')}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {fields.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan={3} className="py-4 text-center text-gray-500">
                                                    {t('File.NoFileTypes')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {isSaving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    {t('Common.Saving')}
                                </>
                            ): (
                                t('Form.Save')
                            )}
                        </button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default File;
