import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  HelpCircle,
  Award,
  FileText,
  Video,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  FolderTree,
  Plus,
  Upload,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/api";
import AdminStatCard from "../components/AdminStatCard";
import ManagementCard from "../components/ManagementCard";
import AnalyticsCard from "../components/AnalyticsCard";
import AddFacultyModal from "../components/AddFacultyModal";
import AddSubjectModal from "../components/AddSubjectModal";
import AddChapterModal from "../components/AddChapterModal";
import AddQuestionModal from "../components/AddQuestionModal";
import UploadResourceModal from "../components/UploadResourceModal";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal open states
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminService.getDashboard();
      setData(response);
    } catch (err) {
      console.error("Error fetching admin dashboard stats:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load admin dashboard statistics. Please ensure your backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleModalSuccess = () => {
    fetchDashboardData();
  };

  const displayName = user?.fullName || user?.Fullname || user?.name || user?.email || "Admin";

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[12px] text-[var(--text-secondary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
            <span className="font-medium text-[var(--text-primary)]">Admin Control Center</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-[var(--accent-success)]">Role: Administrator</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)] tracking-tight">
            Platform Overview<span className="text-[var(--accent-coral)]">.</span>
          </h1>

          <p className="text-[14px] text-[var(--text-secondary)]">
            Welcome back, <strong className="text-[var(--text-primary)] font-medium">{displayName}</strong>. Here is the real-time operational summary of the preparation platform.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-secondary text-[13px] flex items-center gap-2"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link to="/student-dashboard" className="btn-primary text-[13px]">
            Candidate View
          </Link>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-[13px]">{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="text-[12px] font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Quick Action Creation Bar */}
      <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--accent-coral)]" />
            <span className="text-[13px] font-medium text-[var(--text-primary)]">
              Quick Content Creation Actions
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-secondary)]">Instant CRUD creation modals</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsFacultyModalOpen(true)}
            className="btn-secondary !h-[34px] text-[12px] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
            <span>Add Faculty</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSubjectModalOpen(true)}
            className="btn-secondary !h-[34px] text-[12px] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
            <span>Add Subject</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChapterModalOpen(true)}
            className="btn-secondary !h-[34px] text-[12px] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
            <span>Add Chapter</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQuestionModalOpen(true)}
            className="btn-primary !h-[34px] text-[12px] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-secondary !h-[34px] text-[12px] flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
            <span>Upload Resource</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-8 animate-pulse">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]" />
            ))}
          </div>
          <div className="h-44 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]" />
          <div className="h-72 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]" />
        </div>
      )}

      {data && (
        <>
          {/* Section 1: Overview Statistics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl text-[var(--text-primary)]">
                System Metrics
              </h2>
              <span className="text-[12px] text-[var(--text-secondary)]">Live Platform Counts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <AdminStatCard
                title="Students"
                value={data.totalStudents}
                icon={GraduationCap}
                subtitle="Enrolled candidates"
                link="/faculties"
                badge="Active"
                badgeColor="text-[var(--accent-success)] bg-[var(--accent-success)]/10"
              />

              <AdminStatCard
                title="Questions"
                value={data.totalQuestions}
                icon={HelpCircle}
                subtitle="Syllabus MCQs"
                link="/questions"
              />

              <AdminStatCard
                title="Subjects"
                value={data.totalSubjects}
                icon={BookOpen}
                subtitle="Curriculum subjects"
                link="/subjects"
              />

              <AdminStatCard
                title="Chapters"
                value={data.totalChapters}
                icon={FolderTree}
                subtitle="Topic modules"
                link="/chapters"
              />

              <AdminStatCard
                title="Mock Exams"
                value={data.totalExams}
                icon={Award}
                subtitle="Published tests"
                link="/exams"
              />

              <AdminStatCard
                title="Study Notes"
                value={data.totalMaterials}
                icon={FileText}
                subtitle="PDF documents"
                link="/study-materials"
              />
            </div>
          </div>

          {/* Section 2: User Management Overview */}
          <div className="card-minimal p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl text-[var(--text-primary)]">
                    User Accounts & Roles
                  </h3>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    Total registered platform accounts and role distribution
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] font-mono px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  Total Accounts: {data.userManagement?.totalUsers || 0}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[11px] text-[var(--text-secondary)] uppercase font-medium">All Users</span>
                <p className="font-editorial text-3xl text-[var(--text-primary)] font-semibold">
                  {data.userManagement?.totalUsers || 0}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Registered platform participants</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[11px] text-[var(--text-secondary)] uppercase font-medium">Student Candidates</span>
                <p className="font-editorial text-3xl text-[var(--accent-success)] font-semibold">
                  {data.userManagement?.totalStudents || data.totalStudents || 0}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">License examinees</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-1">
                <span className="text-[11px] text-[var(--text-secondary)] uppercase font-medium">Administrators</span>
                <p className="font-editorial text-3xl text-[var(--accent-coral)] font-semibold">
                  {data.userManagement?.totalAdmins || 0}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">Platform moderators & staff</p>
              </div>
            </div>
          </div>

          {/* Section 3: Content Management Modules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-2xl text-[var(--text-primary)]">
                Content Management Hub
              </h2>
              <span className="text-[12px] text-[var(--text-secondary)]">Curriculum & Learning Resources</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <ManagementCard
                title="Faculties & Disciplines"
                description="Manage engineering faculties (Civil, Computer, Electrical, Mechanical, etc.) and discipline syllabus structures."
                count={data.totalFaculties}
                countLabel="faculties"
                link="/faculties"
                icon={Layers}
                actionText="View Faculties"
                onAddClick={() => setIsFacultyModalOpen(true)}
                addText="Add Faculty"
              />

              <ManagementCard
                title="Subjects Curriculum"
                description="Inspect all subject modules, credit mappings, and associated syllabus chapters."
                count={data.totalSubjects}
                countLabel="subjects"
                link="/subjects"
                icon={BookOpen}
                actionText="Manage Subjects"
                onAddClick={() => setIsSubjectModalOpen(true)}
                addText="Add Subject"
              />

              <ManagementCard
                title="Chapters & Topics"
                description="Organize unit topics, chapter descriptions, and mapped multiple-choice questions."
                count={data.totalChapters}
                countLabel="chapters"
                link="/chapters"
                icon={FolderTree}
                actionText="Manage Chapters"
                onAddClick={() => setIsChapterModalOpen(true)}
                addText="Add Chapter"
              />

              <ManagementCard
                title="Question Bank"
                description="Review syllabus MCQs, verify answer keys, options, explanations, and difficulty ratings."
                count={data.totalQuestions}
                countLabel="MCQs"
                link="/questions"
                icon={HelpCircle}
                actionText="Explore Question Bank"
                highlight={true}
                onAddClick={() => setIsQuestionModalOpen(true)}
                addText="Add Question"
              />

              <ManagementCard
                title="Mock Examinations"
                description="Configure timed mock exams, passing benchmark thresholds, and duration constraints."
                count={data.totalExams}
                countLabel="exams"
                link="/exams"
                icon={Award}
                actionText="View Mock Exams"
              />

              <ManagementCard
                title="PDF Study Materials"
                description="Upload and manage syllabus PDF resources, formula handbooks, and reference notes."
                count={data.totalMaterials}
                countLabel="PDFs"
                link="/study-materials"
                icon={FileText}
                actionText="Manage Study Notes"
                onAddClick={() => setIsUploadModalOpen(true)}
                addText="Upload PDF"
              />

              <ManagementCard
                title="Video Tutorials"
                description="Curate YouTube and external video lecture tutorials linked to chapters and subjects."
                count={data.totalVideoResources}
                countLabel="videos"
                link="/video-resources"
                icon={Video}
                actionText="Manage Video Links"
              />
            </div>
          </div>

          {/* Section 4: Exam Analytics & Performance */}
          <div className="space-y-4">
            <AnalyticsCard examStatistics={data.examStatistics} />
          </div>
        </>
      )}

      {/* Creation Modals */}
      <AddFacultyModal
        isOpen={isFacultyModalOpen}
        onClose={() => setIsFacultyModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <AddSubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <AddChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <AddQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      <UploadResourceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

    </div>
  );
};

export default AdminDashboard;

