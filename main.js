document.addEventListener("DOMContentLoaded", () => {
  let scanner;
  let currentSelectedMeal = "Lunch";
  const scannerModal = document.getElementById("scannerModal");
  const closeModalButtons = document.querySelectorAll(".close");

  // Function to show modal
  function showModal(modal) {
    modal.classList.add("open");
    modal.style.display = "flex";
  }

  // Function to hide modal
  function hideModal(modal) {
    modal.classList.remove("open");
    modal.style.display = "none";
  }

  // Function to navigate to pass with selected meal
  function navigateToPass(meal) {
    const mealToPass = meal || currentSelectedMeal || "Lunch";
    sessionStorage.setItem("selectedMeal", mealToPass);
    window.location.href = `mess-pass.html?meal=${encodeURIComponent(mealToPass)}`;
  }

  // Initialize QR code scanner
  function initScanner(mealType) {
    currentSelectedMeal = mealType || "Lunch";
    if (scanner) {
      scanner
        .stop()
        .catch((err) => console.log("Error stopping scanner:", err));
    }

    const scannerContainer = document.getElementById("scanner");
    scannerContainer.innerHTML = "";

    if (window.Html5Qrcode) {
      scanner = new Html5Qrcode("scanner");
      scanner
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            console.log(`QR Code detected: ${decodedText}`);
            scanner
              .stop()
              .catch((err) => console.log("Error stopping scanner:", err));
            hideModal(scannerModal);
            navigateToPass(currentSelectedMeal);
          },
          (error) => {
            // scanning loop...
          }
        )
        .catch((err) => {
          console.log("Scanner camera error:", err);
          if (!scannerContainer.querySelector(".mock-feed")) {
            scannerContainer.innerHTML = `
              <div class="mock-feed">
                <img src="qrrr.png" class="mock-qr" alt="QR Code Feed" />
              </div>
            `;
          }
        });
    } else {
      scannerContainer.innerHTML = `
        <div class="mock-feed">
          <img src="qrrr.png" class="mock-qr" alt="QR Code Feed" />
        </div>
      `;
    }
  }

  // Enable click on scan frame to simulate scanning
  const scanFrame = document.getElementById("scanFrame");
  if (scanFrame) {
    scanFrame.addEventListener("click", () => {
      hideModal(scannerModal);
      navigateToPass(currentSelectedMeal);
    });
  }

  // Also handle click on mock scanner feed
  const scannerContainer = document.getElementById("scanner");
  if (scannerContainer) {
    scannerContainer.addEventListener("click", () => {
      hideModal(scannerModal);
      navigateToPass(currentSelectedMeal);
    });
  }

  // Start scanner on button click
  document.querySelectorAll(".meal-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const mealType = button.getAttribute("data-meal") || "Lunch";
      currentSelectedMeal = mealType;
      showModal(scannerModal);
      initScanner(mealType);
    });
  });

  // Close modals
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      hideModal(scannerModal);
      if (scanner && scanner.isScanning) {
        scanner
          .stop()
          .catch((err) => console.log("Error stopping scanner:", err));
      }
    });
  });
});
