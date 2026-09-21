import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Timer,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { examService } from "../services/api";

const ExamSession = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attemptId, setAttemptId] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: 'A' }
  const [timeLeft, setTimeLeft] = useState(120 * 60); // seconds
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);

  // 1. Start Exam Attempt on Mount
  useEffect(() => {
    let isMounted = true;

    const initializeAttempt = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await examService.startAttempt(examId);

        if (!isMounted) return;

        const attempt = res.attempt || res.data || res;
        const qList = attempt.questions || res.questions || [];

        setAttemptId(attempt.attemptId || attempt.id || res.attemptId);
        setExam(attempt.exam || res.exam || { title: "Nepal Engineering License Mock Exam", durationMinutes: 120 });
        setQuestions(qList);

        const duration = (attempt.exam?.durationMinutes || res.exam?.durationMinutes || 120) * 60;
        setTimeLeft(duration);
      } catch (err) {
        console.error("Error starting exam attempt:", err);
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to initialize exam session. Please check your credentials.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAttempt();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examId]);

  // 2. Submit Handler
  const handleSubmitExam = useCallback(async () => {
    if (!attemptId || submitting) return;

    try {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      // Format payload: [{ questionId, selectedAnswer }]
      const payload = Object.entries(answers).map(([qId, ans]) => ({
        questionId: Number(qId),
        selectedAnswer: ans,
      }));

      const res = await examService.submitAttempt(attemptId, payload);
      const resultAttemptId = res.attemptId || attemptId;

      navigate(`/results/${resultAttemptId}`, { replace: true });
    } catch (err) {
      console.error("Error submitting exam:", err);
      alert(err.response?.data?.message || "Error submitting answers. Please try again.");
      setSubmitting(false);
    }
  }, [attemptId, answers, submitting, navigate]);

  // 3. Countdown Timer
  useEffect(() => {
    if (loading || !attemptId || submitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, attemptId, submitting, handleSubmitExam]);

  // Format Time Remaining (HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optionKey) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionKey,
    }));
  };

  const handleClearOption = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQ.id];
      return next;
    });
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isUrgent = timeLeft < 300; // less than 5 minutes

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-6">
        <div className="w-10 h-10 border-2 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin" />
        <h2 className="font-editorial text-2xl text-[var(--text-primary)]">Generating Mock Exam Session...</h2>
        <p className="text-[13px] text-[var(--text-secondary)]">Loading question bank and starting timer.</p>
      </div>
    );
  }

  if (error || !currentQuestion) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="font-editorial text-2xl text-[var(--text-primary)]">Unable to Launch Exam</h2>
        <p className="text-[14px] text-[var(--text-secondary)]">{error || "No questions found for this exam attempt."}</p>
        <button onClick={() => navigate("/exams")} className="btn-primary">
          Return to Exam List
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-200">
      
      {/* 1. Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[var(--bg-surface)] border-b border-[var(--border-color)] px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <span className="font-editorial text-xl text-[var(--text-primary)] hidden sm:inline truncate max-w-xs">
              {exam?.title || "License Mock Exam"}
            </span>
            <span className="text-[12px] font-mono px-2.5 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              Q {currentIndex + 1} of {totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-[6px] border font-mono text-[14px] font-medium transition-colors ${
              isUrgent
                ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse"
                : "bg-[var(--bg-canvas)] border-[var(--border-color)] text-[var(--text-primary)]"
            }`}>
              <Timer className="w-4 h-4 shrink-0" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Finish / Submit Button */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="btn-primary !h-[36px] text-[13px] flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" /> Submit Exam
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Exam Body */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left: Question Card (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="card-minimal p-6 sm:p-8 space-y-6">
            
            {/* Question Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] text-[12px] text-[var(--text-secondary)]">
              <span className="font-mono font-medium text-[var(--text-primary)]">
                Question {currentIndex + 1}
              </span>
              <span>1 Mark • Single Choice</span>
            </div>

            {/* Question Text */}
            <h2 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)] font-normal leading-snug">
              {currentQuestion.questionText}
            </h2>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {[
                { key: "A", text: currentQuestion.optionA },
                { key: "B", text: currentQuestion.optionB },
                { key: "C", text: currentQuestion.optionC },
                { key: "D", text: currentQuestion.optionD },
              ].map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.key;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full p-4 rounded-[8px] border text-left flex items-start justify-between gap-3 text-[14px] transition-all ${
                      isSelected
                        ? "bg-[var(--bg-canvas)] border-[var(--text-primary)] text-[var(--text-primary)] font-medium shadow-sm ring-1 ring-[var(--text-primary)]"
                        : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono font-medium">{opt.key}.</span>
                      <span>{opt.text}</span>
                    </div>

                    <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                      isSelected ? "border-[var(--text-primary)] bg-[var(--text-primary)]" : "border-[var(--border-color)]"
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--bg-surface)]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearOption}
                disabled={!answers[currentQuestion.id]}
                className="btn-secondary !py-1 text-[12px] flex items-center gap-1 disabled:opacity-30"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear choice
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentIndex === 0}
                  className="btn-secondary !py-1.5 text-[13px] flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                  disabled={currentIndex === totalQuestions - 1}
                  className="btn-primary !py-1.5 text-[13px] flex items-center gap-1 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Question Palette (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="card-minimal p-5 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
              <h3 className="text-[13px] font-medium text-[var(--text-primary)]">Question Palette</h3>
              <span className="text-[12px] font-mono text-[var(--text-secondary)]">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-[var(--text-primary)]" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-[3px] bg-[var(--bg-canvas)] border border-[var(--border-color)]" />
                <span>Unanswered</span>
              </div>
            </div>

            {/* Numbers Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-1.5 max-h-[360px] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = currentIndex === idx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-[6px] text-[12px] font-mono font-medium transition-all ${
                      isCurrent
                        ? "ring-2 ring-[var(--accent-coral)] font-bold text-[var(--text-primary)]"
                        : ""
                    } ${
                      isAnswered
                        ? "bg-[var(--text-primary)] text-[var(--bg-canvas)]"
                        : "bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--border-color)]">
              <button
                onClick={() => setShowConfirmModal(true)}
                className="btn-primary w-full !h-[38px] text-[13px]"
              >
                Submit Examination
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-minimal max-w-md w-full p-6 sm:p-8 space-y-5 text-left bg-[var(--bg-surface)] shadow-2xl animate-fadeIn">
            <div className="space-y-2">
              <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
                Submit Examination?
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                Once submitted, your exam attempt will be graded immediately according to NEC council criteria.
              </p>
            </div>

            <div className="p-4 rounded-[8px] bg-[var(--bg-canvas)] border border-[var(--border-color)] grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="font-editorial text-2xl text-emerald-600 dark:text-emerald-400 font-medium">
                  {answeredCount}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Answered</p>
              </div>
              <div>
                <p className="font-editorial text-2xl text-amber-600 dark:text-amber-400 font-medium">
                  {totalQuestions - answeredCount}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Unanswered</p>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <p className="text-[12px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                You have {totalQuestions - answeredCount} unanswered questions remaining.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="btn-secondary !h-[38px] text-[13px]"
              >
                Continue Exam
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                disabled={submitting}
                className="btn-primary !h-[38px] text-[13px] flex items-center gap-1.5"
              >
                {submitting ? "Grading..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExamSession;
