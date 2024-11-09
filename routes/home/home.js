const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("Home/home");
});

module.exports = router;