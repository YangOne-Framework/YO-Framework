import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ComponentCard from "../../../components/common/ComponentCard";
import toaster from "../../../components/toster";
import {
    useGetCacheInfoListQuery,
    useFlushCacheMutation,
    useRefreshCacheKeyMutation,
    useGetCacheProvidersQuery,
    useSwitchCacheProviderMutation,
    useRestartCacheAppMutation,
} from "../../../redux/setting/settingAPI";

const Caching = () => {
    const { t } = useTranslation();
    const { data: infoResponse, isSuccess: infoLoaded, refetch: refetchInfo } = useGetCacheInfoListQuery();
    const [flushCache, { isLoading: isFlushing }] = useFlushCacheMutation();
    const [refreshKey, { isLoading: isRefreshing }] = useRefreshCacheKeyMutation();
    const { data: providersResponse, isSuccess: providersLoaded, refetch: refetchProviders } = useGetCacheProvidersQuery();
    const [switchProvider, { isLoading: isSwitching }] = useSwitchCacheProviderMutation();
    const [restartApp, { isLoading: isRestarting }] = useRestartCacheAppMutation();
    const [refreshingKeys, setRefreshingKeys] = useState<Set<string>>(new Set());

    const cacheInfo = infoLoaded && infoResponse?.Data ? infoResponse.Data : null;
    const providersInfo = providersLoaded && providersResponse?.Data ? providersResponse.Data : null;

    const handleFlush = async () => {
        try {
            const response = await flushCache().unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.CacheFlushed"));
                refetchInfo();
            } else {
                toaster.error(t("Setting.CacheFlushFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    const handleRefreshKey = async (key: string) => {
        setRefreshingKeys(prev => new Set(prev).add(key));
        try {
            const response = await refreshKey(key).unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.CacheKeyRefreshed", { key }));
                refetchInfo();
            } else {
                toaster.error(t("Setting.CacheKeyRefreshFailed", { key }));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        } finally {
            setRefreshingKeys(prev => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
    };

    const handleSwitchProvider = async (provider: string) => {
        try {
            const response = await switchProvider({ Provider: provider }).unwrap();
            if (response.Code === 200) {
                toaster.success(response.Message);
                refetchProviders();
            } else {
                toaster.error(t("Setting.CacheSwitchFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    const handleRestart = async () => {
        try {
            const response = await restartApp().unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.AppRestarting"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    const keys = cacheInfo?.Keys ?? [];

    return (
        <div className="grid grid-cols-1 gap-4">
            <ComponentCard title={t('Caching.Title')}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('Caching.CurrentProvider')}</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {cacheInfo?.ProviderName || "—"}
                        </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('Caching.CachedKeys')}</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {cacheInfo?.KeyCount != null ? cacheInfo.KeyCount.toLocaleString() : "—"}
                        </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('Caching.ProviderType')}</p>
                        <p className="text-2xl font-bold text-black dark:text-white">
                            {cacheInfo?.ProviderType?.split('.').pop() || "—"}
                        </p>
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleFlush}
                        disabled={isFlushing}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-red-500 shadow-theme-xs hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-75"
                    >
                        {isFlushing ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                {t('Caching.Flushing')}
                            </>
                        ): (
                            t('Caching.FlushAll')
                        )}
                    </button>
                </div>
            </ComponentCard>

            {keys.length > 0 && (
                <ComponentCard title={t('Caching.CachedKeys')} desc={t('Caching.KeysDescription')}>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-stroke dark:border-strokedark">
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">#</th>
                                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">{t('Caching.Key')}</th>
                                    <th className="py-3 px-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">{t('Caching.Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map((key, index) => (
                                    <tr key={key} className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{index + 1}</td>
                                        <td className="py-3 px-4 text-sm font-mono text-black dark:text-white break-all">{key}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => handleRefreshKey(key)}
                                                disabled={refreshingKeys.has(key)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white transition rounded bg-brand-500 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-75"
                                            >
                                                {refreshingKeys.has(key) ? (
                                                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                                ): (
                                                    t('Caching.Refresh')
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </ComponentCard>
            )}

            {keys.length === 0 && infoLoaded && (
                <ComponentCard title={t('Caching.CachedKeys')}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cacheInfo?.ProviderName?.includes("Redis")
                            ? t('Caching.RedisNoKeys')
                            : t('Caching.NoKeysFound')}
                    </p>
                </ComponentCard>
            )}

            <ComponentCard title={t('Caching.Provider')}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {providersInfo?.RequiresRestart
                            ? t('Caching.ProviderRestartNeeded')
                            : t('Caching.ProviderChangeInfo')}
                    </p>

                    {providersInfo?.RequiresRestart && (
                        <div className="rounded-sm border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-200">
                            {t('Caching.ProviderPending')} <strong>{providersInfo.ConfiguredProvider}</strong>.
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {providersInfo?.Providers.map((provider) => (
                            <div
                                key={provider.Value}
                                className={`rounded-sm border p-4 ${
                                    provider.IsCurrent
                                        ? "border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-900/20"
                                        : "border-stroke bg-white dark:border-strokedark dark:bg-gray-800"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-black dark:text-white">{provider.Name}</h4>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {provider.IsCurrent ? t('Caching.CurrentlyActive') : t('Caching.Available')}
                                        </p>
                                    </div>
                                    {!provider.IsCurrent && (
                                        <button
                                            type="button"
                                            onClick={() => handleSwitchProvider(provider.Value)}
                                            disabled={isSwitching}
                                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-white transition rounded bg-brand-500 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-75"
                                        >
                                            {isSwitching ? (
                                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            ): (
                                                t('Caching.Switch')
                                            )}
                                        </button>
                                    )}
                                    {provider.IsCurrent && (
                                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {t('Caching.Active')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {providersInfo?.RequiresRestart && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleRestart}
                                disabled={isRestarting}
                                className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-orange-500 shadow-theme-xs hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-75"
                            >
                                {isRestarting ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                        {t('Caching.Restarting')}
                                    </>
                                ): (
                                    t('Caching.RestartApp')
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </ComponentCard>
        </div>
    );
};

export default Caching;
