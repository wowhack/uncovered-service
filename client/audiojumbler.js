function AudioJumbler() {
  this.url = null;
  this.context = new AudioContext();
  this.lfoGainValues = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
  this.gainNodes = {};
}

AudioJumbler.prototype.setParams = function (lfoValues, fqValues) {
  var self = this;
  self.lfoGainValues = lfoValues;
  for (k in self.gainNodes) {
    var gainNode = self.gainNodes[k];
    var node = k - 4;
    if (node in fqValues) {
      gainNode.gain.value = fqValues[node];
    } else {
      // Full gain
      gainNode.gain.value = 1.0;
    }
  }
};

AudioJumbler.prototype.stop = function() {
  var self = this;
  self.context.stop();
};

AudioJumbler.prototype.start = function (url) {
  var self = this;
  var current16thNote = 0;     // What note is currently last scheduled?
  var tempo = 120.0;           // tempo (in beats per minute)
  var lookahead = 25.0;        // How frequently to call scheduling function (in milliseconds)
  var scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
                               // This is calculated from lookahead, and overlaps
                               // with next interval (in case the timer is late)
  var nextNoteTime = 0.0;      // when the next note is due.
  var timerID = 0;             // setInterval identifier.

  var lfoGain = self.context.createGain();
  lfoGain.gain.value = 0.0;
  lfoGain.connect(self.context.destination);

  function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / tempo;
    nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

    current16thNote++;
    if (current16thNote == 16) {
        current16thNote = 0;
    }
  }

  function scheduleNote(beatNumber, time) {
    var lfoGainValue = self.lfoGainValues[beatNumber];
    var secondsPerBeat = 60.0 / tempo;
    lfoGain.gain.setValueAtTime(lfoGainValue, time);
  }

  function scheduler() {
    while (nextNoteTime < self.context.currentTime + scheduleAheadTime) {
        scheduleNote(current16thNote, nextNoteTime);
        nextNote();
    }
    timerID = window.setTimeout(scheduler, lookahead);
  }

  function loadTrack(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
      self.context.decodeAudioData(request.response, onFinishedLoading, function(){});
    };
    request.send();
  }

  function onFinishedLoading(buffer) {
    var source = self.context.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.loop = true;

    var eqParams = [
      {
        fq: 20.0
      },
      {
        fq: 31.7
      },
      {
        fq: 50.2
      },
      {
        fq: 79.6
      },
      {
        fq: 126
      },
      {
        fq: 200
      },
      {
        fq: 317
      },
      {
        fq: 502
      },
      {
        fq: 796
      },
      {
        fq: 1260
      },
      {
        fq: 2000
      },
      {
        fq: 3170
      },
      {
        fq: 5020
      },
      {
        fq: 7960
      },
      {
        fq: 12600
      },
      {
        fq: 20000
      }
    ];

    for (k in eqParams) {
      function addEqNode(params) {
        var bp = self.context.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = eqParams[k].fq;
        bp.Q.value = eqParams[k].q || 1.8;
        bp.gain.value = 0;

        source.connect(bp);

        var gain = self.context.createGain();
        gain.gain.value = 0.0;
        self.gainNodes[k] = gain;

        bp.connect(gain);
        gain.connect(lfoGain);
      }
      addEqNode(eqParams[k]);
    }

    scheduler(); // Kick off scheduling
    source.start(0);                           // play the source now
  }

  loadTrack(url);
};

module.exports = AudioJumbler;