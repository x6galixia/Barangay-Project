const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");
const { inventorySchema } = require("../../middlewares/schemas/schemas");

router.get("/dashboard", (req, res) => {
    res.render("inventory/inventory", {
        title: "Inventory"
    });
});

router.post("/dashboard/add-item", async (req, res) => {
    const { error, value } = inventorySchema.validate(req.body);

    if (error) {
        console.error("Validation error:", error.details.map(e => e.message).join(", "));
        return res.status(400).json({ error: error.details.map(e => e.message) });
    }

    try {
        const categoryIdResult = await mPool.query(`
            INSERT INTO categories (categoryName) VALUES ($1) 
            RETURNING categoryid
        `, [value.categoryName]);

        console.log("Category Insert Result:", categoryIdResult);

        if (!categoryIdResult.rows || categoryIdResult.rows.length === 0) {
            throw new Error("Failed to insert category or retrieve categoryId");
        }

        const categoryId = categoryIdResult.rows[0].categoryid;

        console.log("Retrieved categoryId:", categoryId);

        await mPool.query(`
            INSERT INTO inventory (iName, quantity, iPrice, dateAdded, categoryId, isFunctional) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [value.iName, value.quantity, value.iPrice, value.dateAdded, categoryId, value.isFunctional]);

        res.redirect("/inventory/dashboard");
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});


module.exports = router;