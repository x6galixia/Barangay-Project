const mPool = require("../../models/mDatabase");

//fetch function for residents list that inlude search
async function fetchResidentsLists(page, limit, searchQuery = '', isNonResident = false) {
  const offset = (page - 1) * limit;

  // Initialize parameter arrays
  const residentsValues = [limit, offset, !isNonResident];
  const totalItemsValues = [!isNonResident];

  let searchCondition = '';

  if (searchQuery && searchQuery.trim() !== '') {
    searchCondition = `
      AND (
        CONCAT(r.fname, ' ', COALESCE(r.mname, ''), ' ', r.lname) ILIKE $4
        OR CONCAT(r.fname, ' ', r.lname) ILIKE $4
        OR r.idNumber ILIKE $4
      )`;
    const searchPattern = `%${searchQuery}%`;
    residentsValues.push(searchPattern);
    totalItemsValues.push(searchPattern);
  }

  const residentsQuery = `
    SELECT
      r.globalId, r.residentsId, r.idNumber, r.fname, r.mname, r.lname,
      r.street, r.purok, r.barangay, r.city, r.province, r.birthDate, r.age,
      r.gender, r.picture, r.signature, r.eAttainment, r.occupation,
      rc.rClassificationName AS residentClassification,
      cp.fname AS emergencyContactFName, cp.mname AS emergencyContactMName,
      cp.lname AS emergencyContactLName, cp.contactNumber AS emergencyContactNumber,
      cp.street AS emergencyContactStreet, cp.purok AS emergencyContactPurok,
      cp.barangay AS emergencyContactBarangay, cp.city AS emergencyContactCity,
      cp.province AS emergencyContactProvince,
      r.isPwd, r.isSoloParent, r.isYouth, r.is4ps, r.isResident, r.civilStatus
    FROM residents r
    LEFT JOIN rClassification rc ON r.rClassificationId = rc.rClassificationId
    LEFT JOIN contactPerson cp ON r.emergencyContactId = cp.contactPersonId
    WHERE r.isResident = $3
      ${searchCondition}
    ORDER BY r.fname
    LIMIT $1 OFFSET $2;
  `;

  const totalItemsQuery = `
    SELECT COUNT(*) as count
    FROM residents r
    WHERE r.isResident = $1
      ${searchCondition};
  `;

  try {
    console.log('Residents Query:', residentsQuery);
    console.log('Residents Values:', residentsValues, residentsValues.map(v => typeof v));
    console.log('Total Items Query:', totalItemsQuery);
    console.log('Total Items Values:', totalItemsValues, totalItemsValues.map(v => typeof v));

    const totalItemsResult = await mPool.query(totalItemsQuery, totalItemsValues);
    const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const residentsResult = await mPool.query(residentsQuery, residentsValues);
    return { getResidentsList: residentsResult.rows, totalPages };
  } catch (err) {
    console.error('Error fetching residents list:', err.message);
    throw new Error('Error fetching residents list');
  }
}

// Fetch function for request where released is false
async function fetchRequestLists(page, limit) {
  const offset = (page - 1) * limit;

  try {
    const totalItemsResult = await mPool.query(`
      SELECT COUNT(*) as count
      FROM requests r
      WHERE r.isReleased = false;
    `);

    const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const getRequestList = await mPool.query(`
      SELECT 
          r.residentsid, r.dateadded, r.purpose, r.isReleased,
          rd.fname, rd.mname, rd.lname
      FROM requests r
      LEFT JOIN residents rd ON r.residentsid = rd.residentsid
      WHERE r.isReleased = false
      ORDER BY r.dateadded
      LIMIT $1 OFFSET $2;
    `, [limit, offset]);

    return {
      getRequestList: getRequestList.rows,
      totalPages,
      totalItems
    };
  } catch (err) {
    console.error("Error fetching residents list: ", err.message, err.stack);
    throw new Error("Error fetching residents list");
  }
}

module.exports = {
  fetchResidentsLists,
  fetchRequestLists
};