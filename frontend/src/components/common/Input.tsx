import { forwardRef, type InputHTMLAttributes } from "react";

import { Input as UIInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name ?? label ?? "field";

    return (
      <div className="w-full">
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}
        <UIInput
          ref={ref}
          id={inputId}
          className={cn(error && "border-destructive focus:border-destructive", className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {hint && !error ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
        {error ? <p className="mt-2 text-xs font-medium text-destructive">{error}</p> : null}
      </div>
    );
  }
);

Input.displayName = "Input";
