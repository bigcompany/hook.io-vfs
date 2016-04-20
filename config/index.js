var config = {};
module['exports'] = config;

config.http = {
  port: 9998,
  host: "0.0.0.0"
};

config.adapters = {
  amazon: {
    provider: 'amazon',
    accessKeyId: 'abcd',
    accessKey: '1234',
    region: 'us-east-1'
  },
  google: {
    provider: 'google',
    keyFilename: __dirname + '/g.json', // path to a JSON key file
    projectId: 'abcd' // project id
  },
  microsoft: {
    provider: 'azure',
    storageAccount: "abcd",        // Name of your storage account
    storageAccessKey: "1234"      // Access key for storage account
  },
  rackspace: {
    provider: 'rackspace',
    username: 'abcd',
    apiKey: '1234',
    region: 'IAD',
    // regions can be found at http://www.rackspace.com/knowledge_center/article/about-regions
    useInternal: false // optional,use to talk to serviceNet from a Rackspace machine
  },
  sftp: {
    host: "example.com",
    port: 22,
    username: "root",
    password: null,
    privateKey: require('fs').readFileSync(__dirname + '/.ssh/id_rsa')
  }
};