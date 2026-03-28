import { useState } from "react";
import { toast } from "sonner";
import {
  Building02,
  Edit01,
  Plus,
  SearchLg,
  Trash01,
} from "@untitledui/icons";

import {
  useDeleteSupplierMutation,
  useGetSuppliersQuery,
} from "../../api/suppliersApi";
import { MetricCard } from "../../components/app/metric-card";
import { Loading } from "../../components/common/Loading";
import SupplierFormModal from "../../components/suppliers/SupplierFormModal";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/ui/table";
import { cn } from "../../lib/utils";
import { Supplier } from "../../types/supplier.types";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data: response, isLoading } = useGetSuppliersQuery();
  const [deleteSupplier] = useDeleteSupplierMutation();

  const suppliers = response?.data || [];

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المورد "${name}"؟`)) {
      return;
    }

    try {
      const result = await deleteSupplier(id).unwrap();
      if (result.success) {
        toast.success(result.message || "تم حذف المورد بنجاح");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "فشل حذف المورد");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  const activeSuppliers = filteredSuppliers.filter((s) => s.isActive).length;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              الموردين
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة الموردين والشركات الموردة
            </p>
          </div>

          <div className="flex items-end gap-2">
            <Button
              size="lg"
              onClick={handleAddSupplier}
              leftIcon={<Plus className="size-5" />}
            >
              إضافة مورد
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="إجمالي الموردين"
          value={filteredSuppliers.length}
          description="جميع الموردين المسجلين"
          icon={Building02}
        />
        <MetricCard
          title="الموردين النشطين"
          value={activeSuppliers}
          description="موردين متعامل معهم حالياً"
          icon={Building02}
          tone="success"
        />
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-xl">
              <SearchLg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن مورد (الاسم، الهاتف، البريد الإلكتروني...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-right">الاسم</TableHeaderCell>
                  <TableHeaderCell className="text-right">الهاتف</TableHeaderCell>
                  <TableHeaderCell className="text-right">البريد الإلكتروني</TableHeaderCell>
                  <TableHeaderCell className="text-right">جهة الاتصال</TableHeaderCell>
                  <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                  <TableHeaderCell className="text-center w-24">الإجراءات</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      <Building02 className="mx-auto mb-4 size-12 opacity-50" />
                      <p className="text-lg font-medium">
                        {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد موردين"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Building02 className="size-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block">
                              {supplier.name}
                            </span>
                            {supplier.nameEn && (
                              <span className="text-xs font-mono text-muted-foreground mt-0.5 block">
                                {supplier.nameEn}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono font-medium">
                        <span dir="ltr">{supplier.phone || "-"}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">
                        {supplier.email || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">
                        {supplier.contactPerson || "-"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
                            supplier.isActive
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          )}
                        >
                          {supplier.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSupplier(supplier)}
                            className="size-8 text-muted-foreground hover:text-primary"
                            title="تعديل"
                          >
                            <Edit01 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDeleteSupplier(supplier.id, supplier.name)
                            }
                            className="size-8 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                            title="حذف"
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
        </Card>

        {isModalOpen && (
          <SupplierFormModal
            supplier={selectedSupplier}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedSupplier(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
