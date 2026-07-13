import type React from "react";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  className?: string;
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
   name?: string;
  [x: string]: any;  // Allow other props
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  id = `cb_${Math.random()}`,
  onChange,
  className = "",
  disabled = false,
  name,
  ...rest
}) => {
  return (
    <>
      <div className="w-full px-2.5 ">
        <input
          id={id}
          type="checkbox"
          className={`w-4 h-4 mr-2 ${className}`}
          name={name}
          defaultChecked={checked}
          onChange={onChange}
          disabled={disabled}
          {...rest}
        />
        <label htmlFor={id}
          className={`mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400 cursor-pointer ${disabled ? "cursor-not-allowed opacity-60" : ""
            }`}
        >
          {label}
        </label>
      </div>
    </>

  );
};

export default Checkbox;