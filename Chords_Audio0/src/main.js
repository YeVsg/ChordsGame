
//- Juan David Gaviria Novoa (123812)

var scene    = null,
    camera   = null,
    renderer = null,
    controls = null,
    clock = null,
    light = null;

var player = null,
    fallingObjects = [],
    score = 0,
    time = 30,
    gameOver = false,
    speed = 0.02,
    gravity = 0.01,
    maxObjects = 10,
    gravityIncrement = 0.001;

const keys = { left: false,
            right: false };

// UI Elements
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const resultMessage = document.getElementById("resultMessage");
const restartBtn = document.getElementById("restartBtn");

var color = new THREE.Color();

// ----------------------------
// Funciones de creación init:
// ----------------------------
function start() {
    window.onresize = onWindowResize;
    initScene();
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,
            window.innerHeight);
}

function initScene(){
    initBasicElements(); // Scene, Camera and Render
    initSound();         // To generate 3D Audio
    createLight();       // Create light
}

function initBasicElements() {
    const colorFog = 0x071D36,
          nearFog = 10,
          far = 70;
    scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load('../src/img/bckmusic.jpg');

    camera = new THREE.PerspectiveCamera(
        60,                                     // Ángulo "grabación" - De abaja -> Arriba 
        window.innerWidth / window.innerHeight, // Relación de aspecto 16:9
        0.1,                                    // Mas cerca (no renderiza) 
        1000                                    // Mas lejos (no renderiza)
    );

    // renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#app") });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    camera.position.z = 5;

    scene.fog = new THREE.Fog(colorFog, nearFog, far);

    loadObjMtl();

    // Crear jugador (simple cubo)
    /*const geometry2 = new THREE.BoxGeometry(1, 1, 1);
    const material2 = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    player = new THREE.Mesh(geometry2, material2);*/

    
    /*scene.add(player);
    player.position.y = -3;*/

    // Evento de teclado
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'ArrowRight') keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') keys.left = false;
        if (e.key === 'ArrowRight') keys.right = false;
    });

    // Iniciar la caída de objetos y la cuenta atrás
    
    spawnObject();
    setInterval(countdown, 1000);
}

function loadObjMtl() {
  var generalPath = "../src/modelos/";
  var pathGltf = "scene.gltf";
  //var fileObj = "Pumpkin.obj";
  //var fileMtl = "Pumpkin.mtl";

  /*var mtlLoader = new THREE.MTLLoader();
  mtlLoader.setTexturePath(generalPath);
  mtlLoader.setPath(generalPath);
  mtlLoader.load(fileMtl, function(materials) {
      materials.preload();*/

      /*var objLoader = new THREE.OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(generalPath);
      objLoader.load(fileObj, function(obj) {*/
      var gltfLoader = new THREE.GLTFLoader();
      gltfLoader.setPath(generalPath);
      gltfLoader.load(pathGltf, function(gltf){
          player = gltf.scene; 
          player.scale.set(0.03, 0.03, 0.03);
          player.position.set(0, -2.5, 0);
          player.rotation.y = Math.PI;
          scene.add(player); 
      });
  
}
    const models = [
      { obj: "pentagramaDomayor.obj", mtl: "pentagramaDomayor.mtl", sound: "Domayor.mp3" },
      { obj: "pentagramaFamayor.obj", mtl: "pentagramaFamayor.mtl", sound: "Famayor.mp3" },
      { obj: "pentagramaLamenor.obj", mtl: "pentagramaLamenor.mtl", sound: "Lamenor.mp3" },
      { obj: "pentagramaRemenor.obj", mtl: "pentagramaRemenor.mtl", sound: "Remenor.mp3" },
      { obj: "pentagramaReSostenidomayor.obj", mtl: "pentagramaReSostenidomayor.mtl", sound: "ReSmayor.mp3" }
    ];
