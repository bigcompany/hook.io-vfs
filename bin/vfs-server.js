var vfs = require('../');
require('colors');
vfs.mode = "offline";
vfs.server.listen({}, function (err, app) {
  if (err) {
    console.log('error starting server', err.message);
  }
  console.log('server started'.green, app.server.address());
  console.log('current mode'.blue + " " + vfs.mode.yellow);
});