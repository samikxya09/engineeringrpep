import React, { useState, useEffect, useRef } from "react";
import { X, FileText, Upload, AlertCircle, CheckCircle2, Loader2, FileCheck } from "lucide-react";
import { facultyService, subjectService, chapterService, studyMaterialService } from "../services/api";

const UploadResourceModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultFacultyId = "",
  defaultSubjectId = "",
  defaultChapterId = "",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    facultyId: defaultFacultyId || "",
    subjectId: defaultSubjectId || "",
    chapterId: defaultChapterId || "",
  });
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Cascading dropdown states
  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load faculties on open
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        facultyId: defaultFacultyId || prev.facultyId || "",
        subjectId: defaultSubjectId || prev.subjectId || "",
        chapterId: defaultChapterId || prev.chapterId || "",
      }));
      setFile(null);
      setError("");
      setSuccessMsg("");

      const fetchFaculties = async () => {
        try {
          setLoadingFaculties(true);
          const res = await facultyService.getAll();
          const list = res.faculties || res.data || (Array.isArray(res) ? res : []);
          setFaculties(list);
        } catch (err) {
          console.warn("Failed to load faculties for upload modal:", err);
        } finally {
          setLoadingFaculties(false);
        }
      };
      fetchFaculties();
    }
  }, [isOpen, defaultFacultyId, defaultSubjectId, defaultChapterId]);

  // Load subjects when faculty changes
  useEffect(() => {
    if (isOpen) {
      const fetchSubjects = async () => {
        try {
          setLoadingSubjects(true);
          let subList = [];
          if (formData.facultyId) {
            const res = await facultyService.getSubjects(formData.facultyId);
            subList = res.subjects || res.data || (Array.isArray(res) ? res : []);
          } else {
            const res = await subjectService.getAll();
            subList = res.subjects || res.data || (Array.isArray(res) ? res : []);
          }
          setSubjects(subList);
        } catch (err) {
          console.warn("Failed to load subjects for upload modal:", err);
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchSubjects();
    }
  }, [isOpen, formData.facultyId]);

  // Load chapters when subject changes
  useEffect(() => {
    if (isOpen) {
      const fetchChapters = async () => {
        if (!formData.subjectId) {
          setChapters([]);
          return;
        }
        try {
          setLoadingChapters(true);
          const res = await subjectService.getChapters(formData.subjectId);
          const chList = res.chapters || res.data || (Array.isArray(res) ? res : []);
          setChapters(chList);
        } catch (err) {
          console.warn("Failed to load chapters for upload modal:", err);
        } finally {
          setLoadingChapters(false);
        }
      };
      fetchChapters();
    }
  }, [isOpen, formData.subjectId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "facultyId") {
      setFormData((prev) => ({
        ...prev,
        facultyId: value,
        subjectId: "",
        chapterId: "",
      }));
    } else if (name === "subjectId") {
      setFormData((prev) => ({
        ...prev,
        subjectId: value,
        chapterId: "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".pdf") && selectedFile.type !== "application/pdf") {
      setError("Only PDF documents (.pdf) are allowed.");
      return;
    }

    // 50MB size limit check
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File is too large. Maximum allowed size is 50MB.");
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Study material title is required.");
      return;
    }
    if (!formData.subjectId) {
      setError("Please select a subject for this resource.");
      return;
    }
    if (!file) {
      setError("Please choose a PDF file to upload.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");

      const uploadData = new FormData();
      uploadData.append("title", formData.title.trim());
      if (formData.description.trim()) {
        uploadData.append("description", formData.description.trim());
      }
      if (formData.facultyId) {
        uploadData.append("facultyId", formData.facultyId);
      }
      uploadData.append("subjectId", formData.subjectId);
      if (formData.chapterId) {
        uploadData.append("chapterId", formData.chapterId);
      }
      uploadData.append("pdf", file);

      const response = await studyMaterialService.upload(uploadData);

      setSuccessMsg("PDF Resource uploaded successfully!");
      setFormData((prev) => ({
        ...prev,
        title: "",
        description: "",
      }));
      setFile(null);

      if (onSuccess) {
        onSuccess(response.studyMaterial || response);
      }

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error uploading study material:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Failed to upload PDF resource. Please check file size and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-left transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-coral)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-editorial text-2xl text-[var(--text-primary)]">
                Upload PDF Resource
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Publish study notes, syllabus references, and formula handbooks
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
              Resource Title <span className="text-[var(--accent-coral)]">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Concrete Technology Formula Sheet & Design Charts"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              required
              className="input-minimal text-[13px]"
            />
          </div>

          {/* Hierarchy Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Faculty
              </label>
              <select
                name="facultyId"
                value={formData.facultyId}
                onChange={handleChange}
                disabled={loading || loadingFaculties}
                className="input-minimal text-[12px] bg-[var(--bg-surface)] cursor-pointer"
              >
                <option value="">All Disciplines...</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

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
                className="input-minimal text-[12px] bg-[var(--bg-surface)] cursor-pointer"
              >
                <option value="">Select Subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
                Chapter (Optional)
              </label>
              <select
                name="chapterId"
                value={formData.chapterId}
                onChange={handleChange}
                disabled={loading || loadingChapters || !formData.subjectId}
                className="input-minimal text-[12px] bg-[var(--bg-surface)] cursor-pointer disabled:opacity-50"
              >
                <option value="">All / General</option>
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>
                    Ch {c.chapterNumber || ""}: {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              Resource Description / Summary
            </label>
            <textarea
              name="description"
              rows={2}
              placeholder="Short description of document contents, unit coverage, and license exam relevance..."
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              className="input-minimal !h-auto py-2.5 text-[13px] resize-none"
            />
          </div>

          {/* PDF File Upload Drag & Drop Area */}
          <div>
            <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1.5">
              PDF Document File <span className="text-[var(--accent-coral)]">*</span>
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-[var(--accent-coral)] bg-[var(--accent-coral)]/5"
                  : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-[var(--border-color)] hover:border-[var(--text-primary)]/40 bg-[var(--bg-canvas)]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-center gap-3 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="w-7 h-7 shrink-0" />
                  <div className="text-left">
                    <p className="font-medium text-[13px] text-[var(--text-primary)] truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Upload className="w-6 h-6 mx-auto text-[var(--text-secondary)]" />
                  <p className="text-[13px] font-medium text-[var(--text-primary)]">
                    Click to select PDF or drag and drop here
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                    Supported: .PDF (Max 50MB)
                  </p>
                </div>
              )}
            </div>
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
              className="btn-primary text-[13px] min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Resource</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadResourceModal;
