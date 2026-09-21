import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, BookOpen, Search, AlertCircle, ChevronRight, FileText, Video } from "lucide-react";
import { facultyService, subjectService } from "../services/api";

const Subjects = () => {
  const { facultyId } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      if (facultyId) {
        // Fetch specific faculty & its subjects
        const [facRes, subRes] = await Promise.all([
          facultyService.getById(facultyId).catch(() => null),
          facultyService.getSubjects(facultyId),
        ]);
        if (facRes) {
          setFaculty(facRes.faculty || facRes.data || facRes);
        }
        const subList = subRes.subjects || subRes.data || (Array.isArray(subRes) ? subRes : []);
        setSubjects(subList);
      } else {
        // Fetch all subjects across faculties
        const res = await subjectService.getAll();
        const subList = res.subjects || res.data || (Array.isArray(res) ? res : []);
        setSubjects(subList);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Failed to load subjects. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [facultyId]);

  const filteredSubjects = subjects.filter((sub) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      (sub.name && sub.name.toLowerCase().includes(q)) ||
      (sub.code && sub.code.toLowerCase().includes(q)) ||
      (sub.description && sub.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
        <Link to="/" className="hover:text-[var(--text-primary)]">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/faculties" className="hover:text-[var(--text-primary)]">Disciplines</Link>
        {faculty && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[var(--text-primary)] font-medium truncate">{faculty.name}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            {faculty ? `${faculty.name}` : "Engineering Subjects"}<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-xl">
            {faculty?.description || "Browse curriculum subjects, chapter breakdowns, and practice question sets."}
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-minimal pl-9 text-[13px]"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-minimal p-6 space-y-4 animate-pulse">
              <div className="h-4 bg-[var(--border-color)]/60 rounded w-16" />
              <div className="h-6 bg-[var(--border-color)]/60 rounded w-3/4" />
              <div className="h-12 bg-[var(--border-color)]/40 rounded" />
            </div>
          ))}
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="card-minimal p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">No subjects found</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchTerm ? `No subjects matching "${searchTerm}".` : "No subjects available for this discipline yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => (
            <div
              key={sub.id}
              className="card-minimal p-6 flex flex-col justify-between space-y-6 hover:border-[var(--text-primary)] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-primary)] font-mono">
                    {sub.code || "SUB"}
                  </span>
                  <span className="text-[12px] text-[var(--text-secondary)]">
                    {sub.chapters?.length ? `${sub.chapters.length} Chapters` : "Syllabus"}
                  </span>
                </div>

                <Link to={`/subjects/${sub.id}/chapters`}>
                  <h3 className="font-editorial text-2xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                    {sub.name}
                  </h3>
                </Link>

                <p className="text-[13px] leading-relaxed text-[var(--text-secondary)] line-clamp-3">
                  {sub.description || "Core syllabus topics, reference specifications, and practice questions."}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <Link
                    to={`/study-materials?subjectId=${sub.id}`}
                    className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                    title="View PDF notes"
                  >
                    <FileText className="w-3.5 h-3.5" /> Notes
                  </Link>
                  <Link
                    to={`/video-resources?subjectId=${sub.id}`}
                    className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1"
                    title="View video lectures"
                  >
                    <Video className="w-3.5 h-3.5" /> Videos
                  </Link>
                </div>

                <Link
                  to={`/subjects/${sub.id}/chapters`}
                  className="btn-link flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Chapters <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Subjects;
