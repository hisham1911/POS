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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold mb-4 text-orange-600">
            ⏰ تنبيه: عدم نشاط طويل
          </h2>

          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              لم يتم تسجيل أي نشاط على هذه الوردية منذ{" "}
              <strong>{shift.inactiveHours} ساعة</strong>.
            </p>
            <p className="text-gray-600 text-sm">
              آخر نشاط: {formatDateTimeFull(shift.lastActivityAt)}
            </p>
          </div>

          {/* Shift Info */}
          <div className="bg-gray-50 p-4 rounded mb-4 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">وقت الفتح:</span>
              <span className="font-medium">
                {formatDateTimeFull(shift.openedAt)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">المدة الإجمالية:</span>
              <span className="font-medium">
                {shift.durationHours} ساعة و {shift.durationMinutes} دقيقة
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الرصيد المتوقع:</span>
              <span className="font-medium">
                {shift.expectedBalance.toFixed(2)} ج.م
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">ماذا تريد أن تفعل؟</p>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={onCloseShift}
              className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
            >
              ✓ إغلاق الوردية الآن
            </button>

            <button
              onClick={onHandover}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
            >
              🔄 تسليم لمستخدم آخر
            </button>

            <button
              onClick={onContinue}
              className="w-full px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium"
            >
              ⏸️ الاستمرار (تذكير بعد ساعة)
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 border rounded hover:bg-gray-50 text-sm"
            >
              إلغاء
            </button>
          </div>

          {/* Warning */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-xs text-yellow-800">
              💡 <strong>نصيحة:</strong> يُنصح بإغلاق الوردية أو تسليمها لتجنب
              مشاكل في التقارير والحسابات.
            </p>
          </div>
        </div>
      </div>
    </Portal>
  );
}
