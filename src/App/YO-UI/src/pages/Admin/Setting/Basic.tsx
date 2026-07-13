import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import ComponentCard from "../../../components/common/ComponentCard";
import Checkbox from "../../../components/form/input/Checkbox";
import toaster from "../../../components/toster";
import { useGetBasicSecurityConfigQuery, useSaveBasicSecurityConfigMutation } from "../../../redux/setting/settingAPI";
import { AppBasicSecurity } from "../../../types/settingTypes";

const Basic = () => {
    const { t } = useTranslation();
    const { data: apiResponse, isSuccess } = useGetBasicSecurityConfigQuery();
    const [saveBasicConfig, { isLoading: isSaving }] = useSaveBasicSecurityConfigMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AppBasicSecurity>({
        defaultValues: {
            RequireOTP: false,
            RequireDeviceVerification: false,
            OTPExpiryTimeInMinutes: 5,
            SendOTPFromEmail: false,
            SendOTPFromSMS: false,
            PasswordLength: 6,
            RequireNonAlphanumeric: false,
            RequireUppercase: false,
            RequireConfirmedEmail: false,
        },
    });

    useEffect(() => {
        if (isSuccess && apiResponse?.Data) {
            reset(apiResponse.Data);
        }
    }, [isSuccess, apiResponse, reset]);

    const onSubmit = async (data: AppBasicSecurity) => {
        try {
            const response = await saveBasicConfig(data).unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.BasicSaved"));
            } else {
                toaster.error(t("Setting.BasicSaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            <ComponentCard title={t('Basic.Title')}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* OTP & Device Section */}
                    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h3 className="mb-4 font-semibold text-black dark:text-white">{t('Basic.OTPAndDevice')}</h3>
                        <div className="space-y-4">
                            <div>
                                <Checkbox label={t('Basic.RequireOTP')} {...register("RequireOTP")} />
                            </div>
                            <div>
                                <Checkbox label={t('Basic.RequireDeviceVerification')} {...register("RequireDeviceVerification")} />
                            </div>
                            <div>
                                <label className="mb-2.5 block font-medium text-black dark:text-white">
                                    {t('Basic.OTPExpiry')}
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    {...register("OTPExpiryTimeInMinutes", { valueAsNumber: true, min: 1 })}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                />
                                {errors.OTPExpiryTimeInMinutes && (
                                    <span className="text-sm text-red-500">{t('Basic.OTPExpiryMinError')}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* OTP Delivery Section */}
                    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h3 className="mb-4 font-semibold text-black dark:text-white">{t('Basic.OTPDelivery')}</h3>
                        <div className="space-y-4">
                            <div>
                                <Checkbox label={t('Basic.SendOTPEmail')} {...register("SendOTPFromEmail")} />
                            </div>
                            <div>
                                <Checkbox label={t('Basic.SendOTPSMS')} {...register("SendOTPFromSMS")} />
                            </div>
                        </div>
                    </div>

                    {/* Password Policy Section */}
                    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h3 className="mb-4 font-semibold text-black dark:text-white">{t('Basic.PasswordPolicy')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2.5 block font-medium text-black dark:text-white">
                                    {t('Basic.PasswordLength')}
                                </label>
                                <input
                                    type="number"
                                    min="4"
                                    {...register("PasswordLength", { valueAsNumber: true, min: 4 })}
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                />
                                {errors.PasswordLength && (
                                    <span className="text-sm text-red-500">{t('Basic.PasswordLengthError')}</span>
                                )}
                            </div>
                            <div>
                                <Checkbox label={t('Basic.RequireNonAlphanumeric')} {...register("RequireNonAlphanumeric")} />
                            </div>
                            <div>
                                <Checkbox label={t('Basic.RequireUppercase')} {...register("RequireUppercase")} />
                            </div>
                            <div>
                                <Checkbox label={t('Basic.RequireConfirmedEmail')} {...register("RequireConfirmedEmail")} />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
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
                                t('Basic.Save')
                            )}
                        </button>
                    </div>
                </form>
            </ComponentCard>
        </div>
    );
};

export default Basic;
