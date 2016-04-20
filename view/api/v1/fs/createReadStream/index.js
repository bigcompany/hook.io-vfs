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
  req.vfs.createReadStream(params.path).pipe(res);
};

// module['exports'].route = "/:path";