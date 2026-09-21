const {
    users,
    faculties,
    subjects,
    chapters,
    questions,
    exams,
    examAttempts,
    studyMaterials,
    videoResources,
} = require("../database/connection");

/**
 * Get Admin Dashboard Statistics
 * GET /api/admin/dashboard
 * Access: Admin only (Requires authenticateToken + authorizeRole("admin"))
 */
async function getAdminDashboardStats(req, res) {
    try {
        // Parallel aggregation of all entity counts
        const [
            totalUsers,
            totalStudents,
            totalAdmins,
            totalFaculties,
            totalSubjects,
            totalChapters,
            totalQuestions,
            totalExams,
            totalMaterials,
            totalVideos,
            allAttempts,
        ] = await Promise.all([
            users.count(),
            users.count({ where: { role: "student" } }),
            users.count({ where: { role: "admin" } }),
            faculties.count(),
            subjects.count(),
            chapters.count(),
            questions.count(),
            exams.count(),
            studyMaterials.count(),
            videoResources.count(),
            examAttempts.findAll({
                attributes: ["id", "score", "percentage", "status"],
                include: [
                    {
                        model: exams,
                        as: "exam",
                        attributes: ["passingMarks", "totalMarks"],
                    },
                ],
            }),
        ]);

        const totalAttempts = allAttempts.length;
        const completedAttempts = allAttempts.filter(a => a.status === "completed");

        let totalScoreSum = 0;
        let totalPercentageSum = 0;
        let totalPassed = 0;

        completedAttempts.forEach(att => {
            totalScoreSum += Number(att.score || 0);
            totalPercentageSum += Number(att.percentage || 0);

            const passingMarks = att.exam?.passingMarks || 50;
            if (Number(att.score || 0) >= passingMarks || Number(att.percentage || 0) >= 50) {
                totalPassed++;
            }
        });

        const averageScore = completedAttempts.length > 0
            ? Math.round((totalScoreSum / completedAttempts.length) * 100) / 100
            : 0;

        const averagePercentage = completedAttempts.length > 0
            ? Math.round((totalPercentageSum / completedAttempts.length) * 100) / 100
            : 0;

        const passPercentage = completedAttempts.length > 0
            ? Math.round((totalPassed / completedAttempts.length) * 100 * 100) / 100
            : 0;

        return res.status(200).json({
            message: "Admin dashboard statistics retrieved successfully",
            totalStudents,
            totalQuestions,
            totalSubjects,
            totalChapters,
            totalExams,
            totalMaterials,
            totalFaculties,
            totalVideoResources: totalVideos,
            userManagement: {
                totalUsers,
                totalStudents,
                totalAdmins,
            },
            examStatistics: {
                totalAttempts,
                completedAttempts: completedAttempts.length,
                averageScore,
                averagePercentage,
                passPercentage,
                totalPassed,
                totalFailed: completedAttempts.length - totalPassed,
            },
        });
    } catch (error) {
        console.error("Error retrieving admin dashboard statistics:", error);
        return res.status(500).json({
            message: "Internal server error while fetching admin dashboard data",
            error: error.message,
        });
    }
}

module.exports = {
    getAdminDashboardStats,
};
