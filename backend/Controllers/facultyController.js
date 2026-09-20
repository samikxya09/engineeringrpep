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

module.exports = {
    getAllFaculties,
    getSubjectsByFaculty,
};
