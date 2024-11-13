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

            row.innerHTML = `
                <td>${resident.fname} ${resident.mname ? resident.mname : ''} ${resident.lname}</td>
                <td>${new Date(resident.birthdate).toLocaleDateString()}</td>
                <td>${resident.age}</td>
                <td>${resident.gender}</td>
                <td>${resident.eattainment || 'N/A'}</td>
                <td>${resident.occupation || 'N/A'}</td>
                <td>${resident.houseclassification || 'N/A'}</td>
                <td>${resident.isWithCr ? 'Yes' : 'No'}</td>
                <td>${resident.watersource || 'N/A'}</td>
                <td>${resident.isenergized ? 'Yes' : 'No'}</td>
                <td>${resident.iswith40mzone ? 'Yes' : 'No'}</td>
                <td>${generateRemarks(resident)}</td>
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