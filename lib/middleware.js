var view = require('view');
var path = require('path')
module['exports'] = function vfsMiddleware (opts) {
  var _path =  __dirname + '/../view/api/v1/fs';
  return function (req, res, next) {
    // TODO: implement view cache, so view is not reloaded from disk on every request ( dev mode only )
    view.create({ path: _path, autoindex: true, parent: opts.parent }, function (err, _view) {
      if (err) {
        return res.end(err.message);
      }
      return view.middle({
        view: _view,
        autoindex: true,
        unauthorizedRoleAccess: opts.unauthorizedRoleAccess,
        checkRoleAccess: opts.checkRoleAccess
      })(req, res, next);
    });
  }
}