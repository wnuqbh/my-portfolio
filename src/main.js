import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';

// ---------- Scene, camera, renderer ----------
const scene = new THREE.Scene();
const hero = document.querySelector('.hero');

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.domElement.classList.add('hero-canvas');
hero.prepend(renderer.domElement);

// ---------- Helpers ----------
const character = new THREE.Group();
scene.add(character);

const M = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.05 });

function box(w, h, d, color, x, y, z, parent = character) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(color));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}
function cyl(rTop, rBottom, h, color, x, y, z, parent = character) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, 24), M(color));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

// ---------- Colours ----------
const C = {
  floor: '#14183d', desk: '#2a2f6b', leg: '#1b1f4a', dark: '#1b1d33',
  hoodie: '#534AB7', skin: '#e0a47a', hair: '#2c1a10', jeans: '#1c2260',
  accent: '#ff8a3d', plant: '#3fa37a',
};

// ---------- Room ----------
cyl(2.3, 2.3, 0.04, C.floor, 0, 0, 0);                      // floor disc
box(3.2, 0.1, 1.6, C.desk, 0, 1.5, 0);                   // desk top
[[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]]
  .forEach(([x, z]) => box(0.08, 1.45, 0.08, C.leg, x, 0.75, z)); // desk legs

// Monitor
box(0.12, 0.05, 0.12, C.dark, 0, 1.58, -0.45);
box(0.06, 0.45, 0.06, C.dark, 0, 1.8, -0.45);
box(1.7, 1.0, 0.07, C.dark, 0, 2.35, -0.5);

// Screen with live code (drawn on a 2D canvas, used as a texture)
const cv = document.createElement('canvas');
cv.width = 512; cv.height = 300;
const ctx = cv.getContext('2d');
const tex = new THREE.CanvasTexture(cv);
tex.colorSpace = THREE.SRGBColorSpace;
const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshBasicMaterial({ map: tex }));
screen.position.set(0, 2.35, -0.46);
character.add(screen);

const screenGlow = new THREE.PointLight('#8a6dff', 3, 3);
screenGlow.position.set(0, 2.3, 0.2);
character.add(screenGlow);

// Keyboard, mouse, mug, plant
box(1.1, 0.05, 0.35, C.dark, 0, 1.575, 0.3);
for (let r = 0; r < 4; r++)
  for (let k = 0; k < 12; k++)
    box(0.07, 0.03, 0.06, '#3a3f75', -0.46 + k * 0.084, 1.61, 0.17 + r * 0.085);
box(0.12, 0.04, 0.2, C.dark, 0.8, 1.57, 0.3);

cyl(0.1, 0.09, 0.22, C.accent, -1.05, 1.66, 0.15);
const handle = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 16), M(C.accent));
handle.position.set(-0.94, 1.67, 0.15);
character.add(handle);

cyl(0.05, 0.08, 0.3, C.dark, 1.1, 1.7, -0.3);
const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), M(C.plant));
leaf.position.set(1.1, 2.0, -0.3);
character.add(leaf);

// Chair
box(0.9, 0.1, 0.8, C.dark, 0, 1.0, 1.4);
box(0.9, 0.9, 0.1, C.dark, 0, 1.5, 1.85);
cyl(0.05, 0.05, 0.9, C.leg, 0, 0.5, 1.4);
cyl(0.35, 0.35, 0.05, C.leg, 0, 0.05, 1.4);

// ---------- The coder ----------
const person = new THREE.Group();
person.position.set(0, 0, 1.35);
character.add(person);

const torso = box(0.7, 0.85, 0.4, C.hoodie, 0, 1.5, 0, person);
box(0.72, 0.25, 0.35, C.hoodie, 0, 1.93, 0.1, person);   // shoulders / hood
[-0.18, 0.18].forEach((x) => {
  box(0.25, 0.2, 0.7, C.jeans, x, 1.13, -0.3, person);   // thigh
  box(0.22, 1.0, 0.22, C.jeans, x, 0.62, -0.6, person);  // shin
  box(0.24, 0.1, 0.34, C.dark, x, 0.07, -0.67, person);  // shoe
});

