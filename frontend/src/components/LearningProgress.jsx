import React from "react";
import { Link } from "react-router-dom";
import { Award, Target, BookOpen, Bookmark, CheckCircle2, ArrowRight } from "lucide-react";

const LearningProgress = ({ learningStatistics, examStatistics }) => {
  const questionsAttempted = learningStatistics?.questionsAttempted || 0;
  const questionsBookmarked = learningStatistics?.questionsBookmarked || 0;
  const subjectsStudied = learningStatistics?.subjectsStudied || 0;
  const averageScore = examStatistics?.averageScore || 0;
  const passedBenchmarkExams = examStatistics?.passedBenchmarkExams || 0;
  const totalExams = examStatistics?.totalExamsAttempted || 0;

  // Passing benchmark calculation (Target 50%)
  const benchmarkProgress = Math.min(Math.round((averageScore / 50) * 100), 100);
  const isBenchmarkReady = averageScore >= 50 && totalExams > 0;

  return (
    <div className="card-minimal p-6 sm:p-7 space-y-6 text-left transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
        <div>
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
            Learning Progress
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            Real activity metrics across question banks and mock tests.
          </p>
        </div>

        <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)]">
          NEC Benchmark: 50%
        </span>
      </div>

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Questions Attempted */}
        <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-1">
          <span className="text-[11px] uppercase font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[var(--accent-coral)]" /> Questions Answered
          </span>
          <p className="font-editorial text-2xl text-[var(--text-primary)] font-semibold">
            {questionsAttempted}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">
            Across all test attempts
          </p>
        </div>

        {/* Saved Bookmarks */}
        <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-1">
          <span className="text-[11px] uppercase font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-[var(--accent-coral)]" /> Saved for Revision
          </span>
          <p className="font-editorial text-2xl text-[var(--text-primary)] font-semibold">
            {questionsBookmarked}
          </p>
          <Link to="/bookmarks" className="text-[11px] btn-link block">
            Practice bookmarks →
          </Link>
        </div>

        {/* Disciplines Covered */}
        <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-1">
          <span className="text-[11px] uppercase font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-coral)]" /> Subjects Covered
          </span>
          <p className="font-editorial text-2xl text-[var(--text-primary)] font-semibold">
            {subjectsStudied > 0 ? subjectsStudied : "Active"}
          </p>
          <Link to="/faculties" className="text-[11px] btn-link block">
            Browse curriculum →
          </Link>
        </div>

      </div>

      {/* Council Benchmark Readiness Bar */}
      <div className="p-5 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
        <div className="flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--text-primary)]" />
            <span className="font-medium text-[var(--text-primary)]">Council Benchmark Status</span>
          </div>
          <span className={`text-[12px] font-medium font-mono ${
            isBenchmarkReady ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          }`}>
            {totalExams > 0 ? `${averageScore}% Average (${isBenchmarkReady ? "Passing Grade" : "Below 50%"})` : "Take a Mock Exam"}
          </span>
        </div>

        <div className="w-full h-2 bg-[var(--bg-canvas)] rounded-full overflow-hidden border border-[var(--border-color)]">
          <div
            className={`h-full transition-all duration-500 ${
              isBenchmarkReady ? "bg-emerald-500" : "bg-amber-500"
            }`}
            style={{ width: `${totalExams > 0 ? Math.min(Math.max(averageScore, 5), 100) : 0}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-[var(--text-secondary)]">
          <span>0%</span>
          <span>50% (Passing Threshold)</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default LearningProgress;
