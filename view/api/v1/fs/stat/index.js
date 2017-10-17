module['exports'] = function statPresenter (opts, cb) {
  var req = opts.req,
      res = opts.res;
  var params = req.resource.params;
  if (typeof params.path !== "string" || params.path.length === 0) {
    return res.json({
      error: true,
      message: "`path` is a required parameter!"
    });
  }
  req.vfs.stat(params.path, function (err, stat, vinyl) {
    if (err) {
      return res.end(err.message);
    }
    if (params.vinyl === true) {
      res.json(vinyl.toJSON());
    } {
      res.json(stat)
    }
  });
};

// module['exports'].route = "/:path";