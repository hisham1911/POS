import { Category } from "@/types/category.types";
import clsx from "clsx";

interface CategoryTabsProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export const CategoryTabs = ({ categories, selectedId, onSelect }: CategoryTabsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* All */}
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          "px-4 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95",
          selectedId === null
            ? "bg-primary-600 text-white"
            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
        )}
        aria-pressed={selectedId === null}
      >
        🏪 الكل
      </button>

      {/* Categories */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={clsx(
            "px-4 py-3 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 active:scale-95",
            selectedId === category.id
              ? "bg-primary-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          )}
          aria-pressed={selectedId === category.id}
        >
          {category.imageUrl || "📁"} {category.name}
        </button>
      ))}
    </div>
  );
};
