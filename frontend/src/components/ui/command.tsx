import type { HTMLAttributes, InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Command = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "overflow-hidden rounded-[calc(var(--radius)+0.25rem)] border border-white/45 bg-card/95 shadow-card backdrop-blur-xl",
      className
    )}
    {...props}
  />
);

export const CommandInput = ({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={cn(
      "h-12 w-full border-b border-border/70 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground/70",
      className
    )}
    {...props}
  />
);

export const CommandList = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("max-h-[22rem] overflow-auto p-2", className)} {...props} />
);

export const CommandGroup = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-1 p-1", className)} {...props} />
);

export const CommandItem = ({ className, ...props }: HTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    className={cn(
      "interactive-ring flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start text-sm font-medium text-foreground transition hover:bg-background/80",
      className
    )}
    {...props}
  />
);

export const CommandEmpty = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("px-4 py-8 text-center text-sm text-muted-foreground", className)} {...props} />
);
