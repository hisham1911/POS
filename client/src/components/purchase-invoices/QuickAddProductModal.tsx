import { useState } from 'react';
import { useCreateProductMutation } from '../../api/productsApi';
import { useGetCategoriesQuery } from '../../api/categoriesApi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { toast } from 'sonner';

interface QuickAddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: (productId: number) => void;
}

export function QuickAddProductModal({
  isOpen,
  onClose,
  onProductCreated,
}: QuickAddProductModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const categories = categoriesResponse?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('يرجى إدخال اسم المنتج');
      return;
    }

    if (!categoryId) {
      toast.error('يرجى اختيار الفئة');
      return;
    }

    if (price <= 0) {
      toast.error('يرجى إدخال سعر البيع');
      return;
    }

    try {
      const result = await createProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        categoryId,
        price,
        cost: 0, // Will be set from purchase invoice
        trackInventory: true,
        stockQuantity: 0,
        lowStockThreshold: 5,
      }).unwrap();

      if (result.success && result.data) {
        toast.success('تم إضافة المنتج بنجاح');
        onProductCreated(result.data.id);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('فشل إضافة المنتج');
    }
  };

  const handleClose = () => {
    setName('');
    setSku('');
    setBarcode('');
    setCategoryId(0);
    setPrice(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="إضافة منتج جديد">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            اسم المنتج <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="مثال: سماعات بلوتوث"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">رمز المنتج (SKU)</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="ELEC001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الباركود</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="6291041500213"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            الفئة <span className="text-red-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value={0}>اختر الفئة</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            سعر البيع <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            سيتم تحديث تكلفة المنتج تلقائياً من فاتورة الشراء
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري الإضافة...' : 'إضافة المنتج'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
