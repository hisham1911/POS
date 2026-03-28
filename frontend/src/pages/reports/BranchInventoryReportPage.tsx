import { useState } from "react";
import { AlertCircle, AlertTriangle, ChevronDown, Download, Filter, Info, Loader2, Package, TrendingDown } from "lucide-react";

import { useGetCategoriesQuery } from "@/api/categoriesApi";
import { useGetBranchInventoryReportQuery } from "@/api/inventoryReportsApi";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { formatCurrency, formatDateTimeFull } from "@/utils/formatters";

export const BranchInventoryReportPage = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const branchId = currentUser?.branchId || 0;
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data, isLoading, isError, error } = useGetBranchInventoryReportQuery({
    branchId,
    categoryId,
    lowStockOnly,
  });

  const report = data?.data;
  const categories = categoriesData?.data || [];

  const handleExport = () => {
    window.open(
      `/api/inventory-reports/branch/${branchId}/export?${categoryId ? `categoryId=${categoryId}&` : ""}${lowStockOnly ? "lowStockOnly=true" : ""}`,
      "_blank",
    );
  };

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="glass-panel flex min-h-[16rem] items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span>جاري تحميل التقرير...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-shell">
        <div className="glass-panel flex min-h-[16rem] flex-col items-center justify-center text-center">
          <AlertCircle className="mb-4 size-10 text-danger" />
          <p className="font-semibold text-danger">فشل في تحميل التقرير</p>
          <p className="mt-2 text-sm text-muted-foreground">{(error as any)?.data?.message || "حدث خطأ غير متوقع"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="section-caption">تقارير الفروع</div>
            <h1 className="mt-3 flex items-center gap-3 text-balance text-3xl font-black text-foreground">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-success/10 text-success">
                <Package className="size-6" />
              </span>
              تقرير مخزون الفرع
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              راقب حالة مخزون فرعك الحالي مع عرض أوضح للكميات المنخفضة ومتوسط التكلفة والقيمة الإجمالية.
            </p>
          </div>
          <Button variant="outline" leftIcon={<Download className="size-4" />} onClick={handleExport}>
            تصدير CSV
          </Button>
        </div>
      </section>

      <Card className="space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Filter className="size-4 text-primary" />
          <span>الفلاتر</span>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <select
              value={categoryId || ""}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full appearance-none rounded-2xl border border-input bg-card/80 py-3 pl-10 pr-4 text-sm font-medium shadow-sm"
            >
              <option value="">جميع الفئات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <label className="choice-chip cursor-pointer" data-selected={lowStockOnly}>
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="h-4 w-4" />
            <span>المخزون المنخفض فقط</span>
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Package className="size-6" /></div><div><p className="text-sm text-muted-foreground">إجمالي المنتجات</p><p className="text-2xl font-bold text-foreground">{report?.totalProducts || 0}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success"><Package className="size-6" /></div><div><p className="text-sm text-muted-foreground">إجمالي الكمية</p><p className="text-2xl font-bold text-foreground">{report?.totalQuantity || 0}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-warning/10 text-warning"><AlertTriangle className="size-6" /></div><div><p className="text-sm text-muted-foreground">مخزون منخفض</p><p className="text-2xl font-bold text-warning">{report?.lowStockCount || 0}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><TrendingDown className="size-6" /></div><div><p className="text-sm text-muted-foreground">قيمة المخزون</p><p className="text-2xl font-bold text-accent">{formatCurrency(report?.totalValue || 0)}</p></div></div></Card>
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-bold text-foreground">تفاصيل المخزون</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-right">المنتج</TableHeaderCell>
                <TableHeaderCell className="text-right">SKU</TableHeaderCell>
                <TableHeaderCell className="text-right">الفئة</TableHeaderCell>
                <TableHeaderCell className="text-right">الكمية</TableHeaderCell>
                <TableHeaderCell className="text-right">مستوى إعادة الطلب</TableHeaderCell>
                <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                <TableHeaderCell className="text-right">متوسط التكلفة</TableHeaderCell>
                <TableHeaderCell className="text-right">القيمة الإجمالية</TableHeaderCell>
                <TableHeaderCell className="text-right">آخر تحديث</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report?.items && report.items.length > 0 ? (
                report.items.map((item) => (
                  <TableRow key={item.productId} className={item.isLowStock ? "bg-warning/6" : undefined}>
                    <TableCell className="font-medium text-foreground">{item.productName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.productSku || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.categoryName || "-"}</TableCell>
                    <TableCell className="font-semibold text-foreground">{item.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{item.reorderLevel}</TableCell>
                    <TableCell>
                      <span className={item.isLowStock ? "inline-flex items-center rounded-full bg-warning/10 px-2 py-1 text-xs font-semibold text-warning" : "inline-flex items-center rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success"}>
                        {item.isLowStock ? "مخزون منخفض" : "متوفر"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.averageCost ? formatCurrency(item.averageCost) : "-"}</TableCell>
                    <TableCell className="font-semibold text-primary">{item.totalValue ? formatCurrency(item.totalValue) : "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTimeFull(item.lastUpdatedAt)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">لا توجد منتجات</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="border-primary/20 bg-primary/6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">معلومات التقرير</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>يعرض المخزون الحالي لكل منتج داخل الفرع.</li>
              <li>يساعدك على اكتشاف نقاط إعادة الطلب بسرعة أكبر في الوضع الداكن.</li>
              <li>يعرض متوسط التكلفة والقيمة الإجمالية للمخزون في نفس الجدول.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BranchInventoryReportPage;
