const express = require('express');
const router = express.Router();
const requestSchema = require("../../middlewares/schemas/schemas");

router.get("/dashboard", (req, res) => {
    res.render("home/home", {
        title: "Home"
    });
});

router.post("/service-request-form", async (req, res) => {
    const {error, value} = requestSchema.validate(req.body);

    if (error) { return res.status(400).json({ error: error.details[0].message }); }

    try {
        
    } catch (err) {
        console.error("Error: ", err);
    }
});

module.exports = router;