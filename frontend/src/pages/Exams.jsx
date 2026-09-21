import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Timer,
  Award,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { examService, facultyService } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [faculties, setFaculties] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const res = await facultyService.getAll();
        setFaculties(res.faculties || res.data || (Array.isArray(res) ? res : []));
      } catch (err) {
        console.warn("Error loading faculties:", err);
      }
    };
    loadFaculties();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await examService.getAll();
      const list = res.exams || res.data || (Array.isArray(res) ? res : []);
      setExams(list);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError("Failed to load mock exams. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter((e) => {
    if (!selectedFaculty) return true;
    return e.facultyId === Number(selectedFaculty);
  });

  const handleStartExam = (examId) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/exam/${examId}/start` } } });
      return;
    }
    navigate(`/exam/${examId}/session`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]" />
            <span>Council Exam Simulator</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            Timed Mock Examinations<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] max-w-xl">
            Experience realistic NEC license examination simulation under strict 2-hour timers, 100 questions, and 50% passing benchmarks.
          </p>
        </div>

        {/* Faculty Filter */}
        <div className="w-full md:w-64">
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="input-minimal bg-[var(--bg-surface)] text-[13px] cursor-pointer"
          >
            <option value="">All Engineering Streams</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Exam Specifications Banner */}
      <div className="card-minimal p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="space-y-1">
          <p className="font-editorial text-2xl text-[var(--text-primary)]">100 MCQs</p>
          <p className="text-[12px] text-[var(--text-secondary)]">Section A (60) + Section B (40)</p>
        </div>
        <div className="space-y-1">
          <p className="font-editorial text-2xl text-[var(--text-primary)]">120 Minutes</p>
          <p className="text-[12px] text-[var(--text-secondary)]">Standard 2-Hour Countdown</p>
        </div>
        <div className="space-y-1">
          <p className="font-editorial text-2xl text-[var(--text-primary)]">50% Benchmark</p>
          <p className="text-[12px] text-[var(--text-secondary)]">No negative marking rule</p>
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-minimal p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-[var(--border-color)]/60 rounded w-2/3" />
              <div className="h-10 bg-[var(--border-color)]/30 rounded" />
              <div className="h-8 bg-[var(--border-color)]/40 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="card-minimal p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-[var(--text-secondary)]" />
          <h3 className="font-editorial text-2xl text-[var(--text-primary)]">No mock exams found</h3>
          <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mx-auto">
            {selectedFaculty ? "No mock exams scheduled for this discipline." : "No mock exams are currently published."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="card-minimal p-6 flex flex-col justify-between space-y-6 hover:border-[var(--text-primary)] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                    {exam.faculty?.code || "NEC MOCK"}
                  </span>
                  <span className="text-[12px] text-[var(--accent-success)] font-medium flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" /> {exam.durationMinutes || 120} Mins
                  </span>
                </div>

                <h3 className="font-editorial text-2xl text-[var(--text-primary)] group-hover:text-[var(--accent-coral)] transition-colors">
                  {exam.title}
                </h3>

                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {exam.description || "Official model examination testing comprehensive syllabus comprehension and problem speed."}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-secondary)]">
                  <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    Total: {exam.totalQuestions || 100} Questions
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    Pass Mark: {exam.passPercentage || 50}%
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <button
                  onClick={() => handleStartExam(exam.id)}
                  className="btn-primary w-full !h-[38px] text-[13px] flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Mock Exam
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exams;
