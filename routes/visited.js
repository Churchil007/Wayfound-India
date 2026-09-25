const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const VISITED_FILE = path.join(
    __dirname,
    "..",
    "data",
    "visited.json"
);


// ============================================================
// GET VISITED SITES
// ============================================================

router.get("/", (req, res) => {

    try {

        if (!fs.existsSync(VISITED_FILE)) {

            fs.writeFileSync(
                VISITED_FILE,
                JSON.stringify(
                    { visited: [] },
                    null,
                    2
                )
            );

        }

        const data = fs.readFileSync(
            VISITED_FILE,
            "utf8"
        );

        res.json(JSON.parse(data));

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to load visited sites"
        });

    }

});


// ============================================================
// MARK SITE AS VISITED
// ============================================================

router.post("/", (req, res) => {

    try {

        const { siteId } = req.body;

        if (!siteId) {

            return res.status(400).json({
                success: false,
                message: "siteId is required"
            });

        }


        if (!fs.existsSync(VISITED_FILE)) {

            fs.writeFileSync(
                VISITED_FILE,
                JSON.stringify(
                    { visited: [] },
                    null,
                    2
                )
            );

        }


        const data = JSON.parse(
            fs.readFileSync(
                VISITED_FILE,
                "utf8"
            )
        );


        const id = String(siteId);


        if (!data.visited.includes(id)) {

            data.visited.push(id);

        }


        fs.writeFileSync(
            VISITED_FILE,
            JSON.stringify(
                data,
                null,
                2
            )
        );


        res.json({
            success: true,
            message: "Site marked as visited",
            visited: data.visited
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Unable to save visited site"
        });

    }

});


module.exports = router;