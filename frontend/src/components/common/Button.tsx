import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button as UIButton, type ButtonProps as UIButtonProps } from "@/components/ui/button";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UIButtonProps["variant"];
  size?: UIButtonProps["size"];
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
  ...props
}: ButtonProps) => {
  const { t } = useTranslation();

  return (
    <UIButton
      variant={variant}
      size={size}
      isLoading={isLoading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && typeof children === "string" ? t("common.loading") : children}
    </UIButton>
  );
};
