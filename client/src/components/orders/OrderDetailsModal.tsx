import { X, Printer } from "lucide-react";
import { Order } from "@/types/order.types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { ORDER_STATUS, PAYMENT_METHODS } from "@/utils/constants";
import { Button } from "@/components/common/Button";
import clsx from "clsx";

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetailsModal = ({ order, onClose }: OrderDetailsModalProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold">طلب #{order.orderNumber}</h2>
            <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
            </Button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-danger-50 hover:text-danger-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500">الحالة</span>
            <span
              className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium",
                order.status === "Completed"
                  ? "bg-success-50 text-success-500"
                  : order.status === "Pending"
                  ? "bg-warning-50 text-warning-500"
                  : "bg-danger-50 text-danger-500"
              )}
            >
              {ORDER_STATUS[order.status]?.label}
            </span>
          </div>

          {/* Customer */}
          {order.customerName && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">العميل</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="font-semibold mb-3">المنتجات</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">المجموع الفرعي</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">الخصم</span>
                <span className="text-danger-500">-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">الضريبة ({order.taxRate}%)</span>
              <span>{formatCurrency(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>الإجمالي</span>
              <span className="text-primary-600">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Payments */}
          {order.payments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">المدفوعات</h3>
              <div className="space-y-2">
                {order.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span>{PAYMENT_METHODS[payment.method]?.label}</span>
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
              {order.changeAmount > 0 && (
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500">الباقي</span>
                  <span className="text-success-500">{formatCurrency(order.changeAmount)}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div>
              <h3 className="font-semibold mb-2">ملاحظات</h3>
              <p className="text-gray-500 bg-gray-50 p-3 rounded-lg">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
