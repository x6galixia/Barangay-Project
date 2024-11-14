const express = require('express');
const router = express.Router();
const { requestSchema } = require("../../middlewares/schemas/schemas");
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
        const residentQuery = `
        SELECT * FROM residents
        WHERE globalid = $1
      `;

        const residentResult = await mPool.query(residentQuery, [
            qrCode,
        ]);

        if (residentResult.rows.length > 0) {
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
    console.log("scannedData", value)
    if (error) { return res.status(400).json({ error: error.details[0].message }); }

    try {
        const residentExistQuery = `SELECT residentsid FROM residents WHERE globalid = $1`;
        const residentExistResult = await mPool.query(residentExistQuery, [value.id]);

        if (residentExistResult.rows.length > 0) {
            const residentsid = residentExistResult.rows[0].residentsid; // Get the residentsid from the query result

            const todayDate = new Date().toISOString().split('T')[0]; // Format today's date as YYYY-MM-DD

            await mPool.query(`
                INSERT INTO requests (residentsid, dateadded, purpose) VALUES
                ($1, $2, $3)`, [residentsid, todayDate, value.purpose]);

            req.flash('success', 'Request is transfered in services!');
        } else {
            req.flash('error', 'QR not registered in the database!');
        }

        res.redirect('/home/dashboard');

    } catch (err) {
        console.error("Error: ", err);
        req.flash('error', 'An error occurred while processing your request.');
        res.redirect('/home/dashboard');
    }
});

module.exports = router;