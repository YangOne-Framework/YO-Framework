import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import ComponentCard from "../../../components/common/ComponentCard";
import Checkbox from "../../../components/form/input/Checkbox";
import toaster from "../../../components/toster";
import {
    useGetOptimizationConfigQuery,
    useSaveOptimizationConfigMutation,
    useGetCacheInfoQuery,
    useClearCacheMutation,
    useIncrementVersionMutation,
    useRebuildBundlesMutation,
} from "../../../redux/setting/settingAPI";
import { OptimizationConfig } from "../../../types/settingTypes";

const Optimization = () => {
    const { t } = useTranslation();
    const { data: configResponse, isSuccess: configLoaded } = useGetOptimizationConfigQuery();
    const [saveConfig, { isLoading: isSaving }] = useSaveOptimizationConfigMutation();

    const { data: cacheResponse, isSuccess: cacheLoaded, refetch: refetchCache } = useGetCacheInfoQuery();
    const [clearCache, { isLoading: isClearing }] = useClearCacheMutation();

    const [incrementVersion, { isLoading: isIncrementing }] = useIncrementVersionMutation();
    const [rebuildBundles, { isLoading: isRebuilding }] = useRebuildBundlesMutation();

    const [currentVersion, setCurrentVersion] = useState<string>("N/A");

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<OptimizationConfig>({
        defaultValues: {
            EnableJsMinification: false,
            EnableCSSMinification: false,
            CachingDirectory: false,
            UseImageResizer: true,
        },
    });

    useEffect(() => {
        if (configLoaded && configResponse?.Data) {
            reset(configResponse.Data);
        }
    }, [configLoaded, configResponse, reset]);

    const onSubmit = async (data: OptimizationConfig) => {
        try {
            const response = await saveConfig(data).unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.OptimizationSaved"));
            } else {
                toaster.error(t("Setting.OptimizationSaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    const handleClearCache = async () => {
        try {
            const response = await clearCache().unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.CacheCleared"));
                refetchCache();
            } else {
                toaster.error(t("Setting.CacheClearFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    const handleIncrementVersion = async () => {
        try {
            const response = await incrementVersion().unwrap();
            if (response.Code === 200) {
                setCurrentVersion(response.Data.Version);
                toaster.success(t("Setting.VersionIncremented", { version: response.Data.Version }));
            } else {
                toaster.error(t("Setting.VersionIncrementFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    const handleRebuild = async () => {
        try {
            const response = await rebuildBundles().unwrap();
            if (response.Code === 200) {
                setCurrentVersion(response.Data.Version);
                refetchCache();
                toaster.success(t("Setting.BundlesRebuilt", { version: response.Data.Version }));
            } else {
                toaster.error(t("Setting.BundlesRebuildFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    const cacheInfo = cacheLoaded && cacheResponse?.Data
        ? cacheResponse.Data
        : null;

    return (
        <div className="grid grid-cols-1 gap-4">
            {/* Optimization Configuration */}
            <ComponentCard title={t('Optimization.Title')}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h3 className="mb-4 font-semibold text-black dark:text-white">{t('Optimization.BundlingMinification')}</h3>
                        <div className="space-y-4">
                            <div>
                                <Checkbox label={t('Optimization.EnableJSMin')} {...register("EnableJsMinification")} />
                            </div>
                            <div>
                                <Checkbox label={t('Optimization.EnableCSSMin')} {...register("EnableCSSMinification")} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h3 className="mb-4 font-semibold text-black dark:text-white">{t('Optimization.CachingImages')}</h3>
                        <div className="space-y-4">
                            <div>
                                <Checkbox label={t('Optimization.EnableCacheDir')} {...register("CachingDirectory")} />
                                <p className="mt-1 text-sm text-gray-500">
                                    {t('Optimization.CacheDirDescription')}
                                </p>
                            </div>
                            <div>
                                <Checkbox label={t('Optimization.UseImageResizer')} {...register("UseImageResizer")} />
                                <p className="mt-1 text-sm text-gray-500">
                                    {t('Optimization.ImageResizerDescription')}
                                </p>
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
                                t('Optimization.Save')
                            )}
                        </button>
                    </div>
                </form>
            </ComponentCard>

            {/* Cache Management */}
            <ComponentCard title={t('Optimization.CacheManagement')}>
                <div className="space-y-6">
                    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h3 className="mb-4 font-semibold text-black dark:text-white">{t('Optimization.SmidgeCache')}</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('Optimization.CacheSize')}</p>
                                <p className="text-2xl font-bold text-black dark:text-white">
                                    {cacheInfo?.SizeFormatted || "—"}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('Optimization.CachedFiles')}</p>
                                <p className="text-2xl font-bold text-black dark:text-white">
                                    {cacheInfo?.FileCount != null ? cacheInfo.FileCount.toLocaleString() : "—"}
                                </p>
                            </div>
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('Optimization.CurrentVersion')}</p>
                                <p className="text-2xl font-bold text-black dark:text-white">
                                    {currentVersion}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClearCache}
                            disabled={isClearing}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-red-500 shadow-theme-xs hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {isClearing ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    {t('Optimization.Clearing')}
                                </>
                            ): (
                                t('Optimization.ClearCache')
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleIncrementVersion}
                            disabled={isIncrementing}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {isIncrementing ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    {t('Optimization.Incrementing')}
                                </>
                            ): (
                                t('Optimization.IncrementVersion')
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleRebuild}
                            disabled={isRebuilding}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-green-500 shadow-theme-xs hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {isRebuilding ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    {t('Optimization.Rebuilding')}
                                </>
                            ): (
                                t('Optimization.RebuildBundles')
                            )}
                        </button>
                    </div>
                </div>
            </ComponentCard>
        </div>
    );
};

export default Optimization;
