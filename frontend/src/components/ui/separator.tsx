import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Separator = ({
  className,
  orientation = "horizontal",
  ...props
}: HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) => (
  <div
    aria-hidden
    className={cn(
      "shrink-0 bg-border/80",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className
    )}
    {...props}
  />
);
