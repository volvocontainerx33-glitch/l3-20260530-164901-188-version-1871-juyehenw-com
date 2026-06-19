(function () {
  var stage = document.querySelector('[data-video-url]');

  if (!stage) {
    return;
  }

  var video = stage.querySelector('video');
  var button = stage.querySelector('.play-control');
  var source = stage.getAttribute('data-video-url');
  var prepared = false;
  var hlsInstance = null;

  function prepare() {
    if (prepared || !video || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }

    prepared = true;
  }

  function playVideo() {
    prepare();
    stage.classList.add('is-playing');

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        stage.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      playVideo();
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      stage.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      stage.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      stage.classList.remove('is-playing');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
