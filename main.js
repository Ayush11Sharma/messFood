document.addEventListener("DOMContentLoaded", () => {
  let scanner;
  const scannerModal = document.getElementById("scannerModal");
  const closeModalButtons = document.querySelectorAll(".close");

  // Function to show modal
  function showModal(modal) {
    modal.style.display = "block";
  }

  // Function to hide modal
  function hideModal(modal) {
    modal.style.display = "none";
  }

  // Initialize QR code scanner
  function initScanner(mealType) {
    if (scanner) {
      scanner
        .stop()
        .catch((err) => console.log("Error stopping scanner:", err));
    }

    scanner = new Html5Qrcode("scanner");
    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          console.log(`QR Code detected: ${decodedText}`);
          scanner
            .stop()
            .catch((err) => console.log("Error stopping scanner:", err));
          hideModal(scannerModal);
          // Redirect to mess-pass.html with the meal type as a query parameter
          window.location.href = `mess-pass.html?meal=${mealType}`;
        },
        (error) => {
          console.log(`QR Code scan error: ${error}`);
        }
      )
      .catch((err) => console.log("Scanner initialization error:", err));
  }

  // Start scanner on button click
  document.querySelectorAll(".meal-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const mealType = button.getAttribute("data-meal"); // Get the meal type from the button
      showModal(scannerModal);
      initScanner(mealType);
    });
  });

  // Close modals
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      hideModal(scannerModal);
      if (scanner) {
        scanner
          .stop()
          .catch((err) => console.log("Error stopping scanner:", err));
      }
    });
  });
});
