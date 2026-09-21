const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const {
    studyMaterials,
    faculties,
    subjects,
    chapters,
    users,
} = require("../database/connection");

/**
 * 1. Get All Study Materials (Student / Public or Authenticated)
 * GET /api/study-materials
 * Query params: ?facultyId=1&subjectId=1&chapterId=1&search=...
 */
async function getAllStudyMaterials(req, res) {
    try {
        const { facultyId, subjectId, chapterId, search } = req.query;
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

        const materials = await studyMaterials.findAll({
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
                    as: "uploader",
                    attributes: ["id", "Fullname", "email", "role"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Optional search filter by title/description in-memory if needed
        let resultList = materials;
        if (search && search.trim()) {
            const query = search.trim().toLowerCase();
            resultList = materials.filter(m =>
                m.title.toLowerCase().includes(query) ||
                (m.description && m.description.toLowerCase().includes(query))
            );
        }

        const formattedMaterials = resultList.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            fileName: item.fileName,
            fileSize: item.fileSize,
            fileSizeFormatted: item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : null,
            faculty: item.faculty || null,
            subject: item.subject || null,
            chapter: item.chapter || null,
            uploader: item.uploader ? { id: item.uploader.id, name: item.uploader.Fullname } : null,
            uploadDate: item.createdAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));

        return res.status(200).json({
            message: "Study materials retrieved successfully",
            count: formattedMaterials.length,
            studyMaterials: formattedMaterials,
        });
    } catch (error) {
        console.error("Error fetching study materials:", error);
        return res.status(500).json({
            message: "Internal server error while fetching study materials",
            error: error.message,
        });
    }
}

/**
 * 2. Get Study Materials by Subject
 * GET /api/subjects/:subjectId/study-materials
 * or GET /api/study-materials/subject/:subjectId
 */
async function getMaterialsBySubject(req, res) {
    try {
        const { subjectId } = req.params;

        if (!subjectId || isNaN(Number(subjectId))) {
            return res.status(400).json({
                message: "Invalid subject ID. ID must be a valid number.",
            });
        }

        // Verify subject exists
        const subject = await subjects.findByPk(Number(subjectId), {
            attributes: ["id", "name", "code", "facultyId"],
            include: [{ model: faculties, as: "faculty", attributes: ["id", "name", "code"] }],
        });

        if (!subject) {
            return res.status(404).json({
                message: `Subject with ID ${subjectId} not found`,
            });
        }

        const materials = await studyMaterials.findAll({
            where: { subjectId: Number(subjectId) },
            include: [
                {
                    model: chapters,
                    as: "chapter",
                    attributes: ["id", "name"],
                },
                {
                    model: users,
                    as: "uploader",
                    attributes: ["id", "Fullname", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedMaterials = materials.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            fileName: item.fileName,
            fileSize: item.fileSize,
            fileSizeFormatted: item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : null,
            chapter: item.chapter || null,
            uploader: item.uploader ? { id: item.uploader.id, name: item.uploader.Fullname } : null,
            uploadDate: item.createdAt,
            createdAt: item.createdAt,
        }));

        return res.status(200).json({
            message: `Study materials for subject '${subject.name}' retrieved successfully`,
            subject: {
                id: subject.id,
                name: subject.name,
                code: subject.code,
                faculty: subject.faculty || null,
            },
            count: formattedMaterials.length,
            studyMaterials: formattedMaterials,
        });
    } catch (error) {
        console.error("Error fetching study materials by subject:", error);
        return res.status(500).json({
            message: "Internal server error while fetching study materials by subject",
            error: error.message,
        });
    }
}

/**
 * 3. Get Single Study Material Details
 * GET /api/study-materials/:id
 */
async function getStudyMaterialById(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid study material ID",
            });
        }

        const material = await studyMaterials.findByPk(Number(id), {
            include: [
                { model: faculties, as: "faculty", attributes: ["id", "name", "code"] },
                { model: subjects, as: "subject", attributes: ["id", "name", "code"] },
                { model: chapters, as: "chapter", attributes: ["id", "name"] },
                { model: users, as: "uploader", attributes: ["id", "Fullname", "email", "role"] },
            ],
        });

        if (!material) {
            return res.status(404).json({
                message: `Study material with ID ${id} not found`,
            });
        }

        return res.status(200).json({
            message: "Study material details retrieved successfully",
            studyMaterial: {
                id: material.id,
                title: material.title,
                description: material.description,
                fileName: material.fileName,
                fileSize: material.fileSize,
                fileSizeFormatted: material.fileSize ? `${(material.fileSize / (1024 * 1024)).toFixed(2)} MB` : null,
                faculty: material.faculty || null,
                subject: material.subject || null,
                chapter: material.chapter || null,
                uploader: material.uploader ? { id: material.uploader.id, name: material.uploader.Fullname } : null,
                uploadDate: material.createdAt,
                createdAt: material.createdAt,
                updatedAt: material.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error fetching study material by ID:", error);
        return res.status(500).json({
            message: "Internal server error while fetching study material",
            error: error.message,
        });
    }
}

/**
 * 4. Download PDF (Authenticated Users)
 * GET /api/study-materials/:id/download
 */
async function downloadStudyMaterial(req, res) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: You must be logged in to download study materials",
            });
        }

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid study material ID",
            });
        }

        const material = await studyMaterials.findByPk(Number(id));

        if (!material) {
            return res.status(404).json({
                message: `Study material with ID ${id} not found`,
            });
        }

        const resolvedPath = path.resolve(material.filePath);

        if (!fs.existsSync(resolvedPath)) {
            return res.status(404).json({
                message: "The requested PDF file is missing from the server storage. Please contact administrator.",
            });
        }

        // Set attachment headers and trigger browser/client download
        return res.download(resolvedPath, material.fileName, (err) => {
            if (err) {
                console.error("Error sending PDF file to client:", err);
                if (!res.headersSent) {
                    return res.status(500).json({
                        message: "Error downloading PDF file",
                        error: err.message,
                    });
                }
            }
        });
    } catch (error) {
        console.error("Error downloading study material:", error);
        return res.status(500).json({
            message: "Internal server error while downloading study material",
            error: error.message,
        });
    }
}

