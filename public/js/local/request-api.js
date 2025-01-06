document.getElementById('scanSwitch').addEventListener('change', function () {
  let scanning = false;
  const inputFields = document.querySelectorAll('.formInputContainer input, .formInputContainer select');
  const submitButton = document.getElementById('submitButton');

  if (this.checked) {
    // Switch is enabled
    inputFields.forEach(field => field.removeAttribute('readonly'));
    document.getElementById('purokLabel').innerText = "Address (Optional)";
    document.getElementById('birthplaceLabel').innerText = "Birthplace (Optional)";
    document.getElementById('grossIncomeLabel').innerText = "Gross Income (Optional)";
    submitButton.removeAttribute('disabled');
  } else {
    executeElseLogic(); // Call the else logic as a separate function
  }

  // Define the else logic as a reusable function
  function executeElseLogic() {
    document.getElementById('purokLabel').innerText = "Purok";
    document.getElementById('birthplaceLabel').innerText = "Birthplace";
    document.getElementById('grossIncomeLabel').innerText = "Gross Income";
    inputFields.forEach(field => field.setAttribute('readonly', true));
    submitButton.setAttribute('disabled', true);
    console.log("Inputs disabled. qrOutput cleared.");

    function checkId() {
      const idInput = document.getElementById('qrOutput');
      if (idInput.value.trim() !== '') {
        submitButton.disabled = false;
        console.log("false");
      } else {
        console.log("true");
        submitButton.disabled = true;
      }
    }

    window.addEventListener('load', checkId);
    document.getElementById('qrOutput').addEventListener('input', checkId);
    let qrInputField = document.getElementById('qrInput');

    // Enable scanning and focus the QR input field
    document.addEventListener('keydown', handleKeyDown);
    qrInputField.addEventListener('keypress', handleKeyPress);
    qrInputField.focus(); // Focus on the QR input field when scanning is enabled

    // Function to handle keydown event
    function handleKeyDown(event) {
      if (scanning === false && event.key.length === 1) {
        scanning = true; // Set to true when a key is pressed
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
          },
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              console.log(data);
              if (!data.data.ispaid) {
                showPrompt("Payment Reminder", "This account shows an outstanding balance. Please settle the payment to avoid service interruptions.");
              } else {
                const scannedName = `${data.data.fname} ${data.data.mname} ${data.data.lname}`;
                // Generate permutations of the name
                const nameVariants = [
                  `${data.data.fname} ${data.data.mname} ${data.data.lname}`,
                  `${data.data.fname} ${data.data.lname} ${data.data.mname}`,
                  `${data.data.lname} ${data.data.mname} ${data.data.fname}`,
                  `${data.data.lname} ${data.data.fname} ${data.data.mname}`,
                  `${data.data.mname} ${data.data.fname} ${data.data.lname}`,
                  `${data.data.mname} ${data.data.lname} ${data.data.fname}`
                ];

                let exists = false;
                for (const nameVariant of nameVariants) {
                  fetch(`/home/dashboard/checkIfHasARecord?name=${encodeURIComponent(nameVariant)}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json'
                    }
                  })
                    .then(response => {
                      if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                      }
                      return response.json();
                    })
                    .then(data => {
                      if (data.exists) {
                        console.log("Record found for the name:", nameVariant);
                        showPrompt("Record Found", "This account has a record in the Lupon documents. Please review the details.");
                      } else {
                        console.log("No record found for the name:", nameVariant);
                      }
                    })
                    .catch(error => {
                      console.error('Error:', error.message);
                      alert('An unexpected error occurred. Please try again later.');
                    });
                }
                populateFormFields(data.data);
              }
            } else {
              showPrompt("Scanning QR Failed", data.error);
            }
          })
          .catch(error => {
            console.error('Error:', error.message);
            alert('An unexpected error occurred. Please try again later.');
          });

        // Reset scanning state after the scan
        scanning = false;
        event.target.value = ''; // Clear input field
        checkId();
      }
    }

    function showPrompt(header, message) {
      console.log("scanneddddd");
      const submitPrompt1 = document.getElementById("submit_prompt1");
      submitPrompt1.classList.add("visible1");
      document.querySelector('.error-message').textContent = message;
      document.getElementById('scanningHeaderMessage').innerText = header;
      const overlay = document.querySelector('.overlay');
      if (overlay) {
        overlay.classList.add("visible");
      }
    }
  }
});

// Execute the else logic on page load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('scanSwitch').checked = false;
  document.getElementById('scanSwitch').dispatchEvent(new Event('change'));
});


function populateFormFields(data) {
  submitButton.removeAttribute('disabled');
  document.getElementById("lastname").value = data.lname || '';
  document.getElementById("firstname").value = data.fname || '';
  document.getElementById("middlename").value = data.mname || '';
  document.getElementById("age").value = data.age || '';
  document.getElementById("birthdate").value = new Date(data.birthdate).toISOString().split("T")[0] || '';
  document.getElementById("civilStatus").value = data.civilstatus || '';
  document.getElementById("purok").value = data.purok || '';
  document.getElementById("grossIncome").value = data.income || '';
  document.getElementById("birthplace").value = data.birthplace || '';

  if (data.isresident === true) {
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