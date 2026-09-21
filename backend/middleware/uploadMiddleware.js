const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/study-materials");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitize original filename and append unique timestamp
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}-${sanitizedName}`);
    },
});

// File filter to restrict to PDF only
const fileFilter = (req, file, cb) => {
    const fileExt = path.extname(file.originalname).toLowerCase();
    const isPdfExt = fileExt === ".pdf";
    const isPdfMime = file.mimetype === "application/pdf";

    if (isPdfExt && isPdfMime) {
        cb(null, true);
    } else {
        const error = new Error("Invalid file type. Only PDF files (.pdf) are allowed.");
        error.code = "INVALID_FILE_TYPE";
        cb(error, false);
    }
};

// 50MB limit
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
});

module.exports = {
    upload,
    uploadDir,
};
