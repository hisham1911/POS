import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useAddCustomItemMutation } from "@/api/ordersApi";
import { toast } from "sonner";
import { AddCustomItemRequest } from "@/types/order.types";
import { Portal } from "@/components/common/Portal";
import { numberToDisplay, displayToNumber } from "@/hooks/useNumberInput";

interface CustomItemModalProps {
  orderId?: number; // Optional now
  onClose: () => void;
  onSuccess?: (item: AddCustomItemRequest) => void;
}

export const CustomItemModal = ({
  orderId,
  onClose,
  onSuccess,
}: CustomItemModalProps) => {
  const [formData, setFormData] = useState<AddCustomItemRequest>({
    name: "",
    unitPrice: 0,
    quantity: 1,
    taxRate: 14, // الضريبة الافتراضية 14%
    notes: "",
  });

  const [addCustomItem, { isLoading }] = useAddCustomItemMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("الرجاء إدخال اسم المنتج");
      return;
    }

    if (formData.unitPrice <= 0) {
      toast.error("الرجاء إدخال سعر صحيح");
      return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      toast.error("الرجاء إدخال كمية صحيحة");
      return;
    }

    // If orderId is provided, add to existing order via API
    if (orderId) {
      try {
        const result = await addCustomItem({
          orderId,
          item: formData,
        }).unwrap();

        if (result.success) {
          toast.success(`تم إضافة: ${formData.name}`);
          onSuccess?.(formData);
          onClose();
        }
      } catch (error: any) {
        toast.error(error?.data?.message || "فشل في إضافة المنتج المخصص");
      }
    } else {
      // Otherwise, just return the data to parent component
      onSuccess?.(formData);
      onClose();
    }
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <div 
          className="glass-panel w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/12 text-warning">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">منتج مخصص</h2>
                <p className="text-sm text-muted-foreground">للطلب الحالي فقط</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-4 overflow-y-auto flex-1"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                الاسم *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="مثال: رسوم توصيل، خدمة تغليف"
                required
                autoFocus
              />
            </div>

            {/* Price & Quantity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  السعر *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={numberToDisplay(formData.unitPrice)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitPrice: displayToNumber(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  الكمية *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  placeholder="1"
                  required
                />
              </div>
            </div>

            {/* Tax Rate */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                نسبة الضريبة (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxRate: parseFloat(e.target.value) || 14,
                  })
                }
                className="w-full rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="14"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                الافتراضي: 14% (ضريبة القيمة المضافة)
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                ملاحظات (اختياري)
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full resize-none rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="أي ملاحظات إضافية..."
                rows={2}
              />
            </div>

            {/* Preview */}
            <div className="feedback-panel p-4" data-tone="warning">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">الإجمالي المتوقع:</span>
                <span className="text-lg font-bold text-warning">
                  {(
                    formData.unitPrice *
                    (formData.quantity || 1) *
                    (1 + (formData.taxRate || 0) / 100)
                  ).toFixed(2)}{" "}
                  ج.م
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formData.unitPrice.toFixed(2)} × {formData.quantity || 1} +
                ضريبة {formData.taxRate || 0}%
              </p>
            </div>
          </form>

          {/* Actions - Fixed at bottom */}
          <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-muted"
              disabled={orderId ? isLoading : false}
            >
              إلغاء
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-warning px-4 py-2.5 font-medium text-warning-foreground transition-colors hover:bg-warning/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={orderId ? isLoading : false}
            >
              {orderId && isLoading ? "جاري الإضافة..." : "إضافة للطلب"}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
