import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  const { t } = useTranslation();
  return (
    <>
       <PageMeta
         title={t("Auth.SignUp.Form.Title")}
         description={t("Auth.SignUp.Form.Subtitle")}
       />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
