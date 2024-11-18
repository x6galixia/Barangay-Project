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
                <td><button data-purpose="${request.purpose}" onclick="processCertificate(this)">Process</button></td>
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
  document.querySelector(".overlay").classList.toggle("visible");
  document.querySelector("#process-certificate").classList.toggle("visible");
  document.getElementById("certificateHeading").innerText = purpose;

  const viewCertificate = document.getElementById("viewCertificate");

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
    viewCertificate.addEventListener('click', function () {
      document.getElementById("certificate").classList.toggle("visible");
      document.getElementById("indigency").classList.toggle("visible");

      document.querySelector(".closeCertificate").addEventListener("click", function () {
        console.log("close click");
        document.getElementById("certificate").classList.remove("visible");
        document.getElementById("indigency").classList.remove("visible");
      })
    })
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
