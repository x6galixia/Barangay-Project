
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
                    <td colspan="4" class="text-center">No Documents found.</td>
                `;
                archiveTableBody.appendChild(noDataRow);
                return;
            }

            archive.forEach(arch => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${arch.contractingpersons}</td>
                    <td>${new Date(arch.date).toLocaleDateString()}</td>
                    <td>${arch.doctype}</td>
                    <td class="menu-row">
                        <img class="dot" src="../icon/triple-dot.svg" alt="">
                        <div class="triple-dot">
                            <div class="menu" data-id="${arch.id}">
                                <button id="delete-id" onclick="popUp_three_dot(this)">Delete</button>
                                <button id="update-id" onclick="popUp_three_dot(this)">Update</button>
                                <button id="view-id" onclick="popUp_three_dot(this)"
                                 data-image="${arch.img}"
                                 data-docType="${arch.doctype}"
                                >View Image</button>
                            </div>
                        </div>
                    </td>
                `;
                archiveTableBody.appendChild(row);
            });
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
                <input type="number" aria-label="Ordinance Number" name="ordinanceNumber" required>
            </div>
            <div class="inputWithLabel" id="surubadan">
                <label>Ordinance Title</label>
                <input type="text" aria-label="Ordinance Title" name="ordinanceTitle" required>
            </div>
            <div class="inputWithLabel" id="authorContainer" style="margin-top:4px">
            </div>
            <div class="inputWithLabel" id="co-AuthorContainer" style="margin-top:4px">
            </div>
            <div class="inputWithLabel" id="sponsorContainer" style="margin-top:4px">
            </div>
            <div class="inputWithLabel">
                <label>Date Approved</label>
                <input type="date" aria-label="Date Approved" name="dateApproved" required>
            </div>
            `
        }
        if (selectedValue === "Resolution") {
            formContainer.innerHTML = `
            <div class="inputWithLabel" id="surubadan">
                <label>Resolution Number</label>
                <input type="number" aria-label="Resolution Number" name="resolutionNumber" required>
            </div>
            <div class="inputWithLabel" id="surubadan">
                <label>Series of Year</label>
                <input type="text" aria-label="Series of Year" name="yearSeries" required>
            </div>
            <div class="inputWithLabel">
                <label>Date</label>
                <input type="date" aria-label="Date" name="date" required>
            </div>
            `
        }
        if (selectedValue === "Regularization Minutes") {
            formContainer.innerHTML = `
            <div class="inputWithLabel" id="surubadan">
                <label>Ika Pira na Regulation</label>
                <input type="number" aria-label="Ika Pira na Regulation" name="regulationNumber" required>
            </div>
            <div class="inputWithLabel">
                <label>Date</label>
                <input type="date" aria-label="Date" name="date" required>
            </div>
            `
        }
        addTextarea();
        addTextarea1();
        addTextarea2();
    })
}

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

function fillInputs(data) {
    clearFillInputs();
    console.log('Data passed to fillInputs:', data);

    const contractingParts = (data.contractingpersons && data.contractingpersons.split(' and ')) || [];

    const elements = {
        itemId: data.id,
        docType: data.doctype,
        Contracting1: contractingParts[0] || '',
        Contracting2: contractingParts[1] || '',
        date: data.date ? data.date.split('T')[0] : '',
    };

    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = elements[id] || '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });

    const pictureElement = document.getElementById('fileInput');
    const preview = document.getElementById("imagePreview");
    if (pictureElement) {
        pictureElement.src = data.img ? `/uploads/archive-img/${data.img}` : '';
        preview.innerHTML = `<img src="/uploads/archive-img/${data.img}" alt="Uploaded Image">`;
    } else {
        console.error('Image element not found or is not an IMG tag');
    }
}
function clearFillInputs() {
    const elements = {
        itemId,
        docType,
        Contracting1,
        Contracting2,
        date
    };

    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    });

    const pictureElement = document.getElementById('fileInput');
    const preview = document.getElementById("imagePreview");
    if (pictureElement) {
        pictureElement.src = '';
        preview.innerHTML = `<p>No Image Uploaded</p>`;
    } else {
        console.error('Image element not found or is not an IMG tag');
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
            <label>Author (${sponsorCount})</label>
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