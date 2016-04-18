var sftp = {};

/*
  SSH / SFTP Virtual Filesystem adapter

  Remark: Currently approach uses a "connection per action" approach

    This isn't ideal, as we could pool actions per connection
    The reason we aren't doing "connection per action" is to conform with the parent vfs API and to keep everything simple 
    Since this is intended to be used with microservices, we will assume there will not be more than one action per request lifecycle

*/
var Client = require('ssh2').Client;

// Remark: We don't have proper streaming support yet.
// There are streaming APIs available, but they could be better by removing `stream-buffers` and `through2` usage

var streamBuffers = require('stream-buffers');
var through = require('through2');

var Sftp = sftp.Sftp = function Sftp (opts) {
  var self = this;
  if (typeof opts === "undefined") {
    throw new Error('options hash is required!');
  }
  self.host = opts.host || "example.com";
  self.port = opts.port || 22;
  self.username = opts.username || "root";
  //self.password = opts.password || null;
  self.privateKey = opts.privateKey || require('fs').readFileSync(__dirname + '/../../../../../.ssh/id_rsa')
  return self;
};

sftp.createClient = function (opts) {
  var client = new Sftp(opts)
  return client;
};

Sftp.prototype.readFile = function readFile (path, cb) {
  var self = this;
   self.conn = new Client(self);
   self.conn.on('error', function(err){
     return cb(err);
   });
   self.conn.on('ready', function() {
     // console.log('Client :: ready'. opts);
     self.conn.sftp(function (err, _sftp) {
       if (err) {
         return cb(err);
       }
       // create a new buffer and output stream for capturing the hook.res.write and hook.res.end calls from inside the hook
       // this is used as an intermediary to pipe hook output to other streams ( such as another hook )
       var buffer = new streamBuffers.WritableStreamBuffer({
           initialSize: (100 * 1024),        // start as 100 kilobytes.
           incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
       });
       var readStream = _sftp.createReadStream(path);

       readStream.on('error', function(err){
         cb(err);
         self.conn.end();
       });
       readStream.pipe(through(function transform (chunk, enc, _cb){
          buffer.write(chunk);
          _cb();
        }, function complete (e) {
          self.conn.end();
          cb(null, buffer.getContents());
        }));
     });
   }).connect({
     host: self.host,
     port: self.port,
     username: self.username,
     privateKey: self.privateKey
   });
};

Sftp.prototype.writeFile = function writeFile (path, contents, cb) {
   var self = this;
   self.conn = new Client(self);
   self.conn.on('error', function(err){
     return cb(err);
   });
   self.conn.on('ready', function() {
     // console.log('Client :: ready'. opts);
     self.conn.sftp(function (err, _sftp) {
       if (err) {
         return cb(err);
       }
       var writeStream = _sftp.createWriteStream(path);

       writeStream.on('error', function (err) {
         return cb(err);
       });

       /*
       writeStream.on('close', function (file) {
         console.log('ended')
         self.conn.end();
         return cb(null, file);
       });
       */

       writeStream.on('finish', function (file) {
         self.conn.end();
         return cb(null, 'uploading');
       });

       writeStream.write(contents);
       writeStream.end();

     });
   }).connect({
     host: self.host,
     port: self.port,
     username: self.username,
     privateKey: self.privateKey
   });
};

Sftp.prototype.createReadStream = function createWriteStream () {
  var self = this;
  return 'createReadStream-not-available-for-adapter';
};

Sftp.prototype.createWriteStream = function createWriteStream () {
  var self = this;
  return 'createWriteStream-not-available-for-adapter';
};

Sftp.prototype.readdir = function readdir (path, cb) {
  var self = this;
   self.conn = new Client(self);
   self.conn.on('error', function(err){
     return cb(err);
   });
   self.conn.on('ready', function() {
     //console.log('Client :: ready'. opts);
     self.conn.sftp(function (err, _sftp) {
       if (err) {
         return cb(err);
       }
       _sftp.readdir(path, function(err, files){
         self.conn.end();
         cb(err, files);
       });
     });
   }).connect({
     host: self.host,
     port: self.port,
     username: self.username,
     privateKey: self.privateKey
   });
};

Sftp.prototype.stat = function stat (path, cb) {
  var self = this;
   self.conn = new Client(self);
   self.conn.on('error', function(err){
     return cb(err);
   });
   self.conn.on('ready', function() {
     // console.log('Client :: ready'. opts);
     self.conn.sftp(function (err, _sftp) {
       if (err) {
         return cb(err);
       }
       _sftp.stat(path, function(err, stat){
         self.conn.end();
         cb(err, stat);
       });
     });
   }).connect({
     host: self.host,
     port: self.port,
     username: self.username,
     privateKey: self.privateKey
   });
};

Sftp.prototype.removeFile = function stat (root, path, cb) {
  var self = this;
   self.conn = new Client(self);
   self.conn.on('error', function(err){
     return cb(err);
   });
   self.conn.on('ready', function() {
     // console.log('Client :: ready'. opts);
     self.conn.sftp(function (err, _sftp) {
       if (err) {
         return cb(err);
       }
       _sftp.unlink(path, function (err, status){
         self.conn.end();
         if (err) {
           if (err.message = "No such file") {
             err.message = "Not found";
           }
         }
         cb(err, 'removing');
       });
     });
   }).connect({
     host: self.host,
     port: self.port,
     username: self.username,
     privateKey: self.privateKey
   });
};


Sftp.prototype.getFiles = Sftp.prototype.readdir;
Sftp.prototype.download = Sftp.prototype.readFile;
Sftp.prototype.upload = Sftp.prototype.writeFile;

module['exports'] = sftp;