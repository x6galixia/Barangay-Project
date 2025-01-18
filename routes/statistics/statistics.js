const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");
const { getCurrentDate } = require("../../middlewares/helper-functions/calculations");
const { houseClassification } = require("../../middlewares/schemas/schemas");

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
                COUNT(CASE WHEN r.is4ps = TRUE THEN 1 END) AS is4ps_count,
                COUNT(CASE WHEN r.isOutOfSchoolYouth = TRUE THEN 1 END) AS isosy_count,
                COUNT(CASE WHEN r.isSkm = TRUE THEN 1 END) AS skm_count,
                COUNT(CASE WHEN r.isKm = TRUE THEN 1 END) AS km_count,
                COUNT(CASE WHEN r.isResident = FALSE THEN 1 END) AS rb_count
            FROM 
                residents r
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

router.get('/available-years', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT EXTRACT(YEAR FROM date) AS year
            FROM house_classification
            ORDER BY year DESC;
        `;
        const { rows } = await mPool.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Internal server error");
    }
});

router.get("/house-classification", async (req, res) => {
    const { year } = req.query;

    if (!year) {
        return res.status(400).json({ error: 'Year is required' });
    }

    try {
        // Query for house classification statistics by year, grouped by purok, housingMaterials, and waterSource
        const query = `
            SELECT 
                EXTRACT(YEAR FROM date) AS year,
                purok,
                -- Count occurrences of each housing material
                COUNT(CASE WHEN housingMaterials = 'Concrete' THEN 1 END) AS concrete_count,
                COUNT(CASE WHEN housingMaterials = 'Semi-Concrete' THEN 1 END) AS semi_concrete_count,
                COUNT(CASE WHEN housingMaterials = 'Wood' THEN 1 END) AS wood_count,
                -- Count occurrences of each water source
                COUNT(CASE WHEN waterSource LIKE '%Deep Well%' THEN 1 END) AS deep_well_count,
                COUNT(CASE WHEN waterSource LIKE '%Water Pump%' THEN 1 END) AS water_pump_count,
                COUNT(CASE WHEN waterSource LIKE '%Mineral%' THEN 1 END) AS mineral_count,
                COUNT(id) AS total_house_classifications,
                SUM(numberOfFamilies) AS total_families,
                SUM(CASE WHEN isWithCr THEN 1 ELSE 0 END) AS total_with_cr,
                SUM(CASE WHEN isWith40mZone THEN 1 ELSE 0 END) AS total_with_40m_zone,
                SUM(CASE WHEN isEnergized THEN 1 ELSE 0 END) AS total_energized
            FROM house_classification
            WHERE EXTRACT(YEAR FROM date) = $1
            GROUP BY year, purok
            ORDER BY year, purok;
        `;
        
        // Execute the query
        const { rows } = await mPool.query(query, [year]);

        // Query for overall statistics (without grouping by purok)
        const overallQuery = `
            SELECT 
                COUNT(id) AS overall_house_classifications,
                SUM(numberOfFamilies) AS overall_families,
                SUM(CASE WHEN isWithCr THEN 1 ELSE 0 END) AS overall_with_cr,
                SUM(CASE WHEN isWith40mZone THEN 1 ELSE 0 END) AS overall_with_40m_zone,
                SUM(CASE WHEN isEnergized THEN 1 ELSE 0 END) AS overall_energized
            FROM house_classification
            WHERE EXTRACT(YEAR FROM date) = $1;
        `;

        const { rows: overallRows } = await mPool.query(overallQuery, [year]);

        // Map rows to ensure numeric values
        const formattedRows = rows.map(row => ({
            ...row,
            concrete_count: Number(row.concrete_count),
            semi_concrete_count: Number(row.semi_concrete_count),
            wood_count: Number(row.wood_count),
            deep_well_count: Number(row.deep_well_count),
            water_pump_count: Number(row.water_pump_count),
            mineral_count: Number(row.mineral_count),
            total_house_classifications: Number(row.total_house_classifications),
            total_families: Number(row.total_families),
            total_with_cr: Number(row.total_with_cr),
            total_with_40m_zone: Number(row.total_with_40m_zone),
            total_energized: Number(row.total_energized)
        }));

        // Overall statistics
        const overall = overallRows[0] ? {
            overall_house_classifications: Number(overallRows[0].overall_house_classifications),
            overall_families: Number(overallRows[0].overall_families),
            overall_with_cr: Number(overallRows[0].overall_with_cr),
            overall_with_40m_zone: Number(overallRows[0].overall_with_40m_zone),
            overall_energized: Number(overallRows[0].overall_energized)
        } : {};

        // Send the response
        res.json({
            year: year,
            statistics: formattedRows,
            overall: overall
        });
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.post("/house-classification-survey", async (req, res) => {

    // Parse number fields
    req.body.houseNumber = req.body.houseNumber ? parseInt(req.body.houseNumber, 10) : null;
    req.body.numberOfFamilies = parseInt(req.body.numberOfFamilies, 10);

    // Joi validation
    const { error, value } = houseClassification.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details.map(e => e.message) });
    }

    // Water source aggregation
    const waterSource = [value.deepWell, value.waterPump, value.mineral].filter(Boolean).join(',');

    const date = getCurrentDate();
    try {
        await mPool.query(`
            INSERT INTO house_classification 
            (date, purok, houseNumber, houseRepresentative, numberOfFamilies, isWithCr, isWith40mZone, isEnergized, housingMaterials, waterSource)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
            date,
            value.surveyPurok,
            value.houseNumber,
            value.houseRepresentative,
            value.numberOfFamilies,
            value.isWithCr,
            value.isWith40mZone,
            value.isEnergized,
            value.housingMaterials,
            waterSource
        ]);

        req.flash('success', 'Survey added successfully!');
        res.redirect('/statistics/dashboard');
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).send("Internal server error");
    }
});

router.get('/available-years-for-certcount', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT EXTRACT(YEAR FROM date_release) AS year
            FROM cert_record
            ORDER BY year DESC;
        `;
        const { rows } = await mPool.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).send("Internal server error");
    }
});

router.get('/certcount', async (req, res) => {
    const { year } = req.query;

    if (!year || isNaN(year)) {
        return res.status(400).json({ error: 'Year is required and must be a valid number.' });
    }

    try {
        const query = `
            SELECT 
                (cert_name::json ->> 'certName') AS cert_name, 
                COUNT(*) AS total
            FROM cert_record
            WHERE EXTRACT(YEAR FROM date_release) = $1
            GROUP BY (cert_name::json ->> 'certName')
            ORDER BY total DESC;
        `;

        const result = await mPool.query(query, [parseInt(year, 10)]);
        console.log("rowsss",result.rows)
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  
module.exports = router;