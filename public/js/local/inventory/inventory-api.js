document.addEventListener("DOMContentLoaded", async function () {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const urlParams = new URLSearchParams(window.location.search);
    const searchInput = document.getElementById('searchInput');
    const type = urlParams.get('type');
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10;
    const dropdown = document.querySelector('#inventory-dropdown');
    if (type && dropdown) {
        dropdown.value = type;
    }

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

    const selectedValue1 = getURLParameter('type') || 'functional';
    const searchQuery = document.getElementById('searchInput').value.trim();

    if (selectedValue1 === "functional") {
        fetchInventory(page, limit, searchQuery, true);
    }
    else if (selectedValue1 === "non-functional") {
        fetchInventory(page, limit, searchQuery, false);
    }

    // Event listener for the dropdown change
    dropdown.addEventListener('change', function () {
        const selectedValue = this.value.trim();
        updateURLParameter('type', selectedValue);
    });


    // Listen for changes to search input
    searchInput.addEventListener('input', () => {
        const selectedValue = document.querySelector('.inventory-dropdown').value.trim();
        const isFunctional = selectedValue === 'functional';
        const searchQuery = searchInput.value.trim();

        fetchInventory(page, limit, searchQuery, isFunctional);
    });



    // Fetch inventory based on parameters
    async function fetchInventory(page = 1, limit = 10, searchQuery = '', isFunctional = true) {
        try {

            const response = await fetch(
                `http://localhost:3000/inventory/dashboard?ajax=true&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&isFunctional=${isFunctional}`
                , {
                    method: 'GET', // Specify GET method (default is GET, but can be added explicitly)
                    headers: {
                        'Content-Type': 'application/json',  // Ensure content is treated as JSON
                        'Accept': 'application/json',        // Expect JSON response
                    },
                }
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
                    <td colspan="5" class="text-center">No ${isFunctional ? 'functional' : 'non-functional'} items found.</td>
                `;
                inventoryTableBody.appendChild(noDataRow);
                return;
            }

            inventory.forEach(invent => {
                const row = document.createElement('tr');
                const date = new Date(invent.dateadded);
                const formattedDate = `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;
                row.innerHTML = `
                    <td>${invent.inventory_name || 'N/A'}</td>
                    <td>${invent.quantity}</td>
                    <td>${formattedDate}</td>
                    <td>${invent.iprice}</td>
                     <td class="menu-row">
                        <img class="dot" src="../icon/triple-dot.svg" alt="...">
                        <div class="triple-dot">
                            <div class="menu" data-id="${invent.inventory_id}">
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
    const inventoryID = menu.getAttribute('data-id');

    if (action === 'Delete' && inventoryID) {

        const confirmDeleteButton = document.getElementById('confirm-delete');
        const cancelDeleteButton = document.getElementById('cancel-delete');
        const pop_up_Delete = document.getElementById('delete-inventory');

        pop_up_Delete.classList.add("visible");
        overlay.classList.add("visible");

        confirmDeleteButton.addEventListener('click', function () {
            deleteItem(inventoryID);
            pop_up_Delete.classList.remove("visible");
            overlay.classList.remove("visible");
        })
        cancelDeleteButton.addEventListener('click', function () {
            pop_up_Delete.classList.remove("visible");
            overlay.classList.remove("visible");
        })
    }
    if (action === 'Update' && inventoryID) {
        const updateContainer = document.getElementById("add-inventory");
        document.querySelector('#add-inventory .heading').innerText = "UPDATE ITEM";
        document.querySelector('#add-inventory #submit_add_inbentory').innerText = "UPDATE";
        document.querySelector('#add-inventory form').action = `/inventory/dashboard/update-item`;
        updateContainer.classList.add("visible");
        overlay.classList.toggle("visible");

        fetch(`/inventory/dashboard/item/${inventoryID}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(itemData => {
                fillInputs(itemData);
            })
            .catch(error => {
                console.error('Error fetching residents data:', error);
                alert('Failed to fetch residents data. Please try again.');
            });
    }


};

const addInventory = document.getElementById("add-inventory");
function popUp_button(button) {
    var buttonId = button.id;
    if (buttonId === "add-inventory-button") {
        document.querySelector('#add-inventory form').action = `/inventory/dashboard/add-item`;
        document.querySelector('#add-inventory .heading').innerText = "ADD ITEM";
        document.querySelector('#add-inventory #submit_add_inbentory').innerText = "SUBMIT";
        addInventory.classList.toggle("visible");
        overlay.classList.add("visible");
    }
}

function deleteItem(inventoryID) {
    console.log("delete triggered");

    try {
        const response = fetch(`/inventory/delete-item/${inventoryID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            fetchInventory(page, limit, searchQuery, isFunctional);
            attachDotEventListeners();
            location.reload();
        } else {
            console.error("Error: Failed to delete the item.");
            location.reload();
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

function fillInputs(data) {
    clearFillInputs();
    console.log('Data passed to fillInputs:', data);

    const elements = {
        itemId: data.id,
        iName: data.iname,
        categoryName: data.categoryname,
        isFunctional: data.isfunctional ? "true" : "false",
        dateAdded: data.dateadded ? data.dateadded.split('T')[0] : '',
        quantity: data.quantity,
        iPrice: data.iprice
    };

    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = elements[id] || '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });
}

function clearFillInputs() {
    const elements = {
        itemId,
        iName,
        categoryName,
        isFunctional,
        dateAdded,
        quantity,
        iPrice
    };

    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });
}
