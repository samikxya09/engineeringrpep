const express = require("express");
const router = express.Router();

const { getAllFaculties, getSubjectsByFaculty } = require("../Controllers/facultyController");

// Public routes for faculties and subjects
router.get("/", getAllFaculties);
router.get("/:facultyId/subjects", getSubjectsByFaculty);

module.exports = router;
