import './style.css';
//The stage
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

//The knot and lights
const knot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.25,128,32),
  new THREE.MeshStandardMaterial({ color: 0x6c5ce7, metalness: 0.6, roughness: 0.2})
);
scene.add(knot);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2,2,5);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.3));

//The animation
renderer.setAnimationLoop(() =>{
  knot.rotation.x += 0.01;
  knot.rotation.y += 0.01;
  renderer.render(scene, camera);
});
