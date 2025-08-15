document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const messageBox = document.getElementById("formMessage");
  const submitButton = form.querySelector(".form-btn");
  const sendText = submitButton.querySelector('.send-text');
  const loadingSpinner = submitButton.querySelector('.loading-spinner');
  const sendIcon = submitButton.querySelector('.send-icon');

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Check network status first
    if (!navigator.onLine) {
      showMessage("📴 You are offline. Please check your internet connection.", "red");
      return;
    }

    messageBox.style.display = "none";

    // Show loading state
    sendText.style.display = 'none';
    sendIcon.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    submitButton.disabled = true;

    const submissionData = {};
    const formData = new FormData(form);

    // Populate form data
    for (const [key, value] of formData.entries()) {
      submissionData[key] = value;
    }

    // Collect device/browser info
    submissionData.device_info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    };

    try {
      // Fetch IP and location (HTTPS for mobile safety)
      const ipResponse = await fetch("https://ipapi.co/json/");
      const ipData = await ipResponse.json();
      submissionData.ip_info = ipData;

      // Submit combined data
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        form.reset();
        showMessage("✅ Thank you! Your message has been sent.", "green");
      } else {
        const errorData = await response.json().catch(() => ({}));
        showMessage(`❌ Failed to send: ${errorData.message || "Please try again."}`, "red");
      }
    } catch (error) {
      showMessage("⚠️ Network error. Please try again.", "red");
    } finally {
      // Reset button
      sendText.style.display = 'inline-block';
      sendIcon.style.display = 'inline-block';
      loadingSpinner.style.display = 'none';
      submitButton.disabled = false;
    }
  });

  function showMessage(text, color) {
    messageBox.textContent = text;
    messageBox.style.color = color;
    messageBox.style.display = "block";
  }
});
