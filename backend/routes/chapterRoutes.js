const express = require("express");
const router = express.Router();

const {
    getAllChapters,
    getChaptersBySubject,
    getChapterById,
    createChapter,
    updateChapter,
    deleteChapter,
} = require("../Controllers/chapterController");
const { getQuestionsByChapter } = require("../Controllers/questionController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Student / Public Routes (Viewing data)
router.get("/", getAllChapters);
router.get("/:id", getChapterById);
router.get("/subject/:subjectId", getChaptersBySubject);
router.get("/:chapterId/questions", getQuestionsByChapter);

// Admin-Only Routes (Protected by JWT Authentication + Admin Role)
router.post("/", authenticateToken, authorizeRole("admin"), createChapter);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateChapter);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteChapter);

module.exports = router;
