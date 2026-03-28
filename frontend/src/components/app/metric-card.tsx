import CountUp from "react-countup";
import type { ComponentType, SVGProps } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number; color?: string }>;

export const MetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  tone = "primary",
  suffix
}: {
  title: string;
  value: number;
  description: string;
  icon: IconType;
  tone?: "primary" | "secondary" | "success" | "warning";
  suffix?: string;
}) => {
  return (
    <Card className="frost-card-hover rounded-2xl shadow-card overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4 p-5 sm:p-6">
        <div className="space-y-1.5">
          <CardDescription className="text-xs uppercase tracking-[0.22em] text-muted-foreground/85">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-black tracking-tight">
            <CountUp
              end={value}
              duration={1.6}
              useEasing={true}
              formattingFn={(current) =>
                `${formatNumber(Math.round(current))}${suffix ? ` ${suffix}` : ""}`
              }
            />
          </CardTitle>
        </div>
        <Badge
          variant={tone === "warning" ? "warning" : tone === "success" ? "success" : tone === "secondary" ? "secondary" : "default"}
          className="h-10 w-10 shrink-0 items-center justify-center rounded-2xl p-0"
        >
          <Icon className="size-5" />
        </Badge>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
        <p className="text-sm font-medium text-muted-foreground/75 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
};
