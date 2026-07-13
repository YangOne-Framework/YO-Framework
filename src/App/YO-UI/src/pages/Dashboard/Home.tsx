import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta
        title={t('Dashboard.Title')}
        description=""
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-12">
            </div>

        <div className="col-span-12 xl:col-span-5">
     
        </div>
        
      </div>
    </>
  );
}
