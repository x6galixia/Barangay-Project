const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("archive/archive", {
        title: "Archive"
    });
});

module.exports = router;