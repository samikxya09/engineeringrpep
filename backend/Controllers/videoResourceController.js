const { Op } = require("sequelize");
const {
    videoResources,
    faculties,
    subjects,
    chapters,
    users,
} = require("../database/connection");

/**
 * Validate HTTP/HTTPS URL format
 */
function isValidUrl(urlString) {
    try {
        const parsed = new URL(urlString);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (_) {
        return false;
    }
}

/**
 * Auto-detect video platform from URL if not explicitly specified
 */
function detectPlatform(url, specifiedPlatform) {
    if (specifiedPlatform && specifiedPlatform.trim()) {
        return specifiedPlatform.trim();
    }
    if (!url) return "YouTube";
    const lower = url.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "YouTube";
    if (lower.includes("vimeo.com")) return "Vimeo";
    if (lower.includes("loom.com")) return "Loom";
    if (lower.includes("dailymotion.com")) return "Dailymotion";
    return "Other";
}

/**
 * 1. Get All Video Resources (Student / Public)
 * GET /api/video-resources
 * Query filters: ?facultyId=1&subjectId=1&chapterId=1&platform=YouTube&search=...
 */
async function getAllVideoResources(req, res) {
    try {
        const { facultyId, subjectId, chapterId, platform, search } = req.query;
        const whereClause = {};

        if (facultyId && !isNaN(Number(facultyId))) {
            whereClause.facultyId = Number(facultyId);
        }

        if (subjectId && !isNaN(Number(subjectId))) {
            whereClause.subjectId = Number(subjectId);
        }

        if (chapterId && !isNaN(Number(chapterId))) {
            whereClause.chapterId = Number(chapterId);
        }

        if (platform && platform.trim()) {
            whereClause.platform = platform.trim();
        }

        const videos = await videoResources.findAll({
            where: whereClause,
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
                {
                    model: users,
                    as: "creator",
                    attributes: ["id", "Fullname", "email", "role"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        let resultList = videos;
        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            resultList = videos.filter(v =>
                v.title.toLowerCase().includes(query) ||
                (v.description && v.description.toLowerCase().includes(query))
            );
        }

        const formattedVideos = resultList.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl,
            platform: item.platform,
            faculty: item.faculty || null,
            subject: item.subject || null,
            chapter: item.chapter || null,
            creator: item.creator ? { id: item.creator.id, name: item.creator.Fullname } : null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));

        return res.status(200).json({
            message: "Video resources retrieved successfully",
            count: formattedVideos.length,
            videoResources: formattedVideos,
        });
    } catch (error) {
        console.error("Error fetching video resources:", error);
        return res.status(500).json({
            message: "Internal server error while fetching video resources",
            error: error.message,
        });
    }
}

/**
 * 2. Get Video Resources By Subject
 * GET /api/subjects/:subjectId/video-resources
 * or GET /api/video-resources/subject/:subjectId
 */
async function getVideosBySubject(req, res) {
    try {
        const { subjectId } = req.params;

        if (!subjectId || isNaN(Number(subjectId))) {
            return res.status(400).json({
                message: "Invalid subject ID. ID must be a valid number.",
            });
        }

        const subject = await subjects.findByPk(Number(subjectId), {
            attributes: ["id", "name", "code", "facultyId"],
            include: [{ model: faculties, as: "faculty", attributes: ["id", "name", "code"] }],
        });

        if (!subject) {
            return res.status(404).json({
                message: `Subject with ID ${subjectId} not found`,
            });
        }

        const videos = await videoResources.findAll({
            where: { subjectId: Number(subjectId) },
            include: [
                {
                    model: chapters,
                    as: "chapter",
                    attributes: ["id", "name"],
                },
                {
                    model: users,
                    as: "creator",
                    attributes: ["id", "Fullname", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedVideos = videos.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl,
            platform: item.platform,
            chapter: item.chapter || null,
            creator: item.creator ? { id: item.creator.id, name: item.creator.Fullname } : null,
            createdAt: item.createdAt,
        }));

        return res.status(200).json({
            message: `Video resources for subject '${subject.name}' retrieved successfully`,
            subject: {
                id: subject.id,
                name: subject.name,
                code: subject.code,
                faculty: subject.faculty || null,
            },
            count: formattedVideos.length,
            videoResources: formattedVideos,
        });
    } catch (error) {
        console.error("Error fetching video resources by subject:", error);
        return res.status(500).json({
            message: "Internal server error while fetching video resources by subject",
            error: error.message,
        });
    }
}

/**
 * 3. Get Video Resources By Chapter
 * GET /api/chapters/:chapterId/video-resources
 * or GET /api/video-resources/chapter/:chapterId
 */
async function getVideosByChapter(req, res) {
    try {
        const { chapterId } = req.params;

        if (!chapterId || isNaN(Number(chapterId))) {
            return res.status(400).json({
                message: "Invalid chapter ID. ID must be a valid number.",
            });
        }

        const chapter = await chapters.findByPk(Number(chapterId), {
            attributes: ["id", "name", "subjectId"],
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

        const videos = await videoResources.findAll({
            where: { chapterId: Number(chapterId) },
            include: [
                {
                    model: subjects,
                    as: "subject",
                    attributes: ["id", "name", "code"],
                },
                {
                    model: users,
                    as: "creator",
                    attributes: ["id", "Fullname", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedVideos = videos.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl,
            platform: item.platform,
            subject: item.subject || null,
            creator: item.creator ? { id: item.creator.id, name: item.creator.Fullname } : null,
            createdAt: item.createdAt,
        }));

        return res.status(200).json({
            message: `Video resources for chapter '${chapter.name}' retrieved successfully`,
            chapter: {
                id: chapter.id,
                name: chapter.name,
                subject: chapter.subject || null,
            },
            count: formattedVideos.length,
            videoResources: formattedVideos,
        });
    } catch (error) {
        console.error("Error fetching video resources by chapter:", error);
        return res.status(500).json({
            message: "Internal server error while fetching video resources by chapter",
            error: error.message,
        });
    }
}

/**
 * 4. Get Single Video Resource Details
 * GET /api/video-resources/:id
 */
async function getVideoResourceById(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid video resource ID",
            });
        }

        const video = await videoResources.findByPk(Number(id), {
            include: [
                { model: faculties, as: "faculty", attributes: ["id", "name", "code"] },
                { model: subjects, as: "subject", attributes: ["id", "name", "code"] },
                { model: chapters, as: "chapter", attributes: ["id", "name"] },
                { model: users, as: "creator", attributes: ["id", "Fullname", "email", "role"] },
            ],
        });

        if (!video) {
            return res.status(404).json({
                message: `Video resource with ID ${id} not found`,
            });
        }

        return res.status(200).json({
            message: "Video resource details retrieved successfully",
            videoResource: {
                id: video.id,
                title: video.title,
                description: video.description,
                videoUrl: video.videoUrl,
                platform: video.platform,
                faculty: video.faculty || null,
                subject: video.subject || null,
                chapter: video.chapter || null,
                creator: video.creator ? { id: video.creator.id, name: video.creator.Fullname } : null,
                createdAt: video.createdAt,
                updatedAt: video.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error fetching video resource by ID:", error);
        return res.status(500).json({
            message: "Internal server error while fetching video resource",
            error: error.message,
        });
    }
}

/**
 * 5. Add Video Resource (Admin Only)
 * POST /api/video-resources
 */
async function createVideoResource(req, res) {
    try {
        const userId = req.user?.id;
        const {
            title,
            description,
            videoUrl,
            platform,
            facultyId,
            subjectId,
            chapterId,
        } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated",
            });
        }

        // Validate title
        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Video resource title is required",
            });
        }

        // Validate videoUrl
        if (!videoUrl || !videoUrl.trim()) {
            return res.status(400).json({
                message: "Video URL is required",
            });
        }

        if (!isValidUrl(videoUrl.trim())) {
            return res.status(400).json({
                message: "Invalid video URL format. Must start with http:// or https://",
            });
        }

        // Validate subjectId
        if (!subjectId || isNaN(Number(subjectId))) {
            return res.status(400).json({
                message: "A valid subject ID (subjectId) is required",
            });
        }

        const subject = await subjects.findByPk(Number(subjectId));
        if (!subject) {
            return res.status(404).json({
                message: `Subject with ID ${subjectId} does not exist`,
            });
        }

        // Verify chapterId if provided
        let effectiveChapterId = null;
        if (chapterId !== undefined && chapterId !== null && String(chapterId).trim() !== "") {
            if (isNaN(Number(chapterId))) {
                return res.status(400).json({
                    message: "Chapter ID must be a valid number",
                });
            }
            const chapter = await chapters.findByPk(Number(chapterId));
            if (!chapter) {
                return res.status(404).json({
                    message: `Chapter with ID ${chapterId} does not exist`,
                });
            }
            effectiveChapterId = Number(chapterId);
        }

        const effectiveFacultyId = facultyId && !isNaN(Number(facultyId))
            ? Number(facultyId)
            : subject.facultyId || null;

        const effectivePlatform = detectPlatform(videoUrl.trim(), platform);

        const newVideo = await videoResources.create({
            title: title.trim(),
            description: description ? description.trim() : null,
            videoUrl: videoUrl.trim(),
            platform: effectivePlatform,
            facultyId: effectiveFacultyId,
            subjectId: Number(subjectId),
            chapterId: effectiveChapterId,
            createdBy: Number(userId),
        });

        const createdVideo = await videoResources.findByPk(newVideo.id, {
            include: [
                { model: faculties, as: "faculty", attributes: ["id", "name", "code"] },
                { model: subjects, as: "subject", attributes: ["id", "name", "code"] },
                { model: chapters, as: "chapter", attributes: ["id", "name"] },
                { model: users, as: "creator", attributes: ["id", "Fullname", "email"] },
            ],
        });

        return res.status(201).json({
            message: "Video resource added successfully",
            videoResource: createdVideo,
        });
    } catch (error) {
        console.error("Error creating video resource:", error);
        return res.status(500).json({
            message: "Internal server error while creating video resource",
            error: error.message,
        });
    }
}

/**
 * 6. Update Video Resource (Admin Only)
 * PUT /api/video-resources/:id
 */
async function updateVideoResource(req, res) {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            videoUrl,
            platform,
            facultyId,
            subjectId,
            chapterId,
        } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid video resource ID",
            });
        }

        const video = await videoResources.findByPk(Number(id));
        if (!video) {
            return res.status(404).json({
                message: `Video resource with ID ${id} not found`,
            });
        }

        if (title !== undefined && title.trim()) {
            video.title = title.trim();
        }

        if (description !== undefined) {
            video.description = description ? description.trim() : null;
        }

        if (videoUrl !== undefined) {
            if (!videoUrl || !videoUrl.trim() || !isValidUrl(videoUrl.trim())) {
                return res.status(400).json({
                    message: "Invalid video URL format. Must start with http:// or https://",
                });
            }
            video.videoUrl = videoUrl.trim();
            if (!platform) {
                video.platform = detectPlatform(videoUrl.trim(), video.platform);
            }
        }

        if (platform !== undefined && platform.trim()) {
            video.platform = platform.trim();
        }

        if (subjectId !== undefined && !isNaN(Number(subjectId))) {
            const subject = await subjects.findByPk(Number(subjectId));
            if (!subject) {
                return res.status(404).json({
                    message: `Subject with ID ${subjectId} does not exist`,
                });
            }
            video.subjectId = Number(subjectId);
            if (facultyId === undefined && subject.facultyId) {
                video.facultyId = subject.facultyId;
            }
        }

        if (facultyId !== undefined) {
            video.facultyId = facultyId ? Number(facultyId) : null;
        }

        if (chapterId !== undefined) {
            if (chapterId === null || String(chapterId).trim() === "") {
                video.chapterId = null;
            } else if (!isNaN(Number(chapterId))) {
                const chapter = await chapters.findByPk(Number(chapterId));
                if (!chapter) {
                    return res.status(404).json({
                        message: `Chapter with ID ${chapterId} does not exist`,
                    });
                }
                video.chapterId = Number(chapterId);
            }
        }

        await video.save();

        const updatedVideo = await videoResources.findByPk(video.id, {
            include: [
                { model: faculties, as: "faculty", attributes: ["id", "name", "code"] },
                { model: subjects, as: "subject", attributes: ["id", "name", "code"] },
                { model: chapters, as: "chapter", attributes: ["id", "name"] },
                { model: users, as: "creator", attributes: ["id", "Fullname", "email"] },
            ],
        });

        return res.status(200).json({
            message: "Video resource updated successfully",
            videoResource: updatedVideo,
        });
    } catch (error) {
        console.error("Error updating video resource:", error);
        return res.status(500).json({
            message: "Internal server error while updating video resource",
            error: error.message,
        });
    }
}

