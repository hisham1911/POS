import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  ChevronDown,
  Edit01,
  Eye,
  Plus,
  Receipt,
  Trash01,
  Wallet01,
} from "@untitledui/icons";

import { useGetExpenseCategoriesQuery } from "@/api/expenseCategoriesApi";
import {
  useDeleteExpenseMutation,
  useGetExpensesQuery,
} from "@/api/expensesApi";
import { MetricCard } from "@/components/app/metric-card";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ExpenseFilters, ExpenseStatus } from "@/types/expense.types";
import { formatCurrency, formatDateOnly } from "@/utils/formatters";

export function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>({
    pageNumber: 1,
    pageSize: 20,
  });

  const {
    data: expensesResponse,
    isLoading,
    error,
  } = useGetExpensesQuery(filters);
  const { data: categoriesResponse } = useGetExpenseCategoriesQuery();
  const [deleteExpense, { isLoading: isDeleting }] = useDeleteExpenseMutation();

  const expenses = expensesResponse?.data?.items || [];
  const totalCount = expensesResponse?.data?.totalCount || 0;
  const totalPages = expensesResponse?.data?.totalPages || 1;
  const categories = categoriesResponse?.data || [];
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const paidCount = expenses.filter(
    (expense) => expense.status === "Paid",
  ).length;
  const draftCount = expenses.filter(
    (expense) => expense.status === "Draft",
  ).length;

  const handleFilterChange = (key: keyof ExpenseFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
      try {
        await deleteExpense(id).unwrap();
        toast.success("تم حذف المصروف بنجاح");
      } catch (error) {
        console.error("Failed to delete expense:", error);
        toast.error("فشل في حذف المصروف");
      }
    }
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    const statusConfig: Record<ExpenseStatus, { label: string; class: string }> = {
      Draft: { label: "مسودة", class: "bg-muted text-muted-foreground" },
      Approved: { label: "معتمد", class: "bg-primary/10 text-primary" },
      Paid: { label: "مدفوع", class: "bg-success/10 text-success" },
      Rejected: { label: "مرفوض", class: "bg-danger/10 text-danger" },
    };

    const config = statusConfig[status] || { label: status, class: "bg-muted text-muted-foreground" };

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
          config.class
        )}
      >
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex p-8 items-center justify-center text-danger font-bold text-lg">
        حدث خطأ في تحميل المصروفات
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              المصروفات
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة مصروفات الشركة ومراجعة حالتها والموافقة على الدفع
            </p>
          </div>

          <div className="flex items-end gap-2">
            <Link to="/expenses/new">
              <Button size="lg" leftIcon={<Plus className="size-5" />}>
                مصروف جديد
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="إجمالي المصروفات (الصفحة الحالية)"
          value={formatCurrency(totalAmount)}
          description="إجمالي قيمة المصروفات المعروضة"
          icon={Wallet01}
          tone="primary"
        />
        <MetricCard
          title="مصروفات مدفوعة"
          value={paidCount}
          description="تم سدادها بالفعل"
          icon={Receipt}
          tone="success"
        />
        <MetricCard
          title="مصروفات مسودة"
          value={draftCount}
          description="قيد المراجعة والاعتماد"
          icon={Receipt}
          tone="warning"
        />
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  التصنيف
                </label>
                <div className="relative">
                  <select
                    value={filters.categoryId || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "categoryId",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
                  >
                    <option value="">الكل</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  الحالة
                </label>
                <div className="relative">
                  <select
                    value={filters.status || ""}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value || undefined)
                    }
                    className="w-full appearance-none rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
                  >
                    <option value="">الكل</option>
                    <option value="Draft">مسودة</option>
                    <option value="Approved">معتمد</option>
                    <option value="Paid">مدفوع</option>
                    <option value="Rejected">مرفوض</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  من تاريخ
                </label>
                <input
                  type="date"
                  value={filters.fromDate || ""}
                  onChange={(e) =>
                    handleFilterChange("fromDate", e.target.value || undefined)
                  }
                  className="w-full rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  value={filters.toDate || ""}
                  onChange={(e) =>
                    handleFilterChange("toDate", e.target.value || undefined)
                  }
                  className="w-full rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-right">رقم المصروف</TableHeaderCell>
                  <TableHeaderCell className="text-right">التصنيف</TableHeaderCell>
                  <TableHeaderCell className="text-right">الوصف</TableHeaderCell>
                  <TableHeaderCell className="text-right">المبلغ</TableHeaderCell>
                  <TableHeaderCell className="text-right">التاريخ</TableHeaderCell>
                  <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                  <TableHeaderCell className="text-center w-28">الإجراءات</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <Wallet01 className="mx-auto mb-4 size-12 opacity-50" />
                      <p className="text-lg font-medium">لا توجد مصروفات مطابقة للفلاتر الحالية</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-mono font-bold text-foreground">
                        {expense.expenseNumber}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {expense.categoryName}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate font-medium">
                        {expense.description}
                      </TableCell>
                      <TableCell className="font-mono font-black text-primary">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground font-medium">
                        {formatDateOnly(expense.expenseDate)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(expense.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/expenses/${expense.id}`}
                            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="size-4" />
                          </Link>
                          {expense.status === "Draft" && (
                            <>
                              <Link
                                to={`/expenses/${expense.id}/edit`}
                                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                                title="تعديل"
                              >
                                <Edit01 className="size-4" />
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(expense.id)}
                                disabled={isDeleting}
                                className="size-8 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                                title="حذف"
                              >
                                <Trash01 className="size-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border bg-muted/10 px-6 py-4">
              <div className="text-sm font-semibold text-muted-foreground">
                عرض <span className="text-foreground">{expenses.length}</span> من{" "}
                <span className="text-foreground">{totalCount}</span> مصروف
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    handlePageChange((filters.pageNumber || 1) - 1)
                  }
                  disabled={filters.pageNumber === 1}
                >
                  السابق
                </Button>
                <span className="font-mono text-sm font-bold text-muted-foreground px-4">
                  صفحة <span className="text-foreground">{filters.pageNumber}</span> من {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    handlePageChange((filters.pageNumber || 1) + 1)
                  }
                  disabled={filters.pageNumber === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
