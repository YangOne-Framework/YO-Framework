import React, { forwardRef } from "react";
import CreatableSelect from "react-select/creatable";
import { ActionMeta, OnChangeValue, StylesConfig } from "react-select";
import { FaAngleDown } from "react-icons/fa6";
import { useTranslation } from "react-i18next";

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  labelText?: string;
  isRequired?: boolean;
  error?: string;
  options?: Option[];
  placeholder?: string;
  value?: Option | null;
  onChange?: (newValue: Option | null) => void;
  onCreateOption?: (inputValue: string) => void;
  isDisabled?: boolean;
}

const SelectCreatable = forwardRef<any, SelectProps>(
  (
    {
      labelText,
      isRequired = false,
      error,
      options = [],
      placeholder,
      value,
      onChange,
      onCreateOption,
      isDisabled = false,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const resolvedPlaceholder = placeholder || t("Common.Select");
    const customStyles: StylesConfig<Option> = {
      control: (base, { isFocused }) => ({
        ...base,
        minHeight: "38px",
        borderColor: error ? "#ef4444" : isFocused ? "#3b82f6" : "#d1d5db",
        boxShadow: isFocused && !error ? "      0 0 0 1px #3b82f6" : "none",
        "&:hover": {
          borderColor: error ? "#ef4444" : "#9ca3af",
        },
        backgroundColor: isDisabled ? "#f1f5f9" : "#fff",
      }),
      indicatorSeparator: () => ({ display: "none" }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "#9ca3af",
        padding: "4px 8px",
        "&:hover": {
          color: "#9ca3af",
        },
      }),
      placeholder: (base) => ({
        ...base,
        color: "#64748b",
      }),
      option: (base, { isSelected }) => ({
        ...base,
        backgroundColor: isSelected ? "#3b82f6" : "#fff",
        "&:hover": {
          backgroundColor: isSelected ? "#3b82f6" : "#f3f4f6",
        },
      }),
    };

    const handleChange = (
      newValue: OnChangeValue<Option, false>,
      actionMeta: ActionMeta<Option>
    ) => {
      if (onChange) onChange(newValue);
    };

    return (
      <div className="w-full group">
        {labelText && (
          <label className="block text-base mb-2">
            {labelText}
            {isRequired && <span className="text-red-500"> *</span>}
          </label>
        )}
        <div className="relative w-full">
          <CreatableSelect
            ref={ref}
            isDisabled={isDisabled}
            options={options}
            value={value}
            onChange={handleChange}
            onCreateOption={onCreateOption}
            placeholder={resolvedPlaceholder}
            styles={customStyles}
            components={{
              DropdownIndicator: () => (
                <div className="h-full flex items-center pr-3">
                  <FaAngleDown size={18} />
                </div>
              ),
            }}
            classNames={{
              control: () => "!border !rounded !text-slate-500 !min-h-[38px]",
              input: () => "!py-1",
              singleValue: () => "!text-slate-700",
            }}
          />
        </div>
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
      </div>
    );
  }
);

SelectCreatable.displayName = "SelectCreatable";

export default SelectCreatable;
