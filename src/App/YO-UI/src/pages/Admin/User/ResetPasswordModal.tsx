import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { Modal } from "../../../components/ui/modal";
import InputField from "../../../components/form/input/InputField";
import { useResetPasswordMutation } from "../../../redux/user/userAPI";
import toaster from "../../../components/toster";

interface ResetPasswordModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, user, onClose }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onSubmit = async (data: any) => {
    try {
      await resetPassword({ IdentityUserId: user?.IdentityUserId, newPassword: data.NewPassword }).unwrap();
      toaster.success(t("ResetPassword.Button"));
      reset();
      onClose();
    } catch {
      toaster.error(t("ResetPassword.Button"));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{t("ResetPassword.Title")}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {t("ResetPassword.Description")} <span className="font-medium text-gray-700 dark:text-gray-300">{user?.FirstName} {user?.LastName}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            type="password"
            id="newPassword"
            labelName={t("ResetPassword.NewPassword")}
            placeholder={t("ResetPassword.Placeholder")}
            {...register("NewPassword", {
              required: t("ResetPassword.Placeholder"),
              minLength: { value: 8, message: t("UserForm.PasswordMinLength") }
            })}
            error={!!errors.NewPassword}
            errorMsg={errors.NewPassword?.message as string}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {t("Form.Cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? t("Common.Loading") : t("ResetPassword.Button")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ResetPasswordModal;
