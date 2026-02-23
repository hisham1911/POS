import { Shift } from '../../types/shift.types';
import { formatDateTimeFull } from '../../utils/formatters';

interface ShiftRecoveryModalProps {
  shift: Shift;
  savedAt: string;
  isOpen: boolean;
  onRestore: () => void;
  onDiscard: () => void;
}

export default function ShiftRecoveryModal({
  shift,
  savedAt,
  isOpen,
  onRestore,
  onDiscard,
}: ShiftRecoveryModalProps) {
  if (!isOpen) return null;

  const timeSinceLastSave = Math.floor(
    (new Date().getTime() - new Date(savedAt).getTime()) / 1000 / 60
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-blue-600">
          🔄 استعادة الوردية
        </h2>

        <p className="text-gray-700 mb-4">
          تم العثور على وردية مفتوحة من جلسة سابقة. هل تريد استعادتها؟
        </p>

        {/* Shift Info */}
        <div className="bg-blue-50 p-4 rounded mb-4 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">رقم الوردية:</span>
            <span className="font-medium">#{shift.id}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">وقت الفتح:</span>
            <span className="font-medium">
              {formatDateTimeFull(shift.openedAt)}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">الرصيد المتوقع:</span>
            <span className="font-medium">{shift.expectedBalance.toFixed(2)} ج.م</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">عدد الطلبات:</span>
            <span className="font-medium">{shift.totalOrders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">آخر حفظ:</span>
            <span className="font-medium">
              منذ {timeSinceLastSave} دقيقة
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>ملاحظة:</strong> إذا اخترت "تجاهل"، سيتم حذف البيانات
            المحفوظة ولن يمكن استعادتها.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onRestore}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
          >
            ✓ استعادة الوردية
          </button>

          <button
            onClick={onDiscard}
            className="w-full px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
          >
            تجاهل وبدء جديد
          </button>
        </div>
      </div>
    </div>
  );
}
