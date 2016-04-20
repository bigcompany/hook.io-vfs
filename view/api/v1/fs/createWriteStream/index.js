module['exports'] = function createWriteStreamPresenter (opts, cb) {
  var req = opts.req,
      res = opts.res;
  var params = req.resource.params;
  if (typeof params.path !== "string" || params.path.length === 0) {
    return res.json({
      error: true,
      message: "`path` is a required parameter!"
    });
  }
  res.pipe(req.vfs.createWriteStream(params.path))
};

// module['exports'].route = "/:path";