import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Download,
  Search,
  BookOpen,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { studyMaterialService, facultyService, subjectService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudyMaterials = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const initialQ = searchParams.get("q") || "";
  const initialFacultyId = searchParams.get("facultyId") || "";
  const initialSubjectId = searchParams.get("subjectId") || "";

  const [materials, setMaterials] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedFaculty, setSelectedFaculty] = useState(initialFacultyId);
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  const [downloadingId, setDownloadingId] = useState(null);

  // 1. Fetch filters
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const facRes = await facultyService.getAll();
        setFaculties(facRes.faculties || facRes.data || (Array.isArray(facRes) ? facRes : []));
      } catch (err) {
        console.warn("Error loading faculties:", err);
      }
    };
    loadFilters();
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
        console.warn("Error loading subjects:", err);
      }
    };
    loadSubjects();
  }, [selectedFaculty]);

  // 2. Fetch Study Materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedFaculty) params.facultyId = selectedFaculty;
      if (selectedSubject) params.subjectId = selectedSubject;

      let res;
      if (searchQuery.trim()) {
        res = await studyMaterialService.search(params);
      } else {
        res = await studyMaterialService.getAll(params);
      }

      const list = res.studyMaterials || res.data || (Array.isArray(res) ? res : []);
      setMaterials(list);
      setTotalCount(res.totalCount || list.length);
    } catch (err) {
      console.error("Error fetching study materials:", err);
      setError("Failed to load study materials. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [searchQuery, selectedFaculty, selectedSubject]);

  const handleDownload = async (material) => {
    if (!isAuthenticated) {
      alert("Please sign in to download full PDF study materials and lecture notes.");
      return;
    }

    try {
      setDownloadingId(material.id);
      const res = await studyMaterialService.download(material.id);
      
      // Create blob link and trigger download
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = material.fileName || `${material.title || "study-material"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Could not download file. Please verify your authentication.");
    } finally {
      setDownloadingId(null);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFaculty("");
    setSelectedSubject("");
    setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]" />
            <span>Resource Library</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            Study Materials & PDFs<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-xl">
            Download hand-written lecture notes, formula handbooks, and reference summaries curated for council exam preparation.
          </p>
        </div>

        <div className="text-[13px] text-[var(--text-secondary)]">
          <span>Available: <strong className="text-[var(--text-primary)]">{totalCount}</strong> Resources</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-minimal p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search PDF notes by topic, title, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-minimal pl-9 text-[13px]"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setSelectedSubject("");
              }}
              className="input-minimal bg-[var(--bg-surface)] text-[12px] cursor-pointer"
            >
              <option value="">All Disciplines</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-minimal bg-[var(--bg-surface)] text-[12px] cursor-pointer"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery || selectedFaculty || selectedSubject) && (
          <div className="pt-2 border-t border-[var(--border-color)] flex justify-end">
            <button
              onClick={resetFilters}
              className="btn-secondary !py-1 text-[12px] flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Materials List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-minimal p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)]/60 rounded w-2/3" />
              <div className="h-10 bg-[var(--border-color)]/30 rounded" />
              <div className="h-8 bg-[var(--border-color)]/40 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <div className="card-minimal p-12 text-center space-y-3">
          <FileText className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">No PDF notes found</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchQuery ? `No study materials matching "${searchQuery}".` : "No PDF study materials have been uploaded yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="card-minimal p-6 flex flex-col justify-between space-y-5 hover:border-[var(--text-primary)] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    PDF Resource
                  </span>
                  {mat.fileSizeFormatted && (
                    <span className="text-[12px] font-mono text-[var(--text-secondary)]">
                      {mat.fileSizeFormatted}
                    </span>
                  )}
                </div>

                <h3 className="font-editorial text-xl sm:text-2xl text-[var(--text-primary)]">
                  {mat.title}
                </h3>

                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {mat.description || "Comprehensive syllabus notes covering key formulas and problem-solving strategies."}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[var(--text-secondary)]">
                  {mat.faculty?.name && (
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
                      {mat.faculty.name}
                    </span>
                  )}
                  {mat.subject?.name && (
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
                      {mat.subject.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="text-[12px] text-[var(--text-secondary)] truncate max-w-[180px]">
                  {mat.fileName}
                </span>

                <button
                  onClick={() => handleDownload(mat)}
                  disabled={downloadingId === mat.id}
                  className="btn-primary !h-[36px] text-[13px] flex items-center gap-1.5"
                >
                  {downloadingId === mat.id ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudyMaterials;
