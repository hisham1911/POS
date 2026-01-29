import { useState } from 'react';
import { useAddPaymentMutation } from '../../api/purchaseInvoiceApi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import type { PaymentMethod } from '../../types/purchaseInvoice.types';

interface AddPaymentModalProps {
  invoiceId: number;
  amountDue: number;
  onClose: () => void;
}

export function AddPaymentModal({ invoiceId, amountDue, onClose }: AddPaymentModalProps) {
  const [amount, setAmount] = useState<number>(amountDue);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [addPayment, { isLoading }] = useAddPaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast.error('المبلغ يجب أن يكون أكبر من صفر');
      return;
    }

    if (amount > amountDue) {
      toast.error(`المبلغ يتجاوز المبلغ المستحق (${formatCurrency(amountDue)})`);
      return;
    }

    try {
      const paymentData = {
        amount,
        paymentDate: new Date(paymentDate).toISOString(),
        method,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      
      console.log('Sending payment data:', paymentData);
      console.log('Payment data JSON:', JSON.stringify(paymentData, null, 2));
      
      const result = await addPayment({
        invoiceId,
        payment: paymentData,
      }).unwrap();

      if (result.success) {
        toast.success('تم إضافة الدفعة بنجاح');
        onClose();
      } else {
        toast.error(result.message || 'فشل إضافة الدفعة');
      }
    } catch (error: any) {
      console.error('Error adding payment:', error);
      console.error('Validation errors:', error?.data?.errors);
      
      if (error?.data?.errors) {
        // Show validation errors
        const errorMessages = Object.entries(error.data.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        toast.error(`خطأ في التحقق:\n${errorMessages}`);
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error('حدث خطأ أثناء إضافة الدفعة');
      }
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="إضافة دفعة">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            المبلغ <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
            min="0.01"
            max={amountDue}
            step="0.01"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            المبلغ المستحق: {formatCurrency(amountDue)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            تاريخ الدفع <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            طريقة الدفع <span className="text-red-500">*</span>
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="Cash">نقدي</option>
            <option value="Card">بطاقة</option>
            <option value="Fawry">فوري</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">رقم المرجع</label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="اختياري"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="ملاحظات اختيارية"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
