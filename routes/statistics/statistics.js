const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("statistics/statistics", {
        title: "Statistics"
    });
});

module.exports = router;