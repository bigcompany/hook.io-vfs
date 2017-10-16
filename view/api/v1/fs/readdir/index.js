module['exports'] = function readdirPresenter (opts, cb) {
  var req = opts.req,
      res = opts.res;
  var params = req.resource.params;
  if (typeof params.path !== "string") {
    params.path = "";
  }
  req.vfs.readdir(params.path, function (err, dir, vinyl) {
    if (err) {
      return res.end(err.message);
    }
    if (params.vinyl === true) {
      var arr = [];
      // serialize directory representation to pass over the wire
      vinyl.forEach(function (v) {
        arr.push(v.toJSON())
      });
      res.json(arr);
    } else {
      res.json(dir);
    }
  });
};