# hook.io-vfs

# UNRELEASED / WIP

Node.js module that powers the hook.io platform's Virtual Filesystem.

## Introduction

This module is the component which [hook.io](http://hook.io) uses to allow users to manage remote cloud files across many adapters using a familiar local filesystem based API.

You are encouraged to use this module as-is, or modify it to suite your needs. If you are interested in contributing please let us know!

## Features

 - Provides a Virtual Filesystem for all major cloud storage providers
   - Amazon S3
   - Google Cloud Files
   - Azure Cloud Files
   - Rackspace Cloud Files
   - Any `SSH` / `SFTP` server!
 - Provides unified filesystem API which maps `one-to-one` with Node.js core `fs` module
   - Can be used as drop-in replacement for `require('fs')` module
   - Use familiar methods like `readFile`, `writeFile`, `createReadStream`, `createWriteStream`
   - Provides additional [Vinyl](https://github.com/gulpjs/vinyl) Virtual File representation files

## Example

```js
var vfs = require('hook.io-vfs');

var client = vfs.createClient({
  google: {
    adapter: "google",
    keyFilename: '/path/to/google.json', // path to a google JSON key file
    projectId: 'my-project'
  }
});

client.writeFile('hello.txt', 'i am a file!', function (err, vinyl){
  console.log(err, vinyl);
  //  "vinyl" contains representation of file ( stats / metadata ) 
});

client.readFile('hello.txt', function (err, file, vinyl){
  console.log(err, file, vinyl);
  // "file" is Buffer of file contents ( same as Node.js `fs.readFile` )
  // "vinyl" is a https://github.com/gulpjs/vinyl object
});

client.readdir('.', function (err, dir, vinyl){
  console.log(err, dir, vinyl);
  // "dir" is array of file names ( same as Node.js `fs.readdir` )
  // "vinyl" is an array of https://github.com/gulpjs/vinyl objects
})

```

see: `config/index.js` property `config.adapters` for additional adapter / provider options



## API


### Uploading / Downloading Files

**Callback Style**

`vfs.upload(path, contents, cb);`

`vfs.download(path, cb);`

**Stream Interface**

`var writeStream = vfs.upload(path, contents);`

`var readStream = vfs.download(path, contents);`


### All other `fs` operations

Each adapter does it's best to map `one-to-one` with the Node.js core `fs` module [API interface](https://nodejs.org/api/fs.html).

**Supported Virtual File Adapters**

Adapter | upload | download | readFile | writeFile | createReadStream | createWriteStream | readdir | removeFile | stat
--- | --- | --- | --- | --- | --- | --- | --- | --- | ---
Amazon | ☑ | ☑| ☑| ☑ | ☑ | ☑| ☑ | ☑ | ☑ 
Google | ☑ | ☑| ☑| ☑ | ☑ | ☑| ☑ | ☑ | ☑ 
Microsoft | ☑ | ☑| ☑| ☑ | ☑ | ☑| ☑ | ☑ | ☑ 
Rackspace | ☑ | ☑| ☑| ☑ | ☑ | ☑| ☑ | ☑ | ☑ 
`SFTP` | ☑ | ☑| ☑| ☑ | ☒ | ☒| ☑ | ☑ | ☑ 

**Planned Virtual File Adapters**

Want to see a new adapter added? Let us know by opening a [Github Issue](https://github.com/bigcompany/hook.io-vfs/issues/new).

Adapter | upload | download | readFile | writeFile | createReadStream | createWriteStream | readdir | removeFile | stat
--- | --- | --- | --- | --- | --- | --- | --- | --- | ---
Dropbox | ☐ | ☐| ☐| ☐ | ☐ | ☐| ☐ | ☐ | ☐ 
Box.com | ☐ | ☐| ☐| ☐ | ☐ | ☐| ☐ | ☐ | ☐ 


