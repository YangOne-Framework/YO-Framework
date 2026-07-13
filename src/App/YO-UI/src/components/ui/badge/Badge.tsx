import React from "react";

type BadgeVariant = "light" | "solid" | "outline" | "destructive" | "secondary";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<string, string> = {
  light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80",
  solid: "bg-brand-500 text-white dark:text-white",
  outline: "border border-slate-300 text-slate-700 bg-transparent dark:border-gray-600 dark:text-slate-300",
  destructive: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  secondary: "bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300",
};

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color,
  size = "md",
  startIcon,
  endIcon,
  children,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium";

  const sizeStyles: Record<string, string> = {
    sm: "text-theme-xs",
    md: "text-sm",
  };

  const vStyle = variantStyles[variant] || variantStyles.light;
  const sizeClass = sizeStyles[size] || sizeStyles.md;

  return (
    <span className={`${baseStyles} ${sizeClass} ${vStyle} ${className}`}>
      {startIcon && <span className="mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-1">{endIcon}</span>}
    </span>
  );
};

export default Badge;
