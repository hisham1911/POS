import { FormEvent, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit01,
  Eye,
  SearchLg,
  Star01,
  Trash01,
  UserPlus01,
  Users01
} from "@untitledui/icons";

import {
  useDeleteCustomerMutation,
  useGetCustomersQuery
} from "@/api/customersApi";
import { Portal } from "@/components/common/Portal";
import { MetricCard } from "@/components/app/metric-card";
import { Loading } from "@/components/common/Loading";
import { CustomerDetailsModal } from "@/components/customers/CustomerDetailsModal";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Customer } from "@/types/customer.types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { toast } from "sonner";

export const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
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

  const handleSearch = (e: FormEvent) => {
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
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  const totalDue = customers.reduce((sum, c) => sum + c.totalDue, 0);
  const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              إدارة العملاء
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة قاعدة بيانات العملاء والمبيعات والديون
            </p>
          </div>

          <div className="flex items-end gap-2">
            <Button
              size="lg"
              onClick={() => setShowFormModal(true)}
              leftIcon={<UserPlus01 className="size-4" />}
            >
              إضافة عميل جديد
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          title="إجمالي العملاء"
          value={totalCount}
          description="عميل مسجل"
          icon={Users01}
        />
        <MetricCard
          title="إجمالي المبيعات"
          value={formatCurrency(totalSpent)}
          description="للعملاء المسجلين"
          icon={Star01}
          tone="success"
        />
        <MetricCard
          title="إجمالي المستحق"
          value={formatCurrency(totalDue)}
          description="ديون العملاء"
          icon={SearchLg}
          tone="warning"
        />
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex-1 space-y-6">
          <form onSubmit={handleSearch}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <SearchLg className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="بحث بالاسم أو رقم الهاتف..."
                      className="bg-background/50 pl-10"
                    />
                  </div>
                  <Button type="submit" variant="default">
                    بحث
                  </Button>
                  {search && (
                    <Button
                      type="button"
                      variant="glass"
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
              </CardContent>
            </Card>
          </form>

          <Card className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-right">الاسم</TableHeaderCell>
                    <TableHeaderCell className="text-right">رقم الهاتف</TableHeaderCell>
                    <TableHeaderCell className="hidden text-right md:table-cell">العنوان</TableHeaderCell>
                    <TableHeaderCell className="text-right">نقاط الولاء</TableHeaderCell>
                    <TableHeaderCell className="hidden text-right lg:table-cell">الطلبات</TableHeaderCell>
                    <TableHeaderCell className="hidden text-right lg:table-cell">المشتريات</TableHeaderCell>
                    <TableHeaderCell className="hidden text-right xl:table-cell">المستحق</TableHeaderCell>
                    <TableHeaderCell className="text-center">الإجراءات</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                        <Users01 className="mx-auto mb-4 size-12 opacity-50" />
                        <p className="text-lg font-medium">لا يوجد عملاء</p>
                        <p className="text-sm">ابدأ بإضافة عميل جديد</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className={cn(isFetching && "opacity-50")}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                              {(customer.name || customer.phone)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {customer.name || "—"}
                              </p>
                              {customer.lastOrderAt && (
                                <p className="text-xs text-muted-foreground">
                                  آخر طلب: {formatDateTime(customer.lastOrderAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono" dir="ltr">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {customer.address || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-semibold text-foreground">
                            <Star01 className="size-4 text-warning" />
                            {customer.loyaltyPoints}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {customer.totalOrders} طلب
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {customer.totalDue > 0 ? (
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-danger">
                                {formatCurrency(customer.totalDue)}
                              </span>
                              {customer.creditLimit > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  من {formatCurrency(customer.creditLimit)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingCustomer(customer)}
                              className="size-8 text-muted-foreground hover:text-foreground"
                              aria-label="عرض التفاصيل"
                            >
                              <Eye className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(customer)}
                              className="size-8 text-muted-foreground hover:text-primary"
                              aria-label="تعديل"
                            >
                              <Edit01 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingCustomer(customer)}
                              className="size-8 text-muted-foreground hover:text-danger hover:bg-danger/10"
                              aria-label="حذف"
                            >
                              <Trash01 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  صفحة {page} من {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={!hasPreviousPage || isFetching}
                    rightIcon={<ChevronRight className="size-4" />}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!hasNextPage || isFetching}
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
                💡 نصائح إدارة العملاء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-foreground/80">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong>بيانات العميل:</strong> أضف كل بيانات العميل بشكل صحيح
                    للرجوع إليها لاحقاً
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong>نقاط الولاء:</strong> تراكم نقاط مع كل عملية شراء يمكن
                    استبدالها بخصومات
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-warning">•</span>
                  <span>
                    <strong>الديون:</strong> تتبع ما على كل عميل من مبالغ مستحقة الدفع
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>
                    <strong>البحث:</strong> ابحث عن العميل باسمه أو رقم هاتفه للسرعة
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {showFormModal && (
        <CustomerFormModal
          customer={editingCustomer}
          onClose={handleCloseFormModal}
        />
      )}

      {viewingCustomer && (
        <CustomerDetailsModal
          customer={viewingCustomer}
          onClose={() => setViewingCustomer(null)}
        />
      )}

      {deletingCustomer && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm animate-in zoom-in-95 rounded-2xl bg-card p-6 shadow-xl border border-border">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger/10">
                  <Trash01 className="size-8 text-danger" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-foreground">
                  حذف العميل
                </h3>
                <p className="text-muted-foreground">
                  هل أنت متأكد من حذف العميل "
                  {deletingCustomer.name || deletingCustomer.phone}"؟
                </p>
                <p className="mt-2 text-sm text-danger">
                  لا يمكن التراجع عن هذا الإجراء
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="glass"
                  onClick={() => setDeletingCustomer(null)}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="flex-1"
                  disabled={isDeleting}
                >
                  حذف
                </Button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default CustomersPage;
