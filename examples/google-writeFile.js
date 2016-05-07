var vfs = require("../");

var client = vfs.createClient({
  adapter: "google",
  credentials: {
    "private_key": "-----BEGIN PRIVATE KEY-----\nfoofoofoo-----END PRIVATE KEY-----\n",
    "client_email": "hellothere@something.iam.gserviceaccount.com"
  },
  //keyFilename: __dirname + '/../config/g.json', // path to a JSON key file
  projectId: 'project_id' // project id
});

client.writeFile('hello.txt', 'hello testing sdk', function (err, file) {
  console.log(err, file);
});