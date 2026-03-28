import { useState } from "react";
import {
  AlertTriangle,
  Building02,
  CurrencyDollar,
  Package,
  SwitchHorizontal01,
} from "@untitledui/icons";

import {
  BranchInventoryList,
  BranchPricingEditor,
  InventoryTransferForm,
  InventoryTransferList,
  LowStockAlerts,
} from "../../components/inventory";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppSelector } from "../../store/hooks";
import { selectIsAdmin } from "../../store/slices/authSlice";
import { selectCurrentBranch } from "../../store/slices/branchSlice";

type TabType = "inventory" | "alerts" | "transfers" | "pricing";

export default function InventoryPage() {
  const currentBranch = useAppSelector(selectCurrentBranch);
  const isAdmin = useAppSelector(selectIsAdmin);
  const [activeTab, setActiveTab] = useState<TabType>("inventory");
  const [showTransferForm, setShowTransferForm] = useState(false);

  const tabs = [
    {
      id: "inventory" as TabType,
      label: "مخزون الفرع",
      icon: Package,
      adminOnly: false,
    },
    {
      id: "alerts" as TabType,
      label: "تنبيهات المخزون",
      icon: AlertTriangle,
      adminOnly: false,
    },
    {
      id: "transfers" as TabType,
      label: "نقل المخزون",
      icon: SwitchHorizontal01,
      adminOnly: true,
    },
    {
      id: "pricing" as TabType,
      label: "أسعار الفروع",
      icon: CurrencyDollar,
      adminOnly: true,
    },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-balance text-3xl font-black text-foreground flex items-center gap-3">
              <Building02 className="size-8 text-primary" />
              إدارة المخزون
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
              إدارة مخزون الفروع، التنبيهات، والنقل بين الفروع
            </p>
            {currentBranch && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 border border-primary/20">
                <Building02 className="size-4 text-primary" />
                <span className="text-sm font-bold text-primary">
                  الفرع الحالي: {currentBranch.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/10">
          <nav className="flex -mb-px overflow-x-auto scrollbar-none">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowTransferForm(false);
                  }}
                  className={cn(
                    "flex shrink-0 items-center justify-center gap-2 mb-[-1px] border-b-2 px-6 py-4 text-sm font-bold transition-all",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground"
                  )}
                >
                  <Icon className="size-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "inventory" && <BranchInventoryList />}

          {activeTab === "alerts" && <LowStockAlerts />}

          {activeTab === "transfers" && (
            <div className="space-y-6">
              {showTransferForm ? (
                <InventoryTransferForm
                  onSuccess={() => setShowTransferForm(false)}
                  onCancel={() => setShowTransferForm(false)}
                />
              ) : (
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => setShowTransferForm(true)}
                    leftIcon={<SwitchHorizontal01 className="size-5" />}
                  >
                    طلب نقل جديد
                  </Button>
                </div>
              )}
              <InventoryTransferList />
            </div>
          )}

          {activeTab === "pricing" && <BranchPricingEditor />}
        </div>
      </Card>
    </div>
  );
}
