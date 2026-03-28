import { useState } from "react";
import {
  BankNote01,
  Clock,
  CreditCard01,
  CurrencyDollarCircle,
  PlayCircle,
  ShoppingCart01,
  StopCircle,
  Users01,
} from "@untitledui/icons";

import { useGetShiftWarningsQuery } from "@/api/shiftsApi";
import { MetricCard } from "@/components/app/metric-card";
import { Loading } from "@/components/common/Loading";
import { Modal } from "@/components/common/Modal";
import {
  ActiveShiftsList,
  ForceCloseShiftModal,
  HandoverShiftModal,
  ShiftWarningBanner,
} from "@/components/shifts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useShift } from "@/hooks/useShift";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { shiftPersistence } from "@/utils/shiftPersistence";

export const ShiftPage = () => {
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showForceCloseModal, setShowForceCloseModal] = useState(false);
  const [selectedShiftForForceClose, setSelectedShiftForForceClose] =
    useState<any>(null);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [dismissedWarning, setDismissedWarning] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const {
    currentShift,
    hasActiveShift,
    isLoading,
    openShift,
    closeShift,
    isOpening,
    isClosing,
  } = useShift();

  const { data: warningsData } = useGetShiftWarningsQuery(undefined, {
    pollingInterval: 5 * 60 * 1000,
    skip: !hasActiveShift,
  });

  const shiftWarning = warningsData?.data;

  const handleOpenShift = async () => {
    await openShift({ openingBalance: Number(openingBalance) });
    setShowOpenModal(false);
    setOpeningBalance("");
  };

  const handleCloseShift = async () => {
    await closeShift({
      closingBalance: Number(closingBalance),
      notes,
      rowVersion: currentShift?.rowVersion,
    });
    shiftPersistence.clear();
    setShowCloseModal(false);
    setClosingBalance("");
    setNotes("");
  };

  const handleForceClose = (shift: any) => {
    setSelectedShiftForForceClose(shift);
    setShowForceCloseModal(true);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="page-shell">
      {shiftWarning && !dismissedWarning && (
        <div className="mb-4">
          <ShiftWarningBanner
            warning={shiftWarning}
            onClose={() => setDismissedWarning(true)}
          />
        </div>
      )}

      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              إدارة الوردية
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              فتح وإغلاق الورديات ومتابعة المبيعات
            </p>
          </div>

          <div className="flex gap-3">
            {!hasActiveShift ? (
              <Button
                variant="default"
                onClick={() => setShowOpenModal(true)}
                rightIcon={<PlayCircle className="size-5" />}
              >
                فتح وردية جديدة
              </Button>
            ) : (
              <>
                <Button
                  variant="glass"
                  onClick={() => setShowHandoverModal(true)}
                  rightIcon={<Users01 className="size-5" />}
                >
                  تسليم الوردية
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowCloseModal(true)}
                  rightIcon={<StopCircle className="size-5" />}
                >
                  إغلاق الوردية
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <Card className="flex flex-col items-center justify-center p-8 text-center bg-background/50 backdrop-blur-md border-border/60">
        <div
          className={cn(
            "mb-4 flex size-24 items-center justify-center rounded-[2rem]",
            hasActiveShift ? "bg-success/10" : "bg-muted",
          )}
        >
          <Clock
            className={cn(
              "size-12",
              hasActiveShift ? "text-success" : "text-muted-foreground",
            )}
          />
        </div>
        <h2 className={cn("mb-2 font-display text-2xl font-bold", hasActiveShift ? "text-foreground" : "text-muted-foreground")}>
          {hasActiveShift ? "الوردية مفتوحة 🟢" : "لا توجد وردية مفتوحة 🔴"}
        </h2>
        {currentShift && hasActiveShift && (
          <p className="text-muted-foreground">
            فُتحت: {formatDateTime(currentShift.openedAt)}
          </p>
        )}
      </Card>

      {currentShift && hasActiveShift && currentShift.isHandedOver && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Users01 className="size-5 text-primary" />
            <p className="text-sm text-foreground/80">
              <strong className="text-foreground">تم التسليم</strong> من{" "}
              {currentShift.handedOverFromUserName} في{" "}
              {formatDateTime(currentShift.handedOverAt || "")}
            </p>
          </CardContent>
        </Card>
      )}

      {currentShift && hasActiveShift && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              title="رصيد الافتتاح"
              value={formatCurrency(currentShift.openingBalance)}
              description="الرصيد النقدي"
              icon={CurrencyDollarCircle}
            />
            <MetricCard
              title="عدد الطلبات"
              value={currentShift.totalOrders}
              description="مكتملة"
              icon={ShoppingCart01}
              tone="success"
            />
            <MetricCard
              title="إجمالي المبيعات"
              value={formatCurrency(currentShift.totalCash + currentShift.totalCard)}
              description="اليوم"
              icon={CurrencyDollarCircle}
              tone="warning"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-success/20 bg-success/5">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-success/15">
                  <BankNote01 className="size-7 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-success">المبيعات النقدية</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {formatCurrency(currentShift.totalCash)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-start gap-4 py-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/15">
                  <CreditCard01 className="size-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">مبيعات إلكترونية</p>
                  <p className="font-display text-2xl font-bold text-foreground mb-1">
                    {formatCurrency(currentShift.totalCard)}
                  </p>
                  {(currentShift.totalFawry > 0 || currentShift.totalBankTransfer > 0) && (
                    <div className="space-y-0.5 text-xs text-muted-foreground font-medium">
                      <p>
                        بطاقة:{" "}
                        {formatCurrency(
                          currentShift.totalCard -
                            currentShift.totalFawry -
                            currentShift.totalBankTransfer,
                        )}
                      </p>
                      {currentShift.totalFawry > 0 && (
                        <p>فوري: {formatCurrency(currentShift.totalFawry)}</p>
                      )}
                      {currentShift.totalBankTransfer > 0 && (
                        <p>ت. بنكي: {formatCurrency(currentShift.totalBankTransfer)}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isAdmin && (
        <ActiveShiftsList
          onForceClose={handleForceClose}
          currentUserId={user?.id}
          isAdmin={isAdmin}
        />
      )}

      {currentShift && (
        <HandoverShiftModal
          shift={currentShift}
          isOpen={showHandoverModal}
          onClose={() => setShowHandoverModal(false)}
          onSuccess={() => {
            setShowHandoverModal(false);
          }}
          availableUsers={[
            { id: 2, name: "أحمد محمد", email: "ahmed@kasserpro.com" },
            { id: 3, name: "فاطمة علي", email: "fatima@kasserpro.com" },
          ]}
        />
      )}

      {selectedShiftForForceClose && (
        <ForceCloseShiftModal
          shift={selectedShiftForForceClose}
          isOpen={showForceCloseModal}
          onClose={() => {
            setShowForceCloseModal(false);
            setSelectedShiftForForceClose(null);
          }}
          onSuccess={() => {
            setShowForceCloseModal(false);
            setSelectedShiftForForceClose(null);
          }}
        />
      )}

      <Modal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        title="فتح وردية جديدة"
      >
        <div className="space-y-4">
          <Input
            label="رصيد الافتتاح"
            type="number"
            value={openingBalance === "0" ? "" : openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            placeholder="0.00"
          />
          <p className="text-sm text-muted-foreground px-1 -mt-2">المبلغ النقدي في الصندوق عند بداية الوردية</p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="glass"
              onClick={() => setShowOpenModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              variant="default"
              onClick={handleOpenShift}
              disabled={isOpening}
              className="flex-1"
            >
              فتح الوردية
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="إغلاق الوردية"
      >
        <div className="space-y-4">
          {currentShift && (
            <div className="space-y-3 rounded-2xl bg-muted/50 p-5 border border-border/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">رصيد الافتتاح:</span>
                <span className="font-bold text-foreground">
                  {formatCurrency(currentShift.openingBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">المبيعات النقدية:</span>
                <span className="font-bold text-success">
                  {formatCurrency(currentShift.totalCash)}
                </span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-3">
                <span className="font-bold text-foreground">الرصيد المتوقع:</span>
                <span className="font-black text-primary text-lg">
                  {formatCurrency(currentShift.openingBalance + currentShift.totalCash)}
                </span>
              </div>
            </div>
          )}
          <Input
            label="الرصيد الفعلي في الصندوق"
            type="number"
            value={closingBalance === "0" ? "" : closingBalance}
            onChange={(e) => setClosingBalance(e.target.value)}
            placeholder="0.00"
          />
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات على الوردية..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="glass"
              onClick={() => setShowCloseModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleCloseShift}
              disabled={isClosing}
              className="flex-1"
            >
              إغلاق الوردية
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ShiftPage;
