const {
    examAttempts,
    examAnswers,
    exams,
    questions,
    users,
} = require("../database/connection");

/**
 * Format time difference in seconds to a human-readable string (e.g. '15m 30s')
 */
function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
}

/**
 * 1. Get My Exam Results (Student)
 * GET /api/results
 */
async function getMyResults(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated",
            });
        }

        const userAttempts = await examAttempts.findAll({
            where: { userId: Number(userId) },
            attributes: [
                "id",
                "examId",
                "startTime",
                "endTime",
                "totalQuestions",
                "correctCount",
                "incorrectCount",
                "unansweredCount",
                "score",
                "percentage",
                "status",
                "createdAt",
            ],
            include: [
                {
                    model: exams,
                    as: "exam",
                    attributes: ["id", "title", "type", "duration", "totalMarks", "passingMarks"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedResults = userAttempts.map(item => {
            const passingMarks = item.exam?.passingMarks || 50;
            const isPassed = item.exam
                ? item.score >= passingMarks
                : item.percentage >= 50;

            let timeTakenSeconds = null;
            if (item.startTime && item.endTime) {
                timeTakenSeconds = Math.max(0, Math.round((new Date(item.endTime) - new Date(item.startTime)) / 1000));
            }

            return {
                attemptId: item.id,
                examId: item.examId,
                examTitle: item.exam?.title || "Exam",
                examType: item.exam?.type || "mock",
                date: item.createdAt,
                score: item.score,
                percentage: item.percentage,
                isPassed,
                status: item.status,
                totalQuestions: item.totalQuestions,
                correctCount: item.correctCount,
                incorrectCount: item.incorrectCount,
                unansweredCount: item.unansweredCount,
                timeTakenSeconds,
                timeTakenFormatted: formatDuration(timeTakenSeconds),
            };
        });

        return res.status(200).json({
            message: "Exam results retrieved successfully",
            count: formattedResults.length,
            results: formattedResults,
        });
    } catch (error) {
        console.error("Error fetching my exam results:", error);
        return res.status(500).json({
            message: "Internal server error while fetching exam results",
            error: error.message,
        });
    }
}

/**
 * 2. Get Single Attempt Result & Detailed Review (Student / Admin)
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
                    attributes: [
                        "id",
                        "title",
                        "type",
                        "duration",
                        "totalQuestions",
                        "totalMarks",
                        "passingMarks",
                        "description",
                    ],
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

        let timeTakenSeconds = null;
        if (attempt.startTime && attempt.endTime) {
            timeTakenSeconds = Math.max(0, Math.round((new Date(attempt.endTime) - new Date(attempt.startTime)) / 1000));
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

        const passingMarks = attempt.exam?.passingMarks || 50;
        const isPassed = attempt.exam
            ? attempt.score >= passingMarks
            : attempt.percentage >= 50;

        return res.status(200).json({
            message: "Result retrieved successfully",
            result: {
                attemptId: attempt.id,
                exam: attempt.exam || {
                    id: attempt.examId,
                    title: "Exam",
                    type: "mock",
                },
                examTitle: attempt.exam?.title || "Exam",
                totalQuestions: attempt.totalQuestions,
                correctAnswers: attempt.correctCount,
                wrongAnswers: attempt.incorrectCount,
                unansweredQuestions: attempt.unansweredCount,
                score: attempt.score,
                percentage: attempt.percentage,
                isPassed,
                timeTaken: timeTakenSeconds,
                timeTakenSeconds,
                timeTakenFormatted: formatDuration(timeTakenSeconds),
                startTime: attempt.startTime,
                endTime: attempt.endTime,
                status: attempt.status,
                date: attempt.createdAt,
                questionReview: formattedAnswers,
                answers: formattedAnswers, // backward compatibility alias
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
 * 3. Student Dashboard Analytics
 * GET /api/results/dashboard
 */
async function getDashboardAnalytics(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated",
            });
        }

        const attempts = await examAttempts.findAll({
            where: { userId: Number(userId) },
            attributes: [
                "id",
                "examId",
                "score",
                "percentage",
                "totalQuestions",
                "correctCount",
                "incorrectCount",
                "unansweredCount",
                "status",
                "createdAt",
            ],
            include: [
                {
                    model: exams,
                    as: "exam",
                    attributes: ["id", "title", "passingMarks", "totalMarks"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const completedAttempts = attempts.filter(a => a.status === "completed");
        const totalExamsAttempted = completedAttempts.length;

        let totalQuestionsAnswered = 0;
        let totalScoreSum = 0;
        let highestScore = 0;
        let lowestScore = totalExamsAttempted > 0 ? completedAttempts[0].score : 0;
        let totalPassed = 0;

        completedAttempts.forEach((att, index) => {
            const answeredInAttempt = (att.correctCount || 0) + (att.incorrectCount || 0);
            totalQuestionsAnswered += answeredInAttempt;

            totalScoreSum += att.score;

            if (index === 0) {
                highestScore = att.score;
                lowestScore = att.score;
            } else {
                if (att.score > highestScore) highestScore = att.score;
                if (att.score < lowestScore) lowestScore = att.score;
            }

            const passingMarks = att.exam?.passingMarks || 50;
            if (att.score >= passingMarks) {
                totalPassed++;
            }
        });

        const averageScore = totalExamsAttempted > 0
            ? Math.round((totalScoreSum / totalExamsAttempted) * 100) / 100
            : 0;

        const passRate = totalExamsAttempted > 0
            ? Math.round((totalPassed / totalExamsAttempted) * 100 * 100) / 100
            : 0;

        const recentAttempts = attempts.slice(0, 5).map(att => ({
            attemptId: att.id,
            examId: att.examId,
            examTitle: att.exam?.title || "Exam",
            score: att.score,
            percentage: att.percentage,
            status: att.status,
            date: att.createdAt,
        }));

        return res.status(200).json({
            message: "Dashboard analytics retrieved successfully",
            analytics: {
                totalExamsAttempted,
                totalQuestionsAnswered,
                averageScore,
                highestScore,
                lowestScore,
                overallProgress: {
                    totalAttempts: attempts.length,
                    completedExams: totalExamsAttempted,
                    passedExams: totalPassed,
                    failedExams: totalExamsAttempted - totalPassed,
                    passRate,
                    averageScore,
                    highestScore,
                    lowestScore,
                    totalQuestionsAnswered,
                },
                recentAttempts,
            },
        });
    } catch (error) {
        console.error("Error generating dashboard analytics:", error);
        return res.status(500).json({
            message: "Internal server error while generating dashboard analytics",
            error: error.message,
        });
    }
}

/**
 * 4. Admin View Overall Statistics
 * GET /api/admin/results/statistics (or /api/results/admin/statistics)
 */
async function getAdminStatistics(req, res) {
    try {
        // Total students count
        const totalStudents = await users.count({
            where: { role: "student" },
        });

        // Total exams count
        const totalExams = await exams.count();

        // Total attempts count
        const allAttempts = await examAttempts.findAll({
            attributes: ["id", "score", "percentage", "status"],
            include: [
                {
                    model: exams,
                    as: "exam",
                    attributes: ["passingMarks", "totalMarks"],
                },
            ],
        });

        const totalAttempts = allAttempts.length;
        const completedAttempts = allAttempts.filter(a => a.status === "completed");

        let totalScoreSum = 0;
        let totalPercentageSum = 0;
        let totalPassed = 0;

        completedAttempts.forEach(att => {
            totalScoreSum += att.score || 0;
            totalPercentageSum += att.percentage || 0;

            const passingMarks = att.exam?.passingMarks || 50;
            if (att.score >= passingMarks) {
                totalPassed++;
            }
        });

        const averageScore = completedAttempts.length > 0
            ? Math.round((totalScoreSum / completedAttempts.length) * 100) / 100
            : 0;

        const averagePercentage = completedAttempts.length > 0
            ? Math.round((totalPercentageSum / completedAttempts.length) * 100) / 100
            : 0;

        const passRate = completedAttempts.length > 0
            ? Math.round((totalPassed / completedAttempts.length) * 100 * 100) / 100
            : 0;

        return res.status(200).json({
            message: "Overall platform statistics retrieved successfully",
            statistics: {
                totalStudents,
                totalExams,
                totalAttempts,
                completedAttempts: completedAttempts.length,
                averageScore,
                averagePercentage,
                passRate,
                totalPassed,
                totalFailed: completedAttempts.length - totalPassed,
            },
        });
    } catch (error) {
        console.error("Error generating admin statistics:", error);
        return res.status(500).json({
            message: "Internal server error while generating admin statistics",
            error: error.message,
        });
    }
}

/**
 * 5. Get All Student Results (Admin Only)
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
                "incorrectCount",
                "unansweredCount",
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
    getMyResults,
    getSingleResult,
    getDashboardAnalytics,
    getAdminStatistics,
    getAllResults,
};
