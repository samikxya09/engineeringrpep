import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Timer,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  BarChart3,
  Bookmark,
  Check,
} from "lucide-react";
import { resultService, bookmarkService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ExamResult = () => {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'correct' | 'wrong' | 'unanswered'
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await resultService.getResultDetails(attemptId);
        setResult(res.result || res.data || res);
      } catch (err) {
        console.error("Error fetching exam result:", err);
        setError(err.response?.data?.message || "Failed to load exam result details.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  const handleToggleBookmark = async (questionId) => {
    if (!isAuthenticated) return;
    try {
      if (bookmarkedIds.has(questionId)) {
        await bookmarkService.remove(questionId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      } else {
        await bookmarkService.add(questionId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.add(questionId);
          return next;
        });
      }
    } catch (err) {
      console.error("Error bookmarking:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-6">
        <div className="w-10 h-10 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
        <h2 className="font-editorial text-2xl text-[var(--text-primary)]">Evaluating Examination Results...</h2>
        <p className="text-[13px] text-[var(--text-secondary)]">Analyzing correct, incorrect and unanswered answers.</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-editorial text-2xl text-[var(--text-primary)]">Result Unavailable</h2>
        <p className="text-[14px] text-[var(--text-secondary)]">{error || "Could not retrieve attempt evaluation."}</p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const {
    exam,
    score = 0,
    totalQuestions = 0,
    correctAnswers = 0,
    wrongAnswers = 0,
    unansweredQuestions = 0,
    percentage = 0,
    status = "Failed",
    timeTaken = "N/A",
    questionReview = [],
  } = result;

  const isPassed = status.toLowerCase() === "passed" || percentage >= 50;

  const filteredQuestions = questionReview.filter((item) => {
    if (filterMode === "correct") return item.isCorrect === true;
    if (filterMode === "wrong") return item.isCorrect === false && Boolean(item.selectedAnswer);
    if (filterMode === "unanswered") return !item.selectedAnswer;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* 1. Result Score Banner */}
      <div className="card-minimal p-8 sm:p-10 space-y-6 text-center bg-[var(--bg-surface)]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[12px] font-medium border bg-[var(--bg-canvas)]">
          <span className={`w-2 h-2 rounded-full ${isPassed ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span className={isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
            {isPassed ? "Official Benchmark Passed" : "Benchmark Not Achieved (Requires 50%)"}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            {exam?.title || "Mock Examination Result"}<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-md mx-auto">
            Review detailed breakdown of your answers, verify correct choices, and analyze weak chapters.
          </p>
        </div>

        {/* Score Numbers */}
        <div className="flex items-center justify-center gap-8 py-4">
          <div>
            <span className="font-editorial text-5xl sm:text-6xl text-[var(--text-primary)] font-bold">
              {score}
            </span>
            <span className="text-[16px] text-[var(--text-secondary)]"> / {totalQuestions}</span>
            <p className="text-[12px] text-[var(--text-secondary)] pt-1">Total Score</p>
          </div>
          <div className="h-12 w-[1px] bg-[var(--border-color)]" />
          <div>
            <span className={`font-editorial text-5xl sm:text-6xl font-bold ${
              isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}>
              {percentage}%
            </span>
            <p className="text-[12px] text-[var(--text-secondary)] pt-1">Percentage Score</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {exam?.id && (
            <Link to={`/exam/${exam.id}/session`} className="btn-primary !h-[40px] text-[13px] flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Retake Mock Exam
            </Link>
          )}
          <Link to="/dashboard" className="btn-secondary !h-[40px] text-[13px] flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" /> Return to Dashboard
          </Link>
        </div>
      </div>

      {/* 2. Metric Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-minimal p-5 text-center space-y-1">
          <span className="text-[12px] text-[var(--text-secondary)]">Correct</span>
          <p className="font-editorial text-3xl text-emerald-600 dark:text-emerald-400 font-medium">
            {correctAnswers}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">{totalQuestions ? ((correctAnswers / totalQuestions) * 100).toFixed(0) : 0}% Accuracy</p>
        </div>

        <div className="card-minimal p-5 text-center space-y-1">
          <span className="text-[12px] text-[var(--text-secondary)]">Wrong</span>
          <p className="font-editorial text-3xl text-rose-600 dark:text-rose-400 font-medium">
            {wrongAnswers}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">0 Penalty Marks</p>
        </div>

        <div className="card-minimal p-5 text-center space-y-1">
          <span className="text-[12px] text-[var(--text-secondary)]">Unanswered</span>
          <p className="font-editorial text-3xl text-amber-600 dark:text-amber-400 font-medium">
            {unansweredQuestions}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">Skipped Questions</p>
        </div>

        <div className="card-minimal p-5 text-center space-y-1">
          <span className="text-[12px] text-[var(--text-secondary)]">Time Taken</span>
          <p className="font-editorial text-3xl text-[var(--text-primary)] font-medium">
            {timeTaken}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">Duration</p>
        </div>
      </div>

      {/* 3. Detailed Question Review */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)]">
              Question Review
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Inspect explanations and correct formulas for all test items.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-surface)] rounded-[8px] border border-[var(--border-color)] text-[12px]">
            {[
              { key: "all", label: `All (${questionReview.length})` },
              { key: "correct", label: `Correct (${correctAnswers})` },
              { key: "wrong", label: `Wrong (${wrongAnswers})` },
              { key: "unanswered", label: `Skipped (${unansweredQuestions})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterMode(f.key)}
                className={`px-3 py-1 rounded-[6px] font-medium transition-colors ${
                  filterMode === f.key
                    ? "bg-[var(--text-primary)] text-[var(--bg-canvas)] shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="card-minimal p-8 text-center text-[var(--text-secondary)] text-[13px]">
            No questions in this filter view.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((qItem, idx) => {
              const q = qItem.question || qItem;
              const userAns = qItem.selectedAnswer;
              const correctAns = (q.correctAnswer || qItem.correctAnswer || "").toUpperCase();
              const isCorrect = qItem.isCorrect;
              const isUnanswered = !userAns;

              return (
                <div
                  key={q.id || idx}
                  className="card-minimal p-6 sm:p-7 space-y-5 text-left"
                >
                  {/* Status Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)]">
                        Q{idx + 1}
                      </span>
                      {isCorrect ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                        </span>
                      ) : isUnanswered ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Unanswered
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Incorrect (Your choice: {userAns})
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(q.id)}
                      className="text-[var(--text-secondary)] hover:text-[var(--accent-coral)]"
                      title="Bookmark for review"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Question Text */}
                  <p className="text-[15px] sm:text-[16px] text-[var(--text-primary)] font-normal leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { key: "A", text: q.optionA },
                      { key: "B", text: q.optionB },
                      { key: "C", text: q.optionC },
                      { key: "D", text: q.optionD },
                    ].map((opt) => {
                      const isOptionCorrect = correctAns === opt.key;
                      const isOptionUserChoice = userAns === opt.key;

                      let style = "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] opacity-70";
                      if (isOptionCorrect) {
                        style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-medium";
                      } else if (isOptionUserChoice && !isOptionCorrect) {
                        style = "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300";
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`p-3.5 rounded-[8px] border text-left flex items-start justify-between gap-3 text-[13px] ${style}`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono font-medium text-[var(--text-primary)]">
                              {opt.key}.
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                          {isOptionUserChoice && !isOptionCorrect && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {q.explanation && (
                    <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-1.5 text-[13px]">
                      <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                        <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
                        <span>Explanation:</span>
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default ExamResult;
