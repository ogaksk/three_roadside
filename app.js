/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

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
  var file = __dirname +'/contents/a.zip';
  res.download(file);
});

server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);
io.set('log level', 1); 

server.listen(app.get('port'), function(){
  console.log("server listening on port.... " + app.get('port'));
});

// ユーザーストアファイル取得
var fd = fs.openSync(player_list_store_path, 'a+');
fs.closeSync(fd);
var player_list;
if (fs.readFileSync(player_list_store_path, 'utf-8')) {
  player_list = JSON.parse(fs.readFileSync(player_list_store_path, 'utf-8'));
} else {
  player_list = {};
}


// 通信プロトコル
io.sockets.on("connection", function(socket) {

  var player = {
    login_name : "",
    x : 0,
    y : 0,
    message : "…", // フキダシの中身
  };

  console.log("connect new client.");

  // ログイン名を送ってきた時は新規ログインの処理
  socket.on("name", function(text) {
    console.log("name: " + text);
    player.login_name = text;
    socket.broadcast.emit("name", player.login_name);

    // ログイン中プレイヤーリストへの登録
    player_list[ player.login_name ] = player;
    // ストアファイルへも登録
    fs.writeFile(player_list_store_path, JSON.stringify(player_list));
  });

  socket.on("get_user_list", function() {  
    // それまでにログインしてるプレイヤー情報を送る
    for (var i in player_list) {
      var c = player_list[i]; // ログイン中プレイヤーリストからプレイヤー情報取得
      socket.emit("name", c.login_name);
      socket.emit("position:" + c.login_name,
                  c.x + "," + c.y + "," + c.direction);
      socket.emit("message:" + c.login_name, c.message);
    }
  })

  // 移動処理
  socket.on("position", function(pos) {
    // console.log("position:" + player.login_name + "x="+ pos.x + "y=" + pos.y);
    player.x = pos.x;
    player.y = pos.y;
    player.rotation = pos.rotation;
    socket.broadcast.emit("position:" + player.login_name, pos);
  });

  // 切断した時の処理
  socket.on("disconnect", function() {
    console.log("disconnect:" + player.login_name);
    socket.broadcast.emit("disconnect:" + player.login_name);
    // ログイン中プレイヤーリストからの削除
    delete player_list[ player.login_name ];
    //ストアファイルからも削除
    fs.writeFile(player_list_store_path, JSON.stringify(player_list));
  });

});
