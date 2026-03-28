import clsx from "clsx";
import { Check, DollarSign, Percent } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { useCart } from "@/hooks/useCart";
import type { DiscountType } from "@/store/slices/cartSlice";
import { formatCurrency, formatNumber } from "@/utils/formatters";

interface DiscountModalProps {
  onClose: () => void;
}

const keypad = ["7", "8", "9", "←", "4", "5", "6", "C", "1", "2", "3", ".", "0", "00"] as const;
const quickPercentages = [5, 10, 15, 20];

export const DiscountModal = ({ onClose }: DiscountModalProps) => {
  const {
    subtotal,
    applyDiscount,
    removeDiscount,
    discountType: currentDiscountType,
    discountValue: currentDiscountValue,
  } = useCart();

  const [discountType, setDiscountType] = useState<DiscountType>(currentDiscountType || "Percentage");
  const [discountValue, setDiscountValue] = useState<string>(currentDiscountValue?.toString() || "");

  const numericValue = parseFloat(discountValue) || 0;

  let previewDiscount = 0;
  if (numericValue > 0) {
    previewDiscount = discountType === "Percentage" ? subtotal * (numericValue / 100) : numericValue;
    previewDiscount = Math.min(previewDiscount, subtotal);
  }

  const previewTotal = subtotal - previewDiscount;

  const handleNumpadClick = (value: string) => {
    if (value === "C") {
      setDiscountValue("");
      return;
    }

    if (value === "←") {
      setDiscountValue((prev) => prev.slice(0, -1));
      return;
    }

    if (value === ".") {
      if (!discountValue.includes(".")) {
        setDiscountValue((prev) => prev + ".");
      }
      return;
    }

    setDiscountValue((prev) => prev + value);
  };

  const handleApply = () => {
    if (numericValue <= 0) {
      toast.error("قيمة الخصم يجب أن تكون أكبر من صفر");
      return;
    }

    if (discountType === "Percentage" && numericValue > 100) {
      toast.error("نسبة الخصم لا يمكن أن تتجاوز 100%");
      return;
    }

    if (discountType === "Fixed" && numericValue > subtotal) {
      toast.error("قيمة الخصم لا يمكن أن تتجاوز المجموع الفرعي");
      return;
    }

    applyDiscount(discountType, numericValue);
    toast.success("تم تطبيق الخصم بنجاح");
    onClose();
  };

  const handleRemove = () => {
    removeDiscount();
    toast.success("تم إلغاء الخصم");
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="خصم على الطلب"
      description="طبّق خصمًا سريعًا بنسبة أو مبلغ ثابت مع معاينة فورية قبل التأكيد."
      size="md"
    >
      <div className="space-y-6">
        <div className="mesh-preview rounded-[calc(var(--radius)+0.05rem)] p-4">
          <div className="surface-outline rounded-[calc(var(--radius)+0.1rem)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">المجموع الفرعي</p>
            <p className="font-numeric mt-2 text-3xl font-black text-foreground">{formatCurrency(subtotal)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">نوع الخصم</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "Percentage" as const, label: "نسبة مئوية", icon: <Percent className="h-6 w-6" /> },
              { id: "Fixed" as const, label: "مبلغ ثابت", icon: <DollarSign className="h-6 w-6" /> },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDiscountType(item.id)}
                className={clsx("choice-chip min-h-[5rem] flex-col justify-center gap-2 rounded-[calc(var(--radius)-0.1rem)]", discountType === item.id && "scale-[1.01]")}
                data-selected={discountType === item.id}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="surface-outline rounded-[calc(var(--radius)+0.05rem)] p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {discountType === "Percentage" ? "نسبة الخصم (%)" : "قيمة الخصم (ج.م)"}
          </p>
          <p className="font-numeric mt-3 text-4xl font-black text-foreground">
            {discountValue || "0"}
            <span className="ms-2 text-lg font-semibold text-muted-foreground">
              {discountType === "Percentage" ? "%" : "ج.م"}
            </span>
          </p>
        </div>

        {discountType === "Percentage" ? (
          <div className="grid grid-cols-4 gap-2">
            {quickPercentages.map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => setDiscountValue(percent.toString())}
                className="font-numeric rounded-2xl border border-border bg-background/75 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-primary/8 hover:text-primary"
              >
                {formatNumber(percent)}%
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-4 gap-2">
          {keypad.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleNumpadClick(key)}
              className={clsx(
                "font-numeric h-14 rounded-2xl border border-border bg-background/78 text-xl font-semibold text-foreground shadow-sm transition hover:bg-muted active:scale-[0.98]",
                key === "0" && "col-span-2",
                key === "C" && "border-destructive/20 bg-destructive/8 text-destructive hover:bg-destructive/12",
                key === "←" && "border-warning/22 bg-warning/8 text-warning hover:bg-warning/12"
              )}
            >
              {key}
            </button>
          ))}
        </div>

        {previewDiscount > 0 ? (
          <div className="feedback-panel space-y-2" data-tone="success">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span className="font-numeric font-semibold text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-success">
              <span className="font-semibold">الخصم</span>
              <span className="font-numeric font-semibold">- {formatCurrency(previewDiscount)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-lg font-bold">
              <span className="text-foreground">المجموع بعد الخصم</span>
              <span className="font-numeric text-success">{formatCurrency(previewTotal)}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
          {currentDiscountType || currentDiscountValue ? (
            <Button variant="danger" onClick={handleRemove}>
              إلغاء الخصم
            </Button>
          ) : null}
          <Button onClick={handleApply} disabled={numericValue <= 0} rightIcon={<Check className="h-5 w-5" />}>
            تطبيق الخصم
          </Button>
        </div>
      </div>
    </Modal>
  );
};
