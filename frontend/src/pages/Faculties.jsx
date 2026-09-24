import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { facultyService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AddFacultyModal from "../components/AddFacultyModal";

const Faculties = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await facultyService.getAll();
      const list = data.faculties || data.data || (Array.isArray(data) ? data : []);
      setFaculties(list);
    } catch (err) {
      console.error("Error fetching faculties:", err);
      setError("Failed to load engineering faculties. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const filteredFaculties = faculties.filter((fac) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      (fac.name && fac.name.toLowerCase().includes(q)) ||
      (fac.code && fac.code.toLowerCase().includes(q)) ||
      (fac.description && fac.description.toLowerCase().includes(q))
    );
  });

  const isAdmin = user?.role === "admin";

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]" />
            <span>Curriculum Explorer</span>
            {isAdmin && (
              <>
                <span>•</span>
                <span className="text-[var(--accent-coral)] font-mono text-[11px]">Admin Mode</span>
              </>
            )}
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            Engineering Disciplines<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-xl">
            Select your engineering discipline to view syllabus-aligned subjects, chapters, and question banks.
          </p>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search disciplines..."
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
              <span>Add Faculty</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={fetchFaculties} className="btn-secondary !py-1 text-[12px] flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-minimal p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-[var(--border-color)]/60 rounded w-16" />
              <div className="h-6 bg-[var(--border-color)]/60 rounded w-3/4" />
              <div className="h-12 bg-[var(--border-color)]/40 rounded" />
              <div className="h-4 bg-[var(--border-color)]/30 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="card-minimal p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">No disciplines found</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchTerm ? `No disciplines matching "${searchTerm}". Try a different keyword.` : "No engineering disciplines have been added yet."}
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary text-[13px] mt-2 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add First Faculty
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculties.map((fac) => (
            <Link
              key={fac.id}
              to={`/faculties/${fac.id}/subjects`}
              className="card-minimal p-6 flex flex-col justify-between space-y-6 hover:border-[var(--text-primary)] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono">
                    {fac.code || "NEC"}
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)]">
                    {fac.subjects?.length ? `${fac.subjects.length} Subjects` : "Curriculum"}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                  {fac.name}
                </h3>

                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] line-clamp-3">
                  {fac.description || "Core engineering principles, syllabus guidelines, and mock question banks for license examination."}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[13px]">
                <span className="text-[var(--text-secondary)] text-[12px]">Explore syllabus</span>
                <span className="btn-link flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View subjects <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      <AddFacultyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchFaculties()}
      />
    </div>
  );
};

export default Faculties;

