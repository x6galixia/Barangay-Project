function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


const overlay = document.querySelector(".overlay");

function popUp_button(button) {
  var buttonId = button.id;
  var select = button.value;


  overlay.classList.add("visible");
}

// close pop-up
document.querySelectorAll(".close_popUp").forEach(function (closeBtn) {
  closeBtn.addEventListener("click", function () {
    var pop_up = closeBtn.closest(".pop-up");
    if (pop_up) {
      pop_up.classList.remove("visible");
      overlay.classList.remove("visible");
    }
  });
});

// close pop-up
document.querySelectorAll(".close_popUp1").forEach(function (closeBtn) {
  closeBtn.addEventListener("click", function () {
    var pop_up = closeBtn.closest(".pop-up-confirm");
    if (pop_up) {
      pop_up.classList.remove("visible");
      overlay.classList.remove("visible");
    }
  });
});

//close pop-up 2
document.querySelectorAll(".close_confirm").forEach(function (closeBtn) {
  closeBtn.addEventListener("click", function () {
    var pop_up_confirm = closeBtn.closest(".pop-up-confirm");
    if (pop_up_confirm) {
      pop_up_confirm.classList.remove("visible");
    }
  });
});

//SUCCESS

const submitPrompt = document.getElementById("submit_prompt");
document.addEventListener("DOMContentLoaded", function () {
  if (submitPrompt) {
    submitPrompt.style.display = "flex";
    overlay.classList.add("visible"); // Show the pop-up
  }
});

function closePopup() {
  if (submitPrompt) {
    submitPrompt.style.display = "none";
  }
  if (document.getElementById("submit_prompt1")) {
    document.getElementById("submit_prompt1").classList.remove("visible1")
  }
  overlay.classList.remove("visible");
}
