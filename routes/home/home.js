const express = require('express');
const router = express.Router();
const { requestSchema } = require("../../middlewares/schemas/schemas");
const mPool = require("../../models/mDatabase");

router.get("/dashboard", (req, res) => {
    res.render("home/home", {
        title: "Home"
    });
});

router.get("/dashboard/fetchScannedData", async (req, res) => {
    const { qrCode } = req.query;
    console.log("Received scanned QR Code:", qrCode);

    try {
        const residentQuery = `
        SELECT * FROM residents
        WHERE globalid = $1
      `;

        const residentResult = await mPool.query(residentQuery, [
            qrCode,
        ]);

        if (residentResult.rows.length > 0) {
            res.status(200).json({ success: true, data: residentResult.rows[0] });
        } else {
            res.status(200).json({ success: false, error: "QR not registered in the database!" });
        }

    } catch (err) {
        console.error("Error querying database:", err.message);
        res.status(500).send("Server error");
    }
});

router.post("/service-request-form", async (req, res) => {
    const { error, value } = requestSchema.validate(req.body);
    console.log("scannedData", value)
    if (error) { return res.status(400).json({ error: error.details[0].message }); }

    try {
        const residentExistQuery = `SELECT residentsid FROM residents WHERE globalid = $1`;
        const residentExistResult = await mPool.query(residentExistQuery, [value.id]);
        if (value.id === "MPDN0000") {
            if (residentExistResult.rows.length > 0) {
                const residentsid = residentExistResult.rows[0].residentsid;

                const updateResidentQuery = `
                UPDATE residents 
                SET lname = $1, fname = $2, mname = $3, birthdate = $5, birthplace = $6, age = $7, income = $8, civilStatus = $9
                WHERE residentsid = $4
            `;
                await mPool.query(updateResidentQuery, [
                    value.lastname,
                    value.firstname,
                    value.middlename,
                    residentsid,
                    value.birthdate,
                    value.birthplace,
                    value.age,
                    value.income,
                    value.civilStatus,
                ]);


                const todayDate = new Date().toISOString().split('T')[0];

                await mPool.query(`
                INSERT INTO requests (residentsid, dateadded, purpose) 
                VALUES ($1, $2, $3)`, [residentsid, todayDate, value.purpose]);
                req.flash('success', 'Request is transfered in services!');
            } else {
                // Resident does not exist - Insert new record

                 //insert fake data in the required column for the contact person
                 await mPool.query(`
                    INSERT INTO contactPerson (contactPersonId, fname, lname) 
                VALUES ($1, $2, $3)`, [0, "fake-data", "fake-data"]);
                
                //insert data to the mpdn000 row    
                const insertResidentQuery = `
                INSERT INTO residents (globalid, idnumber, lname, fname, mname, birthdate, birthplace, age, income, civilStatus, emergencyContactId, rClassificationId, purok) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
                RETURNING residentsid
            `;
                const insertResult = await mPool.query(insertResidentQuery, [
                    value.id,
                    "2020-0000",
                    value.lastname,
                    value.firstname,
                    value.middlename,
                    value.birthdate,
                    value.birthplace,
                    value.age,
                    value.income,
                    value.civilStatus,
                    0,
                    12,
                    'Sitaw'
                ]);


                const newResidentsId = insertResult.rows[0].residentsid;

                const todayDate = new Date().toISOString().split('T')[0];

                await mPool.query(`
                INSERT INTO requests (residentsid, dateadded, purpose) 
                VALUES ($1, $2, $3)`, [newResidentsId, todayDate, value.purpose]);
                req.flash('success', 'Request is transfered in services!');
            }
        } else {

            if (residentExistResult.rows.length > 0) {
                const residentsid = residentExistResult.rows[0].residentsid; // Get the residentsid from the query result

                const todayDate = new Date().toISOString().split('T')[0]; // Format today's date as YYYY-MM-DD

                await mPool.query(`
                    INSERT INTO requests (residentsid, dateadded, purpose) VALUES
                    ($1, $2, $3)`, [residentsid, todayDate, value.purpose]);

                req.flash('success', 'Request is transfered in services!');
            } else {
                req.flash('error', 'QR not registered in the database!');
            }
        }


        res.redirect('/home/dashboard');

    } catch (err) {
        console.error("Error: ", err);
        req.flash('error', 'An error occurred while processing your request.');
        res.redirect('/home/dashboard');
    }
});

router.get('/dashboard/checkIfHasARecord', async (req, res) => {
    const { name } = req.query;
  
    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }
    try {
      const query = `
        SELECT EXISTS (
          SELECT 1
          FROM lupon
          WHERE LOWER(respondent) LIKE LOWER('%' || $1 || '%')
        );
      `;
      const values = [name];
      const result = await mPool.query(query, values);
  
      res.status(200).json({ exists: result.rows[0].exists });
    } catch (error) {
      console.error('Error querying the database:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

module.exports = router;