import { useGetActiveShiftsQuery } from '../../api/shiftsApi';
import { Shift } from '../../types/shift.types';

interface ActiveShiftsListProps {
  onForceClose?: (shift: Shift) => void;
  currentUserId?: number;
  isAdmin?: boolean;
}

export default function ActiveShiftsList({
  onForceClose,
  currentUserId,
  isAdmin = false,
}: ActiveShiftsListProps) {
  const { data, isLoading, error } = useGetActiveShiftsQuery();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">
          حدث خطأ أثناء تحميل الورديات المفتوحة
        </div>
      </div>
    );
  }

  const shifts = data?.data || [];

  // Filter shifts based on user role
  const visibleShifts = isAdmin
    ? shifts
    : shifts.filter((shift) => shift.userId === currentUserId);

  if (visibleShifts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">الورديات المفتوحة</h3>
        <p className="text-gray-500 text-center py-8">
          لا توجد ورديات مفتوحة حالياً
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">الورديات المفتوحة</h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {visibleShifts.length} وردية
        </span>
      </div>

      <div className="space-y-3">
        {visibleShifts.map((shift) => (
          <div
            key={shift.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{shift.userName}</h4>
                <p className="text-sm text-gray-500">
                  وردية #{shift.id}
                </p>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {shift.expectedBalance.toFixed(2)} ج.م
                </div>
                <div className="text-xs text-gray-500">الرصيد المتوقع</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <span className="text-gray-600">وقت الفتح:</span>
                <div className="font-medium">
                  {new Date(shift.openedAt).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div>
                <span className="text-gray-600">المدة:</span>
                <div className="font-medium">
                  {shift.durationHours}:{shift.durationMinutes.toString().padStart(2, '0')}
                </div>
              </div>
              <div>
                <span className="text-gray-600">الطلبات:</span>
                <div className="font-medium">{shift.totalOrders}</div>
              </div>
              <div>
                <span className="text-gray-600">الرصيد النقدي:</span>
                <div className="font-medium">{shift.totalCash.toFixed(2)} ج.م</div>
              </div>
            </div>

            {/* Handover Badge */}
            {shift.isHandedOver && (
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🔄 تم التسليم من {shift.handedOverFromUserName}
                </span>
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin && onForceClose && (
              <div className="mt-3 pt-3 border-t">
                <button
                  onClick={() => onForceClose(shift)}
                  className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  إغلاق بالقوة
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
