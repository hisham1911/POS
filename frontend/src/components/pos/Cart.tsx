import { ShoppingCart01 as ShoppingCart, Trash01 as Trash2, Tag01 as Tag } from "@untitledui/icons";
import { useCart } from "@/hooks/useCart";
import { CartItemComponent } from "./CartItem";
import { OrderSummary } from "./OrderSummary";
import { Button } from "@/components/common/Button";
import { formatCurrency, formatNumber } from "@/utils/formatters";
import { CustomerSearch } from "./CustomerSearch";
import { Customer } from "@/types/customer.types";
import { useState } from "react";
import { DiscountModal } from "./DiscountModal";

interface CartProps {
  onCheckout: () => void;
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer | null) => void;
}

export const Cart = ({
  onCheckout,
  selectedCustomer,
  onCustomerSelect,
}: CartProps) => {
  const { items, clearCart, total, itemsCount, discountAmount } = useCart();
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <CustomerSearch
          selectedCustomer={selectedCustomer}
          onCustomerSelect={onCustomerSelect}
        />

        <div className="feedback-panel flex flex-1 flex-col items-center justify-center gap-2 text-center" data-tone="info">
          <div className="mb-2 flex size-20 items-center justify-center rounded-full bg-muted/50">
            <ShoppingCart className="size-10 opacity-30" />
          </div>
          <p className="text-lg font-bold text-foreground">السلة فارغة</p>
          <p className="text-sm font-medium">اضغط على المنتجات لإضافتها</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CustomerSearch
        selectedCustomer={selectedCustomer}
        onCustomerSelect={onCustomerSelect}
      />

      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">الطلب الحالي</h2>
          <span className="font-numeric rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
            {formatNumber(itemsCount)}
          </span>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="flex items-center gap-1 text-sm font-bold text-danger transition hover:underline"
        >
          <Trash2 className="size-4" />
          إفراغ
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
        {items.map((item) => (
          <CartItemComponent key={item.product.id} item={item} />
        ))}
      </div>

      <OrderSummary />

      <Button
        variant="outline"
        size="lg"
        className="w-full mt-3"
        onClick={() => setShowDiscountModal(true)}
        leftIcon={<Tag className="w-5 h-5" />}
      >
        {discountAmount > 0 ? "تعديل الخصم" : "إضافة خصم"}
      </Button>

      <Button
        variant="success"
        size="xl"
        className="w-full mt-2"
        onClick={onCheckout}
      >
        <span className="font-numeric">💳 الدفع {formatCurrency(total)}</span>
      </Button>

      {showDiscountModal && (
        <DiscountModal onClose={() => setShowDiscountModal(false)} />
      )}
    </div>
  );
};
