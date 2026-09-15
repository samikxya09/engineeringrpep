require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// Import database connection
require("./database/connection");

const userRoute = require("./routes/userroute");

// Middleware
app.use(cors());
app.use(express.json());

app.use("/", userRoute);

// Test Route
app.get("/", function (req, res) {
    res.send("Engineering Prep Backend is Running...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
