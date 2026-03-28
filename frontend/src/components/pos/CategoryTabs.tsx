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
        className={clsx("choice-chip whitespace-nowrap active:scale-95")}
        data-selected={selectedId === null}
        aria-pressed={selectedId === null}
      >
        <span className="choice-chip-icon flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition">🏪</span>
        <span>الكل</span>
      </button>

      {/* Categories */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={clsx("choice-chip whitespace-nowrap active:scale-95")}
          data-selected={selectedId === category.id}
          aria-pressed={selectedId === category.id}
        >
          <span className="choice-chip-icon flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition">
            {category.imageUrl || "📁"}
          </span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
};
