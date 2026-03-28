import { useState } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle, ShieldTick } from "@untitledui/icons";

import {
  useGetAllCashierPermissionsQuery,
  useGetAvailablePermissionsQuery,
  useUpdateUserPermissionsMutation,
} from "../../../api/permissionsApi";
import { Loading } from "../../../components/common/Loading";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { PermissionInfo } from "../../../types/permission.types";
import { cn } from "@/lib/utils";

export default function PermissionsManagementCard() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: cashiers, isLoading: loadingCashiers } =
    useGetAllCashierPermissionsQuery();
  const { data: availablePermissions, isLoading: loadingPermissions } =
    useGetAvailablePermissionsQuery();
  const [updatePermissions, { isLoading: updating }] =
    useUpdateUserPermissionsMutation();

  const selectedCashier = cashiers?.data?.find((c) => c.userId === selectedUserId);

  const handleSelectCashier = (userId: number) => {
    setSelectedUserId(userId);
    const cashier = cashiers?.data?.find((c) => c.userId === userId);
    setSelectedPermissions(cashier?.permissions || []);
  };

  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey],
    );
  };

  const handleSave = async () => {
    if (!selectedUserId) return;

    try {
      await updatePermissions({
        userId: selectedUserId,
        data: { permissions: selectedPermissions },
      }).unwrap();
      toast.success("تم تحديث الصلاحيات بنجاح");
    } catch (error) {
      toast.error("فشل تحديث الصلاحيات");
    }
  };

  if (loadingCashiers || loadingPermissions) return <Loading />;

  const groupedPermissions = availablePermissions?.data?.reduce((acc, perm) => {
    if (!acc[perm.groupAr]) acc[perm.groupAr] = [];
    acc[perm.groupAr].push(perm);
    return acc;
  }, {} as Record<string, PermissionInfo[]>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cashier List */}
      <Card className="lg:col-span-1 overflow-hidden flex flex-col h-full">
        <div className="border-b border-border bg-muted/10 p-5">
          <h2 className="text-xl font-bold text-foreground">اختر مستخدم</h2>
        </div>
        <div className="flex-1 space-y-1 p-3 overflow-y-auto max-h-[600px] scrollbar-thin">
          {cashiers?.data?.map((cashier) => {
            const isSelected = selectedUserId === cashier.userId;
            return (
              <button
                key={cashier.userId}
                onClick={() => handleSelectCashier(cashier.userId)}
                className={cn(
                  "w-full text-right p-4 rounded-xl transition-all border outline-none focus:ring-2 focus:ring-primary/40",
                  isSelected
                    ? "bg-primary/10 border-primary shadow-sm"
                    : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border",
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={cn("font-bold text-base", isSelected ? "text-primary" : "text-foreground")}>
                      {cashier.userName}
                    </div>
                    <div className="text-xs font-semibold font-mono text-muted-foreground mt-0.5">
                      {cashier.email}
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="size-5 text-primary" />}
                </div>
              </button>
            )
          })}
          {(!cashiers?.data || cashiers.data.length === 0) && (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
              <ShieldTick className="size-10 mb-3 opacity-20" />
              <span className="font-semibold text-sm">لا يوجد كاشيرين حالياً</span>
            </div>
          )}
        </div>
      </Card>

      {/* Permissions Editor */}
      <Card className="lg:col-span-2 overflow-hidden flex flex-col h-full bg-background/50">
        {selectedCashier ? (
          <>
            <div className="border-b border-border bg-muted/10 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  صلاحيات: <span className="text-primary">{selectedCashier.userName}</span>
                </h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">تفعيل أو تعطيل الأذونات والصلاحيات لهذا الحساب</p>
              </div>
            </div>

            <div className="flex-1 space-y-8 p-6 overflow-y-auto max-h-[600px] scrollbar-thin">
              {Object.entries(groupedPermissions || {}).map(
                ([group, perms]) => (
                  <div key={group} className="space-y-4">
                    <h3 className="font-black text-lg text-foreground border-b border-border pb-2 inline-block">
                      {group}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => {
                        const isChecked = selectedPermissions.includes(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={cn(
                              "flex items-start gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all group",
                              isChecked
                                ? "bg-success/5 border-success shadow-sm"
                                : "bg-card border-border hover:border-primary/50 hover:bg-muted/30"
                            )}
                          >
                            <div className="flex items-center justify-center shrink-0 pt-0.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                                className="peer sr-only"
                              />
                              <div className={cn(
                                "size-5 rounded border-2 flex items-center justify-center transition-all",
                                isChecked
                                  ? "bg-success border-success text-success-foreground"
                                  : "border-muted-foreground bg-transparent"
                              )}>
                                {isChecked && <CheckCircle className="size-3.5" />}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className={cn("font-bold text-sm leading-tight", isChecked ? "text-foreground" : "text-foreground group-hover:text-primary")}>
                                {perm.descriptionAr}
                              </div>
                              <div className="text-xs font-semibold text-muted-foreground leading-snug break-words">
                                {perm.description}
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="border-t border-border bg-muted/5 p-5">
              <Button
                onClick={handleSave}
                disabled={updating}
                size="lg"
                className="w-full h-12 text-base font-bold shadow-sm"
              >
                {updating ? "جاري الحفظ..." : "حفظ الصلاحيات"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex size-20 items-center justify-center rounded-3xl bg-muted/50 mb-6">
              <ShieldTick className="size-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">تعديل الصلاحيات</h3>
            <p className="text-muted-foreground font-medium max-w-sm">
              قم باختيار مستخدم من القائمة الجانبية لعرض قائمة الصلاحيات الخاصة وتعديلها
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
