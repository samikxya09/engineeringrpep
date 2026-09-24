import React, { useState } from "react";
import { X, Layers, AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { facultyService } from "../services/api";

const AddFacultyModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Faculty name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const response = await facultyService.create({
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      setSuccessMsg("Faculty created successfully!");
      setFormData({ name: "", code: "", description: "" });

      if (onSuccess) {
        onSuccess(response.faculty || response);
      }

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error creating faculty:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create faculty. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-left transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-coral)]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
                Add New Faculty
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Register a new engineering discipline or program
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-canvas)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[13px] flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Faculty / Discipline Name <span className="text-[var(--accent-coral)]">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Civil Engineering, Computer Engineering"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
              className="input-minimal text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Faculty Code / Abbreviation
            </label>
            <input
              type="text"
              name="code"
              placeholder="e.g. CE, BCT, ELE, MECH"
              value={formData.code}
              onChange={handleChange}
              disabled={loading}
              className="input-minimal text-[13px] font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Description / Syllabus Overview
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief description of the curriculum, syllabus structure, and license specifications..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              className="input-minimal !h-auto py-2.5 text-[13px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-[13px] min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Faculty</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyModal;
