import { useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Info,
  Loader2,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { useGetSalesReportQuery } from "@/api/reportsApi";
import { Card } from "@/components/common/Card";
import { formatCurrency, formatDateOnly } from "@/utils/formatters";

export const SalesReportPage = () => {
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(1)).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading, isError, error } = useGetSalesReportQuery({ fromDate, toDate });
  const report = data?.data;

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
            <div className="section-caption">تقارير المبيعات</div>
            <h1 className="mt-3 flex items-center gap-3 text-3xl font-black text-foreground">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-success/10 text-success">
                <TrendingUp className="size-6" />
              </span>
              تقرير المبيعات
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              تحليل شامل للإيرادات، التكلفة، الربحية، وحركة المبيعات اليومية ضمن واجهة متوافقة مع النظام الحالي.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3">
              <Calendar className="size-4 text-primary" />
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border-0 bg-transparent px-0 py-0 shadow-none" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">إلى</span>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3">
              <Calendar className="size-4 text-primary" />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border-0 bg-transparent px-0 py-0 shadow-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><DollarSign className="size-6" /></div><div><p className="text-sm text-muted-foreground">إجمالي المبيعات</p><p className="text-2xl font-bold text-primary">{formatCurrency(report?.totalSales || 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-danger/10 text-danger"><TrendingUp className="size-6" /></div><div><p className="text-sm text-muted-foreground">التكلفة</p><p className="text-2xl font-bold text-danger">{formatCurrency(report?.totalCost || 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success"><TrendingUp className="size-6" /></div><div><p className="text-sm text-muted-foreground">إجمالي الربح</p><p className="text-2xl font-bold text-success">{formatCurrency(report?.grossProfit || 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><ShoppingBag className="size-6" /></div><div><p className="text-sm text-muted-foreground">عدد الطلبات</p><p className="text-2xl font-bold text-foreground">{report?.totalOrders || 0}</p></div></div></Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-sm text-muted-foreground">متوسط قيمة الطلب</p>
            <p className="text-3xl font-bold text-foreground">{formatCurrency(report?.averageOrderValue || 0)}</p>
          </div>
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <BarChart3 className="size-7" />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-bold text-foreground">المبيعات اليومية</h3>
        <div className="max-h-96 space-y-3 overflow-y-auto">
          {report?.dailySales?.length ? (
            report.dailySales.map((day) => {
              const maxSales = Math.max(...report.dailySales.map((entry) => entry.sales));
              const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;

              return (
                <div key={day.date} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{formatDateOnly(day.date)}</span>
                    <div className="text-left">
                      <span className="font-medium text-foreground">{formatCurrency(day.sales)}</span>
                      <span className="mr-2 text-sm text-muted-foreground">({day.orders} طلب)</span>
                    </div>
                  </div>
                  <div className="progress-shell h-2.5">
                    <div className="progress-fill h-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-8 text-center text-muted-foreground">لا توجد بيانات</p>
          )}
        </div>
      </Card>

      <Card className="border-primary/20 bg-primary/6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">معلومات التقرير</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>يعرض إجمالي الطلبات المكتملة فقط، بدون الملغاة أو المعلقة.</li>
              <li>الإيرادات والربحية أصبحت أوضح بصرياً في الوضع الداكن.</li>
              <li>الفترة تعتمد على تاريخ إتمام الطلب، وليس تاريخ إنشائه.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalesReportPage;
