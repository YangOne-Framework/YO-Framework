import { useState } from "react";
import { useTranslation } from "react-i18next";
import ComponentCard from "../../common/ComponentCard";
import TextArea from "../input/TextArea";
import Label from "../Label";

export default function TextAreaInput() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [messageTwo, setMessageTwo] = useState("");
  return (
    <ComponentCard title={t("FormElements.TextArea.Title")}>
     <></>
    </ComponentCard>
  );
}
