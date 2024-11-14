const express = require('express');
const router = express.Router();
const { fetchResidentsLists } = require("../../middlewares/helper-functions/fetch-functions");

router.get("/dashboard", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const isAjax = req.query.ajax === "true";

    console.log("Search Query on Backend: ", searchQuery); // Debug search query

    if (page <= 0 || limit <= 0) {
        return res.status(400).send("Invalid page or limit value");
    }

    try {
        const { getResidentsList, totalPages } = await fetchResidentsLists(page, limit, searchQuery);

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