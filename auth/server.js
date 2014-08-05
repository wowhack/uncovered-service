var randomString = require('random-string');
var querystring = require('querystring');
var request = require('request');
function signIn(req, res) {
  var scopes = 'user-read-private user-read-email'
  var state = randomString();
  res.cookie('spotify_auth_state', state);
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: 'e00aa1fe20ad432ab68327d25a25ba88',
      scope: scopes,
      redirect_uri: 'http://localhost:8001/login-callback',
      state: state
    }));
}

function handleCallback(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {

    res.clearCookie('spotify_auth_state');
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: 'http://localhost:8001/login-callback',
        grant_type: 'authorization_code',
        client_id: 'e00aa1fe20ad432ab68327d25a25ba88',
        client_secret: '6af3661ef8174098ac68074880b89009'
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        console.log("some kind of error", arguments)
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
}

module.exports = {
  handleCallback: handleCallback,
  signIn: signIn
}
