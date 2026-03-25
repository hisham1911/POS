import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/12 text-primary border-primary/20",
  secondary: "bg-secondary/15 text-secondary-foreground border-secondary/22",
  success: "bg-success/14 text-success border-success/20",
  warning: "bg-warning/16 text-warning-foreground border-warning/26",
  outline: "bg-[hsl(var(--card)/0.74)] text-foreground border-[hsl(var(--border)/0.7)] shadow-sm"
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
