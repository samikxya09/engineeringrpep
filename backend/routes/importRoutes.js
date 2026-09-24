const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
    importSubjects,
    importChapters,
    importQuestions,
} = require("../Controllers/importController");

// Ensure CSV uploads directory exists
const csvUploadDir = path.join(__dirname, "../uploads/csv");
if (!fs.existsSync(csvUploadDir)) {
    fs.mkdirSync(csvUploadDir, { recursive: true });
}

// Multer storage configuration for CSV uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, csvUploadDir);
    },
    filename: function (req, file, cb) {
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `import-${uniqueSuffix}-${sanitizedName}`);
    },
});

// File filter to ensure only CSV files are accepted
const csvFileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isCsvExt = ext === ".csv";
    const allowedMimeTypes = [
        "text/csv",
        "text/plain",
        "application/vnd.ms-excel",
        "application/csv",
        "text/x-csv",
        "application/octet-stream",
    ];

    if (isCsvExt || allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error("Invalid file type. Only CSV files (.csv) are allowed.");
        error.code = "INVALID_FILE_TYPE";
        cb(error, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: csvFileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
    },
});

/**
 * Friendly error-handling wrapper for Multer single file upload.
 * Supports field names 'file', 'csv', or 'upload'.
 */
function handleCsvUpload(req, res, next) {
    const uploadSingle = upload.fields([
        { name: "file", maxCount: 1 },
        { name: "csv", maxCount: 1 },
        { name: "upload", maxCount: 1 },
    ]);

    uploadSingle(req, res, function (err) {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    message: "File is too large. Maximum allowed size is 20MB.",
                });
            }
            if (err.code === "INVALID_FILE_TYPE") {
                return res.status(400).json({
                    message: err.message || "Only CSV files (.csv) are allowed.",
                });
            }
            return res.status(400).json({
                message: err.message || "Error uploading CSV file.",
            });
        }

        // Normalize uploaded file to req.file
        if (req.files) {
            if (req.files.file && req.files.file[0]) {
                req.file = req.files.file[0];
            } else if (req.files.csv && req.files.csv[0]) {
                req.file = req.files.csv[0];
            } else if (req.files.upload && req.files.upload[0]) {
                req.file = req.files.upload[0];
            }
        }

        next();
    });
}

// CSV Bulk Import Endpoints
router.post("/subjects", handleCsvUpload, importSubjects);
router.post("/chapters", handleCsvUpload, importChapters);
router.post("/questions", handleCsvUpload, importQuestions);

module.exports = router;
