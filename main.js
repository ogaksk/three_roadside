(function () {

  // 定数
  var STAGE_WIDTH = 1200;
  var STAGE_HEIGHT = 600;
  var MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
    "map01.png", "player01.png", "wall01.jpg", "land01.jpg"
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
        }
      }
    });

    /* ---------- ゲームアクション ---------- */

    // シーン
    var mapGroup = new Group();
    mapGroup.x = 10;
    mapGroup.y = 10;
    game.rootScene.addChild(mapGroup);
    // マップ
    var field = new Field(game.assets["map01.png"], MAP, MAP);
    mapGroup.addChild(field);
    // プレーヤー
    var player = new Player(game.assets["player01.png"], ((MAP_BLOCK_SIZE * COL_MAX_LENGTH) / 2) - (MAP_BLOCK_SIZE / 2), ((MAP_BLOCK_SIZE * ROW_MAX_LENGTH) / 2) - (MAP_BLOCK_SIZE / 2));
    mapGroup.addChild(player);

    /* ---------- 3Dアクション ---------- */

    // シーン
    var scene = new THREE.Scene();
    // 壁
    var geometry = new THREE.CubeGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    var texture = new THREE.ImageUtils.loadTexture("wall01.jpg");
    var material = new THREE.MeshPhongMaterial({map: texture, bumpMap: texture, bumpScale: 0.2});
    for (i = 0, max = MAP.length; i < max; i = i + 1) {
      for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
        if (MAP[i][j] == 1) {
          var cube = new THREE.Mesh(geometry, material);
          cube.position.set(BLOCK_SIZE * j, BLOCK_SIZE / 2, BLOCK_SIZE * i);
          scene.add(cube);
        }
      }
    }
    // 床
    var pGeometry = new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE);
    var pTexture = new THREE.ImageUtils.loadTexture("land01.jpg");
    var pMaterial = new THREE.MeshPhongMaterial({map: pTexture, side: THREE.DoubleSide, bumpMap: pTexture, bumpScale: 0.2});
    for (i = 0, max = MAP.length; i < max; i = i + 1) {
      for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
        if (MAP[i][j] == 0) {
          var plane = new THREE.Mesh(pGeometry, pMaterial);
          plane.position.set(BLOCK_SIZE * j, 0, BLOCK_SIZE * i);
          plane.rotation.x = 90 * Math.PI / 180;
          scene.add(plane);
        }
      }
    }
    // 天井
    var uGeometry = new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE);
    var uTexture = new THREE.ImageUtils.loadTexture("wall01.jpg");
    var uMaterial = new THREE.MeshPhongMaterial({map: uTexture, side: THREE.DoubleSide, bumpMap: pTexture, bumpScale: 0.2});
    for (i = 0, max = MAP.length; i < max; i = i + 1) {
      for (j = 0, max2 = MAP[i].length; j < max2; j = j + 1) {
        if (MAP[i][j] == 0) {
          var plane = new THREE.Mesh(uGeometry, uMaterial);
          plane.position.set(BLOCK_SIZE * j, BLOCK_SIZE, BLOCK_SIZE * i);
          plane.rotation.x = 90 * Math.PI / 180;
          scene.add(plane);
        }
      }
    }
    // light
    var light = new THREE.PointLight(0xFFFFFF, 1.5, 300);
    light.position.set(0, BLOCK_SIZE / 2, 0);
    scene.add(light);
    var ambient = new THREE.AmbientLight(0x000000);
    scene.add(ambient);
    // camera
    var camera = new THREE.PerspectiveCamera(45, STAGE_WIDTH / STAGE_HEIGHT, 1, 10000);
    camera.position.set(0, BLOCK_SIZE / 2, 0);
    // rendering
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(STAGE_WIDTH, STAGE_HEIGHT);
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMapEnabled = true;
    document.getElementById("enchant-stage").appendChild(renderer.domElement);

    /* ---------- ゲームイベント ---------- */

    game.rootScene.addEventListener(enchant.Event.ENTER_FRAME, function() {
      camera.rotation.y = -((player.rotation + 90) * Math.PI / 180);
      camera.position.z = player.y * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      camera.position.x = player.x * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      light.rotation.y = -((player.rotation + 90) * Math.PI / 180);
      light.position.z = player.y * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      light.position.x = player.x * (BLOCK_SIZE / MAP_BLOCK_SIZE);
      renderer.render(scene, camera);
    });
  };
  game.start();

})();