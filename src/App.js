import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthLayout      from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

import Login           from './pages/auth/Login';
import Register        from './pages/auth/Register';
import ForgotPassword  from './pages/auth/ForgotPassword';
import ResetPassword   from './pages/auth/ResetPassword';
import Dashboard       from './pages/dashboard/Dashboard';
import Analytics       from './pages/dashboard/Analytics';
import Businesses      from './pages/business/Businesses';
import BusinessForm    from './pages/business/BusinessForm';
import Appointments    from './pages/appointment/Appointments';
import AppointmentForm from './pages/appointment/AppointmentForm';
import Services        from './pages/service/Services';
import ServiceForm     from './pages/service/ServiceForm';
import Staff           from './pages/staff/Staff';
import Settings        from './pages/settings/Settings';
import PublicBooking   from './pages/public/PublicBooking';
import Browse          from './pages/public/Browse';
import OAuthCallback   from './pages/auth/OAuthCallback';

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen" style={{ background: '#050709' }}>
    <div className="spinner" />
  </div>
);

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/browse" element={<Browse />} />
      <Route path="/book/:slug" element={<PublicBooking />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login"          element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register"       element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
      </Route>

      {/* Root — Dashboard for authed users, redirects to /browse for guests */}
      <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/browse" replace />}>
        <Route index                    element={<Dashboard />} />
        <Route path="analytics"         element={<Analytics />} />
        <Route path="businesses"        element={<Businesses />} />
        <Route path="businesses/new"    element={<BusinessForm />} />
        <Route path="businesses/:id"    element={<BusinessForm />} />
        <Route path="appointments"      element={<Appointments />} />
        <Route path="appointments/new"  element={<AppointmentForm />} />
        <Route path="services"          element={<Services />} />
        <Route path="services/new"      element={<ServiceForm />} />
        <Route path="services/:id"      element={<ServiceForm />} />
        <Route path="staff"             element={<Staff />} />
        <Route path="settings"          element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/' : '/browse'} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        toastStyle={{
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#f1f5f9',
          borderRadius: '12px',
          fontSize: '13px',
        }}
      />
    </AuthProvider>
  );
}

export default App;
