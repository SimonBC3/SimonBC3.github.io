import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "https://cdn.jsdelivr.net/npm/three@0.115/examples/jsm/controls/DragControls.js";

var dragControls, orbitControls;
var objects = [];
var dragObject = [];
var raycaster = new THREE.Raycaster();
var INTERSECTED, intersects;

const greyMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const whiteMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const brownMaterial = new THREE.MeshPhongMaterial({ color: 0xa52a2a });

//Scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x8e8e8e);

//Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

//Camera
// Instanciar la camara
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  100
);
camera.position.z = -5;
camera.position.y = 25;
camera.position.x = -15;

//Light
function light() {
  const ambiental = new THREE.AmbientLight(0x222222);
  scene.add(ambiental);

  const direccional = new THREE.DirectionalLight(0xffffff, 0.5);
  direccional.position.set(0, 30, 0);
  direccional.castShadow = true;
  scene.add(direccional);
  // scene.add(new THREE.CameraHelper(direccional.shadow.camera));


  const focal = new THREE.SpotLight(0xffffff, 0.4);
  focal.position.set(-15, 20, 0);
  focal.target.position.set(0, 0, 0);
  focal.angle = Math.PI / 7;
  focal.penumbra = 0.3;
  focal.castShadow = true;
  focal.shadow.camera.far = 20;
  focal.shadow.camera.fov = 80;
  scene.add(focal);
  // scene.add(new THREE.CameraHelper(focal.shadow.camera));
}

const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xb5b2b2 });

//create floor
var floor = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000, 1000, 1000),
  floorMaterial
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.2;
floor.receiveShadow = true;
scene.add(floor);

//create chess board
function createChessBoard() {
  var board, cubeGeo, lightMaterial, darkMaterial;
  var boardObjects = [];

  board = new THREE.Group();
  cubeGeo = new THREE.BoxGeometry(1, 0.5, 1);
  lightMaterial = new THREE.MeshPhongMaterial({ color: 0xc5c5c5 });
  darkMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });

  for (let x = 0; x < 8; x++) {
    for (let z = 0; z < 8; z++) {
      if (!(z % 2)) {
        var cube;
        cube = new THREE.Mesh(cubeGeo, x % 2 ? lightMaterial : darkMaterial);
      } else {
        cube = new THREE.Mesh(cubeGeo, x % 2 ? darkMaterial : lightMaterial);
      }
      cube.position.set(x, 8, z);
      boardObjects.push(cube);
      board.add(cube);
    }
  }
  scene.add(board);
  return boardObjects;
}

function loadPiece(object, position, material) {
  var loader = new GLTFLoader();
  loader.load(object, function (gltf) {
    gltf.scene.position.set(position.x, position.y, position.z);
    gltf.scene.scale.set(0.8, 0.8, 0.8);
    gltf.scene.traverse((o) => {
      if (o.isMesh) o.material = material;
    });
    scene.add(gltf.scene);
    objects.push(gltf.scene);
  });
}

//Animation
var animate = function () {
  render();
  requestAnimationFrame(animate);
};

function render() {
  renderer.render(scene, camera);
}

//create controls
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
      new THREE.Vector3(column, 8.2, row),
      material
    );
  }
}

function loadPairs(piece, offset) {
  loadPiece(piece, new THREE.Vector3(0 + offset, 8.2, 0), greyMaterial);

  loadPiece(piece, new THREE.Vector3(7 - offset, 8.2, 0), greyMaterial);

  loadPiece(piece, new THREE.Vector3(0 + offset, 8.2, 7), whiteMaterial);

  loadPiece(piece, new THREE.Vector3(7 - offset, 8.2, 7), whiteMaterial);
}

function loadTimer() {
  var loader = new GLTFLoader();
  loader.load("chess_timer/scene.gltf", function (gltf) {
    gltf.scene.position.set(-2, 8.2, 3.5);
    gltf.scene.rotation.y = -Math.PI / 2;
    gltf.scene.traverse((o) => {
      if (o.isMesh) o.material = brownMaterial;
    });
    scene.add(gltf.scene);
    objects.push(gltf.scene);
  });
}

function loadTable() {
  var loader = new GLTFLoader();
  loader.load("wood_table/scene.gltf", function (gltf) {
    gltf.scene.position.set(5, 5.5, 3.5);
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.traverse((ob) => {
      if (ob.isObject3D) ob.castShadow = true;
    });
    scene.add(gltf.scene);
    objects.push(gltf.scene);
  });
}

function loadPieces() {
  loadPawns(greyMaterial, 1);
  loadPawns(whiteMaterial, 6);

  //rooks knights & bishops
  loadPairs("lowpolychess/rook/scene.gltf", 0);
  loadPairs("lowpolychess/knight/scene.gltf", 1);
  loadPairs("lowpolychess/bishop/scene.gltf", 2);
  loadPairs("lowpolychess/rook/scene.gltf", 0);

  //queens
  loadPiece(
    "lowpolychess/queen/scene.gltf",
    new THREE.Vector3(4, 8.2, 0),
    greyMaterial
  );
  loadPiece(
    "lowpolychess/queen/scene.gltf",
    new THREE.Vector3(3, 8.2, 7),
    whiteMaterial
  );

  //kings
  loadPiece(
    "lowpolychess/king/scene.gltf",
    new THREE.Vector3(3, 8.2, 0),
    greyMaterial
  );

  loadPiece(
    "lowpolychess/king/scene.gltf",
    new THREE.Vector3(4, 8.2, 7),
    whiteMaterial
  );
}

function loadWorld() {
  //Timer
  loadTimer();

  //Table
  loadTable();
}

function init() {
  var boardObjects;
  light();
  boardObjects = createChessBoard();
  orbitControls = new OrbitControls(camera, renderer.domElement);
  loadPieces();
  loadWorld();
  createDragControls();
}

init();
animate();
