document.addEventListener("DOMContentLoaded", async function() {
    const archiveTableBody = document.getElementById('archiveTableBody');
    const urlParams = new URLSearchParams(window.location.search);
    const searchInput = document.getElementById('searchInput');
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10;

    fetchArchiveLists(page, limit);

    // Listen for changes to search input
    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.trim();

        fetchArchiveLists(page, limit, searchQuery);
    });
    
    // Fetch inventory based on parameters
    async function fetchArchiveLists(page = 1, limit = 10, searchQuery = '') {
        try {
            
            const response = await fetch(
                `http://localhost:3000/archive/dashboard?ajax=true&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`
            );
    
    
            if (!response.ok) {
                throw new Error("Failed to fetch archive data");
            }
    
            const data = await response.json();
            const archive = data.getArchiveList;
    
            archiveTableBody.innerHTML = '';
    
            if (archive.length === 0) {
                const noDataRow = document.createElement('tr');
                noDataRow.innerHTML = `
                    <td colspan="4" class="text-center">No items found.</td>
                `;
                archiveTableBody.appendChild(noDataRow);
                return;
            }
    
            archive.forEach(arch => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${arch.name}</td>
                    <td>${new Date(arch.date).toLocaleDateString()}</td>
                    <td>${arch.doctype}</td>
                    <td><button>image</button></td>
                `;
                archiveTableBody.appendChild(row);
            });
    
            updatePaginationLinks(data.currentPage, data.totalPages);
        } catch (error) {
            console.error("Error fetching inventory data: ", error);
            archiveTableBody.innerHTML = '<tr><td colspan="4">Error loading data</td></tr>';
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