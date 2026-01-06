import { Product } from "@/types/product.types";
import { ProductCard } from "./ProductCard";
import { Package } from "lucide-react";

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Package className="w-16 h-16 mx-auto mb-4" />
        <p className="text-lg">لا توجد منتجات في هذا التصنيف</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
