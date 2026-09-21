const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const {
    users,
    examAttempts,
    exams,
    bookmarks,
    questions,
    chapters,
    subjects,
    faculties,
} = require("../database/connection");

/**
 * Get User Information / Profile
 * GET /api/user/profile
 */
async function getUserProfile(req, res) {
    try {
        const userId = req.user?.id || req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID not found",
            });
        }

        const user = await users.findByPk(userId, {
            attributes: ["id", "Fullname", "email", "faculty", "college", "role", "createdAt", "updatedAt"],
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User information fetched successfully",
            user: {
                id: user.id,
                name: user.Fullname,
                fullName: user.Fullname,
                Fullname: user.Fullname,
                email: user.email,
                faculty: user.faculty,
                college: user.college,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

/**
 * Update User Profile
 * PUT /api/user/profile
 */
async function updateProfile(req, res) {
    try {
        const userId = req.user?.id || req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID not found",
            });
        }

        const { fullName, Fullname, name, email, faculty, college } = req.body;
        const nameToUpdate = fullName || Fullname || name;

        const user = await users.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // If updating email, ensure it's not already taken by another user
        if (email && email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
            const existingUser = await users.findOne({
                where: {
                    email: email.toLowerCase().trim(),
                    id: { [Op.ne]: userId },
                },
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "Email is already taken by another account",
                });
            }
            user.email = email.toLowerCase().trim();
        }

        if (nameToUpdate) {
            user.Fullname = nameToUpdate.trim();
        }

        if (faculty) {
            user.faculty = faculty;
        }

        if (college !== undefined) {
            user.college = college ? college.trim() : null;
        }

        // Note: 'role' is intentionally excluded to prevent unauthorized privilege escalation
        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                name: user.Fullname,
                fullName: user.Fullname,
                Fullname: user.Fullname,
                email: user.email,
                faculty: user.faculty,
                college: user.college,
                role: user.role,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

/**
 * Change User Password
 * PUT /api/user/change-password
 */
async function changePassword(req, res) {
    try {
        const userId = req.user?.id || req.params.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID not found",
            });
        }

        const { oldPassword, currentPassword, newPassword, confirmPassword } = req.body;
        const currentPass = oldPassword || currentPassword;

        if (!currentPass || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
            });
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password do not match",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long",
            });
        }

        // Find user with password to compare
        const user = await users.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(currentPass, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect current password",
            });
        }

        // Check if new password is same as old password
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({
                message: "New password cannot be the same as the current password",
            });
        }

        // Hash new password and save
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

/**
 * Get Student Dashboard Statistics
 * GET /api/user/dashboard
 */
async function getDashboardStats(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User ID not found in token",
            });
        }

        const user = await users.findByPk(userId, {
            attributes: ["id", "Fullname", "email", "faculty", "college", "role", "createdAt"],
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Retrieve student's completed exam history to calculate real statistics
        const completedAttempts = await examAttempts.findAll({
            where: { userId: Number(userId), status: "completed" },
            include: [
                {
                    model: exams,
                    as: "exam",
                    attributes: ["id", "title", "type", "totalQuestions", "totalMarks", "passingMarks", "duration", "facultyId"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Retrieve student's bookmarks with associated question & chapter & subject
        const userBookmarks = await bookmarks.findAll({
            where: { userId: Number(userId) },
            include: [
                {
                    model: questions,
                    as: "question",
                    attributes: ["id", "questionText", "difficulty", "chapterId"],
                    include: [
                        {
                            model: chapters,
                            as: "chapter",
                            attributes: ["id", "name", "subjectId"],
                            include: [
                                {
                                    model: subjects,
                                    as: "subject",
                                    attributes: ["id", "name", "code"],
                                },
                            ],
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const totalExamsAttempted = completedAttempts.length;
        const totalQuestionsAnswered = completedAttempts.reduce(
            (sum, a) => sum + ((a.correctCount || 0) + (a.incorrectCount || 0)),
            0
        );
        const totalScore = completedAttempts.reduce((sum, a) => sum + Number(a.score || 0), 0);
        const averageScore = totalExamsAttempted > 0 ? Math.round((totalScore / totalExamsAttempted) * 100) / 100 : 0;
        const highestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => Number(a.score) || 0)) : 0;
        const passedBenchmarkExams = completedAttempts.filter(
            a => Number(a.percentage) >= 50 || a.status?.toLowerCase() === "passed"
        ).length;

        // Latest Exam Result
        const latestExamResult = completedAttempts.length > 0 ? {
            attemptId: completedAttempts[0].id,
            examTitle: completedAttempts[0].exam?.title || "Mock Exam",
            score: completedAttempts[0].score,
            percentage: completedAttempts[0].percentage,
            status: Number(completedAttempts[0].percentage) >= 50 ? "Passed" : "Failed",
            date: completedAttempts[0].createdAt,
        } : null;

        // Recent Exams list
        const recentExams = completedAttempts.slice(0, 5).map(att => ({
            attemptId: att.id,
            examId: att.exam?.id || null,
            examTitle: att.exam?.title || "Mock Exam",
            examType: att.exam?.type || "mock",
            score: att.score,
            percentage: att.percentage,
            status: Number(att.percentage) >= 50 ? "Passed" : "Failed",
            date: att.createdAt,
        }));

        // Recent Bookmarks list
        const recentBookmarks = userBookmarks.slice(0, 5).map(b => ({
            id: b.id,
            questionId: b.questionId,
            questionText: b.question?.questionText || "Question",
            difficulty: b.question?.difficulty || "medium",
            chapterName: b.question?.chapter?.name || null,
            subjectName: b.question?.chapter?.subject?.name || null,
            date: b.createdAt,
        }));

        // Distinct subjects studied count
        const studiedSubjectIds = new Set();
        userBookmarks.forEach(b => {
            if (b.question?.chapter?.subjectId) {
                studiedSubjectIds.add(b.question.chapter.subjectId);
            }
        });

        const dashboardData = {
            user: {
                id: user.id,
                name: user.Fullname,
                fullName: user.Fullname,
                email: user.email,
                faculty: user.faculty,
                college: user.college,
                role: user.role,
                joinedDate: user.createdAt,
            },
            examStatistics: {
                totalExamsAttempted,
                averageScore,
                highestScore,
                passedBenchmarkExams,
                latestExamResult,
            },
            learningStatistics: {
                questionsAttempted: totalQuestionsAnswered,
                questionsBookmarked: userBookmarks.length,
                subjectsStudied: studiedSubjectIds.size,
                passedBenchmarkExams,
            },
            recentActivity: {
                recentExams,
                recentBookmarks,
            },
        };

        return res.status(200).json({
            message: "Dashboard data retrieved successfully",
            data: dashboardData,
        });
    } catch (error) {
        console.error("Error retrieving dashboard statistics:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

/**
 * Get All Users (Admin Only)
 * GET /api/user/admin/all
 */
async function getAllUsers(req, res) {
    try {
        const allUsers = await users.findAll({
            attributes: ["id", "Fullname", "email", "faculty", "college", "role", "createdAt"],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            message: "All users retrieved successfully (Admin Access)",
            count: allUsers.length,
            users: allUsers,
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

module.exports = {
    getUserProfile,
    updateProfile,
    changePassword,
    getDashboardStats,
    getAllUsers,
};
