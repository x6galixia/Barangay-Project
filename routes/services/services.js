const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("services/services", {
        title: "Services"
    });
});


router.get("/indigency", (req, res) => {
    res.render("services/indigency");
});

module.exports = router;