module['exports'] = function readFilePresenter (opts, cb) {
  var req = opts.req,
      res = opts.res;
  var params = req.resource.params;
  if (typeof params.path !== "string" || params.path.length === 0) {
    return res.json({
      error: true,
      message: "`path` is a required parameter!"
    });
  }
  req.vfs.readFile(params.path, function (err, files) {
    if (err) {
      return res.end(err.message);
    }
    res.json(files);
  });
};

// module['exports'].route = "/:path";