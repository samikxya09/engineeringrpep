const {
    examAttempts,
    examAnswers,
    exams,
    questions,
    users,
} = require("../database/connection");

/**
 * 1. Get Single Attempt Result & Detailed Review (Student / Admin)
 * GET /api/results/:attemptId
 */
async function getSingleResult(req, res) {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const { attemptId } = req.params;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: Please log in to view results",
            });
        }

        if (!attemptId || isNaN(Number(attemptId))) {
            return res.status(400).json({
                message: "Invalid attempt ID. ID must be a valid number.",
            });
        }

        const attempt = await examAttempts.findByPk(Number(attemptId), {
            include: [
                {
                    model: exams,
                    as: "exam",
                    attributes: ["id", "title", "type", "duration", "totalMarks", "passingMarks"],
                },
                {
                    model: examAnswers,
                    as: "answers",
                    attributes: ["id", "questionId", "selectedAnswer", "isCorrect"],
                    include: [
                        {
                            model: questions,
                            as: "question",
                            attributes: [
                                "id",
                                "questionText",
                                "optionA",
                                "optionB",
                                "optionC",
                                "optionD",
                                "correctAnswer",
                                "explanation",
                                "difficulty",
                            ],
                        },
                    ],
                },
            ],
        });

        if (!attempt) {
            return res.status(404).json({
                message: `Exam attempt with ID ${attemptId} not found`,
            });
        }

        // Verify that the user owns this attempt or has admin rights
        if (attempt.userId !== Number(userId) && userRole !== "admin") {
            return res.status(403).json({
                message: "Forbidden: You are not authorized to view this result",
            });
        }

        const formattedAnswers = (attempt.answers || []).map(ans => ({
            questionId: ans.questionId,
            questionText: ans.question?.questionText || "Question deleted or unavailable",
            optionA: ans.question?.optionA,
            optionB: ans.question?.optionB,
            optionC: ans.question?.optionC,
            optionD: ans.question?.optionD,
            selectedAnswer: ans.selectedAnswer,
            correctAnswer: ans.question?.correctAnswer,
            isCorrect: ans.isCorrect,
            explanation: ans.question?.explanation,
            difficulty: ans.question?.difficulty,
        }));

        const isPassed = attempt.exam
            ? attempt.score >= (attempt.exam.passingMarks || 50)
            : attempt.percentage >= 50;

        return res.status(200).json({
            message: "Result retrieved successfully",
            result: {
                attemptId: attempt.id,
                examTitle: attempt.exam?.title || "Exam",
                examType: attempt.exam?.type || "mock",
                score: attempt.score,
                percentage: attempt.percentage,
                isPassed,
                totalQuestions: attempt.totalQuestions,
                correctCount: attempt.correctCount,
                incorrectCount: attempt.incorrectCount,
                unansweredCount: attempt.unansweredCount,
                startTime: attempt.startTime,
                endTime: attempt.endTime,
                status: attempt.status,
                answers: formattedAnswers,
            },
        });
    } catch (error) {
        console.error("Error fetching single result:", error);
        return res.status(500).json({
            message: "Internal server error while fetching result",
            error: error.message,
        });
    }
}

/**
 * 2. Get All Student Results (Admin Only)
 * GET /api/results/admin/all
 */
async function getAllResults(req, res) {
    try {
        const attemptList = await examAttempts.findAll({
            attributes: [
                "id",
                "userId",
                "examId",
                "startTime",
                "endTime",
                "totalQuestions",
                "correctCount",
                "score",
                "percentage",
                "status",
                "createdAt",
            ],
            include: [
                {
                    model: users,
                    as: "user",
                    attributes: ["id", "Fullname", "email", "faculty"],
                },
                {
                    model: exams,
                    as: "exam",
                    attributes: ["id", "title", "type", "totalMarks", "passingMarks"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            message: "All student exam attempts retrieved (Admin Access)",
            count: attemptList.length,
            attempts: attemptList,
        });
    } catch (error) {
        console.error("Error fetching all results for admin:", error);
        return res.status(500).json({
            message: "Internal server error while fetching all results",
            error: error.message,
        });
    }
}

module.exports = {
    getSingleResult,
    getAllResults,
};
