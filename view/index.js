module['exports'] = function (opts, cb) {
  var $ = this.$;
  return cb(null, $.html());
};