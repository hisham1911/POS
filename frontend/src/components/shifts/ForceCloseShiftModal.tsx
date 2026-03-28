import { useState } from "react";
import { X, AlertTriangle, Clock, User01 as User, CurrencyDollar as DollarSign } from "@untitledui/icons";
import { useForceCloseShiftMutation } from "../../api/shiftsApi";
import { Shift } from "../../types/shift.types";
import { formatDateTimeFull } from "../../utils/formatters";
import { Portal } from "../../components/common/Portal";

interface ForceCloseShiftModalProps {
  shift: Shift;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ForceCloseShiftModal({
  shift,
  isOpen,
  onClose,
  onSuccess,
}: ForceCloseShiftModalProps) {
  const [reason, setReason] = useState("");
  const [actualBalance, setActualBalance] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [forceCloseShift, { isLoading }] = useForceCloseShiftMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert("يرجى إدخال سبب الإغلاق");
      return;
    }

    try {
      const result = await forceCloseShift({
        id: shift.id,
        request: {
          reason: reason.trim(),
          actualBalance: actualBalance ? parseFloat(actualBalance) : undefined,
          notes: notes.trim() || undefined,
        },
      }).unwrap();

      if (result.success) {
        alert("تم إغلاق الوردية بالقوة بنجاح");
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      alert(error?.data?.message || "حدث خطأ أثناء إغلاق الوردية");
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(var(--foreground)/0.24)] p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <div 
          className="glass-panel flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[calc(var(--radius)+0.35rem)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                إغلاق الوردية بالقوة
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Shift Info */}
            <div className="space-y-3 rounded-xl border border-border bg-muted/35 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="text-sm">الكاشير:</span>
                </div>
                <span className="font-medium text-foreground">{shift.userName}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">وقت الفتح:</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatDateTimeFull(shift.openedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">المدة:</span>
                </div>
                <span className="font-medium text-foreground">
                  {shift.durationHours} ساعة و {shift.durationMinutes} دقيقة
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">الرصيد المتوقع:</span>
                </div>
                <span className="font-medium text-foreground">
                  {shift.expectedBalance.toFixed(2)} ج.م
                </span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                سبب الإغلاق بالقوة <span className="text-danger">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full resize-none rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground"
                rows={3}
                placeholder="مثال: الكاشير نسي إغلاق الوردية، مشكلة تقنية، طوارئ..."
                required
                maxLength={500}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {reason.length}/500 حرف
              </div>
            </div>

            {/* Actual Balance */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                الرصيد الفعلي (اختياري)
              </label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70" />
                <input
                  type="number"
                  step="0.01"
                  value={actualBalance === "0" ? "" : actualBalance}
                  onChange={(e) => setActualBalance(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card/80 py-2.5 pl-4 pr-10 text-foreground"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                إذا لم يتم إدخاله، سيتم استخدام الرصيد المتوقع
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground"
                rows={2}
                placeholder="أي ملاحظات إضافية..."
                maxLength={1000}
              />
            </div>

            {/* Warning */}
            <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 w-5 h-5 flex-shrink-0 text-warning" />
                <div>
                  <p className="mb-1 text-sm font-medium text-foreground">
                    تحذير هام
                  </p>
                  <p className="text-sm text-muted-foreground">
                    هذا الإجراء سيغلق الوردية فوراً ولا يمكن التراجع عنه. سيتم تسجيل هذه العملية في سجل التدقيق.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/30 transition-colors font-medium"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-danger px-4 py-2.5 font-medium text-danger-foreground transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "جاري الإغلاق..." : "إغلاق بالقوة"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