/**
 * 5. Upload PDF Study Material (Admin Only)
 * POST /api/study-materials
 */
async function uploadStudyMaterial(req, res) {
    try {
        const userId = req.user?.id;
        const { title, description, facultyId, subjectId, chapterId } = req.body;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: User not authenticated",
            });
        }

        // Validate title
        if (!title || !title.trim()) {
            // Delete uploaded file if validation fails
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                message: "Study material title is required",
            });
        }

        // Validate subjectId
        if (!subjectId || isNaN(Number(subjectId))) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                message: "A valid subject ID (subjectId) is required",
            });
        }

        // Validate PDF file upload
        if (!req.file) {
            return res.status(400).json({
                message: "PDF file is required. Please upload a valid .pdf file with key 'pdf' or 'file'.",
            });
        }

        // Verify subject exists in database
        const subject = await subjects.findByPk(Number(subjectId));
        if (!subject) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                message: `Subject with ID ${subjectId} does not exist`,
            });
        }

        // Auto-assign facultyId from subject if not explicitly provided
        const effectiveFacultyId = facultyId && !isNaN(Number(facultyId))
            ? Number(facultyId)
            : subject.facultyId || null;

        const effectiveChapterId = chapterId && !isNaN(Number(chapterId))
            ? Number(chapterId)
            : null;

        const newMaterial = await studyMaterials.create({
            title: title.trim(),
            description: description ? description.trim() : null,
            filePath: req.file.path,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            facultyId: effectiveFacultyId,
            subjectId: Number(subjectId),
            chapterId: effectiveChapterId,
            uploadedBy: Number(userId),
        });

        const createdMaterial = await studyMaterials.findByPk(newMaterial.id, {
            include: [
                { model: faculties, as: "faculty", attributes: ["id", "name", "code"] },
                { model: subjects, as: "subject", attributes: ["id", "name", "code"] },
                { model: chapters, as: "chapter", attributes: ["id", "name"] },
                { model: users, as: "uploader", attributes: ["id", "Fullname", "email"] },
            ],
        });

        return res.status(201).json({
            message: "Study material PDF uploaded successfully",
            studyMaterial: createdMaterial,
        });
    } catch (error) {
        // Clean up uploaded file if an error occurred during processing
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                console.error("Error cleaning up file after failure:", cleanupErr);
            }
        }
        console.error("Error uploading study material:", error);
        return res.status(500).json({
            message: "Internal server error while uploading study material",
            error: error.message,
        });
    }
}

/**
 * 6. Update Study Material (Admin Only)
 * PUT /api/study-materials/:id
 */
