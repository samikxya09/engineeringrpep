const { Op } = require("sequelize");
const {
    bookmarks,
    questions,
    chapters,
    subjects,
    users,
} = require("../database/connection");

/**
 * 1. Add Bookmark
 * POST /api/bookmarks
 * Body: { questionId: 1 }
 */
async function addBookmark(req, res) {
    try {
        const userId = req.user?.id;
        const { questionId } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: Please log in to bookmark questions",
            });
        }

        if (!questionId || isNaN(Number(questionId))) {
            return res.status(400).json({
                message: "A valid numeric questionId is required",
            });
        }

        // Verify that the question exists
        const question = await questions.findByPk(Number(questionId), {
            include: [
                {
                    model: chapters,
                    as: "chapter",
                    attributes: ["id", "name"],
                    include: [
                        {
                            model: subjects,
                            as: "subject",
                            attributes: ["id", "name", "code"],
                        },
                    ],
                },
            ],
        });

        if (!question) {
            return res.status(404).json({
                message: `Question with ID ${questionId} not found`,
            });
        }

        // Prevent duplicate bookmarks for the same user and question
        const existingBookmark = await bookmarks.findOne({
            where: {
                userId: Number(userId),
                questionId: Number(questionId),
            },
        });

        if (existingBookmark) {
            return res.status(409).json({
                message: "Question is already in your bookmarks",
                bookmark: existingBookmark,
            });
        }

        const newBookmark = await bookmarks.create({
            userId: Number(userId),
            questionId: Number(questionId),
        });

        return res.status(201).json({
            message: "Question bookmarked successfully",
            bookmark: {
                id: newBookmark.id,
                userId: newBookmark.userId,
                questionId: newBookmark.questionId,
                question: {
                    id: question.id,
                    questionText: question.questionText,
                    difficulty: question.difficulty,
                    chapter: question.chapter || null,
                    subject: question.chapter?.subject || null,
                },
                createdAt: newBookmark.createdAt,
            },
        });
    } catch (error) {
        // Handle database-level unique constraint error if encountered concurrently
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Question is already in your bookmarks",
            });
        }
        console.error("Error adding bookmark:", error);
        return res.status(500).json({
            message: "Internal server error while adding bookmark",
            error: error.message,
        });
    }
}

/**
 * 2. Get My Bookmarks
 * GET /api/bookmarks
 */
async function getMyBookmarks(req, res) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: Please log in to view your bookmarks",
            });
        }

        const userBookmarks = await bookmarks.findAll({
            where: { userId: Number(userId) },
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
                        "chapterId",
                    ],
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

        const formattedBookmarks = userBookmarks.map(b => ({
            bookmarkId: b.id,
            questionId: b.questionId,
            questionText: b.question?.questionText || "Question deleted or unavailable",
            optionA: b.question?.optionA,
            optionB: b.question?.optionB,
            optionC: b.question?.optionC,
            optionD: b.question?.optionD,
            correctAnswer: b.question?.correctAnswer,
            explanation: b.question?.explanation,
            difficulty: b.question?.difficulty,
            chapter: b.question?.chapter ? {
                id: b.question.chapter.id,
                name: b.question.chapter.name,
            } : null,
            subject: b.question?.chapter?.subject ? {
                id: b.question.chapter.subject.id,
                name: b.question.chapter.subject.name,
                code: b.question.chapter.subject.code,
            } : null,
            bookmarkedAt: b.createdAt,
            createdAt: b.createdAt,
        }));

        return res.status(200).json({
            message: "Bookmarked questions retrieved successfully",
            count: formattedBookmarks.length,
            bookmarks: formattedBookmarks,
        });
    } catch (error) {
        console.error("Error retrieving user bookmarks:", error);
        return res.status(500).json({
            message: "Internal server error while retrieving bookmarks",
            error: error.message,
        });
    }
}

/**
 * 3. Remove Bookmark
 * DELETE /api/bookmarks/:questionId
 * (Supports deletion by questionId or bookmark ID)
 */
async function removeBookmark(req, res) {
    try {
        const userId = req.user?.id;
        const { questionId } = req.params;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: Please log in to remove bookmarks",
            });
        }

        if (!questionId || isNaN(Number(questionId))) {
            return res.status(400).json({
                message: "A valid numeric questionId (or bookmark ID) is required",
            });
        }

        // Find bookmark for this authenticated user by questionId or bookmark primary ID
        const bookmark = await bookmarks.findOne({
            where: {
                userId: Number(userId),
                [Op.or]: [
                    { questionId: Number(questionId) },
                    { id: Number(questionId) },
                ],
            },
        });

        if (!bookmark) {
            return res.status(404).json({
                message: `Bookmark for question ID ${questionId} not found in your bookmarks`,
            });
        }

        await bookmark.destroy();

        return res.status(200).json({
            message: "Bookmark removed successfully",
            removedQuestionId: bookmark.questionId,
            bookmarkId: bookmark.id,
        });
    } catch (error) {
        console.error("Error removing bookmark:", error);
        return res.status(500).json({
            message: "Internal server error while removing bookmark",
            error: error.message,
        });
    }
}

module.exports = {
    addBookmark,
    getMyBookmarks,
    removeBookmark,
};
