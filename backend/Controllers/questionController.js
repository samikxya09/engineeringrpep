const { Op, Sequelize } = require("sequelize");
const { questions, chapters, subjects, faculties, connection } = require("../database/connection");

/**
 * 1. Get All Questions (Student / Public)
 * GET /api/questions
 * Filters: ?chapterId=1&difficulty=easy&limit=20&page=1
 */
async function getAllQuestions(req, res) {
    try {
        const { chapterId, difficulty, limit = 50, page = 1 } = req.query;
        const whereClause = { isActive: true };

        if (chapterId && !isNaN(Number(chapterId))) {
            whereClause.chapterId = Number(chapterId);
        }

        if (difficulty) {
            whereClause.difficulty = difficulty.toLowerCase();
        }

        const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
        const parsedOffset = (Math.max(Number(page) || 1, 1) - 1) * parsedLimit;

        const { rows: questionList, count: totalCount } = await questions.findAndCountAll({
            where: whereClause,
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
                "createdAt",
            ],
            include: [
                {
                    model: chapters,
                    as: "chapter",
                    attributes: ["id", "chapterNumber", "name", "subjectId"],
                    include: [
                        {
                            model: subjects,
                            as: "subject",
                            attributes: ["id", "name", "code"],
                        },
                    ],
                },
            ],
            limit: parsedLimit,
            offset: parsedOffset,
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            message: "Questions fetched successfully",
            totalCount,
            page: Number(page) || 1,
            limit: parsedLimit,
            questions: questionList,
        });
    } catch (error) {
        console.error("Error fetching questions:", error);
        return res.status(500).json({
            message: "Internal server error while fetching questions",
            error: error.message,
        });
    }
}

/**
 * 2. Get Questions By Chapter ID (Student / Public)
 * GET /api/chapters/:chapterId/questions
 */
