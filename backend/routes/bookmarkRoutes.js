const express = require("express");
const router = express.Router();

const {
    addBookmark,
    getMyBookmarks,
    removeBookmark,
} = require("../Controllers/bookmarkController");

const { authenticateToken } = require("../middleware/authMiddleware");

// All bookmark actions belong to authenticated students
router.post("/", authenticateToken, addBookmark);
router.get("/", authenticateToken, getMyBookmarks);
router.delete("/:questionId", authenticateToken, removeBookmark);

module.exports = router;
