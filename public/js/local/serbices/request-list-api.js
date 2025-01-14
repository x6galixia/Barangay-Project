
document.addEventListener("DOMContentLoaded", async function () {
  const requestTableBody = document.getElementById('requestTableBody');

  // Get URL parameters for page and limit, fallback to page 1, limit 10
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page')) || 1;
  const limit = parseInt(urlParams.get('limit')) || 10;

  try {
    const response = await fetch(`/services/dashboard?ajax=true&page=${page}&limit=${limit}`
      , {
        method: 'GET', // Specify GET method (default is GET, but can be added explicitly)
        headers: {
          'Content-Type': 'application/json',  // Ensure content is treated as JSON
          'Accept': 'application/json',        // Expect JSON response
        },
      }
    );
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
                <td class="menu-row">
                    <img class="dot" src="../icon/triple-dot.svg" alt="">
                    <div class="triple-dot">
                        <div class="menu" data-id="${request.residentsid}">
                            <button 
                                  data-purpose="${request.purpose}"
                                  data-punongBarangay="${request.punongbarangayfirstname.toLocaleUpperCase()} ${request.punongbarangaymiddlename.toLocaleUpperCase() ? request.punongbarangaymiddlename.toLocaleUpperCase() : ''} ${request.punongbarangaylastname.toLocaleUpperCase()}"
                                  data-skchairperson="${request.skchairpersonfirstname.toLocaleUpperCase()} ${request.skchairpersonmiddlename.toLocaleUpperCase() ? request.skchairpersonmiddlename.toLocaleUpperCase() : ''} ${request.skchairpersonlastname.toLocaleUpperCase()}"
                                  data-secretary="${request.barangaysecretaryfirstname.toLocaleUpperCase()} ${request.barangaysecretarymiddlename.toLocaleUpperCase() ? request.barangaysecretarymiddlename.toLocaleUpperCase() : ''} ${request.barangaysecretarylastname.toLocaleUpperCase()}"
                                  data-treasurer="${request.barangaytreasurerfirstname.toLocaleUpperCase()} ${request.barangaytreasurermiddlename.toLocaleUpperCase() ? request.barangaytreasurermiddlename.toLocaleUpperCase() : ''} ${request.barangaytreasurerlastname.toLocaleUpperCase()}"
                                  data-kagawad1="${request.kagawad1firstname.toLocaleUpperCase()} ${request.kagawad1middlename.toLocaleUpperCase() ? request.kagawad1middlename.toLocaleUpperCase() : ''} ${request.kagawad1lastname.toLocaleUpperCase()}"
                                  data-kagawad2="${request.kagawad2firstname.toLocaleUpperCase()} ${request.kagawad2middlename.toLocaleUpperCase() ? request.kagawad2middlename.toLocaleUpperCase() : ''} ${request.kagawad2lastname.toLocaleUpperCase()}"
                                  data-kagawad3="${request.kagawad3firstname.toLocaleUpperCase()} ${request.kagawad3middlename.toLocaleUpperCase() ? request.kagawad3middlename.toLocaleUpperCase() : ''} ${request.kagawad3lastname.toLocaleUpperCase()}"
                                  data-kagawad4="${request.kagawad4firstname.toLocaleUpperCase()} ${request.kagawad4middlename.toLocaleUpperCase() ? request.kagawad4middlename.toLocaleUpperCase() : ''} ${request.kagawad4lastname.toLocaleUpperCase()}"
                                  data-kagawad5="${request.kagawad5firstname.toLocaleUpperCase()} ${request.kagawad5middlename.toLocaleUpperCase() ? request.kagawad5middlename.toLocaleUpperCase() : ''} ${request.kagawad5lastname.toLocaleUpperCase()}"
                                  data-kagawad6="${request.kagawad6firstname.toLocaleUpperCase()} ${request.kagawad6middlename.toLocaleUpperCase() ? request.kagawad6middlename.toLocaleUpperCase() : ''} ${request.kagawad6lastname.toLocaleUpperCase()}"
                                  data-kagawad7="${request.kagawad7firstname.toLocaleUpperCase()} ${request.kagawad7middlename.toLocaleUpperCase() ? request.kagawad7middlename.toLocaleUpperCase() : ''} ${request.kagawad7lastname.toLocaleUpperCase()}"
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
                                  onclick="processCertificate(this)">Process</button>
                                  <button id="update-id" onclick="">Mark as done</button>
                            <button id="update-id" onclick="removeRequest(this)">Remove</button>
                        </div>
                    </div>
                </td>
            `;
        requestTableBody.appendChild(row);
      });
    }
    attachDotEventListeners();
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

function attachDotEventListeners() {
  document.querySelectorAll(".dot").forEach(function (dot) {
    dot.addEventListener("click", function () {
      console.log("dot clicked");
      const tripleDotContainer = dot.closest("td").querySelector(".triple-dot");
      tripleDotContainer.classList.add("visible");
    });

    document.addEventListener("click", function (event) {
      if (!dot.contains(event.target)) {
        const tripleDotContainer = dot.closest("td").querySelector(".triple-dot");
        if (tripleDotContainer && tripleDotContainer.classList.contains("visible")) {
          tripleDotContainer.classList.remove("visible");
        }
      }
    });
  });

}

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
  const punongBarangay = button.getAttribute('data-punongBarangay');
  const skchairperson = button.getAttribute('data-skchairperson');
  const brgySecretary = button.getAttribute('data-secretary');
  const brgyTreasurer = button.getAttribute('data-treasurer');
  const kagawad1 = button.getAttribute('data-kagawad1');
  const kagawad2 = button.getAttribute('data-kagawad2');
  const kagawad3 = button.getAttribute('data-kagawad3');
  const kagawad4 = button.getAttribute('data-kagawad4');
  const kagawad5 = button.getAttribute('data-kagawad5');
  const kagawad6 = button.getAttribute('data-kagawad6');
  const kagawad7 = button.getAttribute('data-kagawad7');

  //  BARANGAY OFFICIALS
  document.querySelectorAll('.punongBarangay').forEach(element => {
    element.innerText = `HON. ${punongBarangay}`;
  });
  document.querySelectorAll('.SKChairPerson').forEach(element => {
    element.innerText = `HON. ${skchairperson}`;
  });
  document.querySelectorAll('.brgySecretary').forEach(element => {
    element.innerText = `${brgySecretary}`;
  });
  document.querySelectorAll('.brgyTreasurer').forEach(element => {
    element.innerText = `${brgyTreasurer}`;
  });
  for (let i = 1; i <= 7; i++) {
    const kagawad = button.getAttribute(`data-kagawad${i}`);
    document.querySelectorAll(`.kagawad${i}`).forEach(element => {
      element.innerText = `HON. ${kagawad}`;
    });
  }



  if (purpose === 'Oath Of Undertaking') {
    document.getElementById("oathFullName").innerHTML = `${firstName} ${middleName} ${lastName}`.toLocaleUpperCase();
    // document.getElementById("oathFullName1").innerHTML = `${firstName} ${middleName} ${lastName}`.toLocaleUpperCase();
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
              <label for="">CTC Issued</label>
              <input type="text" id="brgyClearanceCTCIssuedInput">
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
          <div class="inputWithLabel">
              <label for="">Validation Days (Ex. 90 days)</label>
              <input type="text" id="brgyClearanceValidationInput">
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
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;

          if (selectedPurpose && selectedPurpose !== "default") {
            const brgyClearancePurpose = document.getElementById("brgyClearancePurpose");

            document.getElementById("brgyClearanceRemarks").innerText = document.getElementById("brgyClearanceRemarksInput").value.toUpperCase();
            document.getElementById("brgyClearanceOptID").innerText = document.getElementById("brgyClearanceOptIDInput").value;
            document.getElementById("brgyClearanceCTCNos").innerText = document.getElementById("brgyClearanceCTCNosInput").value;
            document.getElementById("brgyClearanceCTCIssued").innerText = document.getElementById("brgyClearanceCTCIssuedInput").value;
            document.getElementById("brgyClearanceDateIssued").innerText = document.getElementById("brgyClearanceDateIssuedInput").value;
            document.getElementById("brgyClearanceORNos").innerText = document.getElementById("brgyClearanceORNosInput").value;
            document.getElementById("brgyClearanceDatePrinted").innerText = document.getElementById("brgyClearanceDatePrintedInput").value;
            document.getElementById("brgyClearanceValidation").innerText = document.getElementById("brgyClearanceValidationInput").value;

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

      viewCertificate.addEventListener('click', () => {
        viewCertificateDetails("brgyClearance")
      });
    }
    else if (purpose === 'Building Clearance') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Building Construction">Building Construction</option>
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
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("selectPurpose");
          const selectedPurpose = certificatePurposeInput.value.trim();


          if (selectedPurpose && selectedPurpose !== "default") {
            const buildingCLearancePurpose = document.getElementById("buildingClearancePurpose");
            const buildingCLearancePurpose1 = document.getElementById("buildingClearancePurpose1");
            document.getElementById("buildingClearanceLocation").innerText = document.getElementById("buildingClearanceLocationInput").value || "(LOCATION)";
            document.getElementById("buildingClearanceORNos").innerText = document.getElementById("buildingClearanceORNosInput").value;
            buildingCLearancePurpose.innerText = selectedPurpose;
            buildingCLearancePurpose1.innerText = selectedPurpose;
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose");
          }
        }
      });
      viewCertificate.addEventListener('click', () => viewCertificateDetails("buildingClearance"));
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
        if (event.target.classList.contains("applyChanges")) {
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

          if (document.getElementById("burialGenderInput").value === "Male") {
            document.getElementById("burialCourtesyTitle").innerText = `Mr. ${burialLastName}`;
          } else {
            document.getElementById("burialCourtesyTitle").innerText = `Ms. ${burialLastName}`;
          }
          alert("Changes applied");
        }
      });
      viewCertificate.addEventListener('click', () => viewCertificateDetails("burailClearance"));
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
        if (event.target.classList.contains("applyChanges")) {
          const status = document.getElementById("businessClearanceStatusInput");
          const selectedStatus = status.value.toUpperCase();
          document.getElementById("businessClearanceBusinessName").innerText = document.getElementById("businessClearanceBusinessNameInput").value.toUpperCase() || "(BUSINESS NAME)";
          document.getElementById("businessClearanceBusinessLocation").innerText = document.getElementById("businessClearanceBusinessLocationInput").value.toUpperCase() || "(LOCATION OF BUSINESS)";
          document.getElementById("busnessClearanceOperator").innerText = document.getElementById("businessClearanceBusinessOwnerInput").value.toUpperCase() || "(OPERATE/MANAGER)";
          document.getElementById("businessClearanceOwnersAddress").innerText = document.getElementById("businessClearanceBusinessOwnerAddressInput").value.toUpperCase() || "(OWNER'S ADDRESS)";
          document.getElementById("businessClearanceStatus").innerText = selectedStatus;
          document.getElementById("businessClearanceORNos").innerText = document.getElementById("businessClearanceORNosInput").value;

          alert("Changes applied");
        }
      });
      viewCertificate.addEventListener('click', () => viewCertificateDetails("businessClearance"));
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
              <label for="">Business Name or Trade Activity</label>
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
          <div>
            <label style="margin-right: auto">Certfication Details (Optional) <br><i>(Press <strong>ctrl+b</strong> for bold, <strong>ctrl+i</strong> for italic, and <strong>ctrl+u</strong> for underline)</i></label>
          </div>
          <div 
            contenteditable="true"
            style="
              border: 1px solid #000;
              padding: 8px;
              min-height: 80px;
              margin: 5px 0;
              font-family: Arial, sans-serif;
              border-radius: 10px;
              outline: none;
            "
            onkeydown="handleFormatting(event, this)"
            id="businessClossureCertificationDetailsInput"
          ></div>
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
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;

          if (selectedPurpose && selectedPurpose !== "default") {
            const businessClosurePurpose = document.getElementById("businessClosurePurpose");

            document.getElementById("businessClosureBusinessName").innerText = document.getElementById("businessClosureBusinessNameInput").value.toUpperCase() || "(BUSINESS NAME)";
            document.getElementById("businessClosureBusinessLocation").innerText = document.getElementById("businessClosureBusinessLocationInput").value || "(BUSINESS LOCATION)";
            document.getElementById("businessClosureOwnersName").innerText = document.getElementById("businessClosureBusinessOwnerInput").value.toUpperCase() || "(OWNER'S NAME)";
            document.getElementById("businessClosureOwnersAddress").innerText = document.getElementById("businessClosureBusinessOwnerAddressInput").value || "(OWNER'S ADDRESS)";
            document.getElementById("businessClosureClosedSince").innerText = document.getElementById("businessClosureClosedSinceInput").value || "(CLOSED SINCE)";
            document.getElementById("businessClosureClosedUntil").innerText = document.getElementById("businessClosureClosedUntilInput").value || "(CLOSED UNTIL)";
            document.getElementById("businessClossureCertificationDetails").innerHTML = document.getElementById("businessClossureCertificationDetailsInput").innerHTML;
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

      viewCertificate.addEventListener('click', () => viewCertificateDetails("businessClosure"));
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
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;

          if (selectedPurpose && selectedPurpose !== "default") {
            const goodMoralPurpose = document.getElementById("goodMoralPurpose");

            document.getElementById("goodMoralORNos").innerText = document.getElementById("goodMoralORNosInput").value;

            if (certificatePurposeInput.type === "text") {
              document.getElementById("goodMoralIfASelectedPurpose").style.display = "block";
              goodMoralPurpose.innerHTML = `<strong>${selectedPurpose}</strong>`.toUpperCase() + "purposes";
            } else {
              if (selectedPurpose === "Whatever legal purpose") {
                document.getElementById("goodMoralIfASelectedPurpose").style.display = "none";
                goodMoralPurpose.innerText = selectedPurpose.toLowerCase();
              } else {
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

      viewCertificate.addEventListener('click', () => viewCertificateDetails("goodMoral"));
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

      document.getElementById("guardianshipFullName").innerText = `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("guardianshipAddress").innerText = `Purok ${purok}, ${barangay}, ${city}, ${province}`;
      document.getElementById("guardianshipGender").innerText = `${gender}`;
      document.getElementById("guardianshipStatus").innerText = `${civilStatus}`;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;

          if (selectedPurpose && selectedPurpose !== "default") {
            const guardianshipPurpose = document.getElementById("guardianshipPurpose");

            document.getElementById("guardianshipChildName").innerText = document.getElementById("guardianshipChildNameInput").value.toUpperCase() || "(CHILD NAME)";
            document.getElementById("guardianshipChildAge").innerText = document.getElementById("guardianshipChildAgeInput").value || "(CHILD AGE)";
            document.getElementById("guardianshipRelationship").innerText = document.getElementById("guardianshipChildRelationshipInput").value.toUpperCase() || "(RELATIONSHIP)";
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

      viewCertificate.addEventListener('click', () => viewCertificateDetails("guardianship"));
    }
    else if (purpose === 'Income') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Motor Loan Requirement">Motor Loan Requirement</option>
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
        if (event.target.classList.contains("applyChanges")) {
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

      viewCertificate.addEventListener('click', () => viewCertificateDetails("income"));
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
          <div class="inputWithLabel">
              <label for="">Validation Days (Ex. 90 days)</label>
              <input type="text" id="indigencyValidationInput">
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
      document.getElementById("indigencyAddress").innerText = `Purok ${purok}, Barangay ${barangay}, ${city}, Province of ${province}`;
      document.getElementById("indigencyGender").innerHTML = `<u>${gender}</u>`;
      document.getElementById("indigencyCivilStatus").innerHTML = `<u>${civilStatus}</u>`;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;
          document.getElementById("indigencyValidation").innerText = document.getElementById("indigencyValidationInput").value;

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
      viewCertificate.addEventListener('click', () => viewCertificateDetails("indigency"));
    }
    else if (purpose === 'Land no claim') {
      certificateMainForm.innerHTML = `
          <div>
            <label style="margin-right: auto">Certfication Details <i>(Press <strong>ctrl+b</strong> for bold, <strong>ctrl+i</strong> for italic, and <strong>ctrl+u</strong> for underline)</i></label>
          </div>
          <div 
            contenteditable="true"
            style="
              border: 1px solid #000;
              padding: 8px;
              min-height: 80px;
              margin: 5px 0;
              font-family: Arial, sans-serif;
              border-radius: 10px;
              outline: none;
            "
            onkeydown="handleFormatting(event, this)"
            id="landNoClaimCertificationDetailsInput"
          ></div>
          <div class="inputWithLabel">
              <label for="">OR Number</label>
              <input type="number" id="landNoClaimORNosInput">
          </div>
      `;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {

          document.getElementById("landNoClaimCertficationDetails").innerHTML = document.getElementById("landNoClaimCertificationDetailsInput").innerHTML || "-- Certification Details will appear here--";
          document.getElementById("landNoClaimORNos").innerText = document.getElementById("landNoClaimORNosInput").value;
          alert("Changes applied");
        }
      });
      viewCertificate.addEventListener('click', () => viewCertificateDetails("waterDistrict"));
      viewCertificate.addEventListener('click', () => viewCertificateDetails("landNoClaim"));
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
          <label for="">Type of Birth Assistance</label>
          <select class="certficate-purpose-dropdown" id="lateRegistrationPagAnakInput">
              <option value="Doctor">Doctor</option>
              <option value="Midwife">Midwife</option>
              <option value="Traditional Hilot">Traditional Hilot</option>
              <option value="Unassisted">Unassisted</option>
          </select>
      </div>
      <div class="inputWithLabel">
          <label for="">Name of the Birth Attendant (Optional)</label>
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

      document.getElementById("lateRegistrationFullName").innerText = `${firstName} ${middleName} ${lastName}`.toUpperCase();
      document.getElementById("lateRegistrationFullName1").innerText = `${firstName} ${middleName} ${lastName}`.toUpperCase();
      document.getElementById("lateRegistrationFirstName").innerText = `${firstName}`;
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
          document.getElementById("lateRegistrationFather").innerText = document.getElementById("lateRegistrationFatherInput").value || "(FATHER'S NAME)";
          document.getElementById("lateRegistrationMother").innerText = document.getElementById("lateRegistrationMotherInput").value || "(MOTHER'S NAME)";
          document.getElementById("lateRegistrationPagAnak").innerText = document.getElementById("lateRegistrationPagAnakInput").value || "(TYPE OF BIRTH ASSISTANCE)";
          document.getElementById("lateRegistrationNameNagAnak").innerText = document.getElementById("lateRegistrationNagAnakInput").value;
          document.getElementById("lateRegistrationORNumber").innerText = document.getElementById("lateRegistrationORNumberInput").value;
          document.getElementById("lateRegistrationValiddation").innerText = document.getElementById("lateRegistrationValidationInput").value || "(VALIDATION)";
          alert("Changes applied");
        }
      });


      viewCertificate.addEventListener('click', () => viewCertificateDetails("lateRegistration"));
    }
    else if (purpose === 'Panumduman') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="">Complainant</label>
              <input type="text" id="panumdumanComplainantInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Complainant Address (Ex. Barangay Maypangdan, Borongan City, Eastern Samar)</label>
              <input type="text" id="panumdumanComplainantAddressInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Respondent</label>
              <input type="text" id="panumdumanRespondentInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Respondent Address (Ex. Barangay Maypangdan, Borongan City, Eastern Samar)</label>
              <input type="text" id="panumdumanRespondentAddressInput">
          </div>
          <div class="inputWithLabel" id="textAreaContainer">
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:12px">
            <div class="inputWithLabel" style="flex:1">
                <label for="">Witness</label>
                <input type="text" id="panumdumanWitnessInput">
            </div>
            <div class="inputWithLabel" style="flex:1">
                <label for="">Attested By</label>
                <input type="text" id="panumdumanAttestedInput">
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:12px">
            <div class="inputWithLabel" style="flex:1">
                <label for="">Position or Role (Ex. Brgy. Secretary)</label>
                <input type="text" id="panumdumanWitnessPositionInput">
            </div>
            <div class="inputWithLabel" style="flex:1">
                <label for="">Position or Role (Ex. Punong Barangay)</label>
                <input type="text" id="panumdumanAttestedPositionInput">
            </div>
          </div>
      `;
      addTextarea();
      const formattedDate = new Date(getCurrentDate()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      document.getElementById("panumdumanDate").innerText = formattedDate;
      document.getElementById("panumdumanDate1").innerText = formattedDate;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const container = document.getElementById('textAreaContainer');
          const agreementsDiv = document.getElementById('panumdumanAgreements');

          let agreementHTML = '';

          const editableDivs = container.querySelectorAll('[contenteditable="true"]');
          editableDivs.forEach((div, index) => {
            const agreementNumber = index + 1;
            const agreementValue = div.innerHTML.trim();
            if (agreementValue) {
              agreementHTML += `<p>${agreementNumber}. ${agreementValue}</p>`;
            }
          });

          agreementsDiv.innerHTML = agreementHTML; // Render the agreements

          // document.getElementById("burialLamayDate").innerText = wakeDetails.wakeDate;
          document.getElementById("panumdumanComplainant").innerText = `${document.getElementById("panumdumanComplainantInput").value || "(COMPLAINANT)"}`.toUpperCase();
          document.getElementById("panumdumanComplainant1").innerText = `${document.getElementById("panumdumanComplainantInput").value || "(COMPLAINANT)"}`.toUpperCase();
          document.getElementById("panumdumanComplainantAddress").innerText = `${document.getElementById("panumdumanComplainantAddressInput").value || "(COMPLAINANT ADDRESS)"}`;
          document.getElementById("panumdumanRespondent").innerText = `${document.getElementById("panumdumanRespondentInput").value || "(RESPONDENT)"}`.toUpperCase();
          document.getElementById("panumdumanRespondent1").innerText = `${document.getElementById("panumdumanRespondentInput").value || "(RESPONDENT)"}`.toUpperCase();
          document.getElementById("panumdumanRespondentAddress").innerText = `${document.getElementById("panumdumanRespondentAddressInput").value || "(RESPONDENT ADDRESS)"}`;
          document.getElementById("panumdumanWitness").innerText = `${document.getElementById("panumdumanWitnessInput").value || "(WITNESS)"}`.toUpperCase();
          document.getElementById("panumdumanAttested").innerText = `${document.getElementById("panumdumanAttestedInput").value || "(ATTESTED BY)"}`.toUpperCase();
          document.getElementById("panumdumanWitnessPosition").innerText = `${document.getElementById("panumdumanWitnessPositionInput").value || "(Position or Role)"}`;
          document.getElementById("panumdumanAttestedPosition").innerText = `${document.getElementById("panumdumanAttestedPositionInput").value || "(Position or Role)"}`;

          alert("Changes applied");
        }
      });
      viewCertificate.addEventListener('click', () => viewCertificateDetails("panumduman"));
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
      document.getElementById("RAAddress").innerText = `Purok ${purok}, Barangay ${barangay}, ${city}, Province of ${province}`;
      document.getElementById("RAGender").innerHTML = `<u>${gender}</u>`;
      document.getElementById("RACivilStatus").innerHTML = `<u>${civilStatus}</u>`;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
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

      viewCertificate.addEventListener('click', () => viewCertificateDetails("RA11261"));
    }
    else if (purpose === 'Residency') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="4ps Benificiary Transfer Requirement">4ps Benificiary Transfer Requirement</option>
                  <option value="LTO Application Requirement">LTO Application Requirement</option>
                  <option value="PSA Application Requirement">PSA Application Requirement</option>
                  <option value="Residency Transfer Requirement">Residency Transfer Requirement</option>
                  <option value="Senior Citizen Application Requirement">Senior Citizen Application Requirement</option>
                  <option value="Water Connection Application Requirement">Water Connection Application Requirement</option>
                  <option value="Whatever legal purpose">Whatever legal purpose</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">Resident Since (Ex. 2013 to present)</label>
              <input type="text" id="residencyResidentSinceInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Years living</label>
              <input type="number" id="residencyResidentYearsLivingInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Opt ID</label>
              <input type="text" id="residencyOptIDInput">
          </div>
          <div class="inputWithLabel">
              <label for="">CTC Nos</label>
              <input type="text" id="residencyCTCNosInput">
          </div>
          <div class="inputWithLabel">
              <label for="">CTC Issued</label>
              <input type="text" id="residencyCTCIssuedInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Date Issued</label>
              <input type="date" id="residencyDateIssuedInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Date Printed</label>
              <input type="date" id="residencyDatePrintedInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="number" id="residencyORNumberInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Attested By</label>
              <input type="text" id="residencyAttestedInput">
          </div>
          <div class="inputWithLabel" style="flex:1">
              <label for="">Position or Role (Ex. Barangay Secretary)</label>
              <input type="text" id="residencyAttestedPositionInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Validation Days (Ex. 90 Days)</label>
              <input type="text" id="residencyValidationInput">
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


      document.getElementById("residencyFullName").innerText =
        `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("residencyStreet").innerHTML = street;
      document.getElementById("residencyPurok").innerHTML = purok;
      document.getElementById("residencyBarangay").innerHTML = barangay;
      document.getElementById("residencyMunicipality").innerHTML = city;
      document.getElementById("residencyProvince").innerHTML = province;



      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("selectPurpose");
          const selectedPurpose = certificatePurposeInput.value.trim();

          if (selectedPurpose && selectedPurpose !== "default") {
            if (selectedPurpose === "Whatever legal purpose") {
              residencyPurpose.innerText = "";
            } else {
              const residencyPurpose = document.getElementById("residencyPurpose");
              residencyPurpose.innerText = selectedPurpose;
            }
            document.getElementById("residencySince").innerText = document.getElementById("residencyResidentSinceInput").value;
            document.getElementById("residencyYearsLiving").innerText = document.getElementById("residencyResidentYearsLivingInput").value;
            document.getElementById("residencyOPTID").innerText = document.getElementById("residencyOptIDInput").value;
            document.getElementById("residencyCTCNumber").innerText = document.getElementById("residencyCTCNosInput").value;
            document.getElementById("residencyCTCIssued").innerText = document.getElementById("residencyCTCIssuedInput").value;
            document.getElementById("residencyCTCDate").innerText = document.getElementById("residencyDateIssuedInput").value;
            document.getElementById("residencyORNos").innerText = document.getElementById("residencyORNumberInput").value;
            document.getElementById("residencyDatePrinted").innerText = document.getElementById("residencyDatePrintedInput").value;
            document.getElementById("residencyAttestedBy").innerText = document.getElementById("residencyAttestedInput").value.toUpperCase();
            document.getElementById("residencyPositionOrRole").innerText = document.getElementById("residencyAttestedPositionInput").value;
            document.getElementById("residencyBalidationDays").innerText = document.getElementById("residencyValidationInput").value;

            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose");
          }
        }
      });

      viewCertificate.addEventListener('click', () => viewCertificateDetails("residency"));
    }
    else if (purpose === 'Same Person') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Program/Assistance Applied For</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="AISCS by the DSWD">AISCS by the DSWD</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">Other Name</label>
              <input type="text" id="samePersonOtherNameInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="samePersonORNosInput">
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


      document.getElementById("samePersonFullName").innerText = `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("samePersonAddress").innerText = `Brgy. ${barangay}, ${city}, ${province}`;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;

          if (selectedPurpose && selectedPurpose !== "default") {
            const samePersonProgram = document.getElementById("samePersonProgram");
            const samePersonProgram1 = document.getElementById("samePersonProgram1");

            document.getElementById("samePersonOtherName").innerText = document.getElementById("samePersonOtherNameInput").value.toUpperCase() || "(OTHER NAME)";
            document.getElementById("samePersonORNos").innerText = document.getElementById("samePersonORNosInput").value;

            if (certificatePurposeInput.type === "text") {
              samePersonProgram.innerText = selectedPurpose;
              samePersonProgram1.innerText = selectedPurpose;
            } else {
              samePersonProgram.innerText = selectedPurpose;
              samePersonProgram1.innerText = selectedPurpose;
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });

      viewCertificate.addEventListener('click', () => viewCertificateDetails("samePerson"));
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
              <label for="">Validation Days (Ex. 90 days)</label>
              <input type="text" id="singlenessValidationInput">
          </div>
      `;

      document.getElementById("singlenessFullName").innerText = `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("singlenessAddress").innerText = `Purok ${purok}, Barangay ${barangay}, ${city}, Province of ${province}`;
      document.getElementById("singlenessGender").innerHTML = `<u>${gender}</u>`;
      document.getElementById("singlenessAge").innerHTML = `<u>${age}</u>`;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains('applyChanges')) {
          document.getElementById("singlessCertificateNumber").innerText = document.getElementById("singlenessCertificateNumberInput").value || "(TEXT CERTIFICATE NUMBER)";
          document.getElementById("singlenessORNumber").innerText = document.getElementById("singlenessORNumberInput").value || "(OR NUMBER)";
          document.getElementById("singlenessAmountPaid").innerText = `P ${document.getElementById("singlenessAmountPaidInput").value}` || "(AMOUNT)";
          document.getElementById("singlenessValidationDays").innerText = document.getElementById("singlenessValidationInput").value || "VALIDATION DAYS";
          alert("Changes applied");
        }
      });


      viewCertificate.addEventListener('click', () => viewCertificateDetails("singleness"));
    }
    else if (purpose === 'Solo Parent') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="">Former Partner's Name</label>
              <input type="text" id="soloParentPartnerInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Time Apar(13 years)</label>
              <input type="text" id="soloParentTimeApartInput">
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <label style="margin-right: auto">Certification Details <br> <i>(Press ctrl+b for bold, ctrl+i for italic, and ctrl+u for underline)</i></label>
          </div>
          <div 
            id="soloParentCertificationDetailsInput"
            contenteditable="true"
            style="
              border: 1px solid #000;
              padding: 8px;
              min-height: 80px;
              margin: 5px 0;
              font-family: Arial, sans-serif;
              border-radius: 10px;
              outline: none;
            "
            onkeydown="handleFormatting(event, this)"
          ></div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="number" id="soloParentORNumberInput">
          </div>
      `;

      document.getElementById("soloParentFullName").innerText = `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("soloParentAddress").innerText = `Purok ${purok}, Barangay ${barangay}, ${city}, Province of ${province}`;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          document.getElementById("soloParentPartner").innerText = document.getElementById("soloParentPartnerInput").value.toLocaleUpperCase();
          document.getElementById("soloParentTimeApart").innerText = document.getElementById("soloParentTimeApartInput").value;
          document.getElementById("soloParentCertificationDetails").innerHTML = document.getElementById("soloParentCertificationDetailsInput").innerHTML;
          document.getElementById("soloParentORNos").innerHTML = document.getElementById("soloParentORNumberInput").value;

          alert("Changes applied");
        }
      });

      viewCertificate.addEventListener('click', () => viewCertificateDetails("soloParent"));
    }
    else if (purpose === 'Common Law') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Loan Application Requirement">Loan Application Requirement</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">Partner's Name</label>
              <input type="text" id="commonLawPartnerNameInput">
          </div>
          <div style="display:flex; gap:12px;">
              <div class="inputWithLabel">
              <label for="">Years Living Together</label>
              <input type="number" id="commonLawYearsTogetherInput">
              </div>
              <div class="inputWithLabel">
              <label for="">Time Period</label>
              <select id="commonLawtimePeriodInput">
                  <option value="Years">Years</option>
                  <option value="Months">Months</option>
              </select>
              </div>
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="text" id="commonLawORNosInput">
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


      document.getElementById("commonLawFullName").innerText = `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("commonLawAddress").innerText = `Barangay ${barangay}, ${city}, ${province}`;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;

          if (selectedPurpose && selectedPurpose !== "default") {
            const commonLawPurpose = document.getElementById("commonLawPurpose");
            const years = document.getElementById("commonLawYearsTogetherInput").value;


            document.getElementById("commonLawPartnerName").innerText = document.getElementById("commonLawPartnerNameInput").value.toUpperCase() || "(OTHER NAME)";
            document.getElementById("commonLawYearsTogether").innerText = `${numberToText(years)} (${years})` || "(YEARS LIVING TOGETHER)";
            document.getElementById("commonLawYears").innerText = document.getElementById("commonLawtimePeriodInput").value;
            document.getElementById("commonLawORNos").innerText = document.getElementById("commonLawORNosInput").value;

            if (certificatePurposeInput.type === "text") {
              commonLawPurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              commonLawPurpose.innerText = selectedPurpose.toUpperCase();
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });
      viewCertificate.addEventListener('click', () => viewCertificateDetails("commonLaw"));
    }
    else if (purpose === 'Employment') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="DSWD Financial Assistance Requirement Only">DSWD Financial Assistance Requirement Only</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">Job Title</label>
              <input type="text" id="employmentJobTitleInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Workplace</label>
              <input type="text" id="employmentWorkplaceInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Work Location</label>
              <input type="text" id="employmentWorkLocationInput">
          </div>
          <div class="inputWithLabel">
              <label for="">Validation Days (Ex. 90 days)</label>
              <input type="text" id="employmentValidationInput">
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


      document.getElementById("employmentFullName").innerText = `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("employmentAddress").innerText = `Purok ${purok}, Barangay ${barangay}, ${city}, Province of ${province}`;
      document.getElementById("employmentGender").innerText = gender;
      document.getElementById("employmentStatus").innerText = civilStatus;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;

          if (selectedPurpose && selectedPurpose !== "default") {
            const employmentPurpose = document.getElementById("employmentPurpose");


            document.getElementById("employmentJobTitle").innerText = document.getElementById("employmentJobTitleInput").value || "(JOB TITLE)";
            document.getElementById("employmentWorkplace").innerText = document.getElementById("employmentWorkplaceInput").value || "(WORKPLACE)";
            document.getElementById("employmentWorkLocation").innerText = document.getElementById("employmentWorkLocationInput").value || "(WORK LOCATION)";
            document.getElementById("employmentValidation").innerText = document.getElementById("employmentValidationInput").value || "(VALIDATION)";

            if (certificatePurposeInput.type === "text") {
              employmentPurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              employmentPurpose.innerText = selectedPurpose.toUpperCase();
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });

      viewCertificate.addEventListener('click', () => viewCertificateDetails("employment"));
    }
    else if (purpose === 'Water District') {
      certificateMainForm.innerHTML = `
          <div class="inputWithLabel">
              <label for="certificatePurpose">Purpose</label>
              <select class="certficate-purpose-dropdown" id="selectPurpose">
                  <option value="default" disabled selected>Select a Purpose</option>
                  <option value="Instalation/Working Permit Application Requirement">Instalation/Working Permit Application Requirement</option>
                  <option value="Others">Others</option>
              </select>
              <input type="hidden" id="certificatePurpose" style="margin-top:12px">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Number</label>
              <input type="number" id="waterDistrictORNosInput">
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


      document.getElementById("waterDistrictFullName").innerText = `${lastName}, ${firstName} ${middleName}`.toUpperCase();
      document.getElementById("waterDistrictAddress").innerText = `Purok ${purok}, Barangay ${barangay}, ${city}`.toLocaleUpperCase();

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const certificatePurposeInput = document.getElementById("certificatePurpose");
          const selectedPurpose = certificatePurposeInput.type === "text" ? certificatePurposeInput.value.trim() : certificatePurposeInput.value;

          if (selectedPurpose && selectedPurpose !== "default") {
            const waterDistrictPurpose = document.getElementById("waterDistrictPurpose");

            document.getElementById("waterDistrictORNos").innerText = document.getElementById("waterDistrictORNosInput").value;

            if (certificatePurposeInput.type === "text") {
              waterDistrictPurpose.innerText = selectedPurpose.toUpperCase();
            } else {
              waterDistrictPurpose.innerText = selectedPurpose.toUpperCase();
            }
            alert("Changes applied: " + selectedPurpose);
          } else {
            alert("Please select a purpose or provide one if you selected 'Others'.");
          }
        }
      });


      viewCertificate.addEventListener('click', () => viewCertificateDetails("waterDistrict"));
    }
    else if (purpose === 'Death Certificate') {
      certificateMainForm.innerHTML = `
          <div style="display:flex; gap:12px">
            <div class="inputWithLabel">
              <label for="">Name of Deceased</label>
              <input type="text" id="deathNameOfDeceasedInput">
          </div>
            <div class="inputWithLabel">
              <label for="">Gender</label>
              <select id="deathGenderInput">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
              </select>
              </div>
          </div>
          <div style="display:flex; gap:12px">
            <div class="inputWithLabel">
              <label for="">Date of Birth</label>
              <input type="date" id="deathDateOfBirthInput">
          </div>
            <div class="inputWithLabel">
                <label for="">Age</label>
                <input type="number" id="deathAgeInput">
            </div>
          </div>
          <div style="display:flex; gap:12px">
            <div class="inputWithLabel">
                <label for="">Date of Death</label>
                <input type="date" id="deathDateOfDeathInput">
            </div>
            <div class="inputWithLabel">
                <label for="">Time of Death (Optional)</label>
                <input type="time" id="deathTimeOfDeathInput">
            </div>
          </div>
          <div style="display:flex; gap:12px">
            <div class="inputWithLabel">
                <label for="">Date of Burial</label>
                <input type="date" id="deathDateOfBurialInput">
            </div>
            <div class="inputWithLabel">
                <label for="">Place of Burial</label>
                <input type="text" id="deathPlaceOfBurialInput">
            </div>
          </div>
          <div class="inputWithLabel">
              <label for="">Place of Death (Ex. Brgy. Maypangdan Borongan City)</label>
              <input type="text" id="deathPlaceOfDeathInput">
          </div>
          <div class="inputWithLabel">
              <label for="">OR Nos</label>
              <input type="number" id="deathORNosInput">
          </div>
      `;

      document.addEventListener('click', function (event) {
        if (event.target.classList.contains("applyChanges")) {
          const timeInput = document.getElementById("deathTimeOfDeathInput").value;

          if (timeInput) {
            const [hour, minute] = timeInput.split(":").map(Number);
            let period = "";
            if (hour >= 0 && hour < 12) {
              period = "morning";
            } else if (hour >= 12 && hour < 18) {
              period = "afternoon";
            } else {
              period = "evening";
            }

            // Convert to 12-hour format
            const hours12 = hour % 12 || 12; // Convert 0 -> 12 for midnight
            const ampm = hour < 12 ? "AM" : "PM";
            const formattedTime = `${hours12}:${minute.toString().padStart(2, "0")} ${ampm}`;

            document.getElementById("deathTimeOfDeath").innerText = `around ${formattedTime} in the ${period}`;
          }


          document.getElementById("deathNameofDeceased").innerText = document.getElementById("deathNameOfDeceasedInput").value.toLocaleUpperCase() || "(NAME OF DECEASED)";
          document.getElementById("deathNameOfDeceased1").innerText = document.getElementById("deathNameOfDeceasedInput").value.toLocaleUpperCase() || "(NAME OF DECEASED)";
          document.getElementById("deathAge").innerText = document.getElementById("deathAgeInput").value || "(AGE)";
          document.getElementById("deathPlaceOfBurial").innerText = document.getElementById("deathPlaceOfBurialInput").value || "(PLACE OF BURIAL)";
          document.getElementById("deathPlaceOfDeath").innerText = document.getElementById("deathPlaceOfDeathInput").value || "(PLACE OF DEATH)";
          document.getElementById("deathORNumber").innerText = document.getElementById("deathORNosInput").value;

          if (document.getElementById("deathGenderInput").value === "Male") {
            document.getElementById("deathGender").innerText = "He";
            document.getElementById("deathGender1").innerText = "his";
          } else if (document.getElementById("deathGenderInput").value === "Female") {
            document.getElementById("deathGender").innerText = "She";
            document.getElementById("deathGender1").innerText = "her";
          }


          document.getElementById("deathDateOfBirth").innerHTML = new Date(document.getElementById("deathDateOfBirthInput").value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || "(DATE OF BIRTH)";
          document.getElementById("deathDateOfDeath").innerHTML = new Date(document.getElementById("deathDateOfDeathInput").value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || "(DATE OF DEATH)";
          document.getElementById("deathDateOfBurial").innerHTML = new Date(document.getElementById("deathDateOfBurialInput").value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) || "(DATE OF BURIAL)";

          alert("Changes applied");
        }
      });

      viewCertificate.addEventListener('click', () => viewCertificateDetails("death"));
    }
  }
  // Function to view certificate
  function viewCertificateDetails(selectedCertificate) {
    document.getElementById("certificate").classList.add("visible");

    const hiddenContainers = document.querySelectorAll("#residency, #indigency, #RA11261, #brgyClearance, #singleness, #guardianship, #income, #landNoClaim, #noDuplication, #panumduman, #buildingClearance, #burailClearance, #businessClearance, #businessClosure, #lateRegistration, #soloParent, #oathUndertaking, #goodMoral, #samePerson, #commonLaw, #death, #employment, #waterDistrict");
    hiddenContainers.forEach(container => container.classList.remove("visible"));

    var convertToImage = document.getElementById(selectedCertificate);
    var imageContainer = document.getElementById("certificateContainer");


    convertToImage.classList.add("visible");
    html2canvas(convertToImage).then((canvas) => {
      const img = canvas.toDataURL("image/png"); // Convert canvas to image data
      const imgElement = document.createElement("img");
      imgElement.src = img;
      imgElement.id = "certImg"
      imgElement.style.width = "100%"
      // imgElement.style.height="auto"

      // Append the generated image to the container
      imageContainer.innerHTML = ""; // Clear previous images
      imageContainer.appendChild(imgElement);

      console.log(selectedCertificate);
    });
    imageContainer.classList.remove("visible");
    convertToImage.classList.toggle("visible");
    // document.getElementById("certificate").classList.add("visible");






    document.querySelector(".closeCertificate").addEventListener("click", function () {
      if (selectedCertificate === "oathUndertaking") {
        document.querySelector(".overlay").classList.remove("visible");
      } else {
        document.querySelector(".overlay").classList.add("visible");
      }
      document.getElementById("certificate").classList.remove("visible");
      document.getElementById(selectedCertificate).classList.remove("visible");
    });
  }
};
// ordinal date (2nd day of...)
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

