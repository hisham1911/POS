import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
    success: "bg-success-500 hover:bg-success-600 text-white focus:ring-success-500",
    danger: "bg-danger-500 hover:bg-danger-600 text-white focus:ring-danger-500",
    outline: "border-2 border-gray-300 hover:bg-gray-100 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg",
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>جاري التحميل...</span>
        </>
      ) : (
        <>
          {rightIcon && <span>{rightIcon}</span>}
          {children}
          {leftIcon && <span>{leftIcon}</span>}
        </>
      )}
    </button>
  );
};
