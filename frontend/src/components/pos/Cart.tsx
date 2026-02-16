import { ShoppingCart, Trash2, Tag } from "lucide-react";
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

        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <p className="text-lg font-medium">السلة فارغة</p>
          <p className="text-sm">اضغط على المنتجات لإضافتها</p>
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
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-800">الطلب الحالي</h2>
          <span className="bg-primary-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {itemsCount}
          </span>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1 text-danger-500 text-sm hover:underline"
        >
          <Trash2 className="w-4 h-4" />
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
