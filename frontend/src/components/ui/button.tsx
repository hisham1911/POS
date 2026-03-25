import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "glass";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-glow hover:bg-primary/90",
  secondary:
    "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90",
  outline:
    "border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.72)] text-foreground shadow-sm hover:bg-[hsl(var(--card)/0.94)]",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-[hsl(var(--muted)/0.7)] hover:text-foreground",
  danger:
    "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
  success:
    "bg-success text-success-foreground shadow-soft hover:bg-success/90",
  glass:
    "border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.78)] text-foreground shadow-soft backdrop-blur-md hover:bg-[hsl(var(--card)/0.92)]"
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-10 rounded-2xl px-3.5 text-sm",
  md: "h-11 rounded-2xl px-4 text-sm font-semibold",
  lg: "h-12 rounded-[1.35rem] px-5 text-base font-semibold",
  xl: "h-14 rounded-[1.55rem] px-6 text-base font-semibold",
  icon: "h-11 w-11 rounded-2xl"
};

export const Button = ({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "interactive-ring inline-flex items-center justify-center gap-2 whitespace-nowrap transition duration-200 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
          {children}
          {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </button>
  );
};
