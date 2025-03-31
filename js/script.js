// Wait for DOM to load before accessing elements
document.addEventListener("DOMContentLoaded", () => {
  // PWA Installation Handling
  let deferredPrompt;
  const installButton = document.getElementById("installButton");

  // Only proceed if elements exist
  if (installButton) {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installButton.style.display = "block";
    });

    installButton.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      installButton.style.display = "none";
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      deferredPrompt = null;
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installButton) installButton.style.display = "none";
    console.log("PWA was installed");
  });

  // Your existing Picture-in-Picture code
  let hasStarted = false;
  const video = document.getElementById("video");
  const button = document.getElementById("button");

  async function selectMediaStream() {
    try {
      hasStarted = true;
      const captureStream = await navigator.mediaDevices.getDisplayMedia();
      video.srcObject = captureStream;
      video.onloadedmetadata = () => {
        video.play();
      };
    } catch (error) {
      console.error(error);
    }
  }

  async function pictureInpicture() {
    try {
      if (hasStarted && document.pictureInPictureElement !== video) {
        button.disabled = true;
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error(error);
    } finally {
      button.disabled = false;
    }
  }

  if (button) {
    button.addEventListener("click", pictureInpicture);
  }

  selectMediaStream();
});

// Service Worker Registration
// Wait for DOM to load before accessing elements
document.addEventListener("DOMContentLoaded", () => {
  // Your existing PWA installation and PiP code

  // Enhanced service worker registration
  if ("serviceWorker" in navigator) {
    const swUrl = window.location.hostname.includes("github.io")
      ? "/mafari10/sw.js"
      : "/sw.js";

    const scope = window.location.hostname.includes("github.io")
      ? "/mafari10/"
      : "/";

    navigator.serviceWorker
      .register(swUrl, { scope })
      .then((registration) => {
        console.log("SW registered for scope:", registration.scope);
        // Optional: Check for updates every hour
        setInterval(() => registration.update(), 60 * 60 * 1000);
      })
      .catch((err) => {
        console.error("SW registration failed:", err);
      });
  }
});
