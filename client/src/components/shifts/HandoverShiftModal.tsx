import { useState, useEffect } from 'react';
import { useHandoverShiftMutation } from '../../api/shiftsApi';
import { Shift } from '../../types/shift.types';

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
  const [toUserId, setToUserId] = useState<number | ''>('');
  const [currentBalance, setCurrentBalance] = useState<string>(
    shift.expectedBalance.toString()
  );
  const [notes, setNotes] = useState('');
  const [handoverShift, { isLoading }] = useHandoverShiftMutation();

  useEffect(() => {
    if (isOpen) {
      setCurrentBalance(shift.expectedBalance.toString());
      setToUserId('');
      setNotes('');
    }
  }, [isOpen, shift.expectedBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!toUserId) {
      alert('يرجى اختيار المستخدم المستلم');
      return;
    }

    if (!currentBalance || parseFloat(currentBalance) < 0) {
      alert('يرجى إدخال الرصيد الحالي');
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
        alert('تم تسليم الوردية بنجاح');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      alert(error?.data?.message || 'حدث خطأ أثناء تسليم الوردية');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">🔄 تسليم الوردية</h2>

        {/* Current Shift Info */}
        <div className="bg-blue-50 p-4 rounded mb-4 text-sm">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">الكاشير الحالي:</span>
            <span className="font-medium">{shift.userName}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">وقت الفتح:</span>
            <span className="font-medium">
              {new Date(shift.openedAt).toLocaleString('ar-EG')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">المدة:</span>
            <span className="font-medium">
              {shift.durationHours} ساعة و {shift.durationMinutes} دقيقة
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Target User */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              تسليم إلى <span className="text-red-500">*</span>
            </label>
            <select
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value ? Number(e.target.value) : '')}
              className="w-full border rounded p-2 text-sm"
              required
            >
              <option value="">-- اختر المستخدم --</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              سيتم نقل الوردية للمستخدم المحدد
            </div>
          </div>

          {/* Current Balance */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              الرصيد الحالي <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="الرصيد في الدرج"
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              الرصيد المتوقع: {shift.expectedBalance.toFixed(2)} ج.م
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              ملاحظات التسليم (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded p-2 text-sm"
              rows={3}
              placeholder="أي ملاحظات للمستخدم المستلم..."
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {notes.length}/500 حرف
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <p className="text-sm text-blue-800">
              ℹ️ سيتم نقل الوردية للمستخدم المحدد وسيستمر بنفس الرقم. سيتم تسجيل
              عملية التسليم في سجل التدقيق.
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'جاري التسليم...' : 'تسليم الوردية'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
