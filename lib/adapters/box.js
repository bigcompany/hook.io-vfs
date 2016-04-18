var box = {};

var Box = require('nodejs-box');
// TODO: oauth
var box = new Box({
  access_token: 'YOUR_ACCESS_TOKEN_GOES_HERE',
  refreh_token: 'YOUR_REFRESH_TOKEN_GOES_HERE'
});

box.createClient = function (opts) {
};

module['exports'] = box;