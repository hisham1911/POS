import { ShoppingCart01 as ShoppingCart, Trash01 as Trash2, Tag01 as Tag } from "@untitledui/icons";
import { useCart } from "@/hooks/useCart";
import { CartItemComponent } from "./CartItem";
import { OrderSummary } from "./OrderSummary";
import { Button } from "@/components/common/Button";
import { formatCurrency } from "@/utils/formatters";
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
        {/* Customer Search - Always visible */}
        <CustomerSearch
          selectedCustomer={selectedCustomer}
          onCustomerSelect={onCustomerSelect}
        />

        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
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
      {/* Customer Search */}
      <CustomerSearch
        selectedCustomer={selectedCustomer}
        onCustomerSelect={onCustomerSelect}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">الطلب الحالي</h2>
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {itemsCount}
          </span>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1 text-danger font-bold text-sm hover:underline"
        >
          <Trash2 className="size-4" />
          إفراغ
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
        {items.map((item) => (
          <CartItemComponent key={item.product.id} item={item} />
        ))}
      </div>

      {/* Summary */}
      <OrderSummary />

      {/* Discount Button */}
      <Button
        variant="outline"
        size="lg"
        className="w-full mt-3"
        onClick={() => setShowDiscountModal(true)}
        leftIcon={<Tag className="w-5 h-5" />}
      >
        {discountAmount > 0 ? "تعديل الخصم" : "إضافة خصم"}
      </Button>

      {/* Checkout Button */}
      <Button
        variant="success"
        size="xl"
        className="w-full mt-2"
        onClick={onCheckout}
      >
        💳 الدفع {formatCurrency(total)}
      </Button>

      {/* Discount Modal */}
      {showDiscountModal && (
        <DiscountModal onClose={() => setShowDiscountModal(false)} />
      )}
    </div>
  );
};
