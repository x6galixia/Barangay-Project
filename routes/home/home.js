const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.send("home dashboard");
});

module.exports = router;