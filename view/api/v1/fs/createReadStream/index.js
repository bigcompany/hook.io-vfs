module['exports'] = function createReadStreamPresenter (opts, cb) {
  var req = opts.req,
      res = opts.res;
  var params = req.resource.params;
  if (typeof params.path !== "string" || params.path.length === 0) {
    return res.json({
      error: true,
      message: "`path` is a required parameter!"
    });
  }
  var readStream = req.vfs.createReadStream(params.path);
  readStream.on('error', function (err) {
    // TODO: better 404 errors / better stream errors
    res.json(err);
  });
  readStream.pipe(res);
};

// module['exports'].route = "/:path";