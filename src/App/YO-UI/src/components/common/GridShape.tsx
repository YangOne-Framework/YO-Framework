import { useTranslation } from "react-i18next";

export default function GridShape() {
  const { t } = useTranslation();
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
        <img src="/images/shape/grid-01.svg" alt={t("Common.GridAlt")} />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
        <img src="/images/shape/grid-01.svg" alt={t("Common.GridAlt")} />
      </div>
    </>
  );
}
