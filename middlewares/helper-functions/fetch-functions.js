const mPool = require("../../models/mDatabase");
const { calculateAge } = require("./calculations");

async function fetchResidentsLists(page, limit, searchQuery = '', isNonResident = true) {
  const offset = (page - 1) * limit;
  const residentsValues = [limit, offset, !isNonResident]; // Ensure isResident is a boolean
  const totalItemsValues = [!isNonResident]; // Ensure isResident is a boolean

  let searchCondition = '';
  if (searchQuery && searchQuery.trim() !== '') {
    const searchPattern = `%${searchQuery.trim()}%`;
    searchCondition = `
      AND (
        CONCAT(r.fname, ' ', COALESCE(r.mname, ''), ' ', r.lname) ILIKE $${residentsValues.length + 1}
        OR CONCAT(r.fname, ' ', r.lname) ILIKE $${residentsValues.length + 1}
        OR r.idNumber ILIKE $${residentsValues.length + 1}
      )`;
    residentsValues.push(searchPattern);
    totalItemsValues.push(searchPattern);
  }

  const residentsQuery = `
    SELECT
      r.globalId, r.residentsId, r.idNumber, r.fname, r.mname, r.lname,
      r.street, r.purok, r.barangay, r.city, r.province, r.birthDate, r.age,
      r.gender, r.picture, r.signature, r.eAttainment, r.occupation, r.isresident,
      rc.rClassificationName AS residentClassification,
      cp.fname AS emergencyContactFName, cp.mname AS emergencyContactMName,
      cp.lname AS emergencyContactLName, cp.contactNumber AS emergencyContactNumber,
      cp.street AS emergencyContactStreet, cp.purok AS emergencyContactPurok,
      cp.barangay AS emergencyContactBarangay, cp.city AS emergencyContactCity,
      cp.province AS emergencyContactProvince,
      bd.originalstreet, bd.originalpurok,
      bd.originalbarangay, bd.originalcity,
      bd.originalprovince,
      r.isPwd, r.isSoloParent, r.isYouth, r.is4ps, r.isResident, r.civilStatus,
      r.isOutOfSchoolYouth, r.isSkm, r.isKm,
      bo.punongbarangaylastname, bo.punongbarangayfirstname, bo.punongbarangaymiddlename
    FROM residents r
    LEFT JOIN rClassification rc ON r.rClassificationId = rc.rClassificationId
    LEFT JOIN contactPerson cp ON r.emergencyContactId = cp.contactPersonId
    LEFT JOIN boarders bd ON r.residentsid = bd.boarderinresidentid
    CROSS JOIN barangay_officials bo
    WHERE r.isResident = $3
      ${searchCondition}
    ORDER BY r.fname
    LIMIT $1::INTEGER OFFSET $2::INTEGER;
  `;

  const totalItemsQuery = `
    SELECT COUNT(*) as count
    FROM residents r
    WHERE r.isResident = $1
      ${searchQuery && searchQuery.trim() !== '' ? `
        AND (
          CONCAT(r.fname, ' ', COALESCE(r.mname, ''), ' ', r.lname) ILIKE $2
          OR CONCAT(r.fname, ' ', r.lname) ILIKE $2
          OR r.idNumber ILIKE $2
        )
      ` : ''}
  `;

  try {
    // Get the total number of residents
    const totalItemsResult = await mPool.query(totalItemsQuery, totalItemsValues);
    const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    const residentsResult = await mPool.query(residentsQuery, residentsValues);

    const residentsList = residentsResult.rows.map(row => ({
      ...row,
      age: row.birthdate ? calculateAge(row.birthdate) : null
    }));

    return { getResidentsList: residentsList, totalPages };
  } catch (err) {
    console.error('Error fetching residents list:', err.message);
    throw new Error('Error fetching residents list');
  }
}

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
          rd.fname, rd.mname, rd.lname, rd.gender, rd.age, rd.civilstatus, rd.street,
          rd.purok, rd.barangay, rd.city, rd.province, rd.birthdate, rd.birthplace,
          bo.punongbarangaylastname, bo.punongbarangayfirstname, bo.punongbarangaymiddlename
      FROM requests r
      LEFT JOIN residents rd ON r.residentsid = rd.residentsid
      CROSS JOIN barangay_officials bo
      WHERE r.isReleased = false
      ORDER BY r.id DESC
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

async function fetchOfficialList() {
  try {
    const getOfficialList = await mPool.query(`
      SELECT * FROM barangay_officials;
    `);

    return {
      getOfficialList: getOfficialList,
    };
  } catch (err) {
    console.error("Error fetching residents list: ", err.message, err.stack);
    throw new Error("Error fetching residents list");
  }
}

