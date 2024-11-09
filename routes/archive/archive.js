const express = require('express');
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.send("archive dashboard");
});

module.exports = router;