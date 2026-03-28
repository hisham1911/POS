import { Category } from "@/types/category.types";
import clsx from "clsx";

interface CategoryChipsProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export const CategoryChips = ({
  categories,
  selectedId,
  onSelect,
}: CategoryChipsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* All Categories */}
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          "choice-chip",
          selectedId === null && "scale-[1.02]"
        )}
        data-selected={selectedId === null}
      >
        الكل
      </button>

      {/* Category Chips */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={clsx(
            "choice-chip",
            selectedId === category.id && "scale-[1.02]"
          )}
          data-selected={selectedId === category.id}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
