import type { ReactNode } from "react";

export const SliderRow = ({
  icon,
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange
}: {
  icon: ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="rounded-2xl bg-primary/10 p-2">{icon}</span>
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {displayValue}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
    />
  </div>
);
