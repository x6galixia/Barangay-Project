const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");
const { fetchArchiveData } = require("../../middlewares/helper-functions/fetch-functions");
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

const docTypeMap = {
    "Lupon": 2,
    "Ordinance": 3,
    "Panumduman": 1,
    "Regularization Minutes": 5,
    "Resolution": 4
};

router.get("/dashboard", async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const searchQuery = req.query.search || '';
    const doctype = req.query.doctype || null; // Fetch the document type filter if provided
    const isAjax = req.query.ajax === "true" || req.xhr;

    try {
        // Call the fetchArchiveData function
        const { archiveList, totalPages } = await fetchArchiveData(page, limit, searchQuery, doctype);

        if (isAjax) {
            // If Ajax request, send JSON response
            return res.json({
                title: "Archive",
                archiveList,
                currentPage: page,
                totalPages,
                limit,
            });
        }

        // If standard request, render the archive page
        res.render("archive/archive", {
            title: "Archive",
            archiveList,
            currentPage: page,
            totalPages,
            limit,
        });

    } catch (err) {
        console.error("Error fetching archive data: ", err.message, err.stack);
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

router.post('/dashboard/add-archive', upload.single('image'), async (req, res) => {
    console.log("Request Body:", req.body);
    console.log("File:", req.file);

    const docType = req.body.docType;
    const doctypeId = docTypeMap[docType]; // Mapping docType to doctypeId

    if (!doctypeId) {
        return res.status(400).json({ error: `Invalid document type: ${docType}` });
    }

    const requestData = {
        doctypeId: doctypeId,
        documentData: {
            ...req.body,
            image: req.file?.filename || null
        }
    };

    // Validate the data against the schema
    const { error } = archiveSchema.validate(requestData);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        await mPool.query('BEGIN'); // Start a transaction

        // Insert into the archive table
        const archiveResult = await mPool.query(
            `INSERT INTO archive (doctypeId) VALUES ($1) RETURNING archiveId`,
            [doctypeId]
        );
        const archiveId = archiveResult.rows[0].archiveid;

        const contractingPersons = [req.body.parties1, req.body.parties2]
        .filter(Boolean)
        .join(',');

        const authors = [req.body.author1, req.body.author2, req.body.author3]
        .filter(Boolean)
        .join(',');

        const coAuthors = [req.body.coAuthor1, req.body.coAuthor2, req.body.coAuthor3]
        .filter(Boolean)
        .join(',');

        const sponsors = [req.body.sponsor1, req.body.sponsor2, req.body.sponsor3]
        .filter(Boolean)
        .join(',');

        console.log(contractingPersons);

        // Insert into the specific document table based on docType
        if (doctypeId === 1) { // Panumduman
            await mPool.query(
                `INSERT INTO panumduman (archiveId, date, image, contractingPersons)
                 VALUES ($1, $2, $3, $4)`,
                [archiveId, req.body.date, req.file?.path, contractingPersons]
            );
        } else if (doctypeId === 2) { // Lupon
            await mPool.query(
                `INSERT INTO lupon (archiveId, caseNumber, complainant, respondent, dateFiled, image, caseType)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    archiveId,
                    req.body.luponCaseNumber,
                    req.body.complainant,
                    req.body.respondent,
                    req.body.dateFiled,
                    requestData.documentData.image,
                    req.body.caseType
                ]
            );
        } else if (doctypeId === 3) { // Ordinance
            await mPool.query(
                `INSERT INTO ordinance (archiveId, ordinanceNumber, title, authors, coAuthors, sponsors, image, dateApproved)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    archiveId,
                    req.body.ordinanceNumber,
                    req.body.ordinanceTitle,
                    authors,
                    coAuthors,
                    sponsors,
                    requestData.documentData.image,
                    req.body.dateApproved
                ]
            );
        } else if (doctypeId === 4) { // Resolution
            await mPool.query(
                `INSERT INTO resolution (archiveId, resolutionNumber, seriesYear, image, date)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    archiveId,
                    req.body.resolutionNumber,
                    req.body.yearSeries,
                    requestData.documentData.image,
                    req.body.date
                ]
            );
        } else if (doctypeId === 5) { // Regularization Minutes
            await mPool.query(
                `INSERT INTO regularization_minutes (archiveId, regulationNumber, image, date)
                 VALUES ($1, $2, $3, $4)`,
                [
                    archiveId,
                    req.body.regulationNumber,
                    requestData.documentData.image,
                    req.body.date
                ]
            );
        } else {
            throw new Error('Unhandled document type');
        }

        await mPool.query('COMMIT'); // Commit transaction
        req.flash('success', 'Document ADDED Successfully!');
        res.redirect(`/archive/dashboard?type=${docType}`)
    } catch (error) {
        await mPool.query('ROLLBACK'); // Rollback transaction on error
        res.status(500).json({ error: error.message });
    }
});

router.post("/update-archive-item", upload.single('picture'), async (req, res) => {

});

router.delete("/delete-archive-item/:id", async (req, res) => {
    const archiveId = req.params.id;
    console.log(archiveId);
    
    try {
        await mPool.query(`DELETE FROM archive WHERE archiveId = $1`, [archiveId]);
        res.redirect("/archive/dashboard");
    } catch (err) {
        console.error("Error: ", err.stack, err.message);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;