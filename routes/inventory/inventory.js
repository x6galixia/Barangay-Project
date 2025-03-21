const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");
const { fetchInventoryLists } = require("../../middlewares/helper-functions/fetch-functions");
const { inventorySchema } = require("../../middlewares/schemas/schemas");

router.get("/dashboard", async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const searchQuery = req.query.search || '';
    const isFunctional = req.query.isFunctional === "true";
    const isAjax = req.query.ajax === "true" || req.xhr;

    try {
        const { getInventoryList, totalPages } = await fetchInventoryLists(page, limit, searchQuery, isFunctional);

        if (isAjax) {
            return res.json({
                title: "Inventory",
                getInventoryList,
                user: req.user,
                currentPage: page,
                totalPages,
                limit,
            });
        }

        res.render("inventory/inventory", {
            title: "Inventory",
            getInventoryList,
            user: req.user,
            currentPage: page,
            totalPages,
            limit,
        });
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.get("/dashboard/item/:id", async (req, res) => {
    const itemId = req.params.id;
    try {
        const query = `
            SELECT i.id, i.iName, i.quantity, i.iPrice, i.dateAdded, i.isFunctional, 
                   c.categoryName
            FROM inventory i
            JOIN categories c ON i.categoryId = c.categoryId
            WHERE i.id = $1;
        `;
        const itemData = await mPool.query(query, [itemId]);

        if (itemData.rows.length > 0) {
            res.json(itemData.rows[0]);
        } else {
            res.status(404).send("Item not found");
        }
    } catch (err) {
        console.error("Error: ", err.stack, err.message);
        res.status(500).send("Internal server error");
    }
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


        if (!categoryIdResult.rows || categoryIdResult.rows.length === 0) {
            throw new Error("Failed to insert category or retrieve categoryId");
        }

        const categoryId = categoryIdResult.rows[0].categoryid;


        await mPool.query(`
            INSERT INTO inventory (iName, quantity, iPrice, dateAdded, categoryId, isFunctional) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [value.iName, value.quantity, value.iPrice, value.dateAdded, categoryId, value.isFunctional]);

        req.flash('success', 'Item Added Successfully!');
        res.redirect(value.isFunctional === true 
            ? "/inventory/dashboard?type=functional" 
            : (value.isFunctional === false 
                ? "/inventory/dashboard?type=non-functional" 
                : "/inventory/dashboard")
        );
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.post("/dashboard/update-item", async (req, res) => {
    const { error, value } = inventorySchema.validate(req.body);
    const { itemId } = value;

    if (error) {
        console.error("Validation error:", error.details.map(e => e.message).join(", "));
        return res.status(400).json({ error: error.details.map(e => e.message) });
    }

    try {
        let categoryId;

        if (value.categoryName) {
            const categoryIdResult = await mPool.query(`
                SELECT categoryid FROM categories WHERE categoryName = $1
            `, [value.categoryName]);


            if (!categoryIdResult.rows || categoryIdResult.rows.length === 0) {
                return res.status(404).json({ error: "Category not found" });
            }

            categoryId = categoryIdResult.rows[0].categoryid;
        }


        const updateResult = await mPool.query(`
            UPDATE inventory 
            SET iName = $1, quantity = $2, iPrice = $3, dateAdded = $4, categoryId = $5, isFunctional = $6
            WHERE id = $7
        `, [
            value.iName,
            value.quantity,
            value.iPrice,
            value.dateAdded,
            categoryId || value.categoryId,
            value.isFunctional,
            itemId
        ]);

        if (updateResult.rowCount === 0) {
            return res.status(404).json({ error: "Item not found" });
        }

        req.flash('success', 'Item Updated Successfully!');
        res.redirect(value.isFunctional === true 
            ? "/inventory/dashboard?type=functional" 
            : (value.isFunctional === false 
                ? "/inventory/dashboard?type=non-functional" 
                : "/inventory/dashboard")
        );
    } catch (err) {
        console.error("Error: ", err.stack, err.message);
        res.status(500).send("Internal server error");
    }
});

router.delete("/delete-item/:id", async (req, res) => {
    const itemId = req.params.id;
    try {
        await mPool.query(`DELETE FROM inventory WHERE id = $1`, [itemId]);
        req.flash('success', 'Item Deleted Successfully!');
        res.redirect("/inventory/dashboard");
    } catch (err) {
        console.error("Error: ", err.stack, err.message);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;