async function updateStudyMaterial(req, res) {
    try {
        const { id } = req.params;
        const { title, description, facultyId, subjectId, chapterId } = req.body;

        if (!id || isNaN(Number(id))) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                message: "Invalid study material ID",
            });
        }

        const material = await studyMaterials.findByPk(Number(id));
        if (!material) {
            if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                message: `Study material with ID ${id} not found`,
            });
        }

        if (title !== undefined && title.trim()) {
            material.title = title.trim();
        }

        if (description !== undefined) {
            material.description = description ? description.trim() : null;
        }

        if (subjectId !== undefined && !isNaN(Number(subjectId))) {
            const subject = await subjects.findByPk(Number(subjectId));
            if (!subject) {
                if (req.file && req.file.path && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return res.status(404).json({
                    message: `Subject with ID ${subjectId} does not exist`,
                });
            }
            material.subjectId = Number(subjectId);
        }

        if (facultyId !== undefined) {
            material.facultyId = facultyId ? Number(facultyId) : null;
        }

        if (chapterId !== undefined) {
            material.chapterId = chapterId ? Number(chapterId) : null;
        }

        // If a new PDF file is uploaded, remove the old file and replace metadata
        if (req.file) {
            const oldFilePath = path.resolve(material.filePath);
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                } catch (unlinkErr) {
                    console.error("Could not delete old file:", unlinkErr);
                }
            }

            material.filePath = req.file.path;
            material.fileName = req.file.originalname;
            material.fileSize = req.file.size;
        }

        await material.save();

        const updatedMaterial = await studyMaterials.findByPk(material.id, {
            include: [
                { model: faculties, as: "faculty", attributes: ["id", "name", "code"] },
                { model: subjects, as: "subject", attributes: ["id", "name", "code"] },
                { model: chapters, as: "chapter", attributes: ["id", "name"] },
                { model: users, as: "uploader", attributes: ["id", "Fullname", "email"] },
            ],
        });

        return res.status(200).json({
            message: "Study material updated successfully",
            studyMaterial: updatedMaterial,
        });
    } catch (error) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupErr) {
                console.error("Error cleaning up file after update failure:", cleanupErr);
            }
        }
        console.error("Error updating study material:", error);
        return res.status(500).json({
            message: "Internal server error while updating study material",
            error: error.message,
        });
    }
}

/**
 * 7. Delete Study Material (Admin Only)
 * DELETE /api/study-materials/:id
 */
async function deleteStudyMaterial(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid study material ID",
            });
        }

        const material = await studyMaterials.findByPk(Number(id));
        if (!material) {
            return res.status(404).json({
                message: `Study material with ID ${id} not found`,
            });
        }

        // Remove the physical file safely
        if (material.filePath) {
            const resolvedPath = path.resolve(material.filePath);
            if (fs.existsSync(resolvedPath)) {
                try {
                    fs.unlinkSync(resolvedPath);
                } catch (unlinkErr) {
                    console.error("Warning: could not delete physical file on disk:", unlinkErr);
                }
            }
        }

        const title = material.title;
        await material.destroy();

        return res.status(200).json({
            message: `Study material '${title}' (ID: ${id}) deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting study material:", error);
        return res.status(500).json({
            message: "Internal server error while deleting study material",
            error: error.message,
        });
    }
}

/**
 * 8. Search Study Materials (Student / Public)
 * GET /api/study-materials/search
 * Query params: ?q=keywords&facultyId=1&subjectId=1&chapterId=1
 */
async function searchStudyMaterials(req, res) {
    try {
        const { q, search, query, facultyId, subjectId, chapterId } = req.query;
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

        if (searchQuery) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${searchQuery}%` } },
                { description: { [Op.iLike]: `%${searchQuery}%` } },
            ];
        }

        const materials = await studyMaterials.findAll({
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
                    as: "uploader",
                    attributes: ["id", "Fullname", "email", "role"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const formattedMaterials = materials.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            fileName: item.fileName,
            fileSize: item.fileSize,
            fileSizeFormatted: item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : null,
            faculty: item.faculty || null,
            subject: item.subject || null,
            chapter: item.chapter || null,
            uploader: item.uploader ? { id: item.uploader.id, name: item.uploader.Fullname } : null,
            uploadDate: item.createdAt,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));

        return res.status(200).json({
            message: "Study materials matching search retrieved successfully",
            totalCount: formattedMaterials.length,
            query: searchQuery || null,
            filters: {
                facultyId: facultyId ? Number(facultyId) : null,
                subjectId: subjectId ? Number(subjectId) : null,
                chapterId: chapterId ? Number(chapterId) : null,
            },
            studyMaterials: formattedMaterials,
        });
    } catch (error) {
        console.error("Error searching study materials:", error);
        return res.status(500).json({
            message: "Internal server error while searching study materials",
            error: error.message,
        });
    }
}

module.exports = {
    getAllStudyMaterials,
    getMaterialsBySubject,
    getStudyMaterialById,
    searchStudyMaterials,
    downloadStudyMaterial,
    uploadStudyMaterial,
    updateStudyMaterial,
    deleteStudyMaterial,
};

