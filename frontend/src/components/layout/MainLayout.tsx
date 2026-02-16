import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LogOut,
  User,
  Clock,
  Menu,
  ShoppingCart,
  Package,
  FolderOpen,
  ClipboardList,
  Timer,
  BarChart3,
  X,
  FileText,
  Settings,
  Users,
  Truck,
  Building2,
  Receipt,
  Wallet,
  Boxes,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { BranchSelector } from "./BranchSelector";

const navItems = [
  { path: "/pos", label: "نقطة البيع", icon: ShoppingCart },
  { path: "/orders", label: "الطلبات", icon: ClipboardList },
  { path: "/shift", label: "الوردية", icon: Timer },
  {
    path: "/shifts-management",
    label: "إدارة الورديات",
    icon: Clock,
    adminOnly: true,
  },
  { path: "/customers", label: "العملاء", icon: Users, adminOnly: true },
  { path: "/products", label: "المنتجات", icon: Package, adminOnly: true },
  {
    path: "/categories",
    label: "التصنيفات",
    icon: FolderOpen,
    adminOnly: true,
  },
  { path: "/suppliers", label: "الموردين", icon: Truck, adminOnly: true },
  {
    path: "/purchase-invoices",
    label: "فواتير الشراء",
    icon: FileText,
    adminOnly: true,
  },
  { path: "/inventory", label: "المخزون", icon: Boxes, adminOnly: true },
  { path: "/expenses", label: "المصروفات", icon: Receipt, adminOnly: true },
  { path: "/cash-register", label: "الخزينة", icon: Wallet, adminOnly: true },
  { path: "/branches", label: "الفروع", icon: Building2, adminOnly: true },
  { path: "/reports", label: "التقارير", icon: BarChart3, adminOnly: true },
  { path: "/audit", label: "سجل التدقيق", icon: FileText, adminOnly: true },
  { path: "/settings", label: "الإعدادات", icon: Settings, adminOnly: true },
  {
    path: "/owner/tenants",
    label: "إدارة الشركات",
    icon: Building2,
    systemOwnerOnly: true,
  },
];

export const MainLayout = () => {
  const { user, logout, isAdmin, isSystemOwner } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentTime = new Date().toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const filteredNavItems = navItems.filter((item) => {
    if (isSystemOwner) return !!item.systemOwnerOnly;
    if (item.systemOwnerOnly) return isSystemOwner;
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <div className="h-screen flex w-full overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-gray-900 text-white flex-col shrink-0 border-l border-gray-800 overflow-y-auto">
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-xl">🏪</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">KasserPro</h1>
              <p className="text-xs text-gray-400">نظام نقاط البيع</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-600 text-white"
                    : "text-gray-300 hover:bg-gray-800",
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-xs text-gray-400">
                {user?.role === "SystemOwner"
                  ? "مالك النظام"
                  : user?.role === "Admin"
                    ? "مدير"
                    : "كاشير"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-gray-900 text-white flex flex-col animate-slide-in-right overflow-y-auto">
            {/* Close Button */}
            <div className="p-4 flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏪</span>
                </div>
                <span className="font-bold">KasserPro</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary-600 text-white"
                        : "text-gray-300 hover:bg-gray-800",
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-sm">🏪</span>
              </div>
              <span className="font-bold text-primary-600">KasserPro</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <BranchSelector />

            <div className="hidden sm:flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{currentTime}</span>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium hidden sm:inline">
                {user?.name}
              </span>
              {user?.role === "Admin" && (
                <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full hidden sm:inline">
                  مدير
                </span>
              )}
              {user?.role === "SystemOwner" && (
                <span className="text-xs bg-primary-600 text-white px-2 py-0.5 rounded-full hidden sm:inline">
                  مالك النظام
                </span>
              )}
            </div>

            <button
              onClick={logout}
              className="hidden lg:flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
