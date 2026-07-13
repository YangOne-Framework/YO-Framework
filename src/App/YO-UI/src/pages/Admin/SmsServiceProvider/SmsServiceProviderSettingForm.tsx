import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { MdAdd, MdDelete, MdArrowBack } from "react-icons/md";
import {
  useGetSmsServiceProviderByIdQuery,
  useGetSmsServiceProviderSettingsQuery,
  useUpdateSmsSettingsMutation,
} from "../../../redux/sms/smsAPI";
import toaster from "../../../components/toster";
import ComponentCard from "../../../components/common/ComponentCard";
import { useTranslation } from "react-i18next";

type FormValues = {
  settings: { GatewayKey: string; GatewayValue: string }[];
};

const SmsServiceProviderSettingForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const providerId = parseInt(id || "0", 10);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { settings: [{ GatewayKey: "", GatewayValue: "" }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "settings" });

  const { data: providerData, isSuccess: providerLoaded } = useGetSmsServiceProviderByIdQuery(providerId, {
    skip: !providerId,
  });

  const { data: settingsData, isSuccess: settingsLoaded } = useGetSmsServiceProviderSettingsQuery(providerId, {
    skip: !providerId,
  });

  const [updateSettings, { isLoading: saving }] = useUpdateSmsSettingsMutation();

  useEffect(() => {
    if (settingsLoaded && settingsData?.Data) {
      const loaded = settingsData.Data.map((s: any) => ({
        GatewayKey: s.GatewayKey,
        GatewayValue: s.GatewayValue,
      }));
      reset({ settings: loaded.length > 0 ? loaded : [{ GatewayKey: "", GatewayValue: "" }] });
    }
  }, [settingsData, settingsLoaded, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      const valid = data.settings.filter((s) => s.GatewayKey.trim());
      if (valid.length === 0) {
        toaster.error(t("SmsProviderSetting.Form.Key"));
        return;
      }
      await updateSettings(
        valid.map((s) => ({
          SMSGatewayId: providerId,
          GatewayKey: s.GatewayKey,
          GatewayValue: s.GatewayValue,
        })),
      ).unwrap();
      toaster.success(t("SmsProviderSetting.Form.Save"));
      navigate("/admin/setting/smsserviceprovider");
    } catch {
      toaster.error(t("SmsProviderSetting.Form.Save"));
    }
  };

  const providerName = providerLoaded && providerData?.Data ? providerData.Data.Name : t("Common.Loading");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ComponentCard title={`${t("SmsProviderSetting.Title")} \u2014 ${providerName}`}>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t("SmsProviderSetting.Form.Key")}
                  {...register(`settings.${index}.GatewayKey`, { required: t("SmsProviderSetting.Form.Key") })}
                  className={`w-full rounded-lg border ${errors.settings?.[index]?.GatewayKey ? "border-red-500" : "border-gray-300"} bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-400`}
                />
                {errors.settings?.[index]?.GatewayKey && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.settings[index]?.GatewayKey?.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={t("SmsProviderSetting.Form.Value")}
                  {...register(`settings.${index}.GatewayValue`, { required: t("SmsProviderSetting.Form.Value") })}
                  className={`w-full rounded-lg border ${errors.settings?.[index]?.GatewayValue ? "border-red-500" : "border-gray-300"} bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-400`}
                />
                {errors.settings?.[index]?.GatewayValue && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.settings[index]?.GatewayValue?.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                  className="mt-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md cursor-pointer disabled:opacity-30"
              >
                <MdDelete size={20} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ GatewayKey: "", GatewayValue: "" })}
            className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 cursor-pointer"
          >
            <MdAdd size={18} /> {t("SmsProviderSetting.Form.AddSmsGatewaySetting")}
          </button>
        </div>
      </ComponentCard>

      <div className="mt-3 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/setting/smsserviceprovider")}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <MdArrowBack size={18} /> {t("Form.Back")}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {t("SmsProviderSetting.Form.Save")}
        </button>
      </div>
    </form>
  );
};

export default SmsServiceProviderSettingForm;
