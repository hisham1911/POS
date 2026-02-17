import type React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsSystemOwner,
  selectToken,
  logout as logoutAction,
} from "./store/slices/authSlice";
import { useGetCurrentShiftQuery } from "./api/shiftsApi";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainLayout } from "./components/layout/MainLayout";
import { ShiftRecoveryModal } from "./components/shifts";
import { shiftPersistence } from "./utils/shiftPersistence";
import LoginPage from "./pages/auth/LoginPage";
import POSPage from "./pages/pos/POSPage";
import ProductsPage from "./pages/products/ProductsPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import OrdersPage from "./pages/orders/OrdersPage";
import ShiftPage from "./pages/shifts/ShiftPage";
import ShiftsManagementPage from "./pages/shifts/ShiftsManagementPage";
import CustomersPage from "./pages/customers/CustomersPage";
import SuppliersPage from "./pages/suppliers/SuppliersPage";
import { BranchesPage } from "./pages/branches/BranchesPage";
import DailyReportPage from "./pages/reports/DailyReportPage";
import AuditLogPage from "./pages/audit/AuditLogPage";
import SettingsPage from "./pages/settings/SettingsPage";
import { PurchaseInvoicesPage } from "./pages/purchase-invoices/PurchaseInvoicesPage";
import { PurchaseInvoiceFormPage } from "./pages/purchase-invoices/PurchaseInvoiceFormPage";
import { PurchaseInvoiceDetailsPage } from "./pages/purchase-invoices/PurchaseInvoiceDetailsPage";
import { ExpensesPage } from "./pages/expenses/ExpensesPage";
import { ExpenseFormPage } from "./pages/expenses/ExpenseFormPage";
import { ExpenseDetailsPage } from "./pages/expenses/ExpenseDetailsPage";
import { CashRegisterDashboard } from "./pages/cash-register/CashRegisterDashboard";
import { CashRegisterTransactionsPage } from "./pages/cash-register/CashRegisterTransactionsPage";
import InventoryPage from "./pages/inventory/InventoryPage";
import TenantCreationPage from "./pages/owner/TenantCreationPage";
import NotFound from "./pages/NotFound";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = useAppSelector(selectIsAdmin);
  if (!isAdmin) return <Navigate to="/pos" replace />;
  return <>{children}</>;
};

const SystemOwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const isSystemOwner = useAppSelector(selectIsSystemOwner);
  if (!isSystemOwner) return <Navigate to="/pos" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "SystemOwner" ? "/owner/tenants" : "/pos"}
        replace
      />
    );
  }
  return <>{children}</>;
};

const NonSystemOwnerRoute = ({ children }: { children: React.ReactNode }) => {
  const isSystemOwner = useAppSelector(selectIsSystemOwner);
  if (isSystemOwner) return <Navigate to="/owner/tenants" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
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
        path="/pos"
        element={
          <NonSystemOwnerRoute>
            <POSPage />
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
            <AdminRoute>
              <CustomersPage />
            </AdminRoute>
          </NonSystemOwnerRoute>
        }
      />
      <Route
        path="/products"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <ProductsPage />
            </AdminRoute>
          </NonSystemOwnerRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <CategoriesPage />
            </AdminRoute>
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
            <AdminRoute>
              <DailyReportPage />
            </AdminRoute>
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
        path="/expenses"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <ExpensesPage />
            </AdminRoute>
          </NonSystemOwnerRoute>
        }
      />
      <Route
        path="/expenses/new"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <ExpenseFormPage />
            </AdminRoute>
          </NonSystemOwnerRoute>
        }
      />
      <Route
        path="/expenses/:id"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <ExpenseDetailsPage />
            </AdminRoute>
          </NonSystemOwnerRoute>
        }
      />
      <Route
        path="/expenses/:id/edit"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <ExpenseFormPage />
            </AdminRoute>
          </NonSystemOwnerRoute>
        }
      />
      <Route
        path="/cash-register"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <CashRegisterDashboard />
            </AdminRoute>
          </NonSystemOwnerRoute>
        }
      />
      <Route
        path="/cash-register/transactions"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <CashRegisterTransactionsPage />
            </AdminRoute>
          </NonSystemOwnerRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <NonSystemOwnerRoute>
            <AdminRoute>
              <InventoryPage />
            </AdminRoute>
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
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
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
          return;
        }
      }
    } catch (e) {
      // Token is malformed - clear it
      console.warn("Failed to validate JWT - logging out", e);
      localStorage.removeItem("persist:auth");
      dispatch(logoutAction());
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
