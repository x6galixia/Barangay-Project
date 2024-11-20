document.addEventListener("DOMContentLoaded", async function() {

    async function fetchInventory(page = 1, limit = 10, searchQuery = '', isFunctional = false) {
        try {
            const response = await fetch(`
                /inventory/dashboard?ajax=true&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&isFunctional=${isFunctional}
                `);
                if (!response.ok) {
                    throw new Error("Failed to fetch inventory data");
                }

                const data = await response.json();
                const inventory = data.getInventoryList;

                inventoryTableBody.innerHTML = '';

                if (inventory.length === 0) {
                    const noDataRow = document.createElement('tr');
                    noDataRow.innerHTML = `
                        <td colspan="5" class="text-center">No ${isFunctional ? 'not-Functional' : 'Functional'} found.</td>
                    `;
                    inventoryTableBody.appendChild(noDataRow);
                    return;
                }

                inventory.forEach(invent => {
                    const row = document.createElement('tr');
    
                    row.innerHTML = `
                        <td>${invent.inventory_name || 'N/A'}</td>
                        <td>${invent.quantity} </td>
                        <td>${new Date(invent.dateAdded).toLocaleDateString()}</td>
                        <td>${invent.iprice}</td>
                        <td><button>aysapepe</button></button></td>
                    `;
    
                    inventoryTableBody.appendChild(row);
                });

                updatePaginationLinks(data.currentPage, data.totalPages);
        } catch (error) {
            console.error("Error fetching inventory data: ", error);
            inventoryTableBody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
        }

    }

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