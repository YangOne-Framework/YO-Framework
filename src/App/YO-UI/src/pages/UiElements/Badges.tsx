import { useTranslation } from "react-i18next";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import { PlusIcon } from "../../icons";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";

export default function Badges() {
  const { t } = useTranslation();
  return (
    <div>
      <PageMeta
        title={t("UiElements.Badges.PageTitle")}
        description={t("UiElements.Badges.PageDescription")}
      />
      <PageBreadcrumb pageTitle={t("UiElements.Badges.Title")} />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title={t("UiElements.Badges.WithLightBackground")}>
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            {/* Light Variant */}
            <Badge variant="light" color="primary">
              {t("UiElements.Badges.Primary")}
            </Badge>
            <Badge variant="light" color="success">
              {t("UiElements.Badges.Success")}
            </Badge>{" "}
            <Badge variant="light" color="error">
              {t("UiElements.Badges.Error")}
            </Badge>{" "}
            <Badge variant="light" color="warning">
              {t("UiElements.Badges.Warning")}
            </Badge>{" "}
            <Badge variant="light" color="info">
              {t("UiElements.Badges.Info")}
            </Badge>
            <Badge variant="light" color="light">
              {t("UiElements.Badges.Light")}
            </Badge>
            <Badge variant="light" color="dark">
              {t("UiElements.Badges.Dark")}
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title={t("UiElements.Badges.WithSolidBackground")}>
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            {/* Light Variant */}
            <Badge variant="solid" color="primary">
              {t("UiElements.Badges.Primary")}
            </Badge>
            <Badge variant="solid" color="success">
              {t("UiElements.Badges.Success")}
            </Badge>{" "}
            <Badge variant="solid" color="error">
              {t("UiElements.Badges.Error")}
            </Badge>{" "}
            <Badge variant="solid" color="warning">
              {t("UiElements.Badges.Warning")}
            </Badge>{" "}
            <Badge variant="solid" color="info">
              {t("UiElements.Badges.Info")}
            </Badge>
            <Badge variant="solid" color="light">
              {t("UiElements.Badges.Light")}
            </Badge>
            <Badge variant="solid" color="dark">
              {t("UiElements.Badges.Dark")}
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title={t("UiElements.Badges.LightBackgroundLeftIcon")}>
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="light" color="primary" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Primary")}
            </Badge>
            <Badge variant="light" color="success" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Success")}
            </Badge>{" "}
            <Badge variant="light" color="error" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Error")}
            </Badge>{" "}
            <Badge variant="light" color="warning" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Warning")}
            </Badge>{" "}
            <Badge variant="light" color="info" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Info")}
            </Badge>
            <Badge variant="light" color="light" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Light")}
            </Badge>
            <Badge variant="light" color="dark" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Dark")}
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title={t("UiElements.Badges.SolidBackgroundLeftIcon")}>
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="solid" color="primary" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Primary")}
            </Badge>
            <Badge variant="solid" color="success" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Success")}
            </Badge>{" "}
            <Badge variant="solid" color="error" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Error")}
            </Badge>{" "}
            <Badge variant="solid" color="warning" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Warning")}
            </Badge>{" "}
            <Badge variant="solid" color="info" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Info")}
            </Badge>
            <Badge variant="solid" color="light" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Light")}
            </Badge>
            <Badge variant="solid" color="dark" startIcon={<PlusIcon />}>
              {t("UiElements.Badges.Dark")}
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title={t("UiElements.Badges.LightBackgroundRightIcon")}>
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="light" color="primary" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Primary")}
            </Badge>
            <Badge variant="light" color="success" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Success")}
            </Badge>{" "}
            <Badge variant="light" color="error" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Error")}
            </Badge>{" "}
            <Badge variant="light" color="warning" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Warning")}
            </Badge>{" "}
            <Badge variant="light" color="info" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Info")}
            </Badge>
            <Badge variant="light" color="light" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Light")}
            </Badge>
            <Badge variant="light" color="dark" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Dark")}
            </Badge>
          </div>
        </ComponentCard>
        <ComponentCard title={t("UiElements.Badges.SolidBackgroundRightIcon")}>
          <div className="flex flex-wrap gap-4 sm:items-center sm:justify-center">
            <Badge variant="solid" color="primary" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Primary")}
            </Badge>
            <Badge variant="solid" color="success" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Success")}
            </Badge>{" "}
            <Badge variant="solid" color="error" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Error")}
            </Badge>{" "}
            <Badge variant="solid" color="warning" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Warning")}
            </Badge>{" "}
            <Badge variant="solid" color="info" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Info")}
            </Badge>
            <Badge variant="solid" color="light" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Light")}
            </Badge>
            <Badge variant="solid" color="dark" endIcon={<PlusIcon />}>
              {t("UiElements.Badges.Dark")}
            </Badge>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
