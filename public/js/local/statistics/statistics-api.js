document.addEventListener("DOMContentLoaded", function () {
  // Fetch resident classification data and render chart
  fetch("/statistics/resident-classification")
    .then((response) => response.json())
    .then((data) => {
      // Overall Population
      const overall = data.overall;
      const overallTotal = overall.total_population;

    //   // Display overall population data
    //   document.getElementById("overallPopulation1").innerHTML = `
    //     <p>Overall Population</p>
    //     <h3>${overallTotal}</h3>
    // `;

      // Total Classification Data (Display in table format)
      let totalClassificationTable = ``;

      for (const [classification, count] of Object.entries(
        data.totalClassificationData
      )) {
        totalClassificationTable += `
            <div><h5>${classification}</h5> <h3>${count}</h3></div>
        `;
      }
      document.getElementById("totalClassificationDetails").innerHTML =
        totalClassificationTable;

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
        "Kasambahay",
      ];

      // Extract the Purok labels (purok names)
      const labels = Object.keys(data.perPurok);

      // Create empty arrays for each classification type
      const datasets = classificationNames.map((name) => ({
        label: name,
        data: new Array(labels.length).fill(0), // Initialize data with zeros
        backgroundColor: getRandomColor(),
        borderColor: getRandomColor(),
        borderWidth: 1,
      }));

      // Object to hold the totals for each classification by Purok
      let classificationByPurokTotal = {};

      // Populate the dataset data for each Purok and classification
      Object.keys(data.perPurok).forEach((purok, index) => {
        const classificationData = data.perPurok[purok];
        let totalByPurok = {};

        classificationData.forEach((item) => {
          const dataset = datasets.find(
            (d) => d.label === item.rClassificationName
          );
          if (dataset) {
            dataset.data[index] = item.resident_count;

            // Calculate the total for each classification per Purok
            if (!totalByPurok[item.rClassificationName]) {
              totalByPurok[item.rClassificationName] = 0;
            }
            totalByPurok[item.rClassificationName] += item.resident_count;
          }
        });

        // Store total per Purok in the classificationByPurokTotal object
        classificationByPurokTotal[purok] = totalByPurok;
      });

      // Create HTML content for the classification totals by Purok in table format
      let classificationByPurokTable = `
        <h3>Resident Sectors by Purok</h3>
        <table border="1" cellspacing="0" cellpadding="5">
            <thead>
                <tr>
                    <th>Purok</th>
                    <th>Classification</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;

      Object.keys(classificationByPurokTotal).forEach((purok) => {
        const totalByPurok = classificationByPurokTotal[purok];
        for (const [classification, total] of Object.entries(totalByPurok)) {
          classificationByPurokTable += `
                <tr>
                    <td>${purok}</td>
                    <td>${classification}</td>
                    <td>${total}</td>
                </tr>
            `;
        }
      });

      classificationByPurokTable += `
            </tbody>
        </table>
    `;

      // Display the classification totals by Purok
      document.getElementById("classificationByPurokDetails").innerHTML =
        classificationByPurokTable;

      // Set up the chart
      const ctx = document
        .getElementById("barangayPopulationChart1")
        .getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels, // Purok names
          datasets: datasets,
        },
        options: {
          responsive: true,
          scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true },
          },
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                },
              },
            },
          },
        },
      });
    })
    .catch((err) =>
      console.error("Error fetching resident classification data:", err)
    );

  // Function to generate random colors for chart
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Fetch age demographics data and render chart
  fetch("/statistics/age-demographics")
    .then((response) => response.json())
    .then((data) => {
      // Calculate total counts for each age range (not grouped by purok)
      const ageRangeTotals = {};

      // Calculate the total residents for each age range across all purok
      data.forEach((item) => {
        const { age_range, resident_count } = item;
        const count = parseInt(resident_count, 10); // Ensure resident_count is treated as a number
        if (!ageRangeTotals[age_range]) {
          ageRangeTotals[age_range] = 0;
        }
        ageRangeTotals[age_range] += count; // Add the count as a number
        console.log(
          `Adding ${count} residents to age range ${age_range}. Total is now ${ageRangeTotals[age_range]}`
        );
      });      

      // Prepare data for chart
      const allLabels = Object.keys(ageRangeTotals); // Age ranges as labels
      const allCounts = Object.values(ageRangeTotals); // Corresponding total counts

      // Render chart
      // const ctx = document.getElementById("ageDemographicsChart");
      // new Chart(ctx, {
      //   type: "doughnut",
      //   data: {
      //     labels: allLabels,
      //     datasets: [
      //       {
      //         label: "Age Demographics",
      //         data: allCounts,
      //         backgroundColor: [
      //           "#FF6384",
      //           "#36A2EB",
      //           "#FFCE56",
      //           "#FF9F40",
      //           "#4BC0C0",
      //         ], // Adjust colors if needed
      //         borderColor: "#fff",
      //         borderWidth: 1,
      //       },
      //     ],
      //   },
      //   options: {
      //     responsive: true,
      //     scales: {
      //       y: {
      //         beginAtZero: true,
      //       },
      //     },
      //   },
      // });

      // Render the age demographics details in a table for purok
      const demographicsTextContainer = document.getElementById(
        "ageDemographicsText"
      );
      demographicsTextContainer.innerHTML = ""; // Clear any existing content

      // Create the container to hold both tables side by side
      let demographicsTables = `
      <div class="table-container">
      <div style="width:100%">
        <!-- First Table: Age Demographics by Purok -->
        <h3>Age Demographics by Purok</h3>
        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
            <tr>
              <th>Purok</th>
              <th>Age Range</th>
              <th>Resident Count</th>
            </tr>
          </thead>
          <tbody>
    `;

      // Group data by 'purok' and add rows to the first table
      const groupedByPurok = {};
      data.forEach((item) => {
        const { purok, age_range, resident_count } = item;
        if (!groupedByPurok[purok]) {
          groupedByPurok[purok] = [];
        }
        groupedByPurok[purok].push({ age_range, resident_count });
      });

      // Add rows to the first table based on grouped data
      Object.keys(groupedByPurok).forEach((purok) => {
        groupedByPurok[purok].forEach((item) => {
          demographicsTables += `
          <tr>
            <td>${purok}</td>
            <td>${item.age_range}</td>
            <td>${item.resident_count}</td>
          </tr>
        `;
        });
      });

      // Close the first table body and table
      demographicsTables += `</tbody></table></div>`;

      // Second Table: Total Residents for Each Age Range
      const ageTotalContainer = document.getElementById('overallPopulationAge');

      // Add the total residents for each age range in the second table
      Object.keys(ageRangeTotals).forEach((ageRange) => {
        ageTotalContainer.innerHTML += `
        <div><h5>${ageRange}</h5> <h3>${ageRangeTotals[ageRange]}</h3></div>
      `;
      });


      // Insert the tables container into the container element
      demographicsTextContainer.innerHTML = demographicsTables;
    })
    .catch((err) =>
      console.error("Error fetching age demographics data:", err)
    );

  // Fetch resident status data and render chart
  fetch("/statistics/resident-status")
    .then((response) => response.json())
    .then((data) => {
      // Create an array to hold the purok labels and the counts for each resident status
      const purokLabels = data.map((item) => item.purok);
      const pwdCounts = data.map((item) => parseInt(item.pwd_count));
      const soloParentCounts = data.map((item) =>
        parseInt(item.solo_parent_count)
      );
      const youthCounts = data.map((item) => parseInt(item.youth_count));
      const is4psCounts = data.map((item) => parseInt(item.is4ps_count));
      const outOfSchoolYouthCounts = data.map((item) =>
        parseInt(item.isosy_count)
      );
      const samahanNgKababaihanCounts = data.map((item) =>
        parseInt(item.skm_count)
      );
      const samahanNgKababayinanCounts = data.map((item) =>
        parseInt(item.km_count)
      );
      const residentBoardersCounts = data.map((item) =>
        parseInt(item.rb_count)
      );

      // Calculate totals for each status across all puroks
      const totalPwd = pwdCounts.reduce((acc, count) => acc + count, 0);
      const totalSoloParent = soloParentCounts.reduce(
        (acc, count) => acc + count,
        0
      );
      const totalYouth = youthCounts.reduce((acc, count) => acc + count, 0);
      const total4ps = is4psCounts.reduce((acc, count) => acc + count, 0);
      const totaloutOfSchoolYouthCounts = outOfSchoolYouthCounts.reduce(
        (acc, count) => acc + count,
        0
      );
      const totalsamahanNgKababaihanCounts = samahanNgKababaihanCounts.reduce(
        (acc, count) => acc + count,
        0
      );
      const totalsamahanNgKababayinanCounts = samahanNgKababayinanCounts.reduce(
        (acc, count) => acc + count,
        0
      );
      const totalNonResidents = residentBoardersCounts.reduce(
        (acc, count) => acc + count,
        0
      );

      // // Render the doughnut chart
      // const ctx = document.getElementById("statusChart").getContext("2d");
      // new Chart(ctx, {
      //   type: "bar",
      //   data: {
      //     labels: purokLabels, // Use purok labels as the X-axis labels
      //     datasets: [
      //       {
      //         label: "PWD",
      //         data: pwdCounts,
      //         backgroundColor: "#FF9F40",
      //         hoverOffset: 4,
      //       },
      //       {
      //         label: "Solo Parent",
      //         data: soloParentCounts,
      //         backgroundColor: "#FFCD56",
      //         hoverOffset: 4,
      //       },
      //       {
      //         label: "Youth",
      //         data: youthCounts,
      //         backgroundColor: "#4BC0C0",
      //         hoverOffset: 4,
      //       },
      //       {
      //         label: "4Ps",
      //         data: is4psCounts,
      //         backgroundColor: "#FF6384",
      //         hoverOffset: 4,
      //       },
      //       {
      //         label: "Out of school youth",
      //         data: outOfSchoolYouthCounts,
      //         backgroundColor: "#FF8384",
      //         hoverOffset: 4,
      //       },
      //       {
      //         label: "Samahan ng kababaihan",
      //         data: samahanNgKababaihanCounts,
      //         backgroundColor: "#FF9384",
      //         hoverOffset: 4,
      //       },
      //       {
      //         label: "Samahan ng kababayin-an",
      //         data: samahanNgKababayinanCounts,
      //         backgroundColor: "#FF1384",
      //         hoverOffset: 4,
      //       },
      //       {
      //         label: "Resident Boarders",
      //         data: residentBoardersCounts,
      //         backgroundColor: "#FF3384",
      //         hoverOffset: 4,
      //       },
      //     ],
      //   },
      // });

      // Render the resident status details in a table for purok
      const statusTextContainer = document.getElementById("residentStatusText");
      statusTextContainer.innerHTML = ""; // Clear any existing content

      // Create a container to hold the tables side by side
      let statusTables = `
        <div class="table-container">
        <div style="width: 100%">
            <!-- First Table: Resident Status by Purok -->
            <h3>Resident Status by Purok</h3>
            <table border="1" cellspacing="0" cellpadding="5">
                <thead>
                    <tr>
                        <th>Purok</th>
                        <th>PWD</th>
                        <th>Solo Parent</th>
                        <th>Youth</th>
                        <th>4Ps</th>
                        <th>Out of school youth</th>
                        <th>Samahan ng kababaihan</th>
                        <th>Samahan ng kababayin-an</th>
                        <th>Resident Boarders</th>
                    </tr>
                </thead>
                <tbody>
    `;

      // Iterate through the data and create table rows for each purok
      data.forEach((item, index) => {
        const purok = item.purok;
        statusTables += `
            <tr>
                <td>${purok}</td>
                <td>${pwdCounts[index]}</td>
                <td>${soloParentCounts[index]}</td>
                <td>${youthCounts[index]}</td>
                <td>${is4psCounts[index]}</td>
                <td>${outOfSchoolYouthCounts[index]}</td>
                <td>${samahanNgKababaihanCounts[index]}</td>
                <td>${samahanNgKababayinanCounts[index]}</td>
                <td>${residentBoardersCounts[index]}</td>
            </tr>

        `;
      });

      statusTables += `        </tbody>
    </table>
    </div>
</div>`;

      // Close the first table body and the table
      document.getElementById('overallPopulationStatus1').innerHTML += `

        <div><h5>Solo Parent</h5> <h3>${totalSoloParent}</h3></div>
        <div><h5>Youth</h5> <h3>${totalYouth}</h3></div>
        <div><h5>4ps</h5> <h3>${total4ps}</h3></div>
        <div><h5>Out of School Youth</h5> <h3>${totaloutOfSchoolYouthCounts}</h3></div>
        <div><h5>Samahan ng Kababaihan</h5> <h3>${totalsamahanNgKababaihanCounts}</h3></div>
        <div><h5>Kababayin-an han Maypangdan</h5> <h3>${totalsamahanNgKababayinanCounts}</h3></div>
        <div><h5>Resident Boarders</h5> <h3>${totalNonResidents}</h3></div>
    `;

      // Insert the tables container into the container element
      statusTextContainer.innerHTML = statusTables;
    })
    .catch((err) => console.error("Error fetching resident status data:", err));

  // Fetch residents by Purok data and render chart
  fetch("/statistics/residents-by-purok")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      const labels = data.map((item) => item.purok);
      const residentCount = data.map((item) => parseInt(item.resident_count)); // Convert to number
      const ctx = document.getElementById("purokChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Residents by Purok",
              data: residentCount,
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        },
      });
    })
    .catch((err) =>
      console.error("Error fetching residents by purok data:", err)
    );

  // Fetch barangay population data and render chart
  fetch("/statistics/barangay-population")
    .then((response) => response.json())
    .then((data) => {
      // Overall Population
      const overall = data.overall;
      const overallTotal = overall.total_population;
      const overallMale = overall.male_count;
      const overallFemale = overall.female_count;
      const overallSenior = overall.senior_count;
      const overallPwd = overall.pwd_count;

      // Display overall population data in a table with "Label" and "Count" headers
      document.getElementById("overallPopulation").innerHTML = `
        <div><h5>Total Male</h5> <h3>${overallMale}</h3></div>
        <div><h5>Total Female</h5> <h3>${overallFemale}</h3></div>
        <div><h5>Total Senior Citizens</h5> <h3>${overallSenior}</h3></div>
        <div><h5>Total PWDs</h5> <h3>${overallPwd}</h3></div>
        <div><h5>Total Population</h5> <h3>${overallTotal}</h3></div>
    `;

      // Extract data for chart
      const labels = data.perPurok.map((item) => item.purok);
      const maleCount = data.perPurok.map((item) => parseInt(item.male_count));
      const femaleCount = data.perPurok.map((item) =>
        parseInt(item.female_count)
      );
      const seniorCount = data.perPurok.map((item) =>
        parseInt(item.senior_count)
      );
      const pwdCount = data.perPurok.map((item) => parseInt(item.pwd_count));

      // Object to hold totals for each Purok
      let totalsByPurok = {
        male: [],
        female: [],
        senior: [],
        pwd: [],
      };

      // Calculate totals for each Purok per group (Male, Female, Senior, PWD)
      data.perPurok.forEach((item) => {
        totalsByPurok.male.push(item.male_count);
        totalsByPurok.female.push(item.female_count);
        totalsByPurok.senior.push(item.senior_count);
        totalsByPurok.pwd.push(item.pwd_count);
      });

      // Create HTML content for the totals by Purok in a table
      let totalsByPurokTable = `
        <h3>Resident Classification by Purok</h3>
        <table border="1" cellspacing="0" cellpadding="5">
            <thead>
                <tr>
                    <th>Purok</th>
                    <th>Male</th>
                    <th>Female</th>
                    <th>Senior Citizens</th>
                    <th>PWDs</th>
                </tr>
            </thead>
            <tbody>
    `;

      // Add each Purok's population details as table rows
      labels.forEach((purok, index) => {
        totalsByPurokTable += `
            <tr>
                <td>${purok}</td>
                <td>${totalsByPurok.male[index]}</td>
                <td>${totalsByPurok.female[index]}</td>
                <td>${totalsByPurok.senior[index]}</td>
                <td>${totalsByPurok.pwd[index]}</td>
            </tr>
        `;
      });

      totalsByPurokTable += `
            </tbody>
        </table>
    `;

      // Display the table for totals by Purok
      document.getElementById("totalsByPurokDetails").innerHTML =
        totalsByPurokTable;

      // Set up the chart
      const ctx = document
        .getElementById("barangayPopulationChart")
        .getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels, // Purok names
          datasets: [
            {
              label: "Male",
              data: maleCount,
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
            {
              label: "Female",
              data: femaleCount,
              backgroundColor: "rgba(153, 102, 255, 0.5)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
            {
              label: "Senior",
              data: seniorCount,
              backgroundColor: "rgba(255, 159, 64, 0.5)",
              borderColor: "rgba(255, 159, 64, 1)",
              borderWidth: 1,
            },
            {
              label: "PWD",
              data: pwdCount,
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  return tooltipItem.dataset.label + ": " + tooltipItem.raw;
                },
              },
            },
          },
        },
      });
    })
    .catch((err) =>
      console.error("Error fetching barangay population data:", err)
    );
});
