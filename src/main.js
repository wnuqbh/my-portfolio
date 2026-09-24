import './style.css';
import gsap from 'gsap';
import * as THREE from 'three';

//The stage
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);

function fitCamera() {
  camera.position.z = innerWidth < 700 ? 4.5 : 3;
}
fitCamera();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.domElement.classList.add('bg');
document.body.appendChild(renderer.domElement);

//The knot and lights
const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.25, 128, 32),
  new THREE.MeshStandardMaterial({ color: 0x6c5ce7, metalness: 0.6, roughness: 0.2})
);
scene.add(knot);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 2, 5);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.3));

//Mouse tracking
let mouseX = 0, mouseY = 0;
addEventListener('pointermove', (e) => {
  mouseX = e.clientX / innerWidth -0.5;
  mouseY = e.clientY / innerHeight - 0.5;
});

//The animation
renderer.setAnimationLoop(() =>{
  knot.rotation.x += 0.01;
  knot.rotation.y += 0.01;
  knot.rotation.x += (mouseX * 1.5 - knot.position.x) * 0.05;
  knot.rotation.y += (-mouseY * 1.5 - knot.position.y) * 0.05;
  renderer.render(scene, camera);
});

// Keep it full screen on resize
addEventListener('resize', () => {
  fitCamera();
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Intro animations
gsap.from(knot.scale, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'elastic.out(1,0.5)'});
gsap.from('.hero h1', { y: 40, opacity: 0, duration: 1, delay: 0.3 });
gsap.from('.hero p', { y: 40, opacity: 0, duration: 1, delay: 0.6});