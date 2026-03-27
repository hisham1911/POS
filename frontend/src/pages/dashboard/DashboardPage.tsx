import { ArrowRight, BarChart03, Package, Receipt, ShoppingCart01, Users01 } from "@untitledui/icons";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useGetCustomersQuery } from "@/api/customersApi";
import { useGetOrdersQuery } from "@/api/ordersApi";
import { useGetProductsQuery } from "@/api/productsApi";
import { useGetCurrentShiftQuery } from "@/api/shiftsApi";
import { MetricCard } from "@/components/app/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

const quickLinks = [
  { key: "pos", path: "/pos", icon: ShoppingCart01, tone: "bg-primary/12 text-primary" },
  { key: "orders", path: "/orders", icon: Receipt, tone: "bg-secondary/18 text-secondary-foreground" },
  { key: "products", path: "/products", icon: Package, tone: "bg-accent/12 text-accent" },
  { key: "reports", path: "/reports", icon: BarChart03, tone: "bg-success/14 text-success" }
] as const;

export default function DashboardPage() {
  const { t } = useTranslation();
  const { hasPermission } = usePermission();
  const { data: productsData, isLoading: isProductsLoading } = useGetProductsQuery();
  const { data: customersData, isLoading: isCustomersLoading } = useGetCustomersQuery({
    page: 1,
    pageSize: 6
  });
  const { data: ordersData, isLoading: isOrdersLoading } = useGetOrdersQuery({
    page: 1,
    pageSize: 5
  });
  const { data: shiftData, isLoading: isShiftLoading } = useGetCurrentShiftQuery();

  const recentOrders = ordersData?.data?.items ?? [];
  const totalCustomers = customersData?.data?.totalCount ?? 0;
  const totalProducts = productsData?.data?.length ?? 0;
  const activeShift = shiftData?.data;

  const visibleLinks = quickLinks.filter((item) => {
    if (item.key === "products") return hasPermission("ProductsView");
    if (item.key === "orders") return hasPermission("OrdersView");
    if (item.key === "reports") return hasPermission("ReportsView");
    return hasPermission("PosSell");
  });

  return (
    <div className="page-shell">
      <section className="page-hero">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge className="orbit-badge text-foreground" variant="outline">
              {t("dashboard.heroEyebrow")}
            </Badge>
            <h1 className="mt-4 text-balance text-foreground">
              {t("dashboard.heroTitle")}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              {t("dashboard.heroBody")}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/pos" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" rightIcon={<ArrowRight className="size-4" />}>
                  {t("dashboard.heroPrimary")}
                </Button>
              </Link>
              <Link to="/reports" className="w-full sm:w-auto">
                <Button size="lg" variant="glass" className="w-full sm:w-auto">
                  {t("dashboard.heroSecondary")}
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
            {isProductsLoading || isCustomersLoading || isOrdersLoading || isShiftLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-[calc(var(--radius)+0.15rem)]" />
              ))
            ) : (
              <>
                <MetricCard
                  title={t("dashboard.metrics.products")}
                  value={totalProducts}
                  description={t("nav.products")}
                  icon={Package}
                />
                <MetricCard
                  title={t("dashboard.metrics.customers")}
                  value={totalCustomers}
                  description={t("nav.customers")}
                  icon={Users01}
                  tone="secondary"
                />
                <MetricCard
                  title={t("dashboard.metrics.recentOrders")}
                  value={recentOrders.length}
                  description={t("nav.orders")}
                  icon={Receipt}
                  tone="success"
                />
                <MetricCard
                  title={t("dashboard.metrics.shiftState")}
                  value={activeShift && !activeShift.isClosed ? 1 : 0}
                  description={
                    activeShift && !activeShift.isClosed
                      ? t("dashboard.status.open")
                      : t("dashboard.status.closed")
                  }
                  icon={ShoppingCart01}
                  tone="warning"
                />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.quickLinks.title")}</CardTitle>
            <CardDescription>{t("dashboard.quickLinks.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path}>
                  <div className="frost-card frost-card-hover h-full rounded-[calc(var(--radius)+0.05rem)] p-4">
                    <div className={`inline-flex rounded-2xl p-3 ${link.tone}`}>
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold">
                      {t(`nav.${link.key}`)}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {link.key === "reports"
                        ? t("reports.subtitle")
                        : t("dashboard.quickLinks.subtitle")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.recentOrders.title")}</CardTitle>
              <CardDescription>{t("dashboard.subtitle")}</CardDescription>
            </div>
            <Link to="/orders">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="size-4" />}>
                {t("reports.open")}
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-2">
            {isOrdersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-3xl" />
                ))}
              </div>
            ) : recentOrders.length ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="surface-outline flex flex-col gap-3 rounded-[calc(var(--radius)+0.05rem)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{order.status}</Badge>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="surface-outline rounded-[calc(var(--radius)+0.05rem)] px-4 py-10 text-center text-sm text-muted-foreground">
                {t("dashboard.recentOrders.empty")}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
