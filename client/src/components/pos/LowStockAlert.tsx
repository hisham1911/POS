import { AlertTriangle, X } from "lucide-react";
import { useGetLowStockProductsQuery } from "@/api/inventoryApi";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/store/slices/authSlice";

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
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 flex items-center justify-between gap-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 text-amber-700">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">
          ⚠️ تنبيه: {lowStockCount} منتج{lowStockCount > 1 ? "ات" : ""} مخزونها
          منخفض
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-600 hover:text-amber-800 p-1 rounded hover:bg-amber-100 transition-colors"
        aria-label="إخفاء التنبيه"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
