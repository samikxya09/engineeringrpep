import React, { useState, useEffect } from "react";
import { X, BookOpen, AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { facultyService, subjectService } from "../services/api";

const AddSubjectModal = ({ isOpen, onClose, onSuccess, defaultFacultyId = "", availableFaculties = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    facultyId: defaultFacultyId || "",
    description: "",
  });
  const [faculties, setFaculties] = useState(availableFaculties || []);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load faculties if not provided
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        facultyId: defaultFacultyId || prev.facultyId || "",
      }));
      setError("");
      setSuccessMsg("");

      if (!availableFaculties || availableFaculties.length === 0) {
        const fetchFaculties = async () => {
          try {
            setLoadingFaculties(true);
            const res = await facultyService.getAll();
            const list = res.faculties || res.data || (Array.isArray(res) ? res : []);
            setFaculties(list);
            if (!defaultFacultyId && list.length > 0 && !formData.facultyId) {
              setFormData((prev) => ({ ...prev, facultyId: list[0].id }));
            }
          } catch (err) {
            console.error("Error loading faculties for subject modal:", err);
          } finally {
            setLoadingFaculties(false);
          }
        };
        fetchFaculties();
      } else {
        setFaculties(availableFaculties);
      }
    }
  }, [isOpen, defaultFacultyId, availableFaculties]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Subject name is required.");
      return;
    }
    if (!formData.facultyId) {
      setError("Please select a faculty/discipline for this subject.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const response = await subjectService.create({
        name: formData.name.trim(),
        code: formData.code.trim() || undefined,
        facultyId: Number(formData.facultyId),
        description: formData.description.trim() || undefined,
      });

      setSuccessMsg("Subject created successfully!");
      setFormData({
        name: "",
        code: "",
        facultyId: defaultFacultyId || (faculties[0]?.id || ""),
        description: "",
      });

      if (onSuccess) {
        onSuccess(response.subject || response);
      }

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error creating subject:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create subject. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-left transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-coral)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
                Add New Subject
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Create a curriculum subject under an engineering faculty
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
              Discipline / Faculty <span className="text-[var(--accent-coral)]">*</span>
            </label>
            <select
              name="facultyId"
              value={formData.facultyId}
              onChange={handleChange}
              disabled={loading || loadingFaculties}
              required
              className="input-minimal text-[13px] bg-[var(--bg-surface)] cursor-pointer"
            >
              <option value="">Select Faculty...</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.code ? `(${f.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Subject Name <span className="text-[var(--accent-coral)]">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Structural Analysis, Database Management Systems"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
              className="input-minimal text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Subject Code / Course Number
            </label>
            <input
              type="text"
              name="code"
              placeholder="e.g. CE501, CT602, EE401"
              value={formData.code}
              onChange={handleChange}
              disabled={loading}
              className="input-minimal text-[13px] font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Description / Course Outline
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Overview of syllabus units, core competencies, and reference topics..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              className="input-minimal !h-auto py-2.5 text-[13px] resize-none"
            />
          </div>

          {/* Actions */}
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
                  <span>Add Subject</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubjectModal;
