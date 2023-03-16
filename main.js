import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";
import { DragControls } from "https://cdn.jsdelivr.net/npm/three@0.115/examples/jsm/controls/DragControls.js";

var dragControls, orbitControls, cube;
var objects = [];
var dragObjects = [];
const button = document.querySelector("button");
var raycaster = new THREE.Raycaster();
var mouse = { x: 0, y: 0 };
var INTERSECTED, intersects;
const sceneMeshes = [];

//Scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0x8e8e8e);

//Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

//Camera
// Instanciar la camara
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  100
);
camera.position.z = 2;
camera.lookAt(0, 1, 0);

button.addEventListener("click", (event) => {
  var vector = new THREE.Vector3(11, 6, 4);
  console.log(vector.equals(camera.position));
  camera.position.set;
});

//Light
function light() {
  var light;
  light = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(light);
}

//create chess board
function createChessBoard() {
  var board, cubeGeo, lightMaterial, darkMaterial;
  var boardObjects = [];

  board = new THREE.Group();
  cubeGeo = new THREE.BoxGeometry(1, 0.2, 1);
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
      cube.position.set(x, 0, z);
      boardObjects.push(cube);
      board.add(cube);
    }
  }
  scene.add(board);
  return boardObjects;
}

//gltf loader
function loadObject(object) {
  var loader = new GLTFLoader();
  loader.load(object, function (gltf) {
    gltf.scene.position.set(1, 0, 0);
    gltf.scene.scale.set(0.8, 0.8, 0.8);
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
function createControls() {
  orbitControls = new OrbitControls(camera, renderer.domElement);
  dragControls = new DragControls(dragObjects, camera, renderer.domElement);
}

window.addEventListener("mousedown", raycast, false);

function raycast(event) {
  dragObjects = [];

  let x = event.clientX;
  let y = event.clientY;
  x = (x / window.innerWidth) * 2 - 1;
  y = -(y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

  objects.forEach(object => {
    intersects = raycaster.intersectObjects(object.children, true);
    if (intersects.length > 0) {
      INTERSECTED = intersects[0].object;
      console.log(INTERSECTED)
      dragObjects.push(INTERSECTED);
      createControls();
    }
  })
}

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

function init() {
  var boardObjects;
  light();
  boardObjects = createChessBoard();
  loadObject("chess_timer/scene.gltf");
  loadObject("lowpolychess/pawn/scene.gltf");
  createControls();
}

init();
animate();
