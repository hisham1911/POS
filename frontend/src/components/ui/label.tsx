import type { LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn("mb-2 inline-flex text-sm font-semibold text-foreground", className)}
    {...props}
  />
);
