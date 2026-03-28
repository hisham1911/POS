import { useState } from "react";
import { toast } from "sonner";

import { useAddPaymentMutation } from "@/api/purchaseInvoiceApi";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { PaymentMethod } from "@/types/purchaseInvoice.types";
import { formatCurrency } from "@/utils/formatters";

interface AddPaymentModalProps {
  invoiceId: number;
  amountDue: number;
  onClose: () => void;
}

export function AddPaymentModal({ invoiceId, amountDue, onClose }: AddPaymentModalProps) {
  const [amount, setAmount] = useState<string>(String(amountDue));
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [addPayment, { isLoading }] = useAddPaymentMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) {
      toast.error("المبلغ يجب أن يكون أكبر من صفر");
      return;
    }

    if (numAmount > amountDue) {
      toast.error(`المبلغ يتجاوز المبلغ المستحق (${formatCurrency(amountDue)})`);
      return;
    }

    try {
      const paymentData = {
        amount: numAmount,
        paymentDate: new Date(paymentDate).toISOString(),
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const result = await addPayment({
        invoiceId,
        payment: paymentData,
      }).unwrap();

      if (result.success) {
        toast.success("تم إضافة الدفعة بنجاح");
        onClose();
      } else {
        toast.error(result.message || "فشل إضافة الدفعة");
      }
    } catch (error: any) {
      console.error("Error adding payment:", error);
      console.error("Validation errors:", error?.data?.errors);

      if (error?.data?.errors) {
        const errorMessages = Object.entries(error.data.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(", ")}`)
          .join("\n");
        toast.error(`خطأ في التحقق:\n${errorMessages}`);
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("حدث خطأ أثناء إضافة الدفعة");
      }
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="إضافة دفعة"
      description="سجل دفعة المورد بالطريقة المناسبة مع إبقاء البيانات واضحة في الثيمات الفاتحة والداكنة."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="feedback-panel flex items-center justify-between" data-tone="info">
          <div>
            <p className="font-semibold text-foreground">المبلغ المستحق</p>
            <p className="mt-1 text-sm text-muted-foreground">لن يسمح النظام بإضافة دفعة تتجاوز الرصيد الحالي.</p>
          </div>
          <span className="font-numeric text-xl font-black text-primary">{formatCurrency(amountDue)}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="payment-amount">المبلغ *</Label>
            <Input
              id="payment-amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              min="0.01"
              max={amountDue}
              step="0.01"
              required
              className="font-numeric"
            />
          </div>

          <div>
            <Label htmlFor="payment-date">تاريخ الدفع *</Label>
            <Input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="payment-method">طريقة الدفع *</Label>
            <Select
              id="payment-method"
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              required
            >
              <option value="Cash">نقدي</option>
              <option value="Card">بطاقة</option>
              <option value="Fawry">فوري</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="payment-reference">رقم المرجع</Label>
            <Input
              id="payment-reference"
              type="text"
              value={referenceNumber}
              onChange={(event) => setReferenceNumber(event.target.value)}
              placeholder="اختياري"
              className="font-numeric"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="payment-notes">ملاحظات</Label>
            <textarea
              id="payment-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="ملاحظات اختيارية"
              className="interactive-ring min-h-[7rem] w-full rounded-2xl border border-border bg-card/82 px-4 py-3 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground/80 focus:border-ring focus:bg-card"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" isLoading={isLoading}>
            حفظ الدفعة
          </Button>
        </div>
      </form>
    </Modal>
  );
}
