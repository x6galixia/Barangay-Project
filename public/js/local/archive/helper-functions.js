document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('complainant').addEventListener('input', function () {
        const query = document.getElementById("complainant").value;
        console.log("Input query:", query);
    });
});