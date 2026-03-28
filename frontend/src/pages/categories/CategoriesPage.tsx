import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Edit01, Folder, Plus, SearchLg, Trash01 } from "@untitledui/icons";

import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/api/categoriesApi";
import { MetricCard } from "@/components/app/metric-card";
import { Loading } from "@/components/common/Loading";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category.types";

export const CategoriesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useGetCategoriesQuery({
    search: search || undefined,
    page,
    pageSize: 20,
  });
  const categories = response?.data || [];

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

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
    if (window.confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
      try {
        await deleteCategory(id).unwrap();
        toast.success("تم حذف التصنيف بنجاح");
      } catch {
        toast.error("فشل في حذف التصنيف");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          data: formData,
        }).unwrap();
        toast.success("تم تحديث التصنيف بنجاح");
      } else {
        await createCategory(formData).unwrap();
        toast.success("تم إضافة التصنيف بنجاح");
      }
      handleCloseForm();
    } catch {
      toast.error(
        editingCategory ? "فشل في تحديث التصنيف" : "فشل في إضافة التصنيف",
      );
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name: "", nameEn: "", description: "" });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  const activeCategories = categories.filter((c) => c.isActive).length;
  const totalProducts = categories.reduce(
    (sum, c) => sum + (c.productCount || 0),
    0,
  );

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              إدارة التصنيفات
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              تنظيم المنتجات في تصنيفات لتسهيل البحث والعرض
            </p>
          </div>

          <div className="flex items-end gap-2">
            <Button
              size="lg"
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="size-5" />}
            >
              إضافة تصنيف
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="إجمالي التصنيفات"
          value={categories.length}
          description="جميع التصنيفات المسجلة"
          icon={Folder}
        />
        <MetricCard
          title="التصنيفات النشطة"
          value={activeCategories}
          description="تظهر في القائمة حالياً"
          icon={Folder}
          tone="success"
        />
        <MetricCard
          title="إجمالي المنتجات"
          value={totalProducts}
          description="المنتجات الموزعة بالتصنيفات"
          icon={Folder}
          tone="warning"
        />
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-xl">
              <SearchLg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن تصنيف..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="group overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Folder className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">
                        {category.name}
                      </h3>
                      {category.nameEn && (
                        <p className="mt-0.5 text-xs font-mono text-muted-foreground">
                          {category.nameEn}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                      className="size-8 text-muted-foreground hover:text-primary"
                      aria-label="تعديل"
                    >
                      <Edit01 className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                      disabled={isDeleting}
                      className="size-8 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                      aria-label="حذف"
                    >
                      <Trash01 className="size-4" />
                    </Button>
                  </div>
                </div>

                {category.description && (
                  <p className="mt-4 text-sm font-medium text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-sm font-bold text-muted-foreground">
                    <span className="text-foreground">{category.productCount || 0}</span> منتج
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                      category.isActive
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {category.isActive ? "نشط" : "غير نشط"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {categories.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground">
              <Folder className="mx-auto mb-4 size-12 opacity-40" />
              <p className="text-lg font-bold">
                {search ? "لا توجد نتائج للبحث" : "لا توجد تصنيفات"}
              </p>
              <p className="mt-1 text-sm opacity-80">اضغط على "إضافة تصنيف" للبدء</p>
            </div>
          )}
        </div>

        {categories.length > 0 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button
              variant="glass"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              السابق
            </Button>
            <span className="font-mono text-sm font-bold text-muted-foreground">
              صفحة <span className="text-foreground">{page}</span>
            </span>
            <Button
              variant="glass"
              onClick={() => setPage((p) => p + 1)}
              disabled={categories.length < 20}
            >
              التالي
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="اسم التصنيف (عربي)"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="مثال: المشروبات"
            required
            className="bg-background/50"
          />
          <Input
            label="اسم التصنيف (إنجليزي)"
            value={formData.nameEn}
            onChange={(e) =>
              setFormData({ ...formData, nameEn: e.target.value })
            }
            placeholder="Example: Beverages"
            className="bg-background/50"
          />
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              الوصف (اختياري)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="وصف إضافي للتصنيف..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button
              type="button"
              variant="glass"
              onClick={handleCloseForm}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isCreating || isUpdating}
              className="flex-1"
            >
              {editingCategory ? "تحديث التغييرات" : "إضافة التصنيف"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
