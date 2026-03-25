import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/12 text-primary border-primary/15",
  secondary: "bg-secondary/18 text-secondary-foreground border-secondary/20",
  success: "bg-success/14 text-success border-success/20",
  warning: "bg-warning/18 text-warning-foreground border-warning/24",
  outline: "bg-white/60 text-foreground border-border"
};

export const Badge = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
}) => {
  const variant = (props as any).variant ?? "default";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};
