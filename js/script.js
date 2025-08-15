document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const messageBox = document.getElementById("formMessage");
  const submitButton = form.querySelector(".form-btn");
  const sendText = submitButton.querySelector('.send-text');
  const loadingSpinner = submitButton.querySelector('.loading-spinner');
  const sendIcon = submitButton.querySelector('.send-icon');

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!navigator.onLine) {
      showMessage("📴 You are offline. Please check your internet connection.", "red");
      return;
    }

    messageBox.style.display = "none";
    sendText.style.display = 'none';
    sendIcon.style.display = 'none';
    loadingSpinner.style.display = 'inline-block';
    submitButton.disabled = true;

    const submissionData = {};
    const formData = new FormData(form);
    for (const [key, value] of formData.entries()) {
      submissionData[key] = value;
    }

    // Collect detailed device & browser info
    submissionData.device_info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      cores: navigator.hardwareConcurrency || "N/A",
      memory: navigator.deviceMemory || "N/A",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        pixelDepth: screen.pixelDepth,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      network: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : "Not supported",
      incognito: await isIncognitoMode()
    };

    try {
      // Get public IP & location
      const ipResponse = await fetch("https://ipapi.co/json/");
      const ipData = await ipResponse.json();
      submissionData.ip_info = ipData;

      // Submit
      const response = await fetch(form.action, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
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

  // Try to detect incognito/private browsing
  async function isIncognitoMode() {
    return new Promise(resolve => {
      const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
      if (!fs) {
        resolve("Unknown");
        return;
      }
      fs(window.TEMPORARY, 100, () => resolve(false), () => resolve(true));
    });
  }
});
