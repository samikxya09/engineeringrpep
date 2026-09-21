import React from "react";
import { Link } from "react-router-dom";
import { Timer, Bookmark, ArrowRight, CheckCircle2, XCircle, FileText } from "lucide-react";

const RecentActivity = ({ recentExams = [], recentBookmarks = [] }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      
      {/* 1. Left: Recent Exams (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
              Recent Mock Tests
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)]">Latest examination attempts</p>
          </div>
          <Link to="/exams" className="btn-link text-[12px]">
            View all exams →
          </Link>
        </div>

        {recentExams.length === 0 ? (
          <div className="card-minimal p-8 text-center space-y-3">
            <Timer className="w-7 h-7 mx-auto text-[var(--text-secondary)]" />
            <h4 className="font-editorial text-xl text-[var(--text-primary)]">No tests taken yet</h4>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-xs mx-auto">
              Simulate real examination conditions with timed 100-mark mock tests.
            </p>
            <Link to="/exams" className="btn-primary !h-[36px] text-[13px] inline-flex">
              Browse Mock Exams
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExams.map((exam) => {
              const isPassed = exam.status?.toLowerCase() === "passed" || Number(exam.percentage) >= 50;

              return (
                <Link
                  key={exam.attemptId}
                  to={`/results/${exam.attemptId}`}
                  className="card-minimal p-4.5 flex items-center justify-between hover:border-[var(--text-primary)] transition-all group"
                >
                  <div className="space-y-1">
                    <h4 className="text-[14px] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                      {exam.examTitle}
                    </h4>
                    <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                      <span>{exam.date ? new Date(exam.date).toLocaleDateString() : "Recent"}</span>
                      <span>•</span>
                      <span>{exam.percentage}% Score</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="font-editorial text-xl text-[var(--text-primary)] font-semibold">
                      {exam.score} Marks
                    </span>
                    <div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-[4px] border ${
                        isPassed
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                      }`}>
                        {isPassed ? "Passed" : "Failed"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Right: Recent Bookmarks (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
              Saved Bookmarks
            </h3>
            <p className="text-[12px] text-[var(--text-secondary)]">Saved questions for revision</p>
          </div>
          <Link to="/bookmarks" className="btn-link text-[12px]">
            Manage all →
          </Link>
        </div>

        {recentBookmarks.length === 0 ? (
          <div className="card-minimal p-8 text-center space-y-3">
            <Bookmark className="w-7 h-7 mx-auto text-[var(--text-secondary)]" />
            <h4 className="font-editorial text-xl text-[var(--text-primary)]">No bookmarks saved</h4>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-xs mx-auto">
              Save difficult questions while practicing to quickly review them later.
            </p>
            <Link to="/questions" className="btn-secondary !h-[36px] text-[13px] inline-flex">
              Explore Questions
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookmarks.map((bm) => (
              <Link
                key={bm.id}
                to="/bookmarks"
                className="card-minimal p-4 space-y-2 hover:border-[var(--text-primary)] transition-all block group"
              >
                <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                  <span className="font-mono px-1.5 py-0.5 rounded bg-[var(--bg-canvas)] border border-[var(--border-color)]">
                    {bm.difficulty?.toUpperCase() || "MCQ"}
                  </span>
                  <span>{bm.subjectName || "Subject"}</span>
                </div>

                <p className="text-[13px] text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent-coral)] transition-colors">
                  {bm.questionText}
                </p>
              </Link>
            ))}

            <div className="pt-2">
              <Link to="/bookmarks" className="btn-secondary w-full text-center text-[13px]">
                Review all saved questions →
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default RecentActivity;
