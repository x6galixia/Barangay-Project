const express = require('express');
const router = express.Router();
const { fetchRequestLists } = require("../../middlewares/helper-functions/fetch-functions");
const { getCurrentDate } = require("../../middlewares/helper-functions/calculations");
const mPool = require('../../models/mDatabase');

router.get("/dashboard", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isAjax = req.query.ajax === "true";

    try {
        const { getRequestList, totalPages } = await fetchRequestLists(page, limit);

        if (isAjax) {
            return res.json({
                title: "Services",
                getRequestList,
                user: req.user,
                currentPage: page,
                totalPages,
                limit,
            });
        }

        res.render("services/services", {
            title: "Services",
            getRequestList,
            user: req.user,
            currentPage: page,
            totalPages,
            limit,
        });

    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.get("/print-services", (req, res) => {
    res.render("services/print-services");
});

router.post("/cert-record-insertion/:certName/:requestID", async (req, res) => {
    const { certName, requestID } = req.params;
    const dateNow = getCurrentDate();

    try {
        // Convert certName to JSON format
        const certJson = JSON.stringify({ certName: certName });

        // Insert into cert_record with JSON data
        await mPool.query(
            `INSERT INTO cert_record (cert_name, date_release) VALUES ($1::jsonb, $2)`, 
            [certJson, dateNow]
        );

        // Update request status
        await mPool.query(`UPDATE requests SET isreleased = true WHERE id = $1`, [requestID]);

        res.status(200).json({ message: "Request marked as done successfully." });
    } catch (err) {
        console.error("Error: ", err.stack, err.message);

        res.status(500).json({ error: "Failed to mark the request as done. Please try again." });
    }
});


router.delete("/delete-request/:residentsId/:id", async (req, res) => {
    const { residentsId, id } = req.params;
    try {
        await mPool.query(
            `DELETE FROM requests WHERE residentsId = $1 AND id = $2`,
            [residentsId, id]
        );

        res.status(200).json({ message: "Request deleted successfully." });
    } catch (err) {
        console.error("Error deleting request:", err.stack, err.message);
        res.status(500).json({ error: "Failed to delete the request. Please try again later." });
    }
});

module.exports = router;