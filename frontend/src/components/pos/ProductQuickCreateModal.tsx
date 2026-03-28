import { useState } from "react";
import { X, Package, DollarSign, Tag, Hash, Barcode, ChevronDown } from "lucide-react";
import { useQuickCreateProductMutation } from "@/api/productsApi";
import { useCategories } from "@/hooks/useProducts";
import { toast } from "sonner";
import { QuickCreateProductRequest, ProductType } from "@/types/product.types";
import { Portal } from "@/components/common/Portal";

interface ProductQuickCreateModalProps {
  onClose: () => void;
  onSuccess?: (productId: number) => void;
  initialName?: string;
}

export const ProductQuickCreateModal = ({
  onClose,
  onSuccess,
  initialName = "",
}: ProductQuickCreateModalProps) => {
  const [formData, setFormData] = useState<Omit<QuickCreateProductRequest, 'price' | 'initialStock'> & { price: string | number; initialStock: string | number }>({
    name: initialName,
    price: "" as string | number,
    categoryId: 0,
    type: ProductType.Service, // افتراضياً خدمة للإنشاء السريع
    initialStock: "" as string | number,
    sku: "",
    barcode: "",
  });

  const [quickCreate, { isLoading }] = useQuickCreateProductMutation();
  const { categories } = useCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("الرجاء إدخال اسم المنتج");
      return;
    }

    const numPrice = Number(formData.price) || 0;
    if (numPrice <= 0) {
      toast.error("الرجاء إدخال سعر صحيح");
      return;
    }

    if (!formData.categoryId) {
      toast.error("الرجاء اختيار التصنيف");
      return;
    }

    try {
      const result = await quickCreate({
        ...formData,
        price: numPrice,
        initialStock: Number(formData.initialStock) || 0,
      }).unwrap();

      if (result.success && result.data) {
        toast.success(`تم إضافة المنتج: ${result.data.name}`);
        onSuccess?.(result.data.id);
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "فشل في إضافة المنتج");
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
        <div className="glass-panel w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                إضافة منتج سريع
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                اسم المنتج *
              </label>
              <div className="relative">
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-input bg-card/80 py-2.5 pl-4 pr-10 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="مثال: قهوة تركي"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                السعر *
              </label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-input bg-card/80 py-2.5 pl-4 pr-10 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                التصنيف *
              </label>
              <div className="relative">
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value),
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-input bg-card/80 py-2.5 pl-10 pr-4 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-border focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  required
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Product Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                نوع المنتج *
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: parseInt(e.target.value) as ProductType,
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-input bg-card/80 py-2.5 pl-10 pr-4 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:border-border focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  required
                >
                  <option value={ProductType.Service}>
                    خدمة (لا يتتبع المخزون)
                  </option>
                  <option value={ProductType.Physical}>
                    منتج مادي (يتتبع المخزون)
                  </option>
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formData.type === ProductType.Service
                  ? "الخدمات لا تحتاج تتبع مخزون (مثل: التوصيل، الصيانة)"
                  : "المنتجات المادية تحتاج تتبع مخزون (مثل: القهوة، الطعام)"}
              </p>
            </div>

            {/* Initial Stock (only for Physical products) */}
            {formData.type === ProductType.Physical && (
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  الكمية الأولية
                </label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    min="0"
                    value={formData.initialStock || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialStock: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-input bg-card/80 py-2.5 pl-4 pr-10 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* SKU (optional) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                SKU (اختياري)
              </label>
              <input
                type="text"
                value={formData.sku || ""}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                className="w-full rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="مثال: COFFEE-001"
              />
            </div>

            {/* Barcode (optional) */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                الباركود (اختياري)
              </label>
              <div className="relative">
                <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.barcode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  className="w-full rounded-xl border border-input bg-card/80 py-2.5 pl-4 pr-10 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="مثال: 1234567890123"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-muted"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "جاري الإضافة..." : "إضافة المنتج"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};
