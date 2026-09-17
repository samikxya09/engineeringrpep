import React from "react";
import { Routes, Route } from "react-router-dom";

// Page Imports
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";

// Route Guards
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";

/**
 * AppRoutes Component
 * Centralizes all page routes with ProtectedRoute and GuestRoute guards.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      {/* Guest Only Routes (Redirects to /dashboard if already logged in) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* Protected Routes (Redirects to /login if not authenticated) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
