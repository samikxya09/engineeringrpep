import React from "react";

const StatCard = ({ label, value, detail, icon: Icon, badge, badgeColor = "emerald" }) => {
  return (
    <div className="card-minimal p-5 space-y-2 text-left hover:border-[var(--text-primary)] transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[var(--text-secondary)]">
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)] font-semibold tracking-tight">
          {value}
        </p>
        {badge && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[4px] border ${
            badgeColor === "emerald"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : badgeColor === "rose"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
          }`}>
            {badge}
          </span>
        )}
      </div>

      {detail && (
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          {detail}
        </p>
      )}
    </div>
  );
};

export default StatCard;
