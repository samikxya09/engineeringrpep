import React, { useState, useEffect } from "react";
import { X, HelpCircle, AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { facultyService, subjectService, chapterService, questionService } from "../services/api";

const AddQuestionModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultFacultyId = "",
  defaultSubjectId = "",
  defaultChapterId = "",
}) => {
  const [formData, setFormData] = useState({
    facultyId: defaultFacultyId || "",
    subjectId: defaultSubjectId || "",
    chapterId: defaultChapterId || "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    difficulty: "medium",
    explanation: "",
  });

  // Dropdown states
  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load Faculties on open
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        facultyId: defaultFacultyId || prev.facultyId || "",
        subjectId: defaultSubjectId || prev.subjectId || "",
        chapterId: defaultChapterId || prev.chapterId || "",
      }));
      setError("");
      setSuccessMsg("");

      const fetchFaculties = async () => {
        try {
          setLoadingFaculties(true);
          const res = await facultyService.getAll();
          const list = res.faculties || res.data || (Array.isArray(res) ? res : []);
          setFaculties(list);
        } catch (err) {
          console.warn("Failed to load faculties for question modal:", err);
        } finally {
          setLoadingFaculties(false);
        }
      };
      fetchFaculties();
    }
  }, [isOpen, defaultFacultyId, defaultSubjectId, defaultChapterId]);

  // Load Subjects when Faculty changes
  useEffect(() => {
    if (isOpen) {
      const fetchSubjects = async () => {
        try {
          setLoadingSubjects(true);
          let subList = [];
          if (formData.facultyId) {
            const res = await facultyService.getSubjects(formData.facultyId);
            subList = res.subjects || res.data || (Array.isArray(res) ? res : []);
          } else {
            const res = await subjectService.getAll();
            subList = res.subjects || res.data || (Array.isArray(res) ? res : []);
          }
          setSubjects(subList);
        } catch (err) {
          console.warn("Failed to load subjects for question modal:", err);
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchSubjects();
    }
  }, [isOpen, formData.facultyId]);

  // Load Chapters when Subject changes
  useEffect(() => {
    if (isOpen) {
      const fetchChapters = async () => {
        if (!formData.subjectId) {
          setChapters([]);
          return;
        }
        try {
          setLoadingChapters(true);
          const res = await subjectService.getChapters(formData.subjectId);
          const chList = res.chapters || res.data || (Array.isArray(res) ? res : []);
          setChapters(chList);
        } catch (err) {
          console.warn("Failed to load chapters for question modal:", err);
        } finally {
          setLoadingChapters(false);
        }
      };
      fetchChapters();
    }
  }, [isOpen, formData.subjectId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "facultyId") {
      setFormData((prev) => ({
        ...prev,
        facultyId: value,
        subjectId: "",
        chapterId: "",
      }));
    } else if (name === "subjectId") {
      setFormData((prev) => ({
        ...prev,
        subjectId: value,
        chapterId: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.chapterId) {
      setError("Please select a target chapter for this question.");
      return;
    }
    if (!formData.questionText.trim()) {
      setError("Question text is required.");
      return;
    }
    if (
      !formData.optionA.trim() ||
      !formData.optionB.trim() ||
      !formData.optionC.trim() ||
      !formData.optionD.trim()
    ) {
      setError("All 4 options (A, B, C, D) are required.");
      return;
    }
    if (!["A", "B", "C", "D"].includes(formData.correctAnswer)) {
      setError("Please select a valid correct answer (A, B, C, or D).");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const response = await questionService.create({
        questionText: formData.questionText.trim(),
        optionA: formData.optionA.trim(),
        optionB: formData.optionB.trim(),
        optionC: formData.optionC.trim(),
        optionD: formData.optionD.trim(),
        correctAnswer: formData.correctAnswer,
        difficulty: formData.difficulty || "medium",
        chapterId: Number(formData.chapterId),
        explanation: formData.explanation.trim() || undefined,
      });

      setSuccessMsg("Question created successfully!");
      setFormData((prev) => ({
        ...prev,
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        explanation: "",
      }));

      if (onSuccess) {
        onSuccess(response.question || response);
      }

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error creating question:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create question. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-left transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-coral)]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
                Add New MCQ Question
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Add syllabus-aligned multiple choice question with options and explanation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[13px] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cascading Hierarchy Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Discipline / Faculty
              </label>
              <select
                name="facultyId"
                value={formData.facultyId}
                onChange={handleChange}
                disabled={loading || loadingFaculties}
                className="input-minimal text-[12px] bg-[var(--bg-surface)] cursor-pointer"
              >
                <option value="">All Faculties...</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Subject <span className="text-[var(--accent-coral)]">*</span>
              </label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                disabled={loading || loadingSubjects}
                required
                className="input-minimal text-[12px] bg-[var(--bg-surface)] cursor-pointer"
              >
                <option value="">Select Subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Chapter <span className="text-[var(--accent-coral)]">*</span>
              </label>
              <select
                name="chapterId"
                value={formData.chapterId}
                onChange={handleChange}
                disabled={loading || loadingChapters || !formData.subjectId}
                required
                className="input-minimal text-[12px] bg-[var(--bg-surface)] cursor-pointer disabled:opacity-50"
              >
                <option value="">
                  {formData.subjectId ? "Select Chapter..." : "Select Subject First"}
                </option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    Ch {c.chapterNumber || ""}: {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question Text & Difficulty */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-medium text-[var(--text-secondary)]">
                Question Statement / Problem <span className="text-[var(--accent-coral)]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[var(--text-secondary)]">Difficulty:</span>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  disabled={loading}
                  className="px-2 py-1 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[11px] font-medium"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <textarea
              name="questionText"
              rows={3}
              placeholder="Type the multiple choice question statement clearly (e.g. Which of the following equations represents Bernoulli's theorem for incompressible flow?)..."
              value={formData.questionText}
              onChange={handleChange}
              disabled={loading}
              required
              className="input-minimal !h-auto py-2.5 text-[13px] resize-none"
            />
          </div>

          {/* 4 Options */}
          <div className="space-y-3 pt-1">
            <label className="block text-[12px] font-medium text-[var(--text-secondary)]">
              Answer Options & Correct Key <span className="text-[var(--accent-coral)]">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A */}
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-[12px] text-[var(--text-primary)]">
                  A.
                </span>
                <input
                  type="text"
                  name="optionA"
                  placeholder="Option A text"
                  value={formData.optionA}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="input-minimal pl-8 text-[13px]"
                />
              </div>

              {/* Option B */}
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-[12px] text-[var(--text-primary)]">
                  B.
                </span>
                <input
                  type="text"
                  name="optionB"
                  placeholder="Option B text"
                  value={formData.optionB}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="input-minimal pl-8 text-[13px]"
                />
              </div>

              {/* Option C */}
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-[12px] text-[var(--text-primary)]">
                  C.
                </span>
                <input
                  type="text"
                  name="optionC"
                  placeholder="Option C text"
                  value={formData.optionC}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="input-minimal pl-8 text-[13px]"
                />
              </div>

              {/* Option D */}
              <div className="relative flex items-center">
                <span className="absolute left-3 font-mono font-bold text-[12px] text-[var(--text-primary)]">
                  D.
                </span>
                <input
                  type="text"
                  name="optionD"
                  placeholder="Option D text"
                  value={formData.optionD}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="input-minimal pl-8 text-[13px]"
                />
              </div>
            </div>

            {/* Correct Answer Selector */}
            <div className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[12px] font-medium text-[var(--text-primary)]">
                Mark Correct Answer:
              </span>
              <div className="flex items-center gap-4">
                {["A", "B", "C", "D"].map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center gap-1.5 cursor-pointer text-[13px] font-mono font-semibold"
                  >
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={opt}
                      checked={formData.correctAnswer === opt}
                      onChange={handleChange}
                      disabled={loading}
                      className="accent-[var(--accent-coral)]"
                    />
                    <span>Option {opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Explanation / Solution Walkthrough (Optional)
            </label>
            <textarea
              name="explanation"
              rows={2}
              placeholder="Step-by-step formula derivation or justification of the correct option for student revision..."
              value={formData.explanation}
              onChange={handleChange}
              disabled={loading}
              className="input-minimal !h-auto py-2.5 text-[13px] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-[13px] min-w-[130px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;
