import { useState, useMemo } from "react";
import {
  Building02,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Clock,
  CreditCard01,
  Edit01,
  File04,
  FilterLines as Filter,
  Folder,
  Package,
  Plus,
  RefreshCcw01 as RefreshCw,
  ShoppingCart01 as ShoppingCart,
  Trash01 as Trash2,
  User01 as User,
  XCircle,
} from "@untitledui/icons";

import { useGetAuditLogsQuery } from "@/api/auditApi";
import { formatDateTime } from "@/utils/formatters";
import type { AuditLog, AuditLogFilters } from "@/types/audit.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Entity type icons and labels
const entityConfig: Record<string, { icon: typeof ShoppingCart; label: string; tone: "primary" | "success" | "danger" | "warning" | "secondary" }> = {
  Order: { icon: ShoppingCart, label: "طلب", tone: "primary" },
  Product: { icon: Package, label: "منتج", tone: "success" },
  Category: { icon: Folder, label: "تصنيف", tone: "secondary" },
  User: { icon: User, label: "مستخدم", tone: "warning" },
  Branch: { icon: Building02, label: "فرع", tone: "primary" },
  Shift: { icon: Clock, label: "وردية", tone: "warning" },
  Payment: { icon: CreditCard01, label: "دفع", tone: "danger" },
};

// Action icons and colors
const actionConfig: Record<string, { icon: typeof Plus; tone: "success" | "primary" | "danger" }> = {
  Create: { icon: Plus, tone: "success" },
  Update: { icon: Edit01, tone: "primary" },
  Delete: { icon: Trash2, tone: "danger" },
};

/**
 * Parse JSON values safely
 */
const parseJson = (json?: string): Record<string, unknown> | null => {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
};

/**
 * Get human-readable action description in Arabic
 * Uses "Order" terminology (طلب) not "Sale" (بيع)
 */
const getActionDescription = (log: AuditLog): string => {
  const { entityType, action, newValues, oldValues } = log;
  const newData = parseJson(newValues);
  const oldData = parseJson(oldValues);

  if (entityType === "Order") {
    if (action === "Create") return "إنشاء طلب جديد";
    if (action === "Update") {
      const newStatus = newData?.Status as string | number;
      const oldStatus = oldData?.Status as string | number;
      if (newStatus === "Completed" || newStatus === 2 || newStatus === "2") {
        return "تم إتمام الدفع وإغلاق الطلب";
      }
      if (newStatus === "Cancelled" || newStatus === 3 || newStatus === "3") {
        return "إلغاء الطلب";
      }
      if (newStatus !== oldStatus) return "تغيير حالة الطلب";
      return "تعديل بيانات الطلب";
    }
    if (action === "Delete") return "حذف طلب";
  }

  if (entityType === "Payment") {
    if (action === "Create") {
      const method = newData?.Method as string | number;
      if (method === "Cash" || method === 0 || method === "0") {
        return "تسجيل دفعة نقدية";
      }
      if (method === "Card" || method === 1 || method === "1") {
        return "تسجيل دفعة بالبطاقة";
      }
      if (method === "Fawry" || method === 2 || method === "2") {
        return "تسجيل دفعة فوري";
      }
      return "تسجيل دفعة";
    }
    if (action === "Update") return "تعديل دفعة";
    if (action === "Delete") return "حذف دفعة";
  }

  if (entityType === "Shift") {
    if (action === "Create") return "فتح وردية";
    if (action === "Update") {
      const isClosed = newData?.IsClosed;
      if (isClosed === true || isClosed === "True" || isClosed === "true") return "إغلاق الوردية";
      return "تعديل الوردية";
    }
    if (action === "Delete") return "حذف وردية";
  }

  if (entityType === "Product") {
    if (action === "Create") return "إضافة منتج";
    if (action === "Update") {
      if (newData?.Price !== oldData?.Price) return "تعديل سعر منتج";
      if (newData?.Stock !== oldData?.Stock) return "تعديل مخزون منتج";
      return "تعديل منتج";
    }
    if (action === "Delete") return "حذف منتج";
  }

  if (entityType === "Category") {
    if (action === "Create") return "إضافة تصنيف";
    if (action === "Update") return "تعديل تصنيف";
    if (action === "Delete") return "حذف تصنيف";
  }

  if (entityType === "User") {
    if (action === "Create") return "إضافة مستخدم";
    if (action === "Update") return "تعديل مستخدم";
    if (action === "Delete") return "حذف مستخدم";
  }

  if (entityType === "Branch") {
    if (action === "Create") return "إضافة فرع";
    if (action === "Update") return "تعديل فرع";
    if (action === "Delete") return "حذف فرع";
  }

  const actionMap: Record<string, string> = {
    Create: "إنشاء",
    Update: "تعديل",
    Delete: "حذف",
  };
  return `${actionMap[action] || action} ${entityConfig[entityType]?.label || entityType}`;
};

