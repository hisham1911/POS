import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building02,
  ChevronDown,
  List,
} from "@untitledui/icons";
import { TrendingDown, TrendingUp } from "lucide-react";

import { useGetTransactionsQuery } from "../../api/cashRegisterApi";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Loading } from "../../components/common/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/ui/table";
import { MetricCard } from "../../components/app/metric-card";
import { useAppSelector } from "../../store/hooks";
import { selectCurrentBranch } from "../../store/slices/branchSlice";
import type {
  CashRegisterFilters,
  CashRegisterTransactionType,
} from "../../types/cashRegister.types";
import { formatDateTimeFull } from "../../utils/formatters";
import { cn } from "../../lib/utils";

export function CashRegisterTransactionsPage() {
  const currentBranch = useAppSelector(selectCurrentBranch);
  const [filters, setFilters] = useState<CashRegisterFilters>({
    pageNumber: 1,
    pageSize: 20,
  });

  const {
    data: response,
    isLoading,
    error,
  } = useGetTransactionsQuery(
    { ...filters, branchId: currentBranch?.id },
    { skip: !currentBranch?.id },
  );

  const transactions = response?.data?.items || [];
  const totalCount = response?.data?.totalCount || 0;
  const totalPages = response?.data?.totalPages || 1;
  const incomingCount = transactions.filter((t) => t.amount >= 0).length;
  const outgoingCount = transactions.filter((t) => t.amount < 0).length;

  const handleFilterChange = (key: keyof CashRegisterFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  const getTransactionTypeLabel = (type: CashRegisterTransactionType) => {
    const labels: Record<CashRegisterTransactionType, string> = {
      Opening: "فتح وردية",
      Deposit: "إيداع",
      Withdrawal: "سحب",
      Sale: "مبيعات",
      Refund: "مرتجع",
      Expense: "مصروف",
      SupplierPayment: "دفع لمورد",
      Adjustment: "تسوية",
      Transfer: "تحويل",
    };
    return labels[type];
  };

  const getTransactionTypeBadgeTone = (type: CashRegisterTransactionType) => {
    const tones: Record<CashRegisterTransactionType, "primary" | "success" | "danger" | "warning"> = {
      Opening: "primary",
      Deposit: "success",
      Withdrawal: "danger",
      Sale: "success",
      Refund: "danger",
      Expense: "danger",
      SupplierPayment: "danger",
      Adjustment: "warning",
      Transfer: "primary",
    };
    return tones[type];
  };

  const isIncoming = (amount: number) => amount >= 0;

  if (!currentBranch?.id) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  if (isLoading) return (
    <div className="flex h-full items-center justify-center bg-background">
      <Loading />
    </div>
  );
  
  if (error)
    return <div className="text-danger flex h-full items-center justify-center font-bold text-lg">حدث خطأ في تحميل المعاملات</div>;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <List className="size-8 text-primary" />
              سجل معاملات الخزينة
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              سجل كامل ومفصل لجميع المعاملات النقدية الواردة والصادرة للخزينة
            </p>
            {currentBranch && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 border border-primary/20">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-sm font-bold text-primary">
                  الفرع النشط: {currentBranch.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <Link to="/cash-register">
              <Button leftIcon={<ArrowRight className="size-4" />} variant="outline">
                العودة للخزينة
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="إجمالي المعاملات المعروضة"
          value={transactions.length}
          description="عدد حركات الصندوق في الصفحة الحالية"
          icon={List}
        />
        <MetricCard
          title="عمليات دخول نقدية"
          value={incomingCount}
          description="عدد حركات الإيداع والمبيعات"
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          title="عمليات خروج نقدية"
          value={outgoingCount}
          description="عدد حركات السحب والمصروفات"
          icon={TrendingDown}
          tone="danger"
        />
      </div>

      <Card className="p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              نوع المعاملة
            </label>
            <div className="relative">
              <select
                value={filters.type || ""}
                onChange={(e) =>
                  handleFilterChange("type", e.target.value || undefined)
                }
                className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer text-sm font-medium"
              >
                <option value="">جميع المعاملات</option>
                <option value="Opening">فتح وردية</option>
                <option value="Deposit">إيداع نقدي</option>
                <option value="Withdrawal">سحب نقدي</option>
                <option value="Sale">مبيعات</option>
                <option value="Refund">مرتجع</option>
                <option value="Expense">مصروف</option>
                <option value="SupplierPayment">دفع لمورد</option>
                <option value="Adjustment">تسوية</option>
                <option value="Transfer">تحويل خارجي</option>
              </select>
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <ChevronDown className="size-5 text-muted-foreground" />
              </div>
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
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
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
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              رقم الوردية
            </label>
            <input
              type="number"
              value={filters.shiftId || ""}
              onChange={(e) =>
                handleFilterChange(
                  "shiftId",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              placeholder="ابحث برقم الوردية..."
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-right">التاريخ والوقت</TableHeaderCell>
                <TableHeaderCell className="text-right">النوع</TableHeaderCell>
                <TableHeaderCell className="text-right">الوصف</TableHeaderCell>
                <TableHeaderCell className="text-right">المبلغ</TableHeaderCell>
                <TableHeaderCell className="text-right">الرصيد قبل</TableHeaderCell>
                <TableHeaderCell className="text-right">الرصيد بعد</TableHeaderCell>
                <TableHeaderCell className="text-right">المستخدم</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    <List className="mx-auto mb-3 size-8 opacity-50" />
                    لا توجد معاملات مطابقة لخيارات الفلترة الحالية.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => {
                  const tone = getTransactionTypeBadgeTone(transaction.type);
                  const isInc = isIncoming(transaction.amount);

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground whitespace-nowrap" dir="ltr">
                        {formatDateTimeFull(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold leading-none",
                            `bg-${tone}/10 text-${tone}`
                          )}
                        >
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground max-w-[200px] truncate" title={transaction.description}>
                        {transaction.description || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5" dir="ltr">
                          {isInc ? (
                            <TrendingUp className="size-4 text-success" />
                          ) : (
                            <TrendingDown className="size-4 text-danger" />
                          )}
                          <span
                            className={cn(
                              "font-mono text-sm font-bold",
                              isInc ? "text-success" : "text-danger"
                            )}
                          >
                            {isInc ? "+" : ""}
                            {transaction.amount.toFixed(2)} EGP
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium text-muted-foreground" dir="ltr">
                        {transaction.balanceBefore.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-bold text-foreground" dir="ltr">
                        {transaction.balanceAfter.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-muted-foreground">
                        {transaction.createdByUserName || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-border bg-muted/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              عرض <span className="font-bold text-foreground">{transactions.length}</span> من أصل <span className="font-bold text-foreground">{totalCount}</span> معاملة
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.pageNumber! - 1)}
                disabled={filters.pageNumber === 1}
              >
                الصفحة السابقة
              </Button>
              <div className="flex px-2 text-sm font-medium text-muted-foreground font-mono">
                {filters.pageNumber} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(filters.pageNumber! + 1)}
                disabled={filters.pageNumber === totalPages}
              >
                الصفحة التالية
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
