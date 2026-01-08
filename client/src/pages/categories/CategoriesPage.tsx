import { useState } from "react";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import { useCategories } from "@/hooks/useProducts";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Loading } from "@/components/common/Loading";
import { Category } from "@/types/category.types";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/api/categoriesApi";
import { toast } from "sonner";
import clsx from "clsx";

export const CategoriesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", nameEn: "", description: "" });

  const { categories, isLoading } = useCategories();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameEn: category.nameEn || "",
      description: category.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
      try {
        await deleteCategory(id).unwrap();
        toast.success("تم حذف التصنيف بنجاح");
      } catch {
        toast.error("فشل في حذف التصنيف");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, data: formData }).unwrap();
        toast.success("تم تحديث التصنيف بنجاح");
      } else {
        await createCategory(formData).unwrap();
        toast.success("تم إضافة التصنيف بنجاح");
      }
      handleCloseForm();
    } catch {
      toast.error(editingCategory ? "فشل في تحديث التصنيف" : "فشل في إضافة التصنيف");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "", nameEn: "", description: "" });
  };

  if (isLoading) return <Loading />;

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة التصنيفات</h1>
          <p className="text-gray-500 mt-1">تنظيم المنتجات في تصنيفات</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          rightIcon={<Plus className="w-5 h-5" />}
        >
          إضافة تصنيف
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                  {category.nameEn && (
                    <p className="text-sm text-gray-500">{category.nameEn}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  disabled={isDeleting}
                  className="p-2 hover:bg-danger-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-danger-500" />
                </button>
              </div>
            </div>
            {category.description && (
              <p className="mt-3 text-sm text-gray-500">{category.description}</p>
            )}
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {category.productsCount || 0} منتج
              </span>
              <span
                className={clsx(
                  "px-2.5 py-0.5 rounded-full text-xs font-medium",
                  category.isActive
                    ? "bg-success-50 text-success-500"
                    : "bg-gray-100 text-gray-500"
                )}
              >
                {category.isActive ? "نشط" : "غير نشط"}
              </span>
            </div>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <FolderOpen className="w-12 h-12 mx-auto mb-3" />
            <p>لا توجد تصنيفات</p>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="اسم التصنيف (عربي)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="مثال: المشروبات"
            required
          />
          <Input
            label="اسم التصنيف (إنجليزي)"
            value={formData.nameEn}
            onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            placeholder="Example: Beverages"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف اختياري للتصنيف..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseForm}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating || isUpdating}
              className="flex-1"
            >
              {editingCategory ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
