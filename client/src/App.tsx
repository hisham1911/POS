import type React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAppSelector } from "./store/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsSystemOwner,
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
  const { data: currentShiftData, isLoading: isLoadingShift } =
    useGetCurrentShiftQuery(undefined, {
      skip: !isAuthenticated,
    });
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveredShift, setRecoveredShift] = useState<any>(null);
  const [savedAt, setSavedAt] = useState<string>("");

  // Check for saved shift on app start
  useEffect(() => {
    if (!isAuthenticated) return;

    // Wait for API to load before checking
    if (isLoadingShift) return;

    const saved = shiftPersistence.load();
    const currentShift = currentShiftData?.data;

    // Show recovery modal ONLY if:
    // 1. There's a saved shift in localStorage
    // 2. API has loaded (not loading)
    // 3. There IS an active shift from API (shift exists and matches saved shift)
    // 4. Saved shift is not closed
    if (
      saved &&
      currentShift &&
      !currentShift.isClosed &&
      saved.shift.id === currentShift.id
    ) {
      setRecoveredShift(saved.shift);
      setSavedAt(saved.savedAt);
      setShowRecovery(true);
    } else if (saved && !currentShift) {
      // If there's a saved shift but no current shift, clear it
      shiftPersistence.clear();
    }
  }, [isAuthenticated, currentShiftData, isLoadingShift]);

  // Start auto-save when shift is open
  useEffect(() => {
    if (!isAuthenticated) return;

    const currentShift = currentShiftData?.data;
    if (currentShift && !currentShift.isClosed) {
      shiftPersistence.startAutoSave(() => currentShift);
    } else {
      shiftPersistence.stopAutoSave();
      // Clear saved shift if current shift is closed
      if (currentShift?.isClosed) {
        shiftPersistence.clear();
      }
    }

    return () => shiftPersistence.stopAutoSave();
  }, [isAuthenticated, currentShiftData]);

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

        {/* Shift Recovery Modal */}
        {recoveredShift && (
          <ShiftRecoveryModal
            shift={recoveredShift}
            savedAt={savedAt}
            isOpen={showRecovery}
            onRestore={handleRestore}
            onDiscard={handleDiscard}
          />
        )}
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
