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

    // Validate the ID
    if (!itemId || isNaN(itemId)) {
        return res.status(400).json({ error: "Invalid or missing archive ID." });
    }

    try {
        // Fetch the archive item from the database
        const archiveQuery = `
            SELECT a.*, dt.typeName 
            FROM archive a
            INNER JOIN document_type dt ON a.doctypeId = dt.doctypeId
            WHERE a.archiveId = $1
        `;
        const archiveResult = await mPool.query(archiveQuery, [itemId]);

        if (archiveResult.rows.length > 0) {
            const archiveItem = archiveResult.rows[0];

            // Fetch additional details based on the document type
            switch (archiveItem.doctypeid) {
                case 1: // Panumduman
                    const panumdumanData = await mPool.query(
                        `SELECT * FROM panumduman WHERE archiveId = $1`,
                        [itemId]
                    );
                    archiveItem.panumdumanDetails = panumdumanData.rows;
                    break;

                case 2: // Lupon
                    const luponData = await mPool.query(
                        `SELECT * FROM lupon WHERE archiveId = $1`,
                        [itemId]
                    );
                    archiveItem.luponDetails = luponData.rows;
                    break;

                case 3: // Ordinance
                    const ordinanceData = await mPool.query(
                        `SELECT * FROM ordinance WHERE archiveId = $1`,
                        [itemId]
                    );
                    archiveItem.ordinanceDetails = ordinanceData.rows;
                    break;

                case 4: // Resolution
                    const resolutionData = await mPool.query(
                        `SELECT * FROM resolution WHERE archiveId = $1`,
                        [itemId]
                    );
                    archiveItem.resolutionDetails = resolutionData.rows;
                    break;

                case 5: // Regularization Minutes
                    const regularizationData = await mPool.query(
                        `SELECT * FROM regularization_minutes WHERE archiveId = $1`,
                        [itemId]
                    );
                    archiveItem.regularizationDetails = regularizationData.rows;
                    break;

                default:
                    console.log(`Unknown document type: ${archiveItem.doctypeId}`);
            }

            console.log("Archive data:", archiveItem);
            res.json({ success: true, data: archiveItem });
        } else {
            console.log(`No Archive data found for archive ID: ${itemId}`);
            res.status(404).json({ error: `No Archive data found for archive ID: ${itemId}` });
        }
    } catch (err) {
        console.error("Database Error:", err.stack);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

router.get("/get-resident", async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).send("Query parameter is required");
    }

    try {
        const result = await mPool.query(
            `SELECT residentsid, fname, mname, lname 
             FROM residents 
             WHERE CONCAT(fname, ' ', mname, ' ', lname) ILIKE $1`, 
            [`%${query}%`]
        );
        return res.json(result.rows);
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
                [archiveId, req.body.date, requestData.documentData.image, contractingPersons]
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
        res.redirect(`/archive/dashboard?type=${docType}`);
    } catch (error) {
        await mPool.query('ROLLBACK'); // Rollback transaction on error
        res.status(500).json({ error: error.message });
    }
});

router.post('/dashboard/update-archive', upload.single('image'), async (req, res) => {
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
        const archiveId = requestData.documentData.itemId;
        console.log("Archive ID: ", archiveId);

        // Start a transaction
        await mPool.query('BEGIN');

        // Check if archive exists
        const archiveResult = await mPool.query(
            `SELECT archiveId FROM archive WHERE archiveId = $1`, 
            [archiveId]
        );
        if (archiveResult.rows.length === 0) {
            return res.status(404).json({ error: `Archive with ID ${archiveId} not found.` });
        }

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

        // Update the archive document
        await mPool.query(
            `UPDATE archive 
             SET doctypeId = $1
             WHERE archiveId = $2`,
            [doctypeId, archiveId]
        );

        // Update the specific document table based on docType
        if (doctypeId === 1) { // Panumduman
            await mPool.query(
                `UPDATE panumduman
                 SET date = $1, image = COALESCE($2, image), contractingPersons = $3
                 WHERE archiveId = $4`,
                [req.body.date, requestData.documentData.image, contractingPersons, archiveId]
            );
        } else if (doctypeId === 2) { // Lupon
            await mPool.query(
                `UPDATE lupon
                 SET caseNumber = $1, complainant = $2, respondent = $3, dateFiled = $4, image = COALESCE($5, image), caseType = $6
                 WHERE archiveId = $7`,
                [
                    req.body.luponCaseNumber,
                    req.body.complainant,
                    req.body.respondent,
                    req.body.dateFiled,
                    requestData.documentData.image,
                    req.body.caseType,
                    archiveId
                ]
            );
        } else if (doctypeId === 3) { // Ordinance
            await mPool.query(
                `UPDATE ordinance
                 SET ordinanceNumber = $1, title = $2, authors = $3, coAuthors = $4, sponsors = $5, image = COALESCE($6, image), dateApproved = $7
                 WHERE archiveId = $8`,
                [
                    req.body.ordinanceNumber,
                    req.body.ordinanceTitle,
                    authors,
                    coAuthors,
                    sponsors,
                    requestData.documentData.image,
                    req.body.dateApproved,
                    archiveId
                ]
            );
        } else if (doctypeId === 4) { // Resolution
            await mPool.query(
                `UPDATE resolution
                 SET resolutionNumber = $1, seriesYear = $2, image = COALESCE($3, image), date = $4
                 WHERE archiveId = $5`,
                [
                    req.body.resolutionNumber,
                    req.body.yearSeries,
                    requestData.documentData.image,
                    req.body.date,
                    archiveId
                ]
            );
        } else if (doctypeId === 5) { // Regularization Minutes
            await mPool.query(
                `UPDATE regularization_minutes
                 SET regulationNumber = $1, image = COALESCE($2, image), date = $3
                 WHERE archiveId = $4`,
                [
                    req.body.regulationNumber,
                    requestData.documentData.image,
                    req.body.date,
                    archiveId
                ]
            );
        } else {
            throw new Error('Unhandled document type');
        }

        await mPool.query('COMMIT'); // Commit transaction
        req.flash('success', 'Document UPDATED Successfully!');
        res.redirect(`/archive/dashboard?type=${docType}`);
    } catch (error) {
        await mPool.query('ROLLBACK'); // Rollback transaction on error
        res.status(500).json({ error: error.message });
    }
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