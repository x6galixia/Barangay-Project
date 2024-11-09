const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("services/services", {
        title: "Services"
    });
});

module.exports = router;