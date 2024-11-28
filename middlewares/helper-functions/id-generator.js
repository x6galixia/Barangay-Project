const mPool = require("../../models/mDatabase");

function extractPrefixAndNumber(lastId) {
  if (typeof lastId !== "string") {
    console.error("Invalid lastId type:", lastId); // Debugging log
    return null;
  }

  // Check for "YYYY-####" format (e.g., 2024-0001)
  const idNumberWithHyphenMatch = lastId.match(/^(\d{4})-(\d+)$/);
  if (idNumberWithHyphenMatch) {
    const prefix = idNumberWithHyphenMatch[1]; // "2024"
    const number = parseInt(idNumberWithHyphenMatch[2], 10); // "0001"
    return { prefix, number };
  }

  // Check for "PREFIX####" format (e.g., MPDN0001)
  const globalIdMatch = lastId.match(/^([A-Z]+)(\d+)$/);
  if (globalIdMatch) {
    const prefix = globalIdMatch[1]; // "MPDN"
    const number = parseInt(globalIdMatch[2], 10); // "0001"
    return { prefix, number };
  }

  console.error("ID format mismatch:", lastId); // Debugging log
  return null;
}

function generateGlobalNextId(lastId) {
  const extracted = extractPrefixAndNumber(lastId);

  if (extracted) {
    const { prefix, number } = extracted;
    const newNumber = number + 1;
    return `${prefix}${String(newNumber).padStart(4, "0")}`;
  }

  console.warn("Falling back to default ID: MPDN0001");
  return "MPDN0001";
}

function generateIdNumberNextId(lastId) {
  const extracted = extractPrefixAndNumber(lastId);

  if (extracted) {
    const { prefix, number } = extracted;
    const newNumber = number + 1;
    return `${prefix}-${String(newNumber).padStart(4, "0")}`; // Format with hyphen
  }

  return `${getCurrentYear()}-0001`; // Default format if no last ID is found
}

function getCurrentYear() {
  const currentYear = new Date().getFullYear();
  return currentYear;
}

module.exports = {
  generateGlobalNextId,
  generateIdNumberNextId,
  getCurrentYear
};