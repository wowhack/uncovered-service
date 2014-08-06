var audiojumbler = require('./audiojumbler');
var quantize = require('./quantize');
var fft = require('./fft');
var featuremapping = require('./featuremapping');
var range = require('mout/array/range');
var shuffle = require('mout/array/shuffle');
var domready = require('domready');

domready(function () {
  // var aj = new audiojumbler();
  // aj.start("http://uncovered-proxy.herokuapp.com/mp3-preview/f60c420261754542594ddb4a46ed42972d2b9fd0");
});

window.getAccessToken = require('../auth/client').getAccessToken

function encodeQueryData(data) {
   var ret = [];
   for (var d in data)
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
   return ret.join("&");
}

function similarTracks(artist, track, success) {
  var params = {method: 'track.getsimilar', artist: artist, track: track, api_key: '3b187fbc8f2478d4eb3230d1f52c6cee', format: 'json'};
  var url = 'http://ws.audioscrobbler.com/2.0/?' + encodeQueryData(params);
  $.ajax({
     url: url,
     success: success,
     error: function() {
       console.warn("ERORROROOR", arguments)
     }
 });
}

function webAPI(path, token, success) {
  var headers = {}
  if (token)
    headers['Authorization'] = 'Bearer ' + token;
  $.ajax({
     url: 'https://api.spotify.com/v1' + path,
     headers: headers,
     success: success,
     error: function() {
       console.warn("ERORROROOR", arguments)
     }
 });
}

window.shit = function() {
  token = window.getAccessToken();
  webAPI('/me', token, function(meResponse) {
    var username = meResponse.id;
    webAPI('/users/'+username+'/playlists',  token, function(playlistListResponse) {
      var designatedPlaylistId = null;

      playlistListResponse.items.forEach(function(item) {
        if (item.name === 'uncovered') {
          designatedPlaylistId = item.id
        }
      });
      if (!designatedPlaylistId) {
        throw new Error('You must have a playlist named "uncovered"!');
      }

      webAPI('/users/'+username+'/playlists/'+designatedPlaylistId,  token, function(response) {
        var rows = response.tracks.items
        var imageUrls = rows.map(function(row) {
          return row.track.album.images[0].url;
        })

        var randomUrl =
          imageUrls[Math.floor(Math.random() * imageUrls.length-1) + 1]

        console.image(randomUrl)
      })

    });
  });
}

window.testTrack = function(trackURL, callback) {
  var trackId = trackURL.split('/')[4];

  webAPI('/tracks/'+trackId, null,
         function(response) {
           similarTracks(response.artists[0].name, response.name,
                         function (simResponse) {
                           callback({
                                      album_image: response.album.images[0],
                                      audio_preview_url: response.preview_url,
                                      artist: response.artists[0].name,
                                      name: response.name,
                                      similar_tracks: simResponse
                                    });
                         });
         });
}

window.bohrarper = function() {
  window.testTrack('http://open.spotify.com/track/6GSbE1IHSbPV13uZmaIWeV', function(stuff) {
    console.log("Image url is:", stuff.album_image.url)
    console.log("Image width is:", stuff.album_image.width)
    console.log("Audio is:", stuff.audio_preview_url)
  })
}

window.quantize = quantize;
window.fft = fft;
window.featuremapping = featuremapping(); // yeah
window.audiojumbler = audiojumbler;
window.shuffle = shuffle;