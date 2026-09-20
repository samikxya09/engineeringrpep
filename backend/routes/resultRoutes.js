const express = require("express");
const router = express.Router();

const { getSingleResult, getAllResults } = require("../Controllers/resultController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Admin Overview Route (Must be declared before dynamic :attemptId route)
router.get("/admin/all", authenticateToken, authorizeRole("admin"), getAllResults);

// Single Attempt Result & Detailed Review
router.get("/:attemptId", authenticateToken, getSingleResult);

module.exports = router;
