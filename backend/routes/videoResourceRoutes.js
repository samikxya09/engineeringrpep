const express = require("express");
const router = express.Router();

const {
    getAllVideoResources,
    getVideosBySubject,
    getVideosByChapter,
    getVideoResourceById,
    searchVideoResources,
    createVideoResource,
    updateVideoResource,
    deleteVideoResource,
} = require("../Controllers/videoResourceController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRole } = require("../middleware/authorizeRole");

// Student / Public Video Resource Routes
router.get("/", getAllVideoResources);
router.get("/search", searchVideoResources);
router.get("/subject/:subjectId", getVideosBySubject);
router.get("/chapter/:chapterId", getVideosByChapter);
router.get("/:id", getVideoResourceById);

// Admin Management Routes (Protected by JWT Auth + Admin Role)
router.post("/", authenticateToken, authorizeRole("admin"), createVideoResource);
router.put("/:id", authenticateToken, authorizeRole("admin"), updateVideoResource);
router.delete("/:id", authenticateToken, authorizeRole("admin"), deleteVideoResource);

module.exports = router;
