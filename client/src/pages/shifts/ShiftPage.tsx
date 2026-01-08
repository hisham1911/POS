import { useState } from "react";
import { Clock, DollarSign, ShoppingBag, CreditCard, Banknote, Play, Square } from "lucide-react";
import { useShift } from "@/hooks/useShift";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Loading } from "@/components/common/Loading";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import clsx from "clsx";

export const ShiftPage = () => {
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");

  const {
    currentShift,
    hasActiveShift,
    isLoading,
    openShift,
    closeShift,
    isOpening,
    isClosing,
  } = useShift();

  const handleOpenShift = async () => {
    await openShift({ openingBalance: Number(openingBalance) });
    setShowOpenModal(false);
    setOpeningBalance("");
  };

  const handleCloseShift = async () => {
    await closeShift({ closingBalance: Number(closingBalance), notes });
    setShowCloseModal(false);
    setClosingBalance("");
    setNotes("");
  };

  if (isLoading) return <Loading />;

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">إدارة الوردية</h1>
          <p className="text-gray-500 mt-1">فتح وإغلاق الورديات ومتابعة المبيعات</p>
        </div>
        {!hasActiveShift ? (
          <Button
            variant="success"
            onClick={() => setShowOpenModal(true)}
            rightIcon={<Play className="w-5 h-5" />}
          >
            فتح وردية جديدة
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={() => setShowCloseModal(true)}
            rightIcon={<Square className="w-5 h-5" />}
          >
            إغلاق الوردية
          </Button>
        )}
      </div>

      {/* Shift Status */}
      <Card className="text-center py-8">
        <div
          className={clsx(
            "w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center",
            hasActiveShift ? "bg-success-50" : "bg-gray-100"
          )}
        >
          <Clock
            className={clsx(
              "w-10 h-10",
              hasActiveShift ? "text-success-500" : "text-gray-400"
            )}
          />
        </div>
        <h2 className="text-xl font-bold mb-2">
          {hasActiveShift ? "🟢 الوردية مفتوحة" : "🔴 لا توجد وردية مفتوحة"}
        </h2>
        {currentShift && hasActiveShift && (
          <p className="text-gray-500">
            فُتحت: {formatDateTime(currentShift.openedAt)}
          </p>
        )}
      </Card>

      {/* Shift Stats */}
      {currentShift && hasActiveShift && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">رصيد الافتتاح</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(currentShift.openingBalance)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success-50 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-success-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">عدد الطلبات</p>
                  <p className="text-xl font-bold text-gray-800">
                    {currentShift.totalOrders}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-warning-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">إجمالي المبيعات</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(currentShift.totalCash + currentShift.totalCard)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">المبيعات النقدية</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(currentShift.totalCash)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">المبيعات بالبطاقة</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatCurrency(currentShift.totalCard)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Open Shift Modal */}
      <Modal
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        title="فتح وردية جديدة"
      >
        <div className="space-y-4">
          <Input
            label="رصيد الافتتاح"
            type="number"
            value={openingBalance}
            onChange={(e) => setOpeningBalance(e.target.value)}
            placeholder="0.00"
            hint="المبلغ النقدي في الصندوق عند بداية الوردية"
          />
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowOpenModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              variant="success"
              onClick={handleOpenShift}
              isLoading={isOpening}
              className="flex-1"
            >
              فتح الوردية
            </Button>
          </div>
        </div>
      </Modal>

      {/* Close Shift Modal */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="إغلاق الوردية"
      >
        <div className="space-y-4">
          {currentShift && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">رصيد الافتتاح:</span>
                <span className="font-medium">{formatCurrency(currentShift.openingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">المبيعات النقدية:</span>
                <span className="font-medium">{formatCurrency(currentShift.totalCash)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-700 font-medium">الرصيد المتوقع:</span>
                <span className="font-bold text-primary-600">
                  {formatCurrency(currentShift.openingBalance + currentShift.totalCash)}
                </span>
              </div>
            </div>
          )}
          <Input
            label="الرصيد الفعلي في الصندوق"
            type="number"
            value={closingBalance}
            onChange={(e) => setClosingBalance(e.target.value)}
            placeholder="0.00"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات على الوردية..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCloseModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              variant="danger"
              onClick={handleCloseShift}
              isLoading={isClosing}
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
