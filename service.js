var http = require('http');

var server = http.createServer();

server.listen(8000);

var connect = require('connect')
  , http = require('http')
  , fs = require('fs')
  , browserify = require('browserify')

var cacheAge = process.env.NODE_ENV === 'production' ?  0 : 60 * 60 * 1000;

app = connect()
  .use(connect.favicon())
  .use(connect.compress()) // must be before static
  .use(connect.static('public', { maxAge: cacheAge }))
  .use(function(req, res) {

    if (req.url === '/') {
      // HTML is implied
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync('./index.html'));
    }

    if (req.url === '/example') {
      // HTML is implied
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fs.readFileSync('./collision-example.html'));
    }

    if (req.url === '/client') {
      var b = browserify();
      b.add('./client/index.js');

      // optional: ignore weird requires
      // b.ignore('./lib-cov/merge')

      b.bundle().pipe(res);
    }



    /*
    if (req.url === '/faye.js') {
      res.writeHead(200, { 'Content-Type': 'text/javascript' });
      res.end(fs.readFileSync('./node_modules/faye/browser/faye-browser.js'));
    }
    if(req.url === '/client.js') {
      var b = browserify();
      b.add('./client.js');

      // Hack annoying tea-type conditional require
      b.ignore('./lib-cov/merge')
      b.ignore('./lib-cov/type')
      b.bundle().pipe(res);
    }
    if(req.url === '/body') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(fs.readFileSync(file).toString())
    }*/
  })

var port = process.env.PORT || 3000;
http.createServer(app).listen(port);
console.log("Listening on port", port)
