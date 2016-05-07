var google = {};

var pkgcloud = require('pkgcloud');

google.createClient = function (opts) {
  var client = require('pkgcloud').storage.createClient({
     provider: opts.adapter,
     keyFilename: opts.keyFilename,
     credentials: opts.credentials,
     projectId: opts.projectId // project id
  });
  return client;
};

module['exports'] = google;