// date with this format "Month Day, Year"
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// date with this format (00/00/0000)
const padZero = (num) => (num < 10 ? `0${num}` : num);
const getCurrentDate = () => {
  const today = new Date();
  const month = padZero(today.getMonth() + 1);
  const day = padZero(today.getDate());
  const year = today.getFullYear();

  return `${month}/${day}/${year}`;
};

// function for burial certificate
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

// function for panumduman
let agreementCount = 1;
function addTextarea() {
  const container = document.getElementById("textAreaContainer");

  const div = document.createElement('div');
  div.classList.add('inputWithLabel');
  div.setAttribute('id', `agreement-${agreementCount}`);
  if (agreementCount === 1) {
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="margin-right: auto">Agreement: <strong>${agreementCount}</strong> <i>(Press ctrl+b for bold, ctrl+i for italic, and ctrl+u for underline)</i></label>
        <button onclick="addTextarea()">+</button>
        <button onclick="removeTextarea(this)">-</button>
      </div>
      <div 
        contenteditable="true"
        style="
          border: 1px solid #000;
          padding: 8px;
          min-height: 80px;
          margin: 5px 0;
          font-family: Arial, sans-serif;
          border-radius: 10px;
          outline: none;
        "
        onkeydown="handleFormatting(event, this)"
      ></div>
    `;
  } else {
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="margin-right: auto">Agreement: <strong>${agreementCount}</strong> <i>(Press ctrl+b for bold, ctrl+i for italic, and ctrl+u for underline)</i></label>
      </div>
      <div 
        contenteditable="true"
        style="
          border: 1px solid #000;
          padding: 8px;
          min-height: 80px;
          margin: 5px 0;
          font-family: Arial, sans-serif;
          border-radius: 10px;
          outline: none;
        "
        onkeydown="handleFormatting(event, this)"
      ></div>
    `;
  }
  container.appendChild(div);
  agreementCount++;
}
function removeTextarea() {
  const container = document.getElementById("textAreaContainer");

  if (container.children.length <= 1) return (alert('At least one Agreement is required!'));

  const lastChild = container.lastElementChild;
  if (lastChild) {
    container.removeChild(lastChild);
    agreementCount--;
  }
}

