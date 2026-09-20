const { chapters, subjects, faculties, connection } = require("../database/connection");

/**
 * 1. Get All Chapters (Student / Public)
 * GET /api/chapters
 * Supports optional subject filter: /api/chapters?subjectId=1
 */
async function getAllChapters(req, res) {
    try {
        const { subjectId } = req.query;
        const whereClause = { isActive: true };

        if (subjectId && !isNaN(Number(subjectId))) {
            whereClause.subjectId = Number(subjectId);
        }

        const chapterList = await chapters.findAll({
            where: whereClause,
            attributes: ["id", "chapterNumber", "name", "description", "subjectId", "isActive", "createdAt", "updatedAt"],
            include: [
                {
                    model: subjects,
                    as: "subject",
                    attributes: ["id", "name", "code", "facultyId"],
                    include: [
                        {
                            model: faculties,
                            as: "faculty",
                            attributes: ["id", "name", "code"],
                        },
                    ],
                },
            ],
            order: [
                ["subjectId", "ASC"],
                ["chapterNumber", "ASC"],
                ["name", "ASC"],
            ],
        });

        return res.status(200).json({
            message: "Chapters fetched successfully",
            count: chapterList.length,
            chapters: chapterList,
        });
    } catch (error) {
        console.error("Error fetching chapters:", error);
        return res.status(500).json({
            message: "Internal server error while fetching chapters",
            error: error.message,
        });
    }
}

/**
 * 2. Get Chapters By Subject ID (Student / Public)
 * GET /api/subjects/:subjectId/chapters or GET /api/chapters/subject/:subjectId
 */
async function getChaptersBySubject(req, res) {
    try {
        const { subjectId } = req.params;

        // 1. Validate subject ID
        if (!subjectId || isNaN(Number(subjectId))) {
            return res.status(400).json({
                message: "Invalid subject ID. Subject ID must be a valid number.",
            });
        }

        // 2. Check if the subject exists
        const subject = await subjects.findByPk(Number(subjectId), {
            attributes: ["id", "name", "code", "description", "facultyId"],
            include: [
                {
                    model: faculties,
                    as: "faculty",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        if (!subject) {
            return res.status(404).json({
                message: `Subject with ID ${subjectId} not found`,
            });
        }

        // 3. Find active chapters belonging to the subject
        const chapterList = await chapters.findAll({
            where: {
                subjectId: Number(subjectId),
                isActive: true,
            },
            attributes: ["id", "chapterNumber", "name", "description", "subjectId", "createdAt", "updatedAt"],
            order: [
                ["chapterNumber", "ASC"],
                ["name", "ASC"],
            ],
        });

        return res.status(200).json({
            message: "Chapters retrieved successfully",
            subject: {
                id: subject.id,
                name: subject.name,
                code: subject.code,
                faculty: subject.faculty,
            },
            count: chapterList.length,
            chapters: chapterList,
        });
    } catch (error) {
        console.error("Error fetching chapters for subject:", error);
        return res.status(500).json({
            message: "Internal server error while fetching subject chapters",
            error: error.message,
        });
    }
}

/**
 * 3. Get Chapter Details By ID (Student / Public)
 * GET /api/chapters/:id
 */
async function getChapterById(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid chapter ID. ID must be a valid number.",
            });
        }

        const chapter = await chapters.findOne({
            where: { id: Number(id), isActive: true },
            attributes: ["id", "chapterNumber", "name", "description", "subjectId", "isActive", "createdAt", "updatedAt"],
            include: [
                {
                    model: subjects,
                    as: "subject",
                    attributes: ["id", "name", "code", "description", "facultyId"],
                    include: [
                        {
                            model: faculties,
                            as: "faculty",
                            attributes: ["id", "name", "code"],
                        },
                    ],
                },
            ],
        });

        if (!chapter) {
            return res.status(404).json({
                message: `Chapter with ID ${id} not found`,
            });
        }

        return res.status(200).json({
            message: "Chapter details retrieved successfully",
            chapter,
        });
    } catch (error) {
        console.error("Error fetching chapter by ID:", error);
        return res.status(500).json({
            message: "Internal server error while fetching chapter",
            error: error.message,
        });
    }
}

/**
 * 4. Create Chapter (Admin Only)
 * POST /api/chapters
 */
