var url = require('url');
var http = require('http');
var httpProxy = require('http-proxy');

var port = process.env.VIRTUAL_PORT || 8080;
var api = {
  env: process.env.NTB_ENV || 'api',
  key: process.env.NTB_KEY
};

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

//
// Create your custom server and just call `proxy.web()` to proxy
// a web request to the target passed in the options
// also you can use `proxy.ws()` to proxy a websockets request
//
var server = http.createServer(function(req, res) {
  // Log requests
  console.log(new Date(), req.method, req.url);

  // Add CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', [
    'Count-Return',
    'Count-Total',
    'ETag',
    'Last-Modified',
    'Location',
    'X-Cache-Hit',
    'X-Ratelimit-Limit',
    'X-Ratelimit-Remaining',
    'X-Ratelimit-Reset'
  ].join(' '));

  // COORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
  }

  // Add HTTP Header
  req.headers.host = api.env + '.nasjonalturbase.no'

  // Add API key parameter
  u = url.parse(req.url, true);
  u.query.api_key = api.key;
  u.search = undefined; // query  will only be used if search is absent
  req.url = url.format(u);

  proxy.web(req, res, { target: 'http://' + req.headers.host });
});

console.log('listening on port ' + port)
server.listen(port);
