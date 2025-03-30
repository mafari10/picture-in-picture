// Assign variables
let hasStarted = false;
const video = document.getElementById("video");
const button = document.getElementById("button");

// Prompt to select media Stream then pass to video element before playing
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

// Add EventListner
button.addEventListener("click", pictureInpicture);
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

// On load
selectMediaStream();