async function createChapter(req, res) {
    try {
        const { name, description, subjectId, chapterNumber } = req.body;

        // 1. Validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Chapter name is required",
            });
        }

        if (!subjectId || isNaN(Number(subjectId))) {
            return res.status(400).json({
                message: "Valid subject ID (subjectId) is required",
            });
        }

        // 2. Verify target subject exists
        const subject = await subjects.findByPk(Number(subjectId));
        if (!subject) {
            return res.status(404).json({
                message: `Subject with ID ${subjectId} does not exist. Cannot create chapter under a non-existent subject.`,
            });
        }

        // 3. Create the chapter
        const newChapter = await chapters.create({
            name: name.trim(),
            description: description ? description.trim() : null,
            subjectId: Number(subjectId),
            chapterNumber: chapterNumber && !isNaN(Number(chapterNumber)) ? Number(chapterNumber) : null,
            isActive: true,
        });

        // 4. Return created record with associated subject info
        const createdChapter = await chapters.findByPk(newChapter.id, {
            include: [
                {
                    model: subjects,
                    as: "subject",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        return res.status(201).json({
            message: "Chapter created successfully",
            chapter: createdChapter,
        });
    } catch (error) {
        console.error("Error creating chapter:", error);
        return res.status(500).json({
            message: "Internal server error while creating chapter",
            error: error.message,
        });
    }
}

/**
 * 5. Update Chapter (Admin Only)
 * PUT /api/chapters/:id
 */
async function updateChapter(req, res) {
    try {
        const { id } = req.params;
        const { name, description, subjectId, chapterNumber, isActive } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid chapter ID. ID must be a valid number.",
            });
        }

        const chapter = await chapters.findByPk(Number(id));
        if (!chapter) {
            return res.status(404).json({
                message: `Chapter with ID ${id} not found`,
            });
        }

        // If updating subjectId, verify target subject exists
        if (subjectId !== undefined) {
            if (isNaN(Number(subjectId))) {
                return res.status(400).json({
                    message: "Invalid subject ID provided",
                });
            }
            const subject = await subjects.findByPk(Number(subjectId));
            if (!subject) {
                return res.status(404).json({
                    message: `Subject with ID ${subjectId} does not exist`,
                });
            }
            chapter.subjectId = Number(subjectId);
        }

        if (name !== undefined && name.trim()) {
            chapter.name = name.trim();
        }

        if (description !== undefined) {
            chapter.description = description ? description.trim() : null;
        }

        if (chapterNumber !== undefined) {
            chapter.chapterNumber = chapterNumber && !isNaN(Number(chapterNumber)) ? Number(chapterNumber) : null;
        }

        if (isActive !== undefined) {
            chapter.isActive = Boolean(isActive);
        }

        await chapter.save();

        const updatedChapter = await chapters.findByPk(chapter.id, {
            include: [
                {
                    model: subjects,
                    as: "subject",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        return res.status(200).json({
            message: "Chapter updated successfully",
            chapter: updatedChapter,
        });
    } catch (error) {
        console.error("Error updating chapter:", error);
        return res.status(500).json({
            message: "Internal server error while updating chapter",
            error: error.message,
        });
    }
}

/**
 * 6. Delete Chapter (Admin Only)
 * DELETE /api/chapters/:id
 */
async function deleteChapter(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid chapter ID. ID must be a valid number.",
            });
        }

        const chapter = await chapters.findByPk(Number(id));
        if (!chapter) {
            return res.status(404).json({
                message: `Chapter with ID ${id} not found`,
            });
        }

        // Safe deletion check: Check if questions exist under this chapter
        if (connection.models.Question) {
            const questionCount = await connection.models.Question.count({
                where: { chapterId: Number(id) },
            });

            if (questionCount > 0) {
                return res.status(409).json({
                    message: `Cannot delete chapter '${chapter.name}' because it contains ${questionCount} associated question(s). Please delete or reassign questions before deleting this chapter.`,
                    questionCount,
                });
            }
        }

        await chapter.destroy();

        return res.status(200).json({
            message: `Chapter '${chapter.name}' (ID: ${id}) deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting chapter:", error);
        return res.status(500).json({
            message: "Internal server error while deleting chapter",
            error: error.message,
        });
    }
}

module.exports = {
    getAllChapters,
    getChaptersBySubject,
    getChapterById,
    createChapter,
    updateChapter,
    deleteChapter,
};
