import { useTranslation } from "react-i18next";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import { EnvelopeIcon } from "../../../icons";
import PhoneInput from "../group-input/PhoneInput";

export default function InputGroup() {
  const { t } = useTranslation();
  const countries = [
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];
  const handlePhoneNumberChange = (phoneNumber: string) => {
    console.log("Updated phone number:", phoneNumber);
  };
  return (
    <ComponentCard title={t("FormElements.InputGroup.Title")}>
      <div className="space-y-6">
        <div>
          <Label>{t("FormElements.InputGroup.Email")}</Label>
          <div className="relative">
            <Input
              placeholder={t("FormElements.InputGroup.EmailPlaceholder")}
              type="text"
              className="pl-[62px]"
            />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <EnvelopeIcon className="size-6" />
            </span>
          </div>
        </div>
        <div>
          <Label>{t("FormElements.InputGroup.Phone")}</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            placeholder={t("FormElements.InputGroup.PhonePlaceholder")}
            onChange={handlePhoneNumberChange}
          />
        </div>{" "}
        <div>
          <Label>{t("FormElements.InputGroup.Phone")}</Label>
          <PhoneInput
            selectPosition="end"
            countries={countries}
            placeholder={t("FormElements.InputGroup.PhonePlaceholder")}
            onChange={handlePhoneNumberChange}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
