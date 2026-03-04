import { useState } from "react";
import { X, Package, AlertTriangle } from "lucide-react";
import { Product } from "@/types/product.types";
import { StockAdjustmentType } from "@/types/inventory.types";
import { useAdjustProductStockMutation } from "@/api/inventoryApi";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";
import clsx from "clsx";
import { Portal } from "@/components/common/Portal";

interface StockAdjustmentModalProps {
  product: Product;
  onClose: () => void;
}

const adjustmentReasons: {
  id: StockAdjustmentType;
  label: string;
  icon: string;
}[] = [
  { id: "Receiving", label: "استلام بضاعة", icon: "📦" },
  { id: "Damage", label: "تلف / كسر", icon: "💔" },
  { id: "Adjustment", label: "جرد / تعديل", icon: "📋" },
  { id: "Transfer", label: "تحويل", icon: "🔄" },
];

export const StockAdjustmentModal = ({
  product,
  onClose,
}: StockAdjustmentModalProps) => {
  const [newQuantity, setNewQuantity] = useState<string>(
    (product.stockQuantity ?? 0).toString(),
  );
  const [adjustmentType, setAdjustmentType] =
    useState<StockAdjustmentType>("Adjustment");
  const [reason, setReason] = useState("");

  const [adjustStock, { isLoading }] = useAdjustProductStockMutation();

  const currentStock = product.stockQuantity ?? 0;
  const targetQuantity = parseInt(newQuantity) || 0;
  const quantityChange = targetQuantity - currentStock;

  const handleSubmit = async () => {
    if (targetQuantity < 0) {
      toast.error("الكمية لا يمكن أن تكون سالبة");
      return;
    }

    if (quantityChange === 0) {
      toast.info("لم يتم تغيير الكمية");
      onClose();
      return;
    }

    try {
      const result = await adjustStock({
        productId: product.id,
        data: {
          quantity: quantityChange,
          reason:
            reason ||
            adjustmentReasons.find((r) => r.id === adjustmentType)?.label ||
            "",
          adjustmentType,
        },
      }).unwrap();

      if (result.success) {
        toast.success(
          `تم تحديث المخزون: ${currentStock} → ${
            result.data?.newBalance ?? targetQuantity
          }`,
        );
        onClose();
      } else {
        toast.error(result.message || "فشل تعديل المخزون");
      }
    } catch {
      toast.error("فشل تعديل المخزون");
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">تعديل المخزون</h2>
                <p className="text-sm text-gray-500">{product.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-danger-50 hover:text-danger-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Current Stock Display */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">المخزون الحالي</p>
              <p className="text-3xl font-bold text-gray-800">{currentStock}</p>
            </div>

            {/* New Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الكمية الجديدة
              </label>
              <input
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                min="0"
                className="w-full px-4 py-3 text-center text-2xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {/* Change Preview */}
              {quantityChange !== 0 && (
                <div
                  className={clsx(
                    "mt-2 text-center text-sm font-medium",
                    quantityChange > 0 ? "text-green-600" : "text-red-600",
                  )}
                >
                  {quantityChange > 0 ? `+${quantityChange}` : quantityChange}{" "}
                  وحدة
                </div>
              )}
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سبب التعديل
              </label>
              <div className="grid grid-cols-2 gap-2">
                {adjustmentReasons.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setAdjustmentType(type.id)}
                    className={clsx(
                      "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      adjustmentType === type.id
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <span>{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات (اختياري)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="أي تفاصيل إضافية..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Warning for large changes */}
            {Math.abs(quantityChange) > 50 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-700">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span className="text-sm">
                  تغيير كبير في المخزون - يرجى التأكد
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading || quantityChange === 0}
              className="flex-1"
            >
              تأكيد التعديل
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
