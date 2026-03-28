import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowCircleDown,
  ArrowCircleUp,
  CurrencyDollar as DollarSign,
  RefreshCcw01 as RefreshCw,
} from "@untitledui/icons";
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  useDepositMutation,
  useGetCurrentBalanceQuery,
  useGetTransactionsQuery,
  useWithdrawMutation,
} from "../../api/cashRegisterApi";
import { Button } from "../../components/ui/button";
import { MetricCard } from "../../components/app/metric-card";
import { Card, CardContent } from "../../components/ui/card";
import { Loading } from "../../components/common/Loading";
import { Modal } from "../../components/common/Modal";
import { useAppSelector } from "../../store/hooks";
import { selectCurrentBranch } from "../../store/slices/branchSlice";
import type { CashRegisterTransactionType } from "../../types/cashRegister.types";
import { formatDateTimeFull } from "../../utils/formatters";
import { cn } from "../../lib/utils";

export function CashRegisterDashboard() {
  const currentBranch = useAppSelector(selectCurrentBranch);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDescription, setDepositDescription] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawDescription, setWithdrawDescription] = useState("");

  const {
    data: balanceResponse,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useGetCurrentBalanceQuery(currentBranch?.id, {
    skip: !currentBranch?.id,
  });
  const { data: transactionsResponse, isLoading: isLoadingTransactions } =
    useGetTransactionsQuery(
      {
        branchId: currentBranch?.id,
        pageNumber: 1,
        pageSize: 10,
      },
      { skip: !currentBranch?.id },
    );
  const [deposit, { isLoading: isDepositing }] = useDepositMutation();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();

  const balance = balanceResponse?.data;
  const transactions = transactionsResponse?.data?.items || [];
  const incomingTotal = transactions
    .filter((t) => t.amount >= 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const outgoingTotal = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    if (!depositDescription.trim()) {
      alert("يرجى إدخال وصف للإيداع");
      return;
    }

    try {
      await deposit({
        branchId: currentBranch!.id,
        amount,
        description: depositDescription,
      }).unwrap();
      setShowDepositModal(false);
      setDepositAmount("");
      setDepositDescription("");
      refetchBalance();
    } catch (error) {
      console.error("Failed to deposit:", error);
      alert("حدث خطأ أثناء الإيداع");
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    if (!withdrawDescription.trim()) {
      alert("يرجى إدخال وصف للسحب");
      return;
    }

    try {
      await withdraw({
        branchId: currentBranch!.id,
        amount,
        description: withdrawDescription,
      }).unwrap();
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawDescription("");
      refetchBalance();
    } catch (error) {
      console.error("Failed to withdraw:", error);
      alert("حدث خطأ أثناء السحب");
    }
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

  const getTransactionColorTone = (type: CashRegisterTransactionType) => {
    const colors: Record<CashRegisterTransactionType, "success" | "danger" | "warning" | "primary"> = {
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
    return colors[type];
  };

  const isIncoming = (amount: number) => amount >= 0;

  if (!currentBranch?.id) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  if (isLoadingBalance) return (
    <div className="flex h-full items-center justify-center bg-background">
      <Loading />
    </div>
  );

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <DollarSign className="size-8 text-primary" />
              صندوق الخزينة
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة الخزينة وتسجيل المعاملات النقدية اليومية من إيداعات ومسحوبات للفرع الحالي
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
            <Button
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => setShowDepositModal(true)}
              leftIcon={<ArrowCircleUp className="size-5" />}
            >
              إيداع خزينة
            </Button>
            <Button
              className="bg-danger text-danger-foreground hover:bg-danger/90"
              onClick={() => setShowWithdrawModal(true)}
              leftIcon={<ArrowCircleDown className="size-5" />}
            >
              سحب نقدي
            </Button>
            <Button
              variant="outline"
              onClick={() => refetchBalance()}
              leftIcon={<RefreshCw className="size-5" />}
            >
              تحديث
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="الرصيد الفعلي الحالي"
          value={<>{balance?.currentBalance.toFixed(2)}<span className="text-sm text-foreground/50 mr-1">جنيه</span></>}
          description="إجمالي مبلغ الخزينة اللحظي"
          icon={DollarSign}
        />
        <MetricCard
          title="إيداعات آخر 10 معاملات"
          value={<>{incomingTotal.toFixed(2)}<span className="text-sm text-success/50 mr-1">جنيه</span></>}
          description="إجمالي المبالغ الداخلة"
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          title="مدفوعات آخر 10 معاملات"
          value={<>{outgoingTotal.toFixed(2)}<span className="text-sm text-danger/50 mr-1">جنيه</span></>}
          description="إجمالي المبالغ المسحوبة"
          icon={TrendingDown}
          tone="danger"
        />
      </div>

      <Card className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border bg-muted/10 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              آخر عمليات الصندوق
            </h3>
            {balance?.lastTransactionDate && (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                محدث في: {formatDateTimeFull(balance.lastTransactionDate)}
              </p>
            )}
          </div>
          <Link
            to="/cash-register/transactions"
            className="text-sm font-bold text-primary hover:underline"
          >
            عرض السجل الكامل
          </Link>
        </div>

        <div className="p-0">
          {isLoadingTransactions ? (
            <div className="py-12">
              <Loading />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <DollarSign className="mx-auto mb-4 size-12 opacity-30" />
              <p className="text-lg font-medium">لا توجد حركات في الصندوق حالياً</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((transaction) => {
                const tone = getTransactionColorTone(transaction.type);
                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex size-12 shrink-0 items-center justify-center rounded-xl",
                          isIncoming(transaction.amount) 
                            ? "bg-success/10 text-success" 
                            : "bg-danger/10 text-danger"
                        )}
                      >
                        {isIncoming(transaction.amount) ? (
                          <TrendingUp className="size-6" />
                        ) : (
                          <TrendingDown className="size-6" />
                        )}
                      </div>
                      <div>
                        <p className={cn(
                          "mb-1 font-bold",
                          `text-${tone}`
                        )}>
                          {getTransactionTypeLabel(transaction.type)}
                        </p>
                        <p className="mb-2 text-sm font-medium text-muted-foreground">
                          {transaction.description || "—"}
                        </p>
                        <p className="font-mono text-xs font-semibold text-muted-foreground/80" dir="ltr">
                          {formatDateTimeFull(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left shrink-0 max-sm:pl-[64px] max-sm:text-right">
                      <p
                        className={cn(
                          "font-mono text-xl font-black tracking-tight",
                          isIncoming(transaction.amount)
                            ? "text-success"
                            : "text-danger"
                        )}
                        dir="ltr"
                      >
                        {isIncoming(transaction.amount) ? "+" : ""}
                        {transaction.amount.toFixed(2)} EGP
                      </p>
                      <p className="mt-1 font-mono text-xs font-bold text-muted-foreground" dir="ltr">
                        Bal: {transaction.balanceAfter.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="إيداع نقدي الخزينة"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              المبلغ <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={depositAmount === "0" ? "" : depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 pl-12 text-lg font-black font-mono transition-colors focus:border-success focus:outline-none focus:ring-2 focus:ring-success/20"
                placeholder="0.00"
                required
                dir="ltr"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                ج.م
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              البيان / الوصف <span className="text-danger">*</span>
            </label>
            <textarea
              value={depositDescription}
              onChange={(e) => setDepositDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-medium transition-colors focus:border-success focus:outline-none focus:ring-2 focus:ring-success/20"
              placeholder="وصف سبب الإيداع (مثال: سداد ذمم)..."
              required
            />
          </div>
          
          <div className="mb-2 rounded-xl border border-success/20 bg-success/5 p-4">
            <p className="text-sm font-bold text-success flex justify-between items-center" dir="rtl">
              الرصيد الحالي للخزينة:
              <span className="font-mono text-lg">{balance?.currentBalance.toFixed(2)}</span>
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowDepositModal(false)}
              className="flex-1"
            >
              التراجع
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount || !depositDescription}
              className="flex-1 border-success bg-success text-success-foreground hover:bg-success/90"
              leftIcon={isDepositing ? <RefreshCw className="size-4 animate-spin" /> : undefined}
            >
              {isDepositing ? "جاري الحفظ..." : "تأكيد واستلام النقدية"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="سحب نقدي من الخزينة"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              المبلغ <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={withdrawAmount === "0" ? "" : withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 pl-12 text-lg font-black font-mono transition-colors focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20"
                placeholder="0.00"
                required
                dir="ltr"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                ج.م
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              البيان / الوصف <span className="text-danger">*</span>
            </label>
            <textarea
              value={withdrawDescription}
              onChange={(e) => setWithdrawDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-3 text-sm font-medium transition-colors focus:border-danger focus:outline-none focus:ring-2 focus:ring-danger/20"
              placeholder="وصف سبب المصروف أو السحب (مثال: نكهات وكهرباء)..."
              required
            />
          </div>
          
          <div className="mb-2 rounded-xl border border-warning/20 bg-warning/5 p-4">
            <p className="text-sm font-bold text-warning flex justify-between items-center" dir="rtl">
              رصيد الخزينة المتاح:
              <span className="font-mono text-lg">{balance?.currentBalance.toFixed(2)}</span>
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowWithdrawModal(false)}
              className="flex-1"
            >
              التراجع
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount || !withdrawDescription}
              className="flex-1 border-danger bg-danger text-danger-foreground hover:bg-danger/90"
              leftIcon={isWithdrawing ? <RefreshCw className="size-4 animate-spin" /> : undefined}
            >
              {isWithdrawing ? "جاري الخصم..." : "تأكيد وصرف النقدية"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
