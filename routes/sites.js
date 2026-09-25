const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const DATA_FILE = path.join(
    __dirname,
    "..",
    "data",
    "sites.json"
);

// ============================================================
// GET ALL SITES
// ============================================================

router.get("/", (req, res) => {

    try {

        if (!fs.existsSync(DATA_FILE)) {
            return res.status(404).json({
                success: false,
                message: "sites.json not found"
            });
        }

        const data = fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

        const sites = JSON.parse(data);

        res.json(sites);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to load sites"
        });

    }

});

// ============================================================
// GET SITE BY ID
// ============================================================

router.get("/:id", (req, res) => {

    try {

        const data = fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

        const sites = JSON.parse(data);

        const site = sites.find(
            item =>
                String(item.id) ===
                String(req.params.id)
        );

        if (!site) {
            return res.status(404).json({
                success: false,
                message: "Site not found"
            });
        }

        res.json(site);

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Unable to load site"
        });

    }

});

module.exports = router;