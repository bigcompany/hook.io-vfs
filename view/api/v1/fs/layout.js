var config = require('../../../../config');
var vfs = require('../../../../');
module['exports'] = function layout (opts, cb) {
  var $ = this.$,
  req = opts.request;
  var params = req.resource.params;
  // validate incoming API request for correct adapter information
  params.adapter = params.adapter || "google";
  // req.env = config;
  var client = vfs.createClient(config.adapters[params.adapter]);
  req.vfs = client;
  cb(null, $.html());
};