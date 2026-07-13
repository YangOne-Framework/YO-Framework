import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useAddRoleMutation, useUpdateRoleMutation, useGetRoleByIdQuery } from "../../../redux/user/userAPI";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import ComponentCard from "../../../components/common/ComponentCard";

const defaultValues = {
  Name: "",
  IsActive: false,
  IsSystem: false,
  IsTemporary: false,
};

const FormRole = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [roleId, setRoleId] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  const { data: roleData, isSuccess } = useGetRoleByIdQuery(roleId, { skip: !isEditMode || roleId === 0 });

  const [addRole, { isLoading: adding }] = useAddRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRoleMutation();

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setRoleId(parseInt(id, 10));
    } else {
      setIsEditMode(false);
      setRoleId(0);
      reset(defaultValues);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isSuccess && roleData && roleData.Data) {
      const role = roleData.Data;
      reset({
        Name: role.Name,
        IsActive: role.IsActive,
        IsSystem: role.IsSystem,
        IsTemporary: role.IsTemporary,
      });
    }
  }, [roleData, isSuccess, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (isEditMode) {
        await updateRole({ ...data, Id: roleId }).unwrap();
        toaster.success(t("Form.Update"));
      } else {
        await addRole(data).unwrap();
        toaster.success(t("Form.Save"));
      }
      navigate("/admin/role");
    } catch (error) {
      toaster.error(t("Form.Save"));
    }
  };

    return (
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ComponentCard title={isEditMode ? t("RoleManagement.Form.EditTitle") : t("RoleManagement.Form.AddTitle")}>
            <div className="grid grid-cols-1 gap-4">
              <InputField
                type="text"
                id="name"
                labelName={t("RoleManagement.Form.RoleName")}
                placeholder={t("RoleManagement.Form.RoleName.PlaceHolder")}
                {...register("Name", { required: t("RoleManagement.Form.RoleName.Required") })}
                error={!!errors.Name}
                errorMsg={errors.Name?.message as string}
              />

              <div className="flex items-center gap-6">
                <Checkbox label={t("RoleManagement.Form.IsActive")} {...register("IsActive")} id="isActive" />
                <Checkbox label={t("RoleManagement.Form.IsSystemRole")} {...register("IsSystem")} id="isSystem" />
                <Checkbox label={t("RoleManagement.Form.IsTemporaryRole")} {...register("IsTemporary")} id="isTemporary" />
              </div>
            </div>
           </ComponentCard>

           <div className="mt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/role")}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            {t("Form.Cancel")}
          </button>
          <button
            type="submit"
            className="bg-brand-500 hover:bg-brand-600 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            disabled={adding || updating || isSubmitting}
          >
            {isEditMode ? t("Form.Update") : t("Form.Save")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormRole;
