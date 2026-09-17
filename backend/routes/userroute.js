const express = require("express");
const router = express.Router();

const { getUserProfile, updateProfile, changePassword } = require("../Controllers/userController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protected User Management Routes
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateProfile);
router.put("/change-password", authenticateToken, changePassword);

module.exports = router;
