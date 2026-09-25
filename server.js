const express = require("express");
const cors = require("cors");
const path = require("path");

const sitesRouter = require("./routes/sites");
const visitedRouter = require("./routes/visited");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/sites", sitesRouter);
app.use("/api/visited", visitedRouter);

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "ok",
        message: "Wayfound India backend is running"
    });
});

// Serve frontend files
app.use(express.static(__dirname));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// API 404
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

module.exports = app;
