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
        // Get the total population
        const totalPopulationResult = await mPool.query(`
            SELECT COUNT(*) AS total_population
            FROM residents
            WHERE isResident = TRUE;
        `);

        // Get the classification data grouped by Purok and Classification
        const classificationResults = await mPool.query(`
            SELECT 
                r.purok, 
                rc.rClassificationName, 
                COUNT(r.residentsId) AS resident_count
            FROM 
                residents r
            JOIN 
                rClassification rc ON r.rClassificationId = rc.rClassificationId
            WHERE 
                r.isResident = TRUE
            GROUP BY 
                r.purok, rc.rClassificationName
            ORDER BY 
                r.purok, rc.rClassificationName;
        `);

        // Organize classification data by Purok
        const classificationData = {};
        const classificationTotalCount = {};  // New object to store the total count of each rClassification

        classificationResults.rows.forEach(row => {
            const { purok, rclassificationname, resident_count } = row;

            // Group by Purok
            if (!classificationData[purok]) {
                classificationData[purok] = [];
            }
            classificationData[purok].push({
                rClassificationName: rclassificationname,
                resident_count: parseInt(resident_count) // Ensure it's a number
            });

            // Aggregate the total count by rClassificationName
            if (!classificationTotalCount[rclassificationname]) {
                classificationTotalCount[rclassificationname] = 0;
            }
            classificationTotalCount[rclassificationname] += parseInt(resident_count);
        });

        // Send response with the totals by classification
        res.json({
            overall: {
                total_population: totalPopulationResult.rows[0].total_population
            },
            perPurok: classificationData,
            totalClassificationData: classificationTotalCount
        });

    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.get("/age-demographics", async (req, res) => {
    try {
        const ageDemographicResult = await mPool.query(`
            SELECT 
                r.purok, 
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
                r.isResident = TRUE
            GROUP BY 
                r.purok, age_range
            ORDER BY 
                r.purok, age_range;
        `);
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
                r.purok,
                COUNT(CASE WHEN r.isPwd = TRUE THEN 1 END) AS pwd_count,
                COUNT(CASE WHEN r.isSoloParent = TRUE THEN 1 END) AS solo_parent_count,
                COUNT(CASE WHEN r.isYouth = TRUE THEN 1 END) AS youth_count,
                COUNT(CASE WHEN r.is4ps = TRUE THEN 1 END) AS is4ps_count
            FROM 
                residents r
            WHERE 
                r.isResident = TRUE
            GROUP BY 
                r.purok
            ORDER BY 
                r.purok;
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

//group by purok, then get total population, male , female, senior, pwd
router.get("/barangay-population", async (req, res) => {
    try {
        const totalPopulationResult = await mPool.query(`
            SELECT 
                r.purok,
                COUNT(*) AS total_population,
                COUNT(CASE WHEN r.gender = 'Male' THEN 1 END) AS male_count,
                COUNT(CASE WHEN r.gender = 'Female' THEN 1 END) AS female_count,
                COUNT(CASE WHEN r.age >= 60 THEN 1 END) AS senior_count,
                COUNT(CASE WHEN r.isPwd = TRUE THEN 1 END) AS pwd_count
            FROM 
                residents r
            WHERE
                r.isResident = TRUE
            GROUP BY 
                r.purok
            ORDER BY 
                r.purok;
        `);

        const overallPopulationResult = await mPool.query(`
            SELECT
                COUNT(*) AS total_population,
                COUNT(CASE WHEN r.gender = 'Male' THEN 1 END) AS male_count,
                COUNT(CASE WHEN r.gender = 'Female' THEN 1 END) AS female_count,
                COUNT(CASE WHEN r.age >= 60 THEN 1 END) AS senior_count,
                COUNT(CASE WHEN r.isPwd = TRUE THEN 1 END) AS pwd_count
            FROM 
                residents r
            WHERE 
                r.isResident = TRUE;
        `);

        res.json({
            overall: overallPopulationResult.rows[0],
            perPurok: totalPopulationResult.rows
        });
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});


module.exports = router;