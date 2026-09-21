import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { questionService, facultyService, subjectService, chapterService, bookmarkService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const QuestionsPractice = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // URL Query Params State
  const initialQ = searchParams.get("q") || "";
  const initialFacultyId = searchParams.get("facultyId") || "";
  const initialSubjectId = searchParams.get("subjectId") || "";
  const initialChapterId = searchParams.get("chapterId") || "";
  const initialDifficulty = searchParams.get("difficulty") || "";
  const initialPage = Number(searchParams.get("page")) || 1;

  // State
  const [questions, setQuestions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter Dropdown Options
  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Selected Filters
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedFaculty, setSelectedFaculty] = useState(initialFacultyId);
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  const [selectedChapter, setSelectedChapter] = useState(initialChapterId);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);

  // User interactions state
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: 'A' }
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState({});

  // 1. Fetch Filter Options
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const res = await facultyService.getAll();
        setFaculties(res.faculties || res.data || (Array.isArray(res) ? res : []));
      } catch (err) {
        console.warn("Could not load faculties filter:", err);
      }
    };
    loadFaculties();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        if (selectedFaculty) {
          const res = await facultyService.getSubjects(selectedFaculty);
          setSubjects(res.subjects || res.data || (Array.isArray(res) ? res : []));
        } else {
          const res = await subjectService.getAll();
          setSubjects(res.subjects || res.data || (Array.isArray(res) ? res : []));
        }
      } catch (err) {
        console.warn("Could not load subjects filter:", err);
      }
    };
    loadSubjects();
  }, [selectedFaculty]);

  useEffect(() => {
    const loadChapters = async () => {
      try {
        if (selectedSubject) {
          const res = await subjectService.getChapters(selectedSubject);
          setChapters(res.chapters || res.data || (Array.isArray(res) ? res : []));
        } else {
          setChapters([]);
        }
      } catch (err) {
        console.warn("Could not load chapters filter:", err);
      }
    };
    loadChapters();
  }, [selectedSubject]);

  // 2. Fetch User Bookmarks if Logged In
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadBookmarks = async () => {
      try {
        const res = await bookmarkService.getMyBookmarks({ limit: 100 });
        const bookmarksList = res.bookmarks || [];
        const ids = new Set(bookmarksList.map((b) => b.questionId));
        setBookmarkedIds(ids);
      } catch (err) {
        console.warn("Could not load bookmarks:", err);
      }
    };
    loadBookmarks();
  }, [isAuthenticated]);

  // 3. Fetch Questions based on Filters & Search
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
      };

      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedFaculty) params.facultyId = selectedFaculty;
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedChapter) params.chapterId = selectedChapter;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      let res;
      if (searchQuery.trim()) {
        res = await questionService.search(params);
      } else {
        res = await questionService.getAll(params);
      }

      const list = res.questions || [];
      setQuestions(list);
      setTotalCount(res.totalCount || list.length);
      setTotalPages(res.totalPages || Math.ceil((res.totalCount || list.length) / 10) || 1);
    } catch (err) {
      console.error("Error loading questions:", err);
      setError("Failed to load questions. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedFaculty, selectedSubject, selectedChapter, selectedDifficulty]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Update URL search parameters
  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateUrlParams({ q: searchQuery, page: 1 });
  };

  const handleFilterChange = (type, val) => {
    setPage(1);
    if (type === "faculty") {
      setSelectedFaculty(val);
      setSelectedSubject("");
      setSelectedChapter("");
      updateUrlParams({ facultyId: val, subjectId: "", chapterId: "", page: 1 });
    } else if (type === "subject") {
      setSelectedSubject(val);
      setSelectedChapter("");
      updateUrlParams({ subjectId: val, chapterId: "", page: 1 });
    } else if (type === "chapter") {
      setSelectedChapter(val);
      updateUrlParams({ chapterId: val, page: 1 });
    } else if (type === "difficulty") {
      setSelectedDifficulty(val);
      updateUrlParams({ difficulty: val, page: 1 });
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFaculty("");
    setSelectedSubject("");
    setSelectedChapter("");
    setSelectedDifficulty("");
    setPage(1);
    setSearchParams({});
  };

  const handleSelectOption = (questionId, optionKey) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleToggleBookmark = async (questionId) => {
    if (!isAuthenticated) {
      alert("Please sign in to bookmark questions for quick revision.");
      return;
    }

    const isBookmarked = bookmarkedIds.has(questionId);
    setBookmarkLoading((prev) => ({ ...prev, [questionId]: true }));

    try {
      if (isBookmarked) {
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
      console.error("Error toggling bookmark:", err);
    } finally {
      setBookmarkLoading((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]" />
            <span>Practice Hub</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            Explore Questions<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-xl">
            Syllabus-aligned multiple-choice questions with instant answer evaluation and formula explanations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
          <span>Total: <strong className="text-[var(--text-primary)]">{totalCount}</strong> MCQs</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card-minimal p-5 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search by keywords (e.g. tensile stress, soil permeability, boolean algebra)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-minimal pl-9 text-[13px]"
            />
          </div>
          <button type="submit" className="btn-primary !h-[38px] text-[13px] shrink-0">
            Search Questions
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[var(--border-color)]">
          {/* Faculty */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              Discipline
            </label>
            <select
              value={selectedFaculty}
              onChange={(e) => handleFilterChange("faculty", e.target.value)}
              className="input-minimal bg-[var(--bg-surface)] text-[12px] cursor-pointer"
            >
              <option value="">All Disciplines</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => handleFilterChange("subject", e.target.value)}
              className="input-minimal bg-[var(--bg-surface)] text-[12px] cursor-pointer"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Chapter */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => handleFilterChange("chapter", e.target.value)}
              disabled={!selectedSubject}
              className="input-minimal bg-[var(--bg-surface)] text-[12px] cursor-pointer disabled:opacity-50"
            >
              <option value="">All Chapters</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>Ch {c.chapterNumber}: {c.name}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
              className="input-minimal bg-[var(--bg-surface)] text-[12px] cursor-pointer"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {(searchQuery || selectedFaculty || selectedSubject || selectedChapter || selectedDifficulty) && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="btn-secondary !py-1 text-[12px] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Question List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-minimal p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-[var(--border-color)]/60 rounded w-1/4" />
              <div className="h-6 bg-[var(--border-color)]/60 rounded w-5/6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-10 bg-[var(--border-color)]/30 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="card-minimal p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">No questions found</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
            Try adjusting your search keywords or broadening your filter criteria.
          </p>
          <button onClick={resetFilters} className="btn-primary !h-[36px] text-[13px] mt-2">
            Reset filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const userChoice = selectedAnswers[q.id];
            const isAnswered = Boolean(userChoice);
            const isBookmarked = bookmarkedIds.has(q.id);
            const correctKey = (q.correctAnswer || "").toUpperCase();

            return (
              <div
                key={q.id}
                className="card-minimal p-6 sm:p-7 space-y-5 hover:border-[var(--border-color)] transition-colors text-left"
              >
                {/* Meta Bar */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)] text-[12px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)]">
                      Q{(page - 1) * 10 + idx + 1}
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
                      <span className={`px-2 py-0.2 rounded text-[10px] font-medium uppercase ${
                        q.difficulty.toLowerCase() === "easy"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : q.difficulty.toLowerCase() === "hard"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}>
                        {q.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleToggleBookmark(q.id)}
                    disabled={bookmarkLoading[q.id]}
                    className="btn-secondary !p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title={isBookmarked ? "Remove bookmark" : "Save question"}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-[var(--accent-coral)]" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
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
                        onClick={() => handleSelectOption(q.id, opt.key)}
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

                {/* Explanation Box */}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 flex items-center justify-between border-t border-[var(--border-color)] text-[13px]">
              <button
                type="button"
                onClick={() => {
                  const prevPage = Math.max(page - 1, 1);
                  setPage(prevPage);
                  updateUrlParams({ page: prevPage });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page <= 1}
                className="btn-secondary !py-1.5 text-[13px] flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-[var(--text-secondary)]">
                Page <strong className="text-[var(--text-primary)]">{page}</strong> of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => {
                  const nextPage = Math.min(page + 1, totalPages);
                  setPage(nextPage);
                  updateUrlParams({ page: nextPage });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page >= totalPages}
                className="btn-secondary !py-1.5 text-[13px] flex items-center gap-1 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default QuestionsPractice;
