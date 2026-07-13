import React from "react";

interface TextareaProps {
  placeholder?: string; // Placeholder text
  rows?: number; // Number of rows
  value?: string; // Current value
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Change handler
  className?: string; // Additional CSS classes
  disabled?: boolean; // Disabled state
  error?: boolean; // Error state
  hint?: string; // Hint text to display  
  errorMsg?: string;
  labelName?:string;
  [x: string]: any;
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message", // Default placeholder
  rows = 3, // Default number of rows
  value = "", // Default value
  onChange, // Callback for changes
  className = "", // Additional custom styles
  disabled = false, // Disabled state
  error = false, // Error state
  hint = "", // Default hint text
  errorMsg,
  labelName,
    ...rest

}) => {
  // const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   if (onChange) {
  //     onChange(e.target.value);
  //   }
  // };

  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className} `;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed opacity40 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  }
  else if (error) {
    textareaClasses += `  border-red-500 focus:border-red-500 focus:ring-red-500`;
  }
  else {
    textareaClasses += ` bg-transparent text-gray-900 dark:text-gray-300 text-gray-900 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-brand-800`;
  }

  return (
    <div className="relative">
      <div className="w-full px-2.5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {labelName}
        </label>
        <textarea

          placeholder={placeholder}
          rows={rows}
          defaultValue={value}
          onChange={onChange&&onChange}
          disabled={disabled}
          className={textareaClasses}
          {...rest}
        />
        {hint && (
          <p
            className={`mt-1.5 text-xs text-gray-500 dark:text-gray-400`}
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

export default TextArea;
