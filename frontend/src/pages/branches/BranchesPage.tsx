import { useState } from "react";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import {
  Building02,
  Edit01,
  Plus,
  Trash01,
} from "@untitledui/icons";

import {
  useDeleteBranchMutation,
  useGetBranchesQuery,
} from "@/api/branchesApi";
import { BranchFormModal } from "@/components/branches/BranchFormModal";
import { Loading } from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/app/metric-card";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import type { Branch } from "@/types/branch.types";
import { formatDateTime } from "@/utils/formatters";
import { cn } from "@/lib/utils";

export const BranchesPage = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | undefined>();

  const { data: branchesData, isLoading } = useGetBranchesQuery();
  const [deleteBranch, { isLoading: isDeleting }] = useDeleteBranchMutation();

  const branches = branchesData?.data || [];

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setShowFormModal(true);
  };

  const handleDelete = async (branch: Branch) => {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف الفرع "${branch.name}"؟\n\nملاحظة: لن يتم حذف البيانات المرتبطة بهذا الفرع.`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteBranch(branch.id).unwrap();
      if (result.success) {
        toast.success("تم حذف الفرع بنجاح");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "فشل في حذف الفرع");
    }
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setSelectedBranch(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  const activeBranches = branches.filter((b) => b.isActive).length;

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <Building02 className="size-8 text-primary" />
              إدارة الفروع
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة جميع فروع المؤسسة والتحكم في بيانات وإعدادات كل فرع
            </p>
          </div>

          <div className="flex items-end gap-2">
            <Button
              size="lg"
              onClick={() => setShowFormModal(true)}
              leftIcon={<Plus className="size-5" />}
            >
              إضافة فرع جديد
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MetricCard
          title="إجمالي الفروع"
          value={branches.length}
          description="جميع الفروع المسجلة"
          icon={Building02}
        />
        <MetricCard
          title="الفروع النشطة"
          value={activeBranches}
          description="جميع الفروع المفعلة التي تعمل حالياً"
          icon={Building02}
          tone="success"
        />
      </div>

      <div className="space-y-6">
        {branches.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex size-20 items-center justify-center rounded-2xl bg-muted/50">
              <Building02 className="size-10 text-muted-foreground/50" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">
              لا توجد فروع مسجلة
            </h3>
            <p className="mb-8 max-w-sm text-sm text-muted-foreground">
              يبدو أنه لم يتم إضافة أي فرع بعد. قم بإضافة الفرع الأول لمؤسستك
              للبدء في العمل.
            </p>
            <Button size="lg" onClick={() => setShowFormModal(true)} leftIcon={<Plus className="size-5" />}>
              إضافة فرع جديد
            </Button>
          </Card>
        ) : (
          <Card className="flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-right">اسم الفرع</TableHeaderCell>
                    <TableHeaderCell className="text-right">الكود</TableHeaderCell>
                    <TableHeaderCell className="text-right">العنوان</TableHeaderCell>
                    <TableHeaderCell className="text-right">الهاتف</TableHeaderCell>
                    <TableHeaderCell className="text-right">الحالة</TableHeaderCell>
                    <TableHeaderCell className="text-right">تاريخ الإنشاء</TableHeaderCell>
                    <TableHeaderCell className="text-center w-28">الإجراءات</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Building02 className="size-5" />
                          </div>
                          <span className="font-semibold text-foreground">
                            {branch.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-lg bg-muted px-2.5 py-1 font-mono text-sm font-bold text-muted-foreground">
                          {branch.code}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium text-sm">
                        {branch.address || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground text-sm">
                        <span dir="ltr">{branch.phone || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold leading-none",
                            branch.isActive
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          )}
                        >
                          {branch.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                        {formatDateTime(branch.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(branch)}
                            className="size-8 text-muted-foreground hover:text-primary"
                            title="تعديل"
                          >
                            <Edit01 className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(branch)}
                            disabled={isDeleting}
                            className="size-8 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                            title="حذف"
                          >
                            <Trash01 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {showFormModal && (
          <BranchFormModal branch={selectedBranch} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );
};
