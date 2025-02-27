import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import Stats from "three/examples/jsm/libs/stats.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TextureLoader } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";
import { Raycaster } from "three";
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

window.addEventListener("load", () => {
  document.getElementById("loader").style.display = "none";
  // const myst = new Audio("/myst.mp3");
  // myst.volume = 0.0;
  // myst.loop = true;
  // myst.play().catch(err => {
  //   console.warn("Audio playback failed:", err);
  // });
});

/**
 * Base
 */
// Debug
// const gui = new GUI()

// Loaders
const gltfLoader = new GLTFLoader();
const hdrLoader = new RGBELoader();
const textureLoader = new TextureLoader();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Environment map
 */
scene.environmentIntensity = 0.7;
scene.environmentRotation.x = 2;
scene.environmentRotation.y = 1.5;
scene.environmentRotation.z = 1.2;
scene.backgroundBlurriness = 4;
scene.backgroundIntensity = 1.7;
scene.backgroundRotation.z = 1.2;

hdrLoader.load("/hdr.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

/**
 *
 * Textures
 */

const NormalTexture = new THREE.TextureLoader().load("/NormalMap.png");
const TextureGris = new THREE.TextureLoader().load("/texture/1.jpg");
const TextureDore = new THREE.TextureLoader().load("/texture/2.jpg");
const TextureJaune = new THREE.TextureLoader().load("/texture/3.jpg");
const TextureJauneGris = new THREE.TextureLoader().load("/texture/4.jpg");
const TextureJauneRoue = new THREE.TextureLoader().load("/texture/5.jpg");
const TextureNoir = new THREE.TextureLoader().load("/texture/6.jpg");
const TextureBlanc = new THREE.TextureLoader().load("/texture/7.jpg");

const texture = new THREE.MeshStandardMaterial({
  map: TextureJauneRoue,
  normalMap: NormalTexture,
});


//drop

function TauxDrop() {
  const dropGris = 36;
  const dropDore = 6;
  const dropJaune = 12;
  const dropJauneGris = 12;
  const dropJauneRoue = 6;
  const dropNoir = 24;
  const dropBlanc = 24;


  const tauxDore = Math.floor((dropDore / (dropGris + dropDore + dropJaune + dropJauneGris + dropJauneRoue + dropNoir + dropBlanc)) * 100);
  const tauxJaune = Math.floor((dropJaune / (dropGris + dropDore + dropJaune + dropJauneGris + dropJauneRoue + dropNoir + dropBlanc)) * 100);
  const tauxJauneGris = Math.floor((dropJauneGris / (dropGris + dropDore + dropJaune + dropJauneGris + dropJauneRoue + dropNoir + dropBlanc)) * 100);
  const tauxJauneRoue = Math.floor((dropJauneRoue / (dropGris + dropDore + dropJaune + dropJauneGris + dropJauneRoue + dropNoir + dropBlanc)) * 100);
  const tauxNoir = Math.floor((dropNoir / (dropGris + dropDore + dropJaune + dropJauneGris + dropJauneRoue + dropNoir + dropBlanc)) * 100);
  const tauxBlanc = Math.floor((dropBlanc / (dropGris + dropDore + dropJaune + dropJauneGris + dropJauneRoue + dropNoir + dropBlanc)) * 100);
  const tauxGris = Math.floor((dropGris / (dropGris + dropDore + dropJaune + dropJauneGris + dropJauneRoue + dropNoir + dropBlanc)) * 100);

  return [tauxDore, tauxJaune, tauxJauneGris, tauxJauneRoue, tauxNoir, tauxBlanc, tauxGris];
}
// Stats
// const stats = new Stats();
// document.body.appendChild(stats.dom);

const fog = new THREE.Fog(0xffffff, 1, 30);
scene.fog = fog;

/**
 * Gltf
 */

let mixer;

//LootBox

let Loot = [];
let isOpen = false;
let isFinished = false;
let animPlaying = false;

gltfLoader.load("CubeLootBoxBakeAnim.glb", (gltf) => {
  const radius = 6;
  const count = 12;

  gltf.scene.animations = gltf.animations;
  mixer = new THREE.AnimationMixer(gltf.scene);
  mixer.timeScale = 3;
  let action = mixer.clipAction(gltf.scene.animations[0]);
  action.setLoop(THREE.LoopOnce);
  action.clampWhenFinished = true;

  function open() {
    animPlaying = true;

    // Play sound effect when box opens
    const audio = new Audio("/sound.mp3");
    const audio2 = new Audio("/sound2.mp3");
    const music = new Audio("/musique.mp3");
    music.volume = 0.2;
    music.play().catch(err => {
      console.warn("Audio playback failed:", err);
    });
    audio.volume = 0.2;
    audio2.volume = 0.2;
    audio.play().catch(err => {
      console.warn("Audio playback failed:", err);
    });
    audio2.play().catch(err => {
      console.warn("Audio playback failed:", err);
    }
    );

    const openLightTexture = textureLoader.load("/OpenLight.png");
    const openLight = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshBasicMaterial({
        map: openLightTexture,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      })
    );
    openLight.position.z = 3;
    openLight.rotateZ(Math.PI);
    openLight.lookAt(camera.position);
    scene.add(openLight);
      

    const duration = 5;
    const startY = gltf.scene.position.y;
    const endY = -15;

    const startCameraZ = camera.position.z;
    const endCameraZ = 3;

    const startTime = performance.now();

    gltfLoader.load("shiba.glb", (gltf) => {
      gltf.scene.position.set(0, -2, 2);
      gltf.scene.scale.set(1, 1, 1);

      function pop() {
        animPlaying = true;

        // Animate position.y to 0 over 2 seconds
        const duration = 2;
        const startY = -2;
        const endY = 0;

        const startz = 4.5;
        const endz = 0;

        const startTime = performance.now();

        function animate() {
          const currentTime = performance.now();
          const elapsedTime = (currentTime - startTime) / 1000; // convert to seconds
          const progress = Math.min(elapsedTime / duration, 1); // ensure progress does not exceed 1

          gltf.scene.position.y = startY + (endY - startY) * progress;
          gltf.scene.position.z = startz + (endz - startz) * progress;
          scene.backgroundRotation.x = progress * Math.PI * 2.7;

          if (progress === 1) {
            scene.add(plane, plane2);
            isFinished = true;
          }

          requestAnimationFrame(animate);

        }
        animate();
      }

      function modelRotation() {
        gltf.scene.rotation.y += 0.025;
        requestAnimationFrame(modelRotation);
      }

      function dropTexture() {
        const [tauxDore, tauxJaune, tauxJauneGris, tauxJauneRoue, tauxNoir, tauxBlanc, tauxGris] = TauxDrop();
        console.log(tauxDore, tauxJaune, tauxJauneGris, tauxJauneRoue, tauxNoir, tauxBlanc, tauxGris);
        
        const random = Math.floor(Math.random() * 100);

        const rarete = document.getElementById("rarete");
        console.log(random);
          
      
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            if (random < tauxDore) {
              child.material.map = TextureDore;
              rarete.innerHTML = "Legendary <br>"+tauxDore+"%";
              rarete.style.color = "goldenrod";
              console.log("Dore");
            } else if (random < tauxDore + tauxJaune) {
              child.material.map = TextureJaune;
              rarete.innerHTML = "Ultra Rare <br>"+tauxJaune+"%";
              rarete.style.color = "gold";
              console.log("Jaune");
            } else if (random < tauxDore + tauxJaune + tauxJauneGris) {
              child.material.map = TextureJauneGris;
              rarete.innerHTML = "Super Rare <br>"+tauxJauneGris+"%";
              rarete.style.color = "olive";
              console.log("JauneGris");
            } else if (random < tauxDore + tauxJaune + tauxJauneGris + tauxJauneRoue) {
              child.material.map = TextureJauneRoue;
              rarete.innerHTML = "Rare <br>"+tauxJauneRoue+"%";
              rarete.style.color = "coral";
              console.log("JauneRoue");
            } else if (random < tauxDore + tauxJaune + tauxJauneGris + tauxJauneRoue + tauxNoir) {
              child.material.map = TextureNoir;
              rarete.innerHTML = "Uncommon <br>"+tauxNoir+"%";
              rarete.style.color = "black";
              console.log("Noir");
            } else if (random < tauxDore + tauxJaune + tauxJauneGris + tauxJauneRoue + tauxNoir + tauxBlanc) {
              child.material.map = TextureBlanc;
              rarete.innerHTML = "Common <br>"+tauxBlanc+"% ";
              rarete.style.color = "silver";
              console.log("Blanc");
            } else {
              child.material.map = TextureGris;
              rarete.innerHTML = "Super Common <br>"+tauxGris+"%";
              rarete.style.color = "grey";
              console.log("Gris");
            }
            child.material.needsUpdate = true;
          }
        });
      }
      dropTexture();
      modelRotation();
      pop();
      scene.add(gltf.scene);
    });

    function animate() {
      animPlaying = true;
      const currentTime = performance.now();
      const elapsedTime = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsedTime / duration, 1);

      const startRotation = gltf.scene.rotation.y;
      const endRotation = Math.PI;

      // Wait 2 seconds before starting movement
      if (elapsedTime < 0.5) {
        // Keep initial positions during wait period
      } else {
        // After 2 seconds, calculate adjusted progress from 0-1 for remaining duration
        const adjustedProgress = Math.min(
          (elapsedTime - 0.5) / (duration - 0.5),
          1
        );

        gltf.scene.position.y = startY + (endY - startY) * adjustedProgress;
        camera.position.z =
          startCameraZ + (endCameraZ - startCameraZ) * adjustedProgress;

         gltf.scene.rotation.y = startRotation + (endRotation - startRotation) * adjustedProgress *0.5;  

          openLight.position.y = 1 + (-15 - (-2)) * adjustedProgress;
          openLight.rotation.y = Math.sin(adjustedProgress * Math.PI * 2)*1.25;
      }

      action.play();

      scene.backgroundRotation.x = progress * Math.PI * 2.7;

      if (progress === 1) {
        scene.remove(openLight);
        scene.remove(gltf.scene);
        isFinished = true;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    animate();
  }

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;

    const box = SkeletonUtils.clone(gltf.scene);
    box.scale.set(0.7, 0.7, 0.7);

    box.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
    Loot.push(box);
    scene.add(box);
  }

  function onOpen() {
    
    animPlaying = true;

    const audio = new Audio("/magie.mp3");
    audio.volume = 0.2;

    audio.play().catch(err => {
      console.warn("Audio playback failed:", err);
    }
    );

    const duration = 1;
    const startY = -3;
    const endY = -1.2;

    const startX = 0;
    const endX = 0;

    const startZ = 0;
    const endZ = 3;

    const startIntensity = 100;
    const midIntensity = 50;
    const endIntensity = 1.3;

    const startCameraY = camera.position.y;
    const endCameraY = 1.7;
    const startTime = performance.now();

    function animate() {
      const currentTime = performance.now();
      const elapsedTime = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsedTime / duration, 1);

      nuages.forEach((nuage) => {
        scene.remove(nuage);
      });
      controls.enabled = false;
      camera.position.x = 0;
      camera.position.z = 5.7;
      camera.position.y =
        startCameraY + (endCameraY - startCameraY) * progress;

      progress < 0.5
        ? (scene.environmentIntensity =
            startIntensity + (midIntensity - startIntensity) * progress * 2)
        : (scene.environmentIntensity =
            midIntensity +
            (endIntensity - midIntensity) * (progress - 0.5) * 2);

      Loot.forEach((box) => {
        scene.remove(box);
      });

      gltf.scene.rotation.y = Math.PI;
      gltf.scene.lookAt(
        -camera.position.x,
        -camera.position.y,
        -camera.position.z
      );

      gltf.scene.position.y = startY + (endY - startY) * progress;
      gltf.scene.position.x = startX + (endX - startX) * progress;
      gltf.scene.position.z = startZ + (endZ - startZ) * progress;

      scene.add(gltf.scene);
      scene.backgroundRotation.x = progress * Math.PI * 2.7;

      isOpen = true;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }

      if (progress === 1) {
        animPlaying = false;
      }

    }
    animate();
  }

  const raycaster = new Raycaster(
    camera.position,
    new THREE.Vector3(),
    0,
    3.8
  );
  const mouse = new THREE.Vector2();

  document.addEventListener("click", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0 && isOpen === false && isFinished === false && animPlaying === false) {
      onOpen();
    } else if (intersects.length > 0 && isOpen === true && isFinished === false && animPlaying === false) {
      open();
    } else if (isFinished === true ) {
      window.location.reload();
    }
    else if(animPlaying === true){
      console.log("Animation en cours");
      return;
    }
  });

});

