(function () {

  var name = prompt("ニックネームを入れてください:");
  var socket = io.connect();
  
  window.ee = {
    listeners: {},
    on: function(evname, evaction){
      this.listeners[evname] = evaction
    },
    emit: function(evname /*, evargs */){
      this.listeners[evname] && this.listeners[evname].apply(null, [].slice.call(arguments, 1))
    }
  }
  

  socket.on("connect", function() {
    socket.emit("name", name);
    // socket.emit("message", massage); // 初期メッセージ
  });

  // 定数
  var STAGE_WIDTH = screen.width;
  var STAGE_HEIGHT = screen.height;

  var MAP = [];
  (function() {
    for (var i = 0; i < 100; i++) {
      var col = [];
      for (var j = 0; j < 100; j++) {
        if (i == 0 || i == 99) {
          col.push(1); // 壁用意
          // col.push(0); // 壁無し
        } else if (j == 0 || j == 99) {
          col.push(1); // 壁用意
          // col.push(0); // 壁無し
        } else {
          col.push(0);
        }
      }
      MAP.push(col);
    }
  })();

  var BLOCK_SIZE = 100;
  var COL_MAX_LENGTH = 0;
  var ROW_MAX_LENGTH = MAP.length;
  var i = 0, max;
  var j = 0, max2;
  for (var i = 0, max = MAP.length; i < max; i = i + 1) {
    for (var j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
      if (COL_MAX_LENGTH < MAP[i].length) {
          COL_MAX_LENGTH = MAP[i].length;
      }
    }
  }
  var PLAYER_MOVE_SPEED = 1.0;
  var PLAYER_ROTATION_SPEED = 2;
  var MAP_BLOCK_SIZE = 10;
  var CHARA_SIZE = 10;

  /*
  //------------------------------------- ゲーム開始 -------------------------------------------//
  */
  enchant();
  var game = new Core(STAGE_WIDTH, STAGE_HEIGHT);
  game.preload([
    "/images/map01.png", "/images/player01.png", "/images/wall01.jpg", "/images/land01.jpg"
  ]);
  game.fps = 60;
  game.keybind(' '.charCodeAt(0), 'b');

  /*---------- イントロ ---------*/
  var loadScene = new Scene();  
  game.loadingScene = loadScene;

  loadScene.addEventListener('progress', function(e) {
  });

  loadScene.addEventListener('load', function(e) {
    console.log("loaded")
    var core = enchant.Core.instance;
    core.removeScene(core.loadingScene);
    core.dispatchEvent(e);
  }); 

  firstCreateIntro();

  /*----------------イントロのシーン出し分けパート----------------*/    
  /*静的ロードサイドがロード完了したら呼び出される*/
  var introScene;

  function firstCreateIntro () {
    document.getElementById("logocontainer").style.visibility = "visible";
    document.getElementById("chat-area").style.visibility = "hidden";
    
    introScene = document.createElement("div");
    introScene.style.cssText = "float: left;"
                        + "position: fixed;"
                        + "width: 1000px;"
                        + "margin-left: "+ STAGE_WIDTH / 2.8 + "px;"
                        + "margin-top: "+ STAGE_HEIGHT / 3.7 + "px;";
  
    introScene.innerHTML = 
      "<img src='images/keys_thumb.png' width='170px' style='float:left;'></img>"
    + "<div style='width:50px; height: 10px; float:left;'></div>" 
    + "<img src='images/default.gif' style='float:left;'></img>"
    ;
    document.getElementById("dummyIntro").appendChild(introScene);
  }

  // TODO ここにasyncでNPCをレンダーする
  function toLenderingStart (renderer) {
    document.getElementById("dummyIntro").removeChild(introScene);
    document.getElementById("enchant-stage").appendChild(renderer.domElement);

  }

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
        Sprite.call(this, CHARA_SIZE, CHARA_SIZE);
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
          // console.log("x=="+ player.x + "Y===" + player.y)
        }

        socket.emit("position", { x : this.x, y : this.y , rotation: this.rotation });
      }
    });


    var OtherPlayer = Class.create(Sprite, {
      isMove: false,
      initialize: function (image, x, y, log_name) {
        Sprite.call(this, CHARA_SIZE, CHARA_SIZE);
        this.x = x;
        this.y = y;
        this.image = image;
        this.loginName = log_name;
        this.rotation = 90;
        this.soundTrackNumber;
        // this.addEventListener(enchant.Event.ENTER_FRAME, this.onEnterFrame);
      }
    })

    var Item = Class.create(Sprite, {
      isMove: false,
      initialize: function (image, x, y, log_name) {
        Sprite.call(this, CHARA_SIZE, CHARA_SIZE);
        this.x = 500;
        this.y = 500;
        this.image = image;
        this.rotation = 90;
        // this.addEventListener(enchant.Event.ENTER_FRAME, this.onEnterFrame);
      }
    })


    var TweetItem = Class.create(Sprite, {
      isMove: false,
      initialize: function (image, x, y, desc) {
        Sprite.call(this, CHARA_SIZE, CHARA_SIZE);
        this.x = x * 10;
        this.y = y * 10;
        this.image = image;
        this.rotation = 90;
        this.touched = false;
        this.description = desc;
        // this.addEventListener(enchant.Event.ENTER_FRAME, this.onEnterFrame);
      }
    })

    var NPC = Class.create(Sprite, {
      initialize: function (image, x, y, log_name) {
        Sprite.call(this, CHARA_SIZE, CHARA_SIZE);
        // 超雑　ひどい
        this.speed = Math.floor(Math.random() * 12) % 12 == 0 ? 9 : Math.floor(Math.random() * 2) + 1
        if(Math.floor(Math.random() * 2) == 0) {
          this.x = -Math.floor(Math.random()*200) + 200;
          this.y = Math.floor(Math.random()*130)  + 400;
          this.image = image;
          this.rotation = 0;
          this.isMoving = false;
          this.end = false;
          this.degree = 0;
          this.addEventListener('enterframe', function() {
            this.moveBy(this.speed, 0);
            if(this.degree == 1500) {
              this.end = true;
              // this.x = -Math.floor(Math.random()*200) + 200;
              // this.y = Math.floor(Math.random()*100 + 450);
            }
            this.degree += 1;
          });
        } else {
          this.x = 1500　-Math.floor(Math.random()*200) + 200;
          this.y = Math.floor(Math.random()*150) + 400;
          this.image = image;
          this.rotation = 180;
          this.isMoving = false;
          this.end = false;
          this.degree = 0;
          this.addEventListener('enterframe', function() {
            this.moveBy(-this.speed, 0);
            if(this.degree == 1500) {
              this.end = true;
              // this.x = 1500　-Math.floor(Math.random()*200) + 200;
              // this.y = Math.floor(Math.random()*100 + 450);
            }
            this.degree += 1;
          });
        }
      }
    });

    var npcSets = [];



    /* ---------- ゲームアクション ---------- */

    // シーン
    mapGroup = new Group(); //CHECK: global. super bad
    mapGroup.x = 10;
    mapGroup.y = 10;
    game.rootScene.addChild(mapGroup);
    // マップ
    var field = new Field(game.assets["/images/map01.png"], MAP, MAP);
    // mapGroup.addChild(field);
    
    // プレーヤー
    // var player = new Player(game.assets["/images/player01.png"], Math.floor( Math.random() * COL_MAX_LENGTH * CHARA_SIZE * 0.9), Math.floor( Math.random() * ROW_MAX_LENGTH * CHARA_SIZE* 0.9));
    var player = new Player("", Math.floor( Math.random() * COL_MAX_LENGTH * CHARA_SIZE * 0.5) + 100, Math.floor( Math.random() * ROW_MAX_LENGTH * CHARA_SIZE * 0.5) + 100);
    mapGroup.addChild(player);

     
    // キャラクターのグループ
    var charaGroup = new Group();

    // アイテム
    var itemObject;

    var item = new Item("");
    mapGroup.addChild(item);
    item.addEventListener('enterframe', function() { 
      if (player.intersect(this)) {
        this.x += Math.floor(Math.random()*200);
        this.y += Math.floor(Math.random()*200);
        // itemObject.position.set(this.x * 10, 50, this.y * 10);
        this.parentNode.removeChild(this);
        scene.remove(itemObject);
        location.href = "download";
      }
    });

    // ツイートオブジェクト
    function createTweetItems () {
      
      async.forEachSeries(Object.keys(TweetMaps), function(tweetPoint, callback_each) {
        for (var i in TweetMaps[tweetPoint].locations) { 
          var tweetItem = new TweetItem("", TweetMaps[tweetPoint].locations[i][0], TweetMaps[tweetPoint].locations[i][1] ,TweetMaps[tweetPoint].description);
          mapGroup.addChild(tweetItem);
          tweetItem.addEventListener('enterframe', function() { 
            if (player.intersect(this)) {
              if(!this.touched) {
                this.touched = true;
              }
            } else {
              this.touched = false;
            } 
          });
        }

        callback_each();
      }, function(err) {
      });
    }
    

    // 他のユーザーリストの取得
    socket.emit("get_user_list");


    // 他のユーザのログイン
    socket.on("name", function(data) {
      var loginName = data.login_id;
      var otherPlayer = new OtherPlayer("");
      otherPlayer.loginName = loginName;
      otherPlayer.soundTrackId = Math.floor(Math.random() * 2);

      // キャラクタ表示レイヤーとメッセージ表示レイヤーに追加
      charaGroup.addChild(otherPlayer);
      mapGroup.addChild(otherPlayer);
      
      // 他キャラ衝突判定
      otherPlayer.addEventListener('enterframe', function() {
        if (player.intersect(this)) {
          // player.x -= 1;
          // this.y -= 10;
          // CHECk: ここを角度から移動する位置を三角関数で算出も出来るはず
          player.y -= 2;
        }
      });
 
      // 他キャラレンダー 超バッド
      var otherChara;
      if (npcModel == undefined) {
        var jsonLoader = new THREE.JSONLoader();
        jsonLoader.load("./javascripts/json_objects/plane_car.js", function(geometry, materials) { 
          var faceMaterial = new THREE.MeshFaceMaterial( materials );
          
          otherChara = new THREE.Mesh( geometry, faceMaterial );
          otherChara.scale.set(200, 200, 200);

          for (var i = 0; i < 12; i++) {
            if (i == 1) {
              otherChara.material.materials[i].ambient = { r: Math.random(), g: Math.random(), b:Math.random()};
            } else {
              otherChara.material.materials[i].ambient = otherChara.material.materials[i].color;
            }
          }
          scene.add(otherChara);
        });
      } else {
        otherChara = npcModel.clone();
        otherChara.material = npcMaterial.clone();
        otherChara.scale.set(200, 200, 200);
        
        for (var i = 0; i < 12; i++) {
          if (i == 1) {
            otherChara.material.materials[i].ambient = { r: Math.random(), g: Math.random(), b:Math.random()};
          } else {
            otherChara.material.materials[i].ambient = otherChara.material.materials[i].color;
          }
        }
        scene.add(otherChara);
      }

      // 他キャラ名前テクスチャレンダー
      // テクスチャを描画
      var canvas = document.createElement('canvas');
      canvas.width = 500; canvas.height = 250;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.font = "40px sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(data.login_name, 256, 100);
      var texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
       
      var geometry = new THREE.PlaneGeometry(2, 1);
      var material = new THREE.MeshPhongMaterial({
        color: 0xffffff, specular: 0xcccccc, shininess:100, ambient: 0xffffff,
        map: texture, side: THREE.DoubleSide, transparent: true });
      var charaMassage = new THREE.Mesh(geometry, material);
      charaMassage.position.set(0, 140, 0);
      charaMassage.scale.set(100, 100, 100);
      scene.add(charaMassage);


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

        if(otherChara != undefined) {
          otherChara.rotation.y = charaMassage.rotation.y = -((otherPlayer.rotation - 90) * Math.PI / 180);
          otherChara.position.z = charaMassage.position.z = otherPlayer.y * (BLOCK_SIZE / CHARA_SIZE);
          otherChara.position.x = charaMassage.position.x = otherPlayer.x * (BLOCK_SIZE / CHARA_SIZE);
        }
        
        // -------------音操作系-------------- //
        if(gainNodes[otherPlayer.soundTrackId % gainNodes.length] != undefined) {
          // gainNode.gain.value = 0.0;
          gainNodes[otherPlayer.soundTrackId % gainNodes.length].gain.value =  (10 / Math.sqrt(Math.pow(player.x - otherPlayer.x, 2) + Math.pow(player.y - otherPlayer.y, 2)) );
        };

      });

      // 切断が送られてきたら表示とオブジェクトの消去
        socket.on("disconnect:" + loginName, function() {
        // レイヤーから削除
        charaGroup.removeChild(otherPlayer);
        mapGroup.removeChild(otherPlayer);
        scene.remove(otherChara);
        scene.remove(charaMassage);
        delete otherPlayer;
      });
    });


    /* ---------- 3Dアクション ---------- */

    // シーン
    var scene = new THREE.Scene();
    
    // NPC
    var npcModel;
    var npcMaterial;
    var npcModelLoaded = false;

    var geometry = new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE);
    var material = new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.0, transparent: true } );
    for (var i = 0, max = MAP.length; i < max; i = i + 1) {
      for (var j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
        if (MAP[i][j] == 1) {
          var cube = new THREE.Mesh(geometry, material);
          cube.position.set(BLOCK_SIZE * j, BLOCK_SIZE / 2, BLOCK_SIZE * i);
          scene.add(cube);
        }
      }
    }

    //// ---静的ロードサイドオブジェクト(obj)--- ////
    var jsonLoader = new THREE.JSONLoader();
    var progressCount = 0;
    async.forEachSeries(Object.keys(Shops), function(shop, callback) {
      jsonLoader.load(Shops[shop].path, function(geometry, materials) {
        for (var i in Shops[shop].locations) {
          var faceMaterial = new THREE.MeshFaceMaterial( materials );
          
          var mesh = new THREE.Mesh( geometry, faceMaterial );
          mesh.position.set(Shops[shop].locations[i][0] * BLOCK_SIZE, 10, Shops[shop].locations[i][1] * BLOCK_SIZE); 
          mesh.scale.set( Shops[shop].scale , Shops[shop].scale , Shops[shop].scale );

          mesh.rotation.set(0, -((Shops[shop].rotation - 90) * Math.PI / 180), 0)
          
          for (var l = 0; l < mesh.material.materials.length; l++) {
            mesh.material.materials[l].ambient = mesh.material.materials[l].color;
          }
          scene.add(mesh);
        }
        console.log(Shops[shop].path)
        progressCount += 1;
        var progress = (progressCount / Object.keys(Shops).length) * 100
        console.log( progress + "%")
        callback();
      }); 
    }, function(err){
      // CHECK 超バッド
      lenderNPC();
      toLenderingStart(renderer);
      isAdmin(name);
      if (adminFlag) createTweetObjects();
      if (adminFlag) createTweetItems();
    });

    // オリジナル作成
    function lenderNPC () {
      async.waterfall([
        function (callback) {
          var jsonLoader = new THREE.JSONLoader();
          jsonLoader.load("./javascripts/json_objects/plane_car.js", function(geometry, materials) { 
            npcMaterial = new THREE.MeshFaceMaterial( materials );
            npcModel = new THREE.Mesh( geometry, npcMaterial );
            npcModel.scale.set(200, 200, 200);
            callback();
          });
        }, function (callback) {
          npcModelLoaded = true;
          callback();
        }
      ], 
      function(err) { 
        if (err) {
          throw err;
        }
        console.log("NPC lender.....done")
      });
    }

    function NPCModel (npcSet) {
      if (npcModelLoaded) {
        var model = npcModel.clone();
        model.material = npcMaterial.clone();
        model.rotation.set(0, -((npcSet.dataset.rotation - 90) * Math.PI / 180), 0);
        
        for (var i = 0; i < 12; i++) {
          if (i == 1) {
            model.material.materials[i].ambient = { r: Math.random(), g: Math.random(), b:Math.random()};
          } else {
            model.material.materials[i].ambient = model.material.materials[i].color;
          }
        }
        scene.add(model);
        npcSet.model = model;
        npcSets.push(npcSet);
      }
    }
    
    // アイテムオブジェクト
    var jsonLoader = new THREE.JSONLoader();
    jsonLoader.load("./javascripts/json_objects/mp3.js", function(geometry, materials) { 
      var faceMaterial = new THREE.MeshFaceMaterial( materials );
      itemObject = new THREE.Mesh( geometry, faceMaterial );
      itemObject.position.set(item.x * 10, 100, item.y * 10); 
      itemObject.scale.set( 30, 30, 30);      
      for (var l = 0; l < itemObject.material.materials.length; l++) {
        itemObject.material.materials[l].ambient = itemObject.material.materials[l].color;
      }

      scene.add(itemObject);
    });

    // 遊覧船
    var testObject;
    jsonLoader.load("./javascripts/json_objects/mp3.js", function(geometry, materials) { 
      var faceMaterial = new THREE.MeshFaceMaterial( materials );
      testObject = new THREE.Mesh( geometry, faceMaterial );
      testObject.position.set(1000, 3000, 10000); 
      testObject.scale.set( 70, 70, 70);      
      for (var l = 0; l < testObject.material.materials.length; l++) {
        testObject.material.materials[l].ambient = testObject.material.materials[l].color;
      }

      scene.add(testObject);
    });

    // ツイートオブジェクトまわり
  
    function createTweetObjects () {
      var tweetObject;
      var tweetModelMaterial;

      async.waterfall([
        function (callback) {
          jsonLoader.load("./javascripts/json_objects/mp3.js", function(geometry, materials) { 
            tweetModelMaterial = new THREE.MeshFaceMaterial( materials );
            tweetObject = new THREE.Mesh( geometry, tweetModelMaterial );
            for (var l = 0; l < tweetObject.material.materials.length; l++) {
              tweetObject.material.materials[l].ambient = tweetObject.material.materials[l].color;
            }
            callback();
          });
          
        }, function (callback) {
          async.forEachSeries(Object.keys(TweetMaps), function(tweetPoint, callback_each) {
            for (var i in TweetMaps[tweetPoint].locations) {
              var tweet = tweetObject.clone();
              tweet.material = tweetModelMaterial.clone();
              tweet.position.set(TweetMaps[tweetPoint].locations[i][0] * BLOCK_SIZE, 10, TweetMaps[tweetPoint].locations[i][1] * BLOCK_SIZE); 
              tweet.scale.set( TweetMaps[tweetPoint].scale , TweetMaps[tweetPoint].scale , TweetMaps[tweetPoint].scale );

              tweet.rotation.set(0, -((TweetMaps[tweetPoint].rotation - 90) * Math.PI / 180), 0)
              
              // for (var l = 0; l < tweet.material.materials.length; l++) {
              //   tweet.material.materials[l].ambient = tweet.material.materials[l].color;
              // }
              scene.add(tweet);
            }
            callback_each();
          }, function(err) {
          });
        callback();
        }
      ], 
      function(err) { 
        if (err) {
          throw err;
        }
      });
    }

    // 床
    var pGeometry = new THREE.PlaneGeometry(MAP_BLOCK_SIZE*10000, MAP_BLOCK_SIZE*10000);
    var pTexture = new THREE.ImageUtils.loadTexture("/images/asfalt7.jpg");
    var pMaterial = new THREE.MeshPhongMaterial({map: pTexture, side: THREE.DoubleSide, bumpMap: pTexture, bumpScale: 0.2});
    var plane = new THREE.Mesh(pGeometry, pMaterial);
    plane.position.set(100, 0, 1);
    plane.rotation.x = 90 * Math.PI / 180;
    scene.add(plane);


    // 背景
    var geometry = new THREE.SphereGeometry(100, 100, 100);
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
    skyBox.scale.set(-70, 70, 70);
    skyBox.position.set(50 * BLOCK_SIZE, 250, 50 * BLOCK_SIZE);
    skyBox.eulerOrder = 'XZY';
    skyBox.renderDepth = 2000.0;
    //skyBox.position.setY(300);
    scene.add(skyBox);


    /*---  webGL render ---*/
    // light
    var light = new THREE.PointLight(0x0000F0, 1.5, 300);
    light.position.set(0, BLOCK_SIZE / 4, 0);
    scene.add(light);
    var ambient = new THREE.AmbientLight(0xFFFFF0);
    scene.add(ambient);
    // camera
    var camera = new THREE.PerspectiveCamera(45, STAGE_WIDTH / STAGE_HEIGHT, 1, 15000);
    camera.position.set(0, BLOCK_SIZE / 4, 0);
    // rendering
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(STAGE_WIDTH, STAGE_HEIGHT);
    renderer.setClearColor(0x000000, 1);
    renderer.autoClear = false;
    renderer.shadowMapEnabled = true;

    airCamera = false; // global. bad.

    var aroundCount = 0;
    function cycleAroundWorld(object, atr) {
      aroundCount += 0.0001;
      object.position.z = (Math.sin(aroundCount) * 5000) + 5000;
      object.position.x = (Math.cos(aroundCount) * 5000) + 5000;
      if (atr == "rota") {
        camera.rotation.y = (( (-aroundCount * 57.25) + 90) * Math.PI / 180);
          // console.log(Math.sin(aroundCount)* Math.PI / 180 )
        // object.rotation.y = -((Math.sin(aroundCount) * 90) * Math.PI / 180)
      }
    }

    function bgUpdate() {
      skyBox.rotation.y += 0.0002;
      if (itemObject != undefined) {
        itemObject.rotation.y += 0.01;
      }

      if (testObject != undefined) {
        cycleAroundWorld(testObject);
      }
    }

    function cameraUpdate() {
      if (airCamera == true) {
        camera.position.y = 1400;
        cycleAroundWorld(camera, "rota");
      } else {
        camera.rotation.y = -((player.rotation + 90) * Math.PI / 180);
        camera.position.z = player.y * (BLOCK_SIZE / CHARA_SIZE);
        camera.position.x = player.x * (BLOCK_SIZE / CHARA_SIZE);
        light.rotation.y = -((player.rotation + 90) * Math.PI / 180);
        light.position.z = player.y * (BLOCK_SIZE / CHARA_SIZE);
        light.position.x = player.x * (BLOCK_SIZE / CHARA_SIZE);
      }
    }

    ee.on("aircamera", function (airCamera) {
      console.log("socketair")
      if (!airCamera) {
        camera.position.y = BLOCK_SIZE / 4;
      }
    });
      

    var npcGroup = new Group();
    function npcCreate () {
      var npcSet = {};
      npcSet.dataset = new NPC("");

      /*^^^^^^^^^^^ CHECK:  NPCのあたり判定　ここから^^^^^^^^^^^^^^^^*/
      npcSet.dataset.addEventListener( "enterframe", function() { 
        // for (var i = 0; i < npcGroup.childNodes.length; i ++) {
        //   if (this.intersect(npcGroup.childNodes[i]) ) {
        //     if (npcGroup.childNodes[i] != this) {
        //       if (this.rotation == 0) {
        //         this.moveBy(-2, -0);
        //       } else {
        //         this.moveBy(2, 0);
        //       }
        //     }
        //   }
        // }

        if (player.intersect(this)) {
          if (this.rotation == 0) {
            player.moveBy(3, 0);
            } else {
            player.moveBy(-3, 0);
          }
        }
        
      });
      /*^^^^^^^^^^^^^^^ CHECK:  NPCのあたり判定　ここまで^^^^^^^^^^*/

      npcGroup.addChild(npcSet.dataset);
      mapGroup.addChild(npcGroup);
      npcSet.soundTrackId = Math.floor(Math.random() * 2);
      NPCModel(npcSet);
    }

    function randomNpcCreate () {
      if( Math.floor(Math.random() * 160) % 160 == 0) {
        npcCreate();
      }
    }

    /* ---------- ゲームイベント ---------- */

    game.rootScene.addEventListener(enchant.Event.ENTER_FRAME, function() {
      cameraUpdate();
      bgUpdate();
      if (npcSets.length < 11) {
        randomNpcCreate();
      }

      if (game.input.b) {
        cracshonPlay();
      }

      if(npcSets.length != 0) {
        for (var i = 0; i < npcSets.length; i ++) {
          npcSets[i].model.position.z = npcSets[i].dataset.y * (BLOCK_SIZE / CHARA_SIZE);
          npcSets[i].model.position.x = npcSets[i].dataset.x * (BLOCK_SIZE / CHARA_SIZE);
          // if (npcSets[i].intersect() ) {
          //   console.log("bang")
          // }

          // -------------音操作系-------------- //
          if(gainNodes[npcSets[i].soundTrackId] != undefined) {
            gainNodes[npcSets[i].soundTrackId].gain.value =  (10 / Math.sqrt(Math.pow(player.x - npcSets[i].dataset.x, 2) + Math.pow(player.y - npcSets[i].dataset.y, 2)) );
          }

          //------------消す処理------------ //
          if (npcSets[i].dataset.end == true) {
            npcGroup.removeChild(npcSets[i].dataset);

            scene.remove(npcSets[i].model);
            npcSets.splice(i, 1);
          }
        }
      }

      renderer.render(scene, camera);

    });


    /*----------------サウンドパート----------------*/
    var gainNodes = [];
    var audio = new AudioBufferLoader("sounds/car1.mp3", "sounds/car2.mp3", function() {
      var source, gainNode;
      var self = this;
      for (var i = 0; i < self.urlList.length; i++) {
        var source = self.context.createBufferSource();
        source.buffer = self.bufferList[i];
        source.loop = true;
        gainNode = self.context.createGain();
        gainNode.gain.value = 0.0;
        source.connect(gainNode);
        gainNode.connect(self.context.destination)
        gainNodes.push(gainNode);
        source.start();
      }      
    });
  }

  var audioctx;
  window.AudioContext = window.AudioContext
      || window.webkitAudioContext
      || window.mozAudioContext
      || window.msAudioContext;
  try {
      audioctx = new AudioContext;
  }
  catch(e) {
      alert('Web Audio API is not supported in this browser');
  }

  // クラクション
  var cracshonSource;
  new AudioBufferLoader("sounds/pu.mp3", function() {
      var self = this;
      cracshonSource = self.context.createBufferSource();
      cracshonSource.buffer = self.bufferList[0];
      // gainNode = self.context.createGain();
      // gainNode.gain.value = 0.5;
      // source.connect(gainNode);
      // gainNode.connect(self.context.destination)
      // gainNodes.push(gainNode);
      // source.start();
  });

  function cracshonPlay() {
    var src = audioctx.createBufferSource();
    src.buffer = cracshonSource.buffer;

    var gainNode = audioctx.createGain();
    gainNode.gain.value = 0.05;
    src.connect(gainNode);
    gainNode.connect(audioctx.destination);

    src.start(0);
  }

  var viamusic = new Audio();
  viamusic.src = "sounds/ikuzou.mp3";
  viamusic.volume = 0.2;
  viamusic.loop = true;
  viamusic.play();


  /* ---------- チャット ---------- */

  function publishMessage() {
    var textInput = document.getElementById('msg_input');
    var msg = "[" + name + "] " + textInput.value.slice(0, 128);
    socket.emit("publish", {value: msg});
    textInput.value = '';
  }

  function addMessage (msg) {
    var domMeg = document.createElement('div');
    var messageLength = document.getElementById("msg").children.length;
    if (messageLength > 20) {
      document.getElementById("msg").removeChild(document.getElementById("msg").firstElementChild);
    }
    domMeg.innerHTML = new Date().toLocaleTimeString() + ' ' + msg;
    msgArea.appendChild(domMeg);
  }
  socket.on( "publish", function (data) { 
    addMessage(data.value); 
  });

  var msgArea = document.getElementById("msg");
  document.getElementById("publish-message").addEventListener("click", function () {
    publishMessage();
  })

  document.getElementById("msg_input").addEventListener("keypress", function (e) {
    if(13 === e.keyCode) {
      publishMessage();  
    }
  })

  /*------------------- デバグ系 -----------------*/
  var adminFlag;
  function isAdmin (name) {
    if( name.indexOf('admin') != -1 ) {
      document.getElementById("chat-area").style.visibility = "visible";
      adminFlag = true;
    }
  }

  document.addEventListener("keypress", function (e) {
    if (109 === e.keyCode) {
      viamusic.pause();
    } 
    if (97 === e.keyCode && adminFlag) {
      console.log("air camera")
      airCamera = !airCamera;
      ee.emit("aircamera", airCamera);
    }
  })
  document.addEventListener("keypress", function (e) {
    if (13 === e.keyCode) {
      for (var i = 0; i < mapGroup.childNodes.length; i++) {
        if (mapGroup.childNodes[i].touched) {
          window.open("http://twitter.com/share?url=[http://roadside3d.herokuapp.com/]&text=["+mapGroup.childNodes[i].description+"]&related=[Tuxu_Records]&hashtags=[ロードサイドオンライン]", '',  'width=400, height=250')
        }
      }
    }
  })
  

  game.start();

})();