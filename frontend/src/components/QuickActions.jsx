import React from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Play, BarChart3, Bookmark, FileText, ArrowRight } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      title: "Explore Questions",
      description: "Filter MCQs by chapter & difficulty",
      icon: HelpCircle,
      link: "/questions",
    },
    {
      title: "Start Mock Exam",
      description: "Full 100-mark timed simulation",
      icon: Play,
      link: "/exams",
      highlight: true,
    },
    {
      title: "View Bookmarks",
      description: "Revise saved tricky questions",
      icon: Bookmark,
      link: "/bookmarks",
    },
    {
      title: "Study Materials",
      description: "Download lecture notes & PDF summaries",
      icon: FileText,
      link: "/study-materials",
    },
  ];

  return (
    <div className="space-y-4 text-left">
      <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              to={action.link}
              className={`card-minimal p-5 space-y-3 flex flex-col justify-between hover:border-[var(--text-primary)] transition-all group ${
                action.highlight ? "border-[var(--text-primary)]/40 bg-[var(--bg-surface)]" : ""
              }`}
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-editorial text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                  {action.title}
                </h4>
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[12px] text-[var(--text-primary)] font-medium pt-2 border-t border-[var(--border-color)]">
                <span>Launch</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
