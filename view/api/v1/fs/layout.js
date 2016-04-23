var config = require('../../../../config');
var vfs = require('../../../../');
var psr = require('parse-service-request');
module['exports'] = function layout (opts, cb) {
  var $ = this.$,
  req = opts.req,
  res = opts.res;

  psr(req, res, function(req, res, fields){
    var params = req.resource.params;
    // validate incoming API request for correct adapter information
    params.adapter = params.adapter || "google";
    // console.log('ppp', fields, params)
    // req.env = config;

    var checkRoleAccess = opts.checkRoleAccess || function defaultCheckRoleAcess (opts, cb) {
      console.log('missing opts.checkRoleAccess - using defaultCheckRoleAcess - always true');
      cb(null, true)
    };

    var unauthorizedRoleAccess = opts.unauthorizedRoleAccess || function defaultUnauthorizedRoleAccess (req, role) {
      console.log('missing opts.unauthorizedRoleAccess - using default invalid access callback');
      return res.end('missing opts.unauthorizedRoleAccess - using default invalid access callback');
    }

    checkRoleAccess({ req: opts.req, res: opts.res, role: "files::read" }, function (err, hasPermission) {
      if (!hasPermission) {
        return res.end(unauthorizedRoleAccess(req, "files::read"));
      } else {
        // console.log('using ad', params.adapter)
        var client = vfs.createClient(config.adapters[params.adapter]);
        req.vfs = client;
        return cb(null, $.html());
      }
    });
  });
};