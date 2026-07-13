import { useState } from "react";
import { useTranslation } from "react-i18next";
import ComponentCard from "../../common/ComponentCard";
import Radio from "../input/Radio";

export default function RadioButtons() {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<string>("option2");

  const handleRadioChange = (value: string) => {
    setSelectedValue(value);
  };
  return (
    <ComponentCard title={t("FormElements.RadioButtons.Title")}>
      <div className="flex flex-wrap items-center gap-8">
        <Radio
          id="radio1"
          name="group1"
          value="option1"
          checked={selectedValue === "option1"}
          onChange={handleRadioChange}
          label={t("FormElements.RadioButtons.Default")}
        />
        <Radio
          id="radio2"
          name="group1"
          value="option2"
          checked={selectedValue === "option2"}
          onChange={handleRadioChange}
          label={t("FormElements.RadioButtons.Selected")}
        />
        <Radio
          id="radio3"
          name="group1"
          value="option3"
          checked={selectedValue === "option3"}
          onChange={handleRadioChange}
          label={t("FormElements.RadioButtons.Disabled")}
          disabled={true}
        />
      </div>
    </ComponentCard>
  );
}
