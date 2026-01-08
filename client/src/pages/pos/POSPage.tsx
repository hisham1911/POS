import { useState, useRef, useEffect, useCallback } from "react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CategoryTabs } from "@/components/pos/CategoryTabs";
import { Cart } from "@/components/pos/Cart";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { LowStockAlert } from "@/components/pos/LowStockAlert";
import { Loading } from "@/components/common/Loading";
import { Menu, ScanBarcode, PackageCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { usePOSShortcuts } from "@/hooks/usePOSShortcuts";
import { Customer } from "@/types/customer.types";
import { toast } from "sonner";
import clsx from "clsx";

export const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Hooks must be called at the top level before any callbacks that use their data
  const { products, isLoading } = useProducts();
  const { categories } = useCategories();
  const { addItem, itemsCount } = useCart();

  // Shortcuts
  usePOSShortcuts({
    onCheckout: () => setShowPayment(true),
    onSearch: () => {
      barcodeInputRef.current?.focus();
    },
  });

  // Auto-focus barcode input on mount
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Handle barcode scan (Enter key)
  const handleBarcodeScan = useCallback(
    (value: string) => {
      const trimmedValue = value.trim();
      if (!trimmedValue) return;

      // Search by barcode or SKU
      const foundProduct = products.find(
        (p) =>
          (p.barcode &&
            p.barcode.toLowerCase() === trimmedValue.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase() === trimmedValue.toLowerCase())
      );

      if (foundProduct) {
        addItem(foundProduct, 1);
        toast.success(`تمت الإضافة: ${foundProduct.name}`);
      } else {
        toast.error(`لم يتم العثور على منتج بالباركود: ${trimmedValue}`);
      }

      // Clear input and refocus
      setBarcodeInput("");
      barcodeInputRef.current?.focus();
    },
    [products, addItem]
  );

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBarcodeScan(barcodeInput);
    }
  };

  // Filter products by category and availability
  let filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  // Filter by available stock if enabled
  if (showAvailableOnly) {
    filteredProducts = filteredProducts.filter((p) => {
      // If product doesn't track inventory, it's always available
      if (!p.trackInventory) return true;
      // Only show products with stock > 0
      return (p.stockQuantity ?? 0) > 0;
    });
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-gray-50 p-4 min-w-0">
        {/* Low Stock Alert - Admin/Manager only */}
        <LowStockAlert />

        {/* Barcode Scanner Input */}
        <div className="mb-4">
          <div className="relative">
            <ScanBarcode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="🔍 مسح الباركود أو الـ SKU"
              className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Categories and Filters */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <CategoryTabs
              categories={categories}
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />

            {/* Available Stock Filter */}
            <button
              onClick={() => setShowAvailableOnly(!showAvailableOnly)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                showAvailableOnly
                  ? "bg-success-100 text-success-700 border border-success-300"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
              title="عرض المنتجات المتاحة في المخزون فقط"
            >
              <PackageCheck className="w-4 h-4" />
              <span className="hidden sm:inline">المتاح فقط</span>
            </button>
          </div>

          {/* Mobile cart toggle */}
          <button
            onClick={() => setShowMobileCart(!showMobileCart)}
            className="lg:hidden relative p-2 border border-gray-200 rounded-lg hover:bg-gray-100 shrink-0"
          >
            <Menu className="w-5 h-5" />
            {itemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {itemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
          <ProductGrid products={filteredProducts} categories={categories} />
        </div>
      </div>

      {/* Cart Section - Desktop */}
      <div className="hidden lg:flex w-96 bg-white border-l border-gray-200 p-4 flex-col shrink-0">
        <Cart
          onCheckout={() => setShowPayment(true)}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={setSelectedCustomer}
        />
      </div>

      {/* Cart Section - Mobile Slide-in */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-4 animate-slide-in-right shadow-2xl flex flex-col">
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

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          onClose={() => setShowPayment(false)}
          selectedCustomer={selectedCustomer}
          onOrderComplete={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

export default POSPage;
