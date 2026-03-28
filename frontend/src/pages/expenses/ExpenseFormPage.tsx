import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check, Upload01 as Upload, ChevronDown, Receipt, Wallet03, FileAttachment01 } from "@untitledui/icons";

import { useGetExpenseCategoriesQuery } from "@/api/expenseCategoriesApi";
import {
  useCreateExpenseMutation,
  useGetExpenseByIdQuery,
  useUpdateExpenseMutation,
  useUploadAttachmentMutation,
} from "@/api/expensesApi";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Loading } from "@/components/common/Loading";
import { Input } from "@/components/common/Input";
import { cn } from "@/lib/utils";
import type { CreateExpenseRequest, UpdateExpenseRequest } from "@/types/expense.types";

export function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: expenseResponse, isLoading: isLoadingExpense } = useGetExpenseByIdQuery(Number(id), {
    skip: !isEditMode,
  });
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useGetExpenseCategoriesQuery();
  const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdating }] = useUpdateExpenseMutation();
  const [uploadAttachment] = useUploadAttachmentMutation();

  const expense = expenseResponse?.data;
  const categories = categoriesResponse?.data || [];

  type ExpenseFormData = Omit<CreateExpenseRequest | UpdateExpenseRequest, "amount"> & {
    amount: string | number;
  };

  const [formData, setFormData] = useState<ExpenseFormData>({
    categoryId: 0,
    amount: "",
    description: "",
    expenseDate: new Date().toISOString().split("T")[0],
    notes: "",
    referenceNumber: "",
    beneficiary: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (expense && isEditMode) {
      setFormData({
        categoryId: expense.categoryId,
        amount: String(expense.amount),
        description: expense.description,
        expenseDate: expense.expenseDate.split("T")[0],
        notes: expense.notes || "",
        referenceNumber: expense.referenceNumber || "",
        beneficiary: expense.beneficiary || "",
      });
    }
  }, [expense, isEditMode]);

  const isSaving = isCreating || isUpdating;
  const selectedCategoryName = useMemo(
    () => categories.find((category) => category.id === Number(formData.categoryId))?.name ?? "غير محدد",
    [categories, formData.categoryId],
  );

  const handleChange = (field: keyof ExpenseFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const numericAmount = Number(formData.amount) || 0;

    if (!formData.categoryId) {
      alert("يرجى اختيار التصنيف");
      return;
    }

    if (numericAmount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }

    if (!formData.description.trim()) {
      alert("يرجى إدخال الوصف");
      return;
    }

    try {
      let expenseId: number;
      const expenseData = {
        ...formData,
        amount: numericAmount,
      };

      if (isEditMode) {
        const result = await updateExpense({
          id: Number(id),
          expense: expenseData,
        }).unwrap();
        expenseId = result.data!.id;
      } else {
        const result = await createExpense(expenseData).unwrap();
        expenseId = result.data!.id;

        if (selectedFiles.length > 0) {
          for (const file of selectedFiles) {
            await uploadAttachment({ id: expenseId, file }).unwrap();
          }
        }
      }

      navigate(`/expenses/${expenseId}`);
    } catch (error) {
      console.error("Failed to save expense:", error);
      alert("حدث خطأ أثناء حفظ المصروف");
    }
  };

  if (isLoadingExpense || isLoadingCategories) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="section-caption">إدارة المصروفات</div>
            <h1 className="mt-3 flex items-center gap-3 text-balance text-3xl font-black text-foreground">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Receipt className="size-6" />
              </span>
              {isEditMode ? "تعديل المصروف" : "مصروف جديد"}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              {isEditMode
                ? "حدّث بيانات المصروف مع الحفاظ على وضوح المبلغ والتصنيف والمرفقات ضمن نفس النظام البصري."
                : "سجّل مصروفاً جديداً بسرعة مع حقول واضحة، مرفقات منظمة، وتدرج بصري يطابق واجهة الإدارة الحديثة."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to={isEditMode ? `/expenses/${id}` : "/expenses"}>
              <Button variant="outline" leftIcon={<ArrowRight className="size-4" />}>
                رجوع
              </Button>
            </Link>
            <Button
              type="submit"
              form="expense-form"
              isLoading={isSaving}
              leftIcon={<Check className="size-4" />}
              className="shadow-card"
            >
              {isSaving ? "جاري الحفظ..." : "حفظ المصروف"}
            </Button>
          </div>
        </div>
      </section>

      <form id="expense-form" onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Card className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/70 pb-4">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Wallet03 className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">بيانات المصروف</h2>
              <p className="text-sm text-muted-foreground">أدخل التفاصيل الأساسية بدقة حتى تظهر لاحقاً بشكل واضح داخل التقارير والمراجعات.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                التصنيف <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleChange("categoryId", Number(e.target.value))}
                  className="w-full appearance-none rounded-2xl border border-input bg-card/80 py-3 pl-10 pr-4 text-sm font-medium shadow-sm transition-all hover:border-border/90 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value={0}>اختر التصنيف</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <Input
              label="المبلغ (جنيه) *"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="0.00"
              required
            />

            <Input
              label="تاريخ المصروف *"
              type="date"
              value={formData.expenseDate}
              onChange={(e) => handleChange("expenseDate", e.target.value)}
              required
            />

            <Input
              label="المستفيد"
              type="text"
              value={formData.beneficiary}
              onChange={(e) => handleChange("beneficiary", e.target.value)}
              placeholder="اسم المستفيد أو الجهة"
            />

            <div className="md:col-span-2">
              <Input
                label="رقم المرجع"
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => handleChange("referenceNumber", e.target.value)}
                placeholder="رقم الإيصال أو الفاتورة"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                الوصف <span className="text-danger">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-input bg-card/80 px-4 py-3 text-sm text-foreground shadow-sm"
                placeholder="اكتب وصفاً واضحاً للمصروف والغرض منه..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-foreground">
                ملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl border border-input bg-card/80 px-4 py-3 text-sm text-foreground shadow-sm"
                placeholder="أي ملاحظات داخلية أو تفاصيل إضافية..."
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <FileAttachment01 className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">ملخص سريع</h2>
                <p className="text-sm text-muted-foreground">راجع البيانات الأساسية قبل الحفظ.</p>
              </div>
            </div>

            <div className="space-y-3 rounded-[calc(var(--radius)+0.05rem)] border border-border/70 bg-muted/30 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">التصنيف</span>
                <span className="text-sm font-bold text-foreground">{selectedCategoryName}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">المبلغ</span>
                <span className="text-sm font-bold text-foreground">
                  {formData.amount ? `${formData.amount} ج.م` : "غير محدد"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">التاريخ</span>
                <span className="text-sm font-bold text-foreground">{formData.expenseDate || "غير محدد"}</span>
              </div>
            </div>

            {!isEditMode ? (
              <div className="space-y-3">
                <label className="mb-1 block text-sm font-semibold text-foreground">المرفقات</label>
                <input
                  id="expense-file-upload"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label
                  htmlFor="expense-file-upload"
                  className="upload-dropzone cursor-pointer"
                >
                  <Upload className="size-6 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">اختر ملفات أو اسحبها هنا</p>
                    <p className="text-sm text-muted-foreground">يدعم صور الإيصالات وملفات PDF وWord.</p>
                  </div>
                </label>

                {selectedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-border/70 bg-card/70 px-4 py-3 text-sm"
                      >
                        <span className="truncate font-medium text-foreground">{file.name}</span>
                        <span className="shrink-0 text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد مرفقات محددة بعد.</p>
                )}
              </div>
            ) : (
              <div className="rounded-[calc(var(--radius)+0.05rem)] border border-primary/20 bg-primary/8 p-4 text-sm text-muted-foreground">
                تعديل المصروف لا يضيف مرفقات جديدة من هذه الشاشة حالياً. يمكنك مراجعة التفاصيل بعد الحفظ.
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row">
              <Link to={isEditMode ? `/expenses/${id}` : "/expenses"} className="flex-1">
                <Button variant="outline" className="w-full">
                  إلغاء
                </Button>
              </Link>
              <Button type="submit" isLoading={isSaving} className="flex-1">
                {isSaving ? "جاري الحفظ..." : "تأكيد الحفظ"}
              </Button>
            </div>
          </Card>

          <Card className="border-primary/15 bg-primary/6">
            <p className="text-sm font-medium text-muted-foreground">
              كلما كان الوصف أوضح والتصنيف صحيحاً، ظهرت المصروفات بشكل أدق في صفحات المراجعة والتقارير.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}
