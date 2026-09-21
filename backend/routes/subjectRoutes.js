const express = require("express");
const router = express.Router();

const {
    getAllSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
} = require("../Controllers/subjectController");
const { getChaptersBySubject } = require("../Controllers/chapterController");
const { getMaterialsBySubject } = require("../Controllers/studyMaterialController");
const { getVideosBySubject } = require("../Controllers/videoResourceController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Student / Public Routes (Viewing data)
router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.get("/:subjectId/chapters", getChaptersBySubject);
router.get("/:subjectId/study-materials", getMaterialsBySubject);
router.get("/:subjectId/video-resources", getVideosBySubject);

// Admin-Only Routes (Protected by JWT Authentication + Admin Role)
router.post("/", authenticateToken, authorizeRole("admin"), createSubject);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateSubject);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteSubject);

module.exports = router;
