var vfs = require('../../../../');
var psr = require('parse-service-request');
var config = require('../../../../config');

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


    var mappings = {
      "/writeFile": {
        role: "files::writeFile"
      },
      "/removeFile": {
        role: "files::removeFile"
      },
      "/readFile": {
        role: "files::readFile"
      },
      "/readdir": {
        role: "files::readdir"
      },
      "/stat": {
        role: "files::stat"
      },
      "/createWriteStream": {
        role: "files::createWriteStream"
      },
      "/createReadStream": {
        role: "files::createReadStream"
      }
    };

    var parsed = require('url').parse(req.url).pathname;

    var _role = mappings[parsed] || "none";

    if (_role === "none") {
      return cb(null, $.html());
    }
    _role = _role.role;

    checkRoleAccess({ req: opts.req, res: opts.res, role: _role }, function (err, hasPermission) {
      //console.log("ROLE CHECK", err, hasPermission)
      if (!hasPermission) {
        return res.end(unauthorizedRoleAccess(req, _role));
      } else {

        //console.log('using config', params.adapter, config.adapters[params.adapter])
        //console.log('owner', req.resource.owner)
        // TODO: merge over with any sent in config options
        var _config = {};
        for(var p in config.adapters[params.adapter]) {
          _config[p] = config.adapters[params.adapter][p];
        }

        if (req.resource.params && typeof req.resource.params.files === "object") {
          for(var p in req.resource.params.files) {
            _config[p] = req.resource.params.files[p];
          }
        }

        _config.root = req.resource.owner;
        // console.log('using API config', _config);
        var client = vfs.createClient(_config);
        req.vfs = client;
        return cb(null, $.html());
      }
    });
  });
};