// Handle keyboard shortcuts for formatting (Ctrl+B, Ctrl+I, Ctrl+U)
function handleFormatting(event, editableDiv) {
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault();
    toggleBold(editableDiv);
  }

  if (event.ctrlKey && event.key === 'i') {
    event.preventDefault();
    toggleItalic(editableDiv);
  }

  if (event.ctrlKey && event.key === 'u') {
    event.preventDefault();
    toggleUnderline(editableDiv);
  }
}

// Toggles bold formatting on selected text
function toggleBold(editableDiv) {
  document.execCommand('bold');
}
// Toggles italic formatting on selected text
function toggleItalic(editableDiv) {
  document.execCommand('italic');
}
// Toggles underline formatting on selected text
function toggleUnderline(editableDiv) {
  document.execCommand('underline');
}

// close pop-up
document.querySelectorAll(".close_popUp").forEach(function (closeBtn) {
  closeBtn.addEventListener("click", function () {
    var pop_up = closeBtn.closest(".pop-up");
    if (pop_up) {
      pop_up.classList.remove("visible");
      overlay.classList.remove("visible");
      agreementCount = 1;
    }
  });
});

function removeRequest(buttonElement) {
  // Get the parent `tr` element (row) of the clicked button
  const row = buttonElement.closest('tr');
  const requestId = buttonElement.parentElement.getAttribute('data-id');

  // Optionally, confirm the removal
  if (confirm('Are you sure you want to remove this request?')) {
    // Remove the row from the DOM
    row.remove();
    deleteItem(requestId);
  }
}

async function deleteItem(requestID) {
  console.log("Delete triggered for request ID:", requestID);

  try {
    const response = await fetch(`/services/delete-request/${requestID}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      console.log("Request deleted successfully.");
      location.reload(); // Reload to reflect the changes
    } else {
      console.error("Error: Failed to delete the item. Status:", response.status);
      alert('Failed to delete the request. Please try again.');
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('An error occurred while deleting the request. Please try again.');
  }
}