/**
 * Plane
 */
const planeTexture = textureLoader.load("/Light.png");
const planeMaterial = new THREE.MeshBasicMaterial({
  map: planeTexture,
  transparent: true,
  opacity: 1,
});

const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), planeMaterial);
plane.position.z = -2;
plane.scale.set(7, 7, 7);

const plane2 = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), planeMaterial);
plane2.position.z = -2.2;
plane2.scale.set(7, 7, 7);

//nuages
let nuages = [];

const nuageTexture = textureLoader.load("/cloud.png");
const nuageMaterial = new THREE.MeshBasicMaterial({
  map: nuageTexture,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide,
});

for (let i = 0; i < 10; i++) {
  const nuage = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), nuageMaterial);
  nuage.position.set(Math.random() * 14 - 7, 0, Math.random() * 14 - 7);
  nuage.rotation.x = -0.2;
  nuage.scale.set(2, 2, 2);
  scene.add(nuage);
  nuages.push(nuage);
}

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.y = 7;
camera.position.z = 7;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2 - 0.3; // Lock vertical rotation to 90 degrees
controls.minPolarAngle = Math.PI / 2 - 0.3; // Lock vertical rotation to 90 degrees

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1,
  toneMappingWhitePoint: 1,
  gammaFactor: 2.2,
  outputEncoding: THREE.sRGBEncoding,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

