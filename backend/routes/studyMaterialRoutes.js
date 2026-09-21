const express = require("express");
const router = express.Router();

const {
    getAllStudyMaterials,
    getMaterialsBySubject,
    getStudyMaterialById,
    searchStudyMaterials,
    downloadStudyMaterial,
    uploadStudyMaterial,
    updateStudyMaterial,
    deleteStudyMaterial,
} = require("../Controllers/studyMaterialController");

const { upload } = require("../middleware/uploadMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

/**
 * Middleware wrapper for multer upload with friendly error handling
 */
function handlePdfUpload(req, res, next) {
    const uploadSingle = upload.single("pdf");
    uploadSingle(req, res, function (err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "File is too large. Maximum allowed size is 50MB.",
                });
            }
            if (err.code === "INVALID_FILE_TYPE") {
                return res.status(400).json({
                    message: err.message || "Only PDF files are allowed.",
                });
            }
            return res.status(400).json({
                message: err.message || "Error processing file upload",
            });
        }
        next();
    });
}

// Student / Public Routes
router.get("/", getAllStudyMaterials);
router.get("/search", searchStudyMaterials);
router.get("/subject/:subjectId", getMaterialsBySubject);
router.get("/:id", getStudyMaterialById);

// Authenticated Download Route
router.get("/:id/download", authenticateToken, downloadStudyMaterial);

// Admin Management Routes (Protected by Auth + Admin Role)
router.post("/", authenticateToken, authorizeRole("admin"), handlePdfUpload, uploadStudyMaterial);
router.put("/:id", authenticateToken, authorizeRole("admin"), handlePdfUpload, updateStudyMaterial);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteStudyMaterial);

module.exports = router;
