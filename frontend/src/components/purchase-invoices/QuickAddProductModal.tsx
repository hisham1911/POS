import { useState } from "react";
import { toast } from "sonner";

import { useGetCategoriesQuery } from "@/api/categoriesApi";
import { useCreateProductMutation } from "@/api/productsApi";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ProductType } from "@/types/product.types";
import { formatNumber } from "@/utils/formatters";

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
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [price, setPrice] = useState<string>("");
  const [productType, setProductType] = useState<ProductType>(ProductType.Physical);

  const { data: categoriesResponse } = useGetCategoriesQuery();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const categories = categoriesResponse?.data || [];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("يرجى إدخال اسم المنتج");
      return;
    }

    if (!categoryId) {
      toast.error("يرجى اختيار الفئة");
      return;
    }

    const numPrice = Number(price) || 0;
    if (numPrice <= 0) {
      toast.error("يرجى إدخال سعر البيع");
      return;
    }

    try {
      const result = await createProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        barcode: barcode.trim() || undefined,
        categoryId,
        price: numPrice,
        cost: 0,
        type: productType,
        stockQuantity: productType === ProductType.Physical ? 0 : undefined,
        lowStockThreshold: productType === ProductType.Physical ? 5 : undefined,
      }).unwrap();

      if (result.success && result.data) {
        toast.success("تم إضافة المنتج بنجاح");
        onProductCreated(result.data.id);
        handleClose();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("فشل إضافة المنتج");
    }
  };

  const handleClose = () => {
    setName("");
    setSku("");
    setBarcode("");
    setCategoryId(0);
    setPrice("");
    setProductType(ProductType.Physical);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إضافة منتج جديد"
      description="أنشئ منتجًا بسرعة من داخل فاتورة الشراء مع حقول واضحة ومتناسقة مع النظام."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="quick-product-name">اسم المنتج *</Label>
            <Input
              id="quick-product-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثال: سماعات بلوتوث"
              required
            />
          </div>

          <div>
            <Label htmlFor="quick-product-sku">رمز المنتج (SKU)</Label>
            <Input
              id="quick-product-sku"
              type="text"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="ELEC001"
              dir="ltr"
              className="font-numeric"
            />
          </div>

          <div>
            <Label htmlFor="quick-product-barcode">الباركود</Label>
            <Input
              id="quick-product-barcode"
              type="text"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              placeholder="6291041500213"
              dir="ltr"
              className="font-numeric"
            />
          </div>

          <div>
            <Label htmlFor="quick-product-category">الفئة *</Label>
            <Select
              id="quick-product-category"
              value={categoryId}
              onChange={(event) => setCategoryId(Number(event.target.value))}
              required
            >
              <option value={0}>اختر الفئة</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="quick-product-type">نوع المنتج *</Label>
            <Select
              id="quick-product-type"
              value={productType}
              onChange={(event) => setProductType(Number(event.target.value) as ProductType)}
              required
            >
              <option value={ProductType.Physical}>منتج مادي (يتتبع المخزون)</option>
              <option value={ProductType.Service}>خدمة (لا يتتبع المخزون)</option>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              {productType === ProductType.Physical
                ? "المنتجات المادية تبدأ بمخزون صفري وحد أدنى افتراضي قدره 5 وحدات."
                : "الخدمات لا تحتاج تتبع مخزون ويمكن بيعها مباشرة."}
            </p>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="quick-product-price">سعر البيع *</Label>
            <Input
              id="quick-product-price"
              type="number"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
              className="font-numeric"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              سيتم تحديث تكلفة المنتج لاحقًا من بيانات فاتورة الشراء.
            </p>
          </div>
        </div>

        <div className="feedback-panel flex items-center justify-between" data-tone="info">
          <div>
            <p className="font-semibold text-foreground">إعداد افتراضي سريع</p>
            <p className="mt-1 text-sm text-muted-foreground">يمكن تعديل باقي تفاصيل المنتج بعد إنشائه من شاشة المنتجات.</p>
          </div>
          <span className="font-numeric rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {productType === ProductType.Physical ? `${formatNumber(5)} حد أدنى` : "خدمة"}
          </span>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
          <Button type="button" variant="ghost" onClick={handleClose}>
            إلغاء
          </Button>
          <Button type="submit" isLoading={isLoading}>
            إضافة المنتج
          </Button>
        </div>
      </form>
    </Modal>
  );
}
