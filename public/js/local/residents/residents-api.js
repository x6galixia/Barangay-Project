document.addEventListener("DOMContentLoaded", async function () {
    const residentsTableBody = document.getElementById('residentsTableBody');
    const urlParams = new URLSearchParams(window.location.search);
    const searchInput = document.getElementById('searchInput');
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10;
    const sectorsDropdown = document.getElementById('sectors-dropdown');
    const addressWhileStudying = document.getElementById('addressWhileStudying');
    const formToAddResident = document.getElementById('formToAddResident');
    const addressWhileStudyingInputs = document.querySelectorAll('#addressWhileStudying input, #addressWhileStudying select');
    const isResidentInput = document.getElementById('isResident');
    isResidentInput.value = "resident";

    fetchResidents().then(attachDotEventListeners);

    searchInput.addEventListener('input', () => {
        const selectedValue = document.querySelector('.residents-dropdown').value.trim();
        const isNonResident = selectedValue === 'non-residents';
        const searchQuery = searchInput.value.trim();

        fetchResidents(1, 10, searchQuery, isNonResident).then(attachDotEventListeners);
    });

    document.querySelector('.residents-dropdown').addEventListener('change', function () {
        const addressSection = document.getElementById('address-section');
        const emergencyAddress = document.getElementById('emergencyContactInfo');
        const selectedValue = this.value.trim();
        const searchQuery = document.getElementById('searchInput').value.trim();

        const isNonResident = selectedValue === 'non-residents';
        const columnsToHide = ["REMARKS"];
        const headers = document.querySelectorAll('table thead th');
        const rows = document.querySelectorAll('table tbody tr');

        function toggleColumns(show) {
            headers.forEach((header, index) => {
                if (columnsToHide.includes(header.textContent.trim().toUpperCase())) {
                    header.style.display = show ? '' : 'none';
                    rows.forEach(row => {
                        if (row.cells[index]) {
                            row.cells[index].style.display = show ? '' : 'none';
                        }
                    });
                }
            });
        }

        const residentClassificationSection = document.getElementById('residentClassification');

        if (selectedValue === "residents") {
            console.log("Residents selected");
            document.getElementById('barangay').value = "Maypangdan";
            document.getElementById('city').value = "Borongan City";
            document.getElementById('province').value = "Eastern Samar";
            document.getElementById('residentPageTitle').innerText = "LIST OF RESIDENT";
            formToAddResident.setAttribute('action', '/residents/dashboard/add-resident');
            isResidentInput.value = "resident";

            sectorsDropdown.innerHTML = `
            <option value="1">Government Employee</option>
            <option value="2">Private employee</option>
            <option value="3">Carpenters</option>
            <option value="4">Farmers</option>
            <option value="5">Fisherman</option>
            <option value="6">Business Entrepreneur</option>
            <option value="7">Drivers</option>
            <option value="8">OFW</option>
            <option value="9">Kasambahay</option>
            <option value="">None</option>
        `;
            // address
            addressSection.insertAdjacentHTML('afterbegin', `
            <div class="inputWithLabel" id="purok">
                <label for="">Purok</label>
                <select name="purok" aria-label="Purok">
                    <option value="Seguidila">Seguidila</option>
                    <option value="Sitaw">Sitaw</option>
                    <option value="Talbos">Talbos</option>
                    <option value="Petchay">Petchay</option>
                    <option value="Ampalaya">Ampalaya</option>
                    <option value="Mustaza">Mustaza</option>
                    <option value="Kalabasa">Kalabasa</option>
                </select>
            </div>
            <div class="inputWithLabel" id="street">
                <label>Street</label>
                <input type="text" aria-label="Street" name="street" required>
            </div>
        `);
            //emergency address
            emergencyAddress.insertAdjacentHTML('afterbegin', `
            <div class="inputWithLabel">
                <label for="">Purok</label>
                <select name="emergencyPurok" aria-label="Purok">
                    <option value="Seguidila">Seguidila</option>
                    <option value="Sitaw">Sitaw</option>
                    <option value="Talbos">Talbos</option>
                    <option value="Petchay">Petchay</option>
                    <option value="Ampalaya">Ampalaya</option>
                    <option value="Mustaza">Mustaza</option>
                    <option value="Kalabasa">Kalabasa</option>
                </select>
            </div>
            <div class="inputWithLabel">
                <label>Street</label>
                <input type="text" aria-label="Street" name="emergencyStreet" required>
            </div>
        `);

            addressWhileStudyingInputs.forEach(input => input.disabled = true);

            toggleColumns(true);
            if (addressWhileStudying) addressWhileStudying.style.display = "none";
            if (residentClassificationSection) {
                residentClassificationSection.style.display = 'block';
            }

            fetchResidents(1, 10, searchQuery, false).then(attachDotEventListeners);

        } else if (selectedValue === "non-residents") {
            console.log("Non-Residents selected");
            document.getElementById('barangay').value = "";
            document.getElementById('city').value = "";
            document.getElementById('province').value = "";
            document.getElementById('residentPageTitle').innerText = "LIST OF NON-RESIDENT";
            formToAddResident.setAttribute('action', '/residents/dashboard/add-non-resident');
            sectorsDropdown.innerHTML = `
            <option value="10">Resident Boarders</option>
        `;

            isResidentInput.value = "non-resident";
            const purok = document.getElementById('purok');
            const street = document.getElementById('street');
            const emergencyPurok = document.getElementById('emergencyPurok');
            const emergencyStreet = document.getElementById('emergencyStreet');


            if (purok) purok.remove();
            if (street) street.remove();
            if (emergencyPurok) emergencyPurok.remove();
            if (emergencyStreet) emergencyStreet.remove();

            addressWhileStudyingInputs.forEach(input => input.disabled = false);

            toggleColumns(false);
            addressWhileStudying.style.display = "block";
            if (residentClassificationSection) {
                residentClassificationSection.style.display = 'none';
            }

            fetchResidents(1, 10, searchQuery, true).then(attachDotEventListeners);
        }
    });

    async function fetchResidents(page = 1, limit = 10, searchQuery = '', isNonResident = false) {

        try {
            const response = await fetch(
                `/residents/dashboard?ajax=true&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&isNonResident=${isNonResident}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch residents data");
            }

            const data = await response.json();
            const residents = data.getResidentsList;
            // Clear the table body
            residentsTableBody.innerHTML = '';

            if (residents.length === 0) {
                // Display a "No residents found" message
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = `
                    <td colspan="9" class="text-center">No ${isNonResident ? 'non-residents' : 'residents'} found.</td>
                `;
                residentsTableBody.appendChild(noDataRow);
                return;
            }

            residents.forEach(resident => {
                const row = document.createElement('tr');

                const remarksColumn = isNonResident ? '' : `<td>${generateRemarks(resident)}</td>`;

                row.innerHTML = `
                    <td>${resident.purok || resident.originalpurok || 'N/A'}</td>
                    <td>${resident.fname} ${resident.mname ? resident.mname : ''} ${resident.lname}</td>
                    <td>${new Date(resident.birthdate).toLocaleDateString()}</td>
                    <td>${resident.age}</td>
                    <td>${resident.gender}</td>
                    <td>${resident.eattainment || 'N/A'}</td>
                    <td>${resident.occupation || 'N/A'}</td>
                    ${remarksColumn}
                    <td class="menu-row">
                        <img class="dot" src="../icon/triple-dot.svg" alt="">
                        <div class="triple-dot">
                            <div class="menu" data-id="${resident.globalid}">
                                <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                                <button id="update-id" onclick="popUp_three_dot(this)"
                                data-globalId="${resident.globalid}"
                                data-isResident="${resident.isresident}"
                                >Update</button>
                                <button id="generate-id" onclick="popUp_three_dot(this)"
                                data-fullname="${resident.fname} ${resident.mname ? resident.mname : ''} ${resident.lname}"
                                data-idNumber="${resident.idnumber}"
                                data-globalId="${resident.globalid}"
                                data-isResident="${resident.isresident}"
                                data-picture="${resident.picture}"
                                data-civil_status="${resident.civilstatus}"
                                data-birthdate="${new Date(resident.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
                                data-address="Purok ${resident.purok}, ${resident.barangay}, ${resident.city}"
                                data-addressNotResident="Purok ${resident.originalpurok}, ${resident.originalbarangay}, ${resident.originalcity}"
                                data-Contactfullname="${resident.emergencycontactfname} ${resident.emergencycontactmname ? resident.emergencycontactmname : ''} ${resident.emergencycontactlname}"
                                data-ContactPhone="${resident.emergencycontactnumber}"
                                data-Contactaddress="Purok ${resident.emergencycontactpurok}, ${resident.emergencycontactbarangay}, ${resident.emergencycontactcity}"
                                data-ContactaddressNotResident="${resident.emergencycontactbarangay}, ${resident.emergencycontactcity}, ${resident.emergencycontactprovince}"
                                >Generate ID</button>
                            </div>
                        </div>
                    </td>
                `;

                residentsTableBody.appendChild(row);
            });

            updatePaginationLinks(data.currentPage, data.totalPages);
        } catch (error) {
            console.error("Error fetching residents data: ", error);
            residentsTableBody.innerHTML = '<tr><td colspan="9">Error loading data</td></tr>';
        }
    }



    // Function to dynamically update pagination links
    function updatePaginationLinks(currentPage, totalPages) {
        const paginationNav = document.getElementById('paginationNav');
        paginationNav.innerHTML = '';

        if (currentPage > 1) {
            paginationNav.innerHTML += `<a href="?page=${currentPage - 1}&limit=${limit}&search=${encodeURIComponent(searchInput.value)}" aria-label="Previous Page">Previous</a>`;
        }

        if (currentPage < totalPages) {
            paginationNav.innerHTML += `<a href="?page=${currentPage + 1}&limit=${limit}&search=${encodeURIComponent(searchInput.value)}" aria-label="Next Page">Next</a>`;
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
        const deleteContainer = document.getElementById("delete-resident");
        const confirmDeleteButton = document.getElementById('confirm-delete');
        const cancelDeleteButton = document.getElementById('cancel-delete');
        deleteContainer.classList.add("visible");
        overlay.classList.toggle("visible");



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
        const updateContainer = document.getElementById("add-resident");
        document.querySelector('#add-resident .heading').innerText = "UPDATE RESIDENT";
        document.querySelector('#add-resident #submit_add_resident').innerText = "UPDATE";
        document.querySelector('#add-resident #formToAddResident').action = "/residents/dashboard/update-resident";
        const globalIDForQR = button.getAttribute('data-globalId');
        const isResident = button.getAttribute('data-isResident');
        console.log("globalID:", globalIDForQR);
        console.log("isResident:", isResident);
        updateContainer.classList.add("visible");
        overlay.classList.toggle("visible");
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
        const isResident = button.getAttribute('data-isResident');
        id_card.classList.add("visible");
        overlay.classList.toggle("visible");

        document.getElementById('fullname').innerText = button.getAttribute('data-fullname');
        document.getElementById('civilStatus').innerText = button.getAttribute('data-civil_status');
        document.getElementById('birthdate').innerText = button.getAttribute('data-birthdate');
        document.getElementById('idNumber').innerText = button.getAttribute('data-idNumber');
        document.getElementById('emergencyContactName').innerText = button.getAttribute('data-contactFullName');
        document.getElementById('emergencyContactNumber').innerText = button.getAttribute('data-contactPhone');

        if (isResident === "true") {
            document.getElementById('address').innerText = button.getAttribute('data-address');
            document.getElementById('emergencyContactAddress').innerText = button.getAttribute('data-contactAddress');
        } else {
            document.getElementById('address').innerText = button.getAttribute('data-addressNotResident');
            document.getElementById('emergencyContactAddress').innerText = button.getAttribute('data-contactAddressNotResident');
        }

        const pictureElement = document.getElementById('residentPicture');
        const image = button.getAttribute('data-picture');
        if (pictureElement) {
            const picturePath = `/uploads/residents-img/${image}`;
            pictureElement.src = picturePath;
        } else {
            console.error('Image element not found');
        }

        const currentYear = new Date().getFullYear();
        const lastDayOfYear = new Date(currentYear, 11, 31);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = lastDayOfYear.toLocaleDateString(undefined, options);
        document.getElementById('IDvalidation').textContent = formattedDate + ".";

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