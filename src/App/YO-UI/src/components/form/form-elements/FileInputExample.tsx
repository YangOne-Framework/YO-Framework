import { useTranslation } from "react-i18next";
import ComponentCard from "../../common/ComponentCard";
import FileInput from "../input/FileInput";
import Label from "../Label";

export default function FileInputExample() {
  const { t } = useTranslation();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  return (
    <ComponentCard title={t("FormElements.FileInput.Title")}>
      <div>
        <Label>{t("FormElements.FileInput.UploadFile")}</Label>
        <FileInput onChange={handleFileChange} className="custom-class" />
      </div>
    </ComponentCard>
  );
}
