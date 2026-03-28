import { Minus, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/hooks/useCart";
import type { CartItem } from "@/store/slices/cartSlice";
import { formatCurrency, formatNumber } from "@/utils/formatters";

import { ItemDiscountModal } from "./ItemDiscountModal";

interface CartItemProps {
  item: CartItem;
}

export const CartItemComponent = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem, applyItemDiscount, removeItemDiscount } = useCart();
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const { product, quantity, discount } = item;
  const total = product.price * quantity;

  let discountAmount = 0;
  if (discount) {
    discountAmount = discount.type === "percentage" ? total * (discount.value / 100) : Math.min(discount.value, total);
  }

  return (
    <>
      <div className="surface-outline flex gap-3 rounded-[calc(var(--radius)-0.15rem)] p-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/70 bg-background/70">
          <span className="text-2xl">{product.imageUrl || "📦"}</span>
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="truncate font-medium text-foreground">{product.name}</h4>
          <p className="font-numeric text-sm text-muted-foreground">{formatCurrency(product.price)}</p>

          {discount ? (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs text-success">
              <Tag className="h-3 w-3" />
              {discount.type === "percentage" ? `${formatNumber(discount.value)}%` : formatCurrency(discount.value)} خصم
            </span>
          ) : null}

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/75 transition hover:bg-muted active:scale-95"
              aria-label={quantity === 1 ? `حذف ${product.name}` : `تقليل كمية ${product.name}`}
            >
              {quantity === 1 ? <Trash2 className="h-5 w-5 text-danger" /> : <Minus className="h-5 w-5" />}
            </button>

            <span className="font-numeric w-8 text-center font-bold text-foreground">{formatNumber(quantity)}</span>

            <button
              type="button"
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-95"
              aria-label={`زيادة كمية ${product.name}`}
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setShowDiscountModal(true)}
              className={
                discount
                  ? "flex h-11 w-11 items-center justify-center rounded-2xl border border-success/28 bg-success/10 text-success transition hover:bg-success/16 active:scale-95"
                  : "flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-background/75 text-muted-foreground transition hover:bg-muted active:scale-95"
              }
              aria-label={`خصم على ${product.name}`}
            >
              <Tag className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="shrink-0 text-start">
          {discountAmount > 0 ? (
            <>
              <p className="font-numeric text-sm text-muted-foreground line-through">{formatCurrency(total)}</p>
              <p className="font-numeric font-bold text-success">{formatCurrency(total - discountAmount)}</p>
            </>
          ) : (
            <p className="font-numeric font-bold text-primary">{formatCurrency(total)}</p>
          )}
          <button
            type="button"
            onClick={() => removeItem(product.id)}
            className="mt-1 text-sm font-medium text-danger transition hover:underline"
          >
            حذف
          </button>
        </div>
      </div>

      {showDiscountModal ? (
        <ItemDiscountModal
          item={item}
          onApply={(disc) => applyItemDiscount(product.id, disc)}
          onRemove={() => removeItemDiscount(product.id)}
          onClose={() => setShowDiscountModal(false)}
        />
      ) : null}
    </>
  );
};
