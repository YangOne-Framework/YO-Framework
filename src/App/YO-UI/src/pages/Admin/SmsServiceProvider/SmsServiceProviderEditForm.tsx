import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import {
  useGetSmsServiceProviderByIdQuery,
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
  Image: string;
  ImageFile: File | null;
  IsActive: boolean;
  IsDefault: boolean;
};

const defaultValues: FormValues = {
  Name: "",
  Description: "",
  Image: "",
  ImageFile: null,
  IsActive: true,
  IsDefault: false,
};

const SmsServiceProviderEditForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [providerId, setProviderId] = useState<number>(0);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues });

  const { data: providerData, isSuccess: providerLoaded } = useGetSmsServiceProviderByIdQuery(providerId, {
    skip: !providerId,
  });

  const [saveProvider, { isLoading: saving }] = useSaveSmsServiceProviderMutation();

  useEffect(() => {
    if (id) {
      setProviderId(parseInt(id, 10));
    }
  }, [id]);

  useEffect(() => {
    if (providerLoaded && providerData?.Data) {
      const p = providerData.Data;
      reset({
        Name: p.Name,
        Description: p.Description || "",
        Image: p.Image || "",
        ImageFile: null,
        IsActive: p.IsActive,
        IsDefault: p.IsDefault,
      });
      if (p.Image) {
        const cdnPath = import.meta.env.VITE_CDN_PATH || "";
        setLogoPreview(cdnPath + p.Image);
      }
    }
  }, [providerData, providerLoaded, reset]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("ImageFile", file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await saveProvider({
        SMSGatewayId: providerId,
        Name: data.Name,
        Description: data.Description,
        Image: data.Image,
        ImageFile: data.ImageFile || undefined,
        IsActive: data.IsActive,
        IsDefault: data.IsDefault,
      }).unwrap();

      toaster.success(t("SmsProvider.Form.EditTitle"));
      navigate("/admin/setting/smsserviceprovider");
    } catch {
      toaster.error(t("SmsProvider.Form.Title"));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ComponentCard title={t("SmsProvider.Form.EditTitle")}>
          <div className="grid grid-cols-1 gap-4">
            <InputField
              type="text"
              id="name"
              labelName={t("SmsProvider.Form.ProviderName")}
              placeholder="e.g. Azure SMS, Twilio"
              disabled
              hint={t("SmsProvider.Form.ProviderName")}
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
                className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-6">
              <Checkbox label={t("SmsProvider.Form.IsActive")} {...register("IsActive")} id="isActive" />
              <Checkbox label={t("SmsProvider.Form.IsDefault")} {...register("IsDefault")} id="isDefault" />
            </div>
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
            disabled={saving || isSubmitting}
          >
            {t("Form.Update")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmsServiceProviderEditForm;
