// @ts-nocheck
// World assembly for the "One Sol to Rescue" intro. Reuses the game's own art modules
// (look pipeline, base models, characters, ascent vehicle) so the film matches the game design.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createLook, heightAt} from '../game/look.js';
import {rebuildBase} from '../game/models.js';
import {buildAscentVehicle} from '../game/ascent-vehicle.js';
import {SCIENCE} from '../game/assets/science-assets.js';
import {makeSky} from './sky.js';
import {makeDust} from './dust.js';
import {makeFaceTextures} from './face.js';
import {buildCockpit} from './cockpit.js';
import {RAVINE} from './layout.js';

const smooth = (a, b, x) => {const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t);};

// Shallow ravine carved into the game terrain (soft dune-like slope, safe slide).
globalThis.__ravine = (x, z) => {
  const {x0, x1, z: zc, half, depth} = RAVINE;
  const along = smooth(x0 - 3, x0 + 1, x) * (1 - smooth(x1 - 1, x1 + 3, x));
  const d = Math.abs(z - zc) / half;
  const profile = d < 1 ? (Math.cos(d * Math.PI) * .5 + .5) : 0;
  return -depth * profile * along;
};

export async function createWorld(canvas, {modelBase = '/public/models/', width = 1920, height = 1080} = {}) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'});
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e3a77c');
  scene.fog = new THREE.Fog('#e3a77c', 60, 150);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, .04).texture;

  const camera = new THREE.PerspectiveCamera(32, width / height, .05, 900);
  const hemi = new THREE.HemisphereLight('#d7e9f4', '#a35d38', 1);
  const sun = new THREE.DirectionalLight('#ffe2b5', 4);
  sun.castShadow = true; sun.shadow.bias = -.0003;
  scene.add(hemi, sun, sun.target);

  // ground placeholder (look.js rebuilds it into the game terrain)
  const grainSize = 256, grain = new Uint8Array(grainSize * grainSize * 4);
  let seed = 98341;
  for (let i = 0; i < grainSize * grainSize; i++) {seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; const v = 180 + (seed >>> 24) * .28; grain.set([v, v, v, 255], i * 4);}
  const groundMat = new THREE.MeshStandardMaterial({color: '#ba7251', roughness: 1});
  groundMat.map = new THREE.DataTexture(grain, grainSize, grainSize); groundMat.map.wrapS = groundMat.map.wrapT = THREE.RepeatWrapping; groundMat.map.needsUpdate = true;
  const land = new THREE.Mesh(new THREE.BoxGeometry(160, .5, 160), groundMat);
  scene.add(land);

  // ---------- base "Zarya" (game layout) ----------
  const LAYOUT = {hab: [-2, -2], farm: [5, -1.9], panels: [-8, 5.5], comms: [-8, -3.2], shelter: [5, -7], shop: [-1, 7]};
  const groups = {};
  for (const [id, [x, z]] of Object.entries(LAYOUT)) {const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); groups[id] = g;}
  rebuildBase({THREE, groups, science: SCIENCE});

  // ---------- landing pad + ascent ship "Tulpar" ----------
  const PAD = new THREE.Vector3(19, 0, -2);
  const pad = new THREE.Group(); pad.position.copy(PAD); scene.add(pad);
  const padTex = (() => {const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d'); x.fillStyle = '#8f887c'; x.fillRect(0, 0, 1024, 1024);
    x.strokeStyle = '#e0b23e'; x.lineWidth = 26; x.beginPath(); x.arc(512, 512, 430, 0, 7); x.stroke(); x.lineWidth = 12; x.setLineDash([60, 40]); x.beginPath(); x.arc(512, 512, 307, 0, 7); x.stroke();
    let q = 7; const r = () => {q = (Math.imul(q, 1664525) + 1013904223) >>> 0; return q / 4294967296;};
    for (let i = 0; i < 2600; i++) {x.fillStyle = `rgba(40,30,25,${r() * .22})`; x.fillRect(r() * 1024, r() * 1024, 3, 3);}
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;})();
  const concrete = new THREE.MeshStandardMaterial({color: '#9e978a', roughness: .95});
  const padMesh = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.6, .14, 64), [concrete, new THREE.MeshStandardMaterial({map: padTex, roughness: .9}), concrete]);
  padMesh.position.y = .07; padMesh.receiveShadow = true; pad.add(padMesh);
  const lampMat = new THREE.MeshStandardMaterial({color: '#34525c', emissive: '#ffb36e', emissiveIntensity: .3});
  for (let i = 0; i < 12; i++) {const a = i / 12 * Math.PI * 2; const b = new THREE.Mesh(new THREE.BoxGeometry(.2, .12, .2), new THREE.MeshStandardMaterial({color: '#788388', metalness: .7, roughness: .42})); b.position.set(Math.cos(a) * 4.75, .08, Math.sin(a) * 4.75); pad.add(b);
    const l = new THREE.Mesh(new THREE.BoxGeometry(.12, .05, .12), lampMat); l.position.set(Math.cos(a) * 4.75, .16, Math.sin(a) * 4.75); pad.add(l);}
  const scorchTex = (() => {const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 30, 128, 128, 128);
    g.addColorStop(0, 'rgba(20,14,10,.35)'); g.addColorStop(.45, 'rgba(18,12,9,.92)'); g.addColorStop(.7, 'rgba(40,26,18,.45)'); g.addColorStop(1, 'rgba(40,26,18,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;})();
  const scorch = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 8.5), new THREE.MeshStandardMaterial({map: scorchTex, transparent: true, depthWrite: false, roughness: 1}));
  scorch.rotation.x = -Math.PI / 2; scorch.position.y = .15; scorch.visible = false; pad.add(scorch);
  const ship = buildAscentVehicle(THREE); ship.position.y = .14; ship.rotation.y = -.9; pad.add(ship);
  const ascent = ship.getObjectByName('AscentStage');
  const engineFlame = new THREE.Group(); ascent.add(engineFlame); engineFlame.position.y = 1.7;
  const flameMat = new THREE.MeshBasicMaterial({color: '#ffc38d', transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false});
  const flameCore = new THREE.Mesh(new THREE.ConeGeometry(.55, 2.6, 24, 1, true), flameMat); flameCore.rotation.x = Math.PI; flameCore.position.y = -1.3; engineFlame.add(flameCore);
  const flameGlow = new THREE.Mesh(new THREE.SphereGeometry(.9, 24, 16), new THREE.MeshBasicMaterial({color: '#ff9a4a', transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false}));
  flameGlow.scale.set(1, 1.6, 1); flameGlow.position.y = -.6; engineFlame.add(flameGlow);
  const engineLight = new THREE.PointLight('#ffb070', 0, 40, 1.5); engineLight.position.y = -1; engineFlame.add(engineLight);
  engineFlame.visible = false;

  // ---------- rover (NASA Perseverance, six wheels; as in the game) ----------
  const loader = new GLTFLoader();
  const rover = new THREE.Group(); rover.position.set(9, 0, 4.5); rover.rotation.y = -.5; scene.add(rover);
  try {
    const g = await loader.loadAsync(modelBase + 'NASA-Perseverance.glb');
    const model = g.scene; const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const s = 3.8 / Math.max(size.x, size.z); model.scale.setScalar(s); model.position.set(-c.x * s, -box.min.y * s, -c.z * s);
    model.traverse(n => {if (n.isMesh) {n.castShadow = n.receiveShadow = true; if (n.material) n.material.envMapIntensity = .5;}});
    rover.add(model);
  } catch (e) {console.warn('rover', e);}

  // ---------- characters: Mark, Beep, four crew ----------
  const look = createLook({THREE, renderer, scene, camera, sun, hemi, porch: new THREE.PointLight('#ffc281', 0, 9), low: false});
  const mark = new THREE.Group(), beep = new THREE.Group();
  look.characters({mark, beep, limbs: []});
  scene.add(mark, beep);
  const crewAccent = new THREE.MeshStandardMaterial({color: '#7f9cc4', roughness: .6});
  const cmdBand = new THREE.MeshStandardMaterial({color: '#172f56', roughness: .6});
  const crew = [];
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Group(), dummy = new THREE.Group();
    look.characters({mark: c, beep: dummy, limbs: []});
    c.traverse(o => {if (o.isMesh && o.material?.name === 'suit_accent') o.material = crewAccent;});
    if (i === 0) {const band = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .07, 16), cmdBand); band.position.y = -.07; c.userData.joints.arms[0].shoulder.add(band);
      const band2 = band.clone(); c.userData.joints.arms[1].shoulder.add(band2);}
    scene.add(c); crew.push(c);
  }
  for (const c of [mark, ...crew]) c.traverse(o => {if (o.isMesh) o.castShadow = o.receiveShadow = true;});

  // Beep: pixel-eye face screen + headlamp
  const faces = makeFaceTextures(THREE);
  for (const e of beep.userData.eyeMeshes) e.visible = false;
  const faceMat = new THREE.MeshStandardMaterial({color: '#ffffff', map: faces.normal.map, emissive: '#ffffff', emissiveMap: faces.normal.glow, emissiveIntensity: 1.3, roughness: .2});
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.4, .21), faceMat); face.position.set(0, .66, .2835); beep.add(face);
  const lampHousing = new THREE.Mesh(new RoundedBoxGeometry(.16, .08, .08, 2, .02), new THREE.MeshStandardMaterial({color: '#2f3a3f', roughness: .5}));
  lampHousing.position.set(0, .87, .17); beep.add(lampHousing);
  const lampLens = new THREE.Mesh(new THREE.CircleGeometry(.03, 16), new THREE.MeshStandardMaterial({color: '#fff6e0', emissive: '#fff1d0', emissiveIntensity: 0}));
  lampLens.position.set(0, .87, .2105); beep.add(lampLens);
  const headlamp = new THREE.SpotLight('#fff1d6', 0, 14, .42, .5, 1.2); headlamp.position.set(0, .87, .22);
  const lampTarget = new THREE.Object3D(); lampTarget.position.set(0, .4, 3); beep.add(headlamp, lampTarget); headlamp.target = lampTarget;
  beep.traverse(o => {if (o.isMesh) o.castShadow = o.receiveShadow = true;}); face.castShadow = false;

  // props: weather-sensor mast, crate, tools, safety line (poles + rope)
  const props = {};
  const white = new THREE.MeshStandardMaterial({color: '#e2e1d8', roughness: .6}), steel = new THREE.MeshStandardMaterial({color: '#aab2b5', metalness: .85, roughness: .32});
  const orange = new THREE.MeshStandardMaterial({color: '#d8682e', roughness: .5});
  {
    const m = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03, .04, 1.6, 10), steel); pole.position.y = .8; m.add(pole);
    const cup = new THREE.Group(); cup.position.y = 1.62; m.add(cup);
    for (let i = 0; i < 3; i++) {const a = i * Math.PI * 2 / 3; const arm = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .26, 6), steel); arm.rotation.z = Math.PI / 2; arm.rotation.y = a; arm.position.set(Math.cos(a) * .13, 0, -Math.sin(a) * .13); cup.add(arm);
      const s = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8, 0, Math.PI), white); s.position.set(Math.cos(a) * .26, 0, -Math.sin(a) * .26); s.rotation.y = a; cup.add(s);}
    const boxm = new THREE.Mesh(new RoundedBoxGeometry(.26, .2, .14, 2, .02), white); boxm.position.set(0, 1.0, .07); m.add(boxm);
    const led = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), new THREE.MeshStandardMaterial({color: '#abd0ff', emissive: '#abd0ff', emissiveIntensity: 2})); led.position.set(.08, 1.04, .145); m.add(led);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .06, 16), steel); base.position.y = .03; m.add(base);
    m.traverse(o => {if (o.isMesh) o.castShadow = o.receiveShadow = true;});
    scene.add(m); props.mast = m; props.mastCups = cup;
  }
  {
    const crate = new THREE.Mesh(new RoundedBoxGeometry(.5, .36, .38, 2, .03), new THREE.MeshStandardMaterial({color: '#b89a6a', roughness: .85}));
    const strap = new THREE.Mesh(new THREE.BoxGeometry(.51, .05, .39), new THREE.MeshStandardMaterial({color: '#26292b', roughness: .9})); crate.add(strap);
    crate.castShadow = true; scene.add(crate); props.crate = crate;
    props.tools = [0, 1].map(() => {const t = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .42, 8), orange); t.add(h); const head = new THREE.Mesh(new RoundedBoxGeometry(.12, .07, .07, 1, .015), steel); head.position.y = .22; t.add(head); t.traverse(o => o.castShadow = true); scene.add(t); return t;});
  }
  // safety line: short poles with a bright yellow rope between them
  const lineMat = new THREE.MeshStandardMaterial({color: '#ffd23a', emissive: '#ffb800', emissiveIntensity: .35, roughness: .5});
  const poleMat = new THREE.MeshStandardMaterial({color: '#e7e3d8', roughness: .55});
  const linePoles = [];
  props.line = {poles: linePoles, rope: null, mat: lineMat};
  const linePts = RAVINE.line;
  for (const [x, z] of linePts) {const p = new THREE.Group(); const y = heightAt(x, z) + .045; p.position.set(x, y, z);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.035, .045, 1.05, 10), poleMat); post.position.y = .52; p.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), orange); cap.position.y = 1.06; p.add(cap);
    const clip = new THREE.Mesh(new THREE.TorusGeometry(.05, .014, 6, 14), steel); clip.position.set(0, .98, .045); p.add(clip); p.userData.clip = clip;
    p.traverse(o => {if (o.isMesh) o.castShadow = o.receiveShadow = true;}); scene.add(p); linePoles.push(p);}
  const rope = new THREE.Mesh(new THREE.BufferGeometry(), lineMat); rope.castShadow = true; scene.add(rope); props.line.rope = rope;

  // hab warning lights (amber, pulsing in the alarm)
  const amberMat = new THREE.MeshStandardMaterial({color: '#ffcf8a', emissive: '#ffa21f', emissiveIntensity: .2});
  const amberLights = [];
  for (const [x, y, z] of [[-2.0, 4.85, -2.0], [-4.9, 2.6, 0.6], [1.1, 2.5, 0.8]]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 10), amberMat); b.position.set(x, y, z); scene.add(b);
    const l = new THREE.PointLight('#ffa21f', 0, 9, 1.6); l.position.set(x, y + .2, z); scene.add(l); amberLights.push(l);
  }

  // base window lights for night / dusk
  const sky = makeSky(THREE); scene.add(sky.mesh);
  const dust = makeDust(THREE, renderer, camera);
  const cockpit = buildCockpit(THREE, {charactersBuilder: (c, d) => look.characters({mark: c, beep: d, limbs: []}), crewAccent, cmdBand});
  cockpit.root.position.set(0, 300, 0); cockpit.root.visible = false; scene.add(cockpit.root);
  cockpit.root.traverse(o => {o.userData.noDust = true;});

  look.dust(scene);

  // depth of field for the rack focus
  const bokeh = new BokehPass(scene, camera, {focus: 3, aperture: .0, maxblur: .012});
  bokeh.enabled = false;
  look.composer.insertPass(bokeh, 3);

  // ---------- visor reflection env maps (storm band rising) ----------
  const visorEnvs = [];
  for (let k = 0; k < 7; k++) {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#f4c79d'); g.addColorStop(.5, '#ffd9b0'); g.addColorStop(.52, '#b46a43'); g.addColorStop(1, '#6e3d26');
    x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    const band = k / 6; // 0..1
    if (band > 0) {const top = 128 - band * 70; const bg = x.createLinearGradient(0, top - 16, 0, 132); bg.addColorStop(0, 'rgba(92,52,30,0)'); bg.addColorStop(.25, 'rgba(92,52,30,.95)'); bg.addColorStop(1, 'rgba(70,40,24,1)');
      x.fillStyle = bg; x.fillRect(0, top - 16, 512, 150 - top);}
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
    visorEnvs.push(pmrem.fromEquirectangular(t).texture);
  }
  let visorMat = null; mark.traverse(o => {if (o.isMesh && o.material?.name === 'visor_gold') visorMat = o.material;});
  const visorBase = visorMat.envMap;

  return {THREE, renderer, scene, camera, sun, hemi, look, groups, pad, PAD, ship, ascent, engineFlame, flameMat, engineLight, scorch,
    rover, mark, beep, crew, face, faceMat, faces, headlamp, lampLens, props, amberMat, amberLights, sky, dust, cockpit, bokeh,
    visorEnvs, visorMat, visorBase, heightAt, land};
}
