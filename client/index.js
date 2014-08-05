var audiojumbler = require('./audiojumbler');
var range = require('mout/array/range');
var domready = require('domready');

domready(function () {
  var aj = new audiojumbler();
  aj.start("http://uncovered-proxy.herokuapp.com/mp3-preview/f60c420261754542594ddb4a46ed42972d2b9fd0");
});

window.getAccessToken = require('../auth/client').getAccessToken


function webAPI(path, success) {
  $.ajax({
     url: 'https://api.spotify.com/v1' + path,
     headers: {
         'Authorization': 'Bearer ' + window.getAccessToken()
     },
     success: success,
     error: function() {
       console.warn("ERORROROOR", arguments)
     }
 });
}

window.shit = function() {
  webAPI('/me', function(meResponse) {
    var username = meResponse.id;
    webAPI('/users/'+username+'/playlists', function(playlistListResponse) {
      var designatedPlaylistId = null;

      playlistListResponse.items.forEach(function(item) {
        if (item.name === 'uncovered') {
          designatedPlaylistId = item.id
        }
      });
      if (!designatedPlaylistId) {
        throw new Error('You must have a playlist named "uncovered"!');
      }

      webAPI('/users/'+username+'/playlists/'+designatedPlaylistId, function(response) {
        var rows = response.tracks.items
        var imageUrls = rows.map(function(row) {
          return row.track.album.images[1].url;
        })

        var randomUrl =
          imageUrls[Math.floor(Math.random() * imageUrls.length-1) + 1]

        console.image(randomUrl)
      })

    });
  });
}
