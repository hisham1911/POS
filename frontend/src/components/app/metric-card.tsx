import CountUp from "react-countup";
import type { ComponentType, SVGProps } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppPreferences } from "@/hooks/useAppPreferences";
import { cn } from "@/lib/utils";

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
  const { preferences } = useAppPreferences();
  const locale =
    preferences.language === "ar" && preferences.useArabicNumerals
      ? "ar-EG-u-nu-arab"
      : preferences.language === "ar"
        ? "ar-EG"
        : "en-US";

  return (
    <Card className="frost-card-hover overflow-hidden">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardDescription className="text-xs uppercase tracking-[0.22em]">
            {title}
          </CardDescription>
          <CardTitle className="mt-2 text-3xl font-black">
            <CountUp
              end={value}
              duration={1.2}
              formattingFn={(current) =>
                `${new Intl.NumberFormat(locale, {
                  maximumFractionDigits: 0
                }).format(current)}${suffix ? ` ${suffix}` : ""}`
              }
            />
          </CardTitle>
        </div>
        <Badge
          variant={tone === "warning" ? "warning" : tone === "success" ? "success" : tone === "secondary" ? "secondary" : "default"}
          className={cn("rounded-2xl px-2.5 py-2")}
        >
          <Icon className="size-4" />
        </Badge>
      </CardHeader>
      <CardContent className="pt-1">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
