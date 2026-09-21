const express = require("express");
const router = express.Router();

const {
    getMyResults,
    getSingleResult,
    getDashboardAnalytics,
    getAdminStatistics,
    getAllResults,
} = require("../Controllers/resultController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Student Routes
router.get("/", authenticateToken, getMyResults);
router.get("/dashboard", authenticateToken, getDashboardAnalytics);

// Admin Routes (Static routes defined before dynamic :attemptId parameter)
router.get("/admin/statistics", authenticateToken, authorizeRole("admin"), getAdminStatistics);
router.get("/statistics", authenticateToken, authorizeRole("admin"), getAdminStatistics);
router.get("/admin/all", authenticateToken, authorizeRole("admin"), getAllResults);
router.get("/all", authenticateToken, authorizeRole("admin"), getAllResults);

// Single Attempt Result & Detailed Review (Owner student or Admin)
router.get("/:attemptId", authenticateToken, getSingleResult);

module.exports = router;

