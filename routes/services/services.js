const express = require('express');
const router = express.Router();
const { fetchRequestLists } = require("../../middlewares/helper-functions/fetch-functions");

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

module.exports = router;