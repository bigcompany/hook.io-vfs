var vfs = require('../../../../');
var psr = require('parse-service-request');
var config = require('../../../../config');

module['exports'] = function layout (opts, cb) {

  var $ = this.$,
  req = opts.req,
  res = opts.res;

  // generic white-label function for performing {{mustache}} style replacements of site data
  // Note: Site requires absolute links ( no relative links! )
  req.white = function whiteLabel ($, opts) {
    var out = $.html();
    var appName = "hook.io",
        appAdminEmail = "hookmaster@hook.io",
        appPhonePrimary = "1-917-267-2516";
    out = out.replace(/\{\{appName\}\}/g, appName);
    out = out.replace(/\{\{appDomain\}\}/g, config.app.domain);
    out = out.replace(/\{\{appUrl\}\}/g, config.app.url);
    out = out.replace(/\{\{appAdminEmail\}\}/g, appAdminEmail);
    out = out.replace(/\{\{appPhonePrimary\}\}/g, appPhonePrimary);
    return $.load(out);
  };

  $ = req.white($);

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
      "/": {
        role: "files::readdir"
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

    // this is important for security, as you probably don't want every request getting access to a vfs client
    // use the built in RBAC system or override at your own risk
    function bindClientToRequest () {
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
    };

    if (_role === "none") {
      console.log('no role access found, will not create client...');
      console.log("WARNING binding anyway");
      bindClientToRequest();
      return cb(null, $.html());
    }
    _role = _role.role;
    checkRoleAccess({ req: opts.req, res: opts.res, role: _role }, function (err, hasPermission) {
      if (!hasPermission) {
        return res.end(unauthorizedRoleAccess(req, _role));
      } else {
        bindClientToRequest();
        return cb(null, $.html());
      }
    });
  });
};