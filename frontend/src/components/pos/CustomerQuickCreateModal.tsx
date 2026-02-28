import { useState } from "react";
import { X, User, Phone, Mail, MapPin, FileText } from "lucide-react";
import { useCreateCustomerMutation } from "@/api/customersApi";
import { Customer } from "@/types/customer.types";
import toast from "react-hot-toast";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            إضافة عميل جديد
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Phone (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رقم الهاتف <span className="text-danger-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                dir="ltr"
                placeholder="01xxxxxxxxx"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Name (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              الاسم
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="اسم العميل (اختياري)"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                dir="ltr"
                placeholder="email@example.com"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Address (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              العنوان
            </label>
            <div className="relative">
              <div className="absolute right-3 top-3 text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="عنوان العميل (اختياري)"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ملاحظات
            </label>
            <div className="relative">
              <div className="absolute right-3 top-3 text-gray-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="ملاحظات إضافية (اختياري)"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
