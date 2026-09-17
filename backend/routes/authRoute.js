const express = require("express");
const router = express.Router();

const { register, login, getProfile } = require("../Controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Authentication Routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getProfile);
router.get("/profile", authenticateToken, getProfile);

module.exports = router;
