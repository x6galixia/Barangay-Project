document.addEventListener("DOMContentLoaded", async function () {
    const residentsTableBody = document.getElementById('residentsTableBody');
    const urlParams = new URLSearchParams(window.location.search);
    const searchInput = document.getElementById('searchInput');
    const page = parseInt(urlParams.get('page')) || 1; // Ensure the page number is passed to fetchResidents
    const limit = parseInt(urlParams.get('limit')) || 10;
    const isResidentInput = document.getElementById('isResident');
    isResidentInput.value = "Resident";
    const type = urlParams.get('type');
    const dropdown = document.querySelector('.residents-dropdown');

    if (type && dropdown) {
        dropdown.value = type; 
    }
    // fetchResidents().then(attachDotEventListeners);


    // Function to update the URL parameters
    function updateURLParameter(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
        window.location.href = url;
    }

    function getURLParameter(key) {
        const url = new URL(window.location);
        return url.searchParams.get(key);
    }

    const selectedValue1 = getURLParameter('type') || 'Residents';
    const columnsToHide = ["REMARKS"];
    const headers = document.querySelectorAll('table thead th');
    const rows = document.querySelectorAll('table tbody tr');
    const searchQuery = document.getElementById('searchInput').value.trim();
    // updateURLParameter('type', selectedValue1);

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

    if (selectedValue1 === "Residents") {
        toggleColumns(true);
        fetchResidents(1, 10, searchQuery, false).then(attachDotEventListeners);
    } else if (selectedValue1 === "Non-residents") {
        toggleColumns(false);
        fetchResidents(1, 10, searchQuery, true).then(attachDotEventListeners);
    }

    // Event listener for the dropdown change
    document.querySelector('.residents-dropdown').addEventListener('change', function () {
        const selectedValue = this.value.trim();
        updateURLParameter('type', selectedValue);
    });

    // Event listener for the search input
    searchInput.addEventListener('input', () => {
        const urlParams = new URL(window.location).searchParams;
        const selectedValue = urlParams.get('type') || 'Residents'; // Default to 'residents'
        const isNonResident = selectedValue === 'Non-residents';
        const searchQuery = searchInput.value.trim();

        fetchResidents(1, 10, searchQuery, isNonResident).then(attachDotEventListeners);
    });


    async function fetchResidents(page = 1, limit = 10, searchQuery = '', isNonResident = false) {

        try {
            const response = await fetch(
                `/residents/dashboard?ajax=true&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&isNonResident=${isNonResident}`
                , {
                    method: 'GET', // Specify GET method (default is GET, but can be added explicitly)
                    headers: {
                        'Content-Type': 'application/json',  // Ensure content is treated as JSON
                        'Accept': 'application/json',        // Expect JSON response
                    },
                }
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
                    <td colspan="9" class="text-center">No ${isNonResident ? 'Non-residents' : 'Residents'} found.</td>
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
                                <button id="delete-id" data-type="${selectedValue1}" onclick="popUp_three_dot(this)">Delete</button>
                                <button id="update-id" onclick="popUp_three_dot(this)"
                                data-globalId="${resident.globalid}"
                                data-isResident="${resident.isresident}"
                                >Update</button>
                                <button id="generate-id" onclick="popUp_three_dot(this)"
                                data-fullname="${resident.fname} ${resident.mname ? resident.mname : ''} ${resident.lname}"
                                data-punongBarangay="${resident.punongbarangayfirstname.toUpperCase()} ${resident.punongbarangaymiddlename.toUpperCase() ? resident.punongbarangaymiddlename.toUpperCase() : ''} ${resident.punongbarangaylastname.toUpperCase()}"
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
            const prevPage = document.createElement('button');
            prevPage.textContent = 'Previous';
            prevPage.addEventListener('click', () => {
                fetchResidents(currentPage - 1, limit, searchInput.value.trim(), selectedValue1 === 'Non-residents').then(attachDotEventListeners);
            });
            paginationNav.appendChild(prevPage);
        }
    
        if (currentPage < totalPages) {
            const nextPage = document.createElement('button');
            nextPage.textContent = 'Next';
            nextPage.addEventListener('click', () => {
                fetchResidents(currentPage + 1, limit, searchInput.value.trim(), selectedValue1 === 'Non-residents').then(attachDotEventListeners);
            });
            paginationNav.appendChild(nextPage);
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
    if (resident.isoutofschoolyouth) remarks.push("Out of School Youth");
    if (resident.isskm) remarks.push("Samahan ng kababaihan");
    if (resident.iskm) remarks.push("Kababayin-an han Maypangdan");

    return remarks.length > 0 ? remarks.join(', ') : 'None';
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

window.popUp_three_dot = function (button) {
    const action = button.textContent.trim();
    const menu = button.closest('.menu');
    const residentID = menu.getAttribute('data-id');

    if (action === 'Delete' && residentID) {
        const deleteContainer = document.getElementById("delete-resident");
        const confirmDeleteButton = document.getElementById('confirm-delete');
        const cancelDeleteButton = document.getElementById('cancel-delete');
        const selectedType = button.getAttribute('data-type');
        deleteContainer.classList.add("visible");
        overlay.classList.toggle("visible");

        confirmDeleteButton.addEventListener('click', function () {
            deleteResident(residentID, selectedType);
            pop_up_Delete.classList.remove("visible");
            overlay.classList.remove("visible");
        })
        cancelDeleteButton.addEventListener('click', function () {
            pop_up_Delete.classList.remove("visible");
            overlay.classList.remove("visible");
        })
    }
    if (action === 'Update' && residentID) {
        const isResident = button.getAttribute('data-isResident');
        const updateContainer = document.getElementById("add-resident");

        if (document.querySelector('.residents-dropdown').value === "Residents") {
            residentFormField();
            document.querySelector('#add-resident .heading').innerText = "UPDATE RESIDENT";
            document.querySelector('#add-resident #submit_add_resident').innerText = "UPDATE";
            document.querySelector('#add-resident #formToAddResident').action = `/residents/dashboard/update-resident`;
        } else if (document.querySelector('.residents-dropdown').value === "Non-residents") {
            nonResidentFormField();
            document.querySelector('#add-resident .heading').innerText = "UPDATE NON-RESIDENT";
            document.querySelector('#add-resident #submit_add_resident').innerText = "UPDATE";
            document.querySelector('#add-resident #formToAddResident').action = `/residents/dashboard/update-non-resident`;
        }

        const globalIDForQR = button.getAttribute('data-globalId');
        updateContainer.classList.add("visible");
        overlay.classList.toggle("visible");

        fetch(`/residents/dashboard/resident/${residentID}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(residentData => {
                fillInputs(residentData);
            })
            .catch(error => {
                console.error('Error fetching residents data:', error);
                alert('Failed to fetch residents data. Please try again.');
            });

    }
    if (action === 'Generate ID' && residentID) {
        const id_card = document.getElementById("generate-ID");
        const globalIDForQR = button.getAttribute('data-globalId');
        const isResident = button.getAttribute('data-isResident');
        const container = document.getElementById('idContainer');
        const containerBack = document.getElementById('idBack');
        const highlighter = document.getElementById('boardersHighlighter');
        const identification = document.getElementById('identification');
        id_card.classList.add("visible");
        overlay.classList.toggle("visible");

        document.getElementById('fullname').innerText = button.getAttribute('data-fullname');
        document.getElementById('IDcivilStatus').innerText = button.getAttribute('data-civil_status');
        document.getElementById('IDbirthdate').innerText = button.getAttribute('data-birthdate');
        document.getElementById('idNumber').innerText = button.getAttribute('data-idNumber');
        document.getElementById('emergencyContactName').innerText = button.getAttribute('data-contactFullName');
        document.getElementById('IDemergencyContactNumber').innerText = button.getAttribute('data-contactPhone');
        document.getElementById('punongBarangay').innerText = button.getAttribute('data-punongBarangay');

        if (isResident === "true") {
            highlighter.innerHTML = "";
            identification.innerText = "resident";
            container.className = 'id-container';
            containerBack.className = 'id-back';
            document.querySelector(".id-img").style.marginTop = "22px";
            document.getElementById('address').innerText = button.getAttribute('data-address');
            document.getElementById('emergencyContactAddress').innerText = button.getAttribute('data-contactAddress');
        } else {
            highlighter.innerHTML = "Resident Boarders";
            identification.innerText = "resident boarders";
            container.className = 'id-containers';
            containerBack.className = 'id-backs';
            document.querySelector(".id-img").style.marginTop = "0px";
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
    }

    function encryptData(data, secretKey) {
        return CryptoJS.AES.encrypt(data, secretKey).toString();
    }

    // Decrypt function
    function decryptData(cipherText, secretKey) {
        const bytes = CryptoJS.AES.decrypt(cipherText, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    function deleteResident(residentId, dataType) {
        fetch(`/residents/delete-residents/${residentId}/${dataType}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (response.ok) {
                    fetchResidents(1, 10, searchQuery, true).then(attachDotEventListeners);
                    location.reload();
                }
                fetchResidents(1, 10, searchQuery, true).then(attachDotEventListeners);
                location.reload();
            })
            .catch(error => {
                console.error('Error deleting residents:', error);
                location.reload();
            });
    }
};

const addResident = document.getElementById("add-resident");
function popUp_button(button) {
    var buttonId = button.id;
    if (buttonId === "add-resident-button") {
        addResident.classList.toggle("visible");
        overlay.classList.add("visible");
        if (document.querySelector('.residents-dropdown').value === "Residents") {
            residentFormField();
        } else if (document.querySelector('.residents-dropdown').value === "Non-residents") {
            nonResidentFormField();
        }
    }
}

document.querySelectorAll(".close_popUp_for_resident").forEach(function (closeBtn) {
    closeBtn.addEventListener("click", function () {
        var pop_up = closeBtn.closest(".pop-up");
        if (pop_up) {
            if (document.querySelector('.residents-dropdown').value === "Residents") {
                residentFormField();
                clearFillInputs();
            } else if (document.querySelector('.residents-dropdown').value === "Non-residents") {
                nonResidentFormField();
                clearFillInputs();
            }
            pop_up.classList.remove("visible");
            overlay.classList.remove("visible");
        }
    });
});

function clearDynamicFields() {
    const purok = document.getElementById('purok');
    const street = document.getElementById('street');
    if (purok) purok.remove();
    if (street) street.remove();

    const emergencyPurok = document.getElementById('emergencyPurok');
    const emergencyStreet = document.getElementById('emergencyStreet');
    if (emergencyPurok) emergencyPurok.remove();
    if (emergencyStreet) emergencyStreet.remove();
}

function residentFormField() {
    clearDynamicFields();
    const isResidentInput = document.getElementById('isResident');
    const residentClassificationSection = document.getElementById('residentClassification');
    const sectorsDropdown = document.getElementById('sectors-dropdown');
    const addressWhileStudying = document.getElementById('addressWhileStudying');
    const addressWhileStudyingInputs = document.querySelectorAll('#addressWhileStudying input, #addressWhileStudying select');
    const addressSection = document.getElementById('address-section');
    const emergencyAddress = document.getElementById('emergencyContactInfo');

    document.querySelector('#add-resident .heading').innerText = "ADD RESIDENT";
    document.querySelector('#add-resident #submit_add_resident').innerText = "SUBMIT";
    document.querySelector('#add-resident #formToAddResident').action = "/residents/dashboard/add-resident";

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
            <option value="10">Entrepreneur</option>
            <option value="11">Unemployed</option>
            <option value="12">None</option>
        `;
    // address
    addressSection.insertAdjacentHTML('afterbegin', `
            <div class="inputWithLabel" id="purok">
                <label for="">Purok</label>
                <select name="purok" aria-label="Purok" id="purokIn">
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
                <input type="text" aria-label="Street" name="street" id="streetIn" required>
            </div>
        `);
    //emergency address
    emergencyAddress.insertAdjacentHTML('afterbegin', `
            <div class="inputWithLabel" id="emergencyPurok">
                <label for="">Purok</label>
                <select name="emergencyPurok" id="emergencyPurokIn" aria-label="Purok">
                    <option value="Seguidila">Seguidila</option>
                    <option value="Sitaw">Sitaw</option>
                    <option value="Talbos">Talbos</option>
                    <option value="Petchay">Petchay</option>
                    <option value="Ampalaya">Ampalaya</option>
                    <option value="Mustaza">Mustaza</option>
                    <option value="Kalabasa">Kalabasa</option>
                </select>
            </div>
            <div class="inputWithLabel" id="emergencyStreet">
                <label>Street</label>
                <input type="text" aria-label="Street" name="emergencyStreet" id="emergencyStreetIn" required>
            </div>
        `);
    addressWhileStudyingInputs.forEach(input => input.disabled = true);

    if (addressWhileStudying) addressWhileStudying.style.display = "none";
    if (residentClassificationSection) {
        residentClassificationSection.style.display = 'block';
    }


}
function nonResidentFormField() {
    clearDynamicFields();
    const isResidentInput = document.getElementById('isResident');
    const residentClassificationSection = document.getElementById('residentClassification');
    const sectorsDropdown = document.getElementById('sectors-dropdown');
    const addressWhileStudying = document.getElementById('addressWhileStudying');
    const addressWhileStudyingInputs = document.querySelectorAll('#addressWhileStudying input, #addressWhileStudying select');

    document.querySelector('#add-resident .heading').innerText = "ADD NON-RESIDENT";
    document.querySelector('#add-resident #submit_add_resident').innerText = "SUBMIT";
    document.querySelector('#add-resident #formToAddResident').action = "/residents/dashboard/add-non-resident";

    document.getElementById('barangay').value = "";
    document.getElementById('city').value = "";
    document.getElementById('province').value = "";
    document.getElementById('residentPageTitle').innerText = "LIST OF NON-RESIDENT";
    sectorsDropdown.innerHTML = `
            <option value="13">Resident Boarders</option>
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

    addressWhileStudying.style.display = "block";
    if (residentClassificationSection) {
        residentClassificationSection.style.display = 'none';
    }
}

//fill inputs function

function fillSector(data) {
    switch (data.rclassificationname) {
        case "Government employee":
            return "1";
        case "Private employee":
            return "2";
        case "Carpenters":
            return "3";
        case "Farmers":
            return "4";
        case "Fisherman":
            return "5";
        case "Business entrepreneurs":
            return "6";
        case "Drivers":
            return "7";
        case "OFW":
            return "8";
        case "Kasambahay":
            return "9";
        case "Boarders":
            return "13";
        case "Entrepreneur":
            return "11";
        case "None":
            return "12";
        default:
            return "0";
    }
}

function fillInputs(data) {
    clearFillInputs();
    console.log(data);
    const elements = {
        globalId: data.globalid,
        isResident: data.isresident ? "resident" : "non-resident",
        last_name: data.lname,
        first_name: data.fname,
        middle_name: data.mname,
        gender: data.gender,
        birthdate: data.birthdate ? data.birthdate.split('T')[0] : '',
        age: data.age,
        educAttainment: data.eattainment,
        occupation: data.occupation,
        "sectors-dropdown": fillSector(data),
        placeOfBirth: data.birthplace,
        grossIncome: data.income,
        civilStatus: data.civilstatus,
        senior: data.issenior ? "true" : "false",
        isPaid: data.isPaid ? "true" : "false",
        soloParent: data.issoloparent ? "true" : "false",
        pwd: data.ispwd ? "true" : "false",
        youth: data.isyouth ? "true" : "false",
        is4ps: data.is4ps ? "true" : "false",
        isOutOfSchoolYouth: data.isoutofschoolyouth ? "true" : "false",
        isSkm: data.isskm ? "true" : "false",
        isKm: data.iskm ? "true" : "false",
        purokIn: data.purok,
        streetIn: data.street,
        barangay: data.barangay,
        city: data.city,
        province: data.province,
        purok1: data.originalpurok,
        street1: data.originalstreet,
        barangay1: data.originalbarangay,
        city1: data.originalcity,
        province1: data.originalprovince,
        boardingHouse: data.boardinghousename,
        landlord: data.landlord,
        emergencyLastName: data.emergencylastname,
        emergencyFirstName: data.emergencyfirstname,
        emergencyMiddleName: data.emergencymiddlename,
        emergencyContactNumber: data.emergencycontactnumber,
        emergencyPurokIn: data.emergencypurok,
        emergencyStreetIn: data.emergencystreet,
        emergencyBarangay: data.emergencybarangay,
        emergencyCity: data.emergencycity,
        emergencyProvince: data.emergencyprovince,
    };

    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = elements[id] || '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });

    // Handle isPaid dropdown
    const isPaidDropdown = document.getElementById('isPaid');
    if (isPaidDropdown) {
        const isPaidValue = data.isPaid ? "false" : "true"; // Assuming data.isPaid is a boolean
        isPaidDropdown.value = isPaidValue; // Set the selected option
    } else {
        console.warn('isPaid dropdown not found');
    }

    const pictureElement = document.getElementById('fileInput');
    const preview = document.getElementById("imagePreview");
    if (pictureElement) {
        pictureElement.src = data.picture ? `/uploads/residents-img/${data.picture}` : '';
        preview.innerHTML = `<img src="/uploads/residents-img/${data.picture}" alt="Uploaded Image">`;
    } else {
        console.error('Image element not found or is not an IMG tag');
    }
}

function clearFillInputs() {
    const elements = {
        "last_name": '',
        "first_name": '',
        "middle_name": '',
        "gender": '',
        "birthdate": '',
        "age": '',
        "educAttainment": '',
        "occupation": '',
        "placeOfBirth": '',
        "grossIncome": '',
        "civilStatus": '',
        "senior": '',
        "soloParent": '',
        "pwd": '',
        "youth": '',
        "is4ps": '',
        "isOutOfSchoolYouth": '',
        "isSkm": '',
        "isKm": '',
        "barangay": '',
        "city": '',
        "province": '',
        "emergencyLastName": '',
        "emergencyFirstName": '',
        "emergencyMiddleName": '',
        "emergencyContactNumber": '',
        "emergencyBarangay": '',
        "emergencyCity": '',
        "emergencyProvince": '',
    };

    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = elements[id] || '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });

    // Handle isPaid dropdown
    const isPaidDropdown = document.getElementById('isPaid');
    if (isPaidDropdown) {
        isPaidDropdown.value = ''; // Reset to default or empty value
    } else {
        console.warn('isPaid dropdown not found');
    }

    const optionalElements = [
        'purokIn',
        'streetIn',
        'emergencyPurokIn',
        'EmergencyStreetIn',
        'purok1',
        'street1',
        'barangay1',
        'city1',
        'province1',
        'boardingHouse',
        'landlord'
    ];

    optionalElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });

    const pictureElement = document.getElementById('fileInput');
    const preview = document.getElementById("imagePreview");
    if (pictureElement) {
        pictureElement.src = '';
        preview.innerHTML = `<p>No Image Uploaded</p>`;
    } else {
        console.error('Image element not found or is not an IMG tag');
    }
}

document.getElementById('birthdate').addEventListener('input', function () {
    const birthdate = new Date(this.value);
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();


    const monthDiff = today.getMonth() - birthdate.getMonth();
    const dayDiff = today.getDate() - birthdate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    document.getElementById('age').value = age;
});