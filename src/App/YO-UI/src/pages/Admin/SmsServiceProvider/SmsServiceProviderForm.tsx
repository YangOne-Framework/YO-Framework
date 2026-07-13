import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router";
import { MdAdd, MdDelete } from "react-icons/md";
import {
  useLazyGetSmsServiceProvidersQuery,
  useSaveSmsServiceProviderMutation,
} from "../../../redux/sms/smsAPI";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Checkbox from "../../../components/form/input/Checkbox";
import ComponentCard from "../../../components/common/ComponentCard";
import { useTranslation } from "react-i18next";

type FormValues = {
  Name: string;
  Description: string;
  ImageFile: File | null;
  IsActive: boolean;
  IsDefault: boolean;
  SMSGatewaySettings: { GatewayKey: string; GatewayValue: string }[];
};

const defaultValues: FormValues = {
  Name: "",
  Description: "",
  ImageFile: null,
  IsActive: true,
  IsDefault: false,
  SMSGatewaySettings: [{ GatewayKey: "", GatewayValue: "" }],
};

const SmsServiceProviderForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [nameChecking, setNameChecking] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "SMSGatewaySettings",
  });

  const [saveProvider, { isLoading: saving }] = useSaveSmsServiceProviderMutation();
  const [checkName] = useLazyGetSmsServiceProvidersQuery();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("ImageFile", file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setNameChecking(true);
      const existing = await checkName({ query: data.Name, limit: 1, offset: 1 }).unwrap();
      const hasMatch = existing?.Data?.some(
        (r: any) => r.Name?.toLowerCase() === data.Name?.toLowerCase(),
      );
      setNameChecking(false);

      if (hasMatch) {
        toaster.error(t("SmsProvider.Form.Title"));
        return;
      }

      const validSettings = data.SMSGatewaySettings.filter((s) => s.GatewayKey.trim());

      await saveProvider({
        Name: data.Name,
        Description: data.Description,
        ImageFile: data.ImageFile || undefined,
        IsActive: data.IsActive,
        IsDefault: data.IsDefault,
        SMSGatewaySettings: validSettings.length > 0 ? validSettings : undefined,
      }).unwrap();

      toaster.success(t("SmsProvider.Form.AddTitle"));
      navigate("/admin/setting/smsserviceprovider");
    } catch {
      toaster.error(t("SmsProvider.Form.Title"));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ComponentCard title={t("SmsProvider.Form.AddTitle")}>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              type="text"
              id="name"
              labelName={t("SmsProvider.Form.ProviderName")}
              placeholder={t("SmsProvider.Form.ProviderNamePlaceholder")}
              {...register("Name", { required: t("SmsProvider.Form.ProviderName") })}
              error={!!errors.Name}
              errorMsg={errors.Name?.message as string}
            />

            <TextArea
              id="description"
              labelName={t("SmsProvider.Form.Description")}
              placeholder={t("SmsProvider.Form.Description")}
              {...register("Description")}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t("SmsProvider.Form.Logo")}
              </label>
              {logoPreview && (
                <div className="mb-4">
                  <img
                    src={logoPreview}
                    alt={t("SmsProvider.Form.Logo")}
                    className="h-20 w-auto object-contain border border-stroke rounded p-2"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-gray-900 dark:text-gray-400 dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-6">
              <Checkbox label={t("SmsProvider.Form.IsActive")} {...register("IsActive")} id="isActive" />
              <Checkbox label={t("SmsProvider.Form.IsDefault")} {...register("IsDefault")} id="isDefault" />
            </div>
          </div>
        </ComponentCard>

        <ComponentCard title={t("SmsProvider.Form.GatewaySettings")}>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t("SmsProviderSetting.Form.Key")}
                    {...register(`SMSGatewaySettings.${index}.GatewayKey`, {
                      required: t("SmsProviderSetting.Form.Key"),
                    })}
                    className={`w-full rounded-lg border ${errors.SMSGatewaySettings?.[index]?.GatewayKey ? "border-red-500" : "border-gray-300"} bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-400`}
                  />
                  {errors.SMSGatewaySettings?.[index]?.GatewayKey && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.SMSGatewaySettings[index]?.GatewayKey?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t("SmsProviderSetting.Form.Value")}
                    {...register(`SMSGatewaySettings.${index}.GatewayValue`, {
                      required: t("SmsProviderSetting.Form.Value"),
                    })}
                    className={`w-full rounded-lg border ${errors.SMSGatewaySettings?.[index]?.GatewayValue ? "border-red-500" : "border-gray-300"} bg-transparent px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder:text-gray-400`}
                  />
                  {errors.SMSGatewaySettings?.[index]?.GatewayValue && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.SMSGatewaySettings[index]?.GatewayValue?.message}
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
              <MdAdd size={18} /> {t("SmsProviderSetting.Form.AddSetting")}
            </button>
          </div>
        </ComponentCard>

        <div className="mt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/setting/smsserviceprovider")}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("Form.Cancel")}
          </button>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            disabled={saving || isSubmitting || nameChecking}
          >
            {nameChecking ? t("Common.Loading") : t("SmsProvider.Form.AddTitle")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmsServiceProviderForm;
