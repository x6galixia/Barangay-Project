document.addEventListener("DOMContentLoaded", async function() {
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
                    <td><button>Action</button></td>
                `;
                inventoryTableBody.appendChild(row);
            });
    
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