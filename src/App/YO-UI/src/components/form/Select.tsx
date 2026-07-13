import { useState } from "react";
import { useTranslation } from "react-i18next";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  defaultValue?: string;
  error?: boolean; // Error state
  errorMsg?: string;
  labelName?: string;
  [x: string]: any;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder,
  onChange,
  className = "",
  defaultValue = "",
  error = false,
  errorMsg = '',
  labelName = '',
  ...rest

}) => {
  const { t } = useTranslation();
  const resolvedPlaceholder = placeholder || t("Common.SelectAnOption");
  // Manage the selected value
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);


  let selectClasses = `h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-brand-800 ${className} `;

  if (error) {
    selectClasses += `  border-red-500 focus:border-red-500 focus:ring-red-500`;
  }
  else {
    selectClasses += ` bg-transparent text-gray-900 dark:text-gray-300 text-gray-900 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }
  return (
    <div className="relative">
      <div className="w-full px-2.5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {labelName}
        </label>
        <select
          className={selectClasses + `${selectedValue
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
            } ${className}`}
          defaultValue={selectedValue}
          onChange={onChange}
          {...rest}
        >
          {/* Placeholder option */}
          <option
            value="0"
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {resolvedPlaceholder}
          </option>
          {/* Map over options */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
            >
              {option.label}
            </option>
          ))}
        </select>
        {error == true && (
          <p
            className={`text-theme-xs text-error-500 mt-1.5`}
          >
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
};

export default Select;
