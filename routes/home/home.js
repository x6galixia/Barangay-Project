const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("home/home", {
        title: "Home"
    });
});

module.exports = router;