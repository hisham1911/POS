import { useGetActiveShiftsQuery } from '../../api/shiftsApi';
import { Shift } from '../../types/shift.types';
import { formatTime } from '../../utils/formatters';

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
      <div className="bg-card rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-lg shadow p-6">
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
      <div className="bg-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">الورديات المفتوحة</h3>
        <p className="text-muted-foreground text-center py-8">
          لا توجد ورديات مفتوحة حالياً
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">الورديات المفتوحة</h3>
        <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
          {visibleShifts.length} وردية
        </span>
      </div>

      <div className="space-y-3">
        {visibleShifts.map((shift) => (
          <div
            key={shift.id}
            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-foreground">{shift.userName}</h4>
                <p className="text-sm text-muted-foreground">
                  وردية #{shift.id}
                </p>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">
                  {shift.expectedBalance.toFixed(2)} ج.م
                </div>
                <div className="text-xs text-muted-foreground">الرصيد المتوقع</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <span className="text-muted-foreground">وقت الفتح:</span>
                <div className="font-medium">
                  {formatTime(shift.openedAt)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">المدة:</span>
                <div className="font-medium">
                  {shift.durationHours}:{shift.durationMinutes.toString().padStart(2, '0')}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">الطلبات:</span>
                <div className="font-medium">{shift.totalOrders}</div>
              </div>
              <div>
                <span className="text-muted-foreground">الرصيد النقدي:</span>
                <div className="font-medium">{shift.totalCash.toFixed(2)} ج.م</div>
              </div>
            </div>

            {/* Handover Badge */}
            {shift.isHandedOver && (
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  🔄 تم التسليم من {shift.handedOverFromUserName}
                </span>
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin && onForceClose && (
              <div className="mt-3 pt-3 border-t">
                <button
                  onClick={() => onForceClose(shift)}
                  className="w-full px-3 py-2 text-sm bg-danger hover:bg-danger/90 text-danger-foreground rounded-lg font-bold transition-colors"
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
