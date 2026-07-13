import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import ComponentCard from "../../../components/common/ComponentCard";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import { useGetWebSettingQuery, useSaveWebSettingMutation } from "../../../redux/setting/settingAPI";
import { useGetAllTimezonesQuery } from "../../../redux/timezone/timezoneAPI";
import { useGetAllCountriesQuery } from "../../../redux/other/miscAPI";
import { WebSetting } from "../../../types/settingTypes";

const Web = () => {
    const { t } = useTranslation();
    const { data: apiResponse, isSuccess, isLoading } = useGetWebSettingQuery();
    const [saveWebSetting, { isLoading: isSaving }] = useSaveWebSettingMutation();
    const { data: tzResponse, isSuccess: tzLoaded } = useGetAllTimezonesQuery();
    const { data: countryResponse, isSuccess: countryLoaded } = useGetAllCountriesQuery({});
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm<WebSetting>({
        defaultValues: {
            UseHttps: false,
            Lattitude: 0,
            Longitude: 0,
        }
    });

    useEffect(() => {
        if (isSuccess && apiResponse?.Data) {
            reset(apiResponse.Data);
            // Handle existing logo for preview if available and not a file object yet
            if (apiResponse.Data.Logo && typeof apiResponse.Data.Logo === 'string') {
                const cdnPath = import.meta.env.VITE_CDN_PATH || "";
                setLogoPreview(cdnPath + apiResponse.Data.Logo);
            }
        }
    }, [isSuccess, apiResponse, reset]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue("LogoFile", file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: WebSetting) => {
        try {
            const response = await saveWebSetting(data).unwrap();
            if (response.Code === 200) {
                toaster.success(t("Setting.WebSaved"));
            } else {
                toaster.error(response.Message || t("Setting.WebSaveFailed"));
            }
        } catch (error: any) {
            toaster.error(error?.data?.Message || t("Setting.AnErrorOccurred"));
        }
    };

    if (isLoading) return <div>{t('Common.Loading')}</div>;

    return (
        <div className="grid grid-cols-1 gap-4">
            <ComponentCard title={t('Web.Title')}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">

                    {/* Section 1: Configuration */}
                    <div className="border-b border-stroke pb-6 dark:border-strokedark">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-black dark:text-white">{t('Web.Configuration')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('Web.ConfigurationDescription')}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="col-span-2">
                                <InputField
                                    labelName={t('Web.WebsiteName')}
                                    placeholder={t('Web.WebsiteNamePlaceholder')}
                                    {...register("WebsiteName", { required: t('Web.WebsiteNameRequired') })}
                                    error={!!errors.WebsiteName}
                                    errorMsg={errors.WebsiteName?.message}
                                />
                            </div>

                            <div className="col-span-2">
                                <TextArea
                                    labelName={t('Common.Description')}
                                    rows={4}
                                    placeholder={t('Web.WebsiteDescriptionPlaceholder')}
                                    {...register("Description")}
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    {t('Web.Logo')}
                                </label>
                                {logoPreview && (
                                    <div className="mb-4">
                                        <img src={logoPreview} alt={t('Web.LogoPreview')} className="h-20 w-auto object-contain border border-stroke rounded p-2" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-gray-900 dark:text-gray-400 dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Locality */}
                    <div className="border-b border-stroke pb-6 dark:border-strokedark">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-black dark:text-white">{t('Web.Locality')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('Web.LocalityDescription')}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div>
                                <InputField
                                    labelName={t('Web.BaseCulture')}
                                    placeholder={t('Web.BaseCulturePlaceholder')}
                                    {...register("BaseCulture", { required: t('Web.BaseCultureRequired') })}
                                    error={!!errors.BaseCulture}
                                    errorMsg={errors.BaseCulture?.message}
                                />
                            </div>

                            <div>
                                <InputField
                                    labelName={t('Web.BaseCurrency')}
                                    placeholder={t('Web.BaseCurrencyPlaceholder')}
                                    {...register("BaseCurrency", { required: t('Web.BaseCurrencyRequired') })}
                                    error={!!errors.BaseCurrency}
                                    errorMsg={errors.BaseCurrency?.message}
                                />
                            </div>

                            <div>
                                <InputField
                                    labelName={t('Web.CurrencyCode')}
                                    placeholder={t('Web.CurrencyCodePlaceholder')}
                                    {...register("CurrencyCode", { required: t('Web.CurrencyCodeRequired') })}
                                    error={!!errors.CurrencyCode}
                                    errorMsg={errors.CurrencyCode?.message}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    {t('Web.Timezone')}
                                </label>
                                <select
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-gray-300 dark:focus:border-primary"
                                    {...register("TimeZoneId", { valueAsNumber: true, required: t('Web.TimezoneRequired') })}
                                >
                                    <option value="">{t('Web.SelectTimezone')}</option>
                                    {tzLoaded && tzResponse?.Data?.map((tz) => (
                                        <option key={tz.Id} value={tz.Id}>
                                            {tz.DisplayName} ({tz.UTC})
                                        </option>
                                    ))}
                                </select>
                                {errors.TimeZoneId && (
                                    <span className="text-sm text-red-500">{errors.TimeZoneId.message}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Location */}
                    <div className="border-b border-stroke pb-6 dark:border-strokedark">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-black dark:text-white">{t('Web.Location')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('Web.LocationDescription')}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="col-span-1 md:col-span-1">
                                <InputField
                                    labelName={t('Web.Address1')}
                                    placeholder={t('Web.Address1Placeholder')}
                                    {...register("Address1")}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-1">
                                <InputField
                                    labelName={t('Web.Address2')}
                                    placeholder={t('Web.Address2Placeholder')}
                                    {...register("Address2")}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-1">
                                <InputField
                                    labelName={t('Web.City')}
                                    placeholder={t('Web.CityPlaceholder')}
                                    {...register("City")}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-1">
                                <InputField
                                    labelName={t('Web.State')}
                                    placeholder={t('Web.StatePlaceholder')}
                                    {...register("State")}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-1">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                    {t('Web.Country')}
                                </label>
                                <select
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-gray-300 dark:focus:border-primary"
                                    {...register("CountryId", { valueAsNumber: true })}
                                >
                                    <option value="">{t('Web.SelectCountry')}</option>
                                    {countryLoaded && countryResponse?.Data?.map((c: any) => (
                                        <option key={c.CountryId} value={c.CountryId}>
                                            {c.Name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-1 md:col-span-1 hidden md:block"></div> {/* Spacer */}

                            <div className="col-span-1 md:col-span-1">
                                <InputField
                                    type="text"
                                    labelName={t('Web.Latitude')}
                                    placeholder={t('Web.LatitudePlaceholder')}
                                    {...register("Lattitude", { valueAsNumber: true })}
                                />
                            </div>
                            <div className="col-span-1 md:col-span-1">
                                <InputField

                                    type="text"
                                    labelName={t('Web.Longitude')}
                                    placeholder={t('Web.LongitudePlaceholder')}
                                    {...register("Longitude", { valueAsNumber: true })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Other */}
                    <div className="border-b border-stroke pb-6 dark:border-strokedark">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-black dark:text-white">{t('Web.Other')}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('Web.OtherDescription')}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="col-span-2">
                                <InputField
                                    type="email"
                                    labelName={t('Web.DefaultEmail')}
                                    placeholder={t('Web.DefaultEmailPlaceholder')}
                                    {...register("DefaultEmail", {
                                        required: t('Web.DefaultEmailRequired'),
                                        pattern: { value: /^\S+@\S+$/i, message: t('Web.InvalidEmail') }
                                    })}
                                    error={!!errors.DefaultEmail}
                                    errorMsg={errors.DefaultEmail?.message}
                                />
                            </div>
                            <div className="col-span-2">
                                <InputField
                                    type="email"
                                    labelName={t('Web.SupportEmail')}
                                    placeholder={t('Web.SupportEmailPlaceholder')}
                                    {...register("SupportEmail")}
                                />
                            </div>
                            <div className="col-span-2">
                                <InputField
                                    type="email"
                                    labelName={t('Web.SalesEmail')}
                                    placeholder={t('Web.SalesEmailPlaceholder')}
                                    {...register("SalesEmail")}
                                />
                            </div>
                            <div className="col-span-2">
                                <InputField
                                    type="email"
                                    labelName={t('Web.MarketingEmail')}
                                    placeholder={t('Web.MarketingEmailPlaceholder')}
                                    {...register("MarketingEmail")}
                                />
                            </div>

                            <div className="col-span-2">
                                <TextArea
                                    labelName={t('Web.GoogleAnalyticScript')}
                                    rows={4}
                                    placeholder={t('Web.GoogleAnalyticPlaceholder')}
                                    {...register("GoogleAnalyticScript")}
                                />
                            </div>


                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {isSaving ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                    {t('Common.Saving')}
                                </>
                            ): (
                                t('Web.Save')
                            )}
                        </button>
                    </div>

                </form>
            </ComponentCard>
        </div>
    );
};

export default Web;