async function getQuestionsByChapter(req, res) {
    try {
        const { chapterId } = req.params;

        if (!chapterId || isNaN(Number(chapterId))) {
            return res.status(400).json({
                message: "Invalid chapter ID. Chapter ID must be a valid number.",
            });
        }

        const chapter = await chapters.findByPk(Number(chapterId), {
            attributes: ["id", "chapterNumber", "name", "description", "subjectId"],
            include: [
                {
                    model: subjects,
                    as: "subject",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        if (!chapter) {
            return res.status(404).json({
                message: `Chapter with ID ${chapterId} not found`,
            });
        }

        const questionList = await questions.findAll({
            where: {
                chapterId: Number(chapterId),
                isActive: true,
            },
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
                "createdAt",
            ],
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            message: "Chapter questions retrieved successfully",
            chapter: {
                id: chapter.id,
                chapterNumber: chapter.chapterNumber,
                name: chapter.name,
                subject: chapter.subject,
            },
            count: questionList.length,
            questions: questionList,
        });
    } catch (error) {
        console.error("Error fetching questions for chapter:", error);
        return res.status(500).json({
            message: "Internal server error while fetching chapter questions",
            error: error.message,
        });
    }
}

/**
 * 3. Get Random Questions for Practice & Mock Exams (Student / Public)
 * GET /api/questions/random?subjectId=1&chapterId=1&difficulty=medium&limit=10
 */
async function getRandomQuestions(req, res) {
    try {
        const { subjectId, chapterId, difficulty, limit = 10 } = req.query;
        const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

        const whereClause = { isActive: true };

        if (chapterId && !isNaN(Number(chapterId))) {
            whereClause.chapterId = Number(chapterId);
        }

        if (difficulty) {
            whereClause.difficulty = difficulty.toLowerCase();
        }

        const includeClause = [
            {
                model: chapters,
                as: "chapter",
                attributes: ["id", "chapterNumber", "name", "subjectId"],
                where: subjectId && !isNaN(Number(subjectId)) ? { subjectId: Number(subjectId) } : undefined,
                include: [
                    {
                        model: subjects,
                        as: "subject",
                        attributes: ["id", "name", "code"],
                    },
                ],
            },
        ];

        const randomQuestions = await questions.findAll({
            where: whereClause,
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
            include: includeClause,
            order: connection.random ? connection.random() : [Sequelize.literal("RANDOM()")],
            limit: parsedLimit,
        });

        return res.status(200).json({
            message: "Random questions fetched successfully",
            count: randomQuestions.length,
            questions: randomQuestions,
        });
    } catch (error) {
        console.error("Error fetching random questions:", error);
        return res.status(500).json({
            message: "Internal server error while fetching random questions",
            error: error.message,
        });
    }
}

/**
 * 4. Search Questions (Student / Public)
 * GET /api/questions/search?q=fluid&subjectId=1&chapterId=2
 */
async function searchQuestions(req, res) {
    try {
        const { q, query, search, subjectId, chapterId, difficulty, limit = 30 } = req.query;
        const searchTerm = (q || query || search || "").trim();

        const whereClause = { isActive: true };

        if (searchTerm) {
            whereClause.questionText = {
                [Op.iLike || Op.like]: `%${searchTerm}%`,
            };
        }

        if (chapterId && !isNaN(Number(chapterId))) {
            whereClause.chapterId = Number(chapterId);
        }

        if (difficulty) {
            whereClause.difficulty = difficulty.toLowerCase();
        }

        const includeClause = [
            {
                model: chapters,
                as: "chapter",
                attributes: ["id", "chapterNumber", "name", "subjectId"],
                where: subjectId && !isNaN(Number(subjectId)) ? { subjectId: Number(subjectId) } : undefined,
                include: [
                    {
                        model: subjects,
                        as: "subject",
                        attributes: ["id", "name", "code"],
                    },
                ],
            },
        ];

        const results = await questions.findAll({
            where: whereClause,
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
            include: includeClause,
            limit: Math.min(Math.max(Number(limit) || 30, 1), 100),
            order: [["id", "ASC"]],
        });

        return res.status(200).json({
            message: "Question search completed",
            searchTerm,
            count: results.length,
            questions: results,
        });
    } catch (error) {
        console.error("Error searching questions:", error);
        return res.status(500).json({
            message: "Internal server error while searching questions",
            error: error.message,
        });
    }
}

/**
 * Get Question Details By ID (Student / Public)
 * GET /api/questions/:id
 */
async function getQuestionById(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid question ID. ID must be a valid number.",
            });
        }

        const question = await questions.findOne({
            where: { id: Number(id), isActive: true },
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
                "createdAt",
                "updatedAt",
            ],
            include: [
                {
                    model: chapters,
                    as: "chapter",
                    attributes: ["id", "chapterNumber", "name", "subjectId"],
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
                message: `Question with ID ${id} not found`,
            });
        }

        return res.status(200).json({
            message: "Question retrieved successfully",
            question,
        });
    } catch (error) {
        console.error("Error fetching question by ID:", error);
        return res.status(500).json({
            message: "Internal server error while fetching question",
            error: error.message,
        });
    }
}

/**
 * 5. Create Question (Admin Only)
 * POST /api/questions
 */
async function createQuestion(req, res) {
    try {
        const {
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            explanation,
            difficulty,
            chapterId,
        } = req.body;

        // 1. Validate required fields
        if (!questionText || !questionText.trim()) {
            return res.status(400).json({ message: "Question text is required" });
        }

        if (!optionA || !optionB || !optionC || !optionD) {
            return res.status(400).json({
                message: "All 4 options (optionA, optionB, optionC, optionD) are required",
            });
        }

        if (!correctAnswer || !["A", "B", "C", "D"].includes(correctAnswer.toUpperCase().trim())) {
            return res.status(400).json({
                message: "Correct answer must be one of 'A', 'B', 'C', or 'D'",
            });
        }

        if (!chapterId || isNaN(Number(chapterId))) {
            return res.status(400).json({
                message: "Valid chapter ID (chapterId) is required",
            });
        }

        // 2. Verify target chapter exists
        const chapter = await chapters.findByPk(Number(chapterId));
        if (!chapter) {
            return res.status(404).json({
                message: `Chapter with ID ${chapterId} does not exist. Cannot create question under a non-existent chapter.`,
            });
        }

        // 3. Create question
        const newQuestion = await questions.create({
            questionText: questionText.trim(),
            optionA: optionA.trim(),
            optionB: optionB.trim(),
            optionC: optionC.trim(),
            optionD: optionD.trim(),
            correctAnswer: correctAnswer.toUpperCase().trim(),
            explanation: explanation ? explanation.trim() : null,
            difficulty: difficulty ? difficulty.toLowerCase().trim() : "medium",
            chapterId: Number(chapterId),
            isActive: true,
        });

        const createdQuestion = await questions.findByPk(newQuestion.id, {
            include: [
                {
                    model: chapters,
                    as: "chapter",
                    attributes: ["id", "name", "subjectId"],
                },
            ],
        });

        return res.status(201).json({
            message: "Question created successfully",
            question: createdQuestion,
        });
    } catch (error) {
        console.error("Error creating question:", error);
        return res.status(500).json({
            message: "Internal server error while creating question",
            error: error.message,
        });
    }
}

