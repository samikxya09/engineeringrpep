const { Op } = require("sequelize");
const {
    questions,
    subjects,
    chapters,
    faculties,
    studyMaterials,
    videoResources,
} = require("../database/connection");

/**
 * Global Search Controller
 * GET /api/search?q=keyword&limit=10
 * 
 * Searches concurrently across:
 * 1. Questions (questionText, explanation)
 * 2. Subjects (name, code, description)
 * 3. Chapters (name, description)
 * 4. Study Materials (title, description)
 * 5. Video Resources (title, description)
 */
async function globalSearch(req, res) {
    try {
        const { q, search, query, limit = 10 } = req.query;
        const searchQuery = (q || search || query || "").trim();
        const perEntityLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

        if (!searchQuery) {
            return res.status(200).json({
                message: "Please provide a search term (?q=keyword)",
                query: "",
                totalMatches: 0,
                results: {
                    questions: [],
                    subjects: [],
                    chapters: [],
                    studyMaterials: [],
                    videoResources: [],
                },
            });
        }

        const pattern = `%${searchQuery}%`;

        // Run queries in parallel across all searchable entities
        const [
            questionMatches,
            subjectMatches,
            chapterMatches,
            studyMaterialMatches,
            videoResourceMatches,
        ] = await Promise.all([
            // 1. Questions Search
            questions.findAll({
                where: {
                    isActive: true,
                    [Op.or]: [
                        { questionText: { [Op.iLike]: pattern } },
                        { explanation: { [Op.iLike]: pattern } },
                    ],
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
                                include: [
                                    {
                                        model: faculties,
                                        as: "faculty",
                                        attributes: ["id", "name", "code"],
                                    },
                                ],
                            },
                        ],
                    },
                ],
                limit: perEntityLimit,
                order: [["id", "ASC"]],
            }),

            // 2. Subjects Search
            subjects.findAll({
                where: {
                    isActive: true,
                    [Op.or]: [
                        { name: { [Op.iLike]: pattern } },
                        { code: { [Op.iLike]: pattern } },
                        { description: { [Op.iLike]: pattern } },
                    ],
                },
                attributes: ["id", "name", "code", "description", "facultyId"],
                include: [
                    {
                        model: faculties,
                        as: "faculty",
                        attributes: ["id", "name", "code"],
                    },
                ],
                limit: perEntityLimit,
                order: [["id", "ASC"]],
            }),

            // 3. Chapters Search
            chapters.findAll({
                where: {
                    isActive: true,
                    [Op.or]: [
                        { name: { [Op.iLike]: pattern } },
                        { description: { [Op.iLike]: pattern } },
                    ],
                },
                attributes: ["id", "chapterNumber", "name", "description", "subjectId"],
                include: [
                    {
                        model: subjects,
                        as: "subject",
                        attributes: ["id", "name", "code"],
                        include: [
                            {
                                model: faculties,
                                as: "faculty",
                                attributes: ["id", "name", "code"],
                            },
                        ],
                    },
                ],
                limit: perEntityLimit,
                order: [["id", "ASC"]],
            }),

            // 4. Study Materials Search
            studyMaterials.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: pattern } },
                        { description: { [Op.iLike]: pattern } },
                    ],
                },
                include: [
                    {
                        model: faculties,
                        as: "faculty",
                        attributes: ["id", "name", "code"],
                    },
                    {
                        model: subjects,
                        as: "subject",
                        attributes: ["id", "name", "code"],
                    },
                    {
                        model: chapters,
                        as: "chapter",
                        attributes: ["id", "name"],
                    },
                ],
                limit: perEntityLimit,
                order: [["createdAt", "DESC"]],
            }),

            // 5. Video Resources Search
            videoResources.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: pattern } },
                        { description: { [Op.iLike]: pattern } },
                    ],
                },
                include: [
                    {
                        model: faculties,
                        as: "faculty",
                        attributes: ["id", "name", "code"],
                    },
                    {
                        model: subjects,
                        as: "subject",
                        attributes: ["id", "name", "code"],
                    },
                    {
                        model: chapters,
                        as: "chapter",
                        attributes: ["id", "name"],
                    },
                ],
                limit: perEntityLimit,
                order: [["createdAt", "DESC"]],
            }),
        ]);

        const formattedMaterials = studyMaterialMatches.map(m => ({
            id: m.id,
            title: m.title,
            description: m.description,
            fileName: m.fileName,
            fileSize: m.fileSize,
            fileSizeFormatted: m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(2)} MB` : null,
            faculty: m.faculty || null,
            subject: m.subject || null,
            chapter: m.chapter || null,
            createdAt: m.createdAt,
        }));

        const formattedVideos = videoResourceMatches.map(v => ({
            id: v.id,
            title: v.title,
            description: v.description,
            videoUrl: v.videoUrl,
            platform: v.platform,
            faculty: v.faculty || null,
            subject: v.subject || null,
            chapter: v.chapter || null,
            createdAt: v.createdAt,
        }));

        const totalMatches =
            questionMatches.length +
            subjectMatches.length +
            chapterMatches.length +
            formattedMaterials.length +
            formattedVideos.length;

        return res.status(200).json({
            message: "Global search executed successfully",
            query: searchQuery,
            totalMatches,
            results: {
                questions: questionMatches,
                subjects: subjectMatches,
                chapters: chapterMatches,
                studyMaterials: formattedMaterials,
                videoResources: formattedVideos,
            },
        });
    } catch (error) {
        console.error("Error executing global search:", error);
        return res.status(500).json({
            message: "Internal server error while executing global search",
            error: error.message,
        });
    }
}

module.exports = {
    globalSearch,
};
