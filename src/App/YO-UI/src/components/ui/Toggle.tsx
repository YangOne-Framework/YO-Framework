import React, { useState } from "react";

interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  readOnly?: boolean;
  bg?: "primary" | "secondary";
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  readOnly = false,
  bg = "primary",
}) => {
  const handleToggle = () => {
    if (readOnly) return;
    onChange?.(!checked);
  };
  return (
    <label //className="inline-flex items-center cursor-pointer"
      className={`inline-flex items-center cursor-pointer ${
        readOnly ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <input
        readOnly={readOnly}
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
        className="hidden"
      />
      <span
        className={`w-10 h-5 rounded-full relative transition-colors duration-200 inline-block ${
          checked
            ? `${bg === "primary" ? "bg-primary" : "bg-secondary"}`
            : "bg-base-light-v2"
        }`}
      >
        <span
          className={`absolute top-0.5 transition-all duration-200 w-4 h-4 bg-white rounded-full shadow ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </span>
      {label && <span className="ml-2">{label}</span>}
    </label>
  );
};

export default Toggle;
