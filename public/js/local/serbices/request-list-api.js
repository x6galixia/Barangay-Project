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
                data-firstName="${request.fname}"
                data-lastName="${request.lname}"
                data-middleName="${request.mname ? request.mname : ''}"
                data-purok="${request.purok}"
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
  const barangay = button.getAttribute('data-barangay');
  const city = button.getAttribute('data-city');
  const province = button.getAttribute('data-province');
  const civilStatus = button.getAttribute('data-civilStatus');
  const gender = button.getAttribute('data-gender');




  document.querySelector(".overlay").classList.toggle("visible");
  document.querySelector("#process-certificate").classList.toggle("visible");
  document.getElementById("certificateHeading").innerText = purpose;

  const applyChanges = document.getElementById("applyChanges");
  const viewCertificate = document.getElementById("viewCertificate");
  const certificateMainForm = document.getElementById("certificateMainForm");
  certificateMainForm.innerHTML = "";
  setCurrentDate();

  if (purpose === 'Brgy. Clearance') {
    viewCertificate.addEventListener('click', function () {

    })
  }
  else if (purpose === 'Building Clearance') {
  }
  else if (purpose === 'Burial Certificate') {
  }
  else if (purpose === 'Business Clearance') {
  }
  else if (purpose === 'Business Closure') {
  }
  else if (purpose === 'Good Moral') {
  }
  else if (purpose === 'Guardianship') {
    viewCertificate.addEventListener('click', function () {
      document.getElementById("certificate").classList.toggle("visible");
      document.getElementById("guardianship").classList.toggle("visible");

      document.querySelector(".closeCertificate").addEventListener("click", function () {
        document.getElementById("certificate").classList.remove("visible");
        document.getElementById("guardianship").classList.remove("visible");
      })
    })
  }
  else if (purpose === 'Income') {
    viewCertificate.addEventListener('click', function () {
      document.getElementById("certificate").classList.toggle("visible");
      document.getElementById("income").classList.toggle("visible");

      document.querySelector(".closeCertificate").addEventListener("click", function () {
        console.log("close click");
        document.getElementById("certificate").classList.remove("visible");
        document.getElementById("income").classList.remove("visible");
      })
    })
  }
  else if (purpose === 'Indigency') {
    certificateMainForm.innerHTML = `
        <div class="inputWithLabel">
            <label for="certificatePurpose">Purpose</label>
            <select class="certficate-purpose-dropdown" id="certificatePurpose">
                <option value="default" disabled selected>Select a Purpose</option>
                <option value="Scholarship Assistance">Scholarship Assistance</option>
                <option value="PhilHealth Enrollment">PhilHealth Enrollment</option>
                <option value="Medical Assistance">Medical Assistance</option>
            </select>
        </div>
    `;

    function viewCertificateDetails() {
      document.getElementById("certificate").classList.toggle("visible");
      document.getElementById("indigency").classList.toggle("visible");

      document.getElementById("indigencyFullName").innerText = `${lastName}, ${firstName} ${middleName}`;
      document.getElementById("indigencyAddress").innerText = `${purok}, ${barangay}, ${city}, ${province}`;

      // gender
      if (gender === "Male") {
        document.getElementById("indigencyGender").innerHTML = "female/<u>male</u>";
      } else {
        document.getElementById("indigencyGender").innerHTML = "<u>female</u>/male";
      }

      //civil status
      switch (civilStatus) {
        case "Single":
          document.getElementById("indigencyCivilStatus").innerHTML = "<u>single</u>/married/widow/widower";
          break;
        case "Married":
          document.getElementById("indigencyCivilStatus").innerHTML = "single/<u>married</u>/widow/widower";
          break;
        case "Widow":
          document.getElementById("indigencyCivilStatus").innerHTML = "single/married/<u>widow</u>/widower";
          break;
        case "Widower":
          document.getElementById("indigencyCivilStatus").innerHTML = "single/married/widow/<u>widower</u>";
          break;
      }

      document.querySelector(".closeCertificate").addEventListener("click", function () {
        console.log("close click");
        document.getElementById("certificate").classList.remove("visible");
        document.getElementById("indigency").classList.remove("visible");
      });
    }

    applyChanges.addEventListener('click', function () {
      const purposeDropdown = document.getElementById("certificatePurpose");
      const selectedPurpose = purposeDropdown.value;

      if (selectedPurpose !== "default") {
        const indigencyPurpose = document.getElementById("indigencyPurpose");
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

        alert("Changes applied: " + selectedPurpose);
      } else {
        alert("Please select a purpose before applying changes.");
      }
    });

    viewCertificate.addEventListener('click', viewCertificateDetails);
  }

  else if (purpose === 'Land no claim') {
    viewCertificate.addEventListener('click', function () {
      document.getElementById("certificate").classList.toggle("visible");
      document.getElementById("landNoClaim").classList.toggle("visible");

      document.querySelector(".closeCertificate").addEventListener("click", function () {
        console.log("close click");
        document.getElementById("certificate").classList.remove("visible");
        document.getElementById("landNoClaim").classList.remove("visible");
      })
    })
  }
  else if (purpose === 'Late Registration') {
  }
  else if (purpose === 'No Duplication') {
    viewCertificate.addEventListener('click', function () {
      document.getElementById("certificate").classList.toggle("visible");
      document.getElementById("noDuplication").classList.toggle("visible");

      document.querySelector(".closeCertificate").addEventListener("click", function () {
        console.log("close click");
        document.getElementById("certificate").classList.remove("visible");
        document.getElementById("noDuplication").classList.remove("visible");
      })
    })
  }
  else if (purpose === 'Panumduman') {
    viewCertificate.addEventListener('click', function () {
      document.getElementById("certificate").classList.toggle("visible");
      document.getElementById("panumduman").classList.toggle("visible");

      document.querySelector(".closeCertificate").addEventListener("click", function () {
        console.log("close click");
        document.getElementById("certificate").classList.remove("visible");
        document.getElementById("panumduman").classList.remove("visible");
      })
    })
  }
  else if (purpose === 'RA 11261') {
    viewCertificate.addEventListener('click', function () {
      document.getElementById("certificate").classList.toggle("visible");
      document.getElementById("RA11261").classList.toggle("visible");

      document.querySelector(".closeCertificate").addEventListener("click", function () {
        console.log("close click");
        document.getElementById("certificate").classList.remove("visible");
        document.getElementById("RA11261").classList.remove("visible");
      })
    })
  }
  else if (purpose === 'Residency') {
    alert(purpose);
  }
  else if (purpose === 'Same Person') {
    alert(purpose);
  }
  else if (purpose === 'Singleness') {
    alert(purpose);
  }
  else if (purpose === 'Solo Parent') {
    alert(purpose);
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

  const day = getOrdinalSuffix(today.getDate()); // Current day with ordinal suffix
  const month = today.toLocaleString("default", { month: "long" }).toUpperCase(); // Full month name in uppercase
  const year = today.getFullYear(); // Current year

  document.getElementById("dateDay").innerText = day;
  document.getElementById("dateMonth").innerText = month;
  document.getElementById("dateYear").innerText = year;
}

