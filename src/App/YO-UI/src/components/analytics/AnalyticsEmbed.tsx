import React from "react";
import { useTranslation } from "react-i18next";

interface AnalyticsEmbedProps {
    embedUrl?: string; // URL from Looker Studio
    title?: string;
    height?: string;
}

export default function AnalyticsEmbed({
    embedUrl,
    title,
    height = "600px"
}: AnalyticsEmbedProps) {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t("Analytics.DefaultTitle");
    if (!embedUrl) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 font-bold text-gray-800 dark:text-white/90">
                    {resolvedTitle}
                </h3>
                <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-gray-500 dark:text-gray-400">
                        {t("Analytics.NoUrl")}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                        {t("Analytics.AddUrlHint")}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-bold text-gray-800 dark:text-white/90">
                {resolvedTitle}
            </h3>
            <div className="relative w-full overflow-hidden rounded-lg">
                <iframe
                    src={embedUrl}
                    width="100%"
                    height={height}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title={resolvedTitle}
                />
            </div>
        </div>
    );
}
