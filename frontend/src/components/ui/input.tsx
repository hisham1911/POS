import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "interactive-ring h-11 w-full rounded-2xl border border-border bg-background/80 px-4 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground/80 focus:border-ring focus:bg-background",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