// Head, hair, glasses, headphones
const headG = new THREE.Group();
headG.position.set(0, 2.28, -0.02);
person.add(headG);

headG.add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), M(C.skin)));
const hair = new THREE.Mesh(new THREE.SphereGeometry(0.285, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5), M(C.hair));
hair.rotation.x = 0.35;
hair.position.set(0, 0.02, 0.03);
headG.add(hair);

[-0.1, 0.1].forEach((x) => {
  const lens = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.013, 8, 24), M('#111111'));
  lens.position.set(x, 0, -0.26);
  headG.add(lens);
});
box(0.06, 0.012, 0.012, '#111111', 0, 0, -0.27, headG);

const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 8, 32, Math.PI), M(C.hoodie));
headG.add(band);
[-0.3, 0.3].forEach((x) => {
  const cup = cyl(0.09, 0.09, 0.08, C.accent, x, 0, 0, headG);
  cup.rotation.z = Math.PI / 2;
});

// Arms: each arm is two cylinders stretched between shoulder, elbow and hand
const UP = new THREE.Vector3(0, 1, 0);
function segment() {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1, 12), M(C.hoodie));
  person.add(m);
  return m;
}
const arms = [-1, 1].map((side) => {
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 12), M(C.skin));
  person.add(hand);
  return { side, upper: segment(), lower: segment(), hand };
});
function place(mesh, a, b) {
  const dir = new THREE.Vector3().subVectors(b, a);
  mesh.position.copy(a).addScaledVector(dir, 0.5);
  mesh.scale.set(1, dir.length(), 1);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
}

character.position.set(0.45, 0.3, 0.9);

// ---------- Code on the screen ----------
const code = [
  [['#7F77DD', 'const '], ['#E6F1FB', 'scan'], ['#9FE1CB', ' = '], ['#FAC775', 'async'], ['#E6F1FB', ' (host) => {']],
  [['#7F77DD', '  const '], ['#E6F1FB', 'ports = '], ['#7F77DD', 'await '], ['#5DCAA5', 'probe'], ['#E6F1FB', '(host);']],
  [['#7F77DD', '  for '], ['#E6F1FB', '(const p '], ['#7F77DD', 'of '], ['#E6F1FB', 'ports) {']],
  [['#7F77DD', '    if '], ['#E6F1FB', '(p.open) '], ['#5DCAA5', 'harden'], ['#E6F1FB', '(p);']],
  [['#E6F1FB', '  }']],
  [['#7F77DD', '  return '], ['#FAC775', '"secured"'], ['#E6F1FB', ';']],
  [['#E6F1FB', '};']],
  [['#5DCAA5', 'scan'], ['#E6F1FB', '('], ['#FAC775', '"uqbah.dev"'], ['#E6F1FB', ');']],
];
const totalChars = code.reduce((sum, line) => sum + line.map((s) => s[1]).join('').length, 0);
let typed = 0;

function drawCode() {
  ctx.fillStyle = '#0c0f24'; ctx.fillRect(0, 0, 512, 300);
  ctx.fillStyle = '#141833'; ctx.fillRect(0, 0, 512, 24);
  ['#E24B4A', '#EF9F27', '#639922'].forEach((c, i) => {
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(16 + i * 18, 12, 5, 0, 7); ctx.fill();
  });
  ctx.font = '17px monospace';
  let left = typed, y = 52;
  for (let i = 0; i < code.length; i++) {
    ctx.fillStyle = '#5F5E5A'; ctx.fillText(String(i + 1), 10, y);
    let x = 40;
    for (const [color, text] of code[i]) {
      if (left <= 0) break;
      const part = text.slice(0, left);
      ctx.fillStyle = color; ctx.fillText(part, x, y);
      x += ctx.measureText(part).width;
      left -= part.length;
    }
    if (left <= 0) {
      if (Math.floor(Date.now() / 400) % 2) { ctx.fillStyle = '#5DCAA5'; ctx.fillRect(x + 1, y - 15, 9, 18); }
      break;
    }
    y += 27;
  }
  tex.needsUpdate = true;
}
drawCode();

// ---------- Lights ----------
scene.add(new THREE.AmbientLight('#6b6bff', 0.25));
scene.add(new THREE.HemisphereLight('#c9c4ff', '#1a1a3a', 0.9));

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
    addEventListener('touchend', async () => {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result === 'granted') addEventListener('deviceorientation', onTilt);
      } catch {}
    }, { once: true });
  } else {
    addEventListener('deviceorientation', onTilt);
  }
}

// ---------- Only render while the hero is visible ----------
let heroVisible = true;
new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);

// ---------- Animation loop ----------
let time = 0, tick = 0;
renderer.setAnimationLoop(() => {
  if (!heroVisible) return;
  time += 0.016;

  // Whole scene gently sways and leans toward the mouse
  const sway = Math.sin(time * 0.4) * 0.3;
  character.rotation.y += (sway + mouseX * 0.6 - character.rotation.y) * 0.05;
  character.rotation.x += (mouseY * 0.1 - character.rotation.x) * 0.05;

  // Type one more character every 3 frames, then start over
  tick++;
  if (tick % 3 === 0) {
    typed++;
    if (typed > totalChars + 60) typed = 0;
    drawCode();
  }

  // Coder body movement
  headG.rotation.x = 0.12 + Math.sin(time * 2) * 0.03;
  headG.rotation.y = Math.sin(time * 0.7) * 0.08;
  torso.rotation.x = Math.sin(time * 1.5) * 0.015;

  arms.forEach((arm, i) => {
    const shoulder = new THREE.Vector3(arm.side * 0.42, 1.85, 0);
    const elbow = new THREE.Vector3(arm.side * 0.45, 1.45, -0.3);
    const tap = Math.max(0, Math.sin(time * 18 + i * Math.PI + Math.sin(time * 3) * 2)) * 0.05;
    const hand = new THREE.Vector3(
      arm.side * (0.22 + Math.sin(time * 2.3 + i) * 0.05),
      1.68 + tap,
      -1.0 + Math.cos(time * 1.7 + i) * 0.03
    );
    place(arm.upper, shoulder, elbow);
    place(arm.lower, elbow, hand);
    arm.hand.position.copy(hand);
  });

  screenGlow.intensity = 3 + Math.sin(time * 3) * 0.5;
  renderer.render(scene, camera);
});

// ---------- GSAP intro ----------
gsap.from(character.position, { y: -5, duration: 1.8, ease: 'power3.out' });
gsap.from(character.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 1.8, ease: 'power3.out' });
gsap.from('.hero h1', { y: 40, opacity: 0, duration: 1, delay: 0.5 });
gsap.from('.hero p', { y: 40, opacity: 0, duration: 1, delay: 0.8, stagger: 0.1 });

// ---------- Resize ----------
function fitCamera() {
  const w = hero.clientWidth;
  const h = hero.clientHeight;
  const isMobile = w < 768;

  camera.aspect = w / h;
  const distance = w < 768 ? 1.6 : 1;
  camera.position.set(5.9 * distance, 4.7 * distance, 7.7 * distance);
  camera.lookAt(0, 1, 0.3);

  character.position.x = isMobile ? 0.15 : 0.45;
  character.position.z = isMobile ? 0.5 : 0.9;
  camera.lookAt(0, isMobile ? 0.3 : 1, 0.3);

  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
fitCamera();
addEventListener('resize', fitCamera);

// ---------- Custom cursor ----------
const cursor = document.querySelector('.cursor');
if (cursor) {
  const moveX = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const moveY = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => { moveX(e.clientX); moveY(e.clientY); });
  document.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}