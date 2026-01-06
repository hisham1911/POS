import { useState } from "react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CategoryTabs } from "@/components/pos/CategoryTabs";
import { Cart } from "@/components/pos/Cart";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { Loading } from "@/components/common/Loading";
import { Menu } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export const POSPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const { products, isLoading } = useProducts();
  const { categories } = useCategories();
  const { itemsCount } = useCart();

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Products Section */}
      <div className="flex-1 flex flex-col bg-gray-50 p-4 overflow-hidden">
        {/* Categories */}
        <div className="flex items-center justify-between mb-4">
          <CategoryTabs
            categories={categories}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* Mobile cart toggle */}
          <button
            onClick={() => setShowMobileCart(!showMobileCart)}
            className="lg:hidden relative p-2 border border-gray-200 rounded-lg hover:bg-gray-100"
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
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <ProductGrid products={filteredProducts} />
        </div>
      </div>

      {/* Cart Section - Desktop */}
      <div className="hidden lg:block w-96 bg-white border-r border-gray-200 p-4 overflow-hidden">
        <Cart onCheckout={() => setShowPayment(true)} />
      </div>

      {/* Cart Section - Mobile Slide-in */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-4 animate-slide-in-right shadow-2xl">
            <Cart
              onCheckout={() => {
                setShowMobileCart(false);
                setShowPayment(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
    </div>
  );
};

export default POSPage;
