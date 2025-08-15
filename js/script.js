document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const messageBox = document.getElementById("formMessage");
  const submitButton = form.querySelector(".form-btn");
  const sendText = submitButton.querySelector('.send-text');
  const loadingSpinner = submitButton.querySelector('.loading-spinner');
  const sendIcon = submitButton.querySelector('.send-icon');

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    messageBox.style.display = "none";
    
    // Show loading state
    sendText.style.display = 'none';
    sendIcon.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    submitButton.disabled = true;

    // 📦 Create a structured object to hold all data
    const submissionData = {};
    const formData = new FormData(form);

    // 📋 Populate with form data
    for (const [key, value] of formData.entries()) {
      submissionData[key] = value;
    }

    try {
      // 🌐 Fetch IP and location data
      const ipResponse = await fetch("http://ip-api.com/json");
      const ipData = await ipResponse.json();

      // 🌍 Append IP/location data to the submission object
      submissionData.ip_info = ipData;

      // 🚀 Submit the combined data as JSON
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
        const errorData = await response.json();
        showMessage(`❌ Failed to send: ${errorData.message || "Please try again."}`, "red");
      }
    } catch (error) {
      showMessage("⚠️ Network error. Please try again.", "red");
    } finally {
      // Reset button to its original state
      sendText.style.display = 'inline-block';
      sendIcon.style.display = 'inline-block';
      loadingSpinner.style.display = 'none';
      submitButton.disabled = false;
    }
  });

  // 📢 Show message function
  function showMessage(text, color) {
    messageBox.textContent = text;
    messageBox.style.color = color;
    messageBox.style.display = "block";
  }
});