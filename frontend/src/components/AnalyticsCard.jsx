import React from "react";
import { Award, CheckCircle2, XCircle, TrendingUp } from "lucide-react";

/**
 * AnalyticsCard Component
 * Displays aggregated platform examination metrics and performance indicators.
 */
const AnalyticsCard = ({ examStatistics = {} }) => {
  const {
    totalAttempts = 0,
    completedAttempts = 0,
    averageScore = 0,
    averagePercentage = 0,
    passPercentage = 0,
    totalPassed = 0,
    totalFailed = 0,
  } = examStatistics;

  return (
    <div className="card-minimal p-6 sm:p-8 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
            <Award className="w-4 h-4 text-[var(--accent-coral)]" />
            <span>Platform Exam Performance</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)] mt-1">
            Exam Analytics & Success Rate
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] px-3 py-1 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)]">
            NEC Standard: 50% Benchmark
          </span>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Attempts */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-[12px] text-[var(--text-secondary)] uppercase font-medium">Total Exam Attempts</span>
          <p className="font-editorial text-3xl text-[var(--text-primary)] font-semibold">
            {totalAttempts}
          </p>
          <p className="text-[12px] text-[var(--text-secondary)]">
            {completedAttempts} completed attempts
          </p>
        </div>

        {/* Average Score */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-[12px] text-[var(--text-secondary)] uppercase font-medium">Average Student Score</span>
          <p className="font-editorial text-3xl text-[var(--text-primary)] font-semibold">
            {averageScore} <span className="text-lg font-normal text-[var(--text-secondary)]">/ 100</span>
          </p>
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-success)]" />
            <span>{averagePercentage}% mean accuracy</span>
          </div>
        </div>

        {/* Pass Percentage */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
          <span className="text-[12px] text-[var(--text-secondary)] uppercase font-medium">License Pass Rate</span>
          <p className="font-editorial text-3xl text-[var(--accent-coral)] font-semibold">
            {passPercentage}%
          </p>
          <div className="flex items-center gap-3 text-[12px] text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1 text-[var(--accent-success)]">
              <CheckCircle2 className="w-3.5 h-3.5" /> {totalPassed} passed
            </span>
            <span className="inline-flex items-center gap-1 text-red-400">
              <XCircle className="w-3.5 h-3.5" /> {totalFailed} retake
            </span>
          </div>
        </div>

      </div>

      {/* Visual Benchmark Readiness Bar */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[var(--text-secondary)]">Overall Passing Ratio</span>
          <span className="font-mono font-medium text-[var(--text-primary)]">{passPercentage}% passing</span>
        </div>
        <div className="w-full h-3 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] overflow-hidden flex">
          <div
            className="h-full bg-[var(--accent-success)] transition-all duration-500 rounded-l-full"
            style={{ width: `${Math.min(100, Math.max(0, passPercentage))}%` }}
            title={`Passed: ${totalPassed}`}
          />
          <div
            className="h-full bg-red-400/80 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, 100 - passPercentage))}%` }}
            title={`Below 50%: ${totalFailed}`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
          <span>0%</span>
          <span className="text-[var(--text-primary)] font-semibold">50% NEC Benchmark</span>
          <span>100%</span>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsCard;
