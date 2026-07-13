import { useTranslation } from "react-i18next";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Alert from "../../components/ui/alert/Alert";
import PageMeta from "../../components/common/PageMeta";

export default function Alerts() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t('Alerts.Title')}
        description={t('Alerts.Title')}
      />
      <PageBreadcrumb pageTitle={t('Alerts.Title')} />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title={t('Alerts.Success')}>
          <Alert
            variant="success"
            title={t('Alerts.SuccessMessage')}
            message={t('Alerts.BeCautious')}
            showLink={true}
            linkHref="/"
            linkText={t('Alerts.LearnMore')}
          />
          <Alert
            variant="success"
            title={t('Alerts.SuccessMessage')}
            message={t('Alerts.BeCautious')}
            showLink={false}
          />
        </ComponentCard>
        <ComponentCard title={t('Alerts.Warning')}>
          <Alert
            variant="warning"
            title={t('Alerts.WarningMessage')}
            message={t('Alerts.BeCautious')}
            showLink={true}
            linkHref="/"
            linkText={t('Alerts.LearnMore')}
          />
          <Alert
            variant="warning"
            title={t('Alerts.WarningMessage')}
            message={t('Alerts.BeCautious')}
            showLink={false}
          />
        </ComponentCard>{" "}
        <ComponentCard title={t('Alerts.Error')}>
          <Alert
            variant="error"
            title={t('Alerts.ErrorMessage')}
            message={t('Alerts.BeCautious')}
            showLink={true}
            linkHref="/"
            linkText={t('Alerts.LearnMore')}
          />
          <Alert
            variant="error"
            title={t('Alerts.ErrorMessage')}
            message={t('Alerts.BeCautious')}
            showLink={false}
          />
        </ComponentCard>{" "}
        <ComponentCard title={t('Alerts.Info')}>
          <Alert
            variant="info"
            title={t('Alerts.InfoMessage')}
            message={t('Alerts.BeCautious')}
            showLink={true}
            linkHref="/"
            linkText={t('Alerts.LearnMore')}
          />
          <Alert
            variant="info"
            title={t('Alerts.InfoMessage')}
            message={t('Alerts.BeCautious')}
            showLink={false}
          />
        </ComponentCard>
      </div>
    </>
  );
}
