import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { useTranslation } from "react-i18next";

export default function SignIn() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t('Auth.SignIn.Title')}
        description={t('Auth.SignIn.Subtitle')}
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
