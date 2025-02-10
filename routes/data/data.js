const express = require('express');
const router = express.Router();
const fastCsv = require('fast-csv'); // ✅ Correct import
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const mPool = require("../../models/mDatabase");
const e = require('express');

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

// Classification ID to Filename Mapping
const classificationNames = {
  1: "Government_Employees",
  2: "Private_Employees",
  3: "Carpenters",
  4: "Farmers",
  5: "Fishermen",
  6: "Business_Entrepreneurs",
  7: "Drivers",
  8: "OFW",
  9: "Kasambahay",
  10: "Entrepreneurs",
  11: "Unemployed",
  13: "Boarders"
};

const excludedColumns = [
  'residentsid', 'globalid', 'picture', 'signature', 
  'isresident', 'emergencycontactid', 'rclassificationid', 
  'ispaid', 'lastpaidreset', 'income', 'issenior', 'ispwd', 'issoloparent', 'is4ps', 'isyouth', 'isoutofschoolyouth', 'isskm', 'iskm'
];


async function generateCsv(data, filePath) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath);
    const csvStream = fastCsv.format({ headers: true });

    csvStream.pipe(writeStream).on('finish', resolve).on('error', reject);

    data.forEach((row) => csvStream.write(row)); // ✅ Write data properly
    csvStream.end();
  });
}

function excludeColumns(data, columnsToExclude) {
  return data.map(row => {
    let filteredRow = {};
    Object.keys(row).forEach(key => {
      if (!columnsToExclude.includes(key)) {
        filteredRow[key] = row[key];
      }
    });
    return filteredRow;
  });
}

async function executeQuery(query) {
  const { rows } = await mPool.query(query);
  return rows;
}

function reorderColumns(data) {
  return data.map(row => ({
    purok: row.purok, // Set purok as the first column
    ...Object.fromEntries(Object.entries(row).filter(([key]) => key !== 'purok'))
  }));
}

async function generateFilteredCsv(req, res, filterColumn, filename) {
  try {
    const query = `SELECT * FROM residents WHERE ${filterColumn} = TRUE ORDER BY purok;`;
    let residents = await executeQuery(query);

    // Exclude unwanted columns
    residents = excludeColumns(residents, excludedColumns);

    // Reorder columns to make 'purok' the first column
    residents = reorderColumns(residents);

    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.setHeader('Content-Type', 'text/csv');

    const csvStream = fastCsv.format({ headers: true });
    csvStream.pipe(res);
    residents.forEach(row => csvStream.write(row));
    csvStream.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV.');
  }
}

async function generateClassificationCsv(req, res, classificationId, filename) {
  try {
    const query = `SELECT * FROM residents WHERE rclassificationid = ${classificationId} ORDER BY purok;`;
    let residents = await executeQuery(query);

    // Exclude unwanted columns
    residents = excludeColumns(residents, excludedColumns);

    // Reorder columns to make 'purok' the first column
    residents = reorderColumns(residents);

    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    res.setHeader('Content-Type', 'text/csv');

    const csvStream = fastCsv.format({ headers: true });
    csvStream.pipe(res);
    residents.forEach(row => csvStream.write(row));
    csvStream.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV.');
  }
}


// Generate routes dynamically
Object.entries(classificationNames).forEach(([id, name]) => {
  router.get(`/download/${name.toLowerCase().replace(/ /g, "_")}-csv`, (req, res) => 
    generateClassificationCsv(req, res, id, name)
  );
});

// Routes for each filtered dataset
router.get('/download/seniors-csv', (req, res) => generateFilteredCsv(req, res, 'issenior', 'seniors'));
router.get('/download/pwd-csv', (req, res) => generateFilteredCsv(req, res, 'ispwd', 'pwd'));
router.get('/download/solo-parents-csv', (req, res) => generateFilteredCsv(req, res, 'issoloparent', 'solo_parents'));
router.get('/download/4ps-csv', (req, res) => generateFilteredCsv(req, res, 'is4ps', '4ps'));
router.get('/download/youth-csv', (req, res) => generateFilteredCsv(req, res, 'isyouth', 'youth'));

router.get('/download/residents-csv', async (req, res) => {
  try {
    const residentsQuery = `SELECT * FROM residents WHERE isResident = TRUE ORDER BY purok;`;
    let residents = await executeQuery(residentsQuery);

    // Exclude unwanted columns
    residents = excludeColumns(residents, excludedColumns);

    residents = reorderColumns(residents);

    res.setHeader('Content-Disposition', 'attachment; filename="residents.csv"');
    res.setHeader('Content-Type', 'text/csv');

    const csvStream = fastCsv.format({ headers: true });
    csvStream.pipe(res);
    residents.forEach((row) => csvStream.write(row));
    csvStream.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV.');
  }
});

