
/*
 * GET home page.
 */

exports.index = function(req, res){
  // ユーザーエージェント処理
  var incompatibles = ["iphone", "ipad", "android"];
  var ua = req.headers['user-agent'].toLowerCase();

  for (var i = 0; i < incompatibles.length; i ++) {
    if(ua.indexOf(incompatibles[i]) != -1){
      res.render('incompatible', { title: 'sorry!!' });
      return
    }
  }

  res.render('index', { title: 'ロードサイド3D' });
};