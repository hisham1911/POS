import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const ScrollArea = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("overflow-auto", className)} {...props} />
);
