import type { HTMLAttributes, ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Avatar = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-background shadow-soft",
      className
    )}
    {...props}
  />
);

export const AvatarImage = ({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
  <img className={cn("h-full w-full object-cover", className)} {...props} />
);

export const AvatarFallback = ({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("flex h-full w-full items-center justify-center bg-primary/10 text-sm font-bold text-primary", className)}
    {...props}
  />
);
