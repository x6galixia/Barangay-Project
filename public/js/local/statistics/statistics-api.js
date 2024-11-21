document.addEventListener("DOMContentLoaded", function () {

    // Fetch resident classification data and render chart
fetch('/statistics/resident-classification')
.then(response => response.json())
.then(data => {
    const labels = data.map(item => item.rclassificationname);
    const residentCount = data.map(item => parseInt(item.resident_count)); // Convert to number
    const colors = ['rgba(0, 128, 0, 0.2)',  // Green with some transparency
        'rgba(0, 0, 255, 0.2)',  // Blue with some transparency
        'rgba(255, 255, 0, 0.2)', // Yellow with some transparency
        'rgba(255, 0, 0, 0.2)'];
    const backgroundColors = labels.map((_, index) => colors[index % colors.length]);
    const borderColors = backgroundColors.map(color => color.replace('0.2', '1'));
    const ctx = document.getElementById('classificationChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Resident Classification',
                data: residentCount,
                backgroundColor: backgroundColors, // Apply the colors to the bars
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
})
.catch(err => console.error('Error fetching classification data:', err));

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

});