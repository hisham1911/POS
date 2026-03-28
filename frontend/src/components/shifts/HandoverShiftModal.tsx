import { useState, useEffect } from "react";
import { ChevronDown } from "@untitledui/icons";
import { useHandoverShiftMutation } from "../../api/shiftsApi";
import { Shift } from "../../types/shift.types";
import { formatDateTimeFull } from "../../utils/formatters";
import { Portal } from "../../components/common/Portal";

interface HandoverShiftModalProps {
  shift: Shift;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  availableUsers?: Array<{ id: number; name: string; email: string }>;
}

export default function HandoverShiftModal({
  shift,
  isOpen,
  onClose,
  onSuccess,
  availableUsers = [],
}: HandoverShiftModalProps) {
  const [toUserId, setToUserId] = useState<number | "">("");
  const [currentBalance, setCurrentBalance] = useState<string>(
    shift.expectedBalance.toString(),
  );
  const [notes, setNotes] = useState("");
  const [handoverShift, { isLoading }] = useHandoverShiftMutation();

  useEffect(() => {
    if (isOpen) {
      setCurrentBalance(shift.expectedBalance.toString());
      setToUserId("");
      setNotes("");
    }
  }, [isOpen, shift.expectedBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!toUserId) {
      alert("يرجى اختيار المستخدم المستلم");
      return;
    }

    if (!currentBalance || parseFloat(currentBalance) < 0) {
      alert("يرجى إدخال الرصيد الحالي");
      return;
    }

    try {
      const result = await handoverShift({
        id: shift.id,
        request: {
          toUserId: Number(toUserId),
          currentBalance: parseFloat(currentBalance),
          notes: notes.trim() || undefined,
        },
      }).unwrap();

      if (result.success) {
        alert("تم تسليم الوردية بنجاح");
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      alert(error?.data?.message || "حدث خطأ أثناء تسليم الوردية");
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-2xl">🔄</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">تسليم الوردية</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <span className="text-muted-foreground text-xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Current Shift Info */}
            <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/8 p-4">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-muted-foreground">الكاشير الحالي:</span>
                <span className="font-medium text-foreground">{shift.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">وقت الفتح:</span>
                <span className="font-medium text-foreground">
                  {formatDateTimeFull(shift.openedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">المدة:</span>
                <span className="font-medium text-foreground">
                  {shift.durationHours} ساعة و {shift.durationMinutes} دقيقة
                </span>
              </div>
            </div>

            {/* Target User */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                تسليم إلى <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <select
                  value={toUserId}
                  onChange={(e) =>
                    setToUserId(e.target.value ? Number(e.target.value) : "")
                  }
                  className="appearance-none w-full rounded-xl border border-input bg-card/80 pl-10 pr-4 py-2.5 font-medium text-foreground shadow-sm transition-all duration-200 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">-- اختر المستخدم --</option>
                  {availableUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/70 pointer-events-none" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                سيتم نقل الوردية للمستخدم المحدد
              </p>
            </div>

            {/* Current Balance */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                الرصيد الحالي <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={currentBalance === "0" ? "" : currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                className="w-full rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground"
                placeholder="الرصيد في الدرج"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                الرصيد المتوقع: {shift.expectedBalance.toFixed(2)} ج.م
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                ملاحظات التسليم (اختياري)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full resize-none rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground"
                rows={3}
                placeholder="أي ملاحظات للمستخدم المستلم..."
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {notes.length}/500 حرف
              </p>
            </div>

            {/* Info */}
            <div className="rounded-xl border border-primary/20 bg-primary/8 p-4">
              <p className="text-sm text-primary font-medium">
                ℹ️ سيتم نقل الوردية للمستخدم المحدد وسيستمر بنفس الرقم. سيتم
                تسجيل عملية التسليم في سجل التدقيق.
              </p>
            </div>
          </form>

          {/* Buttons */}
          <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
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
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "جاري التسليم..." : "تسليم الوردية"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
