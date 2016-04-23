module['exports'] = function writeFilePresenter (opts, cb) {
  var req = opts.req,
      res = opts.res;
  var params = req.resource.params;
  if (typeof params.path !== "string" || params.path.length === 0) {
    return res.json({
      error: true,
      message: "`path` is a required parameter!"
    });
  }
  if (typeof params.contents !== "string" || params.contents.length === 0) {
    return res.json({
      error: true,
      message: "`contents` is a required parameter!"
    });
  }
  req.vfs.writeFile(params.path, params.contents, function (err, file) {
    if (err) {
      return res.end(err.message);
    }
    res.json(file.toJSON());
  });
};

// module['exports'].route = "/:path";