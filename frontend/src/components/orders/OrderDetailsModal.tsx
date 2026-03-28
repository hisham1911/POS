import { useState } from "react";
import { X, Printer, RotateCcw, User, Phone, Tag } from "lucide-react";

import { usePrintReceiptMutation } from "@/api/ordersApi";
import { Button } from "@/components/common/Button";
import { Portal } from "@/components/common/Portal";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { Order } from "@/types/order.types";
import { ORDER_STATUS, PAYMENT_METHODS } from "@/utils/constants";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import clsx from "clsx";
import { toast } from "sonner";

import { RefundModal } from "./RefundModal";

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetailsModal = ({
  order,
  onClose,
}: OrderDetailsModalProps) => {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const [printReceipt, { isLoading: isPrinting }] = usePrintReceiptMutation();

  const canRefund =
    (user?.role === "Admin" || user?.role === "SystemOwner") &&
    (order.status === "Completed" || order.status === "PartiallyRefunded");

  const isFullyRefunded = order.status === "Refunded";
  const isPartiallyRefunded = order.status === "PartiallyRefunded";
  const hasRefund = isFullyRefunded || isPartiallyRefunded;

  const handlePrint = async () => {
    try {
      await printReceipt(order.id).unwrap();
      toast.success("تم إرسال أمر الطباعة بنجاح");
    } catch (error) {
      toast.error("فشل إرسال أمر الطباعة");
      console.error("Print error:", error);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
        <div className="glass-panel flex max-h-[90vh] w-full max-w-lg animate-scale-in flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-6 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-foreground">طلب #{order.orderNumber}</h2>
              <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              {canRefund ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowRefundModal(true)}
                  title="استرجاع الطلب"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={isPrinting}
                title="طباعة الفاتورة"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/70 transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الحالة</span>
              <span
                className={clsx(
                  "rounded-full px-3 py-1 text-sm font-medium",
                  order.status === "Completed"
                    ? "bg-success/12 text-success"
                    : order.status === "Pending"
                      ? "bg-warning/12 text-warning"
                      : order.status === "PartiallyRefunded"
                        ? "bg-warning/12 text-warning"
                        : order.status === "Refunded"
                          ? "bg-danger/12 text-danger"
                          : "bg-muted text-muted-foreground"
                )}
              >
                {ORDER_STATUS[order.status]?.label}
              </span>
            </div>

            {order.customerId ? (
              <div className="rounded-lg border border-border bg-muted/35 p-3">
                <p className="mb-2 text-sm font-medium text-muted-foreground">معلومات العميل</p>
                <div className="space-y-1.5">
                  {order.customerName ? (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{order.customerName}</span>
                    </div>
                  ) : null}
                  {order.customerPhone ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span dir="ltr">{order.customerPhone}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">العميل</span>
                <span className="text-muted-foreground/70">عميل نقدي</span>
              </div>
            )}

            <div>
              <h3 className="mb-3 font-semibold text-foreground">المنتجات</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border/60 bg-card/65 p-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-foreground">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.unitPrice)}
                          {item.refundedQuantity > 0 ? (
                            <span className="mr-2 text-warning">(مسترجع: {item.refundedQuantity})</span>
                          ) : null}
                        </p>
                      </div>
                      <div className="shrink-0 text-left">
                        {item.discountAmount > 0 ? (
                          <>
                            <p className="text-sm text-muted-foreground/65 line-through">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </p>
                            <p className="font-semibold text-success">{formatCurrency(item.total)}</p>
                          </>
                        ) : (
                          <p className="font-semibold text-foreground">{formatCurrency(item.total)}</p>
                        )}
                      </div>
                    </div>

                    {item.discountAmount > 0 ? (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-success" />
                        <span className="text-xs font-medium text-success">
                          خصم{" "}
                          {item.discountType === "Percentage" || item.discountType === "percentage"
                            ? `${item.discountValue}%`
                            : formatCurrency(item.discountValue ?? 0)}{" "}
                          (-{formatCurrency(item.discountAmount)})
                        </span>
                        {item.discountReason ? (
                          <span className="text-xs text-muted-foreground/70">• {item.discountReason}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="text-foreground">{formatCurrency(order.subtotal)}</span>
              </div>

              {order.items.some((item) => item.discountAmount > 0) ? (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Tag className="w-3.5 h-3.5" />
                    خصومات المنتجات
                  </span>
                  <span className="text-success">
                    -{formatCurrency(order.items.reduce((sum, item) => sum + item.discountAmount, 0))}
                  </span>
                </div>
              ) : null}

              {order.discountAmount > 0 ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    خصم الطلب
                    {(order.discountType === "Percentage" || order.discountType === "percentage") &&
                    order.discountValue
                      ? ` (${order.discountValue}%)`
                      : ""}
                  </span>
                  <span className="text-danger">-{formatCurrency(order.discountAmount)}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الضريبة ({order.taxRate}%)</span>
                <span className="text-foreground">{formatCurrency(order.taxAmount)}</span>
              </div>

              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span className="text-foreground">الإجمالي</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>

              {hasRefund && order.refundAmount > 0 ? (
                <div className="flex justify-between border-t border-dashed pt-2 text-sm">
                  <span className="font-medium text-danger">
                    {isFullyRefunded ? "مبلغ الاسترجاع الكامل" : "مبلغ الاسترجاع الجزئي"}
                  </span>
                  <span className="font-semibold text-danger">-{formatCurrency(order.refundAmount)}</span>
                </div>
              ) : null}

              {isPartiallyRefunded && order.refundAmount > 0 ? (
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">الصافي بعد الاسترجاع</span>
                  <span className="text-success">{formatCurrency(order.total - order.refundAmount)}</span>
                </div>
              ) : null}
            </div>

            {order.payments.length > 0 ? (
              <div>
                <h3 className="mb-3 font-semibold text-foreground">المدفوعات</h3>
                <div className="space-y-2">
                  {order.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-card/65 p-3"
                    >
                      <span className="text-foreground">{PAYMENT_METHODS[payment.method]?.label}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
                {order.changeAmount > 0 ? (
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">الباقي</span>
                    <span className="text-success">{formatCurrency(order.changeAmount)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {order.notes ? (
              <div>
                <h3 className="mb-2 font-semibold text-foreground">ملاحظات</h3>
                <p className="rounded-lg bg-muted/35 p-3 text-muted-foreground">{order.notes}</p>
              </div>
            ) : null}

            {hasRefund && order.refundReason ? (
              <div className="feedback-panel rounded-lg p-4" data-tone={isFullyRefunded ? "danger" : "warning"}>
                <h3 className={clsx("mb-2 font-semibold", isFullyRefunded ? "text-danger" : "text-warning")}>
                  {isFullyRefunded ? "معلومات الاسترجاع الكامل" : "معلومات الاسترجاع الجزئي"}
                </h3>
                <div className={clsx("space-y-1 text-sm", isFullyRefunded ? "text-danger" : "text-warning")}>
                  <p>
                    <span className="font-medium">السبب:</span> {order.refundReason}
                  </p>
                  {order.refundedAt ? (
                    <p>
                      <span className="font-medium">التاريخ:</span> {formatDateTime(order.refundedAt)}
                    </p>
                  ) : null}
                  {order.refundedByUserName ? (
                    <p>
                      <span className="font-medium">بواسطة:</span> {order.refundedByUserName}
                    </p>
                  ) : null}
                  {order.refundAmount > 0 ? (
                    <p>
                      <span className="font-medium">المبلغ المسترد:</span> {formatCurrency(order.refundAmount)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {showRefundModal ? (
            <RefundModal
              order={order}
              onClose={() => setShowRefundModal(false)}
              onSuccess={onClose}
            />
          ) : null}
        </div>
      </div>
    </Portal>
  );
};
