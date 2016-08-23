module['exports'] = function readdirPresenter (opts, cb) {
  var req = opts.req,
      res = opts.res;
  var params = req.resource.params;
  if (typeof params.path !== "string") {
    params.path = "";
  }
  req.vfs.readdir(params.path, function (err, file) {
    if (err) {
      return res.end(err.message);
    }
    res.json(file);
  });
};