import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

/**
 * AdminStatCard Component
 * Displays individual numerical KPIs with custom iconography, trend labels, and quick links.
 */
const AdminStatCard = ({
  title,
  value,
  icon: Icon,
  subtitle,
  link,
  badge,
  badgeColor = "text-[var(--text-secondary)] bg-[var(--bg-surface)]",
}) => {
  const content = (
    <div className="card-minimal p-5 flex flex-col justify-between h-full group hover:border-[var(--text-primary)] transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] group-hover:scale-105 transition-transform">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-[12px] uppercase font-medium text-[var(--text-secondary)] tracking-wide">
            {title}
          </span>
        </div>
        {badge && (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border border-[var(--border-color)] ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <p className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)] font-semibold tracking-tight">
            {value !== undefined && value !== null ? value : 0}
          </p>
          {subtitle && (
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {link && (
          <div className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
};

export default AdminStatCard;
