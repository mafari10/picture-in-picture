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
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log(
          "ServiceWorker registration successful",
          registration.scope
        );
      })
      .catch((err) => {
        console.log("ServiceWorker registration failed: ", err);
      });
  });
}
