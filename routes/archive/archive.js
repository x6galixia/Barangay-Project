const express = require('express');
const router = express.Router();
const mPool = require("../../models/mDatabase");
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

router.get("/dashboard", (req, res) => {
    res.render("archive/archive", {
        title: "Archive"
    });
});

router.get("/dashboard", async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const searchQuery = req.query.search || '';
    const isFunctional = req.query.isFunctional === "true";
    const isAjax = req.query.ajax === "true" || req.xhr;
    try {
        const { getResidentsList, totalPages } = await fetchResidentsLists(page, limit, searchQuery, isNonResident);
        
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
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

    try {

        if (picture) {
            console.log(`Processed file: ${picture}`);
        } else {
            console.log("No file received or file upload failed");
        }

        await mPool.query(`
            INSERT INTO archive (name, date, img, docType) VALUES ($1, $2, $3, $4)
            `, [value.name, value.date, picture, value.docType]);

        res.redirect("/archive/dashboard")     
    } catch (err) {
        console.error("Error: ", err.message, err.stack);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;