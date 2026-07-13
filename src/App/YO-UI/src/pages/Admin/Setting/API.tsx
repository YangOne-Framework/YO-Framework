import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ComponentCard from "../../../components/common/ComponentCard";
import Radio from "../../../components/form/input/Radio";
import toaster from "../../../components/toster";
import { useGetApiConfigQuery, useSaveApiConfigMutation } from "../../../redux/setting/settingAPI";

type ApiMode = "None" | "Encryption" | "Obfuscation";

const MODE_MAP: Record<ApiMode, { UseEncryption: boolean; UseObfusication: boolean }> = {
    None: { UseEncryption: false, UseObfusication: false },
    Encryption: { UseEncryption: true, UseObfusication: false },
    Obfuscation: { UseEncryption: false, UseObfusication: true },
};

const fromApiConfig = (enc: boolean, obf: boolean): ApiMode => {
    if (enc) return "Encryption";
    if (obf) return "Obfuscation";
    return "None";
};

const API = () => {
    const { t } = useTranslation();
    const { data: apiResponse, isSuccess } = useGetApiConfigQuery();
    const [saveApiConfig, { isLoading: isSaving }] = useSaveApiConfigMutation();
    const [mode, setMode] = useState<ApiMode>("None");

    useEffect(() => {
        if (isSuccess && apiResponse?.Data) {
            setMode(fromApiConfig(apiResponse.Data.UseEncryption, apiResponse.Data.UseObfusication));
        }
    }, [isSuccess, apiResponse]);

    const handleSave = async () => {
        try {
            const payload = MODE_MAP[mode];
            const response = await saveApiConfig(payload).unwrap();

            if (response.Code === 200) {
                toaster.success(t("Setting.APISaved"));
            } else {
                toaster.error(t("Setting.APISaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            <ComponentCard title={t('API.Title')}>
                <div className="space-y-4">
                    <Radio
                        id="mode-none"
                        name="apiMode"
                        value="None"
                        checked={mode === "None"}
                        onChange={() => setMode("None")}
                        label={t('API.None')}
                    />
                    <Radio
                        id="mode-encryption"
                        name="apiMode"
                        value="Encryption"
                        checked={mode === "Encryption"}
                        onChange={() => setMode("Encryption")}
                        label={t('API.Encryption')}
                    />
                    <Radio
                        id="mode-obfuscation"
                        name="apiMode"
                        value="Obfuscation"
                        checked={mode === "Obfuscation"}
                        onChange={() => setMode("Obfuscation")}
                        label={t('API.Obfuscation')}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {isSaving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    {t('Common.Saving')}
                                </>
                            ) : (
                                t('API.Save')
                            )}
                        </button>
                    </div>
                </div>
            </ComponentCard>
        </div>
    );
};

export default API;
