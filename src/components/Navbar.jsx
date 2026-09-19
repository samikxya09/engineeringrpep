import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkStyle = ({ isActive }) =>
    `text-[14px] leading-5 transition-colors ${
      isActive
        ? "text-[var(--text-primary)] font-medium"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`;

  const displayName = user?.fullName || user?.Fullname || user?.name || "Candidate";

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-canvas)]/95 backdrop-blur-sm border-b border-[var(--border-color)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand with subtle status dot */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-editorial text-2xl tracking-tight text-[var(--text-primary)]">
                NEC Prep<span className="text-[var(--accent-coral)]">.</span>
              </span>
            </Link>

            {/* Status indicator */}
            <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]" />
              <span>NEC Syllabus 2026</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" className={navLinkStyle}>
              home
            </NavLink>
            <NavLink to="/dashboard" className={navLinkStyle}>
              dashboard
            </NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Dark mode toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/dashboard"
                  className="btn-secondary flex items-center gap-1.5 text-[13px]"
                  title={`Logged in as ${displayName}`}
                >
                  <User className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary !p-2 text-[var(--text-secondary)] hover:text-red-500"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg text-[var(--text-primary)] hover:bg-[var(--border-color)]/50 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-6 py-4 space-y-3">
          <div className="flex flex-col gap-2.5">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-[14px] text-[var(--text-primary)] py-1"
            >
              home
            </NavLink>
            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-[14px] text-[var(--text-primary)] py-1"
            >
              dashboard
            </NavLink>
          </div>
          <div className="pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="text-[13px] text-[var(--text-secondary)] px-1">
                  Signed in as <span className="font-medium text-[var(--text-primary)]">{displayName}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="btn-secondary w-full text-center text-red-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary w-full text-center"
                >
                  sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
