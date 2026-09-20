const express = require("express");
const router = express.Router();

const {
    getAllExams,
    getExamById,
    startExam,
    submitExam,
    getExamHistory,
    createExam,
    updateExam,
    deleteExam,
} = require("../Controllers/examController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Student / Public Exam Routes
router.get("/", getAllExams);
router.get("/history", authenticateToken, getExamHistory);
router.get("/:id", getExamById);

// Student Exam Execution (Protected by Auth)
router.post("/:examId/start", authenticateToken, startExam);
router.post("/:attemptId/submit", authenticateToken, submitExam);

// Admin Exam Management Routes (Protected by Auth + Admin Role)
router.post("/", authenticateToken, authorizeRole("admin"), createExam);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateExam);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteExam);

module.exports = router;
