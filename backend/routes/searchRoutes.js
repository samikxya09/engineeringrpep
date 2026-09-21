const express = require("express");
const router = express.Router();

const { globalSearch } = require("../Controllers/searchController");

// Public / Student Global Search
router.get("/", globalSearch);

module.exports = router;
