//residents-api.js
document.addEventListener("DOMContentLoaded", async function () {
    const residentsTableBody = document.getElementById('residentsTableBody');
    const page = 1;  // You can manage pagination or keep it fixed for now
    const limit = 10; // Number of records per page
    const overlay = document.getElementById("overlay");

    try {
        // Fetch the residents list using the fetch API
        const response = await fetch(`/residents/dashboard?ajax=true`);
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
                        data-civil_status="${resident.civil_status}"
                        data-birthdate="${new Date(resident.birthdate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}"
                        data-address="Purok ${resident.purok}, ${resident.barangay}, ${resident.city}"
                        >Generate ID</button>
                    </div>
                </div>
            </td>
            `;

            residentsTableBody.appendChild(row);
            console.log(data);
        });

    } catch (error) {
        console.error("Error fetching residents data: ", error);
        residentsTableBody.innerHTML = '<tr><td colspan="12">Error loading data</td></tr>';
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
                    clearInterval(pollIntervalId);
                    isDotMenuOpen = true;
                } else {
                    pollIntervalId = setInterval(fetchBeneficiaryUpdates, POLL_INTERVAL);
                    isDotMenuOpen = false;
                }
            }
        });

        document.addEventListener("click", function (event) {
            // Check if the click was outside the dot container
            if (!dot.contains(event.target)) {
                const tripleDotContainer = dot.closest("td").querySelector(".triple-dot");
                if (tripleDotContainer && tripleDotContainer.classList.contains("visible")) {
                    tripleDotContainer.classList.remove("visible");
                    pollIntervalId = setInterval(fetchBeneficiaryUpdates, POLL_INTERVAL);
                    isDotMenuOpen = false;
                }
            }
        });
    });

}

// const update_beneficiary = document.getElementById("update-beneficiary");
// const overlay = document.querySelector(".overlay");

window.popUp_three_dot = function (button) {
    const action = button.textContent.trim();
    const residentID = button.closest('.triple-dot').querySelector('.menu').getAttribute('data-id');

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
        id_card.classList.add("visible");
        overlay.classList.toggle("visible");

        document.getElementById('fullname').innerText = document.getElementById("generate-id").getAttribute('data-fullname');
        document.getElementById('civilStatus').innerText = document.getElementById("generate-id").getAttribute('data-civil_status');
        document.getElementById('birthdate').innerText = document.getElementById("generate-id").getAttribute('data-birthdate');
        document.getElementById('address').innerText = document.getElementById("generate-id").getAttribute('data-address');
        document.getElementById('idNumber').innerText = document.getElementById("generate-id").getAttribute('data-idNumber');

        // fetch(`/pharmacy-records/beneficiary/${beneficiaryId}`)
        //     .then(response => {
        //         if (!response.ok) throw new Error('Network response was not ok');
        //         return response.json();
        //     })
        //     .then(beneficiaryData => {
        //         console.log(beneficiaryData.beneficiary_id);
        //         var full_name = beneficiaryData.last_name + ", " + beneficiaryData.first_name + " " + beneficiaryData.middle_name;
        //         var address = beneficiaryData.street + " " + beneficiaryData.barangay + " " + beneficiaryData.city + " " + beneficiaryData.province;
        //         var status;
        //         var phone;

        //         if (!beneficiaryData.phone || isNaN(beneficiaryData.phone) || beneficiaryData.phone.length < 11) {
        //             phone = "None";
        //         } else {
        //             phone = beneficiaryData.phone;
        //         }

        //         if (beneficiaryData.senior_citizen === "Yes") {
        //             status = "Senior Citizen";
        //         } else if (beneficiaryData.pwd === "Yes") {
        //             status = "PWD";
        //         } else {
        //             status = "";
        //         }

        //         document.getElementById("beneficiary-name").innerText = full_name;
        //         document.getElementById("beneficiary-status").innerText = status;
        //         document.getElementById("beneficiary-address").innerText = address;
        //         document.getElementById("beneficiary-phone").innerText = phone;


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


        //         async function generateQRCode() {
        //             const json = `${beneficiaryData.beneficiary_id}`;

        //             const secretKey = "KimGalicia"; // Use a strong secret key for encryption
        //             const encryptedData = encryptData(json, secretKey); // Encrypt the JSON data
        //             console.log("Encrypted Data:", encryptedData);

        //             // Now proceed with the QR code generation
        //             const qr = qrcode(0, 'L');
        //             qr.addData(encryptedData); // Add encrypted data to QR code
        //             qr.make();

        //             const size = 4;
        //             document.getElementById('qrcode').innerHTML = qr.createImgTag(size, size);
        //             const decryptedData = decryptData(encryptedData, secretKey);

        //             // Log the decrypted data to the console
        //             console.log("Decrypted Data:", decryptedData);
        //         }

        //         generateQRCode();

        //     })
        //     .catch(error => {
        //         console.error('Error fetching beneficiary data:', error);
        //         alert('Failed to fetch beneficiary data. Please try again.');
        //     });
    }
};