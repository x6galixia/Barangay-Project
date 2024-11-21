document.addEventListener("DOMContentLoaded", function () {
// Fetch resident classification data and render chart
fetch('/statistics/resident-classification')
.then(response => response.json())
.then(data => {
    // Overall Population
    const overall = data.overall;
    const overallTotal = overall.total_population;

    // Display overall population data
    document.getElementById('overallPopulation1').innerHTML = `
        <h3>Overall Population</h3>
        <p>Total Population: ${overallTotal}</p>
    `;

    // Total Classification Data (Display as text)
    let totalClassificationText = "<h3>Total Classification Data:</h3><ul>";
    for (const [classification, count] of Object.entries(data.totalClassificationData)) {
        totalClassificationText += `<li><strong>${classification}:</strong> ${count}</li>`;
    }
    totalClassificationText += "</ul>";
    document.getElementById("totalClassificationDetails").innerHTML = totalClassificationText;

    // Classification Labels (specific rClassification names)
    const classificationNames = [
        "Government employee", 
        "Private employee", 
        "Carpenters", 
        "Farmers", 
        "Fisherman", 
        "Business entrepreneurs", 
        "Drivers", 
        "OFW", 
        "Kasambahay"
    ];

    // Extract the Purok labels (purok names)
    const labels = Object.keys(data.perPurok);

    // Create empty arrays for each classification type
    const datasets = classificationNames.map(name => ({
        label: name,
        data: new Array(labels.length).fill(0), // Initialize data with zeros
        backgroundColor: getRandomColor(),
        borderColor: getRandomColor(),
        borderWidth: 1
    }));

    // Populate the dataset data for each Purok and classification
    Object.keys(data.perPurok).forEach((purok, index) => {
        const classificationData = data.perPurok[purok];
        classificationData.forEach(item => {
            const dataset = datasets.find(d => d.label === item.rClassificationName);
            if (dataset) {
                dataset.data[index] = item.resident_count;
            }
        });
    });

    // Set up the chart
    const ctx = document.getElementById('barangayPopulationChart1').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // Purok names
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                        }
                    }
                }
            }
        }
    });
})
.catch(err => console.error('Error fetching resident classification data:', err));

// Function to generate random colors for chart
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Fetch age demographics data and render chart
fetch('/statistics/age-demographics')
.then(response => response.json())
.then(data => {
    const labels = data.map(item => item.age_range);
    const residentCount = data.map(item => parseInt(item.resident_count)); // Convert to number
    console.log("data", labels);
    const ctx = document.getElementById('ageDemographicsChart');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Age Demographics',
                data: residentCount,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        }
    });
})
.catch(err => console.error('Error fetching age demographics data:', err));

// Fetch resident status data and render chart
fetch('/statistics/resident-status')
.then(response => response.json())
.then(data => {
    const labels = ['PWD', 'Solo Parent', 'Youth', '4Ps'];
    const counts = [
        parseInt(data[0].pwd_count),           // Convert to number
        parseInt(data[0].solo_parent_count),   // Convert to number
        parseInt(data[0].youth_count),         // Convert to number
        parseInt(data[0].is4ps_count)          // Convert to number
    ];

    const ctx = document.getElementById('statusChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: ['#FF9F40', '#FFCD56', '#4BC0C0', '#FF6384'],
                hoverOffset: 4
            }]
        }
    });
})
.catch(err => console.error('Error fetching resident status data:', err));

// Fetch residents by Purok data and render chart
fetch('/statistics/residents-by-purok')
.then(response => response.json())
.then(data => {
    console.log(data);
    const labels = data.map(item => item.purok);
    const residentCount = data.map(item => parseInt(item.resident_count)); // Convert to number
    const ctx = document.getElementById('purokChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Residents by Purok',
                data: residentCount,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        }
    });
})
.catch(err => console.error('Error fetching residents by purok data:', err));

// Fetch barangay population data and render chart
fetch('/statistics/barangay-population')
.then(response => response.json())
.then(data => {
    // Overall Population
    const overall = data.overall;
    const overallTotal = overall.total_population;
    const overallMale = overall.male_count;
    const overallFemale = overall.female_count;
    const overallSenior = overall.senior_count;
    const overallPwd = overall.pwd_count;

    // Display overall population data
    document.getElementById('overallPopulation').innerHTML = `
        <h3>Overall Population</h3>
        <p>Total Population: ${overallTotal}</p>
        <p>Male: ${overallMale}</p>
        <p>Female: ${overallFemale}</p>
        <p>Senior Citizens: ${overallSenior}</p>
        <p>PWDs: ${overallPwd}</p>
    `;

    // Extract data for chart
    const labels = data.perPurok.map(item => item.purok);
    const maleCount = data.perPurok.map(item => parseInt(item.male_count));
    const femaleCount = data.perPurok.map(item => parseInt(item.female_count));
    const seniorCount = data.perPurok.map(item => parseInt(item.senior_count));
    const pwdCount = data.perPurok.map(item => parseInt(item.pwd_count));

    // Set up the chart
    const ctx = document.getElementById('barangayPopulationChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Male',
                    data: maleCount,
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Female',
                    data: femaleCount,
                    backgroundColor: 'rgba(153, 102, 255, 0.5)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Senior',
                    data: seniorCount,
                    backgroundColor: 'rgba(255, 159, 64, 0.5)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                },
                {
                    label: 'PWD',
                    data: pwdCount,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });
})
.catch(err => console.error('Error fetching barangay population data:', err));

});