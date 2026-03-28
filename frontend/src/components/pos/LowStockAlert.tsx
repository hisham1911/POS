import { AlertTriangle, X } from "lucide-react";
import { useGetLowStockProductsQuery } from "@/api/inventoryApi";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { formatNumber } from "@/utils/formatters";

export const LowStockAlert = () => {
  const [dismissed, setDismissed] = useState(false);
  const user = useAppSelector(selectCurrentUser);

  // Only show for Admin or SystemOwner
  const canViewAlert = user?.role === "Admin" || user?.role === "SystemOwner";

  const { data } = useGetLowStockProductsQuery(undefined, {
    skip: !canViewAlert,
    pollingInterval: 60000, // Refresh every minute
  });

  // Don't show if not authorized, no data, or dismissed
  if (!canViewAlert || dismissed || !data || data.length === 0) {
    return null;
  }

  const lowStockCount = data.length;

  return (
    <div className="feedback-panel mb-4 flex items-center justify-between gap-3 animate-fade-in" data-tone="warning">
      <div className="flex items-center gap-2 text-warning">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium">
          ⚠️ تنبيه: <span className="font-numeric">{formatNumber(lowStockCount)}</span> منتج{lowStockCount > 1 ? "ات" : ""} مخزونها
          منخفض
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="rounded-full p-1 text-warning transition-colors hover:bg-warning/16 hover:text-warning"
        aria-label="إخفاء التنبيه"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
