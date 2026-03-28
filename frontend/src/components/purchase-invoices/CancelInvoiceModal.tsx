import { useState } from "react";
import { toast } from "sonner";

import { useCancelPurchaseInvoiceMutation } from "@/api/purchaseInvoiceApi";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";

interface CancelInvoiceModalProps {
  invoiceId: number;
  isConfirmed: boolean;
  onClose: () => void;
}

export function CancelInvoiceModal({ invoiceId, isConfirmed, onClose }: CancelInvoiceModalProps) {
  const [reason, setReason] = useState<string>("");
  const [adjustInventory, setAdjustInventory] = useState<boolean>(true);

  const [cancelInvoice, { isLoading }] = useCancelPurchaseInvoiceMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!reason.trim()) {
      toast.error("يرجى إدخال سبب الإلغاء");
      return;
    }

    try {
      const result = await cancelInvoice({
        id: invoiceId,
        data: {
          reason: reason.trim(),
          adjustInventory: isConfirmed ? adjustInventory : false,
        },
      }).unwrap();

      if (result.success) {
        toast.success("تم إلغاء الفاتورة بنجاح");
        onClose();
      } else {
        toast.error(result.message || "فشل إلغاء الفاتورة");
      }
    } catch (error: any) {
      console.error("Error cancelling invoice:", error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("حدث خطأ أثناء إلغاء الفاتورة");
      }
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="إلغاء الفاتورة"
      description="هذه العملية نهائية، لذلك أضف سببًا واضحًا وحدد ما إذا كان يجب تعديل المخزون."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="feedback-panel" data-tone="danger">
          <p className="font-semibold text-foreground">تحذير مهم</p>
          <p className="mt-1 text-sm text-muted-foreground">لا يمكن التراجع عن إلغاء الفاتورة بعد تنفيذ العملية.</p>
        </div>

        <div>
          <label className="mb-2 inline-flex text-sm font-semibold text-foreground" htmlFor="cancel-reason">
            سبب الإلغاء *
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={5}
            placeholder="يرجى إدخال سبب إلغاء الفاتورة"
            required
            className="interactive-ring min-h-[8rem] w-full rounded-2xl border border-border bg-card/82 px-4 py-3 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground/80 focus:border-ring focus:bg-card"
          />
        </div>

        {isConfirmed ? (
          <label className="surface-outline flex cursor-pointer items-start justify-between gap-4 rounded-[calc(var(--radius)-0.1rem)] p-4">
            <div>
              <p className="font-semibold text-foreground">تعديل المخزون</p>
              <p className="mt-1 text-sm text-muted-foreground">سيتم خصم الكميات من المخزون عند إلغاء الفاتورة المؤكدة.</p>
            </div>
            <input
              type="checkbox"
              checked={adjustInventory}
              onChange={(event) => setAdjustInventory(event.target.checked)}
              className="mt-1"
            />
          </label>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" variant="danger" isLoading={isLoading}>
            إلغاء الفاتورة
          </Button>
        </div>
      </form>
    </Modal>
  );
}
