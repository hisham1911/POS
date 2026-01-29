import type React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import { selectIsAuthenticated, selectIsAdmin } from "./store/slices/authSlice";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MainLayout } from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import POSPage from "./pages/pos/POSPage";
import ProductsPage from "./pages/products/ProductsPage";
import CategoriesPage from "./pages/categories/CategoriesPage";
import OrdersPage from "./pages/orders/OrdersPage";
import ShiftPage from "./pages/shifts/ShiftPage";
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

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/pos" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
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
      <Route path="/pos" element={<POSPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/shift" element={<ShiftPage />} />
      <Route
        path="/customers"
        element={
          <AdminRoute>
            <CustomersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/products"
        element={
          <AdminRoute>
            <ProductsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <AdminRoute>
            <CategoriesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <AdminRoute>
            <SuppliersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/purchase-invoices"
        element={
          <AdminRoute>
            <PurchaseInvoicesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/purchase-invoices/new"
        element={
          <AdminRoute>
            <PurchaseInvoiceFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/purchase-invoices/:id"
        element={
          <AdminRoute>
            <PurchaseInvoiceDetailsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/purchase-invoices/:id/edit"
        element={
          <AdminRoute>
            <PurchaseInvoiceFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/branches"
        element={
          <AdminRoute>
            <BranchesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <AdminRoute>
            <DailyReportPage />
          </AdminRoute>
        }
      />
      <Route
        path="/audit"
        element={
          <AdminRoute>
            <AuditLogPage />
          </AdminRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <AdminRoute>
            <SettingsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <AdminRoute>
            <ExpensesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/expenses/new"
        element={
          <AdminRoute>
            <ExpenseFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/expenses/:id"
        element={
          <AdminRoute>
            <ExpenseDetailsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/expenses/:id/edit"
        element={
          <AdminRoute>
            <ExpenseFormPage />
          </AdminRoute>
        }
      />
      <Route
        path="/cash-register"
        element={
          <AdminRoute>
            <CashRegisterDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/cash-register/transactions"
        element={
          <AdminRoute>
            <CashRegisterTransactionsPage />
          </AdminRoute>
        }
      />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
