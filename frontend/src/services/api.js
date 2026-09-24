import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

/**
 * Reusable Axios instance configured for the Nepal Engineering License Prep Backend.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Request Interceptor: Automatically attach JWT token to all outgoing requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || localStorage.getItem("nec_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor: Handle errors gracefully
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("nec_token");
    }
    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authService = {
  login: async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

// Faculty Service Endpoints
export const facultyService = {
  getAll: async () => {
    const response = await api.get("/api/faculties");
    return response.data;
  },
  getById: async (facultyId) => {
    const response = await api.get(`/api/faculties/${facultyId}`);
    return response.data;
  },
  getSubjects: async (facultyId) => {
    const response = await api.get(`/api/faculties/${facultyId}/subjects`);
    return response.data;
  },
  getExams: async (facultyId) => {
    const response = await api.get(`/api/faculties/${facultyId}/exams`);
    return response.data;
  },
  create: async (facultyData) => {
    const response = await api.post("/api/faculties", facultyData);
    return response.data;
  },
  update: async (facultyId, facultyData) => {
    const response = await api.put(`/api/faculties/${facultyId}`, facultyData);
    return response.data;
  },
  delete: async (facultyId) => {
    const response = await api.delete(`/api/faculties/${facultyId}`);
    return response.data;
  },
};

// Subject Service Endpoints
export const subjectService = {
  getAll: async (params = {}) => {
    const response = await api.get("/api/subjects", { params });
    return response.data;
  },
  getById: async (subjectId) => {
    const response = await api.get(`/api/subjects/${subjectId}`);
    return response.data;
  },
  getChapters: async (subjectId) => {
    const response = await api.get(`/api/subjects/${subjectId}/chapters`);
    return response.data;
  },
  getStudyMaterials: async (subjectId) => {
    const response = await api.get(`/api/subjects/${subjectId}/study-materials`);
    return response.data;
  },
  getVideoResources: async (subjectId) => {
    const response = await api.get(`/api/subjects/${subjectId}/video-resources`);
    return response.data;
  },
  create: async (subjectData) => {
    const response = await api.post("/api/subjects", subjectData);
    return response.data;
  },
  update: async (subjectId, subjectData) => {
    const response = await api.put(`/api/subjects/${subjectId}`, subjectData);
    return response.data;
  },
  delete: async (subjectId) => {
    const response = await api.delete(`/api/subjects/${subjectId}`);
    return response.data;
  },
};

// Chapter Service Endpoints
export const chapterService = {
  getAll: async (params = {}) => {
    const response = await api.get("/api/chapters", { params });
    return response.data;
  },
  getById: async (chapterId) => {
    const response = await api.get(`/api/chapters/${chapterId}`);
    return response.data;
  },
  getQuestions: async (chapterId) => {
    const response = await api.get(`/api/chapters/${chapterId}/questions`);
    return response.data;
  },
  getVideoResources: async (chapterId) => {
    const response = await api.get(`/api/chapters/${chapterId}/video-resources`);
    return response.data;
  },
  create: async (chapterData) => {
    const response = await api.post("/api/chapters", chapterData);
    return response.data;
  },
  update: async (chapterId, chapterData) => {
    const response = await api.put(`/api/chapters/${chapterId}`, chapterData);
    return response.data;
  },
  delete: async (chapterId) => {
    const response = await api.delete(`/api/chapters/${chapterId}`);
    return response.data;
  },
};

// Question Service Endpoints
export const questionService = {
  getAll: async (params = {}) => {
    const response = await api.get("/api/questions", { params });
    return response.data;
  },
  search: async (params = {}) => {
    const response = await api.get("/api/questions/search", { params });
    return response.data;
  },
  getRandom: async (params = {}) => {
    const response = await api.get("/api/questions/random", { params });
    return response.data;
  },
  getById: async (questionId) => {
    const response = await api.get(`/api/questions/${questionId}`);
    return response.data;
  },
  create: async (questionData) => {
    const response = await api.post("/api/questions", questionData);
    return response.data;
  },
  update: async (questionId, questionData) => {
    const response = await api.put(`/api/questions/${questionId}`, questionData);
    return response.data;
  },
  delete: async (questionId) => {
    const response = await api.delete(`/api/questions/${questionId}`);
    return response.data;
  },
};

// Exam & Attempt Service Endpoints
export const examService = {
  getAll: async () => {
    const response = await api.get("/api/exams");
    return response.data;
  },
  getById: async (examId) => {
    const response = await api.get(`/api/exams/${examId}`);
    return response.data;
  },
  startAttempt: async (examId) => {
    const response = await api.post(`/api/exams/${examId}/start`);
    return response.data;
  },
  submitAttempt: async (attemptId, answers) => {
    const response = await api.post(`/api/exams/attempts/${attemptId}/submit`, { answers });
    return response.data;
  },
};

// Result & Analytics Service Endpoints
export const resultService = {
  getMyResults: async (params = {}) => {
    const response = await api.get("/api/results", { params });
    return response.data;
  },
  getResultDetails: async (attemptId) => {
    const response = await api.get(`/api/results/${attemptId}`);
    return response.data;
  },
  getAnalytics: async () => {
    const response = await api.get("/api/results/analytics");
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await api.get("/api/results/leaderboard");
    return response.data;
  },
};

// Bookmark Service Endpoints
export const bookmarkService = {
  getMyBookmarks: async (params = {}) => {
    const response = await api.get("/api/bookmarks", { params });
    return response.data;
  },
  add: async (questionId) => {
    const response = await api.post("/api/bookmarks", { questionId });
    return response.data;
  },
  remove: async (questionId) => {
    const response = await api.delete(`/api/bookmarks/${questionId}`);
    return response.data;
  },
};

// Study Material (PDF) Service Endpoints
export const studyMaterialService = {
  getAll: async (params = {}) => {
    const response = await api.get("/api/study-materials", { params });
    return response.data;
  },
  search: async (params = {}) => {
    const response = await api.get("/api/study-materials/search", { params });
    return response.data;
  },
  getById: async (materialId) => {
    const response = await api.get(`/api/study-materials/${materialId}`);
    return response.data;
  },
  download: async (materialId) => {
    const response = await api.get(`/api/study-materials/${materialId}/download`, {
      responseType: "blob",
    });
    return response;
  },
  upload: async (formData) => {
    const response = await api.post("/api/study-materials", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  create: async (formData) => {
    const response = await api.post("/api/study-materials", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  update: async (materialId, formData) => {
    const response = await api.put(`/api/study-materials/${materialId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  delete: async (materialId) => {
    const response = await api.delete(`/api/study-materials/${materialId}`);
    return response.data;
  },
};

// Video Resource Service Endpoints
export const videoResourceService = {
  getAll: async (params = {}) => {
    const response = await api.get("/api/video-resources", { params });
    return response.data;
  },
  search: async (params = {}) => {
    const response = await api.get("/api/video-resources/search", { params });
    return response.data;
  },
  getById: async (videoId) => {
    const response = await api.get(`/api/video-resources/${videoId}`);
    return response.data;
  },
};

// User & Dashboard Service Endpoints
export const userService = {
  getDashboard: async () => {
    const response = await api.get("/api/user/dashboard");
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/api/user/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put("/api/user/profile", data);
    return response.data;
  },
  changePassword: async (passwords) => {
    const response = await api.put("/api/user/change-password", passwords);
    return response.data;
  },
};

// Admin Service Endpoints (Role: admin only)
export const adminService = {
  getDashboard: async () => {
    const response = await api.get("/api/admin/dashboard");
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get("/api/user/admin/all");
    return response.data;
  },
  getExamStatistics: async () => {
    const response = await api.get("/api/results/admin/statistics");
    return response.data;
  },
  getAllExamResults: async () => {
    const response = await api.get("/api/results/admin/all");
    return response.data;
  },
};

export default api;



