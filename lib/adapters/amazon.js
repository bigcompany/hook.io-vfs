var amazon = {};

var pkgcloud = require('pkgcloud');

amazon.createClient = function (opts) {
  var client = pkgcloud.storage.createClient({
    provider: opts.adapter,
    accessKeyId: opts.accessKeyId,
    accessKey: opts.accessKey,
    region: opts.region
  });
  return client;
};

module['exports'] = amazon;