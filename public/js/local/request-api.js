// document.getElementById('scanSwitch').addEventListener('change', function () {
const qrInputField = document.getElementById('qrInput');
let scanning = false;

// if (this.checked) {

// Enable scanning and focus the QR input field
document.addEventListener('keydown', handleKeyDown);
qrInputField.addEventListener('keypress', handleKeyPress);
qrInputField.focus(); // Focus on the QR input field when scanning is enabled
// } else {
//   console.log("Scanning stopped");

//   // Disable scanning and remove focus from the QR input field
//   document.removeEventListener('keydown', handleKeyDown);
//   qrInputField.removeEventListener('keypress', handleKeyPress);
//   qrInputField.blur(); // Remove focus from the QR input field
// }

// Function to handle keydown event
function handleKeyDown(event) {
  // Only focus the input if scanning is active and a character key was pressed
  if (scanning === false && event.key.length === 1) {
    scanning = true;
    qrInputField.focus();
  }
}

// Function to handle keypress event when 'Enter' is pressed
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    const scannedData = event.target.value;
    const secretKey = "MnDev";

    // Decrypt function
    function decryptData(cipherText, secretKey) {
      const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    }

    const decryptedData = decryptData(scannedData, secretKey);

    document.getElementById("qrOutput").value = decryptedData;

    fetch(`/home/dashboard/fetchScannedData?qrCode=${decryptedData}`, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  })
      .then(response => {
          return response.json();
      })
      .then(data => {
          if (data.success) {
              populateFormFields(data.data);
          } else {
              const submitPrompt1 = document.getElementById("submit_prompt1");
              if (submitPrompt1) {
                  submitPrompt1.classList.add("visible1")
                  document.querySelector('.error-message').textContent = data.error;
                  const overlay = document.querySelector('.overlay');
                  if (overlay) {
                      overlay.classList.add("visible");
                  }
              }
          }
      })
      .catch(error => {
          console.error('Error:', error.message);
          alert('An unexpected error occurred. Please try again later.');
      });  

    event.target.value = '';
  }
}
// });

function populateFormFields(data) {
  document.getElementById("lastname").value = data.lname || '';
  document.getElementById("firstname").value = data.fname || '';
  document.getElementById("middlename").value = data.mname || '';
  document.getElementById("age").value = data.age || '';
  document.getElementById("birthdate").value = new Date(data.birthdate).toISOString().split("T")[0] || '';
  document.getElementById("civilStatus").value = data.civilstatus || '';
  document.getElementById("purok").value = data.purok || '';
  document.getElementById("grossIncome").value = data.income || '';
  document.getElementById("birthplace").value = data.birthplace || '';

  if (data.isresident === true){
    document.getElementById("purpose").innerHTML = `
    <option value=" default" disabled selected>
      Select a Services
    </option>
    <option value="Brgy. Clearance">Brgy. Clearance</option>
    <option value="Building Clearance">Building Clearance</option>
    <option value="Burial Certificate">Burial Certificate</option>
    <option value="Business Clearance">Business Clearance</option>
    <option value="Business Closure">Business Closure</option>
    <option value="Common Law">Common Law</option>
    <option value="Death Certificate">Death Certificate</option>
    <option value="Employment">Employment</option>
    <option value="Good Moral">Good Moral</option>
    <option value="Guardianship">Guardianship</option>
    <option value="Income">Income</option>
    <option value="Indigency">Indigency</option>
    <option value="Land no claim">Land no claim</option>
    <option value="Late Registration">Late Registration</option>
    <option value="Panumduman">Panumduman</option>
    <option value="RA 11261">RA 11261</option>
    <option value="Oath Of Undertaking">RA 11261 (Oath Of Undertaking)</option>
    <option value="Residency">Residency</option>
    <option value="Same Person">Same Person</option>
    <option value="Singleness">Singleness</option>
    <option value="Solo Parent">Solo Parent</option>
    <option value="Water District">Water District</option>
    `
  } else if (data.isresident === false) {
    document.getElementById("purpose").innerHTML = `
    <option value=" default" disabled selected>
      Select a Services
    </option>
    <option value="Brgy. Clearance">Brgy. Clearance</option>
    <option value="Indigency">Indigency</option>
    <option value="RA 11261">RA 11261</option>
    <option value="Oath Of Undertaking">RA 11261 (Oath Of Undertaking)</option>
    `
  }

}