import { useState } from "react";
import { ShieldTick, Users01 } from "@untitledui/icons";

import PermissionsManagementCard from "./components/PermissionsManagementCard";
import UserManagementCard from "./components/UserManagementCard";

export default function UserManagementPage() {
  const [activeCard, setActiveCard] = useState<"users" | "permissions">("users");

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <Users01 className="size-8 text-primary" />
              إدارة المستخدمين
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة حسابات المستخدمين وصلاحياتهم داخل الفرع الحالي
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <button
          onClick={() => setActiveCard("users")}
          className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-right transition-all outline-none focus:ring-2 focus:ring-primary/50 ${
            activeCard === "users"
              ? "border-primary bg-primary/5 shadow-md"
              : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-xl transition-colors ${
                activeCard === "users"
                  ? "bg-primary/20 text-primary"
                  : "bg-background text-muted-foreground group-hover:text-foreground"
              }`}
            >
              <Users01 className="size-7" />
            </div>
            <div className="flex flex-col pt-1">
              <h3
                className={`mb-1 text-lg font-bold transition-colors ${
                  activeCard === "users" ? "text-primary" : "text-foreground"
                }`}
              >
                إدارة المستخدمين
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                إضافة وتعديل وحذف حسابات المستخدمين في هذا الفرع
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveCard("permissions")}
          className={`group relative overflow-hidden rounded-2xl border-2 p-6 text-right transition-all outline-none focus:ring-2 focus:ring-success/50 ${
            activeCard === "permissions"
              ? "border-success bg-success/5 shadow-md"
              : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-xl transition-colors ${
                activeCard === "permissions"
                  ? "bg-success/20 text-success"
                  : "bg-background text-muted-foreground group-hover:text-foreground"
              }`}
            >
              <ShieldTick className="size-7" />
            </div>
            <div className="flex flex-col pt-1">
              <h3
                className={`mb-1 text-lg font-bold transition-colors ${
                  activeCard === "permissions" ? "text-success" : "text-foreground"
                }`}
              >
                إدارة الصلاحيات
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                تحديد الأدوار وصلاحيات الوصول لكل فئة من المستخدمين
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-2">
        {activeCard === "users" && <UserManagementCard />}
        {activeCard === "permissions" && <PermissionsManagementCard />}
      </div>
    </div>
  );
}
