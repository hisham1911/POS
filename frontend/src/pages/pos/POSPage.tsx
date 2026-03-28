import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle,
  File04,
  Menu01,
  PlusCircle,
  SearchLg,
} from "@untitledui/icons";

import { useGetShiftWarningsQuery } from "@/api/shiftsApi";
import { Loading } from "@/components/common/Loading";
import { Cart } from "@/components/pos/Cart";
import { CategoryTabs } from "@/components/pos/CategoryTabs";
import { CustomItemModal } from "@/components/pos/CustomItemModal";
import { LowStockAlert } from "@/components/pos/LowStockAlert";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { ProductQuickCreateModal } from "@/components/pos/ProductQuickCreateModal";
import { ShiftWarningBanner } from "@/components/shifts";
import { useCart } from "@/hooks/useCart";
import { usePOSMode } from "@/hooks/usePOSMode";
import { usePOSShortcuts } from "@/hooks/usePOSShortcuts";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { useShift } from "@/hooks/useShift";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/customer.types";

export const POSPage = () => {
  const { mode } = usePOSMode();

  if (mode === "standard") {
    return <Navigate to="/pos-workspace" replace />;
  }

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showCustomItem, setShowCustomItem] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { products, isLoading } = useProducts();
  const { categories } = useCategories();
  const { addItem, itemsCount } = useCart();
  const { hasActiveShift, isLoading: isLoadingShift } = useShift();

  const { data: warningsData } = useGetShiftWarningsQuery(undefined, {
    pollingInterval: 10 * 60 * 1000,
    skip: !hasActiveShift,
  });

  const shiftWarning = warningsData?.data;

  usePOSShortcuts({
    onCheckout: () => setShowPayment(true),
    onSearch: () => {
      searchInputRef.current?.focus();
    },
  });

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearchSubmit = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) return;

      const foundProduct = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === trimmedValue.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === trimmedValue.toLowerCase()) ||
          p.name.toLowerCase() === trimmedValue.toLowerCase()
      );

      if (foundProduct) {
        addItem(foundProduct, 1);
        toast.success(`تمت الإضافة: ${foundProduct.name}`);
        setSearchInput("");
        searchInputRef.current?.focus();
      } else {
        toast.error(`لم يتم العثور على منتج: ${trimmedValue}`);
      }
    },
    [products, addItem]
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit(searchInput);
    }
  };

  let filteredProducts = products;

  if (searchInput.trim()) {
    const searchLower = searchInput.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchLower)) ||
        (p.sku && p.sku.toLowerCase().includes(searchLower))
    );
  }

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.categoryId === selectedCategory
    );
  }

  if (showAvailableOnly) {
    filteredProducts = filteredProducts.filter((p) => {
      if (!p.trackInventory) return true;
      return (p.stockQuantity ?? 0) > 0;
    });
  }

  if (isLoading || isLoadingShift) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  if (!hasActiveShift) {
    return (
      <div className="flex h-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-3xl bg-card p-10 text-center shadow-xl border border-border/60">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-warning/10">
            <AlertCircle className="size-10 text-warning" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-foreground">
            لا توجد وردية مفتوحة
          </h2>
          <p className="mb-8 text-muted-foreground leading-relaxed">
            يجب فتح وردية قبل البدء في البيع. اذهب إلى صفحة الورديات لفتح وردية جديدة لتتمكن من استخدام نقطة البيع.
          </p>
          <Link
            to="/shift"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            الذهاب إلى الورديات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-background">
      <div className="flex min-w-0 flex-1 flex-col bg-muted/10 p-4">
        {shiftWarning && shiftWarning.shouldWarn && (
          <div className="mb-4">
            <ShiftWarningBanner warning={shiftWarning} />
          </div>
        )}

        <LowStockAlert />

        <div className="mb-5">
          <div className="relative group">
            <SearchLg className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="بحث بالاسم، الباركود أو SKU (اضغط Enter للإضافة)"
              className="w-full rounded-2xl border-2 border-border/50 bg-background pl-4 pr-12 py-3.5 text-sm font-medium shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <CategoryTabs
              categories={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />

            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm whitespace-nowrap",
                showAvailableOnly
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground border border-border hover:bg-muted"
              )}
            >
              <CheckCircle className="size-4" />
              <span className="hidden sm:inline">المتاح فقط</span>
            </button>

            <button
              onClick={() => setShowQuickCreate(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all whitespace-nowrap"
            >
              <PlusCircle className="size-4" />
              <span className="hidden sm:inline">منتج جديد</span>
            </button>

            <button
              onClick={() => setShowCustomItem(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all shadow-sm whitespace-nowrap bg-accent/10 text-accent-foreground hover:bg-accent/20"
            >
              <File04 className="size-4" />
              <span className="hidden sm:inline">منتج مخصص</span>
            </button>
          </div>

          <button
            onClick={() => setShowMobileCart(!showMobileCart)}
            className="relative self-end rounded-xl border border-border bg-background p-2.5 hover:bg-muted shrink-0 lg:hidden transition-colors"
          >
            <Menu01 className="size-5 text-foreground" />
            {itemsCount > 0 && (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                {itemsCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 min-h-[18rem] overflow-y-auto scrollbar-thin -mx-4 px-4 pb-4">
          <ProductGrid products={filteredProducts} categories={categories} />
        </div>
      </div>

      <div className="hidden w-96 shrink-0 flex-col border-r border-border bg-card p-4 lg:flex shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10">
        <Cart
          onCheckout={() => setShowPayment(true)}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={setSelectedCustomer}
        />
      </div>

      {showMobileCart && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="absolute bottom-0 right-0 top-0 flex w-[min(100%,24rem)] animate-in slide-in-from-right flex-col bg-card p-4 shadow-2xl border-l border-border">
            <Cart
              onCheckout={() => {
                setShowMobileCart(false);
                setShowPayment(true);
              }}
              selectedCustomer={selectedCustomer}
              onCustomerSelect={setSelectedCustomer}
            />
          </div>
        </div>
      )}

      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          selectedCustomer={selectedCustomer}
          onOrderComplete={() => setSelectedCustomer(null)}
        />
      )}

      {showQuickCreate && (
        <ProductQuickCreateModal
          onClose={() => setShowQuickCreate(false)}
          onSuccess={(productId) => {
            toast.success("تم إضافة المنتج بنجاح");
          }}
        />
      )}

      {showCustomItem && (
        <CustomItemModal onClose={() => setShowCustomItem(false)} />
      )}
    </div>
  );
};

export default POSPage;
