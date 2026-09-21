import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { bookmarkService } from "../services/api";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await bookmarkService.getMyBookmarks({ limit: 100 });
      const list = res.bookmarks || [];
      setBookmarks(list);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      setError("Failed to load your bookmarked questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (questionId) => {
    setActionLoading((prev) => ({ ...prev, [questionId]: true }));
    try {
      await bookmarkService.remove(questionId);
      setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId && b.question?.id !== questionId));
    } catch (err) {
      console.error("Error removing bookmark:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-coral)]" />
            <span>Saved Questions</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            My Bookmarks<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-xl">
            Review and test yourself on questions you've saved for revision and formulas recall.
          </p>
        </div>

        <div className="text-[13px] text-[var(--text-secondary)]">
          <span>Total Saved: <strong className="text-[var(--text-primary)]">{bookmarks.length}</strong></span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Bookmarks list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-minimal p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-[var(--border-color)]/60 rounded w-1/4" />
              <div className="h-6 bg-[var(--border-color)]/60 rounded w-4/5" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-10 bg-[var(--border-color)]/30 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="card-minimal p-12 text-center space-y-3">
          <Bookmark className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">No bookmarked questions</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
            While exploring question sets, click the bookmark icon on any MCQ to save it here for later revision.
          </p>
          <div className="pt-2">
            <Link to="/questions" className="btn-primary !h-[36px] text-[13px]">
              Explore Question Bank
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookmarks.map((bm, idx) => {
            const q = bm.question || bm;
            if (!q) return null;

            const qId = q.id || bm.questionId;
            const userChoice = selectedAnswers[qId];
            const isAnswered = Boolean(userChoice);
            const correctKey = (q.correctAnswer || "").toUpperCase();

            return (
              <div
                key={bm.id || qId}
                className="card-minimal p-6 sm:p-7 space-y-5 hover:border-[var(--border-color)] transition-colors text-left"
              >
                {/* Meta Bar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)] text-[12px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)]">
                      #{idx + 1}
                    </span>
                    {q.chapter?.subject?.name && (
                      <span className="text-[var(--text-secondary)]">
                        {q.chapter.subject.name}
                      </span>
                    )}
                    {q.chapter?.name && (
                      <span className="text-[var(--text-secondary)]">
                        • {q.chapter.name}
                      </span>
                    )}
                    {q.difficulty && (
                      <span className="px-2 py-0.2 rounded text-[10px] font-medium uppercase bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                        {q.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Remove Bookmark */}
                  <button
                    onClick={() => handleRemoveBookmark(qId)}
                    disabled={actionLoading[qId]}
                    className="btn-secondary !p-1.5 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Question Text */}
                <p className="text-[15px] sm:text-[16px] leading-relaxed text-[var(--text-primary)] font-normal">
                  {q.questionText}
                </p>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {[
                    { key: "A", text: q.optionA },
                    { key: "B", text: q.optionB },
                    { key: "C", text: q.optionC },
                    { key: "D", text: q.optionD },
                  ].map((opt) => {
                    const isSelected = userChoice === opt.key;
                    const isCorrect = correctKey === opt.key;

                    let optionStyle = "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)]";
                    if (isAnswered) {
                      if (isCorrect) {
                        optionStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-medium";
                      } else if (isSelected && !isCorrect) {
                        optionStyle = "bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300";
                      } else {
                        optionStyle = "bg-[var(--bg-surface)] border-[var(--border-color)] opacity-60";
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(qId, opt.key)}
                        className={`p-3.5 rounded-[8px] border text-left flex items-start justify-between gap-3 text-[13px] transition-colors ${optionStyle}`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono font-medium text-[var(--text-primary)]">
                            {opt.key}.
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        {isAnswered && (
                          <div className="shrink-0 pt-0.5">
                            {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isAnswered && q.explanation && (
                  <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-color)] space-y-1.5 text-[13px] animate-fadeIn">
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
  );
};

export default Bookmarks;
