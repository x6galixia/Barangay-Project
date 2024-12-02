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
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
  
    return age;
  }
    

module.exports = calculateAge;
