require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Import database connection
require("./database/connection");

const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userroute");
const facultyRoutes = require("./routes/facultyRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const questionRoutes = require("./routes/questionRoutes");
const examRoutes = require("./routes/examRoutes");
const resultRoutes = require("./routes/resultRoutes");
const studyMaterialRoutes = require("./routes/studyMaterialRoutes");
const videoResourceRoutes = require("./routes/videoResourceRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");
const searchRoutes = require("./routes/searchRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));
app.use(express.json());

// Mount Routes (supporting both /api/* and root paths)
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/faculties", facultyRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/admin/results", resultRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/video-resources", videoResourceRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/search", searchRoutes);
app.use("/", authRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoutes);
app.use("/faculties", facultyRoutes);
app.use("/subjects", subjectRoutes);
app.use("/chapters", chapterRoutes);
app.use("/questions", questionRoutes);
app.use("/exams", examRoutes);
app.use("/results", resultRoutes);
app.use("/admin/results", resultRoutes);
app.use("/study-materials", studyMaterialRoutes);
app.use("/video-resources", videoResourceRoutes);
app.use("/bookmarks", bookmarkRoutes);
app.use("/search", searchRoutes);

// Root Health Check Route
app.get("/", function (req, res) {
    res.json({
        message: "Nepal Engineering License Exam Preparation Backend is Running",
        status: "healthy",


    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
