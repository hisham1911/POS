import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CornerUpLeft,
  Eye,
  Receipt,
  SearchLg,
  XCircle,
  XClose,
} from "@untitledui/icons";
import { useGetOrdersQuery } from "@/api/ordersApi";
import { MetricCard } from "@/components/app/metric-card";
import { Loading } from "@/components/common/Loading";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/hooks/useOrders";
import { cn } from "@/lib/utils";
import type { Order, OrdersQueryParams } from "@/types/order.types";
import { ORDER_STATUS, ORDER_TYPES, PAYMENT_METHODS } from "@/utils/constants";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";

export const OrdersPage = () => {
  const { todayOrders, isLoadingOrders, cancelOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<"today" | "all" | "date">("today");
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [filters, setFilters] = useState<OrdersQueryParams>({
    page: 1,
    pageSize: 20,
  });

  const { data: ordersResponse, isLoading: isLoadingFiltered } =
    useGetOrdersQuery(viewMode === "today" ? undefined : filters, {
      skip: viewMode === "today",
    });

  const displayOrders =
    viewMode === "today" ? todayOrders : ordersResponse?.data?.items || [];

  const pagedData = viewMode === "today" ? null : ordersResponse?.data;

  const filteredOrders = displayOrders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isLoading = viewMode === "today" ? isLoadingOrders : isLoadingFiltered;

  const handleViewModeChange = (mode: "today" | "all" | "date") => {
    setViewMode(mode);
    if (mode === "date" && !selectedDate) {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
    if (mode === "date" && selectedDate) {
      setFilters({
        page: 1,
        pageSize: 20,
        fromDate: selectedDate,
        toDate: selectedDate,
      });
    } else if (mode === "all") {
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
      Completed: "bg-success/15 text-success",
      Pending: "bg-warning/15 text-warning",
      Cancelled: "bg-danger/15 text-danger",
      Refunded: "bg-muted text-muted-foreground",
      PartiallyRefunded: "bg-accent/15 text-accent",
      Draft: "bg-muted text-muted-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const isReturnOrder = (order: Order) => order.orderType === "Return";

  const handleCancel = async (orderId: number) => {
    if (window.confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) {
      await cancelOrder(orderId, "إلغاء من المستخدم");
    }
  };

  const handleFilterChange = (key: keyof OrdersQueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
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
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  const completedOrders = filteredOrders.filter(
    (o) =>
      (o.status === "Completed" || o.status === "PartiallyRefunded") &&
      o.orderType !== "Return",
  ).length;

  const returnedOrders = filteredOrders.filter(
    (o) => o.status === "Refunded" || o.orderType === "Return",
  ).length;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              الطلبات
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              {viewMode === "today"
                ? "طلبات اليوم"
                : viewMode === "date" && selectedDate
                  ? `طلبات يوم ${formatDate(selectedDate)}`
                  : "عرض وإدارة جميع الطلبات والمبيعات"}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-96">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "today" ? "default" : "glass"}
                onClick={() => handleViewModeChange("today")}
                leftIcon={<Calendar className="size-4" />}
                size="sm"
              >
                اليوم
              </Button>
              <Button
                variant={viewMode === "all" ? "default" : "glass"}
                onClick={() => handleViewModeChange("all")}
                size="sm"
              >
                الكل
              </Button>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  اختر يوم
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={cn(
                    "w-full bg-background/50",
                    viewMode === "date" &&
                      "border-transparent ring-2 ring-primary",
                  )}
                />
              </div>
              {viewMode === "date" && (
                <Button
                  variant="default"
                  size="sm"
                  leftIcon={<Calendar className="size-4" />}
                >
                  تصفية
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters for All Mode */}
      {viewMode === "all" && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  الحالة
                </label>
                <div className="relative">
                  <select
                    value={filters.status || ""}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value || undefined)
                    }
                    className="w-full appearance-none rounded-2xl border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all hover:border-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">الكل</option>
                    <option value="Completed">مكتمل</option>
                    <option value="Cancelled">ملغي</option>
                    <option value="Pending">قيد الانتظار</option>
                    <option value="Refunded">مسترجع</option>
                    <option value="PartiallyRefunded">مسترجع جزئياً</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  من تاريخ
                </label>
                <Input
                  type="date"
                  value={filters.fromDate || ""}
                  onChange={(e) =>
                    handleFilterChange("fromDate", e.target.value || undefined)
                  }
                  className="bg-background/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  إلى تاريخ
                </label>
                <Input
                  type="date"
                  value={filters.toDate || ""}
                  onChange={(e) =>
                    handleFilterChange("toDate", e.target.value || undefined)
                  }
                  className="bg-background/50"
                />
              </div>

              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    variant="glass"
                    onClick={clearFilters}
                    rightIcon={<XClose className="size-4" />}
                    className="w-full"
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <MetricCard
          title="إجمالي الطلبات"
          value={
            viewMode === "today"
              ? filteredOrders.length
              : pagedData?.totalCount || 0
          }
          description="جميع الطلبات"
          icon={Receipt}
        />
        <MetricCard
          title="المكتملة"
          value={completedOrders}
          description="ناجحة"
          icon={Receipt}
          tone="success"
        />
        <MetricCard
          title="المرتجعات"
          value={returnedOrders}
          description="مسترجعة"
          icon={CornerUpLeft}
          tone="danger"
        />
        <MetricCard
          title="صافي المبيعات"
          value={formatCurrency(
            filteredOrders
              .filter(
                (o) =>
                  (o.status === "Completed" ||
                    o.status === "PartiallyRefunded" ||
                    o.status === "Refunded") &&
                  o.orderType !== "Return",
              )
              .reduce((sum, o) => {
                const netAmount = o.total - (o.refundAmount || 0);
                return sum + netAmount;
              }, 0),
          )}
          description="أرباح صافية"
          icon={Receipt}
        />
        <MetricCard
          title="حجم المرتجعات"
          value={formatCurrency(
            Math.abs(
              filteredOrders
                .filter((o) => o.orderType === "Return")
                .reduce((sum, o) => sum + o.total, 0),
            ),
          )}
          description="إجمالي الأموال المرتجعة"
          icon={CornerUpLeft}
          tone="warning"
        />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex-1 space-y-6">
          {/* Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <SearchLg className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم الطلب أو اسم العميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/50 pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-right">رقم الطلب</TableHeaderCell>
                    <TableHeaderCell className="text-right">التاريخ</TableHeaderCell>
                    <TableHeaderCell className="text-right">العميل</TableHeaderCell>
                    <TableHeaderCell className="text-right">الإجمالي</TableHeaderCell>
                    <TableHeaderCell className="text-right">طريقة الدفع</TableHeaderCell>
                    <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                    <TableHeaderCell className="w-24 text-center">إجراءات</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
                        <Receipt className="mx-auto mb-4 size-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">لا توجد طلبات</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className={cn(isReturnOrder(order) && "bg-warning/5")}
                      >
                        <TableCell className="font-mono font-medium">
                          <div className="flex items-center gap-2">
                            {isReturnOrder(order) && (
                              <CornerUpLeft className="size-4 text-warning" />
                            )}
                            <span
                              className={cn(
                                isReturnOrder(order) && "text-warning",
                              )}
                            >
                              #{order.orderNumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </TableCell>
                        <TableCell>{order.customerName || "-"}</TableCell>
                        <TableCell
                          className={cn(
                            "font-semibold",
                            isReturnOrder(order)
                              ? "text-warning"
                              : "text-primary",
                          )}
                        >
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          {isReturnOrder(order) ? (
                            <span className="text-warning">
                              {ORDER_TYPES.Return.label}
                            </span>
                          ) : order.payments.length > 0 ? (
                            order.payments
                              .map((p) => PAYMENT_METHODS[p.method]?.label)
                              .join(", ")
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "border-none",
                              getStatusColor(order.status),
                            )}
                          >
                            {ORDER_STATUS[order.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                              className="size-8 text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="size-4" />
                            </Button>
                            {order.status === "Pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancel(order.id)}
                                className="size-8 text-danger hover:bg-danger/10"
                              >
                                <XCircle className="size-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {viewMode === "all" && pagedData && pagedData.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <div className="text-sm text-muted-foreground">
                  صفحة {pagedData.page} من {pagedData.totalPages} (
                  {pagedData.totalCount} طلب)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() =>
                      handleFilterChange("page", (filters.page || 1) - 1)
                    }
                    disabled={!pagedData.hasPreviousPage}
                    rightIcon={<ChevronRight className="size-4" />}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() =>
                      handleFilterChange("page", (filters.page || 1) + 1)
                    }
                    disabled={!pagedData.hasNextPage}
                    leftIcon={<ChevronLeft className="size-4" />}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="xl:w-[320px]">
          <Card className="sticky top-24 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                💡 نصائح إدارة الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong>أنماط العرض:</strong> عرض طلبات اليوم أو جميع الطلبات أو اختر يوم معين
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-warning">•</span>
                  <span>
                    <strong>المرتجعات:</strong> الطلبات الاستثنائية تكون بلون تحذيري ولها أيقونة دلالية
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong>الإحصائيات:</strong> تتبع المبيعات الصافية لحظياً مع كل عملية
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong>البحث:</strong> ابحث بسرعة باستخدام رقم الطلب أو اسم العميل
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

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
