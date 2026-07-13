import { useTranslation } from "react-i18next";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Avatar from "../../components/ui/avatar/Avatar";
import PageMeta from "../../components/common/PageMeta";

export default function Avatars() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t("UiElements.Avatars.PageTitle")}
        description={t("UiElements.Avatars.PageDescription")}
      />
      <PageBreadcrumb pageTitle={t("UiElements.Avatars.Title")} />
      <div className="space-y-5 sm:space-y-6">
        <ComponentCard title={t("UiElements.Avatars.DefaultAvatar")}>
          {/* Default Avatar (No Status) */}
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar src="/images/user/user-01.jpg" size="xsmall" />
            <Avatar src="/images/user/user-01.jpg" size="small" />
            <Avatar src="/images/user/user-01.jpg" size="medium" />
            <Avatar src="/images/user/user-01.jpg" size="large" />
            <Avatar src="/images/user/user-01.jpg" size="xlarge" />
            <Avatar src="/images/user/user-01.jpg" size="xxlarge" />
          </div>
        </ComponentCard>
        <ComponentCard title={t("UiElements.Avatars.AvatarWithOnline")}>
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              src="/images/user/user-01.jpg"
              size="xsmall"
              status="online"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="small"
              status="online"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="medium"
              status="online"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="large"
              status="online"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="xlarge"
              status="online"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="xxlarge"
              status="online"
            />
          </div>
        </ComponentCard>
        <ComponentCard title={t("UiElements.Avatars.AvatarWithOffline")}>
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              src="/images/user/user-01.jpg"
              size="xsmall"
              status="offline"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="small"
              status="offline"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="medium"
              status="offline"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="large"
              status="offline"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="xlarge"
              status="offline"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="xxlarge"
              status="offline"
            />
          </div>
        </ComponentCard>{" "}
        <ComponentCard title={t("UiElements.Avatars.AvatarWithBusy")}>
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Avatar
              src="/images/user/user-01.jpg"
              size="xsmall"
              status="busy"
            />
            <Avatar src="/images/user/user-01.jpg" size="small" status="busy" />
            <Avatar
              src="/images/user/user-01.jpg"
              size="medium"
              status="busy"
            />
            <Avatar src="/images/user/user-01.jpg" size="large" status="busy" />
            <Avatar
              src="/images/user/user-01.jpg"
              size="xlarge"
              status="busy"
            />
            <Avatar
              src="/images/user/user-01.jpg"
              size="xxlarge"
              status="busy"
            />
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
