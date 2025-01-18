document.addEventListener("DOMContentLoaded", function () {
  // Fetch resident classification data and render chart
  fetch("/statistics/resident-classification"
    , {
      method: 'GET', // Specify GET method (default is GET, but can be added explicitly)
      headers: {
          'Content-Type': 'application/json',  // Ensure content is treated as JSON
          'Accept': 'application/json',        // Expect JSON response
      },
  }
  )
  .then((response) => response.json())
  .then((data) => {
    // Classification Names
    const classificationNames = [
      "Entrepreneur",
      "Business entrepreneur",
      "Government employee",
      "Private employee",
      "OFW",
      "Drivers",
      "Fisherman",
      "Carpenters",
      "Farmers",
      "Kasambahay",
      "Unemployed",
    ];

    // Purok labels
    const purokNames = Object.keys(data.perPurok);

    // Initialize totals for each classification across all Puroks
    const classificationTotals = {};
    classificationNames.forEach((name) => (classificationTotals[name] = 0));

    // HTML table header
    let classificationByPurokTable = `
      <h3>Resident Sectors by Purok</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <tr>
            <th>Purok</th>
            ${classificationNames
              .map((name) => `<th>${name}</th>`)
              .join("")}
          </tr>
        </thead>
        <tbody>
    `;

    // Populate the table rows
    purokNames.forEach((purok) => {
      const purokData = data.perPurok[purok];
      const purokTotals = {};

      // Initialize totals for each classification for this purok
      classificationNames.forEach((name) => (purokTotals[name] = 0));

      // Fill in data for this purok
      purokData.forEach(({ rClassificationName, resident_count }) => {
        if (classificationNames.includes(rClassificationName)) {
          purokTotals[rClassificationName] += resident_count;
          classificationTotals[rClassificationName] += resident_count;
        }
      });


      // Add a row for this purok
      classificationByPurokTable += `
        <tr>
          <td>${purok}</td>
          ${classificationNames
            .map((name) => `<td>${purokTotals[name] || 0}</td>`)
            .join("")}
        </tr>
      `;
    });

    // Add the last row for totals
    classificationByPurokTable += `
      <tr>
        <td><strong>Total</strong></td>
        ${classificationNames
          .map((name) => `<td><h4>${classificationTotals[name]}</h4></td>`)
          .join("")}
      </tr>
    `;

    // Close the table
    classificationByPurokTable += `
        </tbody>
      </table>
    `;

    // Display the table
    document.getElementById("classificationByPurokDetails").innerHTML =
      classificationByPurokTable;
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

  fetch("/statistics/age-demographics")
  .then((response) => response.json())
  .then((data) => {
    // Calculate total counts for each age range across all purok
    const ageRangeTotals = {};
    const groupedByPurok = {};

    // Initialize totals for all known age ranges
    const ageRanges = ["0 - 14", "15 - 64", "65+"];
    ageRanges.forEach((range) => (ageRangeTotals[range] = 0));

    // Group data by purok and calculate totals
    data.forEach((item) => {
      const { purok, age_range, resident_count } = item;
      const count = parseInt(resident_count, 10) || 0;

      // Update totals for each age range
      if (!ageRangeTotals[age_range]) ageRangeTotals[age_range] = 0;
      ageRangeTotals[age_range] += count;

      // Group data by purok
      if (!groupedByPurok[purok]) {
        groupedByPurok[purok] = { "0 - 14": 0, "15 - 64": 0, "65+": 0 };
      }
      groupedByPurok[purok][age_range] += count;
    });

    // Generate table for age demographics by purok
    const demographicsTextContainer = document.getElementById(
      "ageDemographicsText"
    );
    let demographicsTables = `
      <h3>Age Demographics by Purok</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <tr>
            <th>Purok</th>
            <th>0 - 14</th>
            <th>15 - 64</th>
            <th>65+</th>
          </tr>
        </thead>
        <tbody>
    `;

    Object.keys(groupedByPurok).forEach((purok) => {
      const counts = groupedByPurok[purok];
      demographicsTables += `
        <tr>
          <td>${purok}</td>
          <td>${counts["0 - 14"]}</td>
          <td>${counts["15 - 64"]}</td>
          <td>${counts["65+"]}</td>
        </tr>
      `;
    });

    demographicsTables += `
        </tbody>
      </table>
    `;
    demographicsTextContainer.innerHTML = demographicsTables;

    // Generate totals for each age range
    const ageTotalContainer = document.getElementById("overallPopulationAge");
    ageRanges.forEach((range) => {
      ageTotalContainer.innerHTML += `
        <div>
          <h5>${range}</h5>
          <h3>${ageRangeTotals[range] || 0}</h3>
        </div>
      `;
    });
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
  // fetch("/statistics/residents-by-purok")
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log(data);
  //     const labels = data.map((item) => item.purok);
  //     const residentCount = data.map((item) => parseInt(item.resident_count)); // Convert to number
  //     new Chart(ctx, {
  //       type: "bar",
  //       data: {
  //         labels: labels,
  //         datasets: [
  //           {
  //             label: "Residents by Purok",
  //             data: residentCount,
  //             backgroundColor: "rgba(153, 102, 255, 0.2)",
  //             borderColor: "rgba(153, 102, 255, 1)",
  //             borderWidth: 1,
  //           },
  //         ],
  //       },
  //     });
  //   })
  //   .catch((err) =>
  //     console.error("Error fetching residents by purok data:", err)
  //   );

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

      // // Set up the chart
      // const ctx = document
      //   .getElementById("barangayPopulationChart")
      //   .getContext("2d");
      // new Chart(ctx, {
      //   type: "bar",
      //   data: {
      //     labels: labels, // Purok names
      //     datasets: [
      //       {
      //         label: "Male",
      //         data: maleCount,
      //         backgroundColor: "rgba(75, 192, 192, 0.5)",
      //         borderColor: "rgba(75, 192, 192, 1)",
      //         borderWidth: 1,
      //       },
      //       {
      //         label: "Female",
      //         data: femaleCount,
      //         backgroundColor: "rgba(153, 102, 255, 0.5)",
      //         borderColor: "rgba(153, 102, 255, 1)",
      //         borderWidth: 1,
      //       },
      //       {
      //         label: "Senior",
      //         data: seniorCount,
      //         backgroundColor: "rgba(255, 159, 64, 0.5)",
      //         borderColor: "rgba(255, 159, 64, 1)",
      //         borderWidth: 1,
      //       },
      //       {
      //         label: "PWD",
      //         data: pwdCount,
      //         backgroundColor: "rgba(255, 99, 132, 0.5)",
      //         borderColor: "rgba(255, 99, 132, 1)",
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
      //     plugins: {
      //       legend: {
      //         position: "top",
      //       },
      //       tooltip: {
      //         callbacks: {
      //           label: function (tooltipItem) {
      //             return tooltipItem.dataset.label + ": " + tooltipItem.raw;
      //           },
      //         },
      //       },
      //     },
      //   },
      // });
    })
    .catch((err) =>
      console.error("Error fetching barangay population data:", err)
    );
});
