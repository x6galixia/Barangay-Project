const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("services/services", {
        title: "Services"
    });
});


router.get("/print-services", (req, res) => {
    res.render("services/print-services");
});

module.exports = router;