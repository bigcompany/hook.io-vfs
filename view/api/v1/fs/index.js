module['exports'] = function view (opts, callback) {
  var $ = this.$, req = opts.req, res = opts.res;
  $ = req.white($);
  req.vfs.readdir('', function(err, resp){
    if (err) {
      res.end(err.message);
    }
    resp.forEach(function(item){
      //console.log('file', item.toJSON());
      //console.log(req.session.user)
      var pathWithoutRoot = item.path.replace(req.session.user + "/", '');
      var link = '<a href="/files/readFile?path=' + pathWithoutRoot + '">' + pathWithoutRoot + '</a>';
      $('.userFiles table').append('<tr><td>' + link + '</td>'); //'<td>' + item.basename + '</td></tr>');
    });
    //$('.userFiles').html(JSON.stringify(resp, true, 2));
    callback(null, $.html());
  });
};