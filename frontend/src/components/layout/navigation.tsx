import {
  AlarmClock,
  BarChart03,
  Box,
  Building05,
  CoinsStacked03,
  CreditCard02,
  FolderClosed,
  HomeSmile,
  Package,
  Receipt,
  Settings01,
  Shield01,
  ShoppingCart01,
  Truck01,
  Users01
} from "@untitledui/icons";
import type { ComponentType, SVGProps } from "react";

export type NavIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number; color?: string }>;

export interface NavItemConfig {
  key: string;
  path: string;
  icon: NavIcon;
  permission?: string;
  adminOnly?: boolean;
  systemOwnerOnly?: boolean;
}

export const navSections: Array<{
  key: string;
  items: NavItemConfig[];
}> = [
  {
    key: "workspace",
    items: [
      { key: "dashboard", path: "/dashboard", icon: HomeSmile },
      { key: "pos", path: "/pos", icon: ShoppingCart01, permission: "PosSell" },
      { key: "orders", path: "/orders", icon: Receipt, permission: "OrdersView" },
      { key: "shift", path: "/shift", icon: AlarmClock },
      { key: "customers", path: "/customers", icon: Users01, permission: "CustomersView" },
      { key: "products", path: "/products", icon: Package, permission: "ProductsView" },
      { key: "inventory", path: "/inventory", icon: Box, permission: "InventoryView" },
      { key: "reports", path: "/reports", icon: BarChart03, permission: "ReportsView" }
    ]
  },
  {
    key: "manage",
    items: [
      { key: "categories", path: "/categories", icon: FolderClosed, permission: "CategoriesView" },
      { key: "suppliers", path: "/suppliers", icon: Truck01, adminOnly: true },
      { key: "purchaseInvoices", path: "/purchase-invoices", icon: CreditCard02, adminOnly: true },
      { key: "expenses", path: "/expenses", icon: Receipt, permission: "ExpensesView" },
      { key: "cashRegister", path: "/cash-register", icon: CoinsStacked03, permission: "CashRegisterView" },
      { key: "branches", path: "/branches", icon: Building05, adminOnly: true },
      { key: "users", path: "/users", icon: Shield01, adminOnly: true },
      { key: "backup", path: "/backup", icon: CreditCard02, adminOnly: true },
      { key: "audit", path: "/audit", icon: Shield01, adminOnly: true },
      { key: "settings", path: "/settings", icon: Settings01, adminOnly: true }
    ]
  },
  {
    key: "owner",
    items: [
      { key: "ownerTenants", path: "/owner/tenants", icon: Building05, systemOwnerOnly: true },
      { key: "ownerUsers", path: "/owner/users", icon: Users01, systemOwnerOnly: true }
    ]
  }
];

export const routeMeta: Record<
  string,
  {
    navKey: string;
    descriptionKey: string;
  }
> = {
  "/dashboard": {
    navKey: "dashboard",
    descriptionKey: "dashboard.subtitle"
  },
  "/pos": {
    navKey: "pos",
    descriptionKey: "dashboard.heroBody"
  },
  "/orders": {
    navKey: "orders",
    descriptionKey: "layout.searchModules"
  },
  "/shift": {
    navKey: "shift",
    descriptionKey: "dashboard.heroBody"
  },
  "/customers": {
    navKey: "customers",
    descriptionKey: "dashboard.quickLinks.subtitle"
  },
  "/products": {
    navKey: "products",
    descriptionKey: "dashboard.quickLinks.subtitle"
  },
  "/inventory": {
    navKey: "inventory",
    descriptionKey: "dashboard.quickLinks.subtitle"
  },
  "/reports": {
    navKey: "reports",
    descriptionKey: "reports.subtitle"
  },
  "/settings": {
    navKey: "settings",
    descriptionKey: "settings.subtitle"
  }
};

export const getVisibleNavSections = ({
  isAdmin,
  isSystemOwner,
  hasPermission
}: {
  isAdmin: boolean;
  isSystemOwner: boolean;
  hasPermission: (permission: string) => boolean;
}) =>
  navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (isSystemOwner) return Boolean(item.systemOwnerOnly);
        if (item.systemOwnerOnly) return false;
        if (item.adminOnly) return isAdmin;
        if (item.permission) return hasPermission(item.permission);
        return true;
      })
    }))
    .filter((section) => section.items.length > 0);

export const getRouteMeta = (pathname: string) => {
  const match = Object.keys(routeMeta)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname.startsWith(route));

  return match ? routeMeta[match] : routeMeta["/dashboard"];
};
