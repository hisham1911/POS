import { Product } from "@/types/product.types";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatters";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleClick = () => {
    if (product.isActive) {
      addItem(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!product.isActive}
      className="card-hover p-3 text-right w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">📦</span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-gray-800 truncate mb-1">{product.name}</h3>

      {/* Price */}
      <p className="text-primary-600 font-bold text-lg">{formatCurrency(product.price)}</p>

      {/* Out of stock */}
      {!product.isActive && (
        <span className="badge-danger mt-2">غير متوفر</span>
      )}
    </button>
  );
};
