const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
    res.render("officials/officials", {
        title: "Statistics"
    });
})

module.exports = router;