import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import TextArea from "../../../components/form/input/TextArea";
import Checkbox from "../../../components/form/input/Checkbox";
import SelectCreatable from "../../../components/ui/SelectCreateable";
import ComponentCard from "../../../components/common/ComponentCard";
import {
  useSaveRestrictionMutation,
  useGetRestrictionByIdQuery,
  useGetRestrictionKeysQuery,
  useSaveRestrictionKeyMutation,
} from "../../../redux/restriction/restrictionAPI";

const defaultValues = {
  Value: "",
  Reason: "",
  Narration: "",
  IsActive: true,
};

interface KeyOption {
  value: string;
  label: string;
}

const RestrictionForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [restrictionId, setRestrictionId] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeyOption | null>(null);
  const [keyError, setKeyError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const { data: restrictionData, isSuccess } = useGetRestrictionByIdQuery(restrictionId, {
    skip: !isEditMode || restrictionId === 0,
  });

  const { data: keysData } = useGetRestrictionKeysQuery({ offset: 1, limit: 200, query: "" });

  const [saveRestriction, { isLoading: saving }] = useSaveRestrictionMutation();
  const [saveRestrictionKey, { isLoading: keySaving }] = useSaveRestrictionKeyMutation();

  const existingKeys: KeyOption[] = (keysData?.Data || []).map((key: any) => ({
    value: String(key.RestrictionKeyId),
    label: key.Name,
  }));

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setRestrictionId(parseInt(id, 10));
    } else {
      setIsEditMode(false);
      setRestrictionId(0);
      reset(defaultValues);
      setSelectedKey(null);
      setKeyError("");
    }
  }, [id, reset]);

  useEffect(() => {
    if (isSuccess && restrictionData && restrictionData.Data && existingKeys.length > 0) {
      const item = restrictionData.Data;
      const keyOption = existingKeys.find(k => k.value === String(item.RestrictionKeyId));
      setSelectedKey(keyOption || null);
      reset({
        Value: item.Value || "",
        Reason: item.Reason || "",
        Narration: item.Narration || "",
        IsActive: item.IsActive ?? true,
      });
    }
  }, [restrictionData, isSuccess, reset, existingKeys]);

  const handleKeyChange = (newValue: KeyOption | null) => {
    setSelectedKey(newValue);
    setKeyError("");
  };

  const handleCreateKey = async (inputValue: string) => {
    const upper = inputValue.toUpperCase().trim();
    if (!upper) return;

    const dup = existingKeys.some(k => k.label.toUpperCase() === upper);
    if (dup) {
      setKeyError(t("Restriction.KeyDuplicate"));
      return;
    }

    try {
      const result = await saveRestrictionKey({
        name: upper,
        isSystem: false,
        isActive: true,
      }).unwrap();

      const newId = result.Data?.RestrictionKeyId;
      if (newId) {
        const newOption = { value: String(newId), label: upper };
        setSelectedKey(newOption);
        setKeyError("");
      } else {
        setKeyError(t("Form.SaveFailed"));
      }
    } catch {
      setKeyError(t("Form.SaveFailed"));
    }
  };

  const onSubmit = async (data: any) => {
    try {
      if (!selectedKey) {
        setKeyError(t("Restriction.KeyRequired"));
        return;
      }

      const body = {
        RestrictionId: isEditMode ? restrictionId : 0,
        RestrictionKeyId: parseInt(selectedKey.value, 10),
        Value: data.Value,
        Reason: data.Reason || "",
        Narration: data.Narration || "",
        IsActive: data.IsActive,
      };

      await saveRestriction(body).unwrap();
      toaster.success(isEditMode ? t("Form.Update") : t("Form.Save"));
      navigate("/admin/setting/restriction");
    } catch {
      toaster.error(t("Form.SaveFailed"));
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ComponentCard title={isEditMode ? t("Restriction.Form.EditTitle") : t("Restriction.Form.AddTitle")}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SelectCreatable
              labelText={t("Restriction.RestrictionKeyId")}
              isRequired
              placeholder={t("Common.SelectAnOption")}
              options={existingKeys}
              value={selectedKey}
              onChange={handleKeyChange}
              onCreateOption={handleCreateKey}
              error={keyError}
              isDisabled={keySaving}
            />
            <InputField
              type="text"
              id="value"
              labelName={t("Restriction.Value")}
              placeholder="e.g. 192.168.1.100"
              {...register("Value", { required: t("Restriction.ValueRequired") })}
              error={!!errors.Value}
              errorMsg={errors.Value?.message as string}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 mt-4">
            <InputField
              type="text"
              id="reason"
              labelName={t("Restriction.Reason")}
              placeholder={t("Restriction.ReasonPlaceholder")}
              {...register("Reason")}
            />
            <TextArea
              labelName={t("Restriction.Narration")}
              placeholder={t("Restriction.NarrationPlaceholder")}
              rows={3}
              {...register("Narration")}
            />
          </div>

          <div className="mt-4">
            <Checkbox label={t("Restriction.IsActive")} {...register("IsActive")} id="isActive" />
          </div>
        </ComponentCard>

        <div className="mt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/setting/restriction")}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("Form.Cancel")}
          </button>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            disabled={saving || isSubmitting || keySaving}
          >
            {isEditMode ? t("Form.Update") : t("Form.Save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestrictionForm;
