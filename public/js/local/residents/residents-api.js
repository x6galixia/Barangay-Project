document.addEventListener("DOMContentLoaded", async function () {
    const residentsTableBody = document.getElementById('residentsTableBody');

    // Get URL parameters for page and limit, fallback to page 1, limit 10
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10;

    try {
        // Fetch the residents list using the fetch API, include page and limit in the URL
        const response = await fetch(`/residents/dashboard?ajax=true&page=${page}&limit=${limit}`);
        if (!response.ok) {
            throw new Error("Failed to fetch residents data");
        }

        const data = await response.json();
        const residents = data.getResidentsList;

        // Clear the table body before appending
        residentsTableBody.innerHTML = '';

        // Loop through the residents and create table rows
        residents.forEach(resident => {
            const row = document.createElement('tr');
            console.log(data);
            row.innerHTML = `
                <td>${resident.fname} ${resident.mname ? resident.mname : ''} ${resident.lname}</td>
                <td>${new Date(resident.birthdate).toLocaleDateString()}</td>
                <td>${resident.age}</td>
                <td>${resident.gender}</td>
                <td>${resident.eattainment || 'N/A'}</td>
                <td>${resident.occupation || 'N/A'}</td>
                <td>${resident.purok || 'N/A'}</td>
                <td>${resident.houseclassification || 'N/A'}</td>
                <td>${resident.isWithCr ? 'Yes' : 'No'}</td>
                <td>${resident.watersource || 'N/A'}</td>
                <td>${resident.isenergized ? 'Yes' : 'No'}</td>
                <td>${resident.iswith40mzone ? 'Yes' : 'No'}</td>
                <td>${generateRemarks(resident)}</td>
                <td class="menu-row">
                <img class="dot" src="../icon/triple-dot.svg" alt="">
                <div class="triple-dot">
                    <div class="menu" data-id="${resident.globalid}">
                        <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                        <button id="update-id" onclick="popUp_three_dot(this)">Update</button>
                        <button id="generate-id" onclick="popUp_three_dot(this)"
                        data-fullname="${resident.fname} ${resident.mname ? resident.mname : ''} ${resident.lname}"
                        data-idNumber="${resident.idnumber}"
                        data-globalId="${resident.globalid}"
                        data-civil_status="${resident.civil_status}"
                        data-birthdate="${new Date(resident.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
                        data-address="Purok ${resident.purok}, ${resident.barangay}, ${resident.city}"
                        data-Contactfullname="${resident.emergencycontactfname} ${resident.emergencycontactmname ? resident.emergencycontactmname : ''} ${resident.emergencycontactlname}"
                        data-ContactPhone="${resident.emergencycontactnumber}"
                        data-Contactaddress="Purok ${resident.emergencycontactpurok}, ${resident.emergencycontactbarangay}, ${resident.emergencycontactcity}"
                        >Generate ID</button>
                    </div>
                </div>
            </td>
            `;

            residentsTableBody.appendChild(row);
        });

        // Update the pagination links
        updatePaginationLinks(data.currentPage, data.totalPages);

    } catch (error) {
        console.error("Error fetching residents data: ", error);
        residentsTableBody.innerHTML = '<tr><td colspan="12">Error loading data</td></tr>';
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
    attachDotEventListeners();
});
// Helper function to generate remarks based on resident data
function generateRemarks(resident) {
    const remarks = [];
    if (resident.ispwd) remarks.push("PWD");
    if (resident.issoloparent) remarks.push("Solo Parent");
    if (resident.isyouth) remarks.push("Youth");
    if (resident.is4ps) remarks.push("4Ps Member");

    return remarks.length > 0 ? remarks.join(', ') : 'N/A';
}

function attachDotEventListeners() {
    document.querySelectorAll(".dot").forEach(function (dot) {
        dot.addEventListener("click", function () {
            const tripleDotContainer = dot.closest("td").querySelector(".triple-dot");
            if (tripleDotContainer) {
                tripleDotContainer.classList.toggle("visible");
                if (tripleDotContainer.classList.contains("visible")) {
                    // clearInterval(pollIntervalId);
                    isDotMenuOpen = true;
                } else {
                    // pollIntervalId = setInterval(fetchBeneficiaryUpdates, POLL_INTERVAL);
                    // isDotMenuOpen = false;
                }
            }
        });

        document.addEventListener("click", function (event) {
            // Check if the click was outside the dot container
            if (!dot.contains(event.target)) {
                const tripleDotContainer = dot.closest("td").querySelector(".triple-dot");
                if (tripleDotContainer && tripleDotContainer.classList.contains("visible")) {
                    tripleDotContainer.classList.remove("visible");
                    // pollIntervalId = setInterval(fetchBeneficiaryUpdates, POLL_INTERVAL);
                    // isDotMenuOpen = false;
                }
            }
        });
    });

}

// const update_beneficiary = document.getElementById("update-beneficiary");

window.popUp_three_dot = function (button) {
    const action = button.textContent.trim();
    const menu = button.closest('.menu');
    const residentID = menu.getAttribute('data-id');

    if (action === 'Delete' && residentID) {
        alert("Delete!");

        // const confirmDeleteButton = document.getElementById('confirm-delete');
        // const cancelDeleteButton = document.getElementById('cancel-delete');
        // const pop_up_Delete = document.getElementById('delete-beneficiary');

        // pop_up_Delete.classList.add("visible");
        // overlay.classList.add("visible");

        // confirmDeleteButton.addEventListener('click', function () {
        //     deleteBeneficiary(beneficiaryId);
        //     pop_up_Delete.classList.remove("visible");
        //     overlay.classList.remove("visible");
        // })
        // cancelDeleteButton.addEventListener('click', function () {
        //     pop_up_Delete.classList.remove("visible");
        //     overlay.classList.remove("visible");
        // })
    }
    if (action === 'Update' && residentID) {
        alert("Update!");
        // fetch(`/pharmacy-records/beneficiary/${beneficiaryId}`)
        //     .then(response => {
        //         if (!response.ok) throw new Error('Network response was not ok');
        //         return response.json();
        //     })
        //     .then(beneficiaryData => {
        //         document.getElementById('beneficiary_id').value = beneficiaryData.beneficiary_id || '';
        //         document.getElementById('last_name').value = beneficiaryData.last_name || '';
        //         document.getElementById('first_name').value = beneficiaryData.first_name || '';
        //         document.getElementById('middle_name').value = beneficiaryData.middle_name || '';
        //         document.getElementById('gender').value = beneficiaryData.gender || '';
        //         document.getElementById('birthdate').value = beneficiaryData.birthdate.split('T')[0] || '';
        //         document.getElementById('phone').value = beneficiaryData.phone || '';
        //         document.getElementById('processed_date').value = beneficiaryData.processed_date.split('T')[0] || '';
        //         document.getElementById('occupation').value = beneficiaryData.occupation || '';
        //         document.getElementById('street').value = beneficiaryData.street || '';
        //         document.getElementById('barangay').value = beneficiaryData.barangay || '';
        //         document.getElementById('city').value = beneficiaryData.city || '';
        //         document.getElementById('province').value = beneficiaryData.province || '';
        //         document.getElementById('senior_citizen').value = beneficiaryData.senior_citizen || '';
        //         document.getElementById('pwd').value = beneficiaryData.pwd || '';
        //         document.getElementById('note').value = beneficiaryData.note || '';
        //         document.getElementById('existing_picture').value = beneficiaryData.picture || '';

        //         var picture;
        //         if (beneficiaryData.gender === "Male") {
        //             picture = "/icon/upload-img-default.svg";
        //         } else {
        //             picture = "/icon/upload-img-default-woman.svg";
        //         }


        //         const pictureElement = document.getElementById('pictureDisplay');
        //         if (pictureElement) {
        //             const picturePath = (beneficiaryData.picture && beneficiaryData.picture !== '0') ? `/uploads/beneficiary-img/${beneficiaryData.picture}` : picture;
        //             pictureElement.src = picturePath;
        //         } else {
        //             console.error('Image element not found');
        //         }

        //         const fileInput = document.getElementById('picture');
        //         if (fileInput) {
        //             fileInput.value = '';
        //         }

        //         update_beneficiary.classList.add("visible");
        //         overlay.classList.add("visible");
        //     })
        //     .catch(error => {
        //         console.error('Error fetching beneficiary data:', error);
        //         alert('Failed to fetch beneficiary data. Please try again.');
        //     });
    }
    if (action === 'Generate ID' && residentID) {

        const id_card = document.getElementById("generate-ID");
        const globalIDForQR = button.getAttribute('data-globalId');
        id_card.classList.add("visible");
        overlay.classList.toggle("visible");

        document.getElementById('fullname').innerText = button.getAttribute('data-fullname');
        document.getElementById('civilStatus').innerText = button.getAttribute('data-civil_status');
        document.getElementById('birthdate').innerText = button.getAttribute('data-birthdate');
        document.getElementById('address').innerText = button.getAttribute('data-address');
        document.getElementById('idNumber').innerText = button.getAttribute('data-idNumber');
        document.getElementById('emergencyContactName').innerText = button.getAttribute('data-contactFullName');
        document.getElementById('emergencyContactNumber').innerText = button.getAttribute('data-contactPhone');
        document.getElementById('emergencyContactAddress').innerText = button.getAttribute('data-contactAddress');


        //         var picture;
        //         if (beneficiaryData.gender === "Male") {
        //             picture = "/icon/upload-img-default.svg";
        //         } else {
        //             picture = "/icon/upload-img-default-woman.svg";
        //         }


        //         const pictureElement = document.getElementById('beneficiary-picture');
        //         if (pictureElement) {
        //             const picturePath = (beneficiaryData.picture && beneficiaryData.picture !== '0') ? `/uploads/beneficiary-img/${beneficiaryData.picture}` : picture;
        //             pictureElement.src = picturePath;
        //         } else {
        //             console.error('Image element not found');
        //         }

        //         const fileInput = document.getElementById('picture');
        //         if (fileInput) {
        //             fileInput.value = '';
        //         }


        async function generateQRCode() {
            const json = `${globalIDForQR}`;

            const secretKey = "MnDev"; // Use a strong secret key for encryption
            const encryptedData = encryptData(json, secretKey); // Encrypt the JSON data

            // Now proceed with the QR code generation
            const qr = qrcode(0, 'L');
            qr.addData(encryptedData); // Add encrypted data to QR code
            qr.make();

            const size = 4;
            document.getElementById('qrcode').innerHTML = qr.createImgTag(size, size);
            const decryptedData = decryptData(encryptedData, secretKey);

            // Log the decrypted data to the console
        }

        generateQRCode();

        //     })
        //     .catch(error => {
        //         console.error('Error fetching beneficiary data:', error);
        //         alert('Failed to fetch beneficiary data. Please try again.');
        //     });
    }

    function encryptData(data, secretKey) {
        return CryptoJS.AES.encrypt(data, secretKey).toString();
    }

    // Decrypt function
    function decryptData(cipherText, secretKey) {
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

};