import { useState, useEffect } from "react";
import { ChevronDown } from "@untitledui/icons";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../../api/usersApi";
import { useGetBranchesQuery } from "../../../api/branchesApi";
import { toast } from "react-hot-toast";
import type { UserDto } from "../../../types/user.types";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

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
  const shouldShowBranchField = role === "Cashier";

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      setRole(user.role);
      setBranchId(user.branchId);
    }
  }, [user]);

  useEffect(() => {
    if (role !== "Cashier") {
      setBranchId(undefined);
    }
  }, [role]);

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
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">الاسم *</label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسم المستخدم"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">البريد الإلكتروني *</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@domain.com"
            required
            className="text-left font-mono"
            dir="ltr"
          />
        </div>

        {!isEditing && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">كلمة المرور *</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              required
              className="text-left font-mono"
              dir="ltr"
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">الهاتف</label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
            className="text-left font-mono"
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">الدور *</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium cursor-pointer"
                required
              >
                <option value="Cashier">كاشير</option>
                <option value="Admin">مدير</option>
              </select>
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <ChevronDown className="size-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {shouldShowBranchField && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">الفرع</label>
              <div className="relative">
                <select
                  value={branchId || ""}
                  onChange={(e) =>
                    setBranchId(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium cursor-pointer"
                >
                  <option value="">اختر الفرع (اختياري)</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <ChevronDown className="size-5 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "جاري الحفظ..." : isEditing ? "تحديث البيانات" : "إنشاء المستخدم"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
