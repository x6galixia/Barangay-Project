const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");

router.get("/dashboard", (req, res) => {
    res.render("statistics/statistics", {
        title: "Statistics"
    });
});

router.get("/resident-classification", async (req, res) => {
    try {
        const classificationResults = await mPool.query(`
            SELECT 
                rc.rClassificationName, 
                COUNT(r.residentsId) AS resident_count
            FROM 
                residents r
            JOIN 
                rClassification rc ON r.rClassificationId = rc.rClassificationId
            WHERE 
                r.isResident = TRUE
            GROUP BY 
                rc.rClassificationName
            ORDER BY 
                resident_count DESC;
            `);
        res.json(classificationResults.rows);
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.get("/age-demographics", async (req, res) => {
    try {
        const ageDemographicResult = await mPool.query(`
            SELECT 
                CASE
                    WHEN r.age BETWEEN 0 AND 14 THEN '0 - 14'
                    WHEN r.age BETWEEN 15 AND 64 THEN '15 - 64'
                    WHEN r.age >= 65 THEN '65+'
                    ELSE 'Unknown'
                END AS age_range,
                COUNT(r.residentsId) AS resident_count
            FROM 
                residents r
            WHERE 
                r.isResident = TRUE  -- Only consider residents, not boarders
            GROUP BY 
                age_range
            ORDER BY 
                age_range;
            `)
        res.json(ageDemographicResult.rows);
        
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.get("/resident-status", async (req, res) => {
    try {
        const statusResults = await mPool.query(`
            SELECT 
                COUNT(CASE WHEN r.isPwd = TRUE THEN 1 END) AS pwd_count,
                COUNT(CASE WHEN r.isSoloParent = TRUE THEN 1 END) AS solo_parent_count,
                COUNT(CASE WHEN r.isYouth = TRUE THEN 1 END) AS youth_count,
                COUNT(CASE WHEN r.is4ps = TRUE THEN 1 END) AS is4ps_count
            FROM 
                residents r
            WHERE 
                r.isResident = TRUE
        `);

        res.json(statusResults.rows);
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.get("/residents-by-purok", async (req, res) => {
    try {
        const purokResults = await mPool.query(`
            SELECT 
                r.purok,
                COUNT(r.residentsId) AS resident_count
            FROM 
                residents r
            WHERE 
                r.isResident = TRUE
            GROUP BY 
                r.purok
            ORDER BY 
                resident_count DESC;
        `);

        res.json(purokResults.rows);
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;