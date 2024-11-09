const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("residents/residents", {
        title: "Residents"
    });
});

module.exports = router;