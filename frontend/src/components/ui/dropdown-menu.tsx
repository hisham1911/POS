import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems
} from "@headlessui/react";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const DropdownMenu = ({ children }: { children: ReactNode }) => <Menu as="div" className="relative">{children}</Menu>;

export const DropdownMenuTrigger = ({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <MenuButton
    className={cn("interactive-ring rounded-2xl", className)}
    {...props}
  >
    {children}
  </MenuButton>
);

export const DropdownMenuContent = ({
  className,
  anchor = "bottom end",
  children
}: {
  className?: string;
  anchor?: "bottom end" | "bottom start";
  children: ReactNode;
}) => (
  <MenuItems
    anchor={anchor}
    className={cn(
      "z-[140] mt-3 min-w-56 rounded-[1.35rem] border border-[hsl(var(--border)/0.66)] bg-[hsl(var(--card)/0.96)] p-2 shadow-card backdrop-blur-xl outline-none",
      className
    )}
  >
    {children}
  </MenuItems>
);

export const DropdownMenuItem = ({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  as?: "button" | "div";
}) => (
  <MenuItem>
    {({ focus }) => (
      <button
        type="button"
        className={cn(
          "interactive-ring flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground transition",
          focus && "bg-[hsl(var(--background)/0.82)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )}
  </MenuItem>
);

export const DropdownMenuSeparator = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("my-2 h-px bg-[hsl(var(--border)/0.7)]", className)} {...props} />
);
