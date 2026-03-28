import { FileText, Mail, MapPin, Phone, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { useCreateCustomerMutation } from "@/api/customersApi";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Customer } from "@/types/customer.types";

interface CustomerQuickCreateModalProps {
  initialPhone: string;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

export const CustomerQuickCreateModal = ({
  initialPhone,
  onClose,
  onSuccess,
}: CustomerQuickCreateModalProps) => {
  const [formData, setFormData] = useState({
    phone: initialPhone,
    name: "",
    email: "",
    address: "",
    notes: "",
  });

  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.phone || formData.phone.length < 8) {
      toast.error("رقم الهاتف غير صحيح");
      return;
    }

    try {
      const result = await createCustomer({
        phone: formData.phone,
        name: formData.name || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
      }).unwrap();

      if (result.success && result.data) {
        toast.success("تم إضافة العميل بنجاح");
        onSuccess(result.data);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "فشل في إضافة العميل");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="إضافة عميل جديد"
      description="أدخل الحد الأدنى من البيانات لربط العميل بالفاتورة بسرعة، مع بقاء النموذج واضحًا في كل الثيمات."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="feedback-panel flex items-start gap-3" data-tone="info">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">إنشاء عميل سريع</p>
            <p className="mt-1 text-sm text-muted-foreground">
              الحقول الاختيارية تساعد لاحقًا في الفواتير والبحث وسجل العملاء، لكن الهاتف يكفي للبدء.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="customer-phone">رقم الهاتف *</Label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="customer-phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                dir="ltr"
                placeholder="01xxxxxxxxx"
                className="font-numeric pe-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customer-name">الاسم</Label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="customer-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="اسم العميل"
                className="pe-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customer-email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="customer-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                dir="ltr"
                placeholder="email@example.com"
                className="pe-10"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="customer-address">العنوان</Label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="customer-address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="عنوان العميل"
                className="pe-10"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="customer-notes">ملاحظات</Label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="customer-notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="أي ملاحظات إضافية"
                className="interactive-ring min-h-[7rem] w-full rounded-2xl border border-border bg-card/82 pe-10 ps-4 pt-3 text-sm text-foreground shadow-sm transition placeholder:text-muted-foreground/80 focus:border-ring focus:bg-card"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-border/70 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            إلغاء
          </Button>
          <Button type="submit" isLoading={isLoading}>
            حفظ العميل
          </Button>
        </div>
      </form>
    </Modal>
  );
};
