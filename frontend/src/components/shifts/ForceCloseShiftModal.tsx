import { useState } from 'react';
import { useForceCloseShiftMutation } from '../../api/shiftsApi';
import { Shift } from '../../types/shift.types';
import { formatDateTimeFull } from '../../utils/formatters';

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
  const [reason, setReason] = useState('');
  const [actualBalance, setActualBalance] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [forceCloseShift, { isLoading }] = useForceCloseShiftMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('يرجى إدخال سبب الإغلاق');
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
        alert('تم إغلاق الوردية بالقوة بنجاح');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      alert(error?.data?.message || 'حدث خطأ أثناء إغلاق الوردية');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          ⚠️ إغلاق الوردية بالقوة
        </h2>

        {/* Shift Info */}
        <div className="bg-gray-50 p-4 rounded mb-4 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">الكاشير:</span>
            <span className="font-medium">{shift.userName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">وقت الفتح:</span>
            <span className="font-medium">
              {formatDateTimeFull(shift.openedAt)}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">المدة:</span>
            <span className="font-medium">
              {shift.durationHours} ساعة و {shift.durationMinutes} دقيقة
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">الرصيد المتوقع:</span>
            <span className="font-medium">{shift.expectedBalance.toFixed(2)} ج.م</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              سبب الإغلاق بالقوة <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              rows={3}
              placeholder="مثال: الكاشير نسي إغلاق الوردية، مشكلة تقنية، طوارئ..."
              required
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {reason.length}/500 حرف
            </div>
          </div>

          {/* Actual Balance */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              الرصيد الفعلي (اختياري)
            </label>
            <input
              type="number"
              step="0.01"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="إذا تم عد النقد"
            />
            <div className="text-xs text-gray-500 mt-1">
              إذا لم يتم إدخاله، سيتم استخدام الرصيد المتوقع
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              rows={2}
              placeholder="أي ملاحظات إضافية..."
              maxLength={1000}
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>تحذير:</strong> هذا الإجراء سيغلق الوردية فوراً ولا يمكن التراجع عنه.
              سيتم تسجيل هذه العملية في سجل التدقيق.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإغلاق...' : 'إغلاق بالقوة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
