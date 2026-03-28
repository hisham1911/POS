import { useCart } from "@/hooks/useCart";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { Percent, DollarSign, Tag } from "lucide-react";

export const OrderSummary = () => {
  const {
    subtotal,
    discountAmount,
    discountType,
    discountValue,
    itemDiscountsTotal,
    taxAmount,
    total,
    taxRate,
    isTaxEnabled,
  } = useCart();

  return (
    <div className="space-y-3 border-t border-border/70 pt-4">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">المجموع الفرعي</span>
        <span className="font-numeric font-semibold text-foreground">{formatCurrency(subtotal)}</span>
      </div>

      {itemDiscountsTotal > 0 && (
        <div className="flex justify-between text-sm text-success">
          <span className="flex items-center gap-1 font-semibold">
            <Tag className="h-4 w-4" />
            <span>خصومات المنتجات</span>
          </span>
          <span className="font-numeric font-semibold">- {formatCurrency(itemDiscountsTotal)}</span>
        </div>
      )}

      {discountAmount > 0 && (
        <div className="flex justify-between text-sm text-success">
          <span className="flex items-center gap-1 font-semibold">
            {discountType === "Percentage" ? (
              <Percent className="h-4 w-4" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            <span>
              خصم الطلب
              {discountType === "Percentage" &&
                discountValue &&
                ` (${formatNumber(discountValue)}%)`}
            </span>
          </span>
          <span className="font-numeric font-semibold">- {formatCurrency(discountAmount)}</span>
        </div>
      )}

      {isTaxEnabled && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">الضريبة ({formatNumber(taxRate)}%)</span>
          <span className="font-numeric font-semibold text-foreground">{formatCurrency(taxAmount)}</span>
        </div>
      )}

      <div className="flex justify-between border-t border-border/70 pt-3 text-xl font-bold">
        <span className="text-foreground">الإجمالي</span>
        <span className="font-numeric text-primary">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
