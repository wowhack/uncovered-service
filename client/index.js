var audiojumbler = require('./audiojumbler');
var range = require('mout/array/range');
var domready = require('domready');

domready(function () {
  var aj = new audiojumbler();
  aj.start("http://uncovered-proxy.herokuapp.com/mp3-preview/f60c420261754542594ddb4a46ed42972d2b9fd0");
});

window.getAccessToken = require('../auth/client').getAccessToken
