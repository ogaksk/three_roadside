/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , crypto = require('crypto');

var app = express();

var player_list_store_path = __dirname + '/tmp/player_list_store.txt'

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', routes.index);
app.get('/download', function(req, res) {
  res.redirect(302, "http://tuxurecords.sakura.ne.jp/zip/TUXU038.zip");
  // var file = __dirname +'/contents/a.zip';
  // res.download(file);
});

server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);
io.set('log level', 1); 

server.listen(app.get('port'), function(){
  console.log("server listening on port.... " + app.get('port'));
});

var player_list = {};

// 通信プロトコル
io.sockets.on("connection", function(socket) {
  var player = {
    login_id : "",
    x : 0,
    y : 0,
    login_name : "…", // フキダシの中身
  };

  console.log("connect new client.");

  // ログイン名を送ってきた時は新規ログインの処理
  socket.on("name", function(text) {
    console.log("name: " + text);
    // CHECK: randomなhexの名前を与える
    player.login_id = socket.id;
    player.login_name = text;
    socket.broadcast.emit("name", player);

    // ログイン中プレイヤーリストへの登録
    player_list[ player.login_id ] = player;
    //  var msg = name + "が入室しました";
    // userHash[socket.id] = name;
    // io.sockets.emit("publish", {value: msg});
  });

  socket.on("get_user_list", function() {  
    // それまでにログインしてるプレイヤー情報を送る
    for (var i in player_list) {
      // ログイン中プレイヤーリストからプレイヤー情報取得
      if( player.login_id != player_list[i].login_id) {
        var c = player_list[i]; 
        socket.emit("name", c);
        socket.emit("position:" + c.login_id,
                  c.x + "," + c.y + "," + c.direction);
      }
    }
  })

  // 移動処理
  socket.on("position", function(pos) {
    // console.log("position:" + player.login_id + "x="+ pos.x + "y=" + pos.y);
    player.x = pos.x;
    player.y = pos.y;
    player.rotation = pos.rotation;
    socket.broadcast.emit("position:" + player.login_id, pos);
  });

  // 切断した時の処理
  socket.on("disconnect", function() {
    console.log("disconnect:" + player.login_id);
    socket.broadcast.emit("disconnect:" + player.login_id);
    // ログイン中プレイヤーリストからの削除
    delete player_list[ player.login_id ];
  });

});


/*utility*/

function md5Hex(src) {
  var md5 = crypto.createHash('md5');
  md5.update(src, 'utf8');
  return md5.digest('hex');
}

function randomHex() {
  return crypto.pseudoRandomBytes(8).toString("hex")
}

