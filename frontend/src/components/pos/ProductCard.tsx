import { useState } from "react";
import { Product } from "@/types/product.types";
import { Category } from "@/types/category.types";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatters";
import { useAppSelector } from "@/store/hooks";
import { selectAllowNegativeStock } from "@/store/slices/cartSlice";
import clsx from "clsx";

// Default low stock threshold if not provided
const DEFAULT_LOW_STOCK_THRESHOLD = 10;

interface ProductCardProps {
  product: Product;
  category?: Category;
  onStockAdjust?: (product: Product) => void;
  showStockAdjust?: boolean;
}

export const ProductCard = ({
  product,
  category,
  onStockAdjust,
  showStockAdjust,
}: ProductCardProps) => {
  const { items, addItem } = useCart();
  const [imageError, setImageError] = useState(false);
  const allowNegativeStock = useAppSelector(selectAllowNegativeStock);

  // Get quantity in cart for this product
  const cartItem = items.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem?.quantity ?? 0;

  // Calculate available stock (stock - what's in cart)
  const totalStock = product.stockQuantity ?? 0;
  const availableStock = product.trackInventory
    ? totalStock - quantityInCart
    : Infinity;

  // If allowNegativeStock is enabled, always allow adding
  const canAddMore =
    allowNegativeStock || !product.trackInventory || availableStock > 0;

  const handleClick = () => {
    if (product.isActive && canAddMore) {
      addItem(product);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (showStockAdjust && onStockAdjust) {
      e.preventDefault();
      onStockAdjust(product);
    }
  };

  // Stock badge logic - shows available stock (accounting for cart)
  const getStockBadge = () => {
    if (!product.trackInventory) return null;

    const threshold = product.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

    if (totalStock <= 0) {
      return (
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded-full bg-danger text-danger-foreground shadow-sm">
          نفد
        </span>
      );
    }

    if (availableStock <= 0) {
      return (
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded-full bg-warning text-warning-foreground shadow-sm">
          في السلة
        </span>
      );
    }

    if (totalStock <= threshold) {
      return (
        <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-white shadow-sm">
          {availableStock}
        </span>
      );
    }

    return (
      <span className="absolute top-2 left-2 px-2 py-0.5 text-[11px] font-bold rounded-full bg-muted-foreground/80 text-background shadow-sm backdrop-blur-sm">
        {availableStock}
      </span>
    );
  };

  // Determine if product is out of stock (only if allowNegativeStock is disabled)
  const isOutOfStock =
    !allowNegativeStock && product.trackInventory && totalStock <= 0;
  const isDisabled = !product.isActive || isOutOfStock;
  const isInCart = quantityInCart > 0;

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      disabled={isDisabled || !canAddMore}
      className={clsx(
        "relative rounded-xl overflow-hidden transition-all duration-200 w-full text-right p-3",
        "bg-card border-2",
        isDisabled && "opacity-50 cursor-not-allowed",
        !isDisabled && canAddMore && "active:scale-[0.97]",
        !canAddMore && !isDisabled && "cursor-not-allowed",
        isInCart
          ? "border-primary shadow-md"
          : "border-transparent shadow-sm hover:shadow"
      )}
      aria-label={`إضافة ${product.name} - ${formatCurrency(product.price)}`}
      aria-disabled={isDisabled}
    >
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-muted/30 to-muted/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-5xl drop-shadow-sm">
            {category?.imageUrl || "📦"}
          </span>
        )}

        {/* Stock Badge */}
        {getStockBadge()}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-foreground truncate mb-1 text-sm">
        {product.name}
      </h3>

      {/* Price */}
      <p className="text-primary font-bold">
        {formatCurrency(product.price)}
      </p>

      {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
          <span className="bg-danger/10 text-danger border border-danger/20 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
            نفد المخزون
          </span>
        </div>
      )}

      {/* Inactive overlay */}
      {!product.isActive && !isOutOfStock && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
          <span className="bg-muted text-muted-foreground border border-border px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
            غير متوفر
          </span>
        </div>
      )}
    </button>
  );
};
