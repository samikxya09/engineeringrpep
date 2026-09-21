import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * ManagementCard Component
 * Interactive card linking administrators to individual content management modules.
 */
const ManagementCard = ({
  title,
  description,
  count,
  countLabel = "items",
  link,
  icon: Icon,
  actionText = "Manage",
  highlight = false,
}) => {
  return (
    <Link
      to={link}
      className={`card-minimal p-6 flex flex-col justify-between group transition-all duration-200 hover:border-[var(--text-primary)] ${
        highlight ? "border-[var(--accent-coral)]/40 bg-[var(--bg-surface)]/80" : ""
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-canvas)] transition-colors">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          {count !== undefined && count !== null && (
            <span className="text-[12px] font-mono px-2.5 py-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
              {count} {countLabel}
            </span>
          )}
        </div>

        <div>
          <h3 className="font-editorial text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
            {title}
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[13px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default ManagementCard;
