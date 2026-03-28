import clsx from "clsx";
import { Check, DollarSign, Percent } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";
import type { CartItem, ItemDiscount } from "@/store/slices/cartSlice";
import { formatCurrency, formatNumber } from "@/utils/formatters";

interface ItemDiscountModalProps {
  item: CartItem;
  onApply: (discount: ItemDiscount) => void;
  onRemove: () => void;
  onClose: () => void;
}

const keypad = ["7", "8", "9", "←", "4", "5", "6", "C", "1", "2", "3", ".", "0", "00"] as const;
const quickPercentages = [5, 10, 15, 20];

export const ItemDiscountModal = ({
  item,
  onApply,
  onRemove,
  onClose,
}: ItemDiscountModalProps) => {
  const itemTotal = item.product.price * item.quantity;
  const currentDiscount = item.discount;

  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(currentDiscount?.type || "percentage");
  const [discountValue, setDiscountValue] = useState<string>(currentDiscount?.value?.toString() || "");
  const [reason, setReason] = useState<string>(currentDiscount?.reason || "");

  const numericValue = parseFloat(discountValue) || 0;

  let previewDiscount = 0;
  if (numericValue > 0) {
    previewDiscount = discountType === "percentage" ? itemTotal * (numericValue / 100) : numericValue;
    previewDiscount = Math.min(previewDiscount, itemTotal);
  }

  const previewTotal = itemTotal - previewDiscount;

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

    if (discountType === "percentage" && numericValue > 100) {
      toast.error("نسبة الخصم لا يمكن أن تتجاوز 100%");
      return;
    }

    if (discountType === "fixed" && numericValue > itemTotal) {
      toast.error("قيمة الخصم لا يمكن أن تتجاوز سعر المنتج");
      return;
    }

    onApply({
      type: discountType,
      value: numericValue,
      ...(reason ? { reason } : {})
    });
    toast.success(`تم تطبيق الخصم على ${item.product.name}`);
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    toast.success(`تم إلغاء الخصم عن ${item.product.name}`);
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`خصم على ${item.product.name}`}
      description="استخدم خصمًا خاصًا على هذا المنتج فقط، مع سبب اختياري يظهر لاحقًا في تفاصيل الطلب."
      size="md"
    >
      <div className="space-y-6">
        <div className="mesh-preview rounded-[calc(var(--radius)+0.05rem)] p-4">
          <div className="surface-outline rounded-[calc(var(--radius)+0.1rem)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              سعر المنتج ({formatNumber(item.quantity)} × {formatCurrency(item.product.price)})
            </p>
            <p className="font-numeric mt-2 text-3xl font-black text-foreground">{formatCurrency(itemTotal)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">نوع الخصم</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "percentage" as const, label: "نسبة مئوية", icon: <Percent className="h-6 w-6" /> },
              { id: "fixed" as const, label: "مبلغ ثابت", icon: <DollarSign className="h-6 w-6" /> },
            ].map((itemOption) => (
              <button
                key={itemOption.id}
                type="button"
                onClick={() => setDiscountType(itemOption.id)}
                className={clsx("choice-chip min-h-[5rem] flex-col justify-center gap-2 rounded-[calc(var(--radius)-0.1rem)]", discountType === itemOption.id && "scale-[1.01]")}
                data-selected={discountType === itemOption.id}
              >
                {itemOption.icon}
                <span>{itemOption.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="surface-outline rounded-[calc(var(--radius)+0.05rem)] p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {discountType === "percentage" ? "نسبة الخصم (%)" : "قيمة الخصم (ج.م)"}
          </p>
          <p className="font-numeric mt-3 text-4xl font-black text-foreground">
            {discountValue || "0"}
            <span className="ms-2 text-lg font-semibold text-muted-foreground">
              {discountType === "percentage" ? "%" : "ج.م"}
            </span>
          </p>
        </div>

        {discountType === "percentage" ? (
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

        <div>
          <label className="mb-2 inline-flex text-sm font-semibold text-foreground" htmlFor="item-discount-reason">
            سبب الخصم
          </label>
          <Input
            id="item-discount-reason"
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="مثال: عميل مميز أو عرض خاص"
          />
        </div>

        {previewDiscount > 0 ? (
          <div className="feedback-panel space-y-2" data-tone="success">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">سعر المنتج</span>
              <span className="font-numeric font-semibold text-foreground">{formatCurrency(itemTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-success">
              <span className="font-semibold">الخصم</span>
              <span className="font-numeric font-semibold">- {formatCurrency(previewDiscount)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 text-lg font-bold">
              <span className="text-foreground">بعد الخصم</span>
              <span className="font-numeric text-success">{formatCurrency(previewTotal)}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
          {currentDiscount ? (
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
