const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");
const { fetchResidentsLists } = require("../../middlewares/helper-functions/fetch-functions");
const { generateGlobalNextId, generateIdNumberNextId, getCurrentYear } = require("../../middlewares/helper-functions/id-generator");
const { residentSchema } = require("../../middlewares/schemas/schemas");

const multer = require("multer");
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/residents-img/';

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
router.use("/uploads/residents-img", express.static("uploads"));

router.get("/dashboard", async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const searchQuery = req.query.search || '';
    const isNonResident = req.query.isNonResident === "true";
    const isAjax = req.query.ajax === "true" || req.xhr;

    console.log("Search Query on Backend: ", searchQuery);

    try {
        const { getResidentsList, totalPages } = await fetchResidentsLists(page, limit, searchQuery, isNonResident);

        if (isAjax) {
            return res.json({
                title: "Residents",
                getResidentsList,
                user: req.user,
                currentPage: page,
                totalPages,
                limit,
            });
        }

        res.render("residents/residents", {
            title: "Residents",
            getResidentsList,
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

router.post("/dashboard/add-resident", upload.single('picture'), async (req, res) => {
    const { error, value } = residentSchema.validate(req.body);
    const picture = req.file ? req.file.filename : null;
    console.log("req.bodyyyy: ", value);
    if (error) {
        console.error("Validation error:", error.details.map(e => e.message).join(", "));
        return res.status(400).json({ error: error.details.map(e => e.message) });
    }

    try {
        // Log uploaded picture
        if (picture) {
            console.log(`Processed file: ${picture}`);
        } else {
            console.log("No file uploaded or file upload failed.");
        }

        // Step 1: Get the last globalId and generate the next one
        let newId;

        // Step 1: Get the last globalId and generate the next one
        const globalIdQuery = await mPool.query(
            `SELECT globalid FROM residents ORDER BY globalid DESC LIMIT 1`
        );

        let lastGlobalId = "MPDN0001"; // Default starting value
        if (globalIdQuery.rows.length > 0 && globalIdQuery.rows[0]?.globalid) {
            lastGlobalId = globalIdQuery.rows[0].globalid;
        }

        console.log("Last Global ID fetched:", lastGlobalId);

        try {
            newId = generateGlobalNextId(lastGlobalId); // Generate the new global ID
            console.log("Generated New Global ID:", newId);
        } catch (err) {
            console.error("Error generating Global ID:", err.message);
            return res.status(500).json({ error: "Failed to generate Global ID" });
        }

        // Step 2: Get the last idNumber and generate the next one
        const idNumberQuery = await mPool.query(
            `SELECT idnumber FROM residents ORDER BY residentsid DESC LIMIT 1`
        );

        console.log("idNumber:", idNumberQuery);

        let lastNumId = `${getCurrentYear()}-0001`; // Default starting value
        if (idNumberQuery.rows.length > 0 && idNumberQuery.rows[0]?.idnumber) {
            lastNumId = idNumberQuery.rows[0].idnumber;
        }

        console.log("Fetched lastNumId from DB:", lastNumId);

        const numNewId = generateIdNumberNextId(lastNumId); // Generate the new idNumber
        console.log("Generated New ID Number:", numNewId);

        // Step 3: Insert emergency contact into the contactPerson table
        const emergencyContactResult = await mPool.query(
            `INSERT INTO contactPerson (fName, mName, lName, street, purok, barangay, city, province, contactNumber) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING contactPersonId`,
            [
                value.emergencyFirstName,
                value.emergencyMiddleName,
                value.emergencyLastName,
                value.emergencyStreet,
                value.emergencyPurok,
                value.emergencyBarangay,
                value.emergencyCity,
                value.emergencyProvince,
                value.emergencyContactNumber
            ]
        );

        const emergencyContactId = emergencyContactResult.rows[0].contactpersonid;
        const birthDate = new Date(value.birthdate).toISOString().split("T")[0];

        // Step 4: Insert resident information into residents table
        await mPool.query(
            `INSERT INTO residents (globalId, idNumber, fName, mName, lName, purok, street, barangay, city, province, birthDate, birthPlace, age, gender, picture, eAttainment, occupation, income, civilStatus, isResident, emergencyContactId, rClassificationId, isPwd, isSoloParent, isYouth, is4ps)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`,
            [
                newId,               // globalId
                numNewId,            // idNumber
                value.first_name,    // fName
                value.middle_name,   // mName
                value.last_name,     // lName
                value.purok,         // purok
                value.street,        // street
                value.barangay,      // barangay
                value.city,          // city
                value.province,      // province
                birthDate,           // birthDate
                value.placeOfBirth,  // birthPlace
                value.age,           // age
                value.gender,        // gender
                picture,             // picture (null if not uploaded)
                value.educAttainment, // eAttainment
                value.occupation,    // occupation
                value.grossIncome,   // income
                value.civilStatus,   // civilStatus
                true,                // isResident (default true)
                emergencyContactId,  // emergencyContactId
                value.sectors,       // rClassificationId
                value.pwd,           // isPwd
                value.soloParent,    // isSoloParent
                value.youth,         // isYouth
                value.is4ps          // is4ps
            ]
        );

        req.flash('success', 'Resident Added Successfully!');
        res.redirect("/residents/dashboard");
    } catch (err) {
        console.error("Error:", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});


router.post("/dashboard/add-non-resident", upload.single('picture'), async (req, res) => {
    try {
        // Step 1: Map non-resident fields into `nonResidentAddress` if `isResident` is false
        if (req.body.isResident === "non-resident" || req.body.isResident === "non-resident") {
            req.body.nonResidentAddress = {
                purok1: req.body.purok1,
                street1: req.body.street1,
                barangay1: req.body.barangay1,
                city1: req.body.city1,
                province1: req.body.province1,
                boardingHouse: req.body.boardingHouse,
                landlord: req.body.landlord,
            };

            // Optionally remove nonResident fields from the root level to clean up the object
            delete req.body.purok1;
            delete req.body.street1;
            delete req.body.barangay1;
            delete req.body.city1;
            delete req.body.province1;
            delete req.body.boardingHouse;
            delete req.body.landlord;
        }


        // Step 2: Validate the data
        const { error, value } = residentSchema.validate(req.body);
        const picture = req.file ? req.file.filename : null;
        console.log("req.bodyyyy: ", value);
        if (error) {
            console.error("Validation error:", error.details.map(e => e.message).join(", "));
            return res.status(400).json({ error: error.details.map(e => e.message) });
        }
        // Log the picture file name if uploaded
        if (picture) {
            console.log(`Processed file: ${picture}`);
        } else {
            console.log("No file received or file upload failed");
        }

        let newId;
        // Step 1: Get the last globalId and generate the next one
        const globalIdQuery = await mPool.query(
            `SELECT globalid FROM residents ORDER BY globalid DESC LIMIT 1`
        );

        let lastGlobalId = "MPDN0001"; // Default starting value
        if (globalIdQuery.rows.length > 0 && globalIdQuery.rows[0]?.globalid) {
            lastGlobalId = globalIdQuery.rows[0].globalid;
        }

        console.log("Last Global ID fetched:", lastGlobalId);

        try {
            newId = generateGlobalNextId(lastGlobalId); // Generate the new global ID
            console.log("Generated New Global ID:", newId);
        } catch (err) {
            console.error("Error generating Global ID:", err.message);
            return res.status(500).json({ error: "Failed to generate Global ID" });
        }

        // Step 2: Get the last idNumber and generate the next one
        const idNumberQuery = await mPool.query(
            `SELECT idnumber FROM residents ORDER BY residentsid DESC LIMIT 1`
        );

        console.log("idNumber:", idNumberQuery);

        let lastNumId = `${getCurrentYear()}-0001`; // Default starting value
        if (idNumberQuery.rows.length > 0 && idNumberQuery.rows[0]?.idnumber) {
            lastNumId = idNumberQuery.rows[0].idnumber;
        }

        console.log("Fetched lastNumId from DB:", lastNumId);

        const numNewId = generateIdNumberNextId(lastNumId); // Generate the new idNumber
        console.log("Generated New ID Number:", numNewId);

        // Step 3: Insert emergency contact into contactPerson table
        const emergencyContactResult = await mPool.query(
            `INSERT INTO contactPerson (fName, mName, lName, street, purok, barangay, city, province, contactNumber) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING contactPersonId`,
            [
                value.emergencyFirstName,
                value.emergencyMiddleName,
                value.emergencyLastName,
                value.emergencyStreet,
                value.emergencyPurok,
                value.emergencyBarangay,
                value.emergencyCity,
                value.emergencyProvince,
                value.emergencyContactNumber
            ]
        );

        const emergencyContactId = emergencyContactResult.rows[0].contactpersonid;
        const birthDate = new Date(value.birthdate).toISOString().split("T")[0];

        // Step 4: Insert the resident information into residents table
        await mPool.query(
            `INSERT INTO residents (globalId, idNumber, fName, mName, lName, purok, street, barangay, city, province, birthDate, birthPlace, age, gender, picture, eAttainment, occupation, income, civilStatus, isResident, emergencyContactId, rClassificationId, isPwd, isSoloParent, isYouth, is4ps)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)`,
            [
                newId,               // globalId
                numNewId,            // idNumber
                value.first_name,    // fName
                value.middle_name,   // mName
                value.last_name,     // lName
                value.purok, // purok
                value.street,// street
                value.barangay, // barangay
                value.city,  // city
                value.province, // province
                birthDate,     // birthDate
                value.placeOfBirth,  // birthPlace
                value.age,           // age
                value.gender,        // gender
                picture,             // picture (null if not uploaded)
                value.educAttainment, // eAttainment
                value.occupation,    // occupation
                value.grossIncome,   // income
                value.civilStatus,   // civilStatus
                false,                // isResident (since this is a non-resident)
                emergencyContactId,  // emergencyContactId
                value.sectors,
                null,
                null,
                null,
                null
            ]
        );

        req.flash('success', 'Non-Resident Added Successfully!');
        res.redirect("/residents/dashboard");
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});


module.exports = router;