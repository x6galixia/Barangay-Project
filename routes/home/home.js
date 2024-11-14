const express = require('express');
const router = express.Router();
const requestSchema = require("../../middlewares/schemas/schemas");
const mPool = require("../../models/mDatabase");

router.get("/dashboard", (req, res) => {
    res.render("home/home", {
        title: "Home"
    });
});

router.get("/dashboard/fetchScannedData", async (req, res) => {
    const { qrCode } = req.query;
    console.log("Received scanned QR Code:", qrCode);

    try {
        // First query for the beneficiary table in the pharmacy database
        const residentQuery = `
        SELECT * FROM residents
        WHERE globalid = $1
      `;

        const residentResult = await mPool.query(residentQuery, [
            qrCode,
        ]);

        if (residentResult.rows.length > 0) {
            // If found in beneficiary table
            res.json(residentResult.rows[0]);
        } else {
            console.log(`User not found for this id=${qrCode}`);
        }
    } catch (err) {
        console.error("Error querying database:", err.message);
        res.status(500).send("Server error");
    }
});

router.post("/service-request-form", async (req, res) => {
    const { error, value } = requestSchema.validate(req.body);

    if (error) { return res.status(400).json({ error: error.details[0].message }); }

    try {

    } catch (err) {
        console.error("Error: ", err);
    }
});

module.exports = router;