async function fetchInventoryLists(page, limit, searchQuery = '', isFunctional = true) {
  const offset = (page - 1) * limit;

  const inventoryValues = [limit, offset, isFunctional];
  const totalItemsValues = [isFunctional];

  let searchCondition = '';
  if (searchQuery && searchQuery.trim() !== '') {
    const searchPattern = `%${searchQuery.trim()}%`;
    searchCondition = ` 
      AND (
        CONCAT(i.iName, ' ', COALESCE(c.categoryName)) ILIKE $${inventoryValues.length + 1}
        OR i.iName ILIKE $${inventoryValues.length + 1}
        OR c.categoryName ILIKE $${inventoryValues.length + 1}
      )`;
    inventoryValues.push(searchPattern);
    totalItemsValues.push(searchPattern);
  }

  const inventoryQuery = `
    SELECT 
        i.id AS inventory_id,
        i.iName AS inventory_name,
        i.quantity,
        i.iPrice,
        i.dateAdded,
        i.isFunctional,
        c.categoryId,
        c.categoryName
    FROM inventory i 
    JOIN categories c ON i.categoryId = c.categoryId
    WHERE i.isFunctional = $3
    ${searchCondition}
    ORDER BY i.iName
    LIMIT $1::INTEGER OFFSET $2::INTEGER;
  `;

  const totalItemsQuery = `
    SELECT COUNT(*) as count
    FROM inventory i 
    JOIN categories c ON i.categoryId = c.categoryId
    WHERE i.isFunctional = $1
    ${searchQuery && searchQuery.trim() !== '' ? ` AND (
        CONCAT(i.iName, ' ', COALESCE(c.categoryName)) ILIKE $2
        OR i.iName ILIKE $2
        OR c.categoryName ILIKE $2
      )` : ''}
  `;

  try {
    const totalItemsResult = await mPool.query(totalItemsQuery, totalItemsValues);
    const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
    console.log("Total Items:", totalItems);  // Debugging line
    const totalPages = Math.ceil(totalItems / limit);
    console.log("Total Pages:", totalPages);  // Debugging line

    const inventoryResult = await mPool.query(inventoryQuery, inventoryValues);
    console.log("Inventory Results:", inventoryResult.rows);  // Debugging line
    return { getInventoryList: inventoryResult.rows, totalItems, totalPages };
  } catch (err) {
    console.error('Error fetching INVENTORY list:', err.message);
    throw new Error('Error fetching INVENTORY list');
  }
}

