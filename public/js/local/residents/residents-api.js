//residents-api.js
document.addEventListener("DOMContentLoaded", async function () {
    const residentsTableBody = document.getElementById('residentsTableBody');
    const page = 1;  // You can manage pagination or keep it fixed for now
    const limit = 10; // Number of records per page

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
                <td>${resident.fName} ${resident.mName ? resident.mName : ''} ${resident.lName}</td>
                <td>${new Date(resident.birthDate).toLocaleDateString()}</td>
                <td>${resident.age}</td>
                <td>${resident.gender}</td>
                <td>${resident.eattainment || 'N/A'}</td>
                <td>${resident.occupation || 'N/A'}</td>
                <td>${resident.houseclassification || 'N/A'}</td>
                <td>${resident.isWithCr ? 'Yes' : 'No'}</td>
                <td>${resident.watersource || 'N/A'}</td>
                <td>${resident.isEnergized ? 'Yes' : 'No'}</td>
                <td>${resident.isWith40mZone ? 'Yes' : 'No'}</td>
                <td>${generateRemarks(resident)}</td>
            `;

            residentsTableBody.appendChild(row);
            console.log(data);
        });

    } catch (error) {
        console.error("Error fetching residents data: ", error);
        residentsTableBody.innerHTML = '<tr><td colspan="12">Error loading data</td></tr>';
    }
});

// Helper function to generate remarks based on resident data
function generateRemarks(resident) {
    const remarks = [];
    if (resident.isPwd) remarks.push("PWD");
    if (resident.isSoloParent) remarks.push("Solo Parent");
    if (resident.isYouth) remarks.push("Youth");
    if (resident.is4ps) remarks.push("4Ps Member");
    
    return remarks.length > 0 ? remarks.join(', ') : 'N/A';
}