
document.addEventListener("DOMContentLoaded", async function () {
    const archiveTableBody = document.getElementById('archiveTableBody');
    const urlParams = new URLSearchParams(window.location.search);
    const searchInput = document.getElementById('searchInput');
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10;

    fetchArchiveLists(page, limit);
    docChanges();
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
            console.log(data);
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
                    <td><button
                    data-image="${arch.img}"
                    data-docType="${arch.doctype}"
                    onclick="viewImage(this)">image</button></td>
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

function docChanges() {
    document.getElementById("docType").addEventListener('change', function () {
        const selectedValue = this.value.trim();
        const formContainer = document.getElementById('archiveInputContainer');
        if (selectedValue === "Panumduman") {
            formContainer.innerHTML = `
            <div class="inputWithLabel" id="surubadan">
                <label>Contracting Parties 1</label>
                <input type="text" aria-label="Contracting Parties 1" name="parties1" required>
            </div>
            <div class="inputWithLabel" id="surubadan">
                <label>Contracting Parties 2</label>
                <input type="text" aria-label="Contracting Parties 2" name="parties2" required>
            </div>
            <div class="inputWithLabel">
                <label>Date</label>
                <input type="date" aria-label="Date" name="date" required>
            </div>
            `
        }
    })
}

window.viewImage = function (button) {
    const image = button.getAttribute('data-image');
    const docType = button.getAttribute('data-docType');

    document.querySelector(".overlay").classList.toggle("visible");
    document.querySelector("#view-document").classList.toggle("visible");
    document.getElementById("docHeading").innerText = docType;

    const pictureElement = document.getElementById('imageTo');
    if (pictureElement) {
        const picturePath = `/uploads/archive-img/${image}`;
        pictureElement.src = picturePath;
    } else {
        console.error('Image element not found');
    }
};