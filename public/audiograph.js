window.onload = init;

function init() {
  var context = new AudioContext();

  function loadTrack(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
      context.decodeAudioData(request.response, onFinishedLoading, onError);
    };
    request.send();
  }

  function onFinishedLoading(buffer) {
    var source = context.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(context.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);                           // play the source now
  }

//  loadTrack("https://p.scdn.co/mp3-preview/f60c420261754542594ddb4a46ed42972d2b9fd0");
  loadTrack("http://soundbible.com/grab.php?id=2058&type=mp3");
}
