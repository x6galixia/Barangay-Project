
// document.getElementById('complainant').addEventListener('input', function () {
//     const query = this.value.trim();

//     console.log(query);
    
//     if (query.length > 0) {
//         fetch(`/archive/get-resident?query=${encodeURIComponent(query)}`)
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! Status: ${response.status}`);
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log("Residents:", data);
//                 const resultsContainer = document.getElementById('results');
//                 resultsContainer.innerHTML = '';

//                 if (data.length > 0) {
//                     data.forEach(resident => {
//                         const listItem = document.createElement('div');
//                         listItem.textContent = `${resident.fname} ${resident.mname} ${resident.lname}`;
//                         resultsContainer.appendChild(listItem);
//                     });
//                 } else {
//                     resultsContainer.textContent = 'No results found';
//                 }
//             })
//             .catch(error => {
//                 console.error("Error fetching residents:", error);
//             });
//     } else {
//         const resultsContainer = document.getElementById('results');
//         resultsContainer.innerHTML = '';
//     }
// });