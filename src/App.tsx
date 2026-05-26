import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthInitializer } from '@/components/auth/AuthInitializer';
import { HomePage } from '@/pages/HomePage';
import { ProductListingPage } from '@/pages/ProductListingPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage';
import { OrderDetailsPage } from '@/pages/OrderDetailsPage';
import { WishlistPage } from '@/pages/WishlistPage';
import { InventoryPage } from '@/pages/InventoryPage';
import { AdminCategoriesPage } from '@/pages/AdminCategoriesPage';
import { SellerProductsPage } from '@/pages/SellerProductsPage';
import { SellerOrdersPage } from '@/pages/SellerOrdersPage';
import { CustomerDashboard } from '@/pages/CustomerDashboard';
import { SellerDashboard } from '@/pages/SellerDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { useAuthStore } from '@/store/authStore';

function DashboardRedirect() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Render appropriate dashboard based on role
  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  } else if (user.role === 'SELLER') {
    return <SellerDashboard />;
  } else {
    return <CustomerDashboard />;
  }
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3 text-gray-900">404 — Page Not Found</h1>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-orange-500 underline underline-offset-4">Return Home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthInitializer />
      <Routes>
        {/* Authentication routes (outside RootLayout) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Landing page (outside RootLayout) */}
        <Route path="/" element={<HomePage />} />

        {/* Dashboard routes (with DashboardLayout) */}
        <Route element={<DashboardLayout />}>
          {/* Role-based dashboard redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* Customer routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <ProductListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:slug"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success/:orderId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <OrderSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          {/* Seller routes */}
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <SellerProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/orders"
            element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <SellerOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/inventory"
            element={
              <ProtectedRoute allowedRoles={['SELLER']}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'SELLER']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
