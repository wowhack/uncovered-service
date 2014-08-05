var querystring = require('querystring')


module.exports = {
  getAccessToken: function() {
    var absoluteURI = window.location.toString();
    var parts = absoluteURI.split('#');
    if (parts.length === 1) window.location = '/login';
    var query = querystring.parse(parts[1]);
    var token = query['access_token'];
    if (!token) window.location = '/login';
    return token;
  }
}
