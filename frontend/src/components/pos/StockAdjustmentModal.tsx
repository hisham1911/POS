import clsx from "clsx";
import { AlertTriangle, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAdjustProductStockMutation } from "@/api/inventoryApi";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { StockAdjustmentType } from "@/types/inventory.types";
import type { Product } from "@/types/product.types";
import { formatNumber } from "@/utils/formatters";

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
  const [newQuantity, setNewQuantity] = useState<string>((product.stockQuantity ?? 0).toString());
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentType>("Adjustment");
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
          reason: reason || adjustmentReasons.find((item) => item.id === adjustmentType)?.label || "",
          adjustmentType,
        },
      }).unwrap();

      if (result.success) {
        toast.success(`تم تحديث المخزون: ${formatNumber(currentStock)} → ${formatNumber(result.data?.newBalance ?? targetQuantity)}`);
        onClose();
      } else {
        toast.error(result.message || "فشل تعديل المخزون");
      }
    } catch {
      toast.error("فشل تعديل المخزون");
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="تعديل المخزون"
      description={`مراجعة كمية ${product.name} وتوثيق سبب التغيير بشكل واضح ومتوافق مع الثيم.`}
      size="md"
    >
      <div className="space-y-5">
        <div className="mesh-preview rounded-[calc(var(--radius)+0.05rem)] p-4">
          <div className="surface-outline flex items-center justify-between rounded-[calc(var(--radius)+0.1rem)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{product.name}</p>
                <p className="text-sm text-muted-foreground">المخزون الحالي</p>
              </div>
            </div>
            <span className="font-numeric text-3xl font-black text-foreground">{formatNumber(currentStock)}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="stock-target">الكمية الجديدة</Label>
          <Input
            id="stock-target"
            type="number"
            value={newQuantity === "0" ? "" : newQuantity}
            onChange={(event) => setNewQuantity(event.target.value)}
            min="0"
            placeholder="0"
            className="font-numeric h-14 text-center text-2xl font-black"
          />
          {quantityChange !== 0 ? (
            <p className={clsx("font-numeric mt-2 text-center text-sm font-semibold", quantityChange > 0 ? "text-success" : "text-destructive")}>
              {quantityChange > 0 ? `+${formatNumber(quantityChange)}` : formatNumber(quantityChange)} وحدة
            </p>
          ) : null}
        </div>

        <div>
          <Label>سبب التعديل</Label>
          <div className="grid grid-cols-2 gap-3">
            {adjustmentReasons.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAdjustmentType(item.id)}
                className={clsx("choice-chip min-h-[4.5rem] items-center justify-start gap-3 rounded-[calc(var(--radius)-0.1rem)]", adjustmentType === item.id && "scale-[1.01]")}
                data-selected={adjustmentType === item.id}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="stock-reason">ملاحظات إضافية</Label>
          <Input
            id="stock-reason"
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="أي تفاصيل إضافية"
          />
        </div>

        {Math.abs(quantityChange) > 50 ? (
          <div className="feedback-panel flex items-center gap-3" data-tone="warning">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-sm text-foreground">تغيير كبير في المخزون، راجع الكمية قبل الحفظ.</p>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
          <Button variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={isLoading || quantityChange === 0}>
            تأكيد التعديل
          </Button>
        </div>
      </div>
    </Modal>
  );
};
