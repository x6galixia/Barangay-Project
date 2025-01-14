function extractPrefixAndNumber(lastId) {
  if (typeof lastId !== "string") {
      console.error("Invalid lastId type, expected string but got:", typeof lastId, lastId);
      return null;
  }

  const idNumberWithHyphenMatch = lastId.match(/^(\d{4})-(\d+)$/);
  if (idNumberWithHyphenMatch) {
      return {
          prefix: idNumberWithHyphenMatch[1],
          number: parseInt(idNumberWithHyphenMatch[2], 10),
      };
  }

  const globalIdMatch = lastId.match(/^([A-Z]+)(\d+)$/);
  if (globalIdMatch) {
      return {
          prefix: globalIdMatch[1],
          number: parseInt(globalIdMatch[2], 10),
      };
  }

  console.error("ID format mismatch:", lastId);
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
  return "MPDN0000";
}

function generateIdNumberNextId(lastId) {
  const extracted = extractPrefixAndNumber(lastId);

  if (extracted) {
    const { prefix, number } = extracted;
    const newNumber = number + 1;
    return `${prefix}-${String(newNumber).padStart(4, "0")}`; // Format with hyphen
  }

  return `${getCurrentYear()}-0000`; // Default format if no last ID is found
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