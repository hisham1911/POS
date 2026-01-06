import type React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAppSelector } from "./store/hooks"
import { selectIsAuthenticated, selectIsAdmin } from "./store/slices/authSlice"
import { MainLayout } from "./components/layout/MainLayout"
import LoginPage from "./pages/auth/LoginPage"
import POSPage from "./pages/pos/POSPage"
import ProductsPage from "./pages/products/ProductsPage"
import CategoriesPage from "./pages/categories/CategoriesPage"
import OrdersPage from "./pages/orders/OrdersPage"
import ShiftPage from "./pages/shifts/ShiftPage"
import DailyReportPage from "./pages/reports/DailyReportPage"
import NotFound from "./pages/NotFound"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const isAdmin = useAppSelector(selectIsAdmin)
  if (!isAdmin) return <Navigate to="/pos" replace />
  return <>{children}</>
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  if (isAuthenticated) return <Navigate to="/pos" replace />
  return <>{children}</>
}

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
        path="/reports"
        element={
          <AdminRoute>
            <DailyReportPage />
          </AdminRoute>
        }
      />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
)

export default App
