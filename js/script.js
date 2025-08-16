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
      // Browser & OS
      userAgent: navigator.userAgent,
      userAgentData: navigator.userAgentData ? navigator.userAgentData.toJSON() : null,
      appVersion: navigator.appVersion,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      webdriver: navigator.webdriver,
      cores: navigator.hardwareConcurrency || "N/A",
      memory: navigator.deviceMemory || "N/A",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      online: navigator.onLine,
      referrer: document.referrer,
      pageURL: location.href,

      // Screen
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        pixelDepth: screen.pixelDepth,
        colorDepth: screen.colorDepth,
        orientation: screen.orientation ? screen.orientation.type : "N/A",
        refreshRate: await getRefreshRate(),
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      },

      // Viewport
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },

      // Network Info
      network: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : "Not supported",

      // Storage Info
      storage: navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate().then(estimate => ({
        quota: estimate.quota,
        usage: estimate.usage
      })) : "Not supported",

      // Battery Info
      battery: navigator.getBattery ? await navigator.getBattery().then(battery => ({
        charging: battery.charging,
        level: battery.level,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      })) : "Not supported",

      // GPU Info
      gpu: getWebGLInfo(),

      // Media Devices
      mediaDevices: navigator.mediaDevices && navigator.mediaDevices.enumerateDevices ?
        await navigator.mediaDevices.enumerateDevices().then(devices => devices.map(d => ({
          kind: d.kind,
          label: d.label || "N/A",
          deviceId: d.deviceId
        }))) : "Not supported",

      // Browser Feature Detection
      features: {
        serviceWorker: 'serviceWorker' in navigator,
        localStorage: 'localStorage' in window,
        sessionStorage: 'sessionStorage' in window,
        indexedDB: 'indexedDB' in window,
        geolocation: 'geolocation' in navigator,
        notifications: 'Notification' in window,
        webGL: 'WebGLRenderingContext' in window
      },
      
      // Fingerprinting
      fingerprint: {
        canvasHash: getCanvasFingerprint(),
        audioHash: getAudioFingerprint(),
      },

      // Incognito detection
      incognito: await isIncognitoMode(),

      // Mini network speed test
      speedTest: await miniSpeedTest()
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

  // Detect incognito
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

  // Estimate refresh rate
  async function getRefreshRate() {
    return new Promise(resolve => {
      let start = performance.now();
      requestAnimationFrame(() => {
        let end = performance.now();
        resolve(Math.round(1000 / (end - start)));
      });
    });
  }

  // Mini speed test
  async function miniSpeedTest() {
    const imageUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg";
    const startTime = performance.now();
    try {
      const response = await fetch(imageUrl + "?cache=" + Math.random(), { cache: "no-store" });
      const blob = await await response.blob();
      const endTime = performance.now();
      const sizeMB = blob.size / (1024 * 1024);
      const speedMbps = (sizeMB / ((endTime - startTime) / 1000)) * 8;
      return { sizeMB: sizeMB.toFixed(2), speedMbps: speedMbps.toFixed(2) };
    } catch {
      return "Speed test failed";
    }
  }

  // Advanced GPU Info
  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return "Not supported";
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        };
      }
      return "Not available";
    } catch (e) {
      return "Error retrieving GPU info";
    }
  }
  
  // Canvas Fingerprinting
  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const txt = 'BrowserJS fingerprinting';
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText(txt, 4, 17);
      return canvas.toDataURL();
    } catch (e) {
      return "Canvas fingerprint failed";
    }
  }

  // Audio Fingerprinting
  function getAudioFingerprint() {
    try {
      const context = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = 12;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;
      oscillator.connect(compressor);
      compressor.connect(context.destination);
      oscillator.start(0);
      const fingerprint = context.startRendering();
      return fingerprint.then(buffer => {
        let hash = 0;
        for (let i = 0; i < buffer.getChannelData(0).length; i++) {
          hash += Math.abs(buffer.getChannelData(0)[i]);
        }
        return hash;
      });
    } catch (e) {
      return "Audio fingerprint failed";
    }
  }
});