import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return (
    <input
      className={`h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-1 focus:ring-red-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-red-400 dark:focus:ring-red-800 ${className}`}
      {...props}
    />
  );
};

export default Input;
