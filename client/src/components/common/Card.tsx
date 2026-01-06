import { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

export const Card = ({
  children,
  className,
  hover = false,
  padding = "md",
  onClick,
}: CardProps) => {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-xl shadow-sm border border-gray-100",
        hover && "hover:shadow-md hover:border-primary-200 transition-all duration-200 cursor-pointer",
        paddings[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
