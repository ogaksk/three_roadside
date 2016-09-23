
/*
 * GET home page.
 */

exports.tweet = function(req, res){
  res.render('tweet', { desc: req.query.desc });
};