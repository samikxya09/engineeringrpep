import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search, AlertCircle, ChevronRight, Plus, RefreshCw } from "lucide-react";
import { subjectService, chapterService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AddChapterModal from "../components/AddChapterModal";

const Chapters = () => {
  const { subjectId } = useParams();
  const { user } = useAuth();
  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (subjectId) {
        const [subRes, chRes] = await Promise.all([
          subjectService.getById(subjectId).catch(() => null),
          subjectService.getChapters(subjectId),
        ]);
        if (subRes) {
          setSubject(subRes.subject || subRes.data || subRes);
        }
        const chList = chRes.chapters || chRes.data || (Array.isArray(chRes) ? chRes : []);
        setChapters(chList);
      } else {
        const res = await chapterService.getAll();
        const chList = res.chapters || res.data || (Array.isArray(res) ? res : []);
        setChapters(chList);
      }
    } catch (err) {
      console.error("Error fetching chapters:", err);
      setError("Failed to load chapters. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  const filteredChapters = chapters.filter((ch) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      (ch.name && ch.name.toLowerCase().includes(q)) ||
      (ch.description && ch.description.toLowerCase().includes(q))
    );
  });

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
        <Link to="/" className="hover:text-[var(--text-primary)]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/faculties" className="hover:text-[var(--text-primary)]">Disciplines</Link>
        {subject && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/faculties/${subject.facultyId}/subjects`} className="hover:text-[var(--text-primary)] truncate max-w-[150px]">
              {subject.faculty?.name || "Faculty"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--text-primary)] font-medium truncate max-w-[200px]">{subject.name}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            {subject ? `${subject.name} Chapters` : "Curriculum Chapters"}<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-xl">
            {subject?.description || "Master individual topics with chapter-wise multiple choice questions."}
          </p>
        </div>

        {/* Search & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-minimal pl-9 text-[13px]"
            />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary !h-[44px] text-[13px] flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Chapter</span>
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={fetchData} className="btn-secondary !py-1 text-[12px] flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card-minimal p-5 flex items-center justify-between animate-pulse">
              <div className="space-y-2 w-2/3">
                <div className="h-5 bg-[var(--border-color)]/60 rounded w-1/2" />
                <div className="h-3.5 bg-[var(--border-color)]/40 rounded w-3/4" />
              </div>
              <div className="h-8 bg-[var(--border-color)]/40 rounded w-28" />
            </div>
          ))}
        </div>
      ) : filteredChapters.length === 0 ? (
        <div className="card-minimal p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">No chapters found</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchTerm ? `No chapters matching "${searchTerm}".` : "No chapters added to this subject yet."}
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary text-[13px] mt-2 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add First Chapter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChapters.map((ch, idx) => (
            <div
              key={ch.id}
              className="card-minimal p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--text-primary)] transition-colors group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    Chapter {ch.chapterNumber || idx + 1}
                  </span>
                  <h3 className="font-editorial text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                    {ch.name}
                  </h3>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)] max-w-2xl">
                  {ch.description || "Formula definitions, unit conversions, and conceptual problems."}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to={`/questions?chapterId=${ch.id}${subjectId ? `&subjectId=${subjectId}` : ""}`}
                  className="btn-primary !h-[36px] text-[13px]"
                >
                  Practice MCQs
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Chapter Modal */}
      <AddChapterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchData()}
        defaultSubjectId={subjectId || ""}
      />
    </div>
  );
};

export default Chapters;