/**
 * 7. Delete Video Resource (Admin Only)
 * DELETE /api/video-resources/:id
 */
async function deleteVideoResource(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid video resource ID",
            });
        }

        const video = await videoResources.findByPk(Number(id));
        if (!video) {
            return res.status(404).json({
                message: `Video resource with ID ${id} not found`,
            });
        }

        const title = video.title;
        await video.destroy();

        return res.status(200).json({
            message: `Video resource '${title}' (ID: ${id}) deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting video resource:", error);
        return res.status(500).json({
            message: "Internal server error while deleting video resource",
            error: error.message,
        });
    }
}

/**
 * 8. Search Video Resources (Student / Public)
 * GET /api/video-resources/search
 * Query params: ?q=keywords&facultyId=1&subjectId=1&chapterId=1&platform=YouTube
 */
async function searchVideoResources(req, res) {
    try {
        const { q, search, query, facultyId, subjectId, chapterId, platform } = req.query;
        const searchQuery = (q || search || query || "").trim();

        const whereClause = {};

        if (facultyId && !isNaN(Number(facultyId))) {
            whereClause.facultyId = Number(facultyId);
        }

        if (subjectId && !isNaN(Number(subjectId))) {
            whereClause.subjectId = Number(subjectId);
        }

        if (chapterId && !isNaN(Number(chapterId))) {
            whereClause.chapterId = Number(chapterId);
        }

        if (platform && platform.trim()) {
            whereClause.platform = platform.trim();
        }

        if (searchQuery) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${searchQuery}%` } },
                { description: { [Op.iLike]: `%${searchQuery}%` } },
            ];
        }

        const videos = await videoResources.findAll({
            where: whereClause,
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
                {
                    model: users,
                    as: "creator",
                    attributes: ["id", "Fullname", "email", "role"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedVideos = videos.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl,
            platform: item.platform,
            faculty: item.faculty || null,
            subject: item.subject || null,
            chapter: item.chapter || null,
            creator: item.creator ? { id: item.creator.id, name: item.creator.Fullname } : null,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));

        return res.status(200).json({
            message: "Video resources matching search retrieved successfully",
            totalCount: formattedVideos.length,
            query: searchQuery || null,
            filters: {
                facultyId: facultyId ? Number(facultyId) : null,
                subjectId: subjectId ? Number(subjectId) : null,
                chapterId: chapterId ? Number(chapterId) : null,
                platform: platform ? platform.trim() : null,
            },
            videoResources: formattedVideos,
        });
    } catch (error) {
        console.error("Error searching video resources:", error);
        return res.status(500).json({
            message: "Internal server error while searching video resources",
            error: error.message,
        });
    }
}

module.exports = {
    getAllVideoResources,
    getVideosBySubject,
    getVideosByChapter,
    getVideoResourceById,
    searchVideoResources,
    createVideoResource,
    updateVideoResource,
    deleteVideoResource,
};

