import { useTranslation } from "react-i18next";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { BoxIcon } from "../../icons";

export default function Buttons() {
  const { t } = useTranslation();
  return (
    <div>
      <PageMeta
        title={t("UiElements.Buttons.PageTitle")}
        description={t("UiElements.Buttons.PageDescription")}
      />
      <PageBreadcrumb pageTitle={t("UiElements.Buttons.Title")} />
      <div className="space-y-5 sm:space-y-6">
        {/* Primary Button */}
        <ComponentCard title={t("UiElements.Buttons.PrimaryButton")}>
          <div className="flex items-center gap-5">
            <Button size="sm" variant="primary">
              {t("UiElements.Buttons.ButtonText")}
            </Button>
            <Button size="md" variant="primary">
              {t("UiElements.Buttons.ButtonText")}
            </Button>
          </div>
        </ComponentCard>
        {/* Primary Button with Start Icon */}
        <ComponentCard title={t("UiElements.Buttons.PrimaryButtonLeftIcon")}>
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              variant="primary"
              startIcon={<BoxIcon className="size-5" />}
            >
              {t("UiElements.Buttons.ButtonText")}
            </Button>
            <Button
              size="md"
              variant="primary"
              startIcon={<BoxIcon className="size-5" />}
            >
              {t("UiElements.Buttons.ButtonText")}
            </Button>
          </div>
        </ComponentCard>
        {/* Primary Button with Start Icon */}
        <ComponentCard title={t("UiElements.Buttons.PrimaryButtonRightIcon")}>
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              variant="primary"
              endIcon={<BoxIcon className="size-5" />}
            >
              {t("UiElements.Buttons.ButtonText")}
            </Button>
            <Button
              size="md"
              variant="primary"
              endIcon={<BoxIcon className="size-5" />}
            >
              {t("UiElements.Buttons.ButtonText")}
            </Button>
          </div>
        </ComponentCard>
        {/* Outline Button */}
        <ComponentCard title={t("UiElements.Buttons.SecondaryButton")}>
          <div className="flex items-center gap-5">
            {/* Outline Button */}
            <Button size="sm" variant="outline">
              {t("UiElements.Buttons.ButtonText")}
            </Button>
            <Button size="md" variant="outline">
              {t("UiElements.Buttons.ButtonText")}
            </Button>
          </div>
        </ComponentCard>
        {/* Outline Button with Start Icon */}
        <ComponentCard title={t("UiElements.Buttons.OutlineButtonLeftIcon")}>
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              variant="outline"
              startIcon={<BoxIcon className="size-5" />}
            >
              {t("UiElements.Buttons.ButtonText")}
            </Button>
            <Button
              size="md"
              variant="outline"
              startIcon={<BoxIcon className="size-5" />}
            >
              {t("UiElements.Buttons.ButtonText")}
            </Button>
          </div>
        </ComponentCard>{" "}
        {/* Outline Button with Start Icon */}
        <ComponentCard title={t("UiElements.Buttons.OutlineButtonRightIcon")}>
          <div className="flex items-center gap-5">
            <Button
              size="sm"
              variant="outline"
              endIcon={<BoxIcon className="size-5" />}
            >
              {t("UiElements.Buttons.ButtonText")}
            </Button>
            <Button
              size="md"
              variant="outline"
              endIcon={<BoxIcon className="size-5" />}
            >
              {t("UiElements.Buttons.ButtonText")}
            </Button>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