/**
 * Get status badge for order status changes
 */
const getStatusBadge = (log: AuditLog): { text: string; icon: typeof CheckCircle; tone: "success" | "danger" | "secondary" } | null => {
  if (log.entityType !== "Order" || log.action !== "Update") return null;
  
  const newData = parseJson(log.newValues);
  const newStatus = newData?.Status as string | number;
  
  if (newStatus === "Completed" || newStatus === 2 || newStatus === "2") {
    return { text: "تم الدفع", icon: CheckCircle, tone: "success" };
  }
  if (newStatus === "Cancelled" || newStatus === 3 || newStatus === "3") {
    return { text: "ملغي", icon: XCircle, tone: "danger" };
  }
  if (newStatus === "Draft" || newStatus === 0 || newStatus === "0") {
    return { text: "مسودة", icon: File04, tone: "secondary" };
  }
  return null;
};

/**
 * Get details from the log (order number, product name, etc.)
 */
const getDetails = (log: AuditLog): string | null => {
  const newData = parseJson(log.newValues);
  const oldData = parseJson(log.oldValues);
  const data = newData || oldData;

  if (!data) return null;

  if (log.entityType === "Order") {
    return (data.OrderNumber as string) || null;
  }
  if (log.entityType === "Product" || log.entityType === "Category") {
    return (data.Name as string) || (data.NameEn as string) || null;
  }
  if (log.entityType === "User") {
    return (data.Name as string) || (data.Email as string) || null;
  }
  if (log.entityType === "Branch") {
    return (data.Name as string) || null;
  }
  if (log.entityType === "Shift" && data.OpeningBalance) {
    return `رصيد: ${data.OpeningBalance} ج.م`;
  }

  return null;
};

