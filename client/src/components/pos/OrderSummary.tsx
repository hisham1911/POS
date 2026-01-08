import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatters";

export const OrderSummary = () => {
  const { subtotal, taxAmount, total, taxRate, isTaxEnabled } = useCart();

  return (
    <div className="border-t pt-4 space-y-2">
      <div className="flex justify-between text-gray-600">
        <span>المجموع الفرعي</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {/* إظهار الضريبة فقط إذا كانت مفعلة */}
      {isTaxEnabled && (
        <div className="flex justify-between text-gray-600">
          <span>الضريبة ({taxRate}%)</span>
          <span>{formatCurrency(taxAmount)}</span>
        </div>
      )}
      <div className="flex justify-between text-xl font-bold pt-2 border-t">
        <span>الإجمالي</span>
        <span className="text-primary-600">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
