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

  var writeStream = req.vfs.createWriteStream(params.path);

  req.on('data', function(d){
    writeStream.write(d);
  });

  writeStream.on('data', function(d){
    try {
      res.write(d)
    } catch (err) {
      console.log('error writing to stream', d)
    }
  });

  req.on('end', function(){
    writeStream.end();
    res.end();
  });

};

// module['exports'].route = "/:path";