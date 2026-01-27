import { useState } from "react";
import {
  ClipboardList,
  Eye,
  XCircle,
  Search,
  Calendar,
  Undo2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import { Loading } from "@/components/common/Loading";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { ORDER_STATUS, PAYMENT_METHODS, ORDER_TYPES } from "@/utils/constants";
import { Order, OrderStatus, OrdersQueryParams } from "@/types/order.types";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { useGetOrdersQuery } from "@/api/ordersApi";
import clsx from "clsx";

export const OrdersPage = () => {
  const { todayOrders, isLoadingOrders, cancelOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<"today" | "all" | "date">("today");
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Filters state
  const [filters, setFilters] = useState<OrdersQueryParams>({
    page: 1,
    pageSize: 20,
  });

  // Fetch orders with filters (only when not showing today)
  const { data: ordersResponse, isLoading: isLoadingFiltered } = useGetOrdersQuery(
    viewMode === "today" ? undefined : filters,
    { skip: viewMode === "today" }
  );

  const displayOrders = viewMode === "today" 
    ? todayOrders 
    : ordersResponse?.data?.items || [];

  const pagedData = viewMode === "today" ? null : ordersResponse?.data;

  const filteredOrders = displayOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = viewMode === "today" ? isLoadingOrders : isLoadingFiltered;

  const handleViewModeChange = (mode: "today" | "all" | "date") => {
    setViewMode(mode);
    if (mode === "date" && !selectedDate) {
      // Set to today's date by default
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
    if (mode === "date" && selectedDate) {
      // Apply date filter
      setFilters({
        page: 1,
        pageSize: 20,
        fromDate: selectedDate,
        toDate: selectedDate,
      });
    } else if (mode === "all") {
      // Clear date filters
      setFilters({
        page: 1,
        pageSize: 20,
      });
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setViewMode("date");
    setFilters({
      page: 1,
      pageSize: 20,
      fromDate: date,
      toDate: date,
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Completed: "bg-success-50 text-success-500",
      Pending: "bg-warning-50 text-warning-500",
      Cancelled: "bg-danger-50 text-danger-500",
      Refunded: "bg-gray-100 text-gray-500",
      PartiallyRefunded: "bg-amber-50 text-amber-600",
      Draft: "bg-gray-100 text-gray-500",
    };
    return colors[status] || "bg-gray-100 text-gray-500";
  };

  const isReturnOrder = (order: Order) => order.orderType === "Return";

  const handleCancel = async (orderId: number) => {
    if (confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) {
      await cancelOrder(orderId, "إلغاء من المستخدم");
    }
  };

  const handleFilterChange = (key: keyof OrdersQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // Reset to page 1 when changing filters
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 20,
    });
  };

  const hasActiveFilters = filters.status || filters.fromDate || filters.toDate;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">الطلبات</h1>
          <p className="text-gray-500">
            {viewMode === "today" 
              ? "طلبات اليوم" 
              : viewMode === "date" && selectedDate
              ? `طلبات يوم ${new Date(selectedDate).toLocaleDateString("ar-EG", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}`
              : "عرض وإدارة الطلبات"}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <Button
            variant={viewMode === "today" ? "primary" : "outline"}
            onClick={() => handleViewModeChange("today")}
            rightIcon={<Calendar className="w-4 h-4" />}
          >
            اليوم
          </Button>
          <Button
            variant={viewMode === "all" ? "primary" : "outline"}
            onClick={() => handleViewModeChange("all")}
          >
            الكل
          </Button>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600 font-medium">
              اختر يوم
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className={clsx(
                "w-40",
                viewMode === "date" && "ring-2 ring-primary-500"
              )}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 shrink-0">
        <Card>
          <p className="text-sm text-gray-500">إجمالي الطلبات</p>
          <p className="text-2xl font-bold text-gray-800">
            {viewMode === "today" ? filteredOrders.length : pagedData?.totalCount || 0}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">المكتملة</p>
          <p className="text-2xl font-bold text-success-500">
            {filteredOrders.filter((o) => 
              (o.status === "Completed" || o.status === "PartiallyRefunded") && 
              o.orderType !== "Return"
            ).length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">قيد الانتظار</p>
          <p className="text-2xl font-bold text-warning-500">
            {filteredOrders.filter((o) => o.status === "Pending").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">صافي المبيعات</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(
              filteredOrders
                .filter((o) => 
                  (o.status === "Completed" || o.status === "PartiallyRefunded" || o.status === "Refunded") && 
                  o.orderType !== "Return"
                )
                .reduce((sum, o) => {
                  // صافي المبيعات = الإجمالي - المسترجع
                  const netAmount = o.total - (o.refundAmount || 0);
                  return sum + netAmount;
                }, 0)
            )}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">المرتجعات</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(
              // مجموع المرتجعات من طلبات المرتجع فقط (Return Orders)
              Math.abs(
                filteredOrders
                  .filter((o) => o.orderType === "Return")
                  .reduce((sum, o) => sum + o.total, 0)
              )
            )}
          </p>
        </Card>
      </div>

      {/* Filters - Only show when viewing all */}
      {viewMode === "all" && (
        <Card className="shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "status",
                    e.target.value || undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">الكل</option>
                <option value="Completed">مكتمل</option>
                <option value="Cancelled">ملغي</option>
                <option value="Pending">قيد الانتظار</option>
                <option value="Refunded">مسترجع</option>
                <option value="PartiallyRefunded">مسترجع جزئياً</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                من تاريخ
              </label>
              <Input
                type="date"
                value={filters.fromDate || ""}
                onChange={(e) =>
                  handleFilterChange("fromDate", e.target.value || undefined)
                }
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                إلى تاريخ
              </label>
              <Input
                type="date"
                value={filters.toDate || ""}
                onChange={(e) =>
                  handleFilterChange("toDate", e.target.value || undefined)
                }
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  rightIcon={<X className="w-4 h-4" />}
                  className="w-full"
                >
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

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
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  رقم الطلب
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  التاريخ
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  العميل
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  الإجمالي
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  طريقة الدفع
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  الحالة
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 w-24">
                  إجراءات
                </th>
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
                  <tr
                    key={order.id}
                    className={clsx(
                      "border-b hover:bg-gray-50",
                      isReturnOrder(order) && "bg-orange-50/50"
                    )}
                  >
                    <td className="px-4 py-3 font-mono font-medium">
                      <div className="flex items-center gap-2">
                        {isReturnOrder(order) && (
                          <Undo2 className="w-4 h-4 text-orange-500" />
                        )}
                        <span
                          className={clsx(
                            isReturnOrder(order) && "text-orange-600"
                          )}
                        >
                          #{order.orderNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">{order.customerName || "-"}</td>
                    <td
                      className={clsx(
                        "px-4 py-3 font-semibold",
                        isReturnOrder(order)
                          ? "text-orange-600"
                          : "text-primary-600"
                      )}
                    >
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      {isReturnOrder(order) ? (
                        <span className="text-orange-500">
                          {ORDER_TYPES.Return.icon} {ORDER_TYPES.Return.label}
                        </span>
                      ) : order.payments.length > 0 ? (
                        order.payments
                          .map((p) => PAYMENT_METHODS[p.method]?.label)
                          .join(", ")
                      ) : (
                        "-"
                      )}
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

        {/* Pagination - Only show when viewing all and has data */}
        {viewMode === "all" && pagedData && pagedData.totalPages > 1 && (
          <div className="border-t px-4 py-3 flex items-center justify-between shrink-0">
            <div className="text-sm text-gray-600">
              صفحة {pagedData.page} من {pagedData.totalPages} ({pagedData.totalCount} طلب)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("page", filters.page! - 1)}
                disabled={!pagedData.hasPreviousPage}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("page", filters.page! + 1)}
                disabled={!pagedData.hasNextPage}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
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
