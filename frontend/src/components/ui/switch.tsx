import { Switch as HeadlessSwitch } from "@headlessui/react";

import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  className?: string;
}

export const Switch = ({ checked, onCheckedChange, className }: SwitchProps) => (
  <HeadlessSwitch
    checked={checked}
    onChange={onCheckedChange}
    className={cn(
      "interactive-ring relative inline-flex h-7 w-12 items-center rounded-full border border-[hsl(var(--border)/0.66)] transition",
      checked ? "bg-primary" : "bg-[hsl(var(--muted)/0.88)]",
      className
    )}
  >
    <span
      className={cn(
        "inline-block h-5 w-5 transform rounded-full bg-[hsl(var(--card))] shadow-md transition",
        checked ? "translate-x-6 rtl:-translate-x-6" : "translate-x-1 rtl:-translate-x-1"
      )}
    />
  </HeadlessSwitch>
);
