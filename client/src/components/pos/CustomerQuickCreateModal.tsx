import { useState } from "react";
import { X, User, Phone, Mail, Loader2 } from "lucide-react";
import { useCreateCustomerMutation } from "@/api/customersApi";
import { Customer } from "@/types/customer.types";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";

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
  const [phone, setPhone] = useState(initialPhone);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length < 8) {
      toast.error("رقم الهاتف غير صالح");
      return;
    }

    try {
      const result = await createCustomer({
        phone,
        name: name || undefined,
        email: email || undefined,
      }).unwrap();

      if (result.success && result.data) {
        toast.success("تم إضافة العميل بنجاح");
        onSuccess(result.data);
      } else {
        toast.error(result.message || "فشل في إضافة العميل");
      }
    } catch (error) {
      // Error handled by base query
      const apiError = error as { data?: { message?: string } };
      if (apiError.data?.message) {
        toast.error(apiError.data.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
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
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الهاتف *
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="01xxxxxxxxx"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                dir="ltr"
                required
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الاسم
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم العميل (اختياري)"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com (اختياري)"
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                dir="ltr"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </span>
              ) : (
                "حفظ العميل"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
