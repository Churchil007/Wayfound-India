const express = require("express");
const cors = require("cors");
const path = require("path");

const sitesRouter = require("./routes/sites");
const visitedRouter = require("./routes/visited");

const app = express();

const PORT = process.env.PORT || 4000;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    cors({
        origin: [
            "http://localhost:5500",
            "http://127.0.0.1:5500"
        ]
    })
);

app.use(express.json());

// ============================================================
// API ROUTES
// ============================================================

app.use("/api/sites", sitesRouter);

app.use("/api/visited", visitedRouter);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "ok",
        message: "Wayfound India backend is running"
    });
});

// ============================================================
// FRONTEND
// ============================================================

const FRONTEND_DIR = path.join(
    __dirname,
    "..",
    "frontend"
);

app.use(express.static(FRONTEND_DIR));

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            FRONTEND_DIR,
            "index.html"
        )
    );
});

// ============================================================
// API 404
// ============================================================

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {

    console.log("");
    console.log("======================================");
    console.log("       WAYFOUND INDIA BACKEND");
    console.log("======================================");
    console.log(
        `Backend : http://localhost:${PORT}`
    );
    console.log(
        "Frontend: http://127.0.0.1:5500"
    );
    console.log(
        `Sites   : http://localhost:${PORT}/api/sites`
    );
    console.log(
        `Visited : http://localhost:${PORT}/api/visited`
    );
    console.log("======================================");
    console.log("");

});