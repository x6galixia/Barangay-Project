const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");
const { fetchResidentsLists } = require("../../middlewares/helper-functions/fetch-functions");
const { calculateAge } = require("../../middlewares/helper-functions/calculations");
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

router.get("/dashboard/resident/:id", async (req, res) => {
    const residentID = req.params.id;
    try {
        const query = `
            SELECT 
                r.residentsId,
                r.globalId,
                r.idNumber,
                r.fName,
                r.mName,
                r.lName,
                r.street,
                r.purok,
                r.barangay,
                r.city,
                r.province,
                r.birthDate,
                r.birthPlace,
                r.age,
                r.gender,
                r.picture,
                r.signature,
                r.eAttainment,
                r.occupation,
                r.income,
                r.civilStatus,
                r.isResident,
                r.isPwd,
                r.isSoloParent,
                r.isYouth,
                r.is4ps,
                r.isOutOfSchoolYouth,
                r.isSkm,
                r.isKm,
                rc.rClassificationName,  -- From rClassification
                cp.fName AS emergencyFirstName,  -- From contactPerson
                cp.mName AS emergencyMiddleName,
                cp.lName AS emergencyLastName,
                cp.street AS emergencyStreet,
                cp.purok AS emergencyPurok,
                cp.barangay AS emergencyBarangay,
                cp.city AS emergencyCity,
                cp.province AS emergencyProvince,
                cp.contactNumber AS emergencyContactNumber,
                b.originalStreet,
                b.originalPurok,
                b.originalBarangay,
                b.originalCity,
                b.originalProvince,
                b.boardinghouseName,
                b.landlord
            FROM residents r
            JOIN rClassification rc ON r.rClassificationId = rc.rClassificationId
            JOIN contactPerson cp ON r.emergencyContactId = cp.contactPersonId
            LEFT JOIN boarders b ON r.residentsId = b.boarderInResidentId
            WHERE r.globalId = $1
        `;
        const residentData = await mPool.query(query, [residentID]);
        if (residentData.rows.length === 0) {
            return res.status(404).json({ message: "Resident not found" });
        }

        res.json(residentData.rows[0]);

    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).json({ message: "Internal server error" });
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
            `INSERT INTO residents (globalId, idNumber, fName, mName, lName, purok, street, barangay, city, province, birthDate, birthPlace, age, gender, picture, eAttainment, occupation, income, civilStatus, isResident, emergencyContactId, rClassificationId, isPwd, isSoloParent, isYouth, is4ps, isOutOfSchoolYouth, isSkm, isKm)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)`,
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
                calculateAge(value.age),           // age
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
                value.is4ps,          // is4ps
                value.isOutOfSchoolYouth,
                value.isSkm,
                value.isKm
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
        if (req.body.isResident === "non-resident") {
            req.body.nonResidentAddress = {
                purok1: req.body.purok1,
                street1: req.body.street1,
                barangay1: req.body.barangay1,
                city1: req.body.city1,
                province1: req.body.province1,
                boardingHouse: req.body.boardingHouse,
                landlord: req.body.landlord,
            };

            // Optionally remove redundant fields to avoid conflicts
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

        // Step 4: Insert the resident information into the residents table and retrieve the residentsid
        const residentInsertResult = await mPool.query(
            `INSERT INTO residents (globalId, idNumber, fName, mName, lName, purok, street, barangay, city, province, birthDate, birthPlace, age, gender, picture, eAttainment, occupation, income, civilStatus, isResident, emergencyContactId, rClassificationId, isPwd, isSoloParent, isYouth, is4ps, isOutOfSchoolYouth, isSkm, isKm)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
     RETURNING residentsid`,
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
                false,               // isResident (since this is a non-resident)
                emergencyContactId,  // emergencyContactId
                value.sectors,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ]
        );

        // Get the newly generated residentsid
        const residentsId = residentInsertResult.rows[0].residentsid;
        console.log("Generated residentsid:", residentsId);

        // Step 5: Insert the resident information into the boarders table
        await mPool.query(
            `INSERT INTO boarders (boarderinresidentid, originalstreet, originalpurok, originalbarangay, originalcity, originalprovince, boardinghousename, landlord) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                residentsId,                           // Referencing the residentsid
                value.nonResidentAddress.street1,      // originalpurok
                value.nonResidentAddress.purok1,       // originalstreet
                value.nonResidentAddress.barangay1,    // originalbarangay
                value.nonResidentAddress.city1,        // originalcity
                value.nonResidentAddress.province1,    // originalprovince
                value.nonResidentAddress.boardingHouse, // boardinghousename
                value.nonResidentAddress.landlord      // landlord
            ]
        );

        console.log("Inserted data into the boarders table successfully.");

        req.flash('success', 'Non-Resident Added Successfully!');
        res.redirect("/residents/dashboard");
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.post("/dashboard/update-resident", upload.single('picture'), async (req, res) => {
    const { error, value } = residentSchema.validate(req.body);
    const picture = req.file ? req.file.filename : null;

    console.log("req.bodyyyy:", value);
    if (error) {
        console.error("Validation error:", error.details.map(e => e.message).join(", "));
        return res.status(400).json({ error: error.details.map(e => e.message) });
    }

    try {
        if (picture) {
            console.log(`Processed file: ${picture}`);
        } else {
            console.log("No file uploaded or file upload failed.");
        }

        const birthDate = new Date(value.birthdate).toISOString().split("T")[0];

        await mPool.query(
            `UPDATE contactPerson
             SET fName = $1, mName = $2, lName = $3, street = $4, purok = $5, barangay = $6, city = $7, province = $8, contactNumber = $9
             WHERE contactPersonId = (SELECT emergencyContactId FROM residents WHERE globalId = $10)`,
            [
                value.emergencyFirstName,
                value.emergencyMiddleName,
                value.emergencyLastName,
                value.emergencyStreet,
                value.emergencyPurok,
                value.emergencyBarangay,
                value.emergencyCity,
                value.emergencyProvince,
                value.emergencyContactNumber,
                value.globalId
            ]
        );

        await mPool.query(
            `UPDATE residents
             SET fName = $1, mName = $2, lName = $3, purok = $4, street = $5, barangay = $6, city = $7, province = $8,
                 birthDate = $9, birthPlace = $10, age = $11, gender = $12, picture = COALESCE($13, picture), 
                 eAttainment = $14, occupation = $15, income = $16, civilStatus = $17, 
                 rClassificationId = $18, isPwd = $19, isSoloParent = $20, isYouth = $21, 
                 is4ps = $22, isOutOfSchoolYouth = $23, isSkm = $24, isKm = $25
             WHERE globalId = $26`,
            [
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
                value.sectors,       // rClassificationId
                value.pwd,           // isPwd
                value.soloParent,    // isSoloParent
                value.youth,         // isYouth
                value.is4ps,         // is4ps
                value.isOutOfSchoolYouth,
                value.isSkm,
                value.isKm,
                value.globalId
            ]
        );

        req.flash('success', 'Resident Updated Successfully!');
        res.redirect("/residents/dashboard");
    } catch (err) {
        console.error("Error:", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.post("/dashboard/update-non-resident", upload.single('picture'), async (req, res) => {
    try {
        if (req.body.isResident === "non-resident") {
            req.body.nonResidentAddress = {
                purok1: req.body.purok1,
                street1: req.body.street1,
                barangay1: req.body.barangay1,
                city1: req.body.city1,
                province1: req.body.province1,
                boardingHouse: req.body.boardingHouse,
                landlord: req.body.landlord,
            };

            delete req.body.purok1;
            delete req.body.street1;
            delete req.body.barangay1;
            delete req.body.city1;
            delete req.body.province1;
            delete req.body.boardingHouse;
            delete req.body.landlord;
        }

        const { error, value } = residentSchema.validate(req.body);
        const picture = req.file ? req.file.filename : null;

        console.log("req.bodyyyy:", value);
        if (error) {
            console.error("Validation error:", error.details.map(e => e.message).join(", "));
            return res.status(400).json({ error: error.details.map(e => e.message) });
        }

        await mPool.query(
            `UPDATE contactPerson
             SET fName = $1, mName = $2, lName = $3, street = $4, purok = $5, barangay = $6, city = $7, province = $8, contactNumber = $9
             WHERE contactPersonId = (SELECT emergencyContactId FROM residents WHERE globalId = $10)`,
            [
                value.emergencyFirstName,
                value.emergencyMiddleName,
                value.emergencyLastName,
                value.emergencyStreet,
                value.emergencyPurok,
                value.emergencyBarangay,
                value.emergencyCity,
                value.emergencyProvince,
                value.emergencyContactNumber,
                value.globalId
            ]
        );

        const birthDate = new Date(value.birthdate).toISOString().split("T")[0];

        await mPool.query(
            `UPDATE residents
             SET fName = $1, mName = $2, lName = $3, purok = $4, street = $5, barangay = $6, city = $7, province = $8,
                 birthDate = $9, birthPlace = $10, age = $11, gender = $12, picture = COALESCE($13, picture), 
                 eAttainment = $14, occupation = $15, income = $16, civilStatus = $17, isResident = false, 
                 rClassificationId = $18, isPwd = $19, isSoloParent = $20, isYouth = $21, is4ps = $22, 
                 isOutOfSchoolYouth = $23, isSkm = $24, isKm = $25
             WHERE globalId = $26`,
            [
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
                value.sectors,       // rClassificationId
                value.pwd,           // isPwd
                value.soloParent,    // isSoloParent
                value.youth,         // isYouth
                value.is4ps,         // is4ps
                value.isOutOfSchoolYouth,
                value.isSkm,
                value.isKm,
                value.globalId
            ]
        );

        await mPool.query(
            `UPDATE boarders
             SET originalstreet = $1, originalpurok = $2, originalbarangay = $3, originalcity = $4, 
                 originalprovince = $5, boardinghousename = $6, landlord = $7
             WHERE boarderInResidentId = (SELECT residentsId FROM residents WHERE globalId = $8)`,
            [
                value.nonResidentAddress.street1,      // originalstreet
                value.nonResidentAddress.purok1,       // originalpurok
                value.nonResidentAddress.barangay1,    // originalbarangay
                value.nonResidentAddress.city1,        // originalcity
                value.nonResidentAddress.province1,    // originalprovince
                value.nonResidentAddress.boardingHouse, // boardinghousename
                value.nonResidentAddress.landlord,      // landlord
                value.globalId
            ]
        );

        console.log("Non-resident information updated successfully.");

        req.flash('success', 'Non-Resident Updated Successfully!');
        res.redirect("/residents/dashboard");
    } catch (err) {
        console.error("Error:", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

router.delete("/delete-residents/:id", async (req, res) => {
    const residentsId = req.params.id;

    try {
        await mPool.query(`DELETE FROM residents WHERE globalId = $1`, [residentsId]);

        req.flash('success', 'Resident deleted successfully!');
        res.redirect("/residents/dashboard");
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("An error occurred while trying to delete the resident.");
    }
});

module.exports = router;