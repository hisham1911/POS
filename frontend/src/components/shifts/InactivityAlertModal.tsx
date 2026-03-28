import { Shift } from "../../types/shift.types";
import { formatDateTimeFull } from "../../utils/formatters";
import { Portal } from "../../components/common/Portal";

interface InactivityAlertModalProps {
  shift: Shift;
  isOpen: boolean;
  onClose: () => void;
  onCloseShift: () => void;
  onHandover: () => void;
  onContinue: () => void;
}

export default function InactivityAlertModal({
  shift,
  isOpen,
  onClose,
  onCloseShift,
  onHandover,
  onContinue,
}: InactivityAlertModalProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <div 
          className="bg-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏰</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">تنبيه: عدم نشاط طويل</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
            >
              <span className="text-muted-foreground text-xl">×</span>
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <p className="text-muted-foreground mb-2">
                لم يتم تسجيل أي نشاط على هذه الوردية منذ{" "}
                <strong>{shift.inactiveHours} ساعة</strong>.
              </p>
              <p className="text-muted-foreground text-sm">
                آخر نشاط: {formatDateTimeFull(shift.lastActivityAt)}
              </p>
            </div>

            {/* Shift Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">وقت الفتح:</span>
                <span className="font-medium text-foreground">
                  {formatDateTimeFull(shift.openedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">المدة الإجمالية:</span>
                <span className="font-medium text-foreground">
                  {shift.durationHours} ساعة و {shift.durationMinutes} دقيقة
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">الرصيد المتوقع:</span>
                <span className="font-medium text-foreground">
                  {shift.expectedBalance.toFixed(2)} ج.م
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">ماذا تريد أن تفعل؟</p>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={onCloseShift}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
              >
                ✓ إغلاق الوردية الآن
              </button>

              <button
                onClick={onHandover}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors"
              >
                🔄 تسليم لمستخدم آخر
              </button>

              <button
                onClick={onContinue}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-medium transition-colors"
              >
                ⏸️ الاستمرار (تذكير بعد ساعة)
              </button>

              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 border border-border text-muted-foreground rounded-xl hover:bg-muted/30 transition-colors"
              >
                إلغاء
              </button>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-800">
                💡 <strong>نصيحة:</strong> يُنصح بإغلاق الوردية أو تسليمها لتجنب
                مشاكل في التقارير والحسابات.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
