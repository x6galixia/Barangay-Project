const searchBar = document.getElementById('searchBar');
const searchIcon = document.getElementById('searchIcon');

searchIcon.addEventListener('click', () => {
  searchBar.classList.toggle('open');
  if (searchBar.classList.contains('open')) {
    searchBar.focus();
    document.getElementById('scanSwitch').checked = false;
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
    document.getElementById('searchBar').addEventListener('input', function () {
      const query = document.getElementById("searchBar").value;

      if (query.length > 3) {
        fetch(`/home/dashboard/fetchManualData?residentId=${query}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the JSON response
          })
          .then(data => {
            const resultsContainer = document.getElementById('results');
            resultsContainer.style.display = 'flex';
            resultsContainer.innerHTML = '';

            if (data.success && data.data.length > 0) {
              data.data.forEach(resident => {
                const listItem = document.createElement('div');
                listItem.textContent = `${resident.fname} ${resident.mname} ${resident.lname}`;
                listItem.classList.add('result-item');
                resultsContainer.appendChild(listItem);


                listItem.addEventListener('click', () => {
                  document.getElementById('searchBar').value = resident.idnumber;
                  document.getElementById('qrOutput').value = resident.globalid;
                  if (!resident.ispaid) {
                    showPrompt("Payment Reminder", "This account shows an outstanding balance. Please settle the payment to avoid service interruptions.");
                  } else {
                    const scannedName = `${resident.fname} ${resident.mname} ${resident.lname}`;
                    // Generate permutations of the name
                    const nameVariants = [
                      `${resident.fname} ${resident.mname} ${resident.lname}`,
                      `${resident.fname} ${resident.lname} ${resident.mname}`,
                      `${resident.lname} ${resident.mname} ${resident.fname}`,
                      `${resident.lname} ${resident.fname} ${resident.mname}`,
                      `${resident.mname} ${resident.fname} ${resident.lname}`,
                      `${resident.mname} ${resident.lname} ${resident.fname}`,
                      `${resident.fname} ${resident.lname}`,
                      `${resident.lname} ${resident.fname}`
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
                            showPrompt("Record Found", "This account has a record in the Lupon documents. Please review the details.");
                          } else {
                            // console.log("No record found for the name:", nameVariant);
                          }
                        })
                        .catch(error => {
                          console.error('Error:', error.message);
                          alert('An unexpected error occurred. Please try again later.');
                        });
                    }
                    populateFormFields(data.data);
                  }
                  populateFormFields(resident);
                  resultsContainer.innerHTML = '';
                  resultsContainer.style.display = 'none';
                });
              });
            } else {
              resultsContainer.textContent = '--No results found!--';
            }
          })
          .catch(error => {
            console.error("Error fetching residents:", error);
          });
      } else {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
      }
    });
  } else {
    const resultsContainer = document.getElementById('results');
    searchBar.value = '';
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';
  }
  function showPrompt(header, message) {
    const submitPrompt1 = document.getElementById("submit_prompt1");
    submitPrompt1.classList.add("visible1");
    document.querySelector('.error-message').textContent = message;
    document.getElementById('scanningHeaderMessage').innerText = header;
    const overlay = document.querySelector('.overlay');
    if (overlay) {
      overlay.classList.add("visible");
    }
  }
});


document.getElementById('scanSwitch').addEventListener('change', function () {
  let scanning = false;
  const inputFields = document.querySelectorAll('.formInputContainer input, .formInputContainer select');
  const submitButton = document.getElementById('submitButton');

  if (this.checked) {
    // Switch is enabled
    const resultsContainer = document.getElementById('results');
    searchBar.classList.remove('open');
    resultsContainer.innerHTML = '';
    resultsContainer.style.display = 'none';
    document.getElementById('qrOutput').value = "MPDN0000";
    searchBar.value = '';
    inputFields.forEach(field => field.removeAttribute('readonly'));
    document.getElementById('purokLabel').innerText = "Address (Optional)";
    document.getElementById('birthplaceLabel').innerText = "Birthplace (Optional)";
    document.getElementById('middlename1').innerText = "Middle Name (Optional)";
    document.getElementById('grossIncomeLabel').innerText = "Gross Income (Optional)";
    submitButton.removeAttribute('disabled');
    document.getElementById("purpose").innerHTML = `
    <option value=" default" disabled selected>
      Select a Services
    </option>
    <option value="Business Clearance">Business Clearance</option>
    <option value="Business Closure">Business Closure</option>
    `
  } else {
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
    executeElseLogic(); // Call the else logic as a separate function
  }

  // Define the else logic as a reusable function
  function executeElseLogic() {
    document.getElementById('purokLabel').innerText = "Purok";
    document.getElementById('birthplaceLabel').innerText = "Birthplace";
    document.getElementById('grossIncomeLabel').innerText = "Gross Income";
    document.getElementById('middlename1').innerText = "Middle Name";
    inputFields.forEach(field => field.setAttribute('readonly', true));
    submitButton.setAttribute('disabled', true);

    function checkId() {
      const idInput = document.getElementById('qrOutput');
      if (idInput.value.trim() !== '') {
        submitButton.disabled = false;
      } else {
        submitButton.disabled = true;
      }
    }

    window.addEventListener('load', checkId);
    document.getElementById('qrOutput').addEventListener('input', checkId);
    let qrInputField = document.getElementById('qrInput');

    // Enable scanning and focus the QR input field
    document.addEventListener('keydown', handleKeyDown);
    qrInputField.addEventListener('keypress', handleKeyPress);
    qrInputField.focus();

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
                  `${data.data.mname} ${data.data.lname} ${data.data.fname}`,
                  `${data.data.fname} ${data.data.lname}`,
                  `${data.data.lname} ${data.data.fname}`
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
                        showPrompt("Record Found", "This account has a record in the Lupon documents. Please review the details.");
                      } else {
                        // console.log("No record found for the name:", nameVariant);
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
  // executeElseLogic();
  document.getElementById('scanSwitch').checked = false;
  document.getElementById('scanSwitch').dispatchEvent(new Event('change'));
});


function populateFormFields(data) {
  submitButton.removeAttribute('disabled');
  document.getElementById("lastname").value = data.lname || '';
  document.getElementById("firstname").value = data.fname || '';
  document.getElementById("middlename").value = data.mname || '';
  document.getElementById("age").value = data.age || '';
  // document.getElementById("birthdate").value = new Date(data.birthdate).toISOString().split("T")[0] || '';
  document.getElementById("civilStatus").value = data.civilstatus || '';
  document.getElementById("purok").value = data.purok || '';
  document.getElementById("grossIncome").value = data.income || '';
  document.getElementById("birthplace").value = data.birthplace || '';

  let birthdate = new Date(data.birthdate);
  if (!isNaN(birthdate.getTime())) {
    let formattedDate = birthdate.getFullYear() + '-' +
                        String(birthdate.getMonth() + 1).padStart(2, '0') + '-' +
                        String(birthdate.getDate()).padStart(2, '0');

    document.getElementById("birthdate").value = formattedDate;
  } else {
    document.getElementById("birthdate").value = ''; // Handle invalid date
  }

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

