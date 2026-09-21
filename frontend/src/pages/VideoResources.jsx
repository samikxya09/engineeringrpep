import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Video,
  ExternalLink,
  Search,
  BookOpen,
  AlertCircle,
  RotateCcw,
  Play,
} from "lucide-react";
import { videoResourceService, facultyService, subjectService } from "../services/api";

const VideoResources = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const initialFacultyId = searchParams.get("facultyId") || "";
  const initialSubjectId = searchParams.get("subjectId") || "";
  const initialPlatform = searchParams.get("platform") || "";

  const [videos, setVideos] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedFaculty, setSelectedFaculty] = useState(initialFacultyId);
  const [selectedSubject, setSelectedSubject] = useState(initialSubjectId);
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);

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

  // 2. Fetch Video Resources
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (selectedFaculty) params.facultyId = selectedFaculty;
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedPlatform) params.platform = selectedPlatform;

      let res;
      if (searchQuery.trim()) {
        res = await videoResourceService.search(params);
      } else {
        res = await videoResourceService.getAll(params);
      }

      const list = res.videoResources || res.data || (Array.isArray(res) ? res : []);
      setVideos(list);
      setTotalCount(res.totalCount || list.length);
    } catch (err) {
      console.error("Error fetching video resources:", err);
      setError("Failed to load video resources. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, selectedFaculty, selectedSubject, selectedPlatform]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedFaculty("");
    setSelectedSubject("");
    setSelectedPlatform("");
    setSearchParams({});
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-coral)]" />
            <span>Visual Learning</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            Video Lectures & Tutorials<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-xl">
            Curated video tutorials, derivation walkthroughs, and exam solving strategies from experienced educators.
          </p>
        </div>

        <div className="text-[13px] text-[var(--text-secondary)]">
          <span>Available: <strong className="text-[var(--text-primary)]">{totalCount}</strong> Tutorials</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-minimal p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search video tutorials by topic, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-minimal pl-9 text-[13px]"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex gap-2">
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

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input-minimal bg-[var(--bg-surface)] text-[12px] cursor-pointer"
            >
              <option value="">All Platforms</option>
              <option value="YouTube">YouTube</option>
              <option value="Vimeo">Vimeo</option>
              <option value="Loom">Loom</option>
            </select>
          </div>
        </div>

        {(searchQuery || selectedFaculty || selectedSubject || selectedPlatform) && (
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

      {/* Video List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-minimal p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)]/60 rounded w-2/3" />
              <div className="h-12 bg-[var(--border-color)]/30 rounded" />
              <div className="h-8 bg-[var(--border-color)]/40 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="card-minimal p-12 text-center space-y-3">
          <Video className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">No video tutorials found</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchQuery ? `No video resources matching "${searchQuery}".` : "No video lectures have been linked yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="card-minimal p-6 flex flex-col justify-between space-y-5 hover:border-[var(--text-primary)] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    {vid.platform || "Video"}
                  </span>
                  {vid.subject?.name && (
                    <span className="text-[11px] text-[var(--text-secondary)] truncate max-w-[140px]">
                      {vid.subject.name}
                    </span>
                  )}
                </div>

                <h3 className="font-editorial text-xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                  {vid.title}
                </h3>

                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {vid.description || "Video walkthrough covering problem analysis, formula derivation, and step-by-step solutions."}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                <span className="text-[12px] text-[var(--text-secondary)]">
                  {vid.faculty?.name || "All Streams"}
                </span>

                <a
                  href={vid.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary !h-[36px] text-[13px] flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Watch Video
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoResources;
