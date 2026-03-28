import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Info,
  Loader2,
  Package,
  Printer,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import { usePrintDailyReportMutation, useGetDailyReportQuery } from "@/api/reportsApi";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { DailyReport } from "@/types/report.types";
import { formatCurrency, formatDateTimeFull } from "@/utils/formatters";
import { toast } from "sonner";

const generateDailyReportReceiptHtml = (report: DailyReport, dateStr: string): string => {
  const formattedDate = new Date(dateStr).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const fmt = (n: number) => n.toFixed(2);

  const shiftsHtml = report.shifts?.length
    ? report.shifts
        .map(
          (s) => `
      <div class="shift-row">
        <div class="shift-name">${s.userName}${s.isForceClosed ? " ⚠️" : ""}</div>
        <div class="shift-details">
          <span>${s.totalOrders} طلب</span>
          <span>${fmt(s.totalSales)} ج.م</span>
        </div>
        <div class="shift-payments">
          <span>نقدي: ${fmt(s.totalCash)}</span>
          <span>إلكتروني: ${fmt(s.totalCard)}</span>
          ${s.totalFawry > 0 ? `<span>فوري: ${fmt(s.totalFawry)}</span>` : ""}
        </div>
      </div>
    `,
        )
        .join("")
    : '<p class="no-data">لا توجد ورديات</p>';

  const topProductsHtml = report.topProducts?.length
    ? report.topProducts
        .slice(0, 10)
        .map(
          (p, i) => `
      <div class="product-row">
        <span class="product-rank">${i + 1}.</span>
        <span class="product-name">${p.productName}</span>
        <span class="product-qty">×${p.quantitySold}</span>
        <span class="product-total">${fmt(p.totalSales)}</span>
      </div>
    `,
        )
        .join("")
    : '<p class="no-data">لا توجد منتجات</p>';

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>التقرير اليومي - ${formattedDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', 'Tahoma', sans-serif;
      max-width: 302px;
      margin: 0 auto;
      padding: 10px;
      font-size: 11px;
      color: #000;
      direction: rtl;
    }
    .header { text-align: center; margin-bottom: 8px; }
    .header h1 { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
    .branch-name { font-size: 13px; font-weight: bold; margin-bottom: 4px; }
    .date { font-size: 10px; color: #333; }
    .line { border-top: 1px dashed #000; margin: 6px 0; }
    .double-line { border-top: 2px solid #000; margin: 8px 0; }
    .section-title {
      font-size: 11px;
      font-weight: bold;
      text-align: center;
      margin: 6px 0 4px;
      background: #000;
      color: #fff;
      padding: 2px 0;
    }
    .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 10px; }
    .row.total { font-weight: bold; font-size: 12px; }
    .value { font-weight: bold; }
    .shift-row { border: 1px solid #ccc; border-radius: 3px; padding: 4px 6px; margin: 4px 0; }
    .shift-name { font-weight: bold; font-size: 10px; margin-bottom: 2px; }
    .shift-details, .shift-payments { display: flex; justify-content: space-between; font-size: 9px; color: #333; }
    .product-row { display: flex; align-items: center; gap: 4px; font-size: 9px; margin: 2px 0; }
    .product-rank { width: 16px; }
    .product-name { flex: 1; }
    .product-qty { width: 30px; text-align: center; }
    .product-total { width: 55px; text-align: left; }
    .no-data { text-align: center; color: #999; font-size: 9px; padding: 6px 0; }
    .footer { text-align: center; margin-top: 10px; font-size: 9px; color: #666; }
    @media print {
      body { padding: 0; }
      @page { margin: 2mm; size: 80mm auto; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 التقرير اليومي</h1>
    ${report.branchName ? `<div class="branch-name">${report.branchName}</div>` : ""}
    <div class="date">${formattedDate}</div>
  </div>
  <div class="double-line"></div>
  <div class="section-title">📋 ملخص الطلبات</div>
  <div class="row"><span>إجمالي الطلبات</span><span class="value">${report.totalOrders}</span></div>
  <div class="row"><span>الطلبات المكتملة</span><span class="value">${report.completedOrders}</span></div>
  ${report.cancelledOrders > 0 ? `<div class="row"><span>الطلبات الملغاة</span><span class="value">${report.cancelledOrders}</span></div>` : ""}
  <div class="line"></div>
  <div class="section-title">💰 المبيعات</div>
  <div class="row"><span>إجمالي المبيعات</span><span class="value">${fmt(report.totalSales)} ج.م</span></div>
  <div class="row"><span>صافي المبيعات</span><span class="value">${fmt(report.netSales)} ج.م</span></div>
  ${report.totalDiscount > 0 ? `<div class="row"><span>الخصومات</span><span class="value">-${fmt(report.totalDiscount)} ج.م</span></div>` : ""}
  ${report.totalTax > 0 ? `<div class="row"><span>الضرائب</span><span class="value">${fmt(report.totalTax)} ج.م</span></div>` : ""}
  ${report.totalRefunds > 0 ? `<div class="row"><span>المرتجعات</span><span class="value" style="color:red">-${fmt(report.totalRefunds)} ج.م</span></div>` : ""}
  <div class="line"></div>
  <div class="section-title">💳 طرق الدفع</div>
  <div class="row"><span>💵 نقدي</span><span class="value">${fmt(report.totalCash)} ج.م</span></div>
  <div class="row"><span>💳 بطاقة</span><span class="value">${fmt(report.totalCard)} ج.م</span></div>
  ${report.totalFawry > 0 ? `<div class="row"><span>📱 فوري</span><span class="value">${fmt(report.totalFawry)} ج.م</span></div>` : ""}
  ${report.totalOther > 0 ? `<div class="row"><span>أخرى</span><span class="value">${fmt(report.totalOther)} ج.م</span></div>` : ""}
  <div class="double-line"></div>
  <div class="row total"><span>💰 صافي الإيراد</span><span class="value">${fmt(report.totalSales)} ج.م</span></div>
  <div class="double-line"></div>
  ${report.shifts?.length ? `<div class="section-title">👥 الورديات (${report.totalShifts})</div>${shiftsHtml}<div class="line"></div>` : ""}
  ${report.topProducts?.length ? `<div class="section-title">🏆 أعلى المنتجات مبيعاً</div>${topProductsHtml}<div class="line"></div>` : ""}
  <div class="footer">
    <p>تم الطباعة: ${new Date().toLocaleString("ar-EG")}</p>
    <p>TajerPro POS System</p>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
};

const printDailyReportLocally = (report: DailyReport, dateStr: string) => {
  const html = generateDailyReportReceiptHtml(report, dateStr);
  const printWindow = window.open("", "_blank", "width=350,height=700");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};

export const DailyReportPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading, isError, error } = useGetDailyReportQuery(selectedDate);
  const [printDailyReport, { isLoading: isPrintingThermal }] = usePrintDailyReportMutation();
  const report = data?.data;

  const handleThermalPrint = async () => {
    if (!report) return;
    try {
      await printDailyReport(selectedDate).unwrap();
      toast.success("تم إرسال أمر الطباعة للطابعة الحرارية بنجاح");
    } catch {
      toast.info("جاري فتح نافذة الطباعة...");
      printDailyReportLocally(report, selectedDate);
    }
  };

  const handleLocalPrint = () => {
    if (!report) return;
    printDailyReportLocally(report, selectedDate);
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
            <div className="section-caption">تقارير يومية</div>
            <h1 className="mt-3 flex items-center gap-3 text-3xl font-black text-foreground">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Calendar className="size-6" />
              </span>
              التقرير اليومي
            </h1>
            <p className="mt-4 max-w-2xl text-base text-muted-foreground">
              {report?.branchName || "ملخص المبيعات، الورديات، وطرق التحصيل داخل واجهة متوافقة مع الثيم الحالي."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {report ? (
              <>
                <Button variant="outline" leftIcon={<Printer className="size-4" />} onClick={handleLocalPrint}>
                  طباعة التقرير
                </Button>
                <Button
                  variant="secondary"
                  leftIcon={<Receipt className="size-4" />}
                  onClick={handleThermalPrint}
                  isLoading={isPrintingThermal}
                >
                  طابعة حرارية
                </Button>
              </>
            ) : null}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3">
              <Calendar className="size-4 text-primary" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="border-0 bg-transparent px-0 py-0 shadow-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="feedback-panel" data-tone="info">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-accent" />
          <div>
            <p className="text-sm font-semibold text-foreground">التقرير اليومي يعرض الورديات التي أُغلقت في هذا اليوم</p>
            <p className="mt-1 text-xs text-muted-foreground">
              الوردية التي تفتح في يوم وتغلق في اليوم التالي تُحسب كاملة في تقرير يوم الإغلاق، وليس يوم الفتح.
            </p>
          </div>
        </div>
      </div>

      {report?.shifts?.length ? (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">الورديات المغلقة ({report.totalShifts})</h3>
            <Users className="size-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {report.shifts.map((shift) => (
              <div key={shift.shiftId} className="rounded-2xl border border-border/70 bg-card/65 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                      <Users className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{shift.userName}</p>
                      <p className="text-xs text-muted-foreground">وردية #{shift.shiftId}</p>
                    </div>
                  </div>
                  {shift.isForceClosed ? (
                    <span className="inline-flex items-center rounded-full bg-warning/12 px-2.5 py-1 text-xs font-semibold text-warning">
                      <AlertTriangle className="ml-1 size-3" />
                      إغلاق قسري
                    </span>
                  ) : null}
                </div>

                <div className="mb-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">وقت الفتح</p>
                    <p className="text-sm font-medium text-foreground">{formatDateTimeFull(shift.openedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">وقت الإغلاق</p>
                    <p className="text-sm font-medium text-foreground">{formatDateTimeFull(shift.closedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">الطلبات</p>
                    <p className="text-sm font-medium text-foreground">{shift.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">الإجمالي</p>
                    <p className="text-sm font-medium text-primary">{formatCurrency(shift.totalSales)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-3">
                  <div className="flex items-center gap-2">
                    <Banknote className="size-4 text-success" />
                    <span className="text-sm text-muted-foreground">نقدي:</span>
                    <span className="text-sm font-medium text-success">{formatCurrency(shift.totalCash)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-accent" />
                    <span className="text-sm text-muted-foreground">إلكتروني:</span>
                    <span className="text-sm font-medium text-accent">{formatCurrency(shift.totalCard)}</span>
                  </div>
                  {shift.totalFawry > 0 ? (
                    <div className="flex items-center gap-2">
                      <Receipt className="size-4 text-warning" />
                      <span className="text-sm text-muted-foreground">فوري:</span>
                      <span className="text-sm font-medium text-warning">{formatCurrency(shift.totalFawry)}</span>
                    </div>
                  ) : null}
                </div>

                {shift.forceCloseReason ? (
                  <div className="mt-3 border-t border-border/60 pt-3">
                    <p className="text-xs text-muted-foreground">سبب الإغلاق القسري:</p>
                    <p className="mt-1 text-sm text-warning">{shift.forceCloseReason}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShoppingBag className="size-6" /></div><div><p className="text-sm text-muted-foreground">الطلبات المكتملة</p><p className="text-2xl font-bold text-foreground">{report?.completedOrders || 0}</p><p className="text-xs text-muted-foreground">من {report?.totalOrders || 0} طلب</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success"><DollarSign className="size-6" /></div><div><p className="text-sm text-muted-foreground">إجمالي المبيعات</p><p className="text-2xl font-bold text-foreground">{formatCurrency(report?.totalSales || 0)}</p><p className="text-xs text-muted-foreground">صافي: {formatCurrency(report?.netSales || 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-danger/10 text-danger"><TrendingUp className="size-6" /></div><div><p className="text-sm text-muted-foreground">المرتجعات</p><p className="text-2xl font-bold text-danger">{formatCurrency(report?.totalRefunds || 0)}</p><p className="text-xs text-muted-foreground">إجمالي المرتجعات</p></div></div></Card>
        <Card><div className="flex items-center gap-4"><div className="flex size-12 items-center justify-center rounded-2xl bg-warning/10 text-warning"><Receipt className="size-6" /></div><div><p className="text-sm text-muted-foreground">الضرائب</p><p className="text-2xl font-bold text-foreground">{formatCurrency(report?.totalTax || 0)}</p><p className="text-xs text-muted-foreground">14% VAT</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card><div className="flex items-center gap-3"><Banknote className="size-8 text-success" /><div><p className="text-sm text-muted-foreground">نقدي</p><p className="text-xl font-bold text-success">{formatCurrency(report?.totalCash || 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><CreditCard className="size-8 text-accent" /><div><p className="text-sm text-muted-foreground">بطاقة</p><p className="text-xl font-bold text-accent">{formatCurrency(report?.totalCard || 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><Receipt className="size-8 text-warning" /><div><p className="text-sm text-muted-foreground">فوري</p><p className="text-xl font-bold text-warning">{formatCurrency(report?.totalFawry || 0)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><TrendingUp className="size-8 text-secondary" /><div><p className="text-sm text-muted-foreground">الخصومات</p><p className="text-xl font-bold text-secondary">{formatCurrency(report?.totalDiscount || 0)}</p></div></div></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-bold text-foreground">المبيعات حسب طريقة الدفع</h3>
          <div className="space-y-4">
            {[
              { label: "نقدي", value: report?.totalCash || 0, color: "!bg-success" },
              { label: "بطاقة", value: report?.totalCard || 0, color: "!bg-accent" },
              { label: "فوري", value: report?.totalFawry || 0, color: "!bg-warning" },
            ].map((item) => {
              const total = report?.totalSales || 1;
              const percentage = (item.value / total) * 100;
              return (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="progress-shell h-3">
                    <div className={`progress-fill h-full ${item.color}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-bold text-foreground">المبيعات بالساعة</h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {report?.hourlySales?.length ? (
              report.hourlySales.map((hourData) => (
                <div key={hourData.hour} className="flex items-center justify-between border-b border-border/60 py-2">
                  <span className="text-muted-foreground">{hourData.hour.toString().padStart(2, "0")}:00</span>
                  <div className="text-left">
                    <span className="font-medium text-foreground">{formatCurrency(hourData.sales)}</span>
                    <span className="mr-2 text-sm text-muted-foreground">({hourData.orderCount} طلب)</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-muted-foreground">لا توجد بيانات</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-lg font-bold text-foreground">أعلى المنتجات مبيعاً</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-right">#</TableHeaderCell>
                <TableHeaderCell className="text-right">المنتج</TableHeaderCell>
                <TableHeaderCell className="text-right">الكمية</TableHeaderCell>
                <TableHeaderCell className="text-right">الإجمالي</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report?.topProducts?.length ? (
                report.topProducts.map((product, index) => (
                  <TableRow key={product.productId}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Package className="size-4" />
                        </div>
                        <span className="font-medium text-foreground">{product.productName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.quantitySold}</TableCell>
                    <TableCell className="font-semibold text-primary">{formatCurrency(product.totalSales)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">لا توجد منتجات مباعة</TableCell>
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
              <li>يعرض ملخص الورديات المغلقة في اليوم المحدد.</li>
              <li>يتم احتساب المبيعات وطرق الدفع في يوم إغلاق الوردية.</li>
              <li>أرقام التحصيل والخصومات والمرتجعات أصبحت أوضح في الثيم الداكن.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DailyReportPage;
