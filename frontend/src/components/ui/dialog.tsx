import {
  Dialog as HeadlessDialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition
} from "@headlessui/react";
import { XClose } from "@untitledui/icons";
import { Fragment, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export const Dialog = ({
  open,
  onClose,
  children
}: {
  open: boolean;
  onClose: (value: boolean) => void;
  children: ReactNode;
}) => (
  <Transition appear show={open} as={Fragment}>
    <HeadlessDialog as="div" className="relative z-[120]" onClose={onClose}>
      {children}
    </HeadlessDialog>
  </Transition>
);

export const DialogContent = ({
  className,
  children,
  onClose,
  size = "lg"
}: {
  className?: string;
  children: ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]"
  };

  return (
    <>
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-[hsl(var(--foreground)/0.18)] backdrop-blur-md duration-200 data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto p-4 sm:p-6">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel
            transition
            className={cn(
              "relative w-full overflow-hidden rounded-[calc(var(--radius)+0.55rem)] border border-[hsl(var(--border)/0.62)] bg-[hsl(var(--card)/0.95)] shadow-card backdrop-blur-xl duration-200 data-[closed]:translate-y-4 data-[closed]:opacity-0",
              sizes[size],
              className
            )}
          >
            <button
              type="button"
              onClick={onClose}
              className="interactive-ring absolute end-4 top-4 rounded-full border border-[hsl(var(--border)/0.7)] bg-[hsl(var(--card)/0.9)] p-2 text-muted-foreground shadow-sm backdrop-blur"
            >
              <XClose className="size-4" />
            </button>
            {children}
          </DialogPanel>
        </div>
      </div>
    </>
  );
};

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("border-b border-border/70 px-6 py-5", className)} {...props} />
);

export const DialogTitleText = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <DialogTitle className={cn("pe-10 font-display text-2xl font-bold text-foreground", className)} {...props} />
);

export const DialogDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-2 text-sm text-muted-foreground", className)} {...props} />
);

export const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-5", className)} {...props} />
);

export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-wrap items-center justify-end gap-3 border-t border-border/70 px-6 py-4", className)}
    {...props}
  />
);
