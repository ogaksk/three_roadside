(function () {

  var name = prompt("名前を入れてください:");

  var socket = io.connect();

  socket.on("connect", function() {
    socket.emit("name", name);
    socket.emit("message", "…"); // 初期メッセージ
  });

  // var socket = io('http://localhost');
  // socket.on('connect', function() {
  //   // connect後にemitする
  //   socket.emit('foo', 1);
  // });

  // 定数
  var STAGE_WIDTH = screen.width;
  var STAGE_HEIGHT = screen.height;
  var MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];
  var BLOCK_SIZE = 100;
  var COL_MAX_LENGTH = 0;
  var ROW_MAX_LENGTH = MAP.length;
  var i = 0, max;
  var j = 0, max2;
  for (i = 0, max = MAP.length; i < max; i = i + 1) {
    for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
      if (COL_MAX_LENGTH < MAP[i].length) {
          COL_MAX_LENGTH = MAP[i].length;
      }
    }
  }
  var PLAYER_MOVE_SPEED = 0.5;
  var PLAYER_ROTATION_SPEED = 2;
  var MAP_BLOCK_SIZE = 10;

  // ゲーム開始
  enchant();
  var game = new Core(STAGE_WIDTH, STAGE_HEIGHT);
  game.preload([
    "/images/map01.png", "/images/player01.png", "/images/wall01.jpg", "/images/land01.jpg"
  ]);
  game.fps = 60;
  game.onload = function() {
    
    /* ---------- ゲームクラス ---------- */
    
    // マップ
    var Field = Class.create(Map, {
      initialize: function (image, loadData, collisionData) {
        Map.call(this, MAP_BLOCK_SIZE, MAP_BLOCK_SIZE);
        this.image = image;
        this.loadData(loadData);
        if (collisionData) this.collisionData = collisionData;
      }
    });
    
    // プレーヤー
    var Player = Class.create(Sprite, {
      isMove: false,
      initialize: function (image, x, y) {
        Sprite.call(this, MAP_BLOCK_SIZE, MAP_BLOCK_SIZE);
        this.x = x;
        this.y = y;
        this.loginName = name;
        this.image = image;
        this.rotation = 90;
        this.addEventListener(enchant.Event.ENTER_FRAME, this.onEnterFrame);
      },
      onEnterFrame: function () {
        var moveX = 0;
        var moveY = 0;
        this.isMove = false;
        if (game.input.left) {
          this.rotation -= PLAYER_ROTATION_SPEED;
        }
        if (game.input.right) {
          this.rotation += PLAYER_ROTATION_SPEED;
        }
        if (game.input.up) {
          moveX = Math.cos(this.rotation * Math.PI / 180) * PLAYER_MOVE_SPEED;
          moveY = Math.sin(this.rotation * Math.PI / 180) * PLAYER_MOVE_SPEED;
          this.isMove = true;
        }
        if (game.input.down) {
          moveX = Math.cos(this.rotation * Math.PI / 180) * -PLAYER_MOVE_SPEED;
          moveY = Math.sin(this.rotation * Math.PI / 180) * -PLAYER_MOVE_SPEED;
          this.isMove = true;
        }
        if (field.hitTest(this.x + moveX + 4, this.y + moveY + 4)) {
          this.isMove = false;
        } else if (field.hitTest(this.x + moveX + 6, this.y + moveY + 4)) {
          this.isMove = false;
        } else if (field.hitTest(this.x + moveX + 6, this.y + moveY + 6)) {
          this.isMove = false;
        } else if (field.hitTest(this.x + moveX + 4, this.y + moveY + 6)) {
          this.isMove = false;
        }
        if (this.isMove) {
          this.x += moveX;
          this.y += moveY;
          console.log("x=="+ player.x + "Y===" + player.y)
        }

        socket.emit("position", { x : this.x, y : this.y , rotation: this.rotation });
      }
    });


    var OtherPlayer = Class.create(Sprite, {
      isMove: false,
      initialize: function (image, x, y, log_name) {
        Sprite.call(this, MAP_BLOCK_SIZE, MAP_BLOCK_SIZE);
        this.x = x;
        this.y = y;
        this.image = image;
        this.loginName = log_name;
        this.rotation = 90;
        // this.addEventListener(enchant.Event.ENTER_FRAME, this.onEnterFrame);
      }
    })

    var Item = Class.create(Sprite, {
      isMove: false,
      initialize: function (image, x, y, log_name) {
        Sprite.call(this, MAP_BLOCK_SIZE, MAP_BLOCK_SIZE);
        this.x = 100;
        this.y = 100;
        this.image = image;
        this.rotation = 90;
        // this.addEventListener(enchant.Event.ENTER_FRAME, this.onEnterFrame);
      }
    })

    /* ---------- ゲームアクション ---------- */

    // シーン
    var mapGroup = new Group();
    mapGroup.x = 10;
    mapGroup.y = 10;
    game.rootScene.addChild(mapGroup);
    // マップ
    var field = new Field(game.assets["/images/map01.png"], MAP, MAP);
    //mapGroup.addChild(field);
    // プレーヤー
    var player = new Player(game.assets["/images/player01.png"], Math.floor( Math.random() * COL_MAX_LENGTH * MAP_BLOCK_SIZE), Math.floor( Math.random() * ROW_MAX_LENGTH * MAP_BLOCK_SIZE));
    mapGroup.addChild(player);

    // キャラクターのグループ
    var charaGroup = new Group();

    // アイテム
    var item = new Item(game.assets["/images/player01.png"]);
    mapGroup.addChild(item);
    item.addEventListener('enterframe', function() { 
      if (player.intersect(this)) {
        // this.x += Math.floor(Math.random()*100);
        // this.y += Math.floor(Math.random()*100);
        this.parentNode.removeChild(this);
        player.y -= 3;
        location.href = "download";
      }
    })

    // 他のユーザのログイン
    socket.on("name", function(text) {
      var loginName = text;

      var otherPlayer = new OtherPlayer(game.assets["/images/player01.png"]);
      otherPlayer.loginName = loginName
      // キャラクタ表示レイヤーとメッセージ表示レイヤーに追加
      charaGroup.addChild(otherPlayer);
      mapGroup.addChild(otherPlayer);

      // 他キャラ衝突判定
      otherPlayer.addEventListener('enterframe', function() {
        if (player.intersect(this)) {
          // player.x -= 1;
          player.y -= 1;
        }
      });
 
      // 他キャラレンダー
      var geometry = new THREE.CubeGeometry(BLOCK_SIZE, BLOCK_SIZE + 60, BLOCK_SIZE);
      var texture = new THREE.ImageUtils.loadTexture("/images/wall01.jpg");
      var material = new THREE.MeshPhongMaterial({map: texture, bumpMap: texture, bumpScale: 0.2});

      var otherChara = new THREE.Mesh(geometry, material);
      scene.add(otherChara);

      // サーバからこのユーザの移動が来たら移動させる
      socket.on("position:" + loginName, function(pos) {
        otherPlayer.x = pos.x;
        otherPlayer.y = pos.y;
        otherPlayer.rotation = pos.rotation;
    
        var moveX = 0;
        var moveY = 0;
        // otherPlayer.lotation = pos.lotation;
        otherPlayer.x += moveX;
        otherPlayer.y += moveY;

        otherChara.rotation.y = -((otherPlayer.rotation + 90) * Math.PI / 180);
        otherChara.position.z = otherPlayer.y * (BLOCK_SIZE / MAP_BLOCK_SIZE);
        otherChara.position.x = otherPlayer.x * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      });

      // 切断が送られてきたら表示とオブジェクトの消去
        socket.on("disconnect:" + loginName, function() {
        // レイヤーから削除
        charaGroup.removeChild(otherPlayer);
        // charaGroup.removeChild(otherPlayer.loginName);
        delete otherPlayer;
      });
    });

    /* ---------- 3Dアクション ---------- */

    // シーン
    var scene = new THREE.Scene();
    // 壁
    var geometry = new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE);
    var material = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.0, transparent: true } );
    for (i = 0, max = MAP.length; i < max; i = i + 1) {
      for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
        if (MAP[i][j] == 1) {
          var cube = new THREE.Mesh(geometry, material);
          cube.position.set(BLOCK_SIZE * j, BLOCK_SIZE / 2, BLOCK_SIZE * i);
          scene.add(cube);
        }
      }
    }

    // ロードサイドオブジェクト1(plane)
    var geometry = new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE * 2);
    var texture = new THREE.ImageUtils.loadTexture("/images/roadside1.png");
    var material = new THREE.MeshPhongMaterial({map: texture, bumpMap: texture, side: THREE.DoubleSide, bumpScale: 0.2, transparent: true });
    for (i = 0, max = MAP.length; i < max; i = i + 1) {
      for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
        if (MAP[i][j] == 2) {
          var cube = new THREE.Mesh(geometry, material);
          cube.position.set(BLOCK_SIZE * j, BLOCK_SIZE -20, BLOCK_SIZE * i);
          scene.add(cube);
        }
      }
    }

    // ロードサイドオブジェクト2(plane)
    var geometry = new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE * 2);
    var texture = new THREE.ImageUtils.loadTexture("/images/roadside2.png");
    var material = new THREE.MeshPhongMaterial({map: texture, bumpMap: texture, side: THREE.DoubleSide, bumpScale: 0.2, transparent: true });
    for (i = 0, max = MAP.length; i < max; i = i + 1) {
      for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
        if (MAP[i][j] == 3) {
          var cube = new THREE.Mesh(geometry, material);
          cube.position.set(BLOCK_SIZE * j, BLOCK_SIZE - 20, BLOCK_SIZE * i);
          scene.add(cube);
        }
      }
    }

    // ロードサイドオブジェクト(obj)
    loadsideObject = null;
    var loader = new THREE.OBJMTLLoader();
    loader.load( '/images/male02.obj', '/images/male02_dds.mtl', function ( object ) {
      object.position.set(1900, 50, 1600); // 決めうち! mapには反映してないオブジェクト
      object.scale.set(2, 2, 2);
      scene.add(object);
      loadsideObject = object;
    });

    // アイテムオブジェクト
    var geometry = new THREE.CubeGeometry(BLOCK_SIZE, BLOCK_SIZE + 60, BLOCK_SIZE);
    var material = new THREE.MeshPhongMaterial({bumpMap: texture, bumpScale: 0.2});
    var itemObject = new THREE.Mesh(geometry, material);
    itemObject.position.set(item.y * 10, 100, item.x * 10);
    scene.add(itemObject);


    // 床
    var pGeometry = new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE);
    var pTexture = new THREE.ImageUtils.loadTexture("/images/asfalt7.jpg");
    var pMaterial = new THREE.MeshPhongMaterial({map: pTexture, side: THREE.DoubleSide, bumpMap: pTexture, bumpScale: 0.2});
    for (i = 0, max = MAP.length; i < max; i = i + 1) {
      for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
        if (MAP[i][j] == 0 || MAP[i][j] == 2 || MAP[i][j] == 3) {
          var plane = new THREE.Mesh(pGeometry, pMaterial);
          plane.position.set(BLOCK_SIZE * j, 0, BLOCK_SIZE * i);
          plane.rotation.x = 90 * Math.PI / 180;
          scene.add(plane);
        }
      }
    }

    // 背景
    var geometry = new THREE.SphereGeometry(4500, 60, 40);
    var bgImg = new THREE.ImageUtils.loadTexture('/images/sky2.jpg')
    var uniforms = {
      texture: { type: 't', value:  bgImg }
    };
    var material = new THREE.ShaderMaterial( {
      uniforms:       uniforms,
      vertexShader:   document.getElementById('sky-vertex').textContent,
      fragmentShader: document.getElementById('sky-fragment').textContent
    });
    skyBox = new THREE.Mesh(geometry, material);
    skyBox.scale.set(-1, 1, 1);
    skyBox.eulerOrder = 'XZY';
    skyBox.renderDepth = 1000.0;
    //skyBox.position.setY(300);
    scene.add(skyBox);


    // light
    var light = new THREE.PointLight(0x0000F0, 1.5, 300);
    light.position.set(0, BLOCK_SIZE / 2, 0);
    scene.add(light);
    var ambient = new THREE.AmbientLight(0xFFFFF0);
    scene.add(ambient);
    // camera
    var camera = new THREE.PerspectiveCamera(45, STAGE_WIDTH / STAGE_HEIGHT, 1, 10000);
    camera.position.set(0, BLOCK_SIZE / 2, 0);
    // rendering
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(STAGE_WIDTH, STAGE_HEIGHT);
    renderer.setClearColor(0x000000, 1);
    renderer.autoClear = false;
    renderer.shadowMapEnabled = true;
    document.getElementById("enchant-stage").appendChild(renderer.domElement);


    function bgUpdate() {
      skyBox.rotation.y += 0.0002;
      if (loadsideObject) {
        loadsideObject.rotation.y += 0.003;
      }
    }

    /* ---------- ゲームイベント ---------- */

    game.rootScene.addEventListener(enchant.Event.ENTER_FRAME, function() {
      camera.rotation.y = -((player.rotation + 90) * Math.PI / 180);
      camera.position.z = player.y * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      camera.position.x = player.x * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      light.rotation.y = -((player.rotation + 90) * Math.PI / 180);
      light.position.z = player.y * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      light.position.x = player.x * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      bgUpdate();
      renderer.render(scene, camera);
    });
  }
  game.start();

})();