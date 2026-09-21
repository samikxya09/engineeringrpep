import React from "react";
import { Routes, Route } from "react-router-dom";

// Page Imports
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import StudentDashboard from "../pages/StudentDashboard";
import Faculties from "../pages/Faculties";
import Subjects from "../pages/Subjects";
import Chapters from "../pages/Chapters";
import QuestionsPractice from "../pages/QuestionsPractice";
import Exams from "../pages/Exams";
import ExamSession from "../pages/ExamSession";
import ExamResult from "../pages/ExamResult";
import Bookmarks from "../pages/Bookmarks";
import StudyMaterials from "../pages/StudyMaterials";
import VideoResources from "../pages/VideoResources";
import AdminDashboard from "../pages/AdminDashboard";
import NotFound from "../pages/NotFound";

// Route Guards
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";
import AdminRoute from "../components/AdminRoute";

/**
 * AppRoutes Component
 * Centralizes all page routes with ProtectedRoute, GuestRoute, and AdminRoute guards.
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Explorer Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/faculties" element={<Faculties />} />
      <Route path="/faculties/:facultyId/subjects" element={<Subjects />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/subjects/:subjectId/chapters" element={<Chapters />} />
      <Route path="/chapters" element={<Chapters />} />
      <Route path="/questions" element={<QuestionsPractice />} />
      <Route path="/exams" element={<Exams />} />
      <Route path="/study-materials" element={<StudyMaterials />} />
      <Route path="/video-resources" element={<VideoResources />} />

      {/* Guest Only Routes (Redirects to /dashboard if already logged in) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* Protected Student / Candidate Routes */}
      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam/:examId/session"
        element={
          <ProtectedRoute>
            <ExamSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results/:attemptId"
        element={
          <ProtectedRoute>
            <ExamResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

