import { useState } from "react";
import { ClipboardList, Eye, XCircle, Search, Calendar } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { Loading } from "@/components/common/Loading";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { ORDER_STATUS, PAYMENT_METHODS } from "@/utils/constants";
import { Order } from "@/types/order.types";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import clsx from "clsx";

export const OrdersPage = () => {
  const { orders, todayOrders, isLoadingOrders, cancelOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showToday, setShowToday] = useState(true);

  const displayOrders = showToday ? todayOrders : orders;

  const filteredOrders = displayOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-success-50 text-success-500",
      Pending: "bg-warning-50 text-warning-500",
      Cancelled: "bg-danger-50 text-danger-500",
      Refunded: "bg-gray-100 text-gray-500",
      Draft: "bg-gray-100 text-gray-500",
    };
    return colors[status] || "bg-gray-100 text-gray-500";
  };

  const handleCancel = async (orderId: number) => {
    if (confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) {
      await cancelOrder(orderId, "إلغاء من المستخدم");
    }
  };

  if (isLoadingOrders) {
    return <Loading />;
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الطلبات</h1>
          <p className="text-gray-500">عرض وإدارة الطلبات</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showToday ? "primary" : "outline"}
            onClick={() => setShowToday(true)}
            rightIcon={<Calendar className="w-4 h-4" />}
          >
            اليوم
          </Button>
          <Button
            variant={!showToday ? "primary" : "outline"}
            onClick={() => setShowToday(false)}
          >
            الكل
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 shrink-0">
        <Card>
          <p className="text-sm text-gray-500">إجمالي الطلبات</p>
          <p className="text-2xl font-bold text-gray-800">{filteredOrders.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">المكتملة</p>
          <p className="text-2xl font-bold text-success-500">
            {filteredOrders.filter((o) => o.status === "Completed").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">قيد الانتظار</p>
          <p className="text-2xl font-bold text-warning-500">
            {filteredOrders.filter((o) => o.status === "Pending").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">إجمالي المبيعات</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(
              filteredOrders
                .filter((o) => o.status === "Completed")
                .reduce((sum, o) => sum + o.total, 0)
            )}
          </p>
        </Card>
      </div>

      {/* Search */}
      <Card className="shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="بحث برقم الطلب أو اسم العميل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" className="flex-1 min-h-0 flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-4 py-3 text-right font-semibold text-gray-600">رقم الطلب</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">التاريخ</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">العميل</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجمالي</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">طريقة الدفع</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-600 w-24">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-400">لا توجد طلبات</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">{order.customerName || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-primary-600">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    {order.payments.length > 0
                      ? order.payments.map((p) => PAYMENT_METHODS[p.method]?.label).join(", ")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        getStatusColor(order.status)
                      )}
                    >
                      {ORDER_STATUS[order.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      {order.status === "Pending" && (
                        <button
                          onClick={() => handleCancel(order.id)}
                          className="p-2 hover:bg-danger-50 rounded-lg transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-danger-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrdersPage;
