
document.addEventListener("DOMContentLoaded", async function () {
  const requestTableBody = document.getElementById('requestTableBody');

  // Get URL parameters for page and limit, fallback to page 1, limit 10
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page')) || 1;
  const limit = parseInt(urlParams.get('limit')) || 10;

  try {
    const response = await fetch(`/services/dashboard?ajax=true&page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error("Failed to fetch request data");
    }

    const data = await response.json();
    const requests = data.getRequestList;
    console.log(data);

    requestTableBody.innerHTML = '';

    if (requests.length === 0) {
      requestTableBody.innerHTML = '<tr><td colspan="4">No Requests.</td></tr>';
    } else {
      requests.forEach(request => {
        const row = document.createElement('tr');
        const formattedDate = new Date(request.dateadded).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        row.innerHTML = `
                <td>${request.fname} ${request.mname ? request.mname : ''} ${request.lname}</td>
                <td>${request.purpose}</td>
                <td>${formattedDate}</td>
                <td><button 
                data-purpose="${request.purpose}"
                data-age="${request.age}"
                data-birthdate="${request.birthdate}"
                data-birthplace="${request.birthplace}"
                data-firstName="${request.fname}"
                data-lastName="${request.lname}"
                data-middleName="${request.mname ? request.mname : ''}"
                data-purok="${request.purok}"
                data-street="${request.street}"
                data-barangay="${request.barangay}"
                data-city="${request.city}"
                data-province="${request.province}"
                data-civilStatus="${request.civilstatus}"
                data-gender="${request.gender}"
                
                onclick="processCertificate(this)">Process</button></td>
            `;
        requestTableBody.appendChild(row);
      });
    }

    // Update pagination links
    updatePaginationLinks(data.currentPage, data.totalPages);

  } catch (error) {
    console.error("Error fetching request data: ", error);
    requestTableBody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
  }

  // Function to dynamically update pagination links
  function updatePaginationLinks(currentPage, totalPages) {
    const paginationNav = document.getElementById('paginationNav');
    paginationNav.innerHTML = '';

    if (currentPage > 1) {
      paginationNav.innerHTML += `<a href="?page=${currentPage - 1}&limit=${limit}" aria-label="Previous Page">Previous</a>`;
    }

    if (currentPage < totalPages) {
      paginationNav.innerHTML += `<a href="?page=${currentPage + 1}&limit=${limit}" aria-label="Next Page">Next</a>`;
    }
  }
  // attachDotEventListeners();
});


window.processCertificate = function (button) {
  const purpose = button.getAttribute('data-purpose');
  const firstName = button.getAttribute('data-firstName');
  const lastName = button.getAttribute('data-lastName');
  const middleName = button.getAttribute('data-middleName');
  const purok = button.getAttribute('data-purok');
  const street = button.getAttribute('data-street');
  const barangay = button.getAttribute('data-barangay');
  const city = button.getAttribute('data-city');
  const province = button.getAttribute('data-province');
  const civilStatus = button.getAttribute('data-civilStatus');
  const gender = button.getAttribute('data-gender');
  const age = button.getAttribute('data-age');
  const birthdate = button.getAttribute('data-birthdate');
  const birthplace = button.getAttribute('data-birthplace');
  document.querySelector(".overlay").classList.toggle("visible");
  setCurrentDate();

  if (purpose === 'Oath Of Undertaking') {
      document.getElementById("oathFullName").innerHTML = `${firstName} ${middleName} ${lastName}`.toLocaleUpperCase();
      document.getElementById("oathFullName1").innerHTML = `${firstName} ${middleName} ${lastName}`.toLocaleUpperCase();
      document.getElementById("oathAddress").innerText = `${barangay}, ${city}, ${province}`;
      document.getElementById("oathGender").innerHTML = `${gender}`;
      document.getElementById("oathAge").innerHTML = `${age}`;
    viewCertificateDetails("oathUndertaking");
  } else {

    document.querySelector("#process-certificate").classList.toggle("visible");
    document.getElementById("certificateHeading").innerText = purpose;
  
    const viewCertificate = document.getElementById("viewCertificate");
    const certificateMainForm = document.getElementById("certificateMainForm");
    certificateMainForm.innerHTML = "";
  
    if (purpose === 'Brgy. Clearance') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Application Requirement">Application Requirement</option>
                  <option value="Avon Application">Avon Application</option>
                  <option value="Bank Requirement">Bank Requirement</option>
                  <option value="Business Clearance Requirement">Business Clearance Requirement</option>
                  <option value="Cash Assistance Requirement">Cash Assistance Requirement</option>
                  <option value="Driver's License Requirement">Driver's License Requirement</option>
                  <option value="Employment Application Requirement">Employment Application Requirement</option>
                  <option value="Job Application Requirement">Job Application Requirement</option>
                  <option value="Loan Application">Loan Application</option>
                  <option value="Local Employment Requirement">Local Employment Requirement</option>
                  <option value="Local Job Employment Requirement">Local Job Employment Requirement</option>
                  <option value="Motor Load Application Requirement">Motor Load Application Requirement</option>
                  <option value="OWWA">OWWA</option>
                  <option value="Police Application">Police Application</option>
                  <option value="Police Clearance Requirement">Police Clearance Requirement</option>
                  <option value="Police/NBI Clearance">Police/NBI Clearance</option>
                  <option value="Tricycle Franchise Renewal Requirement">Tricycle Franchise Renewal Requirement</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">Remarks</label>
              <input type="text" id="brgyClearanceRemarksInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Opt ID</label>
              <input type="text" id="brgyClearanceOptIDInput">
          </div>
          <div class="inputWithLabel">
              <label for="">CTC Nos</label>
              <input type="text" id="brgyClearanceCTCNosInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Date Issued</label>
              <input type="date" id="brgyClearanceDateIssuedInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="brgyClearanceORNosInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Date Printed</label>
              <input type="date" id="brgyClearanceDatePrintedInput">
          </div>
      `;
  
      document.getElementById("selectPurpose").addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const certificatePurposeInput = document.getElementById("certificatePurpose");
  
        if (selectedValue === "Others") {
          certificatePurposeInput.type = "text";
          certificatePurposeInput.value = "";
          certificatePurposeInput.placeholder = "Enter the purpose";
        } else {
          certificatePurposeInput.type = "hidden";
          certificatePurposeInput.value = selectedValue;
        }
      });
  
  
      document.getElementById("brgyClearanceLastName").innerText = `${lastName}`.toUpperCase();
      document.getElementById("brgyClearanceFirstName").innerText = `${firstName}`.toUpperCase();
      document.getElementById("brgyClearanceMiddleName").innerText = `${middleName}`.toUpperCase();
      document.getElementById("brgyClearanceAddress").innerText = `Purok ${purok}, ${barangay}, ${city}, ${province}`;
      document.getElementById("brgyClearanceAge").innerText = `${age}`;
      document.getElementById("brgyClearanceBirthDate").innerText = new Date(birthdate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      document.getElementById("brgyClearanceCivilStatus").innerText = `${civilStatus}`;
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;
    
          if (selectedPurpose && selectedPurpose !== "default") {
            const brgyClearancePurpose = document.getElementById("brgyClearancePurpose");
    
            document.getElementById("brgyClearanceRemarks").innerText = document.getElementById("brgyClearanceRemarksInput").value.toUpperCase();
            document.getElementById("brgyClearanceOptID").innerText = document.getElementById("brgyClearanceOptIDInput").value;
            document.getElementById("brgyClearanceCTCNos").innerText = document.getElementById("brgyClearanceCTCNosInput").value;
            document.getElementById("brgyClearanceDateIssued").innerText = document.getElementById("brgyClearanceDateIssuedInput").value;
            document.getElementById("brgyClearanceORNos").innerText = document.getElementById("brgyClearanceORNosInput").value;
            document.getElementById("brgyClearanceDatePrinted").innerText = document.getElementById("brgyClearanceDatePrintedInput").value;
    
            if (certificatePurposeInput.type === "text") {
              brgyClearancePurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              brgyClearancePurpose.innerText = selectedPurpose.toUpperCase();
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });
  
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("brgyClearance"));
    }
    else if (purpose === 'Building Clearance') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Electric Connection">Electric Connection</option>
                  <option value="Water Connection">Water Connection</option>
              </select>
          </div>
          <div class="inputWithLabel">
              <label for="">Location (Ex. Barangay Maypangdan Borongan City)</label>
              <input type="text" id="buildingClearanceLocationInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos.</label>
              <input type="text" id="buildingClearanceORNosInput">
          </div>
      `;
  
  
      document.getElementById("buildingClearanceFullName").innerText =
        `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("buildingClearanceAddress").innerText = `Purok ${purok}, Barangay ${barangay}, ${city}, Province of ${province}`;
      document.getElementById("buildingClearanceStatus").innerHTML = `${civilStatus}`;
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          const certificatePurposeInput = document.getElementById("selectPurpose");
          const selectedPurpose = certificatePurposeInput.value.trim();

          
          if (selectedPurpose && selectedPurpose !== "default") {
            const buildingCLearancePurpose = document.getElementById("buildingClearancePurpose");
            const buildingCLearancePurpose1 = document.getElementById("buildingClearancePurpose1");
            document.getElementById("buildingClearanceLocation").innerText = document.getElementById("buildingClearanceLocationInput").value;
            document.getElementById("buildingClearanceORNos").innerText = document.getElementById("buildingClearanceORNosInput").value;
              buildingCLearancePurpose.innerText = selectedPurpose;
              buildingCLearancePurpose1.innerText = selectedPurpose;
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose");
          }
        }
      });
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("buildingClearance"));
    }
    else if (purpose === 'Burial Certificate') {
      certificateMainForm.innerHTML = `
          <h3>Deceased Info</h4>
          <div style="display:flex; flex-wrap:wrap; gap:12px">
            <div class="inputWithLabel" style="flex:1">
                <label for="">First Name</label>
                <input type="text" id="burialFirstNameInput">
            </div>
            <div class="inputWithLabel" style="flex:1">
                <label for="">Last Name</label>
                <input type="text" id="burialLastNameInput">
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:12px">
            <div class="inputWithLabel" style="flex:1">
                <label for="">Middle Name</label>
                <input type="text" id="burialMiddleNameInput">
            </div>
            <div class="inputWithLabel" style="flex:1">
                <label for="certificatePurpose">Gender</label>
                <select class="certficate-purpose-dropdown" id="burialGenderInput">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
          </div>
          <div class="inputWithLabel">
              <label for="certificatePurpose">Civil Status</label>
              <select class="certficate-purpose-dropdown" id="burialStatusInput">
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widow">Widow</option>
                  <option value="Widower">Widower</option>
              </select>
          </div>
          <div class="inputWithLabel">
              <label for="">Address (Ex. Purok Seguidila, Barangay Maypangdan, Borongan City, Eastern Samar)</label>
              <input type="text" id="burialAddressInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Duration of the Wake</label>
              <input type="number" id="burialLamayDaysInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Location of the Wake (Ex. his/her Residence)</label>
              <input type="text" id="burialLamayLocationInput">
          </div>
          <div class="inputWithLabel">
          <label for="">Start of the Wake took place</label>
          <input type="date" id="burialLamayStartInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Burial Place</label>
              <input type="text" id="burialPlaceInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Burial Date</label>
              <input type="date" id="burialDateInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="burialORNosInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Validation Days (Ex. 90 days)</label>
              <input type="text" id="burialValidationInput">
          </div>
      `;

  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){  
          const startDateInput = document.getElementById("burialLamayStartInput").value;
          const durationInput = parseInt(document.getElementById("burialLamayDaysInput").value, 10);
          const burialFirstName = document.getElementById("burialFirstNameInput").value;
          const burialLastName = document.getElementById("burialLastNameInput").value;
          const burialMiddleName = document.getElementById("burialMiddleNameInput").value;
          const wakeDetails = displayWakeMessage(startDateInput, durationInput);
          const burialFormattedDate = new Date(document.getElementById("burialDateInput").value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          document.getElementById("burialLamayDays").innerText = wakeDetails.duration;
          document.getElementById("burialLamayDate").innerText = wakeDetails.wakeDate;
          document.getElementById("burialFullName").innerText = `${burialLastName || "(LASTNAME)"}, ${burialFirstName || "(FIRSTNAME)"} ${burialMiddleName || "(MIDDLENAME)"}`.toUpperCase();
          document.getElementById("burialGender").innerText = document.getElementById("burialGenderInput").value || "(GENDER)";
          document.getElementById("burialStatus").innerText = document.getElementById("burialStatusInput").value || "(STATUS)";
          document.getElementById("burialAddress").innerText = document.getElementById("burialAddressInput").value || "(ADDRESS)";
          document.getElementById("burialLamayLocation").innerText = document.getElementById("burialLamayLocationInput").value || "(WAKE LOCATION)";
          document.getElementById("burialPlace").innerText = document.getElementById("burialPlaceInput").value || "(BURIAL PLACE)";
          document.getElementById("burialDate").innerText = burialFormattedDate || "(BURIAL DATE)";
          document.getElementById("burialORNos").innerText = document.getElementById("burialORNosInput").value;
          document.getElementById("burialValication").innerText = document.getElementById("burialValidationInput").value;

          if (document.getElementById("burialGenderInput").value === "Male"){
            document.getElementById("burialCourtesyTitle").innerText = `Mr. ${burialLastName}`;
          } else {
            document.getElementById("burialCourtesyTitle").innerText = `Ms. ${burialLastName}`;
          }
            alert("Changes applied");
        }
      });
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("burailClearance"));
    }
    else if (purpose === 'Business Clearance') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="">Business Name or Trade Activity</label>
              <input type="text" id="businessClearanceBusinessNameInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Location of Business (Ex. Brgy. Maypangdan Borongan City)</label>
              <input type="text" id="businessClearanceBusinessLocationInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Operator/Manager</label>
              <input type="text" id="businessClearanceBusinessOwnerInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Owner's Address (Ex. Brgy. Maypangdan, Borongan City, Eastern Samar)</label>
              <input type="text" id="businessClearanceBusinessOwnerAddressInput">
          </div>
          <div class="inputWithLabel">
              <label for="certificatePurpose">New/Renew</label>
              <select class="certficate-purpose-dropdown" id="businessClearanceStatusInput">
                  <option value="New">New</option>
                  <option value="Renew">Renew</option>
              </select>
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="businessClearanceORNosInput">
          </div>
      `;

      document.getElementById("businessClearanceDateIssued").innerText = getCurrentDate();
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){  
          const status = document.getElementById("businessClearanceStatusInput");
          const selectedStatus = status.value.toUpperCase();
            document.getElementById("businessClearanceBusinessName").innerText = document.getElementById("businessClearanceBusinessNameInput").value.toUpperCase();
            document.getElementById("businessClearanceBusinessLocation").innerText = document.getElementById("businessClearanceBusinessLocationInput").value.toUpperCase();
            document.getElementById("busnessClearanceOperator").innerText = document.getElementById("businessClearanceBusinessOwnerInput").value.toUpperCase();
            document.getElementById("businessClearanceOwnersAddress").innerText = document.getElementById("businessClearanceBusinessOwnerAddressInput").value.toUpperCase();
            document.getElementById("businessClearanceStatus").innerText = selectedStatus;
            document.getElementById("businessClearanceORNos").innerText = document.getElementById("businessClearanceORNosInput").value;
    
            alert("Changes applied");
        }
      });
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("businessClearance"));
    }
    else if (purpose === 'Business Closure') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Business Closure Requirement">Business Closure Requirement</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">Business Name or Trade Activityi</label>
              <input type="text" id="businessClosureBusinessNameInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Location of Business (Ex. Purok Talbos, Barangay Maypangdan Borongan City)</label>
              <input type="text" id="businessClosureBusinessLocationInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Owned or Manged By</label>
              <input type="text" id="businessClosureBusinessOwnerInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Owner's Address (Ex. Brgy. Maypangdan, Borongan City, Eastern Samar)</label>
              <input type="text" id="businessClosureBusinessOwnerAddressInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Closed Since</label>
              <input type="text" id="businessClosureClosedSinceInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Closed Until</label>
              <input type="text" id="businessClosureClosedUntilInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="businessClosureORNosInput">
          </div>
      `;
  
      document.getElementById("selectPurpose").addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const certificatePurposeInput = document.getElementById("certificatePurpose");
  
        if (selectedValue === "Others") {
          certificatePurposeInput.type = "text";
          certificatePurposeInput.value = "";
          certificatePurposeInput.placeholder = "Enter the purpose";
        } else {
          certificatePurposeInput.type = "hidden";
          certificatePurposeInput.value = selectedValue;
        }
      });
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;
    
          if (selectedPurpose && selectedPurpose !== "default") {
            const businessClosurePurpose = document.getElementById("businessClosurePurpose");
    
            document.getElementById("businessClosureBusinessName").innerText = document.getElementById("businessClosureBusinessNameInput").value.toUpperCase();
            document.getElementById("businessClosureBusinessLocation").innerText = document.getElementById("businessClosureBusinessLocationInput").value;
            document.getElementById("businessClosureOwnersName").innerText = document.getElementById("businessClosureBusinessOwnerInput").value.toUpperCase();
            document.getElementById("businessClosureOwnersAddress").innerText = document.getElementById("businessClosureBusinessOwnerAddressInput").value;
            document.getElementById("businessClosureClosedSince").innerText = document.getElementById("businessClosureClosedSinceInput").value;
            document.getElementById("businessClosureClosedUntil").innerText = document.getElementById("businessClosureClosedUntilInput").value;
            document.getElementById("businessClosureORNos").innerText = document.getElementById("businessClosureORNosInput").value;
    
            if (certificatePurposeInput.type === "text") {
              businessClosurePurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              businessClosurePurpose.innerText = selectedPurpose.toUpperCase();
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });
  
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("businessClosure"));
    }
    else if (purpose === 'Good Moral') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Board Exam Requirements">Board Exam Requirements</option>
                  <option value="Whatever legal purpose">Whatever legal purpose</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="goodMoralORNosInput">
          </div>
      `;
  
      document.getElementById("selectPurpose").addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const certificatePurposeInput = document.getElementById("certificatePurpose");
  
        if (selectedValue === "Others") {
          certificatePurposeInput.type = "text";
          certificatePurposeInput.value = "";
          certificatePurposeInput.placeholder = "Enter the purpose";
        } else {
          certificatePurposeInput.type = "hidden";
          certificatePurposeInput.value = selectedValue;
        }
      });
  
  
      document.getElementById("goodMoralFullName").innerText = `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("goodMoralAddress").innerText = `Purok ${purok}, ${barangay}, ${city}, ${province}`;
      document.getElementById("goodMoralAge").innerText = `${age}`;
      document.getElementById("goodMoralGender").innerText = `${gender}`;
      document.getElementById("goodMoralStatus").innerText = `${civilStatus}`;
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;
    
          if (selectedPurpose && selectedPurpose !== "default") {
            const goodMoralPurpose = document.getElementById("goodMoralPurpose");
    
            // document.getElementById("goodMoralORNos").innerText = document.getElementById("goodMoralORNosInput").value;
    
            if (certificatePurposeInput.type === "text") {
              document.getElementById("goodMoralIfASelectedPurpose").style.display = "block";
              goodMoralPurpose.innerHTML = `<strong>${selectedPurpose}</strong>`.toUpperCase() + "purposes";
            } else {
              if (selectedPurpose === "Whatever legal purpose"){
                document.getElementById("goodMoralIfASelectedPurpose").style.display = "none";
                goodMoralPurpose.innerText = selectedPurpose.toLowerCase();
              } else{
                document.getElementById("goodMoralIfASelectedPurpose").style.display = "block";
                goodMoralPurpose.innerHTML = `<strong>${selectedPurpose}</strong>`.toUpperCase() + " purposes";
              }
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });
  
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("goodMoral"));
    }
    else if (purpose === 'Guardianship') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Medical Assistance Requirement">Medical Assistance Requirement</option>
                  <option value="PSA Application Requirement">PSA Application Requirement</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">Name of the Child</label>
              <input type="text" id="guardianshipChildNameInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Age of the Child</label>
              <input type="number" id="guardianshipChildAgeInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Relationship with the Child</label>
              <input type="text" id="guardianshipChildRelationshipInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="guardianshipORNosInput">
          </div>
      `;
  
      document.getElementById("selectPurpose").addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const certificatePurposeInput = document.getElementById("certificatePurpose");
  
        if (selectedValue === "Others") {
          certificatePurposeInput.type = "text";
          certificatePurposeInput.value = "";
          certificatePurposeInput.placeholder = "Enter the purpose";
        } else {
          certificatePurposeInput.type = "hidden";
          certificatePurposeInput.value = selectedValue;
        }
      });
  
      document.getElementById("guardianshipFullName").innerText =`${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("guardianshipAddress").innerText = `Purok ${purok}, ${barangay}, ${city}, ${province}`;
      document.getElementById("guardianshipGender").innerText = `${gender}`;
      document.getElementById("guardianshipStatus").innerText = `${civilStatus}`;
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;
    
          if (selectedPurpose && selectedPurpose !== "default") {
            const guardianshipPurpose = document.getElementById("guardianshipPurpose");
    
            document.getElementById("guardianshipChildName").innerText = document.getElementById("guardianshipChildNameInput").value.toUpperCase();
            document.getElementById("guardianshipChildAge").innerText = document.getElementById("guardianshipChildAgeInput").value;
            document.getElementById("guardianshipRelationship").innerText = document.getElementById("guardianshipChildRelationshipInput").value.toUpperCase();
            document.getElementById("guardianshipORNos").innerText = document.getElementById("guardianshipORNosInput").value;
    
            if (certificatePurposeInput.type === "text") {
              guardianshipPurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              guardianshipPurpose.innerText = selectedPurpose.toUpperCase();
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });
  
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("guardianship"));
    }
    else if (purpose === 'Income') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Motor Load Requirement">Motor Load Requirement</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">Trabaho</label>
              <input type="text" id="incomeTrabahoInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Monthly Income (Ex. Php. 15,000.00)</label>
              <input type="text" id="incomeMonthlyInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="incomeORNosInput">
          </div>
      `;
  
      document.getElementById("selectPurpose").addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const certificatePurposeInput = document.getElementById("certificatePurpose");
  
        if (selectedValue === "Others") {
          certificatePurposeInput.type = "text";
          certificatePurposeInput.value = "";
          certificatePurposeInput.placeholder = "Enter the purpose";
        } else {
          certificatePurposeInput.type = "hidden";
          certificatePurposeInput.value = selectedValue;
        }
      });
  
  
      document.getElementById("brgyClearanceAddress").innerText = `Purok ${purok}, ${barangay}, ${city}, ${province}`;
      document.getElementById("brgyClearanceAge").innerText = `${age}`;
      document.getElementById("brgyClearanceCivilStatus").innerText = `${civilStatus}`;
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;
    
          if (selectedPurpose && selectedPurpose !== "default") {
            // const brgyClearancePurpose = document.getElementById("brgyClearancePurpose");
    
            // document.getElementById("brgyClearanceRemarks").innerText = document.getElementById("brgyClearanceRemarksInput").value.toUpperCase();
            // document.getElementById("brgyClearanceOptID").innerText = document.getElementById("brgyClearanceOptIDInput").value;
            // document.getElementById("brgyClearanceCTCNos").innerText = document.getElementById("brgyClearanceCTCNosInput").value;
            // document.getElementById("brgyClearanceDateIssued").innerText = document.getElementById("brgyClearanceDateIssuedInput").value;
            // document.getElementById("brgyClearanceORNos").innerText = document.getElementById("brgyClearanceORNosInput").value;
            // document.getElementById("brgyClearanceDatePrinted").innerText = document.getElementById("brgyClearanceDatePrintedInput").value;
    
            if (certificatePurposeInput.type === "text") {
              // brgyClearancePurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              // brgyClearancePurpose.innerText = selectedPurpose.toUpperCase();
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });
  
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("income"));
    }
    else if (purpose === 'Indigency') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Scholarship Assistance">Scholarship Assistance</option>
                  <option value="PhilHealth Enrollment">PhilHealth Enrollment</option>
                  <option value="Medical Assistance">Medical Assistance</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
      `;
  
      document.getElementById("selectPurpose").addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const certificatePurposeInput = document.getElementById("certificatePurpose");
  
        if (selectedValue === "Others") {
          certificatePurposeInput.type = "text";
          certificatePurposeInput.value = "";
          certificatePurposeInput.placeholder = "Enter the purpose";
        } else {
          certificatePurposeInput.type = "hidden";
          certificatePurposeInput.value = selectedValue;
        }
      });
  
  
      document.getElementById("indigencyFullName").innerText =
        `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("indigencyAddress").innerText = `Purok ${purok}, ${barangay}, ${city}, ${province}`;
      document.getElementById("indigencyGender").innerHTML = `<u>${gender}</u>`;
      document.getElementById("indigencyCivilStatus").innerHTML = `<u>${civilStatus}</u>`;
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;
    
          if (selectedPurpose && selectedPurpose !== "default") {
            const indigencyPurpose = document.getElementById("indigencyPurpose");
    
            if (certificatePurposeInput.type === "text") {
              indigencyPurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              switch (selectedPurpose) {
                case "Scholarship Assistance":
                  indigencyPurpose.innerText = "SCHOLARSHIP ASSISTANCE REQUIREMENT ONLY";
                  break;
                case "PhilHealth Enrollment":
                  indigencyPurpose.innerText = "PHILHEALTH ENROLLMENT REQUIREMENT";
                  break;
                case "Medical Assistance":
                  indigencyPurpose.innerText = "MEDICAL ASSISTANCE";
                  break;
              }
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });
      viewCertificate.addEventListener('click', ()=> viewCertificateDetails("indigency"));
    }
    else if (purpose === 'Land no claim') {
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("landNoClaim"));
    }
    else if (purpose === 'Late Registration') {
      certificateMainForm.innerHTML = `
      <div class="inputWithLabel">
          <label for="">Father's Name</label>
          <input type="text" id="lateRegistrationFatherInput">
      </div>
      <div class="inputWithLabel">
          <label for="">Mother's Name</label>
          <input type="text" id="lateRegistrationMotherInput">
      </div>
      <div class="inputWithLabel">
          <label for="">Type Han Pag Anak</label>
          <input type="text" id="lateRegistrationPagAnakInput">
      </div>
      <div class="inputWithLabel">
          <label for="">Name Han Nag Anak (Optional)</label>
          <input type="text" id="lateRegistrationNagAnakInput">
      </div>
      <div class="inputWithLabel">
          <label for="">OR Nos</label>
          <input type="number" id="lateRegistrationORNumberInput">
      </div>
      <div class="inputWithLabel">
          <label for="">Validation Days (Ex. 90 Days)</label>
          <input type=" text" id="lateRegistrationValidationInput">
      </div>
  `;

  document.getElementById("lateRegistrationFullName").innerText =`${firstName} ${middleName} ${lastName}`.toUpperCase();
  document.getElementById("lateRegistrationFullName1").innerText =`${firstName} ${middleName} ${lastName}`.toUpperCase();
  document.getElementById("lateRegistrationFirstName").innerText =`${firstName}`;
  document.getElementById("lateRegistrationAddress").innerText = `${barangay}, ${city}, ${province}`;
  document.getElementById("lateRegistrationGender").innerHTML = `${gender}`;
  document.getElementById("lateRegistrationBirthPlace").innerHTML = `${birthplace}`;
  document.getElementById("lateRegistrationBirthDate").innerHTML = new Date(birthdate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('applyChanges')) {
      document.getElementById("lateRegistrationFather").innerText = document.getElementById("lateRegistrationFatherInput").value;
      document.getElementById("lateRegistrationMother").innerText = document.getElementById("lateRegistrationMotherInput").value;
      document.getElementById("lateRegistrationPagAnak").innerText = document.getElementById("lateRegistrationPagAnakInput").value;
      document.getElementById("lateRegistrationNameNagAnak").innerText = document.getElementById("lateRegistrationNagAnakInput").value;
      document.getElementById("lateRegistrationORNumber").innerText = document.getElementById("lateRegistrationORNumberInput").value;
      document.getElementById("lateRegistrationValiddation").innerText = document.getElementById("lateRegistrationValidationInput").value;
      alert("Changes applied");
    }
  });
  

  viewCertificate.addEventListener('click', () => viewCertificateDetails("lateRegistration"));
    }
    else if (purpose === 'No Duplication') {
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("noDuplication"));
    }
    else if (purpose === 'Panumduman') {
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("panumduman"));
    }
    else if (purpose === 'RA 11261') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="NBI Clearance Application Requirement">NBI Clearance Application Requirement</option>
                  <option value="PhilHealth Application Requirement">PhilHealth Application Requirement</option>
                  <option value="Police/NBI Application Requirement">Police/NBI Application Requirement</option>
                  <option value="PSA Application Requirement">PSA Application Requirement</option>
                  <option value="TIN ID Application Requirement">TIN ID Application Requirement</option>
                  <option value="TOR Application Requirement">TOR Application Requirement</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
      `;
  
      document.getElementById("selectPurpose").addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const certificatePurposeInput = document.getElementById("certificatePurpose");
  
        if (selectedValue === "Others") {
          certificatePurposeInput.type = "text";
          certificatePurposeInput.value = "";
          certificatePurposeInput.placeholder = "Enter the purpose";
        } else {
          certificatePurposeInput.type = "hidden";
          certificatePurposeInput.value = selectedValue;
        }
      });
  
  
      document.getElementById("RAFullName").innerText =
        `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("RAAddress").innerText = `Purok ${purok}, ${barangay}, ${city}, ${province}`;
      document.getElementById("RAGender").innerHTML = `<u>${gender}</u>`;
      document.getElementById("RACivilStatus").innerHTML = `<u>${civilStatus}</u>`;
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;
    
          if (selectedPurpose && selectedPurpose !== "default") {
            const RAPurpose = document.getElementById("RAPurpose");
    
            if (certificatePurposeInput.type === "text") {
              RAPurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              RAPurpose.innerText = selectedPurpose.toUpperCase();
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });
  
      viewCertificate.addEventListener('click', ()=> viewCertificateDetails("RA11261"));
    }
    else if (purpose === 'Residency') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="">Resident Since</label>
              <input type="text" id="residencyResidentSinceInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Resident Until</label>
              <input type="text" id="residencyResidentUntilInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="number" id="residencyORNumberInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Validation Days</label>
              <input type="number" id="residencyValidationInput">
          </div>
      `;
  
  
      document.getElementById("residencyFullName").innerText =
        `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("residencyStreet").innerHTML = street;
      document.getElementById("residencyPurok").innerHTML = purok;
      document.getElementById("residencyBarangay").innerHTML = barangay;
      document.getElementById("residencyMunicipality").innerHTML = city;
      document.getElementById("residencyProvince").innerHTML = province;
  
  
      document.addEventListener('click', function (event) {
        if(event.target.classList.contains("applyChanges")){
          document.getElementById("residencySince").innerText = document.getElementById("residencyResidentSinceInput").value.toUpperCase();
          document.getElementById("residencyUntil").innerText = document.getElementById("residencyResidentUntilInput").value.toUpperCase();
          alert("Changes applied");
        }
      });
  
      viewCertificate.addEventListener('click', () => viewCertificateDetails("residency"));
    }
    else if (purpose === 'Same Person') {
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("samePerson"));
    }
    else if (purpose === 'Singleness') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="">Community Tax Certificate Number</label>
              <input type="number" id="singlenessCertificateNumberInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="number" id="singlenessORNumberInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Amount Paid</label>
              <input type="number" id="singlenessAmountPaidInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Validation Days</label>
              <input type="number" id="singlenessValidationInput">
          </div>
      `;
  
      document.getElementById("singlenessFullName").innerText =`${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("singlenessAddress").innerText = `Purok ${purok}, ${barangay}, ${city}, ${province}`;
      document.getElementById("singlenessGender").innerHTML = `<u>${gender}</u>`;
      document.getElementById("singlenessAge").innerHTML = `<u>${age}</u>`;
  
      document.addEventListener('click', function (event) {
        if (event.target.classList.contains('applyChanges')) {
          document.getElementById("singlessCertificateNumber").innerText = document.getElementById("singlenessCertificateNumberInput").value;
          document.getElementById("singlenessORNumber").innerText = document.getElementById("singlenessORNumberInput").value;
          document.getElementById("singlenessAmountPaid").innerText = `P ${document.getElementById("singlenessAmountPaidInput").value}`;
          document.getElementById("singlenessValidationDays").innerText = document.getElementById("singlenessValidationInput").value;
          alert("Changes applied");
        }
      });
      
  
      viewCertificate.addEventListener('click', () => viewCertificateDetails("singleness"));
    }
    else if (purpose === 'Solo Parent') {
      viewCertificate.addEventListener('click',()=> viewCertificateDetails("soloParent"));
    }
  }
  function viewCertificateDetails(selectedCertificate) {
    document.getElementById("certificate").classList.add("visible");
  
    const hiddenContainers = document.querySelectorAll("#residency, #indigency, #RA11261, #brgyClearance, #singleness, #guardianship, #income, #landNoClaim, #noDuplication, #panumduman, #buildingClearance, #burailClearance, #businessClearance, businessClosure, #lateRegistration, #soloParent, #oathUndertaking, #goodMoral, #samePerson");
    hiddenContainers.forEach(container => container.classList.remove("visible"));
  
    document.getElementById(selectedCertificate).classList.add("visible");
  
    document.querySelector(".closeCertificate").addEventListener("click", function () {
      if(selectedCertificate === "oathUndertaking"){
        document.querySelector(".overlay").classList.remove("visible");
      } else {
        document.querySelector(".overlay").classList.add("visible");
      }
      document.getElementById("certificate").classList.remove("visible");
      document.getElementById(selectedCertificate).classList.remove("visible");
    });
  }
};

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return day + "th";
  switch (day % 10) {
    case 1: return day + "st";
    case 2: return day + "nd";
    case 3: return day + "rd";
    default: return day + "th";
  }
}

function setCurrentDate() {
  const today = new Date();

  const day = getOrdinalSuffix(today.getDate());
  const month = today.toLocaleString("default", { month: "long" }).toUpperCase();
  const year = today.getFullYear();

  document.querySelectorAll("#dateDay").forEach(el => el.innerText = day);
  document.querySelectorAll("#dateMonth").forEach(el => el.innerText = month);
  document.querySelectorAll("#dateYear").forEach(el => el.innerText = year);
}

const padZero = (num) => (num < 10 ? `0${num}` : num);

const getCurrentDate = () => {
    const today = new Date();
    const month = padZero(today.getMonth() + 1);
    const day = padZero(today.getDate());
    const year = today.getFullYear();

    return `${month}/${day}/${year}`;
};

function calculateEndDate(startDateInput, durationInput) {
  if (!startDateInput || isNaN(durationInput) || durationInput <= 0) {
      return null;
  }

  const [year, month, day] = startDateInput.split('-');
  
  const startDate = new Date(year, month - 1, day);
  startDate.setHours(0, 0, 0, 0); 

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + durationInput - 1);

  return {
      startDate: formatDateWithoutYear(startDate),
      endDate: formatDate(endDate),
      duration: numberToText(durationInput) 
  };
}


function formatDateWithoutYear(date) {
  const options = { month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Helper function to format date as "Month Day, Year"
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function numberToText(num) {
  const words = [
      "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
      "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
      "twenty", "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five", "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine",
      "thirty", "thirty-one", "thirty-two", "thirty-three", "thirty-four", "thirty-five", "thirty-six", "thirty-seven", "thirty-eight", "thirty-nine",
      "forty", "forty-one", "forty-two", "forty-three", "forty-four", "forty-five", "forty-six", "forty-seven", "forty-eight", "forty-nine", "fifty"
  ];
  return words[num] || num;
}

function displayWakeMessage(startDateInput, durationInput) {
  const wakeDetails = calculateEndDate(startDateInput, durationInput);

  if (wakeDetails) {
      return {
        duration: `${wakeDetails.duration} (${durationInput})`,
        wakeDate: `${wakeDetails.startDate} to ${wakeDetails.endDate}`,
      };
  } else {
    return {
      duration: "(WAKE DURATION)",
      wakeDate: "(WAKE DATE)",
    };
  }
}


