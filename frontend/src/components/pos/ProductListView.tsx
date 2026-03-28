import clsx from "clsx";
import { AlertCircle, CheckCircle2, Minus, Package } from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/store/hooks";
import { selectAllowNegativeStock } from "@/store/slices/cartSlice";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";
import { formatCurrency, formatNumber } from "@/utils/formatters";

interface ProductListViewProps {
  products: Product[];
  categories: Category[];
}

export const ProductListView = ({ products, categories }: ProductListViewProps) => {
  const { items, addItem } = useCart();
  const allowNegativeStock = useAppSelector(selectAllowNegativeStock);

  const handleProductClick = (product: Product) => {
    const cartItem = items.find((item) => item.product.id === product.id);
    const quantityInCart = cartItem?.quantity ?? 0;
    const totalStock = product.stockQuantity ?? 0;
    const availableStock = product.trackInventory ? totalStock - quantityInCart : Infinity;
    const canAddMore = allowNegativeStock || !product.trackInventory || availableStock > 0;
    const isOutOfStock = !allowNegativeStock && product.trackInventory && totalStock <= 0;

    if (product.isActive && canAddMore && !isOutOfStock) {
      addItem(product);
    }
  };

  const groupedProducts = products.reduce(
    (acc, product) => {
      const categoryId = product.categoryId || 0;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product);
      return acc;
    },
    {} as Record<number, Product[]>
  );

  return (
    <div className="space-y-7">
      {Object.entries(groupedProducts).map(([categoryId, categoryProducts]) => {
        const category = categories.find((item) => item.id === Number(categoryId));
        const categoryName = category?.name || "غير مصنف";

        return (
          <section key={categoryId} className="space-y-3">
            <div className="flex items-center gap-3 border-b border-border/70 pb-3">
              <div className="h-7 w-1.5 rounded-full bg-[linear-gradient(180deg,hsl(var(--primary)),hsl(var(--accent)))] shadow-sm" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-foreground">{categoryName}</h3>
                <p className="font-numeric text-xs text-muted-foreground">
                  {formatNumber(categoryProducts.length)} منتج
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {categoryProducts.map((product) => {
                const cartItem = items.find((item) => item.product.id === product.id);
                const quantityInCart = cartItem?.quantity ?? 0;
                const totalStock = product.stockQuantity ?? 0;
                const availableStock = product.trackInventory ? totalStock - quantityInCart : Infinity;
                const canAddMore = allowNegativeStock || !product.trackInventory || availableStock > 0;
                const isOutOfStock = !allowNegativeStock && product.trackInventory && totalStock <= 0;
                const isLowStock =
                  product.trackInventory &&
                  totalStock > 0 &&
                  totalStock <= (product.lowStockThreshold ?? 10);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductClick(product)}
                    disabled={!product.isActive || isOutOfStock || !canAddMore}
                    className={clsx(
                      "surface-outline flex w-full items-center justify-between gap-4 rounded-[calc(var(--radius)+0.02rem)] p-4 text-right transition-all duration-200",
                      quantityInCart > 0
                        ? "border-primary/30 bg-primary/6 shadow-soft ring-1 ring-primary/18"
                        : "hover:border-primary/24 hover:bg-[hsl(var(--card)/0.92)]",
                      (!product.isActive || isOutOfStock || !canAddMore) && "cursor-not-allowed opacity-50",
                      product.isActive && canAddMore && !isOutOfStock && "active:scale-[0.985]"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="truncate font-semibold text-foreground">{product.name}</h4>
                        {quantityInCart > 0 ? (
                          <span className="font-numeric inline-flex rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow-sm">
                            {formatNumber(quantityInCart)}
                          </span>
                        ) : null}
                      </div>

                      {product.trackInventory ? (
                        <div className="flex items-center gap-2 text-sm">
                          {isOutOfStock ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="font-medium text-destructive">نفد المخزون</span>
                            </>
                          ) : isLowStock ? (
                            <>
                              <Minus className="h-4 w-4 text-warning" />
                              <span className="font-medium text-warning">
                                متبقي <span className="font-numeric">{formatNumber(availableStock)}</span>
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              <span className="font-medium text-success">
                                متاح <span className="font-numeric">{formatNumber(availableStock)}</span>
                              </span>
                            </>
                          )}
                        </div>
                      ) : null}

                      {!product.isActive ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">غير متوفر</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="ml-4 shrink-0 text-left">
                      <div className="font-numeric text-xl font-black text-primary">
                        {formatCurrency(product.price)}
                      </div>
                      {product.sku ? <div className="font-mono text-xs text-muted-foreground">{product.sku}</div> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {products.length === 0 ? (
        <div className="feedback-panel flex flex-col items-center justify-center gap-2 py-12 text-center" data-tone="info">
          <Package className="h-16 w-16 text-muted-foreground opacity-45" />
          <p className="text-lg font-medium text-foreground">لا توجد منتجات</p>
          <p className="text-sm text-muted-foreground">جرب تغيير البحث أو الفلتر</p>
        </div>
      ) : null}
    </div>
  );
};
