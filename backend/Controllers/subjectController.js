const { subjects, faculties } = require("../database/connection");

/**
 * 1. Get All Subjects (Student / Public)
 * GET /api/subjects
 * Supports optional faculty filtering: /api/subjects?facultyId=1
 */
async function getAllSubjects(req, res) {
    try {
        const { facultyId } = req.query;
        const whereClause = { isActive: true };

        if (facultyId && !isNaN(Number(facultyId))) {
            whereClause.facultyId = Number(facultyId);
        }

        const subjectList = await subjects.findAll({
            where: whereClause,
            attributes: ["id", "name", "code", "description", "facultyId", "isActive", "createdAt", "updatedAt"],
            include: [
                {
                    model: faculties,
                    as: "faculty",
                    attributes: ["id", "name", "code"],
                },
            ],
            order: [["name", "ASC"]],
        });

        return res.status(200).json({
            message: "Subjects fetched successfully",
            count: subjectList.length,
            subjects: subjectList,
        });
    } catch (error) {
        console.error("Error fetching all subjects:", error);
        return res.status(500).json({
            message: "Internal server error while fetching subjects",
            error: error.message,
        });
    }
}

/**
 * 2. Get Subject By ID (Student / Public)
 * GET /api/subjects/:id
 */
async function getSubjectById(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid subject ID. ID must be a valid number.",
            });
        }

        const subject = await subjects.findOne({
            where: { id: Number(id), isActive: true },
            attributes: ["id", "name", "code", "description", "facultyId", "isActive", "createdAt", "updatedAt"],
            include: [
                {
                    model: faculties,
                    as: "faculty",
                    attributes: ["id", "name", "code", "description"],
                },
            ],
        });

        if (!subject) {
            return res.status(404).json({
                message: `Subject with ID ${id} not found`,
            });
        }

        return res.status(200).json({
            message: "Subject retrieved successfully",
            subject,
        });
    } catch (error) {
        console.error("Error fetching subject by ID:", error);
        return res.status(500).json({
            message: "Internal server error while fetching subject",
            error: error.message,
        });
    }
}

/**
 * 3. Create Subject (Admin Only)
 * POST /api/subjects
 */
async function createSubject(req, res) {
    try {
        const { name, code, description, facultyId } = req.body;

        // 1. Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Subject name is required",
            });
        }

        if (!facultyId || isNaN(Number(facultyId))) {
            return res.status(400).json({
                message: "Valid faculty ID (facultyId) is required",
            });
        }

        // 2. Verify faculty exists in the database
        const faculty = await faculties.findByPk(Number(facultyId));
        if (!faculty) {
            return res.status(404).json({
                message: `Faculty with ID ${facultyId} does not exist. Cannot create subject under a non-existent faculty.`,
            });
        }

        // 3. Create the subject
        const newSubject = await subjects.create({
            name: name.trim(),
            code: code ? code.trim() : null,
            description: description ? description.trim() : null,
            facultyId: Number(facultyId),
            isActive: true,
        });

        // 4. Return complete subject record with associated faculty info
        const createdSubject = await subjects.findByPk(newSubject.id, {
            include: [
                {
                    model: faculties,
                    as: "faculty",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        return res.status(201).json({
            message: "Subject created successfully",
            subject: createdSubject,
        });
    } catch (error) {
        console.error("Error creating subject:", error);
        return res.status(500).json({
            message: "Internal server error while creating subject",
            error: error.message,
        });
    }
}

/**
 * 4. Update Subject (Admin Only)
 * PUT /api/subjects/:id
 */
async function updateSubject(req, res) {
    try {
        const { id } = req.params;
        const { name, code, description, facultyId, isActive } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid subject ID. ID must be a valid number.",
            });
        }

        const subject = await subjects.findByPk(Number(id));
        if (!subject) {
            return res.status(404).json({
                message: `Subject with ID ${id} not found`,
            });
        }

        // If updating facultyId, verify target faculty exists
        if (facultyId !== undefined) {
            if (isNaN(Number(facultyId))) {
                return res.status(400).json({
                    message: "Invalid faculty ID provided",
                });
            }
            const faculty = await faculties.findByPk(Number(facultyId));
            if (!faculty) {
                return res.status(404).json({
                    message: `Faculty with ID ${facultyId} does not exist`,
                });
            }
            subject.facultyId = Number(facultyId);
        }

        if (name !== undefined && name.trim()) {
            subject.name = name.trim();
        }

        if (code !== undefined) {
            subject.code = code ? code.trim() : null;
        }

        if (description !== undefined) {
            subject.description = description ? description.trim() : null;
        }

        if (isActive !== undefined) {
            subject.isActive = Boolean(isActive);
        }

        await subject.save();

        const updatedSubject = await subjects.findByPk(subject.id, {
            include: [
                {
                    model: faculties,
                    as: "faculty",
                    attributes: ["id", "name", "code"],
                },
            ],
        });

        return res.status(200).json({
            message: "Subject updated successfully",
            subject: updatedSubject,
        });
    } catch (error) {
        console.error("Error updating subject:", error);
        return res.status(500).json({
            message: "Internal server error while updating subject",
            error: error.message,
        });
    }
}

/**
 * 5. Delete Subject (Admin Only)
 * DELETE /api/subjects/:id
 */
async function deleteSubject(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid subject ID. ID must be a valid number.",
            });
        }

        const subject = await subjects.findByPk(Number(id));
        if (!subject) {
            return res.status(404).json({
                message: `Subject with ID ${id} not found`,
            });
        }

        await subject.destroy();

        return res.status(200).json({
            message: `Subject '${subject.name}' (ID: ${id}) deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting subject:", error);
        return res.status(500).json({
            message: "Internal server error while deleting subject",
            error: error.message,
        });
    }
}

module.exports = {
    getAllSubjects,
    getSubjectById,
    createSubject,
    updateSubject,
    deleteSubject,
};
