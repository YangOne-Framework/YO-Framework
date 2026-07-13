import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import ComponentCard from "../../../components/common/ComponentCard";
import { useSaveAdminIPMutation, useGetAdminIPByIdQuery } from "../../../redux/restriction/restrictionAPI";
import { useGetRolesQuery } from "../../../redux/user/userAPI";

const isValidIPv4 = (ip: string) => {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p;
  });
};

const isValidIPv6 = (ip: string) => {
  if (ip.includes("::")) {
    const sides = ip.split("::");
    if (sides.length > 2) return false;
    const left = sides[0] ? sides[0].split(":") : [];
    const right = sides[1] ? sides[1].split(":") : [];
    if (left.length + right.length > 7) return false;
    const all = [...left, ...right];
    return all.every(p => /^[0-9a-fA-F]{0,4}$/.test(p));
  }
  const groups = ip.split(":");
  if (groups.length !== 8) return false;
  return groups.every(p => /^[0-9a-fA-F]{1,4}$/.test(p));
};

const validateSingleIP = (value: string, family: "v4" | "v6") => {
  const v = value.trim();
  if (!v) return false;
  return family === "v4" ? isValidIPv4(v) : isValidIPv6(v);
};

const validateCIDR = (value: string, family: "v4" | "v6") => {
  const parts = value.trim().split("/");
  if (parts.length !== 2) return false;
  const [ip, prefix] = parts;
  const p = parseInt(prefix, 10);
  if (isNaN(p)) return false;
  if (family === "v4" && (p < 0 || p > 32)) return false;
  if (family === "v6" && (p < 0 || p > 128)) return false;
  return family === "v4" ? isValidIPv4(ip) : isValidIPv6(ip);
};

const validateDashRange = (value: string, family: "v4" | "v6") => {
  const parts = value.trim().split("-");
  if (parts.length !== 2) return false;
  const [start, end] = parts.map(s => s.trim());
  if (!start || !end) return false;
  return family === "v4"
    ? isValidIPv4(start) && isValidIPv4(end)
    : isValidIPv6(start) && isValidIPv6(end);
};

const validateIPField = (value: string, isRange: boolean, isEnabled: boolean, family: "v4" | "v6") => {
  if (!isEnabled) return true;
  const v = (value || "").trim();
  if (!v) return false;
  if (isRange) {
    if (v.includes("/")) return validateCIDR(v, family);
    if (v.includes("-")) return validateDashRange(v, family);
    return false;
  }
  return validateSingleIP(v, family);
};

const defaultValues = {
  IPV4Range: "",
  IPV6Range: "",
  RoleId: "0",
  ipType: "v4" as "v4" | "v6",
  IsRange: false,
  IsActive: true,
};

const IPAccessForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [ipAccessId, setIpAccessId] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const ipType = watch("ipType");
  const isRange = watch("IsRange");

  const { data: ipData, isSuccess } = useGetAdminIPByIdQuery(ipAccessId, {
    skip: !isEditMode || ipAccessId === 0,
  });

  const { data: rolesData } = useGetRolesQuery({ offset: 1, limit: 100, query: "" });

  const [saveAdminIP, { isLoading: saving }] = useSaveAdminIPMutation();

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setIpAccessId(parseInt(id, 10));
    } else {
      setIsEditMode(false);
      setIpAccessId(0);
      reset(defaultValues);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isSuccess && ipData && ipData.Data) {
      const item = ipData.Data;
      const isV4 = item.AllowIPV4 === true || item.AllowIPV4 === "1";
      reset({
        IPV4Range: item.IPV4Range || "",
        IPV6Range: item.IPV6Range || "",
        RoleId: String(item.RoleId || "0"),
        ipType: isV4 ? "v4" : "v6",
        IsRange: item.IsRange || false,
        IsActive: item.IsActive ?? true,
      });
    }
  }, [ipData, isSuccess, reset]);

  const roleOptions = (rolesData?.Data || []).map((role: any) => ({
    value: String(role.Id || role.RoleId),
    label: role.Name,
  }));

  const ipValidate = useCallback(
    (v: string) => {
      if (!v?.trim()) return t(ipType === "v4" ? "IPAccess.IPV4RangeRequired" : "IPAccess.IPV6RangeRequired");
      return validateIPField(v, isRange, true, ipType) || t(ipType === "v4" ? "IPAccess.IPV4Invalid" : "IPAccess.IPV6Invalid");
    },
    [ipType, isRange, t]
  );

  const onSubmit = async (data: any) => {
    try {
      const isV4 = data.ipType === "v4";
      const body = {
        AdministrativeIPAccessId: isEditMode ? ipAccessId : 0,
        RoleId: parseInt(data.RoleId, 10) || 0,
        IsRange: data.IsRange,
        IsActive: data.IsActive,
        AllowIPV4: isV4 ? "1" : "0",
        AllowIPV6: isV4 ? "0" : "1",
        ActivateIPV6: false,
        IPV4Range: isV4 ? (data.IPV4Range || "") : "",
        IPV6Range: isV4 ? "" : (data.IPV6Range || ""),
      };
      await saveAdminIP(body).unwrap();
      toaster.success(isEditMode ? t("Form.Update") : t("Form.Save"));
      navigate("/admin/setting/ipaccess");
    } catch {
      toaster.error(t("Form.SaveFailed"));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 px-5 py-4 text-sm text-orange-800 dark:text-orange-200">
          <p className="font-semibold mb-1">{t("IPAccess.WarningTitle")}</p>
          <p>{t("IPAccess.WarningBody")}</p>
        </div>

        <ComponentCard title={isEditMode ? t("IPAccess.Form.EditTitle") : t("IPAccess.Form.AddTitle")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="w-full px-2.5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t("IPAccess.RoleId")}
              </label>
              <select
                {...register("RoleId", { validate: v => v !== "0" || t("IPAccess.RoleRequired") })}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-brand-800"
              >
                <option value="0">{t("Common.SelectAnOption")}</option>
                {roleOptions.map((opt: any) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.RoleId && (
                <p className="text-theme-xs text-error-500 mt-1.5">{errors.RoleId.message as string}</p>
              )}
            </div>

            <div className="w-full px-2.5">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {t("IPAccess.IPType")}
              </label>
              <div className="flex items-center gap-6 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="v4"
                    {...register("ipType")}
                    className="w-4 h-4 accent-brand-500"
                  />
                  {t("IPAccess.AllowIPV4")}
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value="v6"
                    {...register("ipType")}
                    className="w-4 h-4 accent-brand-500"
                  />
                  {t("IPAccess.AllowIPV6")}
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {ipType === "v4" ? (
              <InputField
                type="text"
                id="ipv4Range"
                labelName={t("IPAccess.IPV4Range")}
                placeholder="e.g. 192.168.1.0/24, 192.168.1.1, 10.0.0.1-10.0.0.255"
                {...register("IPV4Range", { validate: ipValidate })}
                error={!!errors.IPV4Range}
                errorMsg={errors.IPV4Range?.message as string}
              />
            ) : (
              <InputField
                type="text"
                id="ipv6Range"
                labelName={t("IPAccess.IPV6Range")}
                placeholder="e.g. 2001:db8::/32, ::1, 2001:db8::-2001:db8::ffff"
                {...register("IPV6Range", { validate: ipValidate })}
                error={!!errors.IPV6Range}
                errorMsg={errors.IPV6Range?.message as string}
              />
            )}
          </div>

          <div className="mt-4 px-2.5">
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-400">
              {t("IPAccess.RangeHint")}
            </p>
            <div className="flex items-center gap-6">
              <Checkbox label={t("IPAccess.IsRange")} {...register("IsRange")} id="isRange" />
              <Checkbox label={t("IPAccess.IsActive")} {...register("IsActive")} id="isActive" />
            </div>
          </div>
        </ComponentCard>

        <div className="mt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/setting/ipaccess")}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("Form.Cancel")}
          </button>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            disabled={saving || isSubmitting}
          >
            {isEditMode ? t("Form.Update") : t("Form.Save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IPAccessForm;
