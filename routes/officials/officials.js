const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mPool = require("../../models/mDatabase");
const { barangayOfficialsSchema } = require("../../middlewares/schemas/schemas");

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

router.get("/dashboard", (req, res) => {
    res.render("officials/officials", {
        title: "officials"
    });
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

    try {

        const officialId = await mPool.query(`SELECT id FROM barangay_officials LIMIT 1`);
        if (officialId.rows.length === 0) {
            return res.status(404).json({ error: 'No official found to update.' });
        }
        const id = officialId.rows[0].id;

        // Update query to save both text and image data
        const updateQuery = `
            UPDATE barangay_officials
            SET
                punongBarangayLastName = $1, punongBarangayFirstName = $2, punongBarangayMiddleName = $3, punongBarangayImage = $4,
                kagawad1LastName = $5, kagawad1FirstName = $6, kagawad1MiddleName = $7, kagawad1Image = $8,
                kagawad2LastName = $9, kagawad2FirstName = $10, kagawad2MiddleName = $11, kagawad2Image = $12,
                kagawad3LastName = $13, kagawad3FirstName = $14, kagawad3MiddleName = $15, kagawad3Image = $16,
                kagawad4LastName = $17, kagawad4FirstName = $18, kagawad4MiddleName = $19, kagawad4Image = $20,
                kagawad5LastName = $21, kagawad5FirstName = $22, kagawad5MiddleName = $23, kagawad5Image = $24,
                kagawad6LastName = $25, kagawad6FirstName = $26, kagawad6MiddleName = $27, kagawad6Image = $28,
                kagawad7LastName = $29, kagawad7FirstName = $30, kagawad7MiddleName = $31, kagawad7Image = $32,
                SKChairpersonLastName = $33, SKChairpersonFirstName = $34, SKChairpersonMiddleName = $35, SKChairpersonImage = $36,
                barangaySecretaryLastName = $37, barangaySecretaryFirstName = $38, barangaySecretaryMiddleName = $39, barangaySecretaryImage = $40,
                barangayTreasurerLastName = $41, barangayTreasurerFirstName = $42, barangayTreasurerMiddleName = $43, barangayTreasurerImage = $44
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
    } catch (err) {
        deleteUploadedFiles(req.files);
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;