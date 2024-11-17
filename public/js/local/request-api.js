document.getElementById('scanSwitch').addEventListener('change', function () {
  const qrInputField = document.getElementById('qrInput');
  let scanning = false;

  if (this.checked) {
    console.log("Scanning started");

    // Enable scanning and focus the QR input field
    document.addEventListener('keydown', handleKeyDown);
    qrInputField.addEventListener('keypress', handleKeyPress);
    qrInputField.focus(); // Focus on the QR input field when scanning is enabled
  } else {
    console.log("Scanning stopped");

    // Disable scanning and remove focus from the QR input field
    document.removeEventListener('keydown', handleKeyDown);
    qrInputField.removeEventListener('keypress', handleKeyPress);
    qrInputField.blur(); // Remove focus from the QR input field
  }

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

      console.log(scannedData);

      // Decrypt function
      function decryptData(cipherText, secretKey) {
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
      }

      const decryptedData = decryptData(scannedData, secretKey);

      console.log(document.getElementById("qrOutput").value);
      console.log(decryptedData);

      // Set scanned data to the QR output field
      document.getElementById("qrOutput").value = decryptedData;

      // Send the scanned QR code data to the server
      fetch(`/home/dashboard/fetchScannedData?qrCode=${decryptedData}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          populateFormFields(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      // Clear the input after scanning
      event.target.value = '';
    }
  }
});

function populateFormFields(data) {
  document.getElementById("lastname").value = data.lname || '';
  document.getElementById("firstname").value = data.fname || '';
  document.getElementById("middlename").value = data.mname || '';
  document.getElementById("age").value = data.age || '';
  document.getElementById("birthdate").value = new Date(data.birthdate).toISOString().split("T")[0] || '';
  document.getElementById("civilStatus").value = data.civilstatus || '';
  document.getElementById("purok").value = data.purok || '';
  document.getElementById("birthplace").value = "Borongan City";
  document.getElementById("grossIncome").value = "10,000";
}