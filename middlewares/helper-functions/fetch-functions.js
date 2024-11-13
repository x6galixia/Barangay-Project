const mPool = require("../../models/mDatabase");

//fetch function for residents
async function fetchResidentsLists(page, limit) {
  const offset = (page - 1) * limit;

  try {
    const totalItemsResult = await mPool.query(`
      SELECT COUNT(*) as count
      FROM residents r;
    `);

    const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const getResidentsList = await mPool.query(`
      SELECT 
        r.globalId,
        r.residentsId, 
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
        r.age, 
        r.gender, 
        r.picture, 
        r.signature, 
        r.eAttainment, 
        r.occupation, 
        rc.rClassificationName AS residentClassification, 
        hc.hClassificationName AS houseClassification, 
        wc.wClassificationName AS waterSource,
        r.isPwd, 
        r.isSoloParent, 
        r.isYouth, 
        r.is4ps, 
        r.isWithCr, 
        r.isWith40mZone, 
        r.isEnergized,
        r.isResident,
        r.civil_status
      FROM residents r
      LEFT JOIN rClassification rc ON r.rClassificationId = rc.rClassificationId
      LEFT JOIN hClassification hc ON r.hClassificationId = hc.hClassificationId
      LEFT JOIN wClassification wc ON r.waterSource = wc.wClassificationId
      ORDER BY r.fName
      LIMIT $1 OFFSET $2;
    `, [limit, offset]);

    return { getResidentsList: getResidentsList.rows, totalPages };
  } catch (err) {
    console.error("Error: ", err.message, err.stack);
    throw new Error("Error fetching residents list");
  }
}

module.exports = {
  fetchResidentsLists
};