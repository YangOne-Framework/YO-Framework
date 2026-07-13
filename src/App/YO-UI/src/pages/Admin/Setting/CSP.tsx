import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import ComponentCard from "../../../components/common/ComponentCard";
import Checkbox from "../../../components/form/input/Checkbox";
import toaster from "../../../components/toster";
import { useGetCspConfigQuery, useSaveCspConfigMutation } from "../../../redux/setting/settingAPI";
import { CspConfig } from "../../../types/settingTypes";

// Internal form state interface since we need an array for useFieldArray
interface FormCspDirective {
    Name: string;
    Values: string; // Comma separated for internal handling
}

interface FormCspConfig {
    SupportNonce: boolean;
    Directives: FormCspDirective[];
}

const CSP = () => {
    const { t } = useTranslation();
    const { data: apiResponse, isLoading, isSuccess } = useGetCspConfigQuery();
    const [saveCspConfig, { isLoading: isSaving }] = useSaveCspConfigMutation();

    const {
        control,
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm<FormCspConfig>({
        defaultValues: {
            SupportNonce: false,
            Directives: [],
        },
    });

    const { fields } = useFieldArray({
        control,
        name: "Directives",
    });

    useEffect(() => {
        if (isSuccess && apiResponse?.Data) {
            const data = apiResponse.Data;
            // Transform API Record<string, string[]> to Form Array
            const formDirectives = Object.entries(data.Directives || {}).map(([key, values]) => ({
                Name: key,
                Values: values.join(", "),
            }));

            reset({
                SupportNonce: data.SupportNonce,
                Directives: formDirectives,
            });
        }
    }, [isSuccess, apiResponse, reset]);

    const onSubmit = async (formData: FormCspConfig) => {
        try {
            // Transform Form Array back to API Record<string, string[]>
            const apiDirectives: Record<string, string[]> = {};
            formData.Directives.forEach((d) => {
                apiDirectives[d.Name] = d.Values.split(",")
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0);
            });

            const payload: CspConfig = {
                SupportNonce: formData.SupportNonce,
                Directives: apiDirectives,
            };

            const response = await saveCspConfig(payload).unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.CSPSaved"));
            } else {
                toaster.error(t("Setting.CSPSaveFailed"));
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
            <ComponentCard title={t('CSP.Title')}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <Checkbox
                            label={t('CSP.SupportNonce')}
                            {...register("SupportNonce")}
                        />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('CSP.NonceDescription')}
                        </p>
                    </div>

                    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                        <div className="max-w-full overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                                            {t('CSP.DirectiveName')}
                                        </th>
                                        <th className="min-w-[400px] py-4 px-4 font-medium text-black dark:text-white">
                                            {t('CSP.Values')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                                                <input
                                                    type="text"
                                                    readOnly
                                                    className="w-full bg-transparent font-medium outline-none dark:text-gray-300"
                                                    {...register(`Directives.${index}.Name`)}
                                                />
                                            </td>
                                            <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                <Controller
                                                    control={control}
                                                    name={`Directives.${index}.Values`}
                                                    render={({ field: { onChange, value } }) => {
                                                        const tags = parseValues(value);

                                                        const addTag = (newTag: string) => {
                                                            const trimmed = newTag.trim();
                                                            if (!trimmed) return;
                                                            if (tags.includes(trimmed)) return;
                                                            onChange(stringifyValues([...tags, trimmed]));
                                                        };

                                                        const removeTag = (tagToRemove: string) => {
                                                            const lower = tagToRemove.toLowerCase();
                                                            if (
                                                                lower === "'self'" ||
                                                                lower === "self" ||
                                                                lower === "'none'" ||
                                                                lower === "none"
                                                            ) {
                                                                return; // Prevent removing critical tokens if desired
                                                            }
                                                            onChange(
                                                                stringifyValues(
                                                                    tags.filter((t) => t !== tagToRemove)
                                                                )
                                                            );
                                                        };

                                                        return (
                                                            <div className="w-full">
                                                                <div className="mb-2 flex flex-wrap gap-2">
                                                                    {tags.map((tag, i) => {
                                                                        const lower = tag.toLowerCase();
                                                                        const isLocked =
                                                                            lower === "'self'" ||
                                                                            lower === "self" ||
                                                                            lower === "'none'" ||
                                                                            lower === "none";

                                                                        return (
                                                                            <span
                                                                                key={i}
                                                                                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300"
                                                                            >
                                                                                {tag}
                                                                                {!isLocked && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeTag(tag)}
                                                                                        className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 focus:bg-gray-500 focus:text-white focus:outline-none dark:hover:bg-gray-600"
                                                                                    >
                                                                                        <span className="sr-only">
                                                                                            {t('CSP.Remove')} {tag}
                                                                                        </span>
                                                                                        <svg
                                                                                            className="h-2 w-2"
                                                                                            stroke="currentColor"
                                                                                            fill="none"
                                                                                            viewBox="0 0 8 8"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeWidth="1.5"
                                                                                                d="M1 1l6 6m0-6L1 7"
                                                                                            />
                                                                                        </svg>
                                                                                    </button>
                                                                                )}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-400 dark:focus:border-primary"
                                                                    placeholder={t('CSP.ValuePlaceholder')}
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
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {fields.length === 0 && !isLoading && (
                                        <tr>
                                                <td colSpan={2} className="py-4 text-center text-gray-500 dark:text-gray-400">
                                                {t('CSP.NoDirectives')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                            ) : (
                                <>
                                    {t('CSP.Save')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default CSP;
