import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-shimmer rounded-2xl bg-[linear-gradient(110deg,rgba(255,255,255,0.18),rgba(255,255,255,0.52),rgba(255,255,255,0.18))] bg-[length:220%_100%]",
      className
    )}
    {...props}
  />
);
