const express = require('express');
const router = express.Router();
const { format } = require('fast-csv');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const mPool = require("../../models/mDatabase");

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

async function generateCsv(data, filePath) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    format.write(data, { headers: true })
      .pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
  });
}

async function executeQuery(query) {
  const { rows } = await mPool.query(query);
  return rows;
}

// Residents CSV
router.get('/download/residents-csv', async (req, res) => {
  try {
    const residentsQuery = `SELECT * FROM residents WHERE isResident = TRUE ORDER BY purok;`;
    const residents = await executeQuery(residentsQuery);

    res.setHeader('Content-Disposition', 'attachment; filename="residents.csv"');
    res.setHeader('Content-Type', 'text/csv');

    format.writeToStream(res, residents, { headers: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV.');
  }
});

// Non-Residents CSV
router.get('/download/non-residents-csv', async (req, res) => {
  try {
    const nonResidentsQuery = `
      SELECT b.originalPurok AS purok, r.*
      FROM boarders b
      JOIN residents r ON b.boarderInResidentId = r.residentsId
      ORDER BY b.originalPurok;
    `;
    const nonResidents = await executeQuery(nonResidentsQuery);

    res.setHeader('Content-Disposition', 'attachment; filename="non_residents.csv"');
    res.setHeader('Content-Type', 'text/csv');

    format.writeToStream(res, nonResidents, { headers: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV.');
  }
});

// House Classification CSV
router.get('/download/house-classification-csv', async (req, res) => {
  try {
    const houseClassificationQuery = `
      SELECT purok, houseNumber, houseRepresentative, numberOfFamilies, isWithCr, isWith40mZone, isEnergized, housingMaterials, waterSource
      FROM house_classification ORDER BY purok;
    `;
    const houseClassification = await executeQuery(houseClassificationQuery);

    res.setHeader('Content-Disposition', 'attachment; filename="house_classification.csv"');
    res.setHeader('Content-Type', 'text/csv');

    format.writeToStream(res, houseClassification, { headers: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV.');
  }
});

// Bundle CSV
router.get('/download/bundle-csv', async (req, res) => {
  try {
    const residentsQuery = `SELECT * FROM residents WHERE isResident = TRUE ORDER BY purok;`;
    const nonResidentsQuery = `
      SELECT b.originalPurok AS purok, r. *
      FROM boarders b
      JOIN residents r ON b.boarderInResidentId = r.residentsId
      ORDER BY b.originalPurok;
    `;
    const houseClassificationQuery = `
      SELECT purok, houseNumber, houseRepresentative, numberOfFamilies, isWithCr, isWith40mZone, isEnergized, housingMaterials, waterSource
      FROM house_classification ORDER BY purok;
    `;

    const [residents, nonResidents, houseClassification] = await Promise.all([
      executeQuery(residentsQuery),
      executeQuery(nonResidentsQuery),
      executeQuery(houseClassificationQuery),
    ]);

    const residentsCsv = path.join(tempDir, 'residents.csv');
    const nonResidentsCsv = path.join(tempDir, 'non_residents.csv');
    const houseClassificationCsv = path.join(tempDir, 'house_classification.csv');

    await Promise.all([
      generateCsv(residents, residentsCsv),
      generateCsv(nonResidents, nonResidentsCsv),
      generateCsv(houseClassification, houseClassificationCsv),
    ]);

    res.setHeader('Content-Disposition', 'attachment; filename="data_bundle.zip"');
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    archive.file(residentsCsv, { name: 'residents.csv' });
    archive.file(nonResidentsCsv, { name: 'non_residents.csv' });
    archive.file(houseClassificationCsv, { name: 'house_classification.csv' });

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV bundle.');
  } finally {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

module.exports = router;
