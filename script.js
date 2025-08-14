document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactForm");
  const messageBox = document.getElementById("formMessage");

  // Callback for reCAPTCHA
  window.onSubmit = async function (token) {
    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.reset();
        messageBox.style.display = "block";
        messageBox.style.color = "green";
        messageBox.textContent = "✅ Thank you! Your message has been sent.";
      } else {
        messageBox.style.display = "block";
        messageBox.style.color = "red";
        messageBox.textContent = "❌ Failed to send. Please check captcha or try again.";
      }
    } catch (error) {
      messageBox.style.display = "block";
      messageBox.style.color = "red";
      messageBox.textContent = "⚠️ Network error. Please try again.";
    }
  };

  // Prevent default submit and call reCAPTCHA
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    grecaptcha.execute();
  });
});