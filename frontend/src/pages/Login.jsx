import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("Please enter your email and password");
      return;
    }

    try {
      setSubmitting(true);
      const result = await login(formData.email.trim(), formData.password);
      
      // Redirect based on user role: Admins -> /admin, Students -> /dashboard (or previously attempted route)
      let defaultDestination = "/dashboard";
      if (result?.user?.role === "admin") {
        defaultDestination = "/admin";
      }
      const destination = location.state?.from?.pathname || defaultDestination;
      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-6">
      <div className="max-w-sm w-full space-y-6 card-minimal p-8 rounded-[10px] text-left">
        
        {/* Editorial Heading */}
        <div className="space-y-1.5">
          <span className="text-[12px] uppercase font-medium tracking-wide text-[var(--text-secondary)]">
            Sign In
          </span>
          <h2 className="font-editorial text-3xl text-[var(--text-primary)]">
            Welcome back<span className="text-[var(--accent-coral)]">.</span>
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Enter your credentials to continue your license preparation.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4 pt-1" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              disabled={submitting}
              value={formData.email}
              onChange={handleChange}
              placeholder="engineer@domain.com"
              className="input-minimal disabled:opacity-60"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium text-[var(--text-primary)]">
                Password
              </label>
              <a href="#" className="btn-link text-[12px]">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              name="password"
              required
              disabled={submitting}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-minimal disabled:opacity-60"
            />
          </div>

          <div className="flex items-center gap-2 pt-1 text-[13px] text-[var(--text-secondary)]">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="rounded border-[var(--border-color)] text-[var(--text-primary)] focus:ring-0"
            />
            <label htmlFor="rememberMe" className="cursor-pointer select-none">
              Remember me on this browser
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full h-[40px] text-[14px] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[var(--btn-primary-text)] border-t-transparent animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Sign in
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-[var(--border-color)] text-center text-[13px] text-[var(--text-secondary)]">
          Don't have an account?{" "}
          <Link to="/register" className="btn-link">
            Create account →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
