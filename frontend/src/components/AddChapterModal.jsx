import React, { useState, useEffect } from "react";
import { X, FolderTree, AlertCircle, CheckCircle2, Loader2, Plus } from "lucide-react";
import { subjectService, chapterService, facultyService } from "../services/api";

const AddChapterModal = ({ isOpen, onClose, onSuccess, defaultSubjectId = "", availableSubjects = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    subjectId: defaultSubjectId || "",
    chapterNumber: "",
    description: "",
  });
  const [subjects, setSubjects] = useState(availableSubjects || []);
  const [faculties, setFaculties] = useState([]);
  const [filterFacultyId, setFilterFacultyId] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load faculties & subjects
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        subjectId: defaultSubjectId || prev.subjectId || "",
      }));
      setError("");
      setSuccessMsg("");

      const loadInitialData = async () => {
        try {
          setLoadingSubjects(true);
          const [subRes, facRes] = await Promise.all([
            subjectService.getAll(),
            facultyService.getAll().catch(() => ({ faculties: [] })),
          ]);
          const subList = subRes.subjects || subRes.data || (Array.isArray(subRes) ? subRes : []);
          const facList = facRes.faculties || facRes.data || (Array.isArray(facRes) ? facRes : []);
          setSubjects(subList);
          setFaculties(facList);

          if (!defaultSubjectId && subList.length > 0 && !formData.subjectId) {
            setFormData((prev) => ({ ...prev, subjectId: subList[0].id }));
          }
        } catch (err) {
          console.error("Error loading subjects/faculties for chapter modal:", err);
        } finally {
          setLoadingSubjects(false);
        }
      };

      if (!availableSubjects || availableSubjects.length === 0 || !defaultSubjectId) {
        loadInitialData();
      } else {
        setSubjects(availableSubjects);
      }
    }
  }, [isOpen, defaultSubjectId, availableSubjects]);

  if (!isOpen) return null;

  const filteredSubjects = filterFacultyId
    ? subjects.filter((s) => Number(s.facultyId) === Number(filterFacultyId))
    : subjects;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Chapter name is required.");
      return;
    }
    if (!formData.subjectId) {
      setError("Please select a subject for this chapter.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const response = await chapterService.create({
        name: formData.name.trim(),
        subjectId: Number(formData.subjectId),
        chapterNumber: formData.chapterNumber ? Number(formData.chapterNumber) : undefined,
        description: formData.description.trim() || undefined,
      });

      setSuccessMsg("Chapter created successfully!");
      setFormData({
        name: "",
        subjectId: defaultSubjectId || (subjects[0]?.id || ""),
        chapterNumber: "",
        description: "",
      });

      if (onSuccess) {
        onSuccess(response.chapter || response);
      }

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error creating chapter:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to create chapter. Please check your connection and try again."
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
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
                Add New Chapter
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Define a unit topic module under a curriculum subject
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
          {/* Faculty filter if multiple subjects exist */}
          {faculties.length > 0 && !defaultSubjectId && (
            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Filter by Faculty (Optional)
              </label>
              <select
                value={filterFacultyId}
                onChange={(e) => setFilterFacultyId(e.target.value)}
                disabled={loading}
                className="input-minimal text-[13px] bg-[var(--bg-surface)] cursor-pointer"
              >
                <option value="">All Faculties</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Subject <span className="text-[var(--accent-coral)]">*</span>
            </label>
            <select
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              disabled={loading || loadingSubjects}
              required
              className="input-minimal text-[13px] bg-[var(--bg-surface)] cursor-pointer"
            >
              <option value="">Select Subject...</option>
              {filteredSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ""} {s.faculty?.name ? `• ${s.faculty.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Chapter Name <span className="text-[var(--accent-coral)]">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Shear Force and Bending Moment"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
                className="input-minimal text-[13px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Chapter No.
              </label>
              <input
                type="number"
                name="chapterNumber"
                placeholder="e.g. 1"
                min="1"
                value={formData.chapterNumber}
                onChange={handleChange}
                disabled={loading}
                className="input-minimal text-[13px] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Description / Topic Breakdown
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Outline of concepts, formulas, unit derivations, and practice subtopics..."
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
                  <span>Add Chapter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChapterModal;
