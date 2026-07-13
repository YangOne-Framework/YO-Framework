import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate } from "react-router";
import { useAddUserMutation, useUpdateUserMutation, useGetUserByIdQuery, useGetRolesQuery } from "../../../redux/user/userAPI";
import toaster from "../../../components/toster";
import InputField from "../../../components/form/input/InputField";
import Checkbox from "../../../components/form/input/Checkbox";
import CreatableSelect from "react-select/creatable";
import ComponentCard from "../../../components/common/ComponentCard";

const defaultValues = {
  FirstName: "",
  LastName: "",
  Email: "",
  UserName: "",
  PhoneNumber: "",
  Address: "",
  DOB: "",
  Gender: "",
  IsActive: true,
  OrganizationId: "",
  RoleIds: [],
  Password: "",
};

const FormUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get("id");
  const [userId, setUserId] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  const { data: roleData } = useGetRolesQuery({ offset: 1, limit: 1000 });
  const roles = roleData?.Data || [];

  const { data: userData, isSuccess } = useGetUserByIdQuery(userId, { skip: !isEditMode || userId === 0 });

  const [addUser, { isLoading: adding }] = useAddUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setUserId(parseInt(id, 10));
    } else {
      setIsEditMode(false);
      setUserId(0);
      reset(defaultValues);
    }
  }, [id, reset]);

  useEffect(() => {
    if (isSuccess && userData && userData.Data) {
      const user = userData.Data;
      reset({
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        UserName: user.UserName,
        PhoneNumber: user.PhoneNumber,
        Address: user.Address,
        DOB: user.DOB ? new Date(user.DOB).toISOString().split('T')[0] : "",
        Gender: user.Gender,
        IsActive: user.IsActive,
        OrganizationId: user.OrganizationId,
        RoleIds: user.Roles ? user.Roles.map((r: any) => r.Id) : [],
        Password: "",
      });
    }
  }, [userData, isSuccess, reset]);


  const onSubmit = async (data: any) => {
    try {
      if (Array.isArray(data.RoleIds) && data.RoleIds.length > 0 && typeof data.RoleIds[0] === 'object' && data.RoleIds[0].value) {
        data.RoleIds = data.RoleIds.map((r: any) => r.value);
      }

      if (isEditMode) {
        await updateUser({ ...data, AppUserId: userId }).unwrap();
        toaster.success(t("Form.Update"));
      } else {
        await addUser(data).unwrap();
        toaster.success(t("Form.Save"));
      }
      navigate("/admin/user");
    } catch (error) {
      toaster.error(t("Form.Save"));
    }
  };

  const roleOptions = roles.map((r: any) => ({ value: r.Id, label: r.Name }));

    return (
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ComponentCard title={isEditMode ? t("UserManagement.Form.EditTitle") : t("UserManagement.Form.AddTitle")}>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  type="text"
                  id="firstName"
                  labelName={t("UserManagement.Form.FirstName")}
                  placeholder={t("UserManagement.Form.FirstName.PlaceHolder")}
                  {...register("FirstName", { required: t("UserManagement.Form.FirstName.Required") })}
                  error={!!errors.FirstName}
                  errorMsg={errors.FirstName?.message as string}
                />
                <InputField
                  type="text"
                  id="lastName"
                  labelName={t("UserManagement.Form.LastName")}
                  placeholder={t("UserManagement.Form.LastName.PlaceHolder")}
                  {...register("LastName", { required: t("UserManagement.Form.LastName.Required") })}
                  error={!!errors.LastName}
                  errorMsg={errors.LastName?.message as string}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  type="email"
                  id="email"
                  labelName={t("UserManagement.Form.Email")}
                  placeholder={t("UserManagement.Form.Email.PlaceHolder")}
                  {...register("Email", { required: t("UserManagement.Form.Email.Required") })}
                  error={!!errors.Email}
                  errorMsg={errors.Email?.message as string}
                />
                <InputField
                  type="text"
                  id="userName"
                  labelName={t("UserManagement.Form.UserName")}
                  placeholder={t("UserManagement.Form.UserName.PlaceHolder")}
                  {...register("UserName", { required: t("UserManagement.Form.UserName.Required") })}
                  error={!!errors.UserName}
                  errorMsg={errors.UserName?.message as string}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  type="text"
                  id="phone"
                  labelName={t("UserManagement.Form.PhoneNumber")}
                  placeholder={t("UserManagement.Form.PhoneNumber.PlaceHolder")}
                  {...register("PhoneNumber", { required: t("UserManagement.Form.PhoneNumber.Required") })}
                  error={!!errors.PhoneNumber}
                  errorMsg={errors.PhoneNumber?.message as string}
                />
                <InputField
                  type="date"
                  id="dob"
                  labelName={t("UserManagement.Form.DateOfBirth")}
                  placeholder={t("UserManagement.Form.DateOfBirth.PlaceHolder")}
                  {...register("DOB")}
                  error={!!errors.DOB}
                  errorMsg={errors.DOB?.message as string}
                />
              </div>

              <InputField
                type="text"
                id="address"
                labelName={t("UserManagement.Form.Address")}
                placeholder={t("UserManagement.Form.Address.PlaceHolder")}
                {...register("Address")}
                error={!!errors.Address}
                errorMsg={errors.Address?.message as string}
              />

              <InputField
                type="text"
                id="gender"
                labelName={t("UserManagement.Form.Gender")}
                placeholder={t("UserManagement.Form.Gender.PlaceHolder")}
                {...register("Gender")}
                error={!!errors.Gender}
                errorMsg={errors.Gender?.message as string}
              />


              <div>
                <label className="mb-2.5 block text-black dark:text-white">{t("UserManagement.Form.Roles")}</label>
                <Controller
                  name="RoleIds"
                  control={control}
                  render={({ field }) => (
                    <CreatableSelect
                      isMulti
                      options={roleOptions}
                      value={roleOptions.filter((opt) => field.value?.includes(opt.value))}
                      onChange={(val: any) => setValue("RoleIds", val ? val.map((v: any) => v.value) : [])}
                      placeholder={t("UserManagement.Form.Roles.PlaceHolder")}
                      className="text-sm"
                    />
                  )}
                />
              </div>

              <InputField
                type="password"
                id="password"
                labelName={t("UserManagement.Form.Password")}
                placeholder={t("UserManagement.Form.Password.PlaceHolder")}
                {...register("Password", { 
                  required: isEditMode ? false : t("UserManagement.Form.Password.Required"),
                  minLength: { value: 6, message: t("UserManagement.Form.Password.MinLength") }
                })}
                error={!!errors.Password}
                errorMsg={errors.Password?.message as string}
              />
            </div>
          </ComponentCard>
        </form>
      </div>
    );
  };

export default FormUser;
