var server = {};
module['exports'] = server;

var http = require('resource-http');
var config = require('../config');
var debug = require('debug');

server.listen = function listen (opts, cb) {
  opts = opts || {};
  cb = cb || function defaultStartCallback (err, httpServer) {
    if (err) {
      throw err;
    }
    console.log('Warning: No vfs.start callback sent, using default.')
  };
  var site = opts.site || {};
  site.port = config.http.port || 9999;
  //site.root = site.root || process.cwd() + "/public";
  site.view = site.view || process.cwd() + "/view";
  site.host = "0.0.0.0";
  //site.nodeinfo = true;
  //site.nodeadmin = true;
  site.domain = site.domain || "localhost";
  site.bodyParser = true;
  site.cacheView = true;
  site.auth = config.http.auth;
  site.autoindex = true;

  var vfs = require('../index');

  http.listen(site, function (err, httpServer) {
    if (err) {
      throw err;
    }
    debug('Started');
    var addr = httpServer.server.address();
    vfs.app = httpServer;
    cb(null, httpServer);
  });
  return vfs;
};