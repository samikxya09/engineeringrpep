const express = require("express");
const router = express.Router();

const { getAdminDashboardStats } = require("../Controllers/adminController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Admin Dashboard Summary (Role: admin only)
router.get("/dashboard", authenticateToken, authorizeRole("admin"), getAdminDashboardStats);

module.exports = router;
