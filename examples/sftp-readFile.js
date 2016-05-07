var vfs = require("../");

var client = vfs.createClient({
  adapter: "sftp",
  host: "example.com",
  port: 22,
  username: "root",
  password: null,
  privateKey: require('fs').readFileSync(__dirname + '/../../../../.ssh/id_rsa')
});

client.readFile('hello.txt', function (err, file) {
  console.log(err, file);
});