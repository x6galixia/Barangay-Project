
document.addEventListener("DOMContentLoaded", async function () {
    const archiveTableBody = document.getElementById('archiveTableBody');
    const urlParams = new URLSearchParams(window.location.search);
    const searchInput = document.getElementById('searchInput');
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10;
    const type = urlParams.get('type');
    const dropdown = document.querySelector('#documentType');
    if (type && dropdown) {
        dropdown.value = type; 
    }
    // fetchArchiveLists().then(attachDotEventListeners);
    docChanges();

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

    const selectedValue1 = getURLParameter('type') || 'Lupon';
    const searchQuery = document.getElementById('searchInput').value.trim();

    if (selectedValue1 === "Lupon") {
        console.log("1 selected");
        // toggleColumns(true);
        fetchArchiveLists(1, 10, searchQuery, selectedValue1).then(attachDotEventListeners);
    } else if (selectedValue1 === "Ordinance") {
        console.log("2 selected");
        // toggleColumns(false);
        fetchArchiveLists(1, 10, searchQuery, selectedValue1).then(attachDotEventListeners);
    } else if (selectedValue1 === "Panumduman") {
        console.log("3 selected");
        // toggleColumns(false);
        fetchArchiveLists(1, 10, searchQuery, selectedValue1).then(attachDotEventListeners);
    } else if (selectedValue1 === "Regularization Minutes") {
        console.log("4 selected");
        // toggleColumns(false);
        fetchArchiveLists(1, 10, searchQuery, selectedValue1).then(attachDotEventListeners);
    } else if (selectedValue1 === "Resolution") {
        console.log("5 selected");
        // toggleColumns(false);
        fetchArchiveLists(1, 10, searchQuery, selectedValue1).then(attachDotEventListeners);
    }

    // Event listener for the dropdown change
    document.querySelector('#documentType').addEventListener('change', function () {
        const selectedValue = this.value.trim();
        updateURLParameter('type', selectedValue);
    });

    function showColumnsForDoctype(doctype) {
        // Hide all columns except "Doctype" and "Action" by default
        document.querySelectorAll('th').forEach(th => {
            if (!['Doctype', 'Action'].includes(th.textContent.trim())) {
                th.style.display = 'none';
            }
        });
    
        document.querySelectorAll('td').forEach((td, index) => {
            const header = td.closest('table').querySelectorAll('th')[index];
            if (!['Doctype', 'Action'].includes(header?.textContent.trim())) {
                td.style.display = 'none';
            }
        });
    
        // Show columns based on the doctype
        let className = '';
        switch (doctype) {
            case 'Lupon':
                className = 'luponTableHead';
                break;
            case 'Ordinance':
                className = 'ordinanceTableHead';
                break;
            case 'Panumduman':
                className = 'panumdumanTableHead';
                break;
            case 'Regularization Minutes':
                className = 'regularizationTableHead';
                break;
            case 'Resolution':
                className = 'resolutionTableHead';
                break;
            default:
                console.error('Unknown doctype:', doctype);
                return;
        }
    
        // Show the selected columns
        document.querySelectorAll(`.${className}`).forEach(el => el.style.display = 'table-cell');
    
        // Ensure "Doctype" and "Action" columns remain visible
        document.querySelectorAll('th').forEach(th => {
            if (['Doctype', 'Action'].includes(th.textContent.trim())) {
                th.style.display = 'table-cell';
            }
        });
        document.querySelectorAll('td').forEach((td, index) => {
            const header = td.closest('table').querySelectorAll('th')[index];
            if (['Doctype', 'Action'].includes(header?.textContent.trim())) {
                td.style.display = 'table-cell';
            }
        });
    }
    


    // Listen for changes to search input
    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.trim();

        fetchArchiveLists(page, limit, searchQuery);
    });

    // Fetch inventory based on parameters
    async function fetchArchiveLists(page = 1, limit = 10, searchQuery = '', doctype = 'Lupon') {
        // alert("www");
        try {

            const response = await fetch(
                `http://localhost:3000/archive/dashboard?ajax=true&page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}&doctype=${doctype}`
            );


            if (!response.ok) {
                throw new Error("Failed to fetch archive data");
            }

            const data = await response.json();
            const archive = data.archiveList;
            console.log(archive);
            archiveTableBody.innerHTML = '';

            showColumnsForDoctype(doctype);

            if (doctype === 'Lupon'){
                archive.forEach(arch1 => {
                    if (arch1.length=== 0) {
                        const noDataRow = document.createElement('tr');
                        noDataRow.innerHTML = `
                            <td colspan="7" class="text-center">No ${doctype} Documents Found.</td>
                        `;
                        archiveTableBody.appendChild(noDataRow);
                        return;
                    }
                    arch1.documentdetails.forEach(detail => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${detail.caseNumber}</td>
                            <td>${detail.complainant}</td>
                            <td>${detail.respondent}</td>
                            <td>${new Date(detail.dateFiled).toLocaleDateString()}</td>
                            <td>${detail.caseType}</td>
                            <td>${arch1.typename}</td>
                            <td class="menu-row">
                                <img class="dot" src="../icon/triple-dot.svg" alt="">
                                <div class="triple-dot">
                                    <div class="menu" data-id="${detail.archID}">
                                        <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                                        <button id="update-id" onclick="popUp_three_dot(this)">Update</button>
                                        <button id="view-id" onclick="popUp_three_dot(this)"
                                         data-image="${detail.image}"
                                         data-docType="${arch1.typename}"
                                        >View Image</button>
                                    </div>
                                </div>
                            </td>
                        `;
                        archiveTableBody.appendChild(row);
                    })
                });
            }
            if (doctype === 'Ordinance'){
                archive.forEach(arch1 => {
                    if (arch1.length=== 0) {
                        const noDataRow = document.createElement('tr');
                        noDataRow.innerHTML = `
                            <td colspan="8" class="text-center">No ${doctype} Documents Found.</td>
                        `;
                        archiveTableBody.appendChild(noDataRow);
                        return;
                    }

                    arch1.documentdetails.forEach(detail => {
                        const row = document.createElement('tr');
                        function formatStringNames(data, fallbackMessage) {
                            if (typeof data === 'string' && data.trim() !== '') {
                                return data
                                    .split(',') // Split the string into an array
                                    .map(name => name.trim()) // Remove extra spaces
                                    .join(', ')
                                    .replace(/, ([^,]*)$/, ' and $1'); // Replace last comma with "and"
                            }
                            return fallbackMessage;
                        }
                        const formattedCoAuthors = formatStringNames(detail.coAuthors, 'No co-authors available');
                        const formattedAuthors = formatStringNames(detail.authors, 'No Authors available');
                        const formattedSponsors = formatStringNames(detail.sponsors, 'No Sponsors available');
                        row.innerHTML = `
                            <td>${detail.ordinanceNumber}</td>
                            <td>${detail.title}</td>
                            <td>${formattedAuthors}</td>
                            <td>${formattedCoAuthors}</td>
                            <td>${formattedSponsors}</td>
                            <td>${new Date(detail.dateApproved).toLocaleDateString()}</td>
                            <td>${arch1.typename}</td>
                            <td class="menu-row">
                                <img class="dot" src="../icon/triple-dot.svg" alt="">
                                <div class="triple-dot">
                                    <div class="menu" data-id="${detail.archID}">
                                        <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                                        <button id="update-id" onclick="popUp_three_dot(this)">Update</button>
                                        <button id="view-id" onclick="popUp_three_dot(this)"
                                         data-image="${detail.image}"
                                         data-docType="${arch1.typename}"
                                        >View Image</button>
                                    </div>
                                </div>
                            </td>
                        `;
                        archiveTableBody.appendChild(row);
                    })
                });
            }
            if (doctype === 'Panumduman'){
                archive.forEach(arch => {
                    if (arch.length=== 0) {
                        const noDataRow = document.createElement('tr');
                        noDataRow.innerHTML = `
                            <td colspan="4" class="text-center">No ${doctype} Documents Found.</td>
                        `;
                        archiveTableBody.appendChild(noDataRow);
                        return;
                    }
                    arch.documentdetails.forEach(detail => {
                        const row = document.createElement('tr');
                        function formatStringNames(data, fallbackMessage) {
                            if (typeof data === 'string' && data.trim() !== '') {
                                return data
                                    .split(',') // Split the string into an array
                                    .map(name => name.trim()) // Remove extra spaces
                                    .join(', ')
                                    .replace(/, ([^,]*)$/, ' and $1'); // Replace last comma with "and"
                            }
                            return fallbackMessage;
                        }
                        const formattedContractingPerson = formatStringNames(detail.contractingPersons, 'No Contracting Persons available');
                        row.innerHTML = `
                            <td>${formattedContractingPerson}</td>
                            <td>${new Date(detail.date).toLocaleDateString()}</td>
                            <td>${arch.typename}</td>
                            <td class="menu-row">
                                <img class="dot" src="../icon/triple-dot.svg" alt="">
                                <div class="triple-dot">
                                    <div class="menu" data-id="${detail.archID}">
                                        <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                                        <button id="update-id" onclick="popUp_three_dot(this)">Update</button>
                                        <button id="view-id" onclick="popUp_three_dot(this)"
                                         data-image="${detail.image}"
                                         data-docType="${arch.typename}"
                                        >View Image</button>
                                    </div>
                                </div>
                            </td>
                        `;
                        archiveTableBody.appendChild(row);
                    })
                });
            }
            if (doctype === 'Regularization Minutes'){
                archive.forEach(arch1 => {
                    if (arch1.length=== 0) {
                        const noDataRow = document.createElement('tr');
                        noDataRow.innerHTML = `
                            <td colspan="4" class="text-center">No ${doctype} Documents Found.</td>
                        `;
                        archiveTableBody.appendChild(noDataRow);
                        return;
                    }
                    
                    arch1.documentdetails.forEach(detail => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${detail.regulationNumber}</td>
                            <td>${new Date(detail.date).toLocaleDateString()}</td>
                            <td>${arch1.typename}</td>
                            <td class="menu-row">
                                <img class="dot" src="../icon/triple-dot.svg" alt="">
                                <div class="triple-dot">
                                    <div class="menu" data-id="${detail.archID}">
                                        <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                                        <button id="update-id" onclick="popUp_three_dot(this)">Update</button>
                                        <button id="view-id" onclick="popUp_three_dot(this)"
                                         data-image="${detail.image}"
                                         data-docType="${arch1.typename}"
                                        >View Image</button>
                                    </div>
                                </div>
                            </td>
                        `;
                        archiveTableBody.appendChild(row);
                    })
                });
            }
            if (doctype === 'Resolution'){
                archive.forEach(arch1 => {
                    if (arch1.length=== 0) {
                        const noDataRow = document.createElement('tr');
                        noDataRow.innerHTML = `
                            <td colspan="5" class="text-center">No ${doctype} Documents Found.</td>
                        `;
                        archiveTableBody.appendChild(noDataRow);
                        return;
                    }
                    
                    arch1.documentdetails.forEach(detail => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${detail.resolutionNumber}</td>
                            <td>${detail.seriesYear}</td>
                            <td>${new Date(detail.date).toLocaleDateString()}</td>
                            <td>${arch1.typename}</td>
                            <td class="menu-row">
                                <img class="dot" src="../icon/triple-dot.svg" alt="">
                                <div class="triple-dot">
                                    <div class="menu" data-id="${detail.archID}">
                                        <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                                        <button id="update-id" onclick="popUp_three_dot(this)">Update</button>
                                        <button id="view-id" onclick="popUp_three_dot(this)"
                                         data-image="${detail.image}"
                                         data-docType="${arch1.typename}"
                                        >View Image</button>
                                    </div>
                                </div>
                            </td>
                        `;
                        archiveTableBody.appendChild(row);
                    })
                });
            }

            attachDotEventListeners();
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
                <input type="text" aria-label="Contracting Parties 1" id="parties1" name="parties1" required>
            </div>
            <div class="inputWithLabel" id="surubadan">
                <label>Contracting Parties 2</label>
                <input type="text" aria-label="Contracting Parties 2" id="parties2" name="parties2" required>
            </div>
            <div class="inputWithLabel">
                <label>Date</label>
                <input type="date" aria-label="Date" id="date" name="date" required>
            </div>
            `
        }
        if (selectedValue === "Lupon") {
            formContainer.innerHTML = `
            <div class="inputWithLabel" id="surubadan">
                <label>Lupon Case Number</label>
                <input type="number" aria-label="Lupon Case Number" name="luponCaseNumber" required>
            </div>
            <div class="inputWithLabel" id="surubadan">
                <label>Complainant</label>
                <input type="text" aria-label="Complainant" name="complainant" required>
            </div>
            <div class="inputWithLabel" id="surubadan">
                <label>Respondent</label>
                <input type="text" aria-label="Respondent" name="respondent" required>
            </div>
            <div class="inputWithLabel">
                <label>Date Filed</label>
                <input type="date" aria-label="Date Filed" name="dateFiled" required>
            </div>
            <div class="inputWithLabel">
                <label>Type Of Case</label>
                <input type="text" aria-label="Date Filed" name="caseType" required>
            </div>
            `
        }
        if (selectedValue === "Ordinance") {
            formContainer.innerHTML = `
            <div class="inputWithLabel" id="surubadan">
                <label>Ordinance Number</label>
                <input type="number" aria-label="Ordinance Number" id="ordinanceNumber" name="ordinanceNumber" required>
            </div>
            <div class="inputWithLabel" id="surubadan">
                <label>Ordinance Title</label>
                <input type="text" aria-label="Ordinance Title" id="ordinanceTitle" name="ordinanceTitle" required>
            </div>
            <div class="inputWithLabel" id="authorContainer" style="margin-top:4px">
            </div>
            <div class="inputWithLabel" id="co-AuthorContainer" style="margin-top:4px">
            </div>
            <div class="inputWithLabel" id="sponsorContainer" style="margin-top:4px">
            </div>
            <div class="inputWithLabel">
                <label>Date Approved</label>
                <input type="date" aria-label="Date Approved" id="date" name="dateApproved" required>
            </div>
            `
        }
        if (selectedValue === "Resolution") {
            formContainer.innerHTML = `
            <div class="inputWithLabel" id="surubadan">
                <label>Resolution Number</label>
                <input type="number" aria-label="Resolution Number" id="resolutionNumber" name="resolutionNumber" required>
            </div>
            <div class="inputWithLabel" id="surubadan">
                <label>Series of Year</label>
                <input type="text" aria-label="Series of Year" id="yearSeries" name="yearSeries" required>
            </div>
            <div class="inputWithLabel">
                <label>Date</label>
                <input type="date" aria-label="Date" id="date" name="date" required>
            </div>
            `
        }
        if (selectedValue === "Regularization Minutes") {
            formContainer.innerHTML = `
            <div class="inputWithLabel" id="surubadan">
                <label>Regulation Number (Ex. 1st)</label>
                <input type="text" aria-label="Ika Pira na Regulation" id="regulationNumber" name="regulationNumber" required>
            </div>
            <div class="inputWithLabel">
                <label>Date</label>
                <input type="date" aria-label="Date" id="date" name="date" required>
            </div>
            `
        }
        addTextarea();
        addTextarea1();
        addTextarea2();
    })
}

function attachDotEventListeners() {
    document.querySelectorAll(".dot").forEach(function (dot) {
        dot.addEventListener("click", function () {
            console.log("dot clicked");
            const tripleDotContainer = dot.closest("td").querySelector(".triple-dot");
                tripleDotContainer.classList.add("visible");
        });

        document.addEventListener("click", function (event) {
            if (!dot.contains(event.target)) {
                const tripleDotContainer = dot.closest("td").querySelector(".triple-dot");
                if (tripleDotContainer && tripleDotContainer.classList.contains("visible")) {
                    tripleDotContainer.classList.remove("visible");
                }
            }
        });
    });

}

window.popUp_three_dot = function (button) {
    const action = button.textContent.trim();
    const menu = button.closest('.menu');
    const archID = menu.getAttribute('data-id');

    if (action === 'Delete' && archID) {

        const confirmDeleteButton = document.getElementById('confirm-delete');
        const cancelDeleteButton = document.getElementById('cancel-delete');
        const pop_up_Delete = document.getElementById('delete-arch');

        pop_up_Delete.classList.add("visible");
        overlay.classList.add("visible");

        confirmDeleteButton.addEventListener('click', function () {
            deleteItem(archID);
            pop_up_Delete.classList.remove("visible");
            overlay.classList.remove("visible");
        })
        cancelDeleteButton.addEventListener('click', function () {
            pop_up_Delete.classList.remove("visible");
            overlay.classList.remove("visible");
        })
    }
    if (action === 'Update' && archID) {
        const updateContainer = document.getElementById("add-document");
        document.querySelector('#add-document .heading').innerText = "UPDATE DOCUMENT";
        document.querySelector('#add-document #submit_add_document').innerText = "UPDATE";
        document.querySelector('#add-document form').action = `/archive/update-archive-item`;
        updateContainer.classList.add("visible");
        overlay.classList.toggle("visible");

        console.log(archID);

        fetch(`/archive/archive-item/${archID}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(itemData => {
                fillInputs(itemData);
            })
            .catch(error => {
                console.error('Error archive data:', error);
                alert('Failed to fetch archive data. Please try again.');
            });
    }
    if (action === 'View Image' && archID) {
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
    }
};

const addDocument = document.getElementById("add-document");
function popUp_button(button) {
    var buttonId = button.id;
    if (buttonId === "add-document-button") {
        document.querySelector('#add-document .heading').innerText = "ADD DOCUMENT";
        document.querySelector('#add-document #submit_add_document').innerText = "SUBMIT";
        document.querySelector('#add-document form').action = `/archive/dashboard/add-archive`;
        addDocument.classList.toggle("visible");
        overlay.classList.add("visible");
    }
}

function deleteItem(archiveID) {
    console.log("delete triggered");

    try {
        const response = fetch(`/archive/delete-archive-item/${archiveID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            fetchArchiveLists(page, limit, searchQuery);
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

// Fills inputs dynamically based on data fetched from the server
function fillInputs(data) {
    clearFillInputs();
    console.log('Data passed to fillInputs:', data);

    // Ensure typename exists and is in lowercase
    const docType = (data.typename || '').toLowerCase();

    // Common fields
    const commonElements = {
        docType: data.typename || '',
    };

    Object.keys(commonElements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = commonElements[id] || '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });

    // Handle specific document types
    switch (docType) {
        case 'lupon':
            if (data.luponDetails && data.luponDetails.length > 0) {
                const details = data.luponDetails[0];
                populateFields({
                    luponCaseNumber: details.casenumber,
                    complainant: details.complainant,
                    respondent: details.respondent,
                    dateFiled: details.datefiled ? details.datefiled.split('T')[0] : '',
                    caseType: details.casetype,
                });
                setImage(details.image);
            }
            break;

        case 'panumduman':
            if (data.panumdumanDetails && data.panumdumanDetails.length > 0) {
                const details = data.panumdumanDetails[0];
                const contractingParts = (details.contractingpersons || '').split(',');
                populateFields({
                    parties1: contractingParts[0] || '',
                    parties2: contractingParts[1] || '',
                    date: details.date ? details.date.split('T')[0] : '',
                });
                setImage(details.image);
            }
            break;

        case 'regularization minutes':
            if (data.regularizationDetails && data.regularizationDetails.length > 0) {
                const details = data.regularizationDetails[0];
                populateFields({
                    regulationNumber: details.regulationnumber,
                    dates: details.date ? details.date.split('T')[0] : '',
                });
                setImage(details.image);
            }
            break;

        case 'resolution':
            if (data.resolutionDetails && data.resolutionDetails.length > 0) {
                const details = data.resolutionDetails[0];
                populateFields({
                    resolutionNumber: details.resolutionnumber,
                    yearSeries: details.seriesyear,
                    date: details.date ? details.date.split('T')[0] : '',
                });
                setImage(details.image);
            }
            break;

        case 'ordinance':
            if (data.ordinanceDetails && data.ordinanceDetails.length > 0) {
                const details = data.ordinanceDetails[0];
                const authors = (details.authors || '').split(',');
                const coAuthors = (details.coauthors || '').split(',');
                const sponsors = (details.sponsors || '').split(',');
                populateFields({
                    ordinanceNumber: details.ordinancenumber,
                    ordinanceTitle: details.title,
                    date: details.dateapproved ? details.dateapproved.split('T')[0] : '',
                    author1: authors[0] || '',
                    coAuthor1: coAuthors[0] || '',
                    sponsor1: sponsors[0] || '',
                });
                setImage(details.image);
            }
            break;

        default:
            console.warn(`Unrecognized or unsupported document type: ${data.typename}`);
    }
}

// Populate specific input fields
function populateFields(fields) {
    Object.keys(fields).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = fields[id] || '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });
}

// Update the image preview
function setImage(imagePath) {
    const pictureElement = document.getElementById('fileInput');
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.innerHTML = imagePath
            ? `<img src="/uploads/archive-img/${imagePath}" alt="Uploaded Image">`
            : '<p>No Image Uploaded</p>';
    }
    if (pictureElement) {
        pictureElement.src = imagePath ? `/uploads/archive-img/${imagePath}` : '';
    } else {
        console.error('Image element not found or is not an IMG tag');
    }
}

// Clear all inputs
function clearFillInputs() {
    const inputIds = [
        'docType', 'luponCaseNumber', 'complainant', 'respondent', 'dateFiled', 'caseType',
        'parties1', 'parties2', 'date',
        'regulationNumber', 'dates',
        'resolutionNumber', 'yearSeries',
        'ordinanceNumber', 'ordinanceTitle', 'author1', 'coAuthor1', 'sponsor1',
    ];

    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });

    const pictureElement = document.getElementById('fileInput');
    const preview = document.getElementById('imagePreview');
    if (pictureElement) {
        pictureElement.src = '';
    }
    if (preview) {
        preview.innerHTML = '<p>No Image Uploaded</p>';
    }
}

// function
let authorCount = 1;
let coAuthorCount = 1;
let sponsorCount = 1;
function addTextarea() {
    const container = document.getElementById("authorContainer");
  
    const div = document.createElement('div');
    div.classList.add('inputWithLabel');
    div.setAttribute('id', `author-${authorCount}`);
    if (authorCount === 1){
        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>Author (${authorCount})</label>
            <button type="button" onclick="addTextarea()">+</button>
            <button type="button" onclick="removeTextarea()">-</button>
          </div>
          <input type="text" aria-label="Author (${authorCount})" name="author${authorCount}" required>
        `;
    } else {
        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>Author (${authorCount})</label>
          </div>
          <input type="text" aria-label="Author (${authorCount})" name="author${authorCount}" required>
        `;
    }
    container.appendChild(div);
    authorCount++;
  }
  
  function removeTextarea() {
    const container = document.getElementById("authorContainer");
    
    if (container.children.length <= 1) return(alert('At least one Author is required!'));
  
    const lastChild = container.lastElementChild; 
    if (lastChild) {
      container.removeChild(lastChild);
      authorCount--;
    }
  }
function addTextarea1() {
    const container = document.getElementById("co-AuthorContainer");
  
    const div = document.createElement('div');
    div.classList.add('inputWithLabel');
    div.setAttribute('id', `co-Author-${coAuthorCount}`);
    if (coAuthorCount === 1){
        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>Co-Author (${coAuthorCount})</label>
            <button type="button" onclick="addTextarea1()">+</button>
            <button type="button" onclick="removeTextarea1()">-</button>
          </div>
          <input type="text" aria-label="Co-Author (${coAuthorCount})" name="coAuthor${coAuthorCount}" required>
        `;
    } else {
        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>Co-Author (${coAuthorCount})</label>
          </div>
          <input type="text" aria-label="Co-Author (${coAuthorCount})" name="coAuthor${coAuthorCount}" required>
        `;
    }
    container.appendChild(div);
    coAuthorCount++;
  }
  
  function removeTextarea1() {
    const container = document.getElementById("co-AuthorContainer");
    
    if (container.children.length <= 1) return(alert('At least one Co-Author is required!'));
  
    const lastChild = container.lastElementChild; 
    if (lastChild) {
      container.removeChild(lastChild);
      coAuthorCount--;
    }
  }
function addTextarea2() {
    const container = document.getElementById("sponsorContainer");
  
    const div = document.createElement('div');
    div.classList.add('inputWithLabel');
    div.setAttribute('id', `sponsor-${sponsorCount}`);
    if (sponsorCount === 1){
        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>Sponsor (${sponsorCount})</label>
            <button type="button" onclick="addTextarea2()">+</button>
            <button type="button" onclick="removeTextarea2()">-</button>
          </div>
          <input type="text" aria-label="Sponsor (${sponsorCount})" name="sponsor${sponsorCount}" required>
        `;
    } else {
        div.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <label>Sponsor (${sponsorCount})</label>
          </div>
          <input type="text" aria-label="Sponsor (${sponsorCount})" name="sponsor${sponsorCount}" required>
        `;
    }
    container.appendChild(div);
    sponsorCount++;
  }
  
  function removeTextarea2() {
    const container = document.getElementById("sponsorContainer");
    
    if (container.children.length <= 1) return(alert('At least one Sponsor is required!'));
  
    const lastChild = container.lastElementChild; 
    if (lastChild) {
      container.removeChild(lastChild);
      sponsorCount--;
    }
  }