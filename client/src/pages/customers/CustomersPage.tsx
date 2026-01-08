import { useState } from "react";
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Star,
  Eye,
} from "lucide-react";
import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
} from "@/api/customersApi";
import { Customer } from "@/types/customer.types";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { CustomerDetailsModal } from "@/components/customers/CustomerDetailsModal";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { formatDateTime, formatCurrency } from "@/utils/formatters";
import { toast } from "sonner";
import clsx from "clsx";

export const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null
  );
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const pageSize = 10;

  const { data, isLoading, isFetching } = useGetCustomersQuery({
    page,
    pageSize,
    search: search || undefined,
  });

  const [deleteCustomer, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();

  const customers = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalCount = data?.data?.totalCount || 0;
  const hasNextPage = data?.data?.hasNextPage || false;
  const hasPreviousPage = data?.data?.hasPreviousPage || false;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;

    try {
      const result = await deleteCustomer(deletingCustomer.id).unwrap();
      if (result.success) {
        toast.success("تم حذف العميل بنجاح");
        setDeletingCustomer(null);
      } else {
        toast.error(result.message || "فشل حذف العميل");
      }
    } catch {
      toast.error("فشل حذف العميل");
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingCustomer(null);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">إدارة العملاء</h1>
            <p className="text-sm text-gray-500">{totalCount} عميل</p>
          </div>
        </div>

        <Button variant="primary" onClick={() => setShowFormModal(true)}>
          <UserPlus className="w-5 h-5" />
          إضافة عميل جديد
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="بحث بالاسم أو رقم الهاتف..."
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Button type="submit" variant="secondary">
            بحث
          </Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
            >
              مسح
            </Button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  الاسم
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  رقم الهاتف
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 hidden md:table-cell">
                  العنوان
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                  نقاط الولاء
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                  إجمالي الطلبات
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">
                  إجمالي المشتريات
                </th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-600">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">لا يوجد عملاء</p>
                    <p className="text-sm">ابدأ بإضافة عميل جديد</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={clsx(
                      "hover:bg-gray-50 transition-colors",
                      isFetching && "opacity-50"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-primary-600 font-semibold">
                            {(customer.name || customer.phone)[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {customer.name || "—"}
                          </p>
                          {customer.lastOrderAt && (
                            <p className="text-xs text-gray-400">
                              آخر طلب: {formatDateTime(customer.lastOrderAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-600" dir="ltr">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden md:table-cell">
                      {customer.address || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-gray-800">
                          {customer.loyaltyPoints}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                      {customer.totalOrders} طلب
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden lg:table-cell">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewingCustomer(customer)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCustomer(customer)}
                          className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              صفحة {page} من {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!hasPreviousPage || isFetching}
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNextPage || isFetching}
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={handleCloseFormModal}
        />
      )}

      {/* Customer Details Modal */}
      {viewingCustomer && (
        <CustomerDetailsModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                حذف العميل
              </h3>
              <p className="text-gray-500">
                هل أنت متأكد من حذف العميل "
                {deletingCustomer.name || deletingCustomer.phone}"؟
              </p>
              <p className="text-sm text-danger-500 mt-2">
                لا يمكن التراجع عن هذا الإجراء
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeletingCustomer(null)}
                className="flex-1"
                disabled={isDeleting}
              >
                إلغاء
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="flex-1"
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
