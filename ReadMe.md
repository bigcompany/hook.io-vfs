# hook.io-vfs

# UNRELEASED / WIP

Node.js module that powers the hook.io platform's Virtual Filesystem.

## Introduction

This module is the component which [hook.io](http://hook.io) uses to allow users to manage remote cloud files across many adapters using a familiar local filesystem based API.

You are encouraged to use this module as-is, or modify it to suite your needs. If you are interested in contributing please let us know!

## Features

 - Provides a Virtual Filesystem for all major cloud storage providers
 - Provides a Virtual Filesystems over `SSH` / `SFTP`
 - Provides unified filesystem API which maps `one-to-one` with Node.js core `fs` module
 - 117+ passing integration tests

### API

**Creating a new Client**

see: `config/index.js` for configuration `options`

```js
var vfs = require('hook.io-vfs');
var client = vfs.createClient(options);
client.writeFile('hello.txt', 'i am a file!', function (err, file){
  console.log(err, file)
});
```

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

Want to see a new adapter added? Let us know by opening a Github Issue.

Adapter | upload | download | readFile | writeFile | createReadStream | createWriteStream | readdir | removeFile | stat
--- | --- | --- | --- | --- | --- | --- | --- | --- | ---
Dropbox | ☐ | ☐| ☐| ☐ | ☐ | ☐| ☐ | ☐ | ☐ 
Box.com | ☐ | ☐| ☐| ☐ | ☐ | ☐| ☐ | ☐ | ☐ 


