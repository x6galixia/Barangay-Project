function calculateAge(birthDate) {
  if (!birthDate) {
    return null;
  }

  const birthDateObj = new Date(birthDate);

  if (isNaN(birthDateObj)) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDifference = today.getMonth() - birthDateObj.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDateObj.getDate())
  ) {
    age--;
  }

  return age;
}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

module.exports = {
  calculateAge,
  getCurrentDate,
};
