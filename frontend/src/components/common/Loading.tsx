import { useTranslation } from "react-i18next";

import { Portal } from "./Portal";

export const Loading = () => {
  const { t } = useTranslation();

  return (
    <div className="flex h-full min-h-[16rem] items-center justify-center">
      <div className="frost-card flex min-w-[15rem] flex-col items-center gap-4 px-8 py-7 text-center">
        <div className="relative h-12 w-12">
          <span className="absolute inset-0 rounded-full bg-primary/15" />
          <span className="absolute inset-2 animate-ping rounded-full bg-secondary/45" />
          <span className="absolute inset-0 rounded-full border-4 border-primary/20 border-r-primary animate-spin" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{t("common.loading")}</p>
          <p className="text-sm text-muted-foreground">TajerPro UI Refresh</p>
        </div>
      </div>
    </div>
  );
};

export const LoadingOverlay = () => (
  <Portal>
    <div className="fixed inset-0 z-[130] bg-slate-950/20 backdrop-blur-sm">
      <Loading />
    </div>
  </Portal>
);

export const LoadingSpinner = ({
  size = "md"
}: {
  size?: "sm" | "md" | "lg";
}) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-[3px]"
  };

  return (
    <span
      className={`${sizes[size]} inline-flex animate-spin rounded-full border-primary/25 border-r-primary`}
    />
  );
};
