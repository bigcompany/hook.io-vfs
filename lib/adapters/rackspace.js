var rackspace = {};

var pkgcloud = require('pkgcloud');

rackspace.createClient = function (opts) {

  var client = pkgcloud.storage.createClient({
    provider: opts.adapter,
    username: opts.username, // required
    apiKey: opts.apiKey, // required
    region: opts.region, // required, regions can be found at
    // http://www.rackspace.com/knowledge_center/article/about-regions
    useInternal: false // optional, use to talk to serviceNet from a Rackspace machine
  });

  return client;
};

module['exports'] = rackspace;