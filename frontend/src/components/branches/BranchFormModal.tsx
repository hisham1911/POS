import { useState, useEffect } from "react";
import { X, Building2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from "@/api/branchesApi";
import { Branch } from "@/types/branch.types";
import { toast } from "react-hot-toast";
import { Portal } from "@/components/common/Portal";

interface BranchFormModalProps {
  branch?: Branch;
  onClose: () => void;
}

export const BranchFormModal = ({ branch, onClose }: BranchFormModalProps) => {
  const isEditMode = !!branch;

  const [formData, setFormData] = useState({
    name: branch?.name || "",
    code: branch?.code || "",
    address: branch?.address || "",
    phone: branch?.phone || "",
    isActive: branch?.isActive ?? true,
  });

  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();

  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("اسم الفرع مطلوب");
      return;
    }

    if (!formData.code.trim()) {
      toast.error("كود الفرع مطلوب");
      return;
    }

    try {
      if (isEditMode) {
        const result = await updateBranch({
          id: branch.id,
          data: formData,
        }).unwrap();

        if (result.success) {
          toast.success("تم تحديث الفرع بنجاح");
          onClose();
        }
      } else {
        const result = await createBranch({
          name: formData.name,
          code: formData.code,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
        }).unwrap();

        if (result.success) {
          toast.success("تم إضافة الفرع بنجاح");
          onClose();
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.data?.message ||
        (isEditMode ? "فشل في تحديث الفرع" : "فشل في إضافة الفرع");
      toast.error(errorMessage);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Portal>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[hsl(var(--foreground)/0.24)] p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <div
          className="glass-panel flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[calc(var(--radius)+0.35rem)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {isEditMode ? "تعديل الفرع" : "إضافة فرع جديد"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-muted/50"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">
                المعلومات الأساسية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    اسم الفرع <span className="text-danger">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="مثال: الفرع الرئيسي"
                    required
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    كود الفرع <span className="text-danger">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value)}
                    placeholder="مثال: BR001"
                    required
                    disabled={isEditMode}
                  />
                  {isEditMode && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      لا يمكن تعديل الكود بعد الإنشاء
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">معلومات الاتصال</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    رقم الهاتف
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="مثال: 01234567890"
                  />
                </div>

                {/* Status (Edit mode only) */}
                {isEditMode && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      الحالة
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="choice-chip cursor-pointer" data-selected={formData.isActive}>
                        <input
                          type="radio"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={() => handleChange("isActive", true)}
                          className="h-4 w-4"
                        />
                        <span>نشط</span>
                      </label>
                      <label className="choice-chip cursor-pointer" data-selected={!formData.isActive}>
                        <input
                          type="radio"
                          name="isActive"
                          checked={!formData.isActive}
                          onChange={() => handleChange("isActive", false)}
                          className="h-4 w-4"
                        />
                        <span>غير نشط</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  العنوان
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="مثال: 123 شارع الجمهورية، القاهرة"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-input bg-card/80 px-4 py-2.5 text-foreground"
                />
              </div>
            </div>
          </form>

          {/* Actions */}
          <div className="flex shrink-0 gap-3 border-t border-border p-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              variant="primary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading
                ? "جاري الحفظ..."
                : isEditMode
                  ? "حفظ التعديلات"
                  : "إضافة الفرع"}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
