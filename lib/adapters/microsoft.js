var microsoft = {};

var pkgcloud = require('pkgcloud');

microsoft.createClient = function (opts) {

  var client = pkgcloud.storage.createClient({
    provider: 'azure',
    storageAccount: opts.storageAccount,         // Name of your storage account
    storageAccessKey: opts.storageAccessKey // Access key for storage account
  });

  return client;
};

module['exports'] = microsoft;