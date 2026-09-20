const express = require("express");
const router = express.Router();

const {
    getAllQuestions,
    getQuestionsByChapter,
    getRandomQuestions,
    searchQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
} = require("../Controllers/questionController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Student / Public Routes (Viewing, Practicing, Searching)
router.get("/", getAllQuestions);
router.get("/random", getRandomQuestions);
router.get("/search", searchQuestions);
router.get("/chapter/:chapterId", getQuestionsByChapter);
router.get("/:id", getQuestionById);

// Admin-Only Routes (Protected by JWT Authentication + Admin Role)
router.post("/", authenticateToken, authorizeRole("admin"), createQuestion);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateQuestion);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteQuestion);

module.exports = router;
