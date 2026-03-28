import clsx from "clsx";
import { useState } from "react";

import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/store/hooks";
import { selectAllowNegativeStock } from "@/store/slices/cartSlice";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";
import { formatCurrency, formatNumber } from "@/utils/formatters";

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

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem?.quantity ?? 0;
  const totalStock = product.stockQuantity ?? 0;
  const availableStock = product.trackInventory ? totalStock - quantityInCart : Infinity;
  const canAddMore = allowNegativeStock || !product.trackInventory || availableStock > 0;

  const handleClick = () => {
    if (product.isActive && canAddMore) {
      addItem(product);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    if (showStockAdjust && onStockAdjust) {
      event.preventDefault();
      onStockAdjust(product);
    }
  };

  const getStockBadge = () => {
    if (!product.trackInventory) return null;

    const threshold = product.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

    if (totalStock <= 0) {
      return (
        <span className="font-numeric absolute left-2 top-2 rounded-full bg-danger px-2.5 py-0.5 text-xs font-bold text-danger-foreground shadow-sm">
          نفد
        </span>
      );
    }

    if (availableStock <= 0) {
      return (
        <span className="font-numeric absolute left-2 top-2 rounded-full bg-warning px-2.5 py-0.5 text-xs font-bold text-warning-foreground shadow-sm">
          في السلة
        </span>
      );
    }

    if (totalStock <= threshold) {
      return (
        <span className="font-numeric absolute left-2 top-2 rounded-full bg-warning px-2.5 py-0.5 text-xs font-bold text-warning-foreground shadow-sm">
          {formatNumber(availableStock)}
        </span>
      );
    }

    return (
      <span className="font-numeric absolute left-2 top-2 rounded-full bg-foreground/82 px-2.5 py-0.5 text-[11px] font-bold text-background shadow-sm backdrop-blur-sm">
        {formatNumber(availableStock)}
      </span>
    );
  };

  const isOutOfStock = !allowNegativeStock && product.trackInventory && totalStock <= 0;
  const isDisabled = !product.isActive || isOutOfStock;
  const isInCart = quantityInCart > 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      disabled={isDisabled || !canAddMore}
      className={clsx(
        "surface-outline relative w-full overflow-hidden rounded-[calc(var(--radius)-0.1rem)] p-3 text-right transition-all duration-200",
        isDisabled && "cursor-not-allowed opacity-50",
        !isDisabled && canAddMore && "active:scale-[0.98]",
        !canAddMore && !isDisabled && "cursor-not-allowed",
        isInCart
          ? "border-primary/30 bg-primary/6 shadow-soft ring-1 ring-primary/18"
          : "hover:border-primary/24 hover:bg-[hsl(var(--card)/0.92)]"
      )}
      aria-label={`إضافة ${product.name} - ${formatCurrency(product.price)}`}
      aria-disabled={isDisabled}
    >
      <div className="mesh-preview relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,hsl(var(--muted)/0.62),hsl(var(--card)/0.9))]">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-5xl drop-shadow-sm">{category?.imageUrl || "📦"}</span>
        )}

        {getStockBadge()}
      </div>

      <h3 className="mb-1 truncate text-sm font-semibold text-foreground">{product.name}</h3>
      <p className="font-numeric text-sm font-black text-primary">{formatCurrency(product.price)}</p>

      {isOutOfStock ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[calc(var(--radius)-0.1rem)] bg-background/80 backdrop-blur-[2px]">
          <span className="rounded-full border border-danger/20 bg-danger/10 px-3 py-1.5 text-xs font-bold text-danger shadow-sm">
            نفد المخزون
          </span>
        </div>
      ) : null}

      {!product.isActive && !isOutOfStock ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[calc(var(--radius)-0.1rem)] bg-background/80 backdrop-blur-[2px]">
          <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-sm">
            غير متوفر
          </span>
        </div>
      ) : null}
    </button>
  );
};
