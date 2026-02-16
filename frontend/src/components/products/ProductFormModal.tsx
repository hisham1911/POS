import { useState, useEffect } from "react";
import { X, Image as ImageIcon, Package } from "lucide-react";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product.types";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useGetBranchesQuery } from "@/api/branchesApi";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import clsx from "clsx";

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
}

// Emoji icons for products
const PRODUCT_ICONS = [
  "☕", "🍕", "🍔", "🍟", "🌭", "🥪", "🌮", "🌯", "🥙", "🍗",
  "🍖", "🥩", "🍤", "🍱", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣",
  "🍰", "🎂", "🧁", "🍪", "🍩", "🍨", "🍦", "🥤", "🧃", "🧋",
  "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍶", "🥛",
  "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒",
  "🥗", "🥘", "🍲", "🥫", "🧂", "🧈", "🥖", "🥐", "🥯", "🍞"
];

export const ProductFormModal = ({
  product,
  onClose,
}: ProductFormModalProps) => {
  const { createProduct, updateProduct, isCreating, isUpdating } = useProducts();
  const { categories } = useCategories();
  const { data: branches } = useGetBranchesQuery();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    price: product?.price || 0,
    cost: product?.cost || 0,
    taxRate: product?.taxRate ?? null,
    taxInclusive: product?.taxInclusive ?? true,
    imageUrl: product?.imageUrl || "",
    categoryId: product?.categoryId || categories[0]?.id || 0,
    stockQuantity: product?.stockQuantity ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    reorderPoint: product?.reorderPoint ?? null,
    isActive: product?.isActive ?? true,
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [branchStocks, setBranchStocks] = useState<Record<number, number>>({});
  const [useBranchSpecificStock, setUseBranchSpecificStock] = useState(false);

  // Initialize branch stocks with default quantity
  useEffect(() => {
    if (branches?.data && !isEditing) {
      const initialStocks: Record<number, number> = {};
      branches.data.forEach(branch => {
        initialStocks[branch.id] = formData.stockQuantity;
      });
      setBranchStocks(initialStocks);
    }
  }, [branches?.data, formData.stockQuantity, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && product) {
      // تحديث المنتج
      const updateData: UpdateProductRequest = {
        name: formData.name,
        nameEn: formData.nameEn,
        description: formData.description,
        sku: formData.sku,
        barcode: formData.barcode,
        price: formData.price,
        cost: formData.cost,
        taxRate: formData.taxRate ?? undefined,
        taxInclusive: formData.taxInclusive,
        imageUrl: formData.imageUrl,
        categoryId: formData.categoryId,
        trackInventory: true,
        stockQuantity: formData.stockQuantity,
        lowStockThreshold: formData.lowStockThreshold,
        reorderPoint: formData.reorderPoint ?? undefined,
        isActive: formData.isActive,
      };
      await updateProduct(product.id, updateData);
    } else {
      // إنشاء منتج جديد
      const createData: CreateProductRequest = {
        name: formData.name,
        nameEn: formData.nameEn,
        description: formData.description,
        sku: formData.sku,
        barcode: formData.barcode,
        price: formData.price,
        cost: formData.cost,
        taxRate: formData.taxRate ?? undefined,
        taxInclusive: formData.taxInclusive,
        imageUrl: formData.imageUrl,
        categoryId: formData.categoryId,
        trackInventory: true,
        stockQuantity: formData.stockQuantity,
        lowStockThreshold: formData.lowStockThreshold,
        reorderPoint: formData.reorderPoint ?? undefined,
        branchStockQuantities: useBranchSpecificStock ? branchStocks : undefined,
      };
      await createProduct(createData);
    }

    onClose();
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
            المعلومات الأساسية
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="اسم المنتج (عربي) *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="اسم المنتج (إنجليزي)"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
              placeholder="وصف المنتج (اختياري)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              التصنيف *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">اختر التصنيف</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Icon Picker */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
            الأيقونة
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              أيقونة المنتج
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                {formData.imageUrl ? (
                  <span className="text-2xl">{formData.imageUrl}</span>
                ) : (
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm">اختر أيقونة</span>
              </button>
              {formData.imageUrl && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {showIconPicker && (
              <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50 grid grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                {PRODUCT_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, imageUrl: icon });
                      setShowIconPicker(false);
                    }}
                    className={clsx(
                      "text-2xl p-2 rounded hover:bg-white transition-colors",
                      formData.imageUrl === icon && "bg-primary-100 ring-2 ring-primary-500"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
            التسعير والضرائب
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="سعر البيع *"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
            <Input
              label="سعر التكلفة"
              type="number"
              min="0"
              step="0.01"
              value={formData.cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="معدل الضريبة (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxRate: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                placeholder="استخدام الافتراضي (14%)"
              />
              <p className="text-xs text-gray-500 mt-1">
                اتركه فارغاً لاستخدام معدل الفرع الافتراضي
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                السعر شامل الضريبة؟
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.taxInclusive}
                    onChange={() => setFormData({ ...formData, taxInclusive: true })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm">نعم (شامل)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.taxInclusive}
                    onChange={() => setFormData({ ...formData, taxInclusive: false })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm">لا (غير شامل)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Codes */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
            الأكواد
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="كود المنتج"
            />
            <Input
              label="الباركود"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              placeholder="رقم الباركود"
            />
          </div>
        </div>

        {/* Inventory */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
            <Package className="w-4 h-4" />
            المخزون
          </h3>
          
          {!isEditing && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="branchSpecific"
                checked={useBranchSpecificStock}
                onChange={(e) => setUseBranchSpecificStock(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="branchSpecific" className="text-sm text-gray-700 cursor-pointer">
                تحديد كمية مختلفة لكل فرع
              </label>
            </div>
          )}

          {!useBranchSpecificStock ? (
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="الكمية المتاحة *"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockQuantity: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
              <Input
                label="حد التنبيه"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lowStockThreshold: parseInt(e.target.value) || 5,
                  })
                }
              />
              <Input
                label="نقطة إعادة الطلب"
                type="number"
                min="0"
                value={formData.reorderPoint ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderPoint: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="اختياري"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                حدد الكمية المبدئية لكل فرع:
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                {branches?.data?.map((branch) => (
                  <div key={branch.id} className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 flex-1">
                      {branch.name}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={branchStocks[branch.id] || 0}
                      onChange={(e) =>
                        setBranchStocks({
                          ...branchStocks,
                          [branch.id]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="flex-1"
          >
            {isEditing ? "حفظ التغييرات" : "إضافة المنتج"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