function spawnObject() {

  var generalPath = "../src/modelos/";

    const randomIndex = Math.floor(Math.random() * models.length);
    const selectedModel = models[randomIndex];

    var fileObj = selectedModel.obj;
    var fileMtl = selectedModel.mtl;
    var soundFile = selectedModel.sound;

  
  //var fileObj = "skull3.obj";
  //var fileMtl = "skull3.mtl";

    /*const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xff5733 });
    const object = new THREE.Mesh(geometry, material);*/
  
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setTexturePath(generalPath);
    mtlLoader.setPath(generalPath);
    mtlLoader.load(fileMtl, function(materials) {
        materials.preload();

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(generalPath);
        objLoader.load(fileObj, function(obj) {

        

          
            
            const object = obj;

            object.scale.set(0.3, 0.3, 0.3);
            object.rotation.y = Math.PI;
            object.material = new THREE.MeshBasicMaterial({ color: 0xff5733 });

            
            object.position.set((Math.random() - 0.5) * 10, 10, 0);
            fallingObjects.push(object);
            scene.add(object);

            object.onCollect = function() {
              const audio = new Audio("../src/modelos/" + soundFile);
              audio.volume = 0.5;
              audio.play().catch(error => {
                  console.error("Error al reproducir el audio:", error);
              });
          };

            
            const canvasElement = renderer.domElement;
            canvasElement.classList.add('fallingObject');

            
            if (!gameOver && fallingObjects.length < maxObjects) {
                setTimeout(spawnObject, Math.random() * 1500 + 500);
            }
        });
      });
  }

function countdown() {
  if (gameOver) return;
  time--;
  timeDisplay.innerText = `Tiempo: ${time}`;

  // Incrementa la gravedad con el tiempo
  if (time <= 30 && time > 20) {
    gravity += gravityIncrement * 0.5;  // Aumenta la gravedad ligeramente en los primeros 10 segundos
  } else if (time <= 20 && time > 10) {
    gravity += gravityIncrement * 1;    // Aumenta más rápido en los siguientes 10 segundos
  } else if (time <= 10) {
    gravity += gravityIncrement * 1.5;  // Aumenta aún más rápido en los últimos 10 segundos
  }

  if (time <= 0) {
    endGame(false);
  }
}

function animate() {
  if (gameOver) return;

  requestAnimationFrame(animate);

  // Mover el jugador
  if (keys.left && player.position.x > -5) player.position.x -= 0.1;
  if (keys.right && player.position.x < 5) player.position.x += 0.1;

  // Mover objetos
  fallingObjects.forEach((object, index) => {
    object.position.y -= speed + gravity;  // Usa la gravedad ajustada

    // Verificar colisión con el jugador
    if (object.position.distanceTo(player.position) < 0.7) {
      score++;
      scoreDisplay.innerText = `Puntos: ${score}`;

      if (object.onCollect) {
        object.onCollect();
      }

      scene.remove(object);
      fallingObjects.splice(index, 1);

      if (score >= 10) {
        endGame(true);
      }
    }

    // Eliminar objetos que caen fuera de la pantalla
    if (object.position.y < -5) {
      scene.remove(object);
      fallingObjects.splice(index, 1);
    }
  });

  renderer.render(scene, camera);
}

function endGame(victory) {
  gameOver = true;
  resultMessage.classList.remove('hidden');
  restartBtn.classList.remove('hidden');
  
  if (victory) {
    resultMessage.innerText = '¡Ganaste! 🎵';
  } else {
    resultMessage.innerText = '¡Perdiste! 〽️';
  }

  restartBtn.addEventListener('click', restartGame);
}

function restartGame() {
  // Reiniciar variables
  score = 0;
  time = 30;
  gravity = 0.01;  // Reiniciar gravedad
  gameOver = false;
  scoreDisplay.innerText = 'Puntos: 0';
  timeDisplay.innerText = 'Tiempo: 30';
  resultMessage.classList.add('hidden');
  restartBtn.classList.add('hidden');

  // Eliminar los objetos restantes
  fallingObjects.forEach(obj => scene.remove(obj));
  fallingObjects = [];

  // Iniciar nuevamente
  spawnObject();
  animate();
}

function initSound() {
    // 3d Sound
}

function createLight() {
    var light2 = new THREE.AmbientLight(0xffffff);
    light2.position.set(10, 10, 10);
    scene.add(light2);
    light = new THREE.DirectionalLight(0xffffff, 0.1, 1000);
    scene.add(light);
}

// ----------------------------------
// Funciones llamadas desde el index:
// ----------------------------------
function go2Play() {
    document.getElementById('blocker').style.display = 'none';
    document.getElementById('cointainerOthers').style.display = 'block';
    playAudio();
}

function showNameStudents() {
    alert("By: Juan David Gaviria");
}