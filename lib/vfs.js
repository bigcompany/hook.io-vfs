var vfs = {};
module['exports'] = vfs;

// TODO: we could separate the server and client components to separate modules
vfs.server = require('./server');
vfs.middle = require('./middleware');

var File = require('vinyl');
var through = require('through2');
var streamBuffers = require('stream-buffers');
vfs.adapters = {
  amazon: require('./adapters/amazon'),
  google: require('./adapters/google'),
  microsoft: require('./adapters/microsoft'),
  rackspace: require('./adapters/rackspace'),
  sftp: require('./adapters/sftp')
};

vfs.createClient = function (options) {
  // console.log('new client', options)
  return new Vfs(options);
};

var Vfs = vfs.Vfs = function Vfs (options) {
  var self = this;

  if (typeof options === "undefined") {
    throw new Error("options hash is required!");
  }

  for (var o in options) {
    self[o] = options[o];
  }

  self.adapter = options.adapter || "google";
  
  self.apiKey = options.apiKey || "the api key";
  self.apiSecret = options.apiSecret || "the api secret";

  // the root of the vfs mount
  // usually the name of the bucket or container in the cloud
  // could also be a directory path on a system or any URI depending on the adapter
  self.root = options.root || "hookio-vfs";

  self.client = vfs.adapters[self.adapter].createClient(self);

  return self;
};

Vfs.prototype.upload = function (path, contents, cb) {
  var self = this;
  if (typeof cb === "undefined") {
    // no callback? assume streaming interface
    return self.createWriteStream(path);
  }
  return self.writeFile(path, contents, cb);
};

Vfs.prototype.download = function (path, cb) {
  var self = this;
  if (typeof cb === "undefined") {
    // no callback? assume streaming interface
    return self.createReadStream(path);
  }
  return self.readFile(path, cb);
};

Vfs.prototype.removeFile = function removeFile (path, cb) {
  var self = this;
  // console.log('removing', path, self.client.removeFile)
  self.client.removeFile('hookio-vfs', path, function (err, result){
    if (err) {
      return cb(err);
    }
    return cb(null, 'removing');
  });
};

Vfs.prototype.stat = function stat (path, cb) {
  var self = this;
  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API
  // since pkgcloud offers no readFile or writeFile API methods
  if (typeof self.client.stat === "function") {
    // console.log('using custom fn', path)
    return self.client.stat(path, finish);
  }
  self.client.getFile('hookio-vfs', path, finish);
  function finish (err, file) {
    if (err) {
      return cb(err);
    }
    var vFile = new File({
      cwd: "/",
      base: "/",
      path: path
    });
    return cb(null, vFile);
  }
};

Vfs.prototype.writeFile = function writeFile (path, contents, cb) {
  var self = this;

  function finish (err, file) {
    if (err) {
      return cb(err);
    }
    var vFile = new File({
      cwd: "/",
      base: "/",
      path: path
    });
    return cb(null, vFile);
  }
  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API
  // since pkgcloud offers no readFile or writeFile API methods
  if (typeof self.client.writeFile === "function") {
    // console.log('using custom fn', path)
    return self.client.writeFile(path, contents, finish);
  }

  var writeStream = self.client.upload({
    container: "hookio-vfs",
    remote: path
  });

  writeStream.on('error', function (err) {
    cb(err);
  });

  writeStream.on('success', function (file) {
    finish(null, file);
  });

  writeStream.write(contents);
  writeStream.end();
};

Vfs.prototype.readFile = function readFile (path, cb) {
  var self = this;

  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API
  // since pkgcloud offers no readFile or writeFile API methods
  if (typeof self.client.readFile === "function") {
    return self.client.readFile(path, function(err, file){
      var vFile = new File({
        cwd: "/",
        base: "/",
        path: path,
        contents: file
      });
      cb(null, vFile);
    });
  }

  // create a new buffer and output stream for capturing the hook.res.write and hook.res.end calls from inside the hook
  // this is used as an intermediary to pipe hook output to other streams ( such as another hook )
  var buffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),        // start as 100 kilobytes.
      incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
  });
  var readStream =  self.client.download({
      container: "hookio-vfs",
      path: path,
      remote: path
    });
  readStream.on('error', function(err){
    // Remark: microsoft only result
    if (err.message === "getaddrinfo ENOTFOUND metadata") {
      return cb(new Error('Not Found'), buffer.getContents());
    }
    return cb(err);
  });
  readStream.pipe(through(function transform (chunk, enc, _cb){
    buffer.write(chunk);
    _cb();
  }, function complete (e) {
    var contents = buffer.getContents();
    // TODO: better uniform responses messages on 404 files
    // fix in pkgcloud? maybe its already fixed, but we are using wrong API

    // TODO: rackspace
    if (contents.toString() === "<html><h1>Not Found</h1><p>The resource could not be found.</p></html>") {
      return cb(new Error('Not Found'), buffer.getContents());
    }

    // TODO: microsoft
    if (contents.toString() === false) {
      return cb(new Error('Not Found'), buffer.getContents());
    }

    var c = contents.toString();
    var vFile = new File({
      cwd: "/",
      base: "/",
      path: path,
      contents: new Buffer(c)
    });

    cb(null, vFile);
  }));
};

Vfs.prototype.readdir = function readdir (path, cb) {
  var self = this;
  self.client.getFiles(path, function (err, files) {
    if (err) {
      return cb(err);
    }
    var dir = [];
    files.forEach(function(file){
      var f = new File({
        cwd: "/",
        base: "/",
        path: path
      })
      f.meta = file;
      dir.push(f)
    });
    cb(null, dir);
  });
};

Vfs.prototype.createReadStream = function createReadStream (path) {
  var self = this;
  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API
  if (typeof self.client.createReadStream === "function") {
    //console.log('using custom fn', path)
    return self.client.createReadStream(path);
  }
  return self.client.download({
    container: self.root,
    remote: path,
    path: path
  });
};

Vfs.prototype.createWriteStream = function createWriteStream (path) {
  var self = this;
  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API
  if (typeof self.client.createWriteStream === "function") {
    //console.log('using custom fn', path)
    return self.client.createWriteStream(path);
  }
  return self.client.upload({
     container: self.root,
     remote: path
  });
};