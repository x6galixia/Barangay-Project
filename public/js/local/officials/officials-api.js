
document.addEventListener("DOMContentLoaded", async function () {

  try {
    const response = await fetch(`/officials/dashboard?ajax=true`);
    if (!response.ok) {
      throw new Error("Failed to fetch request data");
    }
    const data = await response.json();
    const officials = data.getOfficialList.rows;
    if (officials && officials.length > 0) {
      const official = officials[officials.length - 1];
  
      // barangay officlas names
      document.getElementById('punongBarangay').innerText = `HON. ${official.punongbarangayfirstname.toUpperCase()} ${official.punongbarangaymiddlename.toUpperCase() || ""} ${official.punongbarangaylastname.toUpperCase()}`
      document.getElementById('SKChairperson').innerText = `HON. ${official.skchairpersonfirstname.toUpperCase()} ${official.skchairpersonmiddlename.toUpperCase() || ""} ${official.skchairpersonlastname.toUpperCase()}`
      document.getElementById('secretaryName').innerText = `${official.barangaysecretaryfirstname.toUpperCase()} ${official.barangaysecretarymiddlename.toUpperCase() || ""} ${official.skchairpersonlastname.toUpperCase()}`
      document.getElementById('treasurerName').innerText = `${official.barangaytreasurerfirstname.toUpperCase()} ${official.barangaytreasurermiddlename.toUpperCase() || ""} ${official.skchairpersonlastname.toUpperCase()}`
      
      for (let i = 1; i <= 7; i++) {
        // Construct the property names dynamically
        const firstnameKey = `kagawad${i}firstname`;
        const middlenameKey = `kagawad${i}middlename`;
        const lastnameKey = `kagawad${i}lastname`;
        const kagawadImage = `kagawad${i}image`
    
        // Get the corresponding HTML element by ID
        const kagawadElement = document.getElementById(`kagawad${i}`);
        const kagawadsImage = document.getElementById(`kagawadImage${i}`);
        if (kagawadElement) {
            kagawadElement.innerText = `HON. ${official[firstnameKey]?.toUpperCase()} ${official[middlenameKey]?.toUpperCase() || ''} ${official[lastnameKey]?.toUpperCase()}`;
        }
        if (kagawadsImage){
          kagawadsImage.src = `/uploads/barangay-officials-images/${official[kagawadImage]}`;
        }
      }

      // barangay officials images
      document.getElementById("punongBarangayImage").src = `/uploads/barangay-officials-images/${official.punongbarangayimage}`;
      document.getElementById("SKChairpersonImage").src = `/uploads/barangay-officials-images/${official.skchairpersonimage}`;
      document.getElementById("secretaryImage").src = `/uploads/barangay-officials-images/${official.barangaysecretaryimage}`;
      document.getElementById("treasurerImage").src = `/uploads/barangay-officials-images/${official.barangaytreasurerimage}`;

      populateForm(official)
      
    } else {
        console.log("No rows available.");
    }


  } catch (error) {
    console.error("Error fetching request data: ", error);
  }
});


function populateForm(data){
  // PUNONG BARANGAY
    document.querySelector('#add-officials input[name="punongBarangayFirstName"]').value = data.punongbarangayfirstname;
    document.querySelector('#add-officials input[name="punongBarangayLastName"]').value = data.punongbarangaylastname;
    document.querySelector('#add-officials input[name="punongBarangayMiddleName"]').value = data.punongbarangaymiddlename;
    const preview = document.getElementById("imagePreview");
    preview.innerHTML = `<img src="/uploads/barangay-officials-images/${data.punongbarangayimage}" alt="Uploaded Image">`;

  // SK CHAIRPERSON
    document.querySelector('#add-officials input[name="SKChairpersonFirstName"]').value = data.skchairpersonfirstname;
    document.querySelector('#add-officials input[name="SKChairpersonLastName"]').value = data.skchairpersonlastname;
    document.querySelector('#add-officials input[name="SKChairpersonMiddleName"]').value = data.skchairpersonmiddlename;
    const preview10 = document.getElementById("imagePreview10");
    preview10.innerHTML = `<img src="/uploads/barangay-officials-images/${data.skchairpersonimage}" alt="Uploaded Image">`;
    
    // SECRETARY
    document.querySelector('#add-officials input[name="barangaySecretaryFirstName"]').value = data.barangaysecretaryfirstname;
    document.querySelector('#add-officials input[name="barangaySecretaryLastName"]').value = data.barangaysecretarylastname;
    document.querySelector('#add-officials input[name="barangaySecretaryMiddleName"]').value = data.barangaysecretarymiddlename;
    const preview8 = document.getElementById("imagePreview8");
    preview8.innerHTML = `<img src="/uploads/barangay-officials-images/${data.barangaysecretaryimage}" alt="Uploaded Image">`;
    
    // TREASURER
    document.querySelector('#add-officials input[name="barangayTreasurerFirstName"]').value = data.barangaytreasurerfirstname;
    document.querySelector('#add-officials input[name="barangayTreasurerLastName"]').value = data.barangaytreasurerlastname;
    document.querySelector('#add-officials input[name="barangayTreasurerMiddleName"]').value = data.barangaytreasurermiddlename;
    const preview9 = document.getElementById("imagePreview9");
    preview9.innerHTML = `<img src="/uploads/barangay-officials-images/${data.barangaytreasurerimage}" alt="Uploaded Image">`;

  // KAGAWAD DATA
  for (let i = 1; i <= 7; i++) {
    // Dynamically access data properties and input fields
    document.querySelector(`#add-officials input[name="kagawad${i}FirstName"]`).value = data[`kagawad${i}firstname`] || '';
    document.querySelector(`#add-officials input[name="kagawad${i}LastName"]`).value = data[`kagawad${i}lastname`] || '';
    document.querySelector(`#add-officials input[name="kagawad${i}MiddleName"]`).value = data[`kagawad${i}middlename`] || '';

    // Update image preview
    const preview = document.getElementById(`imagePreview${i}`);
    preview.innerHTML = data[`kagawad${i}image`] 
        ? `<img src="/uploads/barangay-officials-images/${data[`kagawad${i}image`]}" alt="Uploaded Image">` 
        : '';
  }

}