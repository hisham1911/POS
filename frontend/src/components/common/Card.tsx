import type { HTMLAttributes, ReactNode } from "react";

import { Card as UICard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-7"
};

export const Card = ({
  children,
  className,
  hover = false,
  padding = "md",
  ...props
}: CardProps) => (
  <UICard
    className={cn(
      paddings[padding],
      hover && "frost-card-hover",
      className
    )}
    {...props}
  >
    {children}
  </UICard>
);
