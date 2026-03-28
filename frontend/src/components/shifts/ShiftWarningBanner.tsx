import { AlertTriangle, Clock, XCircle } from "@untitledui/icons";
import { ShiftWarning } from "@/types/shift.types";
import clsx from "clsx";

interface ShiftWarningBannerProps {
  warning: ShiftWarning;
  onClose?: () => void;
}

export const ShiftWarningBanner = ({ warning, onClose }: ShiftWarningBannerProps) => {
  if (!warning.shouldWarn) return null;

  const isCritical = warning.level === "Critical";
  const hoursText = Math.floor(warning.hoursOpen);
  const minutesText = Math.floor((warning.hoursOpen - hoursText) * 60);

  return (
    <div
      className={clsx(
        "mb-6 rounded-2xl border p-4 shadow-sm",
        isCritical
          ? "feedback-panel border-danger/35"
          : "feedback-panel border-warning/35"
      )}
      data-tone={isCritical ? "danger" : "warning"}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
            isCritical ? "bg-danger/12 text-danger" : "bg-warning/12 text-warning"
          )}
        >
          {isCritical ? (
            <XCircle className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={clsx(
                "font-bold text-lg",
                isCritical ? "text-danger" : "text-warning"
              )}
            >
              {isCritical ? "🚨 تحذير شديد" : "⚠️ تحذير"}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {hoursText} ساعة و {minutesText} دقيقة
              </span>
            </div>
          </div>

          <p
            className={clsx(
              "text-sm leading-relaxed",
              isCritical ? "text-danger" : "text-warning"
            )}
          >
            {warning.message}
          </p>

          {isCritical && (
            <div className="feedback-panel mt-3" data-tone="danger">
              <p className="text-sm font-medium text-foreground">
                ⚡ يُرجى إغلاق الوردية الحالية وفتح وردية جديدة في أقرب وقت ممكن
                للحفاظ على دقة السجلات المالية.
              </p>
            </div>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={clsx(
              "rounded-lg p-1 transition-colors",
              isCritical
                ? "text-danger hover:bg-danger/10"
                : "text-warning hover:bg-warning/10"
            )}
            aria-label="إغلاق التحذير"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
