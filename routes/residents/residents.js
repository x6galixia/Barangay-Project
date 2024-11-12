const express = require('express');
const router = express.Router();
const { fetchResidentsLists } = require("../../middlewares/helper-functions/fetch-functions");

router.get("/dashboard", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const isAjax = req.query.ajax === "true";

    try {
        const { getResidentsList, totalPages } = await fetchResidentsLists(page, limit);

        if (isAjax) {
            return res.json({
                title: "Residents",
                getResidentsList,
                user: req.user,
                currentPage: page,
                totalPages,
                limit,
            });
        }

        res.render("residents/residents", {
            title: "Residents",
            getResidentsList,
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

module.exports = router;