import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OTPVerificationPage from './pages/OTPVerificationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import DealsPage from './pages/DealsPage';
import DealDetailsPage from './pages/DealDetailsPage';
import TeamPerformancePage from './pages/TeamPerformancePage';
import AccountsPage from './pages/AccountsPage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';


import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import SalesPage from './pages/SalesPage';
import AdminPage from './pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 dark:bg-slate-950 light:bg-slate-50 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading session…</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};


const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
};


const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Routes>

    <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
    <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
    <Route path="/verify-otp" element={<AuthRoute><OTPVerificationPage /></AuthRoute>} />
    <Route path="/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
    <Route path="/reset-password/:token" element={<AuthRoute><ResetPasswordPage /></AuthRoute>} />


    <Route
      path="/*"
      element={
        <ProtectedRoute>
          <DashboardLayout>
            <Routes>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="deals" element={<DealsPage />} />
              <Route path="deals/:id" element={<DealDetailsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="performance" element={<TeamPerformancePage />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="profile" element={<ProfilePage />} />


              <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      }
    />
  </Routes>
);

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
