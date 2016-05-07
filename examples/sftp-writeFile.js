var vfs = require("../");

var client = vfs.createClient({
  adapter: "sftp",
  host: "example.com",
  port: 22,
  username: "root",
  password: null,
  privateKey: require('fs').readFileSync(__dirname + '/../../../../.ssh/id_rsa')
});

client.writeFile('hello.txt', 'contents', function (err, file) {
  console.log(err, file);
});