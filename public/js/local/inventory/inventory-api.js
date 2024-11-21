document.addEventListener("DOMContentLoaded", async function () {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const urlParams = new URLSearchParams(window.location.search);
    const searchInput = document.getElementById('searchInput');
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10;

    fetchInventory(page, limit);

    // Listen for changes to search input
    searchInput.addEventListener('input', () => {
        const selectedValue = document.querySelector('.inventory-dropdown').value.trim();
        const isFunctional = selectedValue === 'functional';
        const searchQuery = searchInput.value.trim();

        fetchInventory(page, limit, searchQuery, isFunctional);
    });

    document.querySelector('.inventory-dropdown').addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const searchQuery = searchInput.value.trim();
        const isFunctional = selectedValue === 'functional';

        if (selectedValue === "functional") {
            fetchInventory(page, limit, searchQuery, true);
        }
        else if (selectedValue === "non-functional") {
            fetchInventory(page, limit, searchQuery, false);
        }
    });


    // Fetch inventory based on parameters
    async function fetchInventory(page = 1, limit = 10, searchQuery = '', isFunctional = true) {
        try {

            const response = await fetch(
                `http://localhost:3000/inventory/dashboard?ajax=true&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&isFunctional=${isFunctional}`
            );


            if (!response.ok) {
                throw new Error("Failed to fetch inventory data");
            }

            const data = await response.json();
            const inventory = data.getInventoryList;

            inventoryTableBody.innerHTML = '';

            if (inventory.length === 0) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = `
                    <td colspan="5" class="text-center">No ${isFunctional ? 'non-functional' : 'functional'} items found.</td>
                `;
                inventoryTableBody.appendChild(noDataRow);
                return;
            }

            inventory.forEach(invent => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${invent.inventory_name || 'N/A'}</td>
                    <td>${invent.quantity}</td>
                    <td>${new Date(invent.dateadded).toLocaleDateString()}</td>
                    <td>${invent.iprice}</td>
                     <td class="menu-row">
                        <img class="dot" src="../icon/triple-dot.svg" alt="...">
                        <div class="triple-dot">
                            <div class="menu">
                                <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                                <button id="update-id" onclick="popUp_three_dot(this)">Update</button>
                            </div>
                        </div>
                    </td>
                `;
                inventoryTableBody.appendChild(row);
            });
            attachDotEventListeners();
            updatePaginationLinks(data.currentPage, data.totalPages);
        } catch (error) {
            console.error("Error fetching inventory data: ", error);
            inventoryTableBody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
        }
    }


    // Update pagination links based on current and total pages
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
});

function attachDotEventListeners() {
    console.log("ebent attached");
    document.querySelectorAll(".dot").forEach(function (dot) {
        console.log(dot);
        dot.addEventListener("click", function () {
            console.log("dot clicked");
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
};