var vfs = {};
var pathModule = require('path');
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

  // Remark: The configuration options aren't uniform...
  //         Every adapter has unique configuration keys
  //         This means its problematic to have unified apiKey and apiSecret config
  //
  //    self.apiKey = options.apiKey || "the api key";
  //    self.apiSecret = options.apiSecret || "the api secret";

  // the root of the vfs mount
  // usually the name of the bucket or container in the cloud
  // could also be a directory path on a system or any URI depending on the adapter

  self.root = options.root || "anonymous";

  self.bucket = options.bucket || "hookio-vfs";

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
  self.client.removeFile(self.bucket, encodeURIComponent(self.root + "/" + path), function (err, result){
    if (err) {
      return cb(err);
    }
    return cb(null, 'removing');
  });
};

Vfs.prototype.stat = function stat (path, cb) {
  var self = this;

  path = pathModule.normalize(path);
  if (path.substr(0,1) === "/") {
    path = path.substr(1,path.length-1);
  }

  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API
  // since pkgcloud offers no readFile or writeFile API methods
  if (typeof self.client.stat === "function") {
    return self.client.stat(self.root + "/" + path, finish);
  }

  var _remote;
  if (self.adapter === "google") {
    _remote = encodeURIComponent(self.root + "/" + path);
  } else {
    _remote = self.root + "/" + path;
  }

  self.client.getFile(self.bucket, _remote, finish);
  function finish (err, file) {
    if (err) {
      return cb(err);
    }
    var vFile = new File({
      cwd: "/",
      base: "/",
      path: path,
      stat: {
        foo: "bar",
        atime: new Date(),
        ctime: new Date(),
        mtime: new Date(),
        size: Number(file.metadata.size)
      }
    });
    return cb(null, vFile.stat, vFile);
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
    return self.client.writeFile(self.root + "/" + path, contents, finish);
  }

  var writeStream = self.client.upload({
    container: self.bucket,
    remote: self.root + "/" + path
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

  path = pathModule.normalize(path);
  if (path.substr(0,1) === "/") {
    path = path.substr(1,path.length-1);
  }
  var readPath = self.root + "/" +  path;

  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API
  // since pkgcloud offers no readFile or writeFile API methods
  if (typeof self.client.readFile === "function") {
    return self.client.readFile(readPath, function (err, file) {
      var vFile = new File({
        cwd: "/",
        base: "/",
        path: path,
        contents: file
      });
      cb(null, new Buffer(file.contents), vFile);
    });
  }

  // create a new buffer and output stream for capturing the hook.res.write and hook.res.end calls from inside the hook
  // this is used as an intermediary to pipe hook output to other streams ( such as another hook )
  var buffer = new streamBuffers.WritableStreamBuffer({
      initialSize: (100 * 1024),        // start as 100 kilobytes.
      incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
  });

  var _remote;

  if (self.adapter === "google") {
    _remote = encodeURIComponent(self.root + "/" + path);
  } else {
    _remote = self.root + "/" + path;
  }

  // console.log('vfs.readFile'.green, _remote);

  var readStream =  self.client.download({
    container: self.bucket,
    remote: _remote
  });

  // re-create node.js fs.stat ENOENT error
  var missingError = new Error('ENOENT: no such file or directory');
  missingError.code = 'ENOENT';
  missingError.syscall = 'stat';
  missingError.path = 'path';

  readStream.on('error', function(err){
    // Remark: microsoft only result
    if (err.message === "getaddrinfo ENOTFOUND metadata") {
      return cb(missingError);
    }
    // Remark: google only result
    if (err.message === "Not Found") {
      return cb(missingError);
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

    // TODO: google
    if (contents.toString() === "Not Found") {
      return cb(missingError);
    }

   // { Error: ENOENT: no such file or directory, stat 'aReadMe.md' errno: -2, code: 'ENOENT', syscall: 'stat', path: 'aReadMe.md' }

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

    cb(null, new Buffer(c), vFile);
  }));
};

Vfs.prototype.readdir = function readdir (path, cb) {
  var self = this;

  if (typeof self.client.readdir === "function") {
    //console.log('using custom fn', path)
    return self.client.readdir(self.root + "/" + path, cb);
  }

  // console.log('getting readdir', self.root + "/" + path);
  self.client.getFiles(self.bucket, { prefix: self.root + "/" + path /*, delimiter: "/marak"*/ }, function (err, files) {

    if (err) {
      return cb(err);
    }

    var dir = [];
    var vinyl = [];
    files.forEach(function(file){
      var f = new File({
        cwd: "/",
        base: path,
        path: file.name,
        contentType: file.contentType,
        stat: {
          size: Number(file.metadata.size),
          ctime: new Date(file.metadata.timeCreated),
          mtime: new Date(file.metadata.updated)
        }
      })
      // f.meta = file;
      dir.push(file.name);
      vinyl.push(f)
    });

    /*
    var arr = [];
    dir.forEach(function(d){
      arr.push(d.path.split('/')[1]);
    });
    */

    // TODO: reduce returned files by path
    // Note: pkcloud will always return all files in the container
    // dir = pathsToJSON(dir);

    cb(null, dir, vinyl);
  });
};

Vfs.prototype.createReadStream = function createReadStream (path) {
  var self = this;
  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API

  path = pathModule.normalize(path);
  if (path.substr(0,1) === "/") {
    path = path.substr(1,path.length-1);
  }

  if (typeof self.client.createReadStream === "function") {
    //console.log('using custom fn', path)
    return self.client.createReadStream(self.root + "/" + path);
  }

  var _remote;
  if (self.adapter === "google") {
    _remote = encodeURIComponent(self.root + "/" + path);
  } else {
    _remote = self.root + "/" + path;
  }

  var _stream = self.client.download({
    container: self.bucket,
    remote: _remote
  });

  // add default stream error in case down-stream user forgets
  _stream.on('error', function(err){
    console.log('vfs stream error', err)
  });
  return _stream;
};

Vfs.prototype.createWriteStream = function createWriteStream (path) {
  var self = this;
  // Remark: A bit of slightly awkward special-case logic to work nicely with pkgcloud API
  if (typeof self.client.createWriteStream === "function") {
    //console.log('using custom fn', path)
    return self.client.createWriteStream(self.root + "/" + path);
  }
  // console.log('returning writeStream', self.bucket, self.root, path)
  var _stream = self.client.upload({
     container: self.bucket,
     // TODO: key'd roots
     //  remote: self.root + "/" + path
     remote: self.root + "/" + path
  });
  // add default stream error in case down-stream user forgets
  _stream.on('error', function (err) {
    console.log('vfs stream error', err);
  });
  return _stream;
};

/*
function pathsToJSON (paths) {
  var obj = {};
  paths.forEach(function(f){
    console.log(f.path)
    var parts = f.path.split('/');
    var level = obj;
    parts.forEach(function(p, i){
      level[p] = level[p] || {};
      level = level[p];
    });
  });
  return obj;
}
*/