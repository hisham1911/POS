import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../api/usersApi";
import { useGetBranchesQuery } from "../../../api/branchesApi";
import { toast } from "react-hot-toast";
import type { UserDto } from "../../../types/user.types";
import { Portal } from "../../../components/common/Portal";

interface UserFormModalProps {
  user: UserDto | null;
  onClose: () => void;
}

export default function UserFormModal({ user, onClose }: UserFormModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Cashier");
  const [branchId, setBranchId] = useState<number | undefined>();

  const { data: branchesData } = useGetBranchesQuery();
  const branches = branchesData?.data || [];

  const [createUser, { isLoading: creating }] = useCreateUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const isEditing = !!user;
  const isLoading = creating || updating;

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setRole(user.role);
      setBranchId(user.branchId);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error("الاسم والبريد الإلكتروني مطلوبان");
      return;
    }

    if (!isEditing && !password.trim()) {
      toast.error("كلمة المرور مطلوبة");
      return;
    }

    try {
      if (isEditing) {
        await updateUser({
          id: user.id,
          data: {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            role,
            branchId,
          },
        }).unwrap();
        toast.success("تم تحديث المستخدم بنجاح");
      } else {
        await createUser({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim() || undefined,
          role,
          branchId,
        }).unwrap();
        toast.success("تم إنشاء المستخدم بنجاح");
      }
      onClose();
    } catch (error: any) {
      const message = error?.data?.message || "فشل في حفظ المستخدم";
      toast.error(message);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div
          className="bg-white rounded-xl shadow-xl max-w-md w-full"
          dir="rtl"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">
              {isEditing ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">الاسم *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@domain.com"
                required
              />
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  كلمة المرور *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="01xxxxxxxxx"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الدور *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Cashier">كاشير</option>
                <option value="Admin">مدير</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الفرع</label>
              <select
                value={branchId || ""}
                onChange={(e) =>
                  setBranchId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر الفرع</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? "جاري الحفظ..." : isEditing ? "تحديث" : "إضافة"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
