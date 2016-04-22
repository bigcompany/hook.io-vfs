var config = require('../../../../config');
var vfs = require('../../../../');
var psr = require('parse-service-request');
module['exports'] = function layout (opts, cb) {
  var $ = this.$,
  req = opts.req,
  res = opts.res;
  // console.log(req)
  psr(req, res, function(req, res, fields){
    var params = req.resource.params;
    // validate incoming API request for correct adapter information
    params.adapter = params.adapter || "google";
    // console.log('ppp', fields, params)
    // req.env = config;
    var client = vfs.createClient(config.adapters[params.adapter]);
    req.vfs = client;
    cb(null, $.html());
  });
};