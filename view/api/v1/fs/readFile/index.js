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
  req.vfs.readFile(params.path, function (err, file) {
    if (err) {
      return res.end(err.message);
    }
    if (typeof params.raw !== 'undefined') {
      // TODO: set header response based on mime type
      // TODO: make separate function
      res.end(file.contents);
    } else {
      res.json(file);
    }
  });
};

// module['exports'].route = "/:path";