/**
 * 6. Update Question (Admin Only)
 * PUT /api/questions/:id
 */
async function updateQuestion(req, res) {
    try {
        const { id } = req.params;
        const {
            questionText,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer,
            explanation,
            difficulty,
            chapterId,
            isActive,
        } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid question ID. ID must be a valid number.",
            });
        }

        const question = await questions.findByPk(Number(id));
        if (!question) {
            return res.status(404).json({
                message: `Question with ID ${id} not found`,
            });
        }

        // If updating chapterId, verify target chapter exists
        if (chapterId !== undefined) {
            if (isNaN(Number(chapterId))) {
                return res.status(400).json({
                    message: "Invalid chapter ID provided",
                });
            }
            const chapter = await chapters.findByPk(Number(chapterId));
            if (!chapter) {
                return res.status(404).json({
                    message: `Chapter with ID ${chapterId} does not exist`,
                });
            }
            question.chapterId = Number(chapterId);
        }

        if (questionText !== undefined && questionText.trim()) {
            question.questionText = questionText.trim();
        }

        if (optionA !== undefined && optionA.trim()) question.optionA = optionA.trim();
        if (optionB !== undefined && optionB.trim()) question.optionB = optionB.trim();
        if (optionC !== undefined && optionC.trim()) question.optionC = optionC.trim();
        if (optionD !== undefined && optionD.trim()) question.optionD = optionD.trim();

        if (correctAnswer !== undefined) {
            if (!["A", "B", "C", "D"].includes(correctAnswer.toUpperCase().trim())) {
                return res.status(400).json({
                    message: "Correct answer must be 'A', 'B', 'C', or 'D'",
                });
            }
            question.correctAnswer = correctAnswer.toUpperCase().trim();
        }

        if (explanation !== undefined) {
            question.explanation = explanation ? explanation.trim() : null;
        }

        if (difficulty !== undefined) {
            question.difficulty = difficulty.toLowerCase().trim();
        }

        if (isActive !== undefined) {
            question.isActive = Boolean(isActive);
        }

        await question.save();

        const updatedQuestion = await questions.findByPk(question.id, {
            include: [
                {
                    model: chapters,
                    as: "chapter",
                    attributes: ["id", "name", "subjectId"],
                },
            ],
        });

        return res.status(200).json({
            message: "Question updated successfully",
            question: updatedQuestion,
        });
    } catch (error) {
        console.error("Error updating question:", error);
        return res.status(500).json({
            message: "Internal server error while updating question",
            error: error.message,
        });
    }
}

/**
 * 7. Delete Question (Admin Only)
 * DELETE /api/questions/:id
 */
async function deleteQuestion(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid question ID. ID must be a valid number.",
            });
        }

        const question = await questions.findByPk(Number(id));
        if (!question) {
            return res.status(404).json({
                message: `Question with ID ${id} not found`,
            });
        }

        await question.destroy();

        return res.status(200).json({
            message: `Question (ID: ${id}) deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting question:", error);
        return res.status(500).json({
            message: "Internal server error while deleting question",
            error: error.message,
        });
    }
}

module.exports = {
    getAllQuestions,
    getQuestionsByChapter,
    getRandomQuestions,
    searchQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
};