router.get('/download/non-residents-csv', async (req, res) => {
  try {
    const nonResidentsQuery = `
      SELECT b.originalPurok AS purok, r.*
      FROM boarders b
      JOIN residents r ON b.boarderInResidentId = r.residentsId
      ORDER BY b.originalPurok;
    `;
    let nonResidents = await executeQuery(nonResidentsQuery);
    
    nonResidents = excludeColumns(nonResidents, excludedColumns);

    res.setHeader('Content-Disposition', 'attachment; filename="non_residents.csv"');
    res.setHeader('Content-Type', 'text/csv');

    const csvStream = fastCsv.format({ headers: true });
    csvStream.pipe(res);
    nonResidents.forEach((row) => csvStream.write(row));
    csvStream.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV.');
  }
});

router.get('/download/house-classification-csv', async (req, res) => {
  try {
    const houseClassificationQuery = `
      SELECT purok, houseNumber, houseRepresentative, numberOfFamilies, isWithCr, isWith40mZone, isEnergized, housingMaterials, waterSource
      FROM house_classification ORDER BY purok;
    `;
    const houseClassification = await executeQuery(houseClassificationQuery);

    res.setHeader('Content-Disposition', 'attachment; filename="house_classification.csv"');
    res.setHeader('Content-Type', 'text/csv');

    const csvStream = fastCsv.format({ headers: true });
    csvStream.pipe(res);
    houseClassification.forEach((row) => csvStream.write(row));
    csvStream.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating CSV.');
  }
});

router.get('/download/bundle-csv', async (req, res) => {
  try {
    const residentsQuery = `SELECT * FROM residents WHERE isResident = TRUE ORDER BY purok;`;
    const nonResidentsQuery = `
      SELECT b.originalPurok AS purok, r.*
      FROM boarders b
      JOIN residents r ON b.boarderInResidentId = r.residentsId
      ORDER BY b.originalPurok;
    `;

    // Queries for classifications (excluding rclassificationid = 12)
    const classificationQueries = Object.keys(classificationNames).map(id => 
      `SELECT * FROM residents WHERE rclassificationid = ${id} ORDER BY purok;`
    );

    // Queries for filtered datasets
    const filteredQueries = [
      { column: 'issenior', filename: 'seniors' },
      { column: 'ispwd', filename: 'pwd' },
      { column: 'issoloparent', filename: 'solo_parents' },
      { column: 'is4ps', filename: '4ps' },
      { column: 'isyouth', filename: 'youth' }
    ].map(({ column, filename }) => ({
      query: `SELECT * FROM residents WHERE ${column} = TRUE ORDER BY purok;`,
      filename
    }));

    // Execute all queries
    let [residents, nonResidents, ...classificationsAndFiltered] = await Promise.all([
      executeQuery(residentsQuery),
      executeQuery(nonResidentsQuery),
      ...classificationQueries.map(query => executeQuery(query)),
      ...filteredQueries.map(({ query }) => executeQuery(query))
    ]);

    // Separate classifications and filtered datasets
    let classifications = classificationsAndFiltered.slice(0, Object.keys(classificationNames).length);
    let filteredData = classificationsAndFiltered.slice(Object.keys(classificationNames).length);

    // Exclude unwanted columns
    residents = excludeColumns(residents, excludedColumns);
    nonResidents = excludeColumns(nonResidents, excludedColumns);
    classifications = classifications.map(classData => excludeColumns(classData, excludedColumns));
    filteredData = filteredData.map(filterData => excludeColumns(filterData, excludedColumns));

    residents = reorderColumns(residents);
    nonResidents = reorderColumns(nonResidents);
    classifications = classifications.map(reorderColumns);
    filteredData = filteredData.map(reorderColumns);

    // Define file paths
    const residentsCsv = path.join(tempDir, 'residents.csv');
    const nonResidentsCsv = path.join(tempDir, 'non_residents.csv');
    const classificationFiles = Object.entries(classificationNames).map(([id, name], index) => ({
      path: path.join(tempDir, `${name}.csv`),
      data: classifications[index],
      name: `${name}.csv`
    }));

    const filteredFiles = filteredQueries.map(({ filename }, index) => ({
      path: path.join(tempDir, `${filename}.csv`),
      data: filteredData[index],
      name: `${filename}.csv`
    }));

    // Generate CSV files
    await Promise.all([
      generateCsv(residents, residentsCsv),
      generateCsv(nonResidents, nonResidentsCsv),
      ...classificationFiles.map(({ data, path }) => generateCsv(data, path)),
      ...filteredFiles.map(({ data, path }) => generateCsv(data, path))
    ]);

    // Create ZIP archive
    res.setHeader('Content-Disposition', 'attachment; filename="data_bundle.zip"');
    res.setHeader('Content-Type', 'application/zip');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    // Add files to the archive
    archive.file(residentsCsv, { name: 'residents.csv' });
    archive.file(nonResidentsCsv, { name: 'non_residents.csv' });
    classificationFiles.forEach(({ path, name }) => archive.file(path, { name }));
    filteredFiles.forEach(({ path, name }) => archive.file(path, { name }));

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
