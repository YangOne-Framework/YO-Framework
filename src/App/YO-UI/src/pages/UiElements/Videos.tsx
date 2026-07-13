import { useTranslation } from "react-i18next";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import FourIsToThree from "../../components/ui/videos/FourIsToThree";
import OneIsToOne from "../../components/ui/videos/OneIsToOne";
import SixteenIsToNine from "../../components/ui/videos/SixteenIsToNine";
import TwentyOneIsToNine from "../../components/ui/videos/TwentyOneIsToNine";

export default function Videos() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("UiElements.Videos.PageTitle")}
        description={t("UiElements.Videos.PageDescription")}
      />
      <PageBreadcrumb pageTitle={t("UiElements.Videos.Title")} />
      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title={t("UiElements.Videos.VideoRatio16_9")}>
            <SixteenIsToNine />
          </ComponentCard>
          <ComponentCard title={t("UiElements.Videos.VideoRatio4_3")}>
            <FourIsToThree />
          </ComponentCard>
        </div>
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard title={t("UiElements.Videos.VideoRatio21_9")}>
            <TwentyOneIsToNine />
          </ComponentCard>
          <ComponentCard title={t("UiElements.Videos.VideoRatio1_1")}>
            <OneIsToOne />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
