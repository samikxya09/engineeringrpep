require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Import database connection
require("./database/connection");

const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userroute");

// Middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
}));
app.use(express.json());

// Mount Routes (supporting both /api/* and root paths)
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/", authRoute);
app.use("/user", userRoute);

// Root Health Check Route
app.get("/", function (req, res) {
    res.json({
        message: "Nepal Engineering License Exam Preparation Backend is Running",
        status: "healthy",
        timestamp: new Date().toISOString(),
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
