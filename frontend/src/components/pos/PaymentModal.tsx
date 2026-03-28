import { useState } from "react";
import {
  XClose as X,
  Check,
  BankNote01 as Banknote,
  CreditCard01 as CreditCard,
  Building02 as Building2,
  User01 as User,
  Phone,
  Star01 as Star,
  AlertCircle,
} from "@untitledui/icons";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/formatters";
import { PaymentMethod } from "@/types/order.types";
import { Customer } from "@/types/customer.types";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import clsx from "clsx";
import { Portal } from "@/components/common/Portal";

interface PaymentModalProps {
  onClose: () => void;
  selectedCustomer?: Customer | null;
  onOrderComplete?: () => void;
}

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "Cash", label: "نقدي", icon: <Banknote className="size-8" /> },
  { id: "Card", label: "بطاقة", icon: <CreditCard className="size-8" /> },
  { id: "Fawry", label: "فوري", icon: <Building2 className="size-8" /> },
];

export const PaymentModal = ({
  onClose,
  selectedCustomer,
  onOrderComplete,
}: PaymentModalProps) => {
  const { total, clearCart } = useCart();
  const { createOrder, completeOrder, isCreating, isCompleting } = useOrders();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("Cash");
  const [amountPaid, setAmountPaid] = useState<string>(total.toFixed(2));
  const [showError, setShowError] = useState(false);
  const [allowPartialPayment, setAllowPartialPayment] = useState(false);

  const customerId = selectedCustomer?.id;

  const numericAmount = parseFloat(amountPaid) || 0;
  const change = numericAmount - total;
  const amountDue = total - numericAmount;

  // Calculate available credit for customer
  const availableCredit = selectedCustomer
    ? selectedCustomer.creditLimit - selectedCustomer.totalDue
    : 0;

  // Check if customer can take credit
  const canTakeCredit =
    selectedCustomer &&
    selectedCustomer.isActive &&
    (selectedCustomer.creditLimit === 0 ||
      amountDue <= availableCredit);

  const creditLimitExceeded =
    selectedCustomer &&
    selectedCustomer.creditLimit > 0 &&
    amountDue > availableCredit;

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
    // Validate payment amount
    if (numericAmount < total && !allowPartialPayment) {
      setShowError(true);
      setTimeout(() => setShowError(false), 500);
      toast.error("المبلغ المدفوع أقل من الإجمالي");
      return;
    }

    // Validate partial payment requires customer
    if (numericAmount < total && !selectedCustomer) {
      toast.error("البيع الآجل يتطلب ربط عميل بالطلب");
      return;
    }

    // Validate customer is active
    if (numericAmount < total && selectedCustomer && !selectedCustomer.isActive) {
      toast.error("العميل غير نشط - لا يمكن البيع الآجل");
      return;
    }

    // Validate credit limit
    if (numericAmount < total && creditLimitExceeded) {
      toast.error(
        `تجاوز حد الائتمان. المتاح: ${formatCurrency(availableCredit)} ج.م، المطلوب: ${formatCurrency(amountDue)} ج.م`,
        { duration: 5000 }
      );
      return;
    }

    try {
      // 1. إنشاء الطلب أولاً (مع العميل إن وجد)
      const order = await createOrder(customerId);
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
        // نجاح - عرض الباقي أو المبلغ المستحق
        if (change > 0) {
          toast.success(`تم إتمام الدفع! الباقي: ${formatCurrency(change)}`);
        } else if (amountDue > 0) {
          toast.success(
            `تم إتمام البيع الآجل! المبلغ المستحق: ${formatCurrency(amountDue)}`,
          );
        } else {
          toast.success("تم إتمام الدفع بنجاح!");
        }
        // مسح العميل المحدد
        onOrderComplete?.();
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
    <Portal>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-card text-foreground rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col border border-border">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
            <h2 className="text-xl font-black">الدفع</h2>
            <button
              onClick={onClose}
              className="size-10 rounded-xl bg-muted/50 flex items-center justify-center hover:bg-danger/10 hover:text-danger flex-shrink-0 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Customer Info */}
            <div className="p-4 bg-muted/30 rounded-xl border border-border">
              <p className="text-sm font-bold text-muted-foreground mb-2">
                معلومات العميل
              </p>
              {selectedCustomer ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-primary" />
                    <span className="font-bold text-foreground">
                      {selectedCustomer.name || selectedCustomer.phone}
                    </span>
                  </div>
                  {selectedCustomer.phone && selectedCustomer.name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                      <Phone className="size-4" />
                      <span dir="ltr">{selectedCustomer.phone}</span>
                    </div>
                  )}
                  {(selectedCustomer.loyaltyPoints ?? 0) > 0 && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>{selectedCustomer.loyaltyPoints} نقطة ولاء</span>
                    </div>
                  )}
                  {selectedCustomer.totalDue > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span>
                        رصيد مستحق: {formatCurrency(selectedCustomer.totalDue)}
                      </span>
                    </div>
                  )}
                  {selectedCustomer.creditLimit > 0 && (
                    <div className="feedback-panel mt-2" data-tone={creditLimitExceeded ? "danger" : "info"}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">حد الائتمان:</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(selectedCustomer.creditLimit)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">المستخدم:</span>
                        <span className="font-medium text-warning">
                          {formatCurrency(selectedCustomer.totalDue)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">المتاح:</span>
                        <span
                          className={`font-medium ${
                            availableCredit < 0 ? "text-danger" : "text-success"
                          }`}
                        >
                          {formatCurrency(availableCredit)}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="progress-shell mt-2 h-1.5">
                        <div
                          className={`progress-fill ${
                            selectedCustomer.totalDue /
                              selectedCustomer.creditLimit >
                            0.9
                              ? "!bg-danger"
                              : selectedCustomer.totalDue /
                                    selectedCustomer.creditLimit >
                                  0.7
                                ? "!bg-warning"
                                : "!bg-success"
                          }`}
                          style={{
                            width: `${Math.min(
                              (selectedCustomer.totalDue /
                                selectedCustomer.creditLimit) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="w-4 h-4" />
                  <span>عميل نقدي</span>
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="text-center p-6 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-primary font-bold mb-1">الإجمالي المطلوب</p>
              <p className="text-4xl font-black text-foreground">
                {formatCurrency(total)}
              </p>
            </div>

            {/* Payment Methods */}
            <div>
              <p className="text-sm font-bold text-muted-foreground mb-3">
                طريقة الدفع
              </p>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={clsx(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all outline-none",
                      selectedMethod === method.id
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/50",
                    )}
                  >
                    {method.icon}
                    <span className="mt-2 font-bold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input (for Cash) */}
            {selectedMethod === "Cash" && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-3">
                    المبلغ المدفوع
                  </p>
                  <div
                    className={clsx(
                      "text-center p-4 bg-muted/30 rounded-xl transition-all border border-border",
                      showError && "animate-shake border-2 border-danger",
                    )}
                  >
                    <p className="text-3xl font-black text-foreground">
                      {amountPaid || "0"}{" "}
                      <span className="text-lg text-muted-foreground font-semibold">ج.م</span>
                    </p>
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="flex gap-2">
              {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => handleQuickAmount(amount)}
                      className="flex-1 rounded-lg border border-border bg-muted/65 py-2 font-medium text-foreground transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-primary"
                    >
                      {amount}
                    </button>
                  ))}
                  <button
                    onClick={() => handleQuickAmount(total)}
                    className="flex-1 rounded-lg bg-primary py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
                        "h-14 rounded-lg border border-border bg-muted/70 text-xl font-semibold text-foreground transition-colors hover:border-primary/25 hover:bg-card active:bg-muted",
                        key === "0" && "col-span-2",
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Change */}
                {change > 0 && (
                  <div className="feedback-panel text-center" data-tone="info">
                    <p className="text-sm text-muted-foreground">الباقي</p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(change)}
                    </p>
                  </div>
                )}

                {/* Amount Due (Partial Payment) */}
                {numericAmount < total && numericAmount > 0 && (
                  <div
                    className={clsx(
                      "feedback-panel text-center",
                      creditLimitExceeded
                        ? ""
                        : "",
                    )}
                    data-tone={creditLimitExceeded ? "danger" : "warning"}
                  >
                    <p className="text-sm text-muted-foreground">المبلغ المستحق</p>
                    <p
                      className={clsx(
                        "text-2xl font-bold",
                        creditLimitExceeded
                          ? "text-danger"
                          : "text-warning",
                      )}
                    >
                      {formatCurrency(amountDue)}
                    </p>
                    {creditLimitExceeded && (
                      <p className="mt-1 text-xs text-danger">
                        تجاوز حد الائتمان - المتاح: {formatCurrency(availableCredit)}
                      </p>
                    )}
                    {selectedCustomer && !selectedCustomer.isActive && (
                      <p className="mt-1 text-xs text-danger">
                        العميل غير نشط
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Partial Payment Option */}
            {selectedCustomer && canTakeCredit && (
              <div className="feedback-panel flex items-center gap-3" data-tone="info">
                <input
                  type="checkbox"
                  id="partialPayment"
                  checked={allowPartialPayment}
                  onChange={(e) => setAllowPartialPayment(e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <label
                  htmlFor="partialPayment"
                  className="flex-1 cursor-pointer"
                >
                  <p className="font-medium text-foreground">
                    السماح بالدفع الجزئي (بيع آجل)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    يمكن للعميل دفع جزء من المبلغ والباقي يُسجل كدين
                  </p>
                </label>
              </div>
            )}

            {/* Complete Button */}
            <Button
              variant="success"
              size="xl"
              className="w-full"
              onClick={handleComplete}
              isLoading={isCreating || isCompleting}
              disabled={
                isCreating ||
                isCompleting ||
                (numericAmount < total && !allowPartialPayment) ||
                (numericAmount < total && creditLimitExceeded)
              }
              rightIcon={<Check className="w-5 h-5" />}
            >
              {isCreating
                ? "جاري إنشاء الطلب..."
                : isCompleting
                  ? "جاري الدفع..."
                  : numericAmount < total && allowPartialPayment
                    ? `إتمام البيع الآجل (مستحق: ${formatCurrency(amountDue)})`
                    : "إتمام الدفع"}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
