import { H as Hls } from "./hls.js";

const shells = document.querySelectorAll("[data-player]");

shells.forEach((shell) => {
  const video = shell.querySelector("video");
  const overlay = shell.querySelector(".play-overlay");

  if (!video || !overlay) return;

  const stream = video.getAttribute("data-stream");
  let bound = false;
  let hls = null;

  const bind = () => {
    if (bound || !stream) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 30
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    bound = true;
  };

  const play = async () => {
    bind();
    shell.classList.add("is-playing");
    overlay.hidden = true;

    try {
      await video.play();
    } catch (error) {
      overlay.hidden = false;
      shell.classList.remove("is-playing");
    }
  };

  overlay.addEventListener("click", play);

  video.addEventListener("click", () => {
    if (!bound || video.paused) {
      play();
    }
  });

  video.addEventListener("play", () => {
    overlay.hidden = true;
    shell.classList.add("is-playing");
  });

  video.addEventListener("ended", () => {
    overlay.hidden = false;
    shell.classList.remove("is-playing");
  });

  window.addEventListener("beforeunload", () => {
    if (hls) {
      hls.destroy();
    }
  });
});
