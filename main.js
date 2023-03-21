import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "https://cdn.jsdelivr.net/npm/three@0.115/examples/jsm/controls/DragControls.js";

var scene,
  renderer,
  camera,
  INTERSECTED,
  intersects,
  gui,
  dragControls,
  orbitControls,
  room,
  floor,
  roof;
var objects = [];
var dragObject = [];
var boardObjects = [];
var raycaster = new THREE.Raycaster();
var tableHeight = 8.2;

//Materials
const greyMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const floorMaterial = new THREE.MeshBasicMaterial({
  side: THREE.BackSide,
  color: 0x1367a3,
});

//Camera
function createCamera() {
  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    1,
    100
  );
  camera.position.z = 1;
  camera.position.y = 20;
  camera.position.x = -15;
  camera.lookAt(-15, 8.2, 1);
}

function createScene() {
  //Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8e8e8e);
}

function createRenderer() {
  //Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
}

//Light
function createLight() {
  const ambiental = new THREE.AmbientLight(0x222222);
  scene.add(ambiental);

  const direccional = new THREE.DirectionalLight(0xffffff, 0.4);
  direccional.position.set(0, 30, 0);
  direccional.castShadow = true;
  scene.add(direccional);
  // scene.add(new THREE.CameraHelper(direccional.shadow.camera));

  const focal = new THREE.SpotLight(0xffffff, 0.4);
  focal.position.set(-12, 15, 2);
  40, 40, 40, 40;
  focal.target.position.set(5, 10, 3);
  focal.angle = Math.PI / 7;
  focal.penumbra = 0.3;
  focal.castShadow = true;
  focal.shadow.camera.far = 20;
  focal.shadow.camera.fov = 80;
  scene.add(focal);
  scene.add(focal.target);
  // scene.add(new THREE.CameraHelper(focal.shadow.camera));
}

//create room
function createRoom(material) {

  //0x949494
  var floorMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    map: new THREE.TextureLoader().load("./wallpapers/stone.jpeg"),
  });

  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 100, 100),
    floorMaterial
  );
  floor.rotation.x = Math.PI / 2;
  floor.position.y = -0.5;
  floor.castShadow = floor.receiveShadow = true;
  scene.add(floor);

  roof = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 100, 100), material);
  roof.rotation.x = -Math.PI / 2;
  roof.position.y = 99.5;
  roof.castShadow = floor.receiveShadow = true;
  scene.add(roof);

  const walls = [];

  walls.push(material);
  walls.push(material);
  walls.push(material);
  walls.push(material);

  room = new THREE.Mesh(new THREE.BoxGeometry(100, 100, 100, 100), walls);
  room.rotation.y = Math.PI;
  room.rotation.x = Math.PI / 2;
  room.rotation.z = Math.PI / 2;
  room.position.y = 49.5;
  scene.add(room);
}

function mapTexture(texturePath) {
  var texture = new THREE.TextureLoader().load(texturePath);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
  });
  return material;
}

//create chess board
function createChessBoard() {
  var loader = new GLTFLoader();
  loader.load("chess-board/Unity2Skfb.gltf", function (gltf) {
    gltf.scene.position.set(3.5, 7.5, 3.5);
    gltf.scene.scale.set(0.4, 0.5, 0.4);
    const material = mapTexture("chess-board/textures/chess_board.jpg");
    gltf.scene.traverse((o) => {
      if (o.isObject3D) {
        o.castShadow = o.receiveShadow = true;
        o.material = material;
      }
    });
    scene.add(gltf.scene);
    gltf.scene;
  });
}

function loadPiece(object, position, material) {
  var loader = new GLTFLoader();
  loader.load(object, function (gltf) {
    gltf.scene.position.set(position.x, position.y, position.z);
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        o.material = material;
      }
      if (o.isObject3D) {
        o.castShadow = o.receiveShadow = true;
      }
    });
    scene.add(gltf.scene);
    objects.push(gltf.scene);
    return gltf.scene;
  });
}

function loadRotatedPiece(object, position, material) {
  var loader = new GLTFLoader();
  loader.load(object, function (gltf) {
    gltf.scene.position.set(position.x, position.y, position.z);
    gltf.scene.traverse((o) => {
      if (o.isMesh) {
        o.material = material;
      }
      if (o.isObject3D) {
        o.castShadow = o.receiveShadow = true;
      }
    });
    gltf.scene.rotation.y = Math.PI;
    scene.add(gltf.scene);
    objects.push(gltf.scene);
  });
}

