import React from "react";
import { User, Mail, GraduationCap, Building2, Shield, Calendar, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const name = user?.fullName || user?.name || user?.Fullname || "Candidate Engineer";
  const email = user?.email || "";
  const faculty = user?.faculty || "General Engineering";
  const college = user?.college || "Engineering Campus";
  const role = user?.role || "student";
  const joinedDate = user?.joinedDate || user?.createdAt;

  return (
    <div className="card-minimal p-6 sm:p-7 space-y-6 text-left transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] font-editorial text-2xl font-bold">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)]">
                {name}
              </h2>
              <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-[4px] uppercase tracking-wider ${
                role === "admin"
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              }`}>
                {role}
              </span>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> {email}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="btn-secondary !h-[36px] text-[12px] flex items-center gap-1.5 hover:text-red-500 self-start sm:self-auto"
          title="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
        <div className="space-y-1">
          <span className="text-[11px] text-[var(--text-secondary)] uppercase font-medium flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> Discipline
          </span>
          <p className="font-medium text-[var(--text-primary)] truncate">{faculty}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-[var(--text-secondary)] uppercase font-medium flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> College / Institute
          </span>
          <p className="font-medium text-[var(--text-primary)] truncate">{college}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-[var(--text-secondary)] uppercase font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Candidate Since
          </span>
          <p className="font-medium text-[var(--text-primary)]">
            {joinedDate ? new Date(joinedDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Active"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
