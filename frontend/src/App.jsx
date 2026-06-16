import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Redirect helper for the base '/' url
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  const allRoles = ['Super Admin', 'Manager', 'Staff'];

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Base Redirect Route */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={allRoles}>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={allRoles}>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['Super Admin', 'Manager']}>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['Super Admin']}>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