async function fetchArchiveData(page, limit, searchQuery = '', doctype = 'Lupon') {
  const offset = (page - 1) * limit;
  const archiveValues = [limit, offset];
  const totalItemsValues = [];

  let searchCondition = '';
  let searchConditionForTotal = '';
  let doctypeCondition = '';
  let doctypeConditionForTotal = '';

  if (searchQuery && searchQuery.trim() !== '') {
    const searchPattern = `%${searchQuery.trim()}%`;
    // Modify search condition to use specific fields based on the type
    searchCondition = `
      AND (
        CAST(a.archiveId AS TEXT) ILIKE $${archiveValues.length + 1}  -- Search by archiveId
        OR EXISTS (SELECT 1 FROM panumduman p WHERE p.archiveId = a.archiveId AND p.contractingPersons ILIKE $${archiveValues.length + 1})  -- Search within panumduman
        OR EXISTS (SELECT 1 FROM lupon l WHERE l.archiveId = a.archiveId AND (
          l.caseNumber ILIKE $${archiveValues.length + 1}
          OR l.complainant ILIKE $${archiveValues.length + 1}
          OR l.respondent ILIKE $${archiveValues.length + 1}
        ))  -- Search within lupon
        OR EXISTS (SELECT 1 FROM ordinance o WHERE o.archiveId = a.archiveId AND (
          o.ordinanceNumber ILIKE $${archiveValues.length + 1}
          OR o.authors ILIKE $${archiveValues.length + 1}
          OR o.coauthors ILIKE $${archiveValues.length + 1}
          OR o.sponsors ILIKE $${archiveValues.length + 1}
        ))  -- Search within ordinance
        OR EXISTS (SELECT 1 FROM resolution r WHERE r.archiveId = a.archiveId AND r.resolutionNumber ILIKE $${archiveValues.length + 1})  -- Search within resolution
        OR EXISTS (SELECT 1 FROM regularization_minutes rm WHERE rm.archiveId = a.archiveId AND rm.regulationNumber::TEXT ILIKE $${archiveValues.length + 1})  -- Search within regularization_minutes
      )`;
    searchConditionForTotal = `
      AND (
        CAST(a.archiveId AS TEXT) ILIKE $${totalItemsValues.length + 1}
        OR EXISTS (SELECT 1 FROM panumduman p WHERE p.archiveId = a.archiveId AND p.contractingPersons ILIKE $${totalItemsValues.length + 1})
        OR EXISTS (SELECT 1 FROM lupon l WHERE l.archiveId = a.archiveId AND (
          l.caseNumber ILIKE $${totalItemsValues.length + 1}
          OR l.complainant ILIKE $${totalItemsValues.length + 1}
          OR l.respondent ILIKE $${totalItemsValues.length + 1}
        ))
        OR EXISTS (SELECT 1 FROM ordinance o WHERE o.archiveId = a.archiveId AND (
          o.ordinanceNumber ILIKE $${totalItemsValues.length + 1}
          OR o.authors ILIKE $${totalItemsValues.length + 1}
          OR o.coauthors ILIKE $${totalItemsValues.length + 1}
          OR o.sponsors ILIKE $${totalItemsValues.length + 1}
        ))
        OR EXISTS (SELECT 1 FROM resolution r WHERE r.archiveId = a.archiveId AND r.resolutionNumber ILIKE $${totalItemsValues.length + 1})
        OR EXISTS (SELECT 1 FROM regularization_minutes rm WHERE rm.archiveId = a.archiveId AND rm.regulationNumber::TEXT ILIKE $${totalItemsValues.length + 1})
      )`;
    archiveValues.push(searchPattern);
    totalItemsValues.push(searchPattern);
  }

  if (doctype) {
    doctypeCondition = `AND dt.typeName = $${archiveValues.length + 1}`;
    doctypeConditionForTotal = `AND dt.typeName = $${totalItemsValues.length + 1}`;
    archiveValues.push(doctype);
    totalItemsValues.push(doctype);
  }

  const archiveQuery = `
    SELECT
      a.archiveId, dt.typeName,
      CASE dt.typeName
        WHEN 'Panumduman' THEN (
          SELECT json_agg(
            json_build_object(
              'archID', p.archiveId,
              'date', p.date,
              'image', p.image,
              'contractingPersons', p.contractingPersons,
              'panumdumanId', p.panumdumanid
            )
          )
          FROM panumduman p
          WHERE p.archiveId = a.archiveId
        )
        WHEN 'Lupon' THEN (
          SELECT json_agg(
            json_build_object(
              'archID', l.archiveId,
              'caseNumber', l.caseNumber,
              'complainant', l.complainant,
              'respondent', l.respondent,
              'dateFiled', l.dateFiled,
              'image', l.image,
              'caseType', l.caseType,
              'luponId', l.luponid
            )
          )
          FROM lupon l
          WHERE l.archiveId = a.archiveId
        )
        WHEN 'Ordinance' THEN (
          SELECT json_agg(
            json_build_object(
              'archID', o.archiveId,
              'ordinanceNumber', o.ordinanceNumber,
              'title', o.title,
              'authors', o.authors,
              'coAuthors', o.coAuthors,
              'sponsors', o.sponsors,
              'image', o.image,
              'dateApproved', o.dateApproved,
              'ordinanceId', o.ordinanceid
            )
          )
          FROM ordinance o
          WHERE o.archiveId = a.archiveId
        )
        WHEN 'Resolution' THEN (
          SELECT json_agg(
            json_build_object(
              'archID', r.archiveId,
              'resolutionNumber', r.resolutionNumber,
              'seriesYear', r.seriesYear,
              'image', r.image,
              'date', r.date,
              'resolutionId', r.resolutionid
            )
          )
          FROM resolution r
          WHERE r.archiveId = a.archiveId
        )
        WHEN 'Regularization Minutes' THEN (
          SELECT json_agg(
            json_build_object(
              'archID', rm.archiveId,
              'regulationNumber', rm.regulationNumber,
              'image', rm.image,
              'date', rm.date,
              'regularizationId', rm.regularizationid
            )
          )
          FROM regularization_minutes rm
          WHERE rm.archiveId = a.archiveId
        )
        ELSE NULL
      END AS documentDetails
    FROM archive a
    JOIN document_type dt ON a.doctypeId = dt.doctypeId
    WHERE 1=1
      ${doctypeCondition}
      ${searchCondition}
    ORDER BY a.archiveId
    LIMIT $1 OFFSET $2;
  `;

  const totalItemsQuery = `
    SELECT COUNT(*) as count
    FROM archive a
    JOIN document_type dt ON a.doctypeId = dt.doctypeId
    WHERE 1=1
      ${doctypeConditionForTotal}
      ${searchConditionForTotal};
  `;

  try {
    // Fetch total items
    const totalItemsResult = await mPool.query(totalItemsQuery, totalItemsValues);
    const totalItems = parseInt(totalItemsResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);
    
    // Fetch paginated archive data
    const archiveResult = await mPool.query(archiveQuery, archiveValues);
    const archiveList = archiveResult.rows;

    return { archiveList, totalPages, totalItems };
  } catch (err) {
    console.error('Error fetching archive data:', err.message);
    throw new Error('Error fetching archive data');
  }
}

module.exports = {
  fetchResidentsLists,
  fetchRequestLists,
  fetchInventoryLists,
  fetchArchiveData,
  fetchOfficialList
};