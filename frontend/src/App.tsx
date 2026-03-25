import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState, type ComponentType, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsSystemOwner,
  selectToken,
  logout as logoutAction,
} from "./store/slices/authSlice";
import { clearBranch } from "./store/slices/branchSlice";
import { useGetCurrentShiftQuery } from "./api/shiftsApi";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { shiftPersistence } from "./utils/shiftPersistence";
import { usePermission } from "./hooks/usePermission";

const lazyNamed = <TModule extends Record<string, unknown>>(
  factory: () => Promise<TModule>,
  key: keyof TModule
) =>
  lazy(async () => {
    const module = await factory();
    return { default: module[key] as ComponentType<any> };
  });

const MainLayout = lazyNamed(() => import("./components/layout/MainLayout"), "MainLayout");
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const POSPage = lazy(() => import("./pages/pos/POSPage"));
const POSWorkspacePage = lazy(() => import("./pages/pos/POSWorkspacePage"));
const ProductsPage = lazy(() => import("./pages/products/ProductsPage"));
const CategoriesPage = lazy(() => import("./pages/categories/CategoriesPage"));
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const ShiftPage = lazy(() => import("./pages/shifts/ShiftPage"));
const ShiftsManagementPage = lazy(() => import("./pages/shifts/ShiftsManagementPage"));
const CustomersPage = lazy(() => import("./pages/customers/CustomersPage"));
const SuppliersPage = lazy(() => import("./pages/suppliers/SuppliersPage"));
const BranchesPage = lazyNamed(() => import("./pages/branches/BranchesPage"), "BranchesPage");
const DailyReportPage = lazy(() => import("./pages/reports/DailyReportPage"));
const SalesReportPage = lazy(() => import("./pages/reports/SalesReportPage"));
const InventoryReportsPage = lazy(() => import("./pages/reports/InventoryReportsPage"));
const ProfitLossReportPage = lazy(() => import("./pages/reports/ProfitLossReportPage"));
const ExpensesReportPage = lazy(() => import("./pages/reports/ExpensesReportPage"));
const TransferHistoryReportPage = lazy(() => import("./pages/reports/TransferHistoryReportPage"));
const TopCustomersReportPage = lazy(() => import("./pages/reports/TopCustomersReportPage"));
const CustomerDebtsReportPage = lazy(() => import("./pages/reports/CustomerDebtsReportPage"));
const CustomerActivityReportPage = lazy(() => import("./pages/reports/CustomerActivityReportPage"));
const ReportsDashboardPage = lazy(() => import("./pages/reports/ReportsDashboardPage"));
const CashierPerformanceReportPage = lazy(() => import("./pages/reports/CashierPerformanceReportPage"));
const ShiftDetailsReportPage = lazy(() => import("./pages/reports/ShiftDetailsReportPage"));
const SalesByEmployeeReportPage = lazy(() => import("./pages/reports/SalesByEmployeeReportPage"));
const ProductMovementReportPage = lazy(() => import("./pages/reports/ProductMovementReportPage"));
const ProfitableProductsReportPage = lazy(() => import("./pages/reports/ProfitableProductsReportPage"));
const SlowMovingProductsReportPage = lazy(() => import("./pages/reports/SlowMovingProductsReportPage"));
const CogsReportPage = lazy(() => import("./pages/reports/CogsReportPage"));
const SupplierPurchasesReportPage = lazy(() => import("./pages/reports/SupplierPurchasesReportPage"));
const SupplierDebtsReportPage = lazy(() => import("./pages/reports/SupplierDebtsReportPage"));
const SupplierPerformanceReportPage = lazy(() => import("./pages/reports/SupplierPerformanceReportPage"));
const AuditLogPage = lazy(() => import("./pages/audit/AuditLogPage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const PermissionsPage = lazy(() => import("./pages/settings/PermissionsPage"));
const UserManagementPage = lazy(() => import("./pages/users/UserManagementPage"));
const PurchaseInvoicesPage = lazyNamed(() => import("./pages/purchase-invoices/PurchaseInvoicesPage"), "PurchaseInvoicesPage");
const PurchaseInvoiceFormPage = lazyNamed(() => import("./pages/purchase-invoices/PurchaseInvoiceFormPage"), "PurchaseInvoiceFormPage");
const PurchaseInvoiceDetailsPage = lazyNamed(() => import("./pages/purchase-invoices/PurchaseInvoiceDetailsPage"), "PurchaseInvoiceDetailsPage");
const ExpensesPage = lazyNamed(() => import("./pages/expenses/ExpensesPage"), "ExpensesPage");
const ExpenseFormPage = lazyNamed(() => import("./pages/expenses/ExpenseFormPage"), "ExpenseFormPage");
const ExpenseDetailsPage = lazyNamed(() => import("./pages/expenses/ExpenseDetailsPage"), "ExpenseDetailsPage");
const CashRegisterDashboard = lazyNamed(() => import("./pages/cash-register/CashRegisterDashboard"), "CashRegisterDashboard");
const CashRegisterTransactionsPage = lazyNamed(() => import("./pages/cash-register/CashRegisterTransactionsPage"), "CashRegisterTransactionsPage");
const InventoryPage = lazy(() => import("./pages/inventory/InventoryPage"));
const TenantCreationPage = lazy(() => import("./pages/owner/TenantCreationPage"));
const SystemUsersPage = lazy(() => import("./pages/system/SystemUsersPage"));
const BackupPage = lazyNamed(() => import("./pages/backup/BackupPage"), "BackupPage");
const NotFound = lazy(() => import("./pages/NotFound"));

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const isAdmin = useAppSelector(selectIsAdmin);
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PermissionRoute = ({
  children,
  permission,
}: {
  children: ReactNode;
  permission: string;
}) => {
  const { hasPermission } = usePermission();
  if (!hasPermission(permission)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const SystemOwnerRoute = ({ children }: { children: ReactNode }) => {
  const isSystemOwner = useAppSelector(selectIsSystemOwner);
  if (!isSystemOwner) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "SystemOwner" ? "/owner/tenants" : "/dashboard"}
        replace
      />
    );
  }
  return <>{children}</>;
};

const NonSystemOwnerRoute = ({ children }: { children: ReactNode }) => {
  const isSystemOwner = useAppSelector(selectIsSystemOwner);
  if (isSystemOwner) return <Navigate to="/owner/tenants" replace />;
  return <>{children}</>;
};

const RouteFallback = () => {
  const { t } = useTranslation();

  return (
    <div className="page-shell">
      <div className="glass-panel flex min-h-[12rem] items-center justify-center px-6 py-10 text-sm font-medium text-muted-foreground">
        {t("common.loading")}
      </div>
    </div>
  );
};

const AppRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Navigate to="/login" replace />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <NonSystemOwnerRoute>
              <DashboardPage />
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <NonSystemOwnerRoute>
              <POSPage />
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/pos-workspace"
          element={
            <NonSystemOwnerRoute>
              <POSWorkspacePage />
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <NonSystemOwnerRoute>
              <OrdersPage />
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/shift"
          element={
            <NonSystemOwnerRoute>
              <ShiftPage />
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/shifts-management"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <ShiftsManagementPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="CustomersView">
                <CustomersPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/products"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ProductsView">
                <ProductsPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="CategoriesView">
                <CategoriesPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <SuppliersPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/purchase-invoices"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <PurchaseInvoicesPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/purchase-invoices/new"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <PurchaseInvoiceFormPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/purchase-invoices/:id"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <PurchaseInvoiceDetailsPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/purchase-invoices/:id/edit"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <PurchaseInvoiceFormPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/branches"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <BranchesPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <ReportsDashboardPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/daily"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <DailyReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/sales"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <SalesReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/inventory"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <InventoryReportsPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/profit-loss"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <ProfitLossReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/expenses"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <ExpensesReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/transfer-history"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <TransferHistoryReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/customers/top"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <TopCustomersReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/customers/debts"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <CustomerDebtsReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/customers/activity"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <CustomerActivityReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/employees/cashier-performance"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <CashierPerformanceReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/employees/shifts"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <ShiftDetailsReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/employees/sales"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <SalesByEmployeeReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/products/movement"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <ProductMovementReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/products/profitability"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <ProfitableProductsReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/products/slow"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <SlowMovingProductsReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/products/cogs"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <CogsReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/suppliers/purchases"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <SupplierPurchasesReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/suppliers/debts"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <SupplierDebtsReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/reports/suppliers/performance"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ReportsView">
                <SupplierPerformanceReportPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <AuditLogPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <SettingsPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/settings/permissions"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <PermissionsPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/users"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/backup"
          element={
            <NonSystemOwnerRoute>
              <AdminRoute>
                <BackupPage />
              </AdminRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ExpensesView">
                <ExpensesPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/expenses/new"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ExpensesCreate">
                <ExpenseFormPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/expenses/:id"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ExpensesView">
                <ExpenseDetailsPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/expenses/:id/edit"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="ExpensesCreate">
                <ExpenseFormPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/cash-register"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="CashRegisterView">
                <CashRegisterDashboard />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/cash-register/transactions"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="CashRegisterView">
                <CashRegisterTransactionsPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <NonSystemOwnerRoute>
              <PermissionRoute permission="InventoryView">
                <InventoryPage />
              </PermissionRoute>
            </NonSystemOwnerRoute>
          }
        />
        <Route
          path="/owner/tenants"
          element={
            <SystemOwnerRoute>
              <TenantCreationPage />
            </SystemOwnerRoute>
          }
        />
        <Route
          path="/owner/users"
          element={
            <SystemOwnerRoute>
              <SystemUsersPage />
            </SystemOwnerRoute>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectToken);
  const dispatch = useAppDispatch();
  const { data: currentShiftData, isLoading: isLoadingShift } =
    useGetCurrentShiftQuery(undefined, {
      skip: !isAuthenticated,
    });
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveredShift, setRecoveredShift] = useState<any>(null);
  const [savedAt, setSavedAt] = useState<string>("");

  // Validate JWT token on app startup - prevents login/pos redirect loop
  // If token is expired or invalid, clear auth state immediately before any API call
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    try {
      // Decode JWT payload (base64 middle section)
      const parts = token.split(".");
      if (parts.length !== 3) {
        // Invalid token format
        console.warn("Invalid JWT format - logging out");
        localStorage.removeItem("persist:auth");
        dispatch(logoutAction());
        dispatch(clearBranch());
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp;

      if (exp) {
        const now = Math.floor(Date.now() / 1000);
        if (now >= exp) {
          // Token expired
          console.warn("JWT expired - logging out");
          localStorage.removeItem("persist:auth");
          dispatch(logoutAction());
          dispatch(clearBranch());
          return;
        }
      }
    } catch (e) {
      // Token is malformed - clear it
      console.warn("Failed to validate JWT - logging out", e);
      localStorage.removeItem("persist:auth");
      dispatch(logoutAction());
      dispatch(clearBranch());
    }
  }, []); // Only run once on startup

  // CRITICAL: Clear branch state on app startup to prevent branch mismatch
  // This ensures that when a user logs in, they start with a clean branch state
  useEffect(() => {
    if (isAuthenticated) {
      // Clear persisted branch from localStorage
      try {
        localStorage.removeItem("persist:branch");
      } catch (e) {
        // ignore localStorage errors
      }
      // Clear branch state in Redux
      dispatch(clearBranch());
    }
  }, []); // Only run once on startup

  // Shift recovery disabled - was causing annoying popups on every app load
  // Clear any previously saved shift data on startup
  useEffect(() => {
    if (isAuthenticated) {
      shiftPersistence.clear();
    }
  }, [isAuthenticated]);

  // Shift auto-save disabled - was causing recovery modal popups
  // useEffect(() => {
  //   if (!isAuthenticated) return;
  //   const currentShift = currentShiftData?.data;
  //   if (currentShift && !currentShift.isClosed) {
  //     shiftPersistence.startAutoSave(() => currentShift);
  //   } else {
  //     shiftPersistence.stopAutoSave();
  //     if (currentShift?.isClosed) {
  //       shiftPersistence.clear();
  //     }
  //   }
  //   return () => shiftPersistence.stopAutoSave();
  // }, [isAuthenticated, currentShiftData]);

  const handleRestore = () => {
    // The shift is already in the backend, just close the modal
    // The user can continue working with the existing shift
    setShowRecovery(false);
    setRecoveredShift(null);
  };

  const handleDiscard = () => {
    shiftPersistence.clear();
    setShowRecovery(false);
    setRecoveredShift(null);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
