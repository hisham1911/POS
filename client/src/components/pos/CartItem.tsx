import { Plus, Minus, Trash2 } from "lucide-react";
import { CartItem } from "@/store/slices/cartSlice";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatters";

interface CartItemProps {
  item: CartItem;
}

export const CartItemComponent = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const total = product.price * quantity;

  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
      {/* Image */}
      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shrink-0">
        <span className="text-2xl">{product.imageUrl || "📦"}</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
        <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="w-11 h-11 flex items-center justify-center bg-white rounded-lg border hover:bg-gray-100 active:scale-95 transition-transform"
            aria-label={quantity === 1 ? `حذف ${product.name}` : `تقليل كمية ${product.name}`}
          >
            {quantity === 1 ? (
              <Trash2 className="w-5 h-5 text-danger-500" />
            ) : (
              <Minus className="w-5 h-5" />
            )}
          </button>

          <span className="w-8 text-center font-bold">{quantity}</span>

          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="w-11 h-11 flex items-center justify-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:scale-95 transition-transform"
            aria-label={`زيادة كمية ${product.name}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="text-start shrink-0">
        <p className="font-bold text-primary-600">{formatCurrency(total)}</p>
        <button
          onClick={() => removeItem(product.id)}
          className="text-danger-500 text-sm hover:underline mt-1"
        >
          حذف
        </button>
      </div>
    </div>
  );
};
