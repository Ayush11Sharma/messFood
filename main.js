document.addEventListener("DOMContentLoaded", () => {
  let scanner = null;
  let currentSelectedMeal = "Lunch";
  let isProcessing = false;
  let scanTimeout = null;

  const scannerModal = document.getElementById("scannerModal");
  const closeModalButtons = document.querySelectorAll(".close");
  const scanHint = document.querySelector(".scan-hint");
  const scannerContainer = document.getElementById("scanner");
  const scanFrame = document.getElementById("scanFrame");

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

  // Reset scanner UI state
  function resetScannerUI() {
    const redScanLine = document.querySelector(".red-scan-line");
    if (scannerContainer) {
      scannerContainer.style.filter = "none";
      scannerContainer.classList.remove("frozen");
    }
    if (scanFrame) {
      scanFrame.classList.remove("processing");
    }
    if (scanHint) {
      scanHint.innerHTML = "Point camera at QR code";
      scanHint.classList.remove("processing");
    }
    if (redScanLine) {
      redScanLine.style.display = "block";
    }
  }

  // Handle successful QR detection (freeze camera feed, show processing state for 2.5s on scanner screen, then navigate)
  function handleScanSuccess(decodedText) {
    if (isProcessing) return; // Prevent duplicate scan triggers
    isProcessing = true;

    console.log(`QR Code detected: ${decodedText || "simulated"}`);

    // 1. Immediately pause/freeze video feed and scanner (keep last frame visible)
    const videoEl = scannerContainer ? scannerContainer.querySelector("video") : null;
    if (videoEl) {
      try {
        videoEl.pause();
      } catch (e) {
        console.log("Error pausing video element:", e);
      }
    }

    if (scanner && typeof scanner.pause === "function") {
      try {
        scanner.pause(true);
      } catch (e) {
        console.log("Error pausing html5-qrcode scanner:", e);
      }
    }

    // 2. Dim camera feed on freeze
    if (scannerContainer) {
      scannerContainer.style.filter = "brightness(0.65)";
      scannerContainer.classList.add("frozen");
    }

    // 3. Hide red scan line after detection
    const redScanLine = document.querySelector(".red-scan-line");
    if (redScanLine) {
      redScanLine.style.display = "none";
    }


    // 5. 2.5 second delay on the scanner screen before navigation
    scanTimeout = setTimeout(() => {
      if (scanner) {
        try {
          scanner
            .stop()
            .catch((err) => console.log("Error stopping scanner:", err));
        } catch (e) {
          console.log(e);
        }
      }
      hideModal(scannerModal);
      navigateToPass(currentSelectedMeal);
      isProcessing = false;
    }, 2500);
  }

  // Initialize QR code scanner
  function initScanner(mealType) {
    currentSelectedMeal = mealType || "Lunch";
    isProcessing = false;
    if (scanTimeout) {
      clearTimeout(scanTimeout);
      scanTimeout = null;
    }

    resetScannerUI();

    if (scanner) {
      try {
        scanner
          .stop()
          .catch((err) => console.log("Error stopping scanner:", err));
      } catch (e) {
        console.log(e);
      }
    }

    if (scannerContainer) {
      scannerContainer.innerHTML = "";
    }

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
            handleScanSuccess(decodedText);
          },
          (error) => {
            // normal scan loop iteration
          }
        )
        .catch((err) => {
          console.log("Scanner camera error:", err);
          showMockFeed();
        });
    } else {
      showMockFeed();
    }
  }

  function showMockFeed() {
    if (scannerContainer && !scannerContainer.querySelector(".mock-feed")) {
      scannerContainer.innerHTML = `
        <div class="mock-feed">
          <img src="qrrr.png" class="mock-qr" alt="QR Code Feed" />
        </div>
      `;
    }
  }

  // Enable click on scan frame & scanner feed to simulate scanning
  if (scanFrame) {
    scanFrame.addEventListener("click", () => {
      handleScanSuccess("simulated_qr_code");
    });
  }

  if (scannerContainer) {
    scannerContainer.addEventListener("click", () => {
      handleScanSuccess("simulated_qr_code");
    });
  }

  // Start scanner on meal button click
  document.querySelectorAll(".meal-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const mealType = button.getAttribute("data-meal") || "Lunch";
      currentSelectedMeal = mealType;
      showModal(scannerModal);
      initScanner(mealType);
    });
  });

  // Close scanner modal button click
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (scanTimeout) {
        clearTimeout(scanTimeout);
        scanTimeout = null;
      }
      isProcessing = false;
      hideModal(scannerModal);
      if (scanner) {
        try {
          scanner
            .stop()
            .catch((err) => console.log("Error stopping scanner:", err));
        } catch (e) {
          console.log(e);
        }
      }
      resetScannerUI();
    });
  });
});

