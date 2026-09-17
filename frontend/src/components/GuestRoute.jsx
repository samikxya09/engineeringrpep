import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * GuestRoute Component
 * Prevents authenticated users from viewing guest-only pages like /login or /register.
 */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--border-color)] border-t-[var(--text-primary)] animate-spin" />
          <p className="text-[13px] text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return children;
};

export default GuestRoute;
