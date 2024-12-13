const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mPool = require("../../models/mDatabase");
const { barangayOfficialsSchema } = require("../../middlewares/schemas/schemas");
const { fetchOfficialList } = require("../../middlewares/helper-functions/fetch-functions");

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/barangay-officials-images/';
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

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only images are allowed.'));
        }
        cb(null, true);
    }
});

const deleteUploadedFiles = (files) => {
    Object.values(files).forEach(fileArray => {
        fileArray.forEach(file => {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Failed to delete file:', file.path);
            });
        });
    });
};

router.use("/uploads/barangay-officials-images", express.static("uploads"));

router.get("/dashboard", async (req, res) => {
    const isAjax = req.query.ajax === "true";
    try {
        const { getOfficialList } = await fetchOfficialList();

        if (isAjax) {
            return res.json({
                title: "Barangay Officials",
                getOfficialList,
                user: req.user,
            });
        }

        res.render("officials/officials", {
            title: "Barangay Officials",
            getOfficialList,
            user: req.user,
        });

    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

// POST route for updating barangay officials
router.post('/update-barangay-officials', upload.fields([
    { name: 'punongBarangayImage', maxCount: 1 },
    { name: 'kagawad1Image', maxCount: 1 },
    { name: 'kagawad2Image', maxCount: 1 },
    { name: 'kagawad3Image', maxCount: 1 },
    { name: 'kagawad4Image', maxCount: 1 },
    { name: 'kagawad5Image', maxCount: 1 },
    { name: 'kagawad6Image', maxCount: 1 },
    { name: 'kagawad7Image', maxCount: 1 },
    { name: 'SKChairpersonImage', maxCount: 1 },
    { name: 'barangaySecretaryImage', maxCount: 1 },
    { name: 'barangayTreasurerImage', maxCount: 1 }
]), async (req, res) => {
    // Validate form data using Joi
    const { error, value } = barangayOfficialsSchema.validate(req.body);
    if (error) throw new Error(error.details.map(e => e.message).join(', '));

    // Process uploaded images
    const uploadedImages = {};
    for (const fieldName in req.files) {
        if (req.files[fieldName] && req.files[fieldName][0]) {
            uploadedImages[fieldName] = req.files[fieldName][0].filename;
        }
    }

    console.log("Images Uploaded: ", uploadedImages);

    try {
        // Check if any officials already exist
        const officialId = await mPool.query(`SELECT id FROM barangay_officials LIMIT 1`);
        if (officialId.rows.length === 0) {
            // No official found, perform an insert instead of update
            const insertQuery = `
                INSERT INTO barangay_officials (
                    punongBarangayLastName, punongBarangayFirstName, punongBarangayMiddleName, punongBarangayImage,
                    kagawad1LastName, kagawad1FirstName, kagawad1MiddleName, kagawad1Image,
                    kagawad2LastName, kagawad2FirstName, kagawad2MiddleName, kagawad2Image,
                    kagawad3LastName, kagawad3FirstName, kagawad3MiddleName, kagawad3Image,
                    kagawad4LastName, kagawad4FirstName, kagawad4MiddleName, kagawad4Image,
                    kagawad5LastName, kagawad5FirstName, kagawad5MiddleName, kagawad5Image,
                    kagawad6LastName, kagawad6FirstName, kagawad6MiddleName, kagawad6Image,
                    kagawad7LastName, kagawad7FirstName, kagawad7MiddleName, kagawad7Image,
                    SKChairpersonLastName, SKChairpersonFirstName, SKChairpersonMiddleName, SKChairpersonImage,
                    barangaySecretaryLastName, barangaySecretaryFirstName, barangaySecretaryMiddleName, barangaySecretaryImage,
                    barangayTreasurerLastName, barangayTreasurerFirstName, barangayTreasurerMiddleName, barangayTreasurerImage
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 
                    $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
                    $41, $42, $43, $44
                )
            `;

            await mPool.query(insertQuery, [
                value.punongBarangayLastName, value.punongBarangayFirstName, value.punongBarangayMiddleName, uploadedImages.punongBarangayImage || null,
                value.kagawad1LastName, value.kagawad1FirstName, value.kagawad1MiddleName, uploadedImages.kagawad1Image || null,
                value.kagawad2LastName, value.kagawad2FirstName, value.kagawad2MiddleName, uploadedImages.kagawad2Image || null,
                value.kagawad3LastName, value.kagawad3FirstName, value.kagawad3MiddleName, uploadedImages.kagawad3Image || null,
                value.kagawad4LastName, value.kagawad4FirstName, value.kagawad4MiddleName, uploadedImages.kagawad4Image || null,
                value.kagawad5LastName, value.kagawad5FirstName, value.kagawad5MiddleName, uploadedImages.kagawad5Image || null,
                value.kagawad6LastName, value.kagawad6FirstName, value.kagawad6MiddleName, uploadedImages.kagawad6Image || null,
                value.kagawad7LastName, value.kagawad7FirstName, value.kagawad7MiddleName, uploadedImages.kagawad7Image || null,
                value.SKChairpersonLastName, value.SKChairpersonFirstName, value.SKChairpersonMiddleName, uploadedImages.SKChairpersonImage || null,
                value.barangaySecretaryLastName, value.barangaySecretaryFirstName, value.barangaySecretaryMiddleName, uploadedImages.barangaySecretaryImage || null,
                value.barangayTreasurerLastName, value.barangayTreasurerFirstName, value.barangayTreasurerMiddleName, uploadedImages.barangayTreasurerImage || null
            ]);

            req.flash('success', 'Officials List ADDED Successfully!');
            res.redirect(`/officials/dashboard`);
        } else {
            // Official exists, perform update
            const id = officialId.rows[0].id;
            const updateQuery = `
                UPDATE barangay_officials
                SET
                    punongBarangayLastName = $1, punongBarangayFirstName = $2, punongBarangayMiddleName = $3, 
                    punongBarangayImage = COALESCE($4, punongBarangayImage),
                    kagawad1LastName = $5, kagawad1FirstName = $6, kagawad1MiddleName = $7, 
                    kagawad1Image = COALESCE($8, kagawad1Image),
                    kagawad2LastName = $9, kagawad2FirstName = $10, kagawad2MiddleName = $11, 
                    kagawad2Image = COALESCE($12, kagawad2Image),
                    kagawad3LastName = $13, kagawad3FirstName = $14, kagawad3MiddleName = $15, 
                    kagawad3Image = COALESCE($16, kagawad3Image),
                    kagawad4LastName = $17, kagawad4FirstName = $18, kagawad4MiddleName = $19, 
                    kagawad4Image = COALESCE($20, kagawad4Image),
                    kagawad5LastName = $21, kagawad5FirstName = $22, kagawad5MiddleName = $23, 
                    kagawad5Image = COALESCE($24, kagawad5Image),
                    kagawad6LastName = $25, kagawad6FirstName = $26, kagawad6MiddleName = $27, 
                    kagawad6Image = COALESCE($28, kagawad6Image),
                    kagawad7LastName = $29, kagawad7FirstName = $30, kagawad7MiddleName = $31, 
                    kagawad7Image = COALESCE($32, kagawad7Image),
                    SKChairpersonLastName = $33, SKChairpersonFirstName = $34, SKChairpersonMiddleName = $35, 
                    SKChairpersonImage = COALESCE($36, SKChairpersonImage),
                    barangaySecretaryLastName = $37, barangaySecretaryFirstName = $38, barangaySecretaryMiddleName = $39, 
                    barangaySecretaryImage = COALESCE($40, barangaySecretaryImage),
                    barangayTreasurerLastName = $41, barangayTreasurerFirstName = $42, barangayTreasurerMiddleName = $43, 
                    barangayTreasurerImage = COALESCE($44, barangayTreasurerImage)
                WHERE id = $45
            `;

            await mPool.query(updateQuery, [
                value.punongBarangayLastName, value.punongBarangayFirstName, value.punongBarangayMiddleName, uploadedImages.punongBarangayImage || null,
                value.kagawad1LastName, value.kagawad1FirstName, value.kagawad1MiddleName, uploadedImages.kagawad1Image || null,
                value.kagawad2LastName, value.kagawad2FirstName, value.kagawad2MiddleName, uploadedImages.kagawad2Image || null,
                value.kagawad3LastName, value.kagawad3FirstName, value.kagawad3MiddleName, uploadedImages.kagawad3Image || null,
                value.kagawad4LastName, value.kagawad4FirstName, value.kagawad4MiddleName, uploadedImages.kagawad4Image || null,
                value.kagawad5LastName, value.kagawad5FirstName, value.kagawad5MiddleName, uploadedImages.kagawad5Image || null,
                value.kagawad6LastName, value.kagawad6FirstName, value.kagawad6MiddleName, uploadedImages.kagawad6Image || null,
                value.kagawad7LastName, value.kagawad7FirstName, value.kagawad7MiddleName, uploadedImages.kagawad7Image || null,
                value.SKChairpersonLastName, value.SKChairpersonFirstName, value.SKChairpersonMiddleName, uploadedImages.SKChairpersonImage || null,
                value.barangaySecretaryLastName, value.barangaySecretaryFirstName, value.barangaySecretaryMiddleName, uploadedImages.barangaySecretaryImage || null,
                value.barangayTreasurerLastName, value.barangayTreasurerFirstName, value.barangayTreasurerMiddleName, uploadedImages.barangayTreasurerImage || null,
                id
            ]);

            req.flash('success', 'Officials List UPDATED Successfully!');
            res.redirect(`/officials/dashboard`);
        }
    } catch (err) {
        deleteUploadedFiles(req.files);
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


module.exports = router;