composer.addPass(new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 0.12, 0.1, 0.5))

const smaaPass = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
composer.addPass(smaaPass);

// const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
// composer.addPass(gammaCorrectionPass);

const clic = new Audio("/clic.mp3");
clic.volume = 1;
clic.loop = true;

document.addEventListener("mousedown", () => {
  clic.play().catch(err => {
    console.warn("Audio playback failed:", err);
  });
}
);

document.addEventListener("mouseup", () => {
  clic.pause();
}
);


/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  // Get the delta time
  const deltaTime = clock.getDelta();

  // Fake light update

  plane.lookAt(camera.position);
  plane2.lookAt(camera.position);

  plane.rotation.z += clock.getElapsedTime() * 1;
  plane2.rotation.z += -clock.getElapsedTime() * 1;

  // Update controls

  controls.update();

  // Update stats
  // stats.update();

  // Update object orientation

  Loot.forEach((box) => {
    box.lookAt(-camera.position.x, -camera.position.y, -camera.position.z);
  });

  nuages.forEach((nuage) => {
    nuage.lookAt(-camera.position.x, -camera.position.y, -camera.position.z);
  });

  // Update mixer
  if (mixer) {
    mixer.update(deltaTime);
  }

  // Render
  renderer.render(scene, camera);
  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
