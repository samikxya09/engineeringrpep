import React from "react";
import { Link } from "react-router-dom";
import { ENGINEERING_FACULTIES } from "../utils/constants";

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-canvas)] border-t border-[var(--border-color)] pt-16 pb-12 text-[var(--text-secondary)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-4 space-y-3">
            <Link to="/" className="inline-block">
              <span className="font-editorial text-2xl tracking-tight text-[var(--text-primary)]">
                NEC Prep<span className="text-[var(--accent-coral)]">.</span>
              </span>
            </Link>
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)] max-w-sm">
              An editorial, focused study companion for graduates preparing for the Nepal Engineering Council licensing examination.
            </p>
          </div>

          {/* Disciplines */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[12px] font-medium text-[var(--text-primary)] tracking-wide uppercase">
              Disciplines
            </h4>
            <ul className="space-y-1.5 text-[14px]">
              {ENGINEERING_FACULTIES.map((fac) => (
                <li key={fac.id}>
                  <Link
                    to="/"
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {fac.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Navigation & Exam Rules */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-[12px] font-medium text-[var(--text-primary)] tracking-wide uppercase">
              Examination Standard
            </h4>
            <p className="text-[14px] leading-relaxed text-[var(--text-secondary)]">
              100 MCQs • 2 Hours • 50% Passing Benchmark • Section A (60 marks) & Section B (40 marks).
            </p>
            <div className="pt-2 flex gap-4 text-[13px]">
              <Link to="/login" className="btn-link">
                Sign in →
              </Link>
              <Link to="/register" className="btn-link">
                Register →
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-[var(--border-color)] pt-6 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[var(--text-secondary)] gap-4">
          <p>© {new Date().getFullYear()} Nepal Engineering License Exam Platform.</p>
          <p className="text-[var(--text-secondary)]">
            Crafted for future licensed engineers in Nepal.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
