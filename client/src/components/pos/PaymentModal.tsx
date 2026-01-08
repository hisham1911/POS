import { useState } from "react";
import { X, Check, Banknote, CreditCard, Building2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/formatters";
import { PaymentMethod } from "@/types/order.types";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import clsx from "clsx";

interface PaymentModalProps {
  onClose: () => void;
}

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "Cash", label: "نقدي", icon: <Banknote className="w-8 h-8" /> },
  { id: "Card", label: "بطاقة", icon: <CreditCard className="w-8 h-8" /> },
  { id: "Fawry", label: "فوري", icon: <Building2 className="w-8 h-8" /> },
];

export const PaymentModal = ({ onClose }: PaymentModalProps) => {
  const { total, clearCart } = useCart();
  const { createOrder, completeOrder, isCreating, isCompleting } = useOrders();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("Cash");
  const [amountPaid, setAmountPaid] = useState<string>(total.toFixed(2));

  const numericAmount = parseFloat(amountPaid) || 0;
  const change = numericAmount - total;

  const handleNumpadClick = (value: string) => {
    if (value === "C") {
      setAmountPaid("");
    } else if (value === "←") {
      setAmountPaid((prev) => prev.slice(0, -1));
    } else if (value === ".") {
      if (!amountPaid.includes(".")) {
        setAmountPaid((prev) => prev + ".");
      }
    } else {
      setAmountPaid((prev) => prev + value);
    }
  };

  const handleQuickAmount = (amount: number) => {
    setAmountPaid(amount.toFixed(2));
  };

  const handleComplete = async () => {
    if (numericAmount < total) {
      toast.error("المبلغ المدفوع أقل من الإجمالي");
      return;
    }

    try {
      // 1. إنشاء الطلب أولاً
      const order = await createOrder();
      if (!order) {
        // فشل إنشاء الطلب - لا نغلق النافذة، السلة محفوظة
        return;
      }

      // 2. إكمال الطلب بالدفع
      const completedOrder = await completeOrder(order.id, {
        payments: [
          {
            method: selectedMethod,
            amount: numericAmount,
          },
        ],
      });

      if (completedOrder) {
        // نجاح - عرض الباقي إن وجد
        if (change > 0) {
          toast.success(`تم إتمام الدفع! الباقي: ${formatCurrency(change)}`);
        }
        onClose();
      }
      // فشل إكمال الطلب - لا نغلق النافذة، السلة محفوظة
    } catch {
      // خطأ غير متوقع - لا نغلق النافذة
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">الدفع</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-danger-50 hover:text-danger-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Total Amount */}
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <p className="text-gray-500 mb-1">الإجمالي المطلوب</p>
            <p className="text-4xl font-bold text-primary-600">
              {formatCurrency(total)}
            </p>
          </div>

          {/* Payment Methods */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-3">
              طريقة الدفع
            </p>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={clsx(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    selectedMethod === method.id
                      ? "border-primary-600 bg-primary-50 text-primary-600"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {method.icon}
                  <span className="mt-2 font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input (for Cash) */}
          {selectedMethod === "Cash" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-3">
                  المبلغ المدفوع
                </p>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold">
                    {amountPaid || "0"}{" "}
                    <span className="text-lg text-gray-400">ج.م</span>
                  </p>
                </div>
              </div>

              {/* Quick Amounts */}
              <div className="flex gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="flex-1 py-2 rounded-lg bg-gray-100 font-medium hover:bg-primary-100 hover:text-primary-600 transition-colors"
                  >
                    {amount}
                  </button>
                ))}
                <button
                  onClick={() => handleQuickAmount(total)}
                  className="flex-1 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
                >
                  تمام
                </button>
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  "7",
                  "8",
                  "9",
                  "←",
                  "4",
                  "5",
                  "6",
                  "C",
                  "1",
                  "2",
                  "3",
                  ".",
                  "0",
                  "00",
                ].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleNumpadClick(key)}
                    className={clsx(
                      "h-14 rounded-lg bg-gray-100 font-semibold text-xl hover:bg-gray-200 active:bg-gray-300 transition-colors",
                      key === "0" && "col-span-2"
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Change */}
              {change > 0 && (
                <div className="text-center p-4 bg-success-50 rounded-xl border border-success-200">
                  <p className="text-gray-500 text-sm">الباقي</p>
                  <p className="text-2xl font-bold text-success-500">
                    {formatCurrency(change)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Complete Button */}
          <Button
            variant="success"
            size="xl"
            className="w-full"
            onClick={handleComplete}
            isLoading={isCreating || isCompleting}
            disabled={isCreating || isCompleting || numericAmount < total}
            rightIcon={<Check className="w-5 h-5" />}
          >
            {isCreating ? "جاري إنشاء الطلب..." : isCompleting ? "جاري الدفع..." : "إتمام الدفع"}
          </Button>
        </div>
      </div>
    </div>
  );
};
