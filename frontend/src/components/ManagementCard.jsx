import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";

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
  onAddClick,
  addText = "Add New",
}) => {
  return (
    <div
      className={`card-minimal p-6 flex flex-col justify-between group transition-all duration-200 hover:border-[var(--text-primary)] ${
        highlight ? "border-[var(--accent-coral)]/40 bg-[var(--bg-surface)]/80" : ""
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--text-primary)] group-hover:text-[var(--bg-canvas)] transition-colors">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
          <div className="flex items-center gap-2">
            {count !== undefined && count !== null && (
              <span className="text-[12px] font-mono px-2.5 py-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)] font-medium">
                {count} {countLabel}
              </span>
            )}
            {onAddClick && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddClick();
                }}
                className="px-2 py-1 rounded-[6px] bg-[var(--accent-coral)]/10 text-[var(--accent-coral)] hover:bg-[var(--accent-coral)] hover:text-white transition-colors text-[11px] font-medium flex items-center gap-1"
                title={addText}
              >
                <Plus className="w-3 h-3" />
                <span>{addText}</span>
              </button>
            )}
          </div>
        </div>

        <Link to={link} className="block group">
          <h3 className="font-editorial text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
            {title}
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </Link>
      </div>

      <div className="pt-4 mt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[13px] font-medium text-[var(--text-primary)]">
        <Link
          to={link}
          className="flex items-center justify-between w-full hover:text-[var(--accent-coral)] transition-colors"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ManagementCard;

