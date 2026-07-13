import type React from "react";
import type { FC } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  labelName?: string;
  //min?: number;
  //max?: number;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  errorMsg?: string;
  hint?: string;
  isRequired?: boolean;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  labelName,
  //min,
  //max,
  step,
  disabled = false,
  success = false,
  error = false,
  errorMsg,
  hint,
  isRequired,
  ...rest
}) => {
  let inputClasses = ` shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight 
      focus:outline-none focus:shadow-outline ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:placeholder:text-gray-500 dark:border-gray-700 opacity-40`;
  } else if (error) {
    inputClasses += `  border-red-500 focus:border-red-500 focus:ring-red-500`;
  } else if (success) {
    inputClasses += `  border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <div className="w-full px-2.5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {labelName}
        </label>
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange&&onChange}
          // min={min}
          //max={max}
          step={step}
          disabled={disabled}
          className={inputClasses}
          {...rest}
        />

        {hint && (
          <p
            className={`mt-1.5 text-xs ${success? "text-success-500": "text-gray-500"}`}
          >
            {hint}
          </p>
        )}
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

export default Input;
