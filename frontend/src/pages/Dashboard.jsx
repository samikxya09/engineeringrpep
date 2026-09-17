import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut, GraduationCap, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.fullName || user?.Fullname || user?.name || "Candidate Engineer";
  const userFaculty = user?.faculty || "General Engineering";
  const userEmail = user?.email || "";
  const userCollege = user?.college || "Engineering Campus";

  const stats = [
    { label: "Mock Exams Taken", value: "8", detail: "Latest: Yesterday" },
    { label: "Average Score", value: "68%", detail: "+4% from last week" },
    { label: "Highest Score", value: "82/100", detail: "Discipline Full Test" },
    { label: "Council Readiness", value: "Passing", detail: "Benchmark: 50%" },
  ];

  const recentExams = [
    { id: 1, name: "NEC Full Mock Exam #3", stream: userFaculty, score: "74/100", time: "2h 00m", status: "Passed" },
    { id: 2, name: "Section A: General Engineering Test", stream: "Common", score: "48/60", time: "1h 10m", status: "Passed" },
    { id: 3, name: "Core Engineering Concepts Module", stream: userFaculty, score: "18/25", time: "30m", status: "Passed" },
  ];

  const topicMastery = [
    { title: "Core Engineering Principles", percentage: 75, count: "120 MCQs" },
    { title: "Applied Mathematics & Physics", percentage: 60, count: "90 MCQs" },
    { title: "Discipline Core Specialization", percentage: 85, count: "110 MCQs" },
    { title: "Standard Codes & Specifications (NBC/IS)", percentage: 55, count: "80 MCQs" },
    { title: "Professional Ethics & Project Management", percentage: 90, count: "50 MCQs" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-10 text-[var(--text-primary)] text-left transition-colors duration-200">
      
      {/* 1. Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-success)]" />
            <span>Candidate Portal • {userFaculty}</span>
          </div>
          <h1 className="font-editorial text-4xl sm:text-5xl text-[var(--text-primary)]">
            Welcome, {displayName}<span className="text-[var(--accent-coral)]">.</span>
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)]">
            {userEmail} {userCollege ? `• ${userCollege}` : ""}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert("Mock exam simulator will launch once question set is chosen!")}
            className="btn-primary"
          >
            Start full mock exam
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleLogout}
            className="btn-secondary text-[var(--text-secondary)] hover:text-red-500"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="card-minimal p-5 space-y-2">
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">
              {stat.label}
            </span>
            <p className="font-editorial text-3xl text-[var(--text-primary)]">
              {stat.value}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {stat.detail}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Tests (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl text-[var(--text-primary)]">
              Recent Mock Tests
            </h2>
            <span className="btn-link text-[12px]">
              View all results →
            </span>
          </div>

          <div className="space-y-3">
            {recentExams.map((test) => (
              <div
                key={test.id}
                className="card-minimal p-4 flex items-center justify-between hover:border-[var(--text-primary)] transition-colors"
              >
                <div className="space-y-1">
                  <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
                    {test.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                    <span>{test.stream}</span>
                    <span>•</span>
                    <span>{test.time}</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="font-editorial text-lg text-[var(--text-primary)]">
                    {test.score}
                  </span>
                  <div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-[4px] bg-[var(--bg-canvas)] border border-[var(--border-color)] text-[var(--accent-success)]">
                      {test.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exam Regulation Note */}
          <div className="card-minimal p-4 space-y-1 text-[13px]">
            <p className="font-medium text-[var(--text-primary)]">Nepal Engineering Council Exam Structure</p>
            <p className="text-[var(--text-secondary)] text-[12px] leading-relaxed">
              Total 100 objective questions (Section A: 60 marks, Section B: 40 marks). Minimum 50 marks required with no negative marking.
            </p>
          </div>
        </div>

        {/* Right Column: Topic Mastery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-editorial text-2xl text-[var(--text-primary)]">
            Topic Mastery
          </h2>

          <div className="card-minimal p-5 space-y-4">
            {topicMastery.map((topic, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[var(--text-primary)] font-medium truncate max-w-[200px]">{topic.title}</span>
                  <span className="text-[var(--text-secondary)] font-mono">{topic.percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-canvas)] rounded-full overflow-hidden border border-[var(--border-color)]">
                  <div
                    className="h-full bg-[var(--text-primary)] transition-all duration-300"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-[var(--border-color)]">
              <Link to="/" className="btn-secondary w-full text-center">
                Explore full question bank
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
