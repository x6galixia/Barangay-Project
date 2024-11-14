const mPool = require("../../models/mDatabase");

//fetch function for residents list that inlude search
async function fetchResidentsLists(page, limit, searchQuery = '') {
  let offset = (page - 1) * limit;

  limit = parseInt(limit, 10);
  offset = parseInt(offset, 10);

  // Initialize values with limit and offset for the residents query
  let residentsValues = [limit, offset];

  // Define the search condition for searchQuery
  let searchCondition = '';
  if (searchQuery && searchQuery.trim() !== '') {
    searchCondition = `
      AND (
        CONCAT(r.fname, ' ', COALESCE(r.mname, ''), ' ', r.lname) ILIKE $3
        OR CONCAT(r.fname, ' ', r.lname) ILIKE $3
        OR r.idNumber ILIKE $3
      )`;
    residentsValues.push(`%${searchQuery}%`); // Add the search term to residentsValues
  }

  // Total items query (no need for limit or offset)
  const totalItemsQuery = `
    SELECT COUNT(*) as count
    FROM residents r
    WHERE 1=1
      ${searchQuery ? 'AND (CONCAT(r.fname, \' \', COALESCE(r.mname, \'\'), \' \', r.lname) ILIKE $1 OR CONCAT(r.fname, \' \', r.lname) ILIKE $1 OR r.idNumber ILIKE $1)' : ''}
  `;
  const totalItemsValues = searchQuery ? [`%${searchQuery}%`] : []; // Separate array for total items query parameters

  try {
    // Debugging totalItems query and values
    console.log("Total Items Query: ", totalItemsQuery); // Full query
    console.log("Total Items Values: ", totalItemsValues); // Parameters passed to the query

    // Pass totalItemsValues to the total items query
    const totalItemsResult = await mPool.query(totalItemsQuery, totalItemsValues);
    const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    // Residents query (passing limit, offset, and searchQuery if provided)
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
      WHERE 1=1 ${searchCondition}
      ORDER BY r.fname
      LIMIT $1 OFFSET $2;
    `;

    // Pass the correct parameters for residents query
    const residentsResult = await mPool.query(residentsQuery, residentsValues);

    return { getResidentsList: residentsResult.rows, totalPages };
  } catch (err) {
    console.error("Error: ", err.message, err.stack);
    throw new Error("Error fetching residents list");
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