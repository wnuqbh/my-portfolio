import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';

// ---------- Scene, camera, renderer ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
camera.position.set(9, 7, 11);
camera.lookAt(0, 1.2, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.domElement.classList.add('bg');
document.body.appendChild(renderer.domElement);

// ---------- Materials ----------
const wall   = new THREE.MeshStandardMaterial({ color: '#2a2f6b', roughness: 0.6, metalness: 0.2 });
const slab   = new THREE.MeshStandardMaterial({ color: '#c9bfff', roughness: 0.4, metalness: 0.3 });
const ground = new THREE.MeshStandardMaterial({ color: '#14183d', roughness: 0.8 });
const warmGlass   = new THREE.MeshStandardMaterial({ color: '#ffb36b', emissive: '#ff9a4d', emissiveIntensity: 1.2 });
const violetGlass = new THREE.MeshStandardMaterial({ color: '#b9a6ff', emissive: '#8a6dff', emissiveIntensity: 1.4 });
const water  = new THREE.MeshStandardMaterial({ color: '#4c7dff', emissive: '#2b5be0', emissiveIntensity: 0.9 });
const accent = new THREE.MeshStandardMaterial({ color: '#ff8a3d', emissive: '#ff8a3d', emissiveIntensity: 2 });

// ---------- The house ----------
const house = new THREE.Group();
scene.add(house);

function block(w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  house.add(mesh);
  return mesh;
}

block(8, 0.25, 6.5, ground, 0, 0.125, 0);            // platform
block(3.5, 1.5, 3.5, wall, -0.8, 1.0, 0.3);          // ground floor
block(5, 1.3, 3.2, wall, -0.3, 2.4, -0.3);           // upper floor (sticks out)
block(5.3, 0.15, 3.5, slab, -0.3, 3.125, -0.3);      // roof
block(1.6, 0.1, 1.2, wall, -1.3, 3.25, -0.6);        // rooftop panel

block(3.0, 1.1, 0.05, warmGlass, -0.8, 1.05, 2.06);  // big ground-floor window
block(0.05, 1.1, 0.6, warmGlass, 0.96, 0.8, 1.0);    // door
block(4.4, 0.7, 0.05, violetGlass, -0.3, 2.4, 1.31); // upper ribbon window
block(0.05, 0.7, 1.8, violetGlass, 2.21, 2.4, -0.3); // upper side window

block(2.2, 0.05, 2.4, water, 2.6, 0.27, -1.4);       // pool
block(0.4, 0.15, 1.0, slab, 2.3, 0.33, 1.4);         // lounger 1
block(0.4, 0.15, 1.0, slab, 3.0, 0.33, 1.4);         // lounger 2

const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2), slab);
mast.position.set(1.2, 3.8, -1.2);
house.add(mast);
const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08), accent);
tip.position.set(1.2, 4.4, -1.2);
house.add(tip);

house.position.set(-1.2, -1, 0);

// ---------- Lights ----------
scene.add(new THREE.AmbientLight('#6b6bff', 0.25));

const rim = new THREE.DirectionalLight('#d7a8ff', 4);
rim.position.set(6, 6, -8);
scene.add(rim);

const fill = new THREE.DirectionalLight('#4c5cff', 1.2);
fill.position.set(-6, 4, 6);
scene.add(fill);

// ---------- Mouse follow ----------
let mouseX = 0, mouseY = 0;
addEventListener('mousemove', (e) => {
  mouseX = e.clientX / innerWidth - 0.5;
  mouseY = e.clientY / innerHeight - 0.5;
});

// ---------- Phone tilt (gyroscope) ----------
const isTouch = matchMedia('(pointer: coarse)').matches;

function onTilt(e) {
  mouseX = THREE.MathUtils.clamp(e.gamma / 45, -0.5, 0.5);
  mouseY = THREE.MathUtils.clamp((e.beta - 45) / 45, -0.5, 0.5);
}

if (isTouch) {
  const needsPermission =
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function';

  if (needsPermission) {
    // iPhone: must ask permission after the user taps something
    addEventListener('touchend', async () => {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result === 'granted') addEventListener('deviceorientation', onTilt);
      } catch {}
    }, { once: true });
  } else {
    // Android: works straight away
    addEventListener('deviceorientation', onTilt);
  }
}

// ---------- Animation loop ----------
let spin = 0;
renderer.setAnimationLoop(() => {
  spin += 0.002;
  house.rotation.y += (spin + mouseX * 0.5 - house.rotation.y) * 0.05;
  house.rotation.x += (mouseY * 0.15 - house.rotation.x) * 0.05;
  renderer.render(scene, camera);
});

// ---------- GSAP intro ----------
gsap.from(house.position, { y: -5, duration: 1.8, ease: 'power3.out' });
gsap.from(house.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 1.8, ease: 'power3.out' });
gsap.from('.hero h1', { y: 40, opacity: 0, duration: 1, delay: 0.5 });
gsap.from('.hero p', { y: 40, opacity: 0, duration: 1, delay: 0.8, stagger: 0.1 });

// ---------- Resize ----------
function fitCamera() {
  camera.aspect = innerWidth / innerHeight;
  const distance = innerWidth < 768 ? 1.6 : 1;   // move back on phones
  camera.position.set(9 * distance, 7 * distance, 11 * distance);
  camera.lookAt(0, 1.2, 0);
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}
fitCamera();
addEventListener('resize', fitCamera);