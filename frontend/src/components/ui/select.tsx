import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "@untitledui/icons";

import { cn } from "@/lib/utils";

export const Select = ({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="relative">
    <select
      className={cn(
        "interactive-ring h-11 w-full appearance-none rounded-2xl border border-border bg-background/80 px-4 pe-10 text-sm text-foreground shadow-sm transition focus:border-ring",
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
  </div>
);
