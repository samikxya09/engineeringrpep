const express = require("express");
const router = express.Router();

const {
    getAllFaculties,
    getSubjectsByFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
} = require("../Controllers/facultyController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Public routes for faculties and subjects
router.get("/", getAllFaculties);
router.get("/:facultyId/subjects", getSubjectsByFaculty);

// Admin-Only Routes
router.post("/", authenticateToken, authorizeRole("admin"), createFaculty);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateFaculty);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteFaculty);

module.exports = router;

