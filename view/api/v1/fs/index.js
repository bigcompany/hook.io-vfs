module['exports'] = function view (opts, callback) {
  var $ = this.$, req = opts.req, res = opts.res;
  $ = req.white($);
  if (!req.isAuthenticated()) {
    $('.userFiles').remove();
    callback(null, $.html());
  } else {
    req.vfs.readdir('', function(err, dir, vinyl){
      if (err) {
        res.end(err.message);
      }
      vinyl.forEach(function(item){
        //console.log(req.session.user)
        var pathWithoutRoot = item.basename.replace(req.session.user + "/", '');
        var link = '<a href="/files/readFile?path=' + pathWithoutRoot + '">' + pathWithoutRoot + '</a>';
        $('.userFiles table').append('<tr><td>' + link + '</td>'); //'<td>' + item.basename + '</td></tr>');
      });
      //$('.userFiles').html(JSON.stringify(resp, true, 2));
      callback(null, $.html());
    });
  }
};