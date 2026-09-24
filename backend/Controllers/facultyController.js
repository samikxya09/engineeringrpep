const { faculties, subjects } = require("../database/connection");

/**
 * Get All Engineering Faculties
 * GET /api/faculties
 */
async function getAllFaculties(req, res) {
    try {
        const facultyList = await faculties.findAll({
            where: { isActive: true },
            attributes: ["id", "name", "code", "description", "isActive", "createdAt", "updatedAt"],
            order: [["name", "ASC"]],
        });

        return res.status(200).json({
            message: "Faculties retrieved successfully",
            count: facultyList.length,
            faculties: facultyList,
        });
    } catch (error) {
        console.error("Error retrieving faculties:", error);
        return res.status(500).json({
            message: "Internal server error while fetching faculties",
            error: error.message,
        });
    }
}

/**
 * Get Subjects By Faculty ID
 * GET /api/faculties/:facultyId/subjects
 */
async function getSubjectsByFaculty(req, res) {
    try {
        const { facultyId } = req.params;

        // 1. Validate facultyId parameter
        if (!facultyId || isNaN(Number(facultyId))) {
            return res.status(400).json({
                message: "Invalid faculty ID. Faculty ID must be a valid number.",
            });
        }

        // 2. Check if the faculty exists
        const faculty = await faculties.findByPk(facultyId, {
            attributes: ["id", "name", "code", "description", "isActive"],
        });

        if (!faculty) {
            return res.status(404).json({
                message: `Faculty with ID ${facultyId} not found`,
            });
        }

        // 3. Find active subjects belonging to this faculty
        const subjectList = await subjects.findAll({
            where: {
                facultyId: facultyId,
                isActive: true,
            },
            attributes: ["id", "name", "code", "description", "facultyId", "createdAt", "updatedAt"],
            order: [["name", "ASC"]],
        });

        return res.status(200).json({
            message: "Subjects retrieved successfully",
            faculty: {
                id: faculty.id,
                name: faculty.name,
                code: faculty.code,
                description: faculty.description,
            },
            count: subjectList.length,
            subjects: subjectList,
        });
    } catch (error) {
        console.error("Error retrieving subjects for faculty:", error);
        return res.status(500).json({
            message: "Internal server error while fetching subjects",
            error: error.message,
        });
    }
}

/**
 * Create Faculty (Admin Only)
 * POST /api/faculties
 */
async function createFaculty(req, res) {
    try {
        const { name, code, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Faculty name is required",
            });
        }

        const existing = await faculties.findOne({ where: { name: name.trim() } });
        if (existing) {
            return res.status(409).json({
                message: `Faculty '${name.trim()}' already exists`,
            });
        }

        const newFaculty = await faculties.create({
            name: name.trim(),
            code: code ? code.trim() : null,
            description: description ? description.trim() : null,
            isActive: true,
        });

        return res.status(201).json({
            message: "Faculty created successfully",
            faculty: newFaculty,
        });
    } catch (error) {
        console.error("Error creating faculty:", error);
        return res.status(500).json({
            message: "Internal server error while creating faculty",
            error: error.message,
        });
    }
}

/**
 * Update Faculty (Admin Only)
 * PUT /api/faculties/:id
 */
async function updateFaculty(req, res) {
    try {
        const { id } = req.params;
        const { name, code, description, isActive } = req.body;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid faculty ID",
            });
        }

        const faculty = await faculties.findByPk(Number(id));
        if (!faculty) {
            return res.status(404).json({
                message: `Faculty with ID ${id} not found`,
            });
        }

        if (name !== undefined && name.trim()) {
            faculty.name = name.trim();
        }
        if (code !== undefined) {
            faculty.code = code ? code.trim() : null;
        }
        if (description !== undefined) {
            faculty.description = description ? description.trim() : null;
        }
        if (isActive !== undefined) {
            faculty.isActive = Boolean(isActive);
        }

        await faculty.save();

        return res.status(200).json({
            message: "Faculty updated successfully",
            faculty,
        });
    } catch (error) {
        console.error("Error updating faculty:", error);
        return res.status(500).json({
            message: "Internal server error while updating faculty",
            error: error.message,
        });
    }
}

/**
 * Delete Faculty (Admin Only)
 * DELETE /api/faculties/:id
 */
async function deleteFaculty(req, res) {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                message: "Invalid faculty ID",
            });
        }

        const faculty = await faculties.findByPk(Number(id));
        if (!faculty) {
            return res.status(404).json({
                message: `Faculty with ID ${id} not found`,
            });
        }

        await faculty.destroy();

        return res.status(200).json({
            message: `Faculty '${faculty.name}' deleted successfully`,
        });
    } catch (error) {
        console.error("Error deleting faculty:", error);
        return res.status(500).json({
            message: "Internal server error while deleting faculty",
            error: error.message,
        });
    }
}

module.exports = {
    getAllFaculties,
    getSubjectsByFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
};
