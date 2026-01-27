import { useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  ShoppingBag,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Minus,
} from "lucide-react";
import { Customer } from "@/types/customer.types";
import { useGetCustomerOrdersQuery } from "@/api/ordersApi";
import { useGetCustomerQuery } from "@/api/customersApi";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { formatDateTime, formatCurrency } from "@/utils/formatters";
import { CustomerFormModal } from "./CustomerFormModal";
import { LoyaltyPointsModal } from "./LoyaltyPointsModal";
import clsx from "clsx";

interface CustomerDetailsModalProps {
  customer: Customer;
  onClose: () => void;
}

type TabType = "details" | "orders";

export const CustomerDetailsModal = ({
  customer: initialCustomer,
  onClose,
}: CustomerDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [ordersPage, setOrdersPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [loyaltyMode, setLoyaltyMode] = useState<"add" | "redeem">("add");

  // Fetch customer data to get latest loyalty points
  const { data: customerData, refetch: refetchCustomer } = useGetCustomerQuery(
    initialCustomer.id
  );
  const customer = customerData?.data || initialCustomer;

  const ordersPageSize = 5;
  const { data: ordersData, isLoading: isLoadingOrders } =
    useGetCustomerOrdersQuery({
      customerId: customer.id,
      page: ordersPage,
      pageSize: ordersPageSize,
    });

  const orders = ordersData?.data?.items || [];
  const ordersTotalPages = ordersData?.data?.totalPages || 1;
  const ordersTotalCount = ordersData?.data?.totalCount || 0;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      Draft: { label: "مسودة", color: "bg-gray-100 text-gray-800" },
      Pending: {
        label: "قيد الانتظار",
        color: "bg-yellow-100 text-yellow-800",
      },
      Completed: { label: "مكتمل", color: "bg-green-100 text-green-800" },
      Cancelled: { label: "ملغي", color: "bg-red-100 text-red-800" },
      Refunded: { label: "مسترجع", color: "bg-purple-100 text-purple-800" },
      PartiallyRefunded: {
        label: "مسترجع جزئياً",
        color: "bg-orange-100 text-orange-800",
      },
    };
    const { label, color } = statusMap[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getOrderTypeBadge = (orderType: string) => {
    const typeMap: Record<string, { label: string; icon: string }> = {
      DineIn: { label: "بيع", icon: "🏪" },
      Takeaway: { label: "بيع", icon: "🏪" },
      Delivery: { label: "توصيل", icon: "🚚" },
      Return: { label: "مرتجع", icon: "↩️" },
    };
    const { label, icon } = typeMap[orderType] || {
      label: "غير معروف",
      icon: "❓",
    };
    return (
      <span
        className={clsx("text-xs", orderType === "Return" && "text-orange-600")}
      >
        {icon} {label}
      </span>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {customer.name || "عميل بدون اسم"}
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-500" />
                <span className="font-semibold">{customer.loyaltyPoints}</span>
                <span className="text-xs">نقطة</span>
              </div>
              <button
                onClick={() => {
                  setLoyaltyMode("add");
                  setShowLoyaltyModal(true);
                }}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                title="إضافة نقاط"
              >
                <Plus className="w-4 h-4 text-green-600 group-hover:text-green-700" />
              </button>
              <button
                onClick={() => {
                  setLoyaltyMode("redeem");
                  setShowLoyaltyModal(true);
                }}
                disabled={customer.loyaltyPoints === 0}
                className="p-2 hover:bg-orange-50 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                title="استبدال نقاط"
              >
                <Minus className="w-4 h-4 text-orange-600 group-hover:text-orange-700" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
                <ShoppingBag className="w-4 h-4" />
                إجمالي الطلبات
              </div>
              <p className="font-bold text-lg text-gray-800">
                {customer.totalOrders}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
                <Wallet className="w-4 h-4" />
                إجمالي المشتريات
              </div>
              <p className="font-bold text-lg text-green-600">
                {formatCurrency(customer.totalSpent)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                آخر طلب
              </div>
              <p className="font-semibold text-gray-800 text-sm">
                {customer.lastOrderAt
                  ? formatDateTime(customer.lastOrderAt).split(",")[0]
                  : "—"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("orders")}
              className={clsx(
                "flex-1 py-3 text-sm font-medium transition-colors",
                activeTab === "orders"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              سجل الطلبات ({ordersTotalCount})
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={clsx(
                "flex-1 py-3 text-sm font-medium transition-colors",
                activeTab === "details"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              تفاصيل العميل
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "orders" && (
              <div>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loading />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد طلبات لهذا العميل</p>
                  </div>
                ) : (
                  <>
                    {/* Orders Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="text-right py-3 px-3 font-medium">
                              رقم الطلب
                            </th>
                            <th className="text-right py-3 px-3 font-medium">
                              التاريخ
                            </th>
                            <th className="text-right py-3 px-3 font-medium">
                              النوع
                            </th>
                            <th className="text-right py-3 px-3 font-medium">
                              الحالة
                            </th>
                            <th className="text-right py-3 px-3 font-medium">
                              الإجمالي
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orders.map((order) => (
                            <tr
                              key={order.id}
                              className={clsx(
                                "hover:bg-gray-50 transition-colors",
                                order.orderType === "Return" && "bg-orange-50"
                              )}
                            >
                              <td className="py-3 px-3">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                  {order.orderNumber}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-600">
                                {formatDateTime(order.createdAt)}
                              </td>
                              <td className="py-3 px-3">
                                {getOrderTypeBadge(order.orderType)}
                              </td>
                              <td className="py-3 px-3">
                                {getStatusBadge(order.status)}
                              </td>
                              <td
                                className={clsx(
                                  "py-3 px-3 font-semibold",
                                  order.total < 0
                                    ? "text-orange-600"
                                    : "text-gray-800"
                                )}
                              >
                                {formatCurrency(order.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {ordersTotalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setOrdersPage((p) => Math.max(1, p - 1))
                          }
                          disabled={ordersPage === 1}
                        >
                          <ChevronRight className="w-4 h-4 ml-1" />
                          السابق
                        </Button>
                        <span className="text-sm text-gray-500">
                          صفحة {ordersPage} من {ordersTotalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setOrdersPage((p) =>
                              Math.min(ordersTotalPages, p + 1)
                            )
                          }
                          disabled={ordersPage === ordersTotalPages}
                        >
                          التالي
                          <ChevronLeft className="w-4 h-4 mr-1" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-4">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    معلومات الاتصال
                  </h3>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">رقم الهاتف</p>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                  </div>

                  {customer.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">
                          البريد الإلكتروني
                        </p>
                        <p className="font-medium">{customer.email}</p>
                      </div>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">العنوان</p>
                        <p className="font-medium">{customer.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {customer.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      ملاحظات
                    </h3>
                    <p className="text-gray-600">{customer.notes}</p>
                  </div>
                )}

                {/* Account Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    معلومات الحساب
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">تاريخ التسجيل</p>
                      <p className="font-medium">
                        {formatDateTime(customer.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">الحالة</p>
                      <p
                        className={clsx(
                          "font-medium",
                          customer.isActive ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {customer.isActive ? "نشط" : "غير نشط"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowEditModal(true)}
                >
                  <Eye className="w-4 h-4 ml-2" />
                  تعديل بيانات العميل
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <CustomerFormModal
          customer={customer}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Loyalty Points Modal */}
      {showLoyaltyModal && (
        <LoyaltyPointsModal
          customerId={customer.id}
          customerName={customer.name || customer.phone}
          currentPoints={customer.loyaltyPoints}
          mode={loyaltyMode}
          onClose={() => setShowLoyaltyModal(false)}
          onSuccess={() => {
            refetchCustomer();
          }}
        />
      )}
    </>
  );
};
