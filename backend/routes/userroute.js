const express = require("express");
const router = express.Router();

const { 
    getUserProfile, 
    updateProfile, 
    changePassword, 
    getDashboardStats, 
    getAllUsers 
} = require("../Controllers/userController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Protected User Management Routes (Any authenticated user)
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);
router.get("/dashboard", authenticateToken, getDashboardStats);

// Admin-Only Protected Route (Requires valid token AND role === "admin")
router.get("/admin/all", authenticateToken, authorizeRole("admin"), getAllUsers);

module.exports = router;
