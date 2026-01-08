import { useState } from "react";
import { X } from "lucide-react";
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/product.types";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import clsx from "clsx";

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductFormModal = ({
  product,
  onClose,
}: ProductFormModalProps) => {
  const { createProduct, updateProduct, isCreating, isUpdating } =
    useProducts();
  const { categories } = useCategories();
  const isEditing = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || "",
    nameEn: product?.nameEn || "",
    description: product?.description || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    price: product?.price || 0,
    cost: product?.cost || 0,
    categoryId: product?.categoryId || categories[0]?.id || 0,
    stockQuantity: product?.stockQuantity ?? 0,
    lowStockThreshold: product?.lowStockThreshold ?? 5,
    isActive: product?.isActive ?? true,
  });

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
        categoryId: formData.categoryId,
        trackInventory: true,
        stockQuantity: formData.stockQuantity,
        lowStockThreshold: formData.lowStockThreshold,
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
        categoryId: formData.categoryId,
        trackInventory: true,
        stockQuantity: formData.stockQuantity,
        lowStockThreshold: formData.lowStockThreshold,
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
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={(e) =>
              setFormData({ ...formData, nameEn: e.target.value })
            }
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
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
          <Input
            label="الباركود"
            value={formData.barcode}
            onChange={(e) =>
              setFormData({ ...formData, barcode: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
            label="حد التنبيه (المخزون المنخفض)"
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
        </div>

        <div className="flex gap-3 pt-4">
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
