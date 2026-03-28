import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown, Receipt, File04, Edit01, Trash01 } from "@untitledui/icons";

import {
  useDeletePurchaseInvoiceMutation,
  useGetPurchaseInvoicesQuery,
} from "../../api/purchaseInvoiceApi";
import { useGetSuppliersQuery } from "../../api/suppliersApi";
import { MetricCard } from "../../components/app/metric-card";
import { Loading } from "../../components/common/Loading";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/ui/table";
import { PurchaseInvoiceStatus } from "../../types/purchaseInvoice.types";
import { formatCurrency, formatDateOnly } from "../../utils/formatters";
import { cn } from "../../lib/utils";

export function PurchaseInvoicesPage() {
  const navigate = useNavigate();
  const [pageNumber, setPageNumber] = useState(1);
  const [supplierId, setSupplierId] = useState<number | undefined>();
  const [status, setStatus] = useState<PurchaseInvoiceStatus | undefined>();
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { data: invoicesResponse, isLoading } = useGetPurchaseInvoicesQuery({
    supplierId,
    status,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    pageNumber,
    pageSize: 20,
  });

  const { data: suppliersResponse } = useGetSuppliersQuery();
  const [deletePurchaseInvoice] = useDeletePurchaseInvoiceMutation();

  const invoices = invoicesResponse?.data?.items || [];
  const totalPages = invoicesResponse?.data?.totalPages || 1;
  const suppliers = suppliersResponse?.data || [];

  const handleDelete = async (id: number, invoiceNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف الفاتورة ${invoiceNumber}؟`)) return;

    try {
      const result = await deletePurchaseInvoice(id).unwrap();
      if (result.success) {
        toast.success("تم حذف الفاتورة بنجاح");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      Draft: { label: "مسودة", class: "bg-muted text-muted-foreground" },
      Confirmed: { label: "مؤكدة", class: "bg-primary/10 text-primary" },
      Paid: { label: "مدفوعة", class: "bg-success/10 text-success" },
      PartiallyPaid: { label: "مدفوعة جزئياً", class: "bg-warning/10 text-warning" },
      Cancelled: { label: "ملغاة", class: "bg-danger/10 text-danger" },
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

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidCount = invoices.filter((inv) => inv.status === "Paid").length;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              فواتير الشراء
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة فواتير الشراء من الموردين والمستودع
            </p>
          </div>

          <div className="flex items-end gap-2">
            <Button
              size="lg"
              onClick={() => navigate("/purchase-invoices/new")}
              leftIcon={<Receipt className="size-5" />}
            >
              إنشاء فاتورة جديدة
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="إجمالي الفواتير"
          value={invoices.length}
          description="عدد فواتير الشراء المعروضة"
          icon={Receipt}
        />
        <MetricCard
          title="المبلغ الإجمالي"
          value={formatCurrency(totalAmount)}
          description="إجمالي قيمة الفواتير المعروضة"
          icon={Receipt}
          tone="primary"
        />
        <MetricCard
          title="الفواتير المدفوعة"
          value={paidCount}
          description="تم سدادها بالكامل للمورد"
          icon={Receipt}
          tone="success"
        />
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">المورد</label>
                <div className="relative">
                  <select
                    value={supplierId || ""}
                    onChange={(e) =>
                      setSupplierId(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
                  >
                    <option value="">الكل</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">الحالة</label>
                <div className="relative">
                  <select
                    value={status || ""}
                    onChange={(e) =>
                      setStatus(
                        (e.target.value as PurchaseInvoiceStatus) || undefined,
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
                  >
                    <option value="">الكل</option>
                    <option value="Draft">مسودة</option>
                    <option value="Confirmed">مؤكدة</option>
                    <option value="Paid">مدفوعة</option>
                    <option value="PartiallyPaid">مدفوعة جزئياً</option>
                    <option value="Cancelled">ملغاة</option>
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">من تاريخ</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-muted-foreground/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">إلى تاريخ</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
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
                  <TableHeaderCell className="text-right">رقم الفاتورة</TableHeaderCell>
                  <TableHeaderCell className="text-right">المورد</TableHeaderCell>
                  <TableHeaderCell className="text-right">التاريخ</TableHeaderCell>
                  <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                  <TableHeaderCell className="text-right">الإجمالي</TableHeaderCell>
                  <TableHeaderCell className="text-right">المدفوع</TableHeaderCell>
                  <TableHeaderCell className="text-right">المتبقي</TableHeaderCell>
                  <TableHeaderCell className="text-center w-28">إجراءات</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                      <Receipt className="mx-auto mb-4 size-12 opacity-50" />
                      <p className="text-lg font-medium">لا توجد فواتير</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-foreground">
                          {invoice.invoiceNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground block">
                          {invoice.supplierName}
                        </span>
                        {invoice.supplierPhone && (
                          <span className="mt-0.5 font-mono text-xs text-muted-foreground block">
                            {invoice.supplierPhone}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground font-medium">
                        {formatDateOnly(invoice.invoiceDate)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="font-mono font-black text-foreground">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-success/80">
                        {formatCurrency(invoice.amountPaid)}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-danger/80">
                        {formatCurrency(invoice.amountDue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/purchase-invoices/${invoice.id}`)
                            }
                            className="size-8 text-muted-foreground hover:text-primary"
                            title="عرض التفاصيل"
                          >
                            <File04 className="size-4" />
                          </Button>
                          {invoice.status === "Draft" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  navigate(
                                    `/purchase-invoices/${invoice.id}/edit`,
                                  )
                                }
                                className="size-8 text-muted-foreground hover:text-primary"
                                title="تعديل"
                              >
                                <Edit01 className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDelete(
                                    invoice.id,
                                    invoice.invoiceNumber,
                                  )
                                }
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
            <div className="flex items-center justify-center gap-3 border-t border-border bg-muted/10 p-4">
              <Button
                variant="outline"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                disabled={pageNumber === 1}
              >
                السابق
              </Button>
              <span className="font-mono text-sm font-bold text-muted-foreground">
                <span className="text-foreground">{pageNumber}</span> / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setPageNumber((p) => Math.min(totalPages, p + 1))
                }
                disabled={pageNumber === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
