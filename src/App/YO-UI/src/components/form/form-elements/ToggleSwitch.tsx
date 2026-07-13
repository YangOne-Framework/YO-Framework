import { useTranslation } from "react-i18next";
import ComponentCard from "../../common/ComponentCard";
import Switch from "../switch/Switch";

export default function ToggleSwitch() {
  const { t } = useTranslation();
  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch is now:", checked ? "ON" : "OFF");
  };
  return (
    <ComponentCard title={t("FormElements.ToggleSwitch.Title")}>
      <div className="flex gap-4">
        <Switch
          label={t("FormElements.ToggleSwitch.Default")}
          defaultChecked={true}
          onChange={handleSwitchChange}
        />
        <Switch
          label={t("FormElements.ToggleSwitch.Checked")}
          defaultChecked={true}
          onChange={handleSwitchChange}
        />
        <Switch label={t("FormElements.ToggleSwitch.Disabled")} disabled={true} />
      </div>{" "}
      <div className="flex gap-4">
        <Switch
          label={t("FormElements.ToggleSwitch.Default")}
          defaultChecked={true}
          onChange={handleSwitchChange}
          color="gray"
        />
        <Switch
          label={t("FormElements.ToggleSwitch.Checked")}
          defaultChecked={true}
          onChange={handleSwitchChange}
          color="gray"
        />
        <Switch label={t("FormElements.ToggleSwitch.Disabled")} disabled={true} color="gray" />
      </div>
    </ComponentCard>
  );
}
