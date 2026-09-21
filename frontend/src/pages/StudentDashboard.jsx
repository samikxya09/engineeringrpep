import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Timer,
  Award,
  Bookmark,
  Target,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { userService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ProfileCard from "../components/ProfileCard";
import StatCard from "../components/StatCard";
import LearningProgress from "../components/LearningProgress";
import RecentActivity from "../components/RecentActivity";
import QuickActions from "../components/QuickActions";

const StudentDashboard = () => {
  const { user: authUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await userService.getDashboard();
      setDashboardData(res.data || res);
    } catch (err) {
      console.error("Error loading student dashboard:", err);
      setError("Failed to load dashboard statistics. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const user = dashboardData?.user || authUser;
  const examStats = dashboardData?.examStatistics || {};
  const learningStats = dashboardData?.learningStatistics || {};
  const recentActivity = dashboardData?.recentActivity || {};

  const totalExams = examStats.totalExamsAttempted || 0;
  const avgScore = examStats.averageScore || 0;
  const highestScore = examStats.highestScore || 0;
  const latestResult = examStats.latestExamResult;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* 1. Profile Section */}
      <ProfileCard user={user} />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboard}
            className="btn-secondary !py-1 text-[12px] flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* 2. Exam Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Exams Attempted"
          value={loading ? "..." : totalExams}
          detail="Timed NEC model tests"
          icon={Timer}
          badge={totalExams > 0 ? `${totalExams} Total` : "No attempts"}
          badgeColor="emerald"
        />

        <StatCard
          label="Average Score"
          value={loading ? "..." : `${avgScore}%`}
          detail="NEC Passing Benchmark: 50%"
          icon={Award}
          badge={avgScore >= 50 && totalExams > 0 ? "Passing Grade" : totalExams > 0 ? "Below Benchmark" : "Benchmark"}
          badgeColor={avgScore >= 50 && totalExams > 0 ? "emerald" : "amber"}
        />

        <StatCard
          label="Highest Score"
          value={loading ? "..." : highestScore}
          detail="Top attempt performance"
          icon={Target}
          badge="Personal Best"
          badgeColor="emerald"
        />

        <StatCard
          label="Latest Exam Result"
          value={loading ? "..." : latestResult ? `${latestResult.score} Marks` : "N/A"}
          detail={latestResult ? `${latestResult.percentage}% • ${latestResult.status}` : "Take your first test"}
          icon={Bookmark}
          badge={latestResult ? latestResult.status : "Pending"}
          badgeColor={latestResult?.status?.toLowerCase() === "passed" ? "emerald" : "rose"}
        />
      </div>

      {/* 3. Quick Actions */}
      <QuickActions />

      {/* 4. Learning Progress */}
      <LearningProgress
        learningStatistics={learningStats}
        examStatistics={examStats}
      />

      {/* 5. Recent Activity */}
      <RecentActivity
        recentExams={recentActivity.recentExams || []}
        recentBookmarks={recentActivity.recentBookmarks || []}
      />

    </div>
  );
};

export default StudentDashboard;