//Animation
var animate = function () {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

//create drag controls
function createDragControls() {
  dragControls = new DragControls(dragObject, camera, renderer.domElement);

  //hold shift to move object
  window.addEventListener("keydown", function (event) {
    console.log(event.key);
    if (event.key == "Shift") {
      orbitControls.enabled = false;
    }
  });

  window.addEventListener("keyup", function (event) {
    if (event.key == "Shift") {
      orbitControls.enabled = true;
    }
  });
}

window.addEventListener("mousedown", raycast, false);

function raycast(event) {
  dragObject = [];

  let x = event.clientX;
  let y = event.clientY;
  x = (x / window.innerWidth) * 2 - 1;
  y = -(y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

  objects.forEach((object) => {
    intersects = raycaster.intersectObjects(object.children, true);
    if (intersects.length > 0) {
      INTERSECTED = intersects[0].object;
      dragObject.push(INTERSECTED);
      createDragControls();
    }
  });
}

function loadPawns(material, row) {
  for (let column = 0; column < 8; column++) {
    loadPiece(
      "lowpolychess/pawn/scene.gltf",
      new THREE.Vector3(column, tableHeight, row),
      material
    );
  }
}

function loadPairs(piece, offset) {
  loadPiece(piece, new THREE.Vector3(0 + offset, tableHeight, 0), greyMaterial);

  loadPiece(piece, new THREE.Vector3(7 - offset, tableHeight, 0), greyMaterial);

  loadPiece(
    piece,
    new THREE.Vector3(0 + offset, tableHeight, 7),
    whiteMaterial
  );

  loadPiece(
    piece,
    new THREE.Vector3(7 - offset, tableHeight, 7),
    whiteMaterial
  );
}

function loadTimer() {
  var loader = new GLTFLoader();
  loader.load("chess_timer/scene.gltf", function (gltf) {
    gltf.scene.position.set(-2, tableHeight, 3.5);
    gltf.scene.rotation.y = -Math.PI / 2;
    gltf.scene.name = "timer";
    const material = mapTexture("chess_timer/textures/lambert4SG_diffuse.png");
    gltf.scene.traverse((o) => {
      if (o.isMesh) o.material = material;
      if (o.isObject3D) o.castShadow = o.receiveShadow = true;
    });
    scene.add(gltf.scene);
    objects.push(gltf.scene);
  });
}

function loadKnights() {
  let knightPath = "lowpolychess/knight/scene.gltf";
  //blacks
  loadPiece(knightPath, new THREE.Vector3(1, tableHeight, 0), greyMaterial);
  loadPiece(knightPath, new THREE.Vector3(6, tableHeight, 0), greyMaterial);

  //whites
  loadRotatedPiece(
    knightPath,
    new THREE.Vector3(1, tableHeight, 7),
    whiteMaterial
  );
  loadRotatedPiece(
    knightPath,
    new THREE.Vector3(6, tableHeight, 7),
    whiteMaterial
  );
}

function loadTable() {
  var loader = new GLTFLoader();
  loader.load("wood_table/scene.gltf", function (gltf) {
    gltf.scene.position.set(5, 5.5, 3.5);
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.traverse((o) => {
      if (o.isObject3D) o.castShadow = o.receiveShadow = true;
    });
    scene.add(gltf.scene);
  });
}

function loadPieces() {
  loadPawns(greyMaterial, 1);
  loadPawns(whiteMaterial, 6);

  //rooks knights & bishops
  loadPairs("lowpolychess/rook/scene.gltf", 0);
  loadKnights();
  loadPairs("lowpolychess/bishop/scene.gltf", 2);

  //queens
  loadPiece(
    "lowpolychess/queen/scene.gltf",
    new THREE.Vector3(4, tableHeight, 0),
    greyMaterial
  );
  loadPiece(
    "lowpolychess/queen/scene.gltf",
    new THREE.Vector3(3, tableHeight, 7),
    whiteMaterial
  );

  //kings
  loadPiece(
    "lowpolychess/king/scene.gltf",
    new THREE.Vector3(3, tableHeight, 0),
    greyMaterial
  );

  loadPiece(
    "lowpolychess/king/scene.gltf",
    new THREE.Vector3(4, tableHeight, 7),
    whiteMaterial
  );
}

function loadWorld() {
  loadTimer();
  loadTable();

  var wallImage = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    map: new THREE.TextureLoader().load("./wallpapers/mountain.jpg"),
  });
  createRoom(wallImage);

  loadPieces();
  createChessBoard();
}

function createGUI() {
  gui = new dat.GUI();
  let color = new THREE.MeshBasicMaterial({ color: 0x808080 }).color;

  var controls = {
    restart: function () {
      objects.forEach((element) => {
        scene.remove(element);
      });
      loadPieces();
      loadTimer();
    },
    addClock: true,
    wallPaperColor: color.getHex(),
    pedroPascalWallpaper: function () {
      var wallImage = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load("./wallpapers/pedroPascal.avif"),
      });
      changeWallPaper(wallImage);
    },
    thunderWallpaper: function () {
      var wallImage = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load("./wallpapers/thunder.jpeg"),
      });
      changeWallPaper(wallImage);
    },
    stormTrooperWallpaper: function () {
      var wallImage = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load("./wallpapers/stormtrooper.jpeg"),
      });
      changeWallPaper(wallImage);
    },
    coloursWallpaper: function () {
      var wallImage = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: new THREE.TextureLoader().load("./wallpapers/mountain.jpg"),
      });
      changeWallPaper(wallImage);
    }
  };

  gui.add(controls, "restart");
  gui.add(controls, "addClock").onChange(function change() {
    if (controls.addClock) {
      loadTimer();
    } else {
      scene.remove(objects.find((e) => e == scene.getObjectByName("timer")));
    }
  });

  var wallpaperOptions = gui.addFolder("Wallpaper Options");
  wallpaperOptions.addColor(controls, "wallPaperColor").onChange((value) => {
    let material = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: value,
    });
    changeWallPaper(material);
  });
  var customWallPapers = wallpaperOptions.addFolder("Custom Wallpapers");
  customWallPapers.add(controls, "pedroPascalWallpaper");
  customWallPapers.add(controls, "thunderWallpaper");
  customWallPapers.add(controls, "stormTrooperWallpaper");
  customWallPapers.add(controls, "coloursWallpaper");

}

function changeWallPaper(material) {
  scene.remove(room);
  scene.remove(floor);
  scene.remove(roof);

  createRoom(material);
}

function init() {
  //basicScene
  createScene();
  createRenderer();
  createLight();
  createCamera();

  //controls
  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.target.set(3, 8.2, 3);
  createDragControls();
  createGUI();

  loadWorld();

  animate();
}

init();
