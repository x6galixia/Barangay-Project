const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");
const { fetchArchiveLists } = require("../../middlewares/helper-functions/fetch-functions");
const { archiveSchema } = require("../../middlewares/schemas/schemas");

const multer = require("multer");
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/archive-img/';

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
router.use("/uploads/archive-img", express.static("uploads"));

router.get("/dashboard", async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const searchQuery = req.query.search || '';
    const isAjax = req.query.ajax === "true" || req.xhr;

    try {
        const { getArchiveList, totalPages } = await fetchArchiveLists(page, limit, searchQuery);

        if (isAjax) {
            return res.json({
                title: "Archive",
                getArchiveList,
                currentPage: page,
                totalPages,
                limit,
            });
        }

        res.render("archive/archive", {
            title: "Archive",
            getArchiveList,
            currentPage: page,
            totalPages,
            limit,
        });
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.get("/archive-item/:id", async (req, res) => {
    const itemId = req.params.id;
    try {

        const archiveData = await mPool.query(`SELECT * FROM archive WHERE id = $1`, [itemId]);

        if (archiveData.rows.length > 0) {
            console.log("Archive data: ",archiveData.rows[0]);
        } else {
            console.log(`No Archive data for archive Id: ${itemId}`);
        }

        res.json(archiveData.rows[0]);
        
    } catch (err) {
        console.error("Error: ", err.stack, err.message);
        res.status(500).send("Internal server error");
    }
});

router.post("/dashboard/add-archive", upload.single('picture'), async (req, res) => {
    const { error, value } = archiveSchema.validate(req.body);
    const picture = req.file ? req.file.filename : null;

    if (error) {
        console.error("Validation error:", error.details.map(e => e.message).join(", "));
        return res.status(400).json({ error: error.details.map(e => e.message) });
    }

    const contractingPersons = [value.parties1, value.parties2]
        .filter(Boolean)
        .join(' and ');

    console.log(contractingPersons);

    try {

        if (picture) {
            console.log(`Processed file: ${picture}`);
        } else {
            console.log("No file received or file upload failed");
        }

        await mPool.query(`
            INSERT INTO archive (date, img, docType, contractingPersons) VALUES ($1, $2, $3, $4)
            `, [value.date, picture, value.docType, contractingPersons]);

        req.flash('success', 'Document Added Successfully!');
        res.redirect("/archive/dashboard");
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.post("/update-archive-item", upload.single('picture'), async (req, res) => {
    const { error, value } = archiveSchema.validate(req.body);
    const picture = req.file ? req.file.filename : null;

    if (error) {
        console.error("Validation error:", error.details.map(e => e.message).join(", "));
        return res.status(400).json({ error: error.details.map(e => e.message) });
    }

    const contractingPersons = [value.parties1, value.parties2]
        .filter(Boolean)
        .join(' and ');

    try {

        if (picture) {
            console.log(`Processed file: ${picture}`);
        } else {
            console.log("No file received or file upload failed");
        }

        await mPool.query(`
            UPDATE archive SET date = $2, img = $3, docType = $4, contractingPersons = $5 WHERE id = $1`, [value.itemId, value.date, picture, value.docType, contractingPersons]);

        req.flash('success', 'Document UPDATED Successfully!');
        res.redirect("/archive/dashboard");
        
    } catch (err) {
        console.error("Error: ", err.stack, err.message);
        res.status(500).send("Internal Server error");
    }
});

router.delete("/delete-archive-item/:id", async (req, res) => {
    const archiveId = req.params.id;
    try {
        await mPool.query(`DELETE FROM archive WHERE id = $1`, [archiveId]);
        req.flash('success', 'Document DELETED Successfully!');
        res.redirect("/archive/dashboard")
    } catch (err) {
        console.error("Error: ", err.stack, err.message);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;