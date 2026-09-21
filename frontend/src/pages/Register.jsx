import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ENGINEERING_FACULTIES } from "../utils/constants";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    faculty: "Civil Engineering",
    college: "",
    password: "",
    confirmPassword: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error as user types
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.fullName.trim()) {
      setErrorMessage("Full name is required");
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage("Email is required");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const result = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        faculty: formData.faculty,
        college: formData.college.trim(),
        password: formData.password,
      });
      if (result?.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setErrorMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6">
      <div className="max-w-lg w-full space-y-6 card-minimal p-8 sm:p-10 rounded-[10px] text-left">
        
        {/* Editorial Heading */}
        <div className="space-y-1.5">
          <span className="text-[12px] uppercase font-medium tracking-wide text-[var(--text-secondary)]">
            Register
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)]">
            Create your account<span className="text-[var(--accent-coral)]">.</span>
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Start practicing model questions for the Nepal Engineering Council licensing examination.
          </p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4 pt-1" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-1.5">
              Full Name (with Er. title if preferred)
            </label>
            <input
              type="text"
              name="fullName"
              required
              disabled={submitting}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Er. Aarav Adhikari"
              className="input-minimal disabled:opacity-60"
            />
          </div>

          {/* Email */}
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
              placeholder="aarav@example.com"
              className="input-minimal disabled:opacity-60"
            />
          </div>

          {/* Discipline & College */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-1.5">
                Engineering Discipline
              </label>
              <select
                name="faculty"
                disabled={submitting}
                value={formData.faculty}
                onChange={handleChange}
                className="input-minimal bg-[var(--bg-surface)] cursor-pointer disabled:opacity-60"
              >
                {ENGINEERING_FACULTIES.map((fac) => (
                  <option key={fac.id} value={fac.name}>
                    {fac.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-1.5">
                College / University
              </label>
              <input
                type="text"
                name="college"
                disabled={submitting}
                value={formData.college}
                onChange={handleChange}
                placeholder="e.g. IOE Pulchowk"
                className="input-minimal disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-1.5">
                Password
              </label>
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

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-primary)] mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                disabled={submitting}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-minimal disabled:opacity-60"
              />
            </div>
          </div>

          <p className="text-[12px] text-[var(--text-secondary)] pt-1">
            By creating an account, you agree to access exam prep materials adhering to NEC examination guidelines.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full h-[40px] text-[14px] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-[var(--btn-primary-text)] border-t-transparent animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Complete Registration
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="pt-4 border-t border-[var(--border-color)] text-center text-[13px] text-[var(--text-secondary)]">
          Already registered?{" "}
          <Link to="/login" className="btn-link">
            Sign in here →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