export default function AuditLogPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    pageSize: 20,
  });

  const { data, isLoading, isFetching, refetch } = useGetAuditLogsQuery(filters);
  const logs = data?.data?.items || [];
  const pagination = data?.data;

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const hasActiveFilters = useMemo(() => {
    return !!(filters.entityType || filters.action || filters.fromDate || filters.toDate);
  }, [filters]);

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <Clipboard className="size-8 text-primary" />
              سجل النظام الشامل
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              تتبع وتدقيق جميع العمليات والإجراءات التي تمت على مستوى فروع ومكونات النظام المختلفة.
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => refetch()}
              leftIcon={<RefreshCw className={cn("size-4", isFetching && "animate-spin")} />}
            >
              تحديث السجل
            </Button>
          </div>
        </div>
      </section>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="size-5 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">تصفية السجلات</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-danger hover:text-danger/80 hover:underline"
            >
              مسح الفلاتر
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">نوع العملية (المكون)</label>
            <div className="relative">
              <select
                value={filters.entityType || ""}
                onChange={(e) => handleFilterChange("entityType", e.target.value)}
                className="w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium cursor-pointer"
              >
                <option value="">جميع المكونات</option>
                {Object.entries(entityConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <ChevronDown className="size-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">نوع الإجراء</label>
            <div className="relative">
              <select
                value={filters.action || ""}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="w-full appearance-none rounded-xl border border-input bg-background/50 px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium cursor-pointer"
              >
                <option value="">جميع الإجراءات</option>
                <option value="Create">عمليات إنشاء</option>
                <option value="Update">عمليات تعديل</option>
                <option value="Delete">عمليات حذف</option>
              </select>
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <ChevronDown className="size-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">من تاريخ</label>
            <input
              type="date"
              value={filters.fromDate || ""}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={filters.toDate || ""}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className="w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
          </div>
        </div>
      </Card>

      <Card className="flex flex-col overflow-hidden flex-1">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell className="text-right w-1/3">العملية الأساسية</TableHeaderCell>
                <TableHeaderCell className="text-right">التفاصيل / المكون</TableHeaderCell>
                <TableHeaderCell className="text-right">المستخدم المسؤول</TableHeaderCell>
                <TableHeaderCell className="text-right">تاريخ ووقت التنفيذ</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading || isFetching ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-5 bg-muted rounded-full w-40 animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 bg-muted rounded-full w-32 animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 bg-muted rounded-full w-24 animate-pulse" /></TableCell>
                    <TableCell><div className="h-5 bg-muted rounded-full w-28 animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-16 text-center text-muted-foreground">
                    <Clipboard className="mx-auto mb-4 size-10 opacity-30" />
                    <span className="font-semibold text-base">لا توجد سجلات مطابقة لخياراتك</span>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const entity = entityConfig[log.entityType];
                  const EntityIcon = entity?.icon || Clipboard;
                  const eTone = entity?.tone || "secondary";
                  
                  const actionCfg = actionConfig[log.action] || actionConfig.Update;
                  const ActionIcon = actionCfg.icon;
                  const aTone = actionCfg.tone;
                  
                  const details = getDetails(log);
                  const statusBadge = getStatusBadge(log);

                  return (
                    <TableRow key={log.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "inline-flex items-center justify-center size-9 rounded-xl shrink-0 transition-colors",
                            `bg-${aTone}/10 text-${aTone} group-hover:bg-${aTone}/20`
                          )}>
                            <ActionIcon className="size-4.5" />
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-foreground">
                              {getActionDescription(log)}
                            </span>
                            {statusBadge && (
                              <span className={cn(
                                "inline-flex w-fit items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full text-[11px] font-bold leading-none",
                                `bg-${statusBadge.tone}/10 text-${statusBadge.tone}`
                              )}>
                                <statusBadge.icon className="size-3" />
                                {statusBadge.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "inline-flex shrink-0 items-center justify-center size-6 rounded bg-background border border-border",
                            `text-${eTone}`
                          )}>
                            <EntityIcon className="size-3.5" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {entity?.label || log.entityType}
                              {log.entityId && (
                                <span className="text-muted-foreground mr-1 text-xs">#{log.entityId}</span>
                              )}
                            </span>
                            {details && (
                              <span className="text-[11px] font-medium text-muted-foreground truncate" title={details}>{details}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm font-semibold text-foreground">
                          {log.userName || "—"}
                        </span>
                      </TableCell>

                      <TableCell className="font-mono text-xs font-semibold text-muted-foreground whitespace-nowrap" dir="ltr">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Details */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-border bg-muted/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              تصفح السجلات من <span className="font-bold text-foreground">{((pagination.page - 1) * pagination.pageSize) + 1}</span> إلى <span className="font-bold text-foreground">{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}</span>
              {" "}من أصل{" "}<span className="font-bold text-foreground">{pagination.totalCount}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPreviousPage}
                leftIcon={<ChevronRight className="size-4" />}
              >
                السابق
              </Button>
              <div className="flex px-2 text-sm font-medium text-muted-foreground font-mono">
                {pagination.page} / {pagination.totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                rightIcon={<ChevronLeft className="size-4" />}
                className="pl-3"
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
