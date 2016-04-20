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
  if (typeof params.content !== "string" || params.content.length === 0) {
    return res.json({
      error: true,
      message: "`content` is a required parameter!"
    });
  }
  req.vfs.writeFile(params.path, params.content, function (err, file) {
    if (err) {
      return res.end(err.message);
    }
    res.json(file);
  });
};

// module['exports'].route = "/:path";