const mPool = require("../../models/mDatabase");

function extractPrefixAndNumber(lastId) {
  const match = lastId.match(/^([A-Z]+)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const number = parseInt(match[2], 10);
    return { prefix, number };
  }
  return null;
}

function generateGlobalNextId(lastId) {
  const extracted = extractPrefixAndNumber(lastId);
  
  if (extracted) {
    const { prefix, number } = extracted;
    const newNumber = number + 1;
    return `${prefix}${String(newNumber).padStart(4, "0")}`;
  }
  
  return "MPDN0001";
}

function generateIdNumberNextId(lastId) {
  const extracted = extractPrefixAndNumber(lastId);
  
  if (extracted) {
    const { prefix, number } = extracted;
    const newNumber = number + 1;
    return `${prefix}${String(newNumber).padStart(4, "0")}`;
  }
  
  return `${getCurrentYear()}-0001`;
}

function getCurrentYear() {
  const currentYear = new Date().getFullYear();
  return currentYear;
}

module.exports = {
  generateGlobalNextId,
  generateIdNumberNextId
};