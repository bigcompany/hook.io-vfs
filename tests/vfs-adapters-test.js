var tap = require("tape");
var streamBuffers = require('stream-buffers');
var config = require('../config/production');

var vfs;
tap.test('require the vfs module', function (t) {
  vfs = require('../');
  t.equal(typeof vfs, 'object', 'required module as object');
  t.end();
});

function testAdapter (adapter) {
  var client;
  
  var testFile = 'test-file-0.txt',
      testRoot = 'hookio-vfs',
      adapterCanStream = true;

  if (adapter === "sftp") {
    testRoot = ".";
  }
  var adapterConfig = config.adapters[adapter];
  adapterConfig.adapter = adapter;
  tap.test('create a new vfs client', function (t) {
    // diffirent adapters have diffirent configuration options
    client = vfs.createClient(adapterConfig);
    t.equal(typeof client, 'object', 'required module as object');
    t.end();
  });

  // callback style APIs
  tap.test('vfs.readdir - read a directory', function (t) {
    client.readdir(testRoot, function (err, files) {
      t.error(err, 'did not error');
      t.equal(typeof files, 'object', 'returns files as object');
      t.end();
    });
  });

  tap.test('vfs.writeFile - create a new file', function (t) {
    client.writeFile(testFile, 'hello tests', function (err, file) {
      t.error(err, 'did not error');
      //t.equal(file.name, testFile);
      t.end();
    });
  });

  tap.test('vfs.stat - get stat on newly created file', function (t) {
    client.stat(testFile, function (err, file) {
      t.error(err, 'did not error');
      t.equal(typeof file, 'object');
      t.end();
    });
  });
  
  tap.test('vfs.readFile - read newly created file', function (t) {
    client.readFile(testFile, function (err, file) {
      t.error(err, 'did not error');
      t.equal(file.toString(), 'hello tests');
      t.end();
    });
  });

  tap.test('vfs.writeFile - update that same file', function (t) {
    client.writeFile(testFile, 'hello update', function (err, file) {
      t.error(err, 'did not error');
      //t.equal(file.name, testFile);
      t.end();
    });
  });

  tap.test('vfs.readFile - read updated file', function (t) {
    client.readFile(testFile, function (err, file) {
      t.error(err, 'did not error');
      t.equal(file.toString(), 'hello update');
      t.end();
    });
  });

  tap.test('vfs.removeFile - clean up test file test', function (t) {
    client.removeFile(testFile, function (err, file) {
      t.error(err, 'did not error');
      t.equal(file, 'removing');
      t.end();
    });
  });

  /* TODO: non-uniform error messages for readFile 404 from pkgcloud
  tap.test('vfs.readFile - try to read deleted test file', function (t) {
    client.readFile(testFile, function (err, file) {
      console.log('err', err, file.toString())
      t.equal(err.message, 'Not Found');
      t.end();
    });
  });
  */

  // streaming style APIs
  tap.test('vfs.createWriteStream - creates a new file stream', function (t) {
    var writeStream = client.createWriteStream('test-streaming-file.txt');

    if (writeStream === "createWriteStream-not-available-for-adapter") {
      adapterCanStream = false;
      t.ok(writeStream, writeStream);
      t.end();
      return;
    }

    writeStream.write('hello tests');
    writeStream.end();

    // wait a bit for cloud provider to update
    setTimeout(function(){
      t.end('did not error');
    }, 800);
  });
  
  
  tap.test('vfs.createReadStream - read newly created file as stream', function (t) {
    var readStream = client.createReadStream('test-streaming-file.txt');

    if (readStream === "createReadStream-not-available-for-adapter") {
      adapterCanStream = false;
      t.ok(readStream, readStream)
      t.end();
      return;
    }

    var fileOutput = new streamBuffers.WritableStreamBuffer({
        initialSize: (100 * 1024),        // start as 100 kilobytes.
        incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
    });

    readStream.on('error', function (err) {
      throw err;
    });

    readStream.on('end', function () {
      var buffer = fileOutput.getContents();
      t.equal(buffer.toString(), 'hello tests');
      t.end();
    });

    readStream.pipe(fileOutput);

  });

  tap.test('vfs.createWriteStream - update that same file stream', function (t) {
    var writeStream = client.createWriteStream('test-streaming-file.txt');

    if (writeStream === "createWriteStream-not-available-for-adapter") {
      adapterCanStream = false;
      t.ok(writeStream, writeStream)
      t.end();
      return;
    }

    writeStream.write('hello update');
    writeStream.end();
    // wait a bit for cloud provider to update
    setTimeout(function () {
      t.end('did not error');
    }, 800);
  });

  tap.test('vfs.createReadStream - read updated file as stream', function (t) {

    var readStream = client.createReadStream('test-streaming-file.txt');

    if (readStream === "createReadStream-not-available-for-adapter") {
      adapterCanStream = false;
      t.ok(readStream, readStream)
      t.end();
      return;
    }

    var fileOutput = new streamBuffers.WritableStreamBuffer({
        initialSize: (100 * 1024),        // start as 100 kilobytes.
        incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
    });

    readStream.on('error', function (err) {
      throw err;
    });

    readStream.on('end', function () {
      var buffer = fileOutput.getContents();
      t.equal(buffer.toString(), 'hello update');
      t.end();
    });

    readStream.pipe(fileOutput);

  });

  tap.test('vfs.removeFile - clean up streaming file test', function (t) {
    if (adapterCanStream === true) {
      client.removeFile('test-streaming-file.txt', function (err, file) {
        t.error(err, 'did not error');
        t.equal(file, 'removing');
        t.end();
      });
    } else {
      t.end();
    }
  });

  // upload / download sugar syntax
  tap.test('vfs.upload - upload a new file - callback style', function (t) {
    client.upload('upload-test-file.txt', 'hello tests', function (err, status) {
      t.error(err, 'did not error');
      t.end();
    });
  });

  tap.test('vfs.download - download newly created file - callback style', function (t) {
    client.download('upload-test-file.txt', function (err, file) {
      t.error(err, 'did not error');
      t.equal(file.toString(), 'hello tests');
      t.end();
    });
  });

  tap.test('vfs.upload - upload a new file - streaming style', function (t) {

    var writeStream = client.upload('upload-stream-test-file.txt');

    if (writeStream === "createWriteStream-not-available-for-adapter") {
      adapterCanStream = false;
      t.ok(writeStream, writeStream)
      t.end();
      return;
    }

    writeStream.write('hello tests');
    writeStream.end();

    // wait a bit for cloud provider to update
    setTimeout(function(){
      t.end('did not error');
    }, 800);
    
  });
  
  tap.test('vfs.download - download newly created file - streaming style', function (t) {

    var readStream = client.download('upload-stream-test-file.txt');

    if (readStream === "createReadStream-not-available-for-adapter") {
      adapterCanStream = false;
      t.ok(readStream, readStream)
      t.end();
      return;
    }

    var fileOutput = new streamBuffers.WritableStreamBuffer({
        initialSize: (100 * 1024),        // start as 100 kilobytes.
        incrementAmount: (10 * 1024)    // grow by 10 kilobytes each time buffer overflows.
    });

    readStream.on('error', function (err) {
      throw err;
    });

    readStream.on('end', function () {
      var buffer = fileOutput.getContents();
      t.equal(buffer.toString(), 'hello tests');
      t.end();
    });

    readStream.pipe(fileOutput);
  });

  tap.test('vfs.removeFile - clean up test files file test', function (t) {
    client.removeFile('upload-test-file.txt', function (err, file) {
      t.error(err, 'did not error');
      t.equal(file, "removing", "return 'removing' status");
      t.end();
      return;
      client.removeFile('upload-stream-test-file.txt', function (err, file) {
        t.error(err, 'did not error');
        t.equal(file, "removing", "return 'removing' status");
        t.end();
      });
    });
  });

};

testAdapter('google');
testAdapter('sftp');
testAdapter('microsoft');
testAdapter('rackspace');
testAdapter('amazon');
testAdapter('google');
