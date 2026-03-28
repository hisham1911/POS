import { useState } from "react";
import { AlertCircle, Clock, Users01 } from "@untitledui/icons";

import {
  ActiveShiftsList,
  ForceCloseShiftModal,
} from "@/components/shifts";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import type { Shift } from "@/types/shift.types";
import { cn } from "@/lib/utils";

export const ShiftsManagementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showForceCloseModal, setShowForceCloseModal] = useState(false);

  const handleForceClose = (shift: Shift) => {
    setSelectedShift(shift);
    setShowForceCloseModal(true);
  };

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-md p-8 text-center bg-background/50 border-danger/20">
          <CardContent className="pt-6">
            <AlertCircle className="mx-auto mb-4 size-16 text-danger" />
            <h2 className="mb-2 text-xl font-bold text-foreground">
              غير مصرح لك
            </h2>
            <p className="text-muted-foreground">
              هذه الصفحة متاحة للمديرين فقط
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground">
              إدارة الورديات
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              متابعة ومراقبة جميع الورديات المفتوحة في الفرع
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2">
            <Users01 className="size-5 text-primary" />
            <span className="text-sm font-semibold text-primary">
              عرض المدير
            </span>
          </div>
        </div>
      </section>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 py-6">
          <Clock className="mt-0.5 size-6 text-primary" />
          <div className="flex-1">
            <h3 className="font-semibold text-primary">معلومات مهمة</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-foreground/80">
              <li>يمكنك رؤية جميع الورديات المفتوحة في الفرع الحالي</li>
              <li>يمكنك إغلاق أي وردية بالقوة في حالات الطوارئ</li>
              <li>سيتم تسجيل جميع عمليات الإغلاق بالقوة في سجل التدقيق</li>
              <li>الورديات التي لم يتم تسجيل نشاط عليها لأكثر من 12 ساعة ستظهر بتحذير</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <ActiveShiftsList
          onForceClose={handleForceClose}
          currentUserId={user?.id}
          isAdmin={isAdmin}
        />
      </div>

      {selectedShift && (
        <ForceCloseShiftModal
          shift={selectedShift}
          isOpen={showForceCloseModal}
          onClose={() => {
            setShowForceCloseModal(false);
            setSelectedShift(null);
          }}
          onSuccess={() => {
            setShowForceCloseModal(false);
            setSelectedShift(null);
          }}
        />
      )}
    </div>
  );
};

export default ShiftsManagementPage;
