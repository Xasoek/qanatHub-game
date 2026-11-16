// Role 2: the 3D outpost. Reads STATE through setState(); never changes it.
// Everything (Three.js, models, textures, the NASA rover model) is embedded; no runtime downloads.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { decodeRover } from "./assets/rover-asset.js";
import { SCIENCE } from "./assets/science-assets.js";
import { MARS_MAP } from "./assets/mars-map.js";
import { createDustPass } from "./weather.js";
import { createLook } from "./look.js";
import { rebuildBase } from "./models.js";
import { buildExpansion } from "./expansion.js";
import { batchStatic } from "./batch.js";
import { createSolarSystem, AU, RADIUS, SUN_RADIUS } from "./solar.js";
import { SITES } from "../data.js";
import { CONFIG } from "../config.js";

/** 3D object IDs that can be picked. */
export const OBJECT_IDS = ["air", "farm", "repair", "heat", "comms", "science", "panels"];

const LAYOUT = {
  air: [-2, -2, 4.6], farm: [5, -1.9, 4.1], panels: [-8, 5.5, 2.6], comms: [-8, -3.2, 5.4],
  heat: [5, -7, 3.3], repair: [-1, 7, 3.0], science: [9, 4.5, 3.5],
};
const APPROACH = {
  air: [-2, 2.75], farm: [5, 2], repair: [-1, 4.75], heat: [5, -3.8], comms: [-6.3, -1.4], science: [11, 6.8], panels: [-8, 5.5],
};
const ease = (x) => x * x * (3 - 2 * x);
const SKY = { day: new THREE.Color("#cf946e"), dusk: new THREE.Color("#3f5068"), night: new THREE.Color("#07090f"), storm: new THREE.Color("#8a5c3a") };
const damp = THREE.MathUtils.damp;

export function hasCapableGpu() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}

export function createWorld(container, { onPick = () => {}, stateRoot = container, reducedMotion } = {}) {
  const reduced = reducedMotion ?? matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer:coarse)").matches;
  const host = document.createElement("div");
  host.className = "world-canvas";
  const labelLayer = document.createElement("div");
  labelLayer.className = "world-labels";
  const marker = document.createElement("button");
  marker.type = "button";
  marker.className = "base-marker";
  marker.hidden = true;
  container.append(host, labelLayer, marker);

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  if (!renderer.capabilities.isWebGL2) throw new Error("WebGL 2 is required");
  // Software rasterisers (CI, old GPUs) get a lighter pipeline.
  const gl = renderer.getContext(), info = gl.getExtension("WEBGL_debug_renderer_info");
  const low = /swiftshader|llvmpipe|software|basic render/i.test(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "");
  renderer.setPixelRatio(low ? 0.5 : Math.min(devicePixelRatio, coarse ? 1.5 : 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#cf946e");
  scene.fog = new THREE.Fog("#cf946e", 55, 120);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = new RoomEnvironment();
  scene.environment = pmrem.fromScene(studio, 0.04).texture;
  studio.dispose();
  pmrem.dispose();

  const camera = new THREE.OrthographicCamera(-18, 18, 18, -18, 0.1, 700);
  const BASE_NEAR = 0.1, BASE_FAR = 700;
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  const HOME = { pos: new THREE.Vector3(26, 29, 32), target: new THREE.Vector3(1, 0.3, 0) };

  const hemi = new THREE.HemisphereLight("#d7e9f4", "#a35d38", 1);
  const sun = new THREE.DirectionalLight("#ffe2b5", 4);
  sun.position.set(-12, 22, 7);
  sun.castShadow = true;
  sun.shadow.bias = -0.0003;
  scene.add(hemi, sun);

  // ---------- ground and paths (look.js turns them into terrain and tracks) ----------
  const groundMat = new THREE.MeshStandardMaterial({ color: "#ba7251", roughness: 1 });
  const grainSize = 512, grain = new Uint8Array(grainSize * grainSize * 4);
  let seed = 98341;
  for (let i = 0; i < grainSize * grainSize; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const v = 180 + (seed >>> 24) * 0.28;
    const j = i * 4;
    grain[j] = grain[j + 1] = grain[j + 2] = v;
    grain[j + 3] = 255;
  }
  groundMat.map = new THREE.DataTexture(grain, grainSize, grainSize);
  groundMat.map.wrapS = groundMat.map.wrapT = THREE.RepeatWrapping;
  groundMat.map.needsUpdate = true;
  const land = new THREE.Mesh(new THREE.BoxGeometry(160, 0.5, 160), groundMat);
  land.position.y = -0.3;
  scene.add(land);
  const pathMat = new THREE.MeshStandardMaterial({ color: "#d39a6f" });
  for (const [x, z, w, d] of [[0, 2, 20, 1.1], [-2, 0, 1.1, 16], [5, 0, 1.1, 15], [-6, -5, 8, 1.1]]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(w, 0.065, d), pathMat);
    p.position.set(x, 0.09, z);
    scene.add(p);
  }

  // ---------- buildings, characters, rover ----------
  const groups = {};
  const objects = {};
  for (const [id, [x, z, h]] of Object.entries(LAYOUT)) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    scene.add(g);
    groups[id] = g;
    objects[id] = { group: g, height: h };
  }
  rebuildBase({ THREE, groups: { hab: groups.air, farm: groups.farm, panels: groups.panels, comms: groups.comms, shelter: groups.heat, shop: groups.repair }, science: SCIENCE });
  buildExpansion({ THREE, scene, panels: groups.panels });

  const mark = new THREE.Group(), beep = new THREE.Group(), limbs = [];
  mark.position.set(-2, 0, 2.75);
  beep.position.set(-0.9, 0, 3.5);
  scene.add(mark, beep);

  const porch = new THREE.PointLight("#ffc281", 0, 9);
  porch.position.set(-2, 1.9, 2.4);
  scene.add(porch);

  const look = createLook({ THREE, renderer, scene, camera, sun, hemi, porch, low });
  look.characters({ mark, beep, limbs });

  look.dust(scene);
  const rover = groups.science;
  rover.rotation.y = -0.5;
  // Decode after first paint so controls remain available during loading.
  if (!low) setTimeout(async () => {
    try {
      const buffer = await decodeRover();
      if (!running) return;
      const gltf = await new GLTFLoader().parseAsync(buffer, "");
      if (!running) return;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
      const scale = 3.8 / Math.max(size.x, size.z);
      model.scale.setScalar(scale);
      model.position.set(-centre.x * scale, -box.min.y * scale, -centre.z * scale);
      model.traverse((n) => {
        if (!n.isMesh) return;
        n.castShadow = n.receiveShadow = true;
        n.userData.objectId = "science";
        if (n.material) n.material.envMapIntensity = 0.5;
      });
      look.dust(model);
      batchStatic(THREE, model);
      rover.add(model);
      model.traverse((n) => { if (n.isMesh) pickables.push(n); });
      shadowFrames = 3;
    } catch (error) {
      console.warn("Embedded NASA rover model could not be decoded", error);
    }
  }, 400);

  // Selection ring and object labels.
  const ring = new THREE.Mesh(new THREE.RingGeometry(1, 1.08, 64), new THREE.MeshBasicMaterial({ color: "#ffe0a4", side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  scene.add(ring);
  for (const [id, obj] of Object.entries(objects)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "world-label";
    b.dataset.object = id;
    b.addEventListener("click", () => onPick(id));
    labelLayer.append(b);
    obj.label = b;
  }

  // ---------- base / space views ----------
  const baseWorld = new THREE.Group();
  for (const child of [...scene.children]) if (!child.isLight) baseWorld.add(child);
  scene.add(baseWorld);
  const spaceWorld = new THREE.Group();
  spaceWorld.visible = false;
  scene.add(spaceWorld);
  // Solar system: only Mars and Earth can be approached; the base marker sits at the chosen site's real coordinates.
  const solar = createSolarSystem(THREE, { marsMap: MARS_MAP });
  spaceWorld.add(solar.root);
  const markerAnchor = new THREE.Object3D();
  solar.bodies.mars.planet.add(markerAnchor);
  function placeMarker(site) {
    const s2 = SITES[site] ?? SITES.gale, lon = ((s2.lon + 180) % 360 + 360) % 360 - 180;
    const phi = ((lon + 180) / 360) * Math.PI * 2, theta = ((90 - s2.lat) / 180) * Math.PI, r = RADIUS.mars * 1.02;
    markerAnchor.position.set(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
  }
  placeMarker(CONFIG.defaults.site);
  // ---------- space view: its own perspective camera and orbit controls (like a planetarium) ----------
  const UP = new THREE.Vector3(0, 1, 0);
  const spaceCam = new THREE.PerspectiveCamera(58, 1, 1e-5, 40000);
  const spaceCtl = new OrbitControls(spaceCam, renderer.domElement);
  Object.assign(spaceCtl, { enabled: false, enableDamping: true, dampingFactor: 0.08, enablePan: false, rotateSpeed: 0.5, zoomSpeed: 1.1 });
  const SHIP_SIZE = 0.06; // close-up model scale (the ship is drawn enlarged)
  const FOCUS_NAMES = ["mars", "earth", "system", "ship"];
  let spaceFocus = "mars", focusing = 0, focusAnim = null, missionSol = 1, currentSite = CONFIG.defaults.site;
  const spaceObject = (name) => name === "sun" ? solar.sun : name === "ship" ? solar.ship : solar.bodies[name].planet;
  const focusPoint = (name) => name === "system" ? new THREE.Vector3() : spaceObject(name).getWorldPosition(new THREE.Vector3());
  const focusRadius = (name) => name === "system" ? AU * 1.6 : name === "ship" ? 4 * SHIP_SIZE : RADIUS[name];
  // Opening shot: the planet in the middle with its sunlit edge, the Sun shining at the right edge of the frame.
  function spacePose(name) {
    const target = focusPoint(name), r = focusRadius(name);
    if (name === "system") return { target, pos: new THREE.Vector3(0, r * 1.5, r * 2.2) };
    if (name === "ship") {
      const offset = new THREE.Vector3(.49,.32,-1).normalize().applyQuaternion(solar.ship.quaternion);
      return {target,pos:target.clone().addScaledVector(offset,SHIP_SIZE*13.8)};
    }
    const toSun = target.clone().negate().setY(0).normalize(), dist = r * (name === "ship" ? 5 : 3.9);
    let best = null;
    for (const sign of [-1, 1]) { // pick the side that puts the Sun on the right of the screen
      const pos = target.clone().addScaledVector(toSun.clone().applyAxisAngle(UP, sign * 2.45).setY(0.2).normalize(), dist);
      const m = new THREE.Matrix4().lookAt(pos, target, UP), right = new THREE.Vector3().setFromMatrixColumn(m, 0);
      if (!best || right.dot(toSun) > best.score) best = { pos, score: right.dot(toSun) };
    }
    return { target, pos: best.pos };
  }
  const dist0 = () => spaceCam.position.distanceTo(spaceCtl.target);
  function setSpaceLimits() {
    const r = focusRadius(spaceFocus);
    spaceCtl.minDistance = spaceFocus === "system" ? AU * 0.25 : r * (spaceFocus === "ship" ? 1.8 : 1.1);
    spaceCtl.maxDistance = spaceFocus === "system" ? AU * 95 : r * (spaceFocus === "ship" ? 400 : 250);
  }
  function faceMarsSite(fromPos) {
    const planet = solar.bodies.mars.planet, d = fromPos.clone().sub(planet.getWorldPosition(new THREE.Vector3()));
    planet.rotation.y = Math.atan2(markerAnchor.position.z, markerAnchor.position.x) - Math.atan2(-d.z, d.x);
  }
  function focusSpace(name, instant = false) {
    if (!FOCUS_NAMES.includes(name)) return;
    spaceFocus = name;
    setSpaceLimits();
    const to = spacePose(name);
    if (name === "mars") faceMarsSite(to.pos);
    if (instant) { spaceCtl.target.copy(to.target); spaceCam.position.copy(to.pos); spaceCam.lookAt(to.target); focusing = 0; return; }
    focusAnim = { start: performance.now(), fromT: spaceCtl.target.clone(), fromP: spaceCam.position.clone(), to };
    focusing = 1;
  }
  function runFocus(now) {
    const e = ease(Math.min(1, (now - focusAnim.start) / (reduced ? 1 : 1400))), { fromT, fromP, to } = focusAnim;
    const target = fromT.clone().lerp(to.target, e);
    const a = fromP.clone().sub(fromT), b = to.pos.clone().sub(to.target);
    // distance changes by orders of magnitude, so blend it in log space
    const len = Math.exp(THREE.MathUtils.lerp(Math.log(a.length()), Math.log(b.length()), e));
    const dir = a.normalize().lerp(b.normalize(), e).normalize();
    spaceCtl.target.copy(target);
    spaceCam.position.copy(target).addScaledVector(dir, len);
    spaceCam.lookAt(target);
    if (e >= 1) { focusing = 0; focusAnim = null; }
  }
  // Sun glare overlay (the Sun is ~0.5° wide from here; the glare is what a camera actually records)
  const sunFlare = document.createElement("div");
  sunFlare.className = "sun-flare";
  sunFlare.innerHTML = "<i class=\"halo\"></i><i class=\"core\"></i>";
  sunFlare.hidden = true;
  container.append(sunFlare);
  const pxRadius = (worldPos, r) => (r / Math.max(1e-9, spaceCam.position.distanceTo(worldPos))) / Math.tan((spaceCam.fov * Math.PI) / 360) * viewHeight / 2;
  function updateSunFlare() {
    if (!orbital || travelling) { sunFlare.hidden = true; return; }
    const w = viewWidth, h = viewHeight, p = projected.copy(solar.sun.position).project(spaceCam);
    let hidden = p.z > 1 || Math.abs(p.x) > 1.4 || Math.abs(p.y) > 1.4 || spaceFocus === "system";
    const x = (p.x * 0.5 + 0.5) * w, y = (-p.y * 0.5 + 0.5) * h;
    if (!hidden && spaceFocus !== "ship") { // eclipse behind the focused planet
      const c = focusPoint(spaceFocus), q = c.clone().project(spaceCam);
      if (Math.hypot(x - (q.x * 0.5 + 0.5) * w, y - (-q.y * 0.5 + 0.5) * h) < pxRadius(c, focusRadius(spaceFocus)) * 0.98) hidden = true;
    }
    sunFlare.hidden = hidden;
    if (hidden) return;
    sunFlare.style.left = x + "px";
    sunFlare.style.top = y + "px";
    sunFlare.style.setProperty("--gx", (w / 2 - x) * 0.6 + "px");
    sunFlare.style.setProperty("--gy", (h / 2 - y) * 0.6 + "px");
    sunFlare.style.opacity = String(Math.max(0, Math.min(1, 1.4 - Math.max(Math.abs(p.x), Math.abs(p.y)))));
  }
  const spaceLabels = document.createElement("div");
  spaceLabels.className = "space-labels";
  container.append(spaceLabels);
  const spaceTags = {};
  for (const name of ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "ship"]) {
    const focusable = name === "earth" || name === "mars" || name === "ship";
    const tag = document.createElement(focusable ? "button" : "span");
    tag.className = "space-label" + (focusable ? " focusable" : "") + (name === "ship" ? " ship" : "");
    if (tag.tagName === "BUTTON") { tag.type = "button"; tag.addEventListener("click", () => focusSpace(name)); }
    spaceLabels.append(tag);
    spaceTags[name] = tag;
  }
  // Star field as a screen background (at true scale, geometry stars would be in the way of the camera range).
  const starTex = (() => {
    const c = document.createElement("canvas"); c.width = 2048; c.height = 1152;
    const x = c.getContext("2d"); x.fillStyle = "#03060d"; x.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 1600; i++) { const r = Math.random() ** 3 * 1.6 + 0.3, a = 0.35 + Math.random() * 0.65; x.fillStyle = `rgba(${200 + Math.random() * 55},${210 + Math.random() * 45},255,${a})`; x.beginPath(); x.arc(Math.random() * c.width, Math.random() * c.height, r, 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const bgColor = new THREE.Color("#cf946e");
  const renderDust = createDustPass(THREE, renderer, camera);
  const sandCount = 1400, sand = new Float32Array(sandCount * 3);
  for (let i = 0; i < sandCount; i++) sand.set([(Math.random() - 0.5) * 80, Math.random() * 10, (Math.random() - 0.5) * 60], i * 3);
  const sandGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(sand, 3));
  const sandPoints = new THREE.Points(sandGeo, new THREE.PointsMaterial({ color: "#dfc49e", size: 0.025, transparent: true, opacity: 0, depthWrite: false }));
  baseWorld.add(sandPoints);

  // ---------- state-driven visuals ----------
  const racks = [];
  groups.panels.traverse((o) => { if (o.name === "pv-rack") racks.push(o); });
  racks.forEach((r) => {
    r.userData.tilt = r.rotation.x;
    r.traverse((m) => { if (m.isMesh && m.material?.map && m.material.isMeshPhysicalMaterial) { m.material = m.material.clone(); r.userData.pv = m.material; } });
  });
  const crops = [];
  groups.farm.traverse((o) => {
    if (o.isInstancedMesh && o.name.startsWith("crop")) {
      const base = [], m = new THREE.Matrix4();
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m);
        const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
        m.decompose(p, q, s);
        base.push([p, q, s]);
      }
      crops.push({ mesh: o, base });
    }
  });
  // Merge everything that never moves; keep characters, the intro ship, panels that tilt and instanced parts separate.
  const dynamic = new Set([mark, beep, ring, rover, sandPoints, land, groups.repair.userData.carriage, groups.comms.userData.gimbal]);
  // A shared moving joint can carry one merged mesh per material.
  for (const rack of racks) batchStatic(THREE, rack);
  function batchRigidParts(joint) {
    const childJoints = joint.children.filter(part => part.isGroup);
    for (const child of childJoints) batchRigidParts(child);
    batchStatic(THREE, joint, part => part.isGroup);
  }
  batchRigidParts(mark);
  batchRigidParts(beep);
  batchStatic(THREE, groups.comms.userData.gimbal);
  batchStatic(THREE, baseWorld, (o) => dynamic.has(o) || racks.includes(o) || o.isPoints || o.isInstancedMesh);
  const pickables = [];
  baseWorld.traverse((m) => { if (m.isMesh && m.userData.objectId) pickables.push(m); });
  renderer.shadowMap.autoUpdate = false;
  let shadowFrames = 3;
  let cropShown = -1;
  function setCrop(f) {
    const k = Math.round(f * 20) / 20;
    if (k === cropShown) return;
    cropShown = k;
    const m = new THREE.Matrix4(), s = new THREE.Vector3();
    for (const { mesh, base } of crops) {
      base.forEach(([p, q, sc], i) => { mesh.setMatrixAt(i, m.compose(p, q, s.copy(sc).multiplyScalar(0.15 + 0.85 * k))); });
      mesh.instanceMatrix.needsUpdate = true;
    }
    shadowFrames = 2;
  }

  const view = { frost: 0, frostTarget: 0, night: 0, nightTarget: 0, storm: 0, stormTarget: 0, flash: 0, alarm: false, folded: false,
    broken: 0, dusty: 0, crop: 1 };

  const pvDust = new THREE.Color("#b98361"), pvBroken = new THREE.Color("#3a3634"), white = new THREE.Color("#ffffff");
  let panelsMoving = false;
  function updatePanels(dt) {
    panelsMoving = false;
    racks.forEach((r, i) => {
      const broken = i < view.broken, dusty = !broken && i < view.broken + view.dusty;
      const tilt = broken ? -0.95 : view.folded ? -1.48 : r.userData.tilt;
      if (Math.abs(r.rotation.x - tilt) > 0.002 || Math.abs(r.rotation.z - (broken ? 0.32 : 0)) > 0.002) panelsMoving = true;
      r.rotation.x = damp(r.rotation.x, tilt, 3, dt);
      r.rotation.z = damp(r.rotation.z, broken ? 0.32 : 0, 3, dt);
      if (r.userData.pv) r.userData.pv.color.copy(broken ? pvBroken : dusty ? pvDust : white);
    });
  }

  // ---------- camera ----------
  let viewWidth = 1, viewHeight = 1, labelViewDirty = true;
  function frameSpan() {
    const h = viewHeight, aspect = viewWidth / h;
    return orbital ? Math.max(16, 24 / aspect) : aspect < 1 ? 30 / aspect : Math.max(h < 430 ? 30 : 26, 40 / aspect);
  }
  function resize() {
    viewWidth = container.clientWidth || 1;
    viewHeight = container.clientHeight || 1;
    labelViewDirty = true;
    const w = viewWidth, h = viewHeight, aspect = w / h, span = frameSpan();
    camera.left = -span * aspect / 2;
    camera.right = span * aspect / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    look.setSize(w, h);
    spaceCam.aspect = aspect;
    spaceCam.updateProjectionMatrix();
  }
  function setLimits() {
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.23;
    controls.minZoom = 0.42;
    controls.maxZoom = 3.2;
  }
  function home() {
    inspection = null;
    if (orbital) { focusSpace(spaceFocus); return; } else {
      camera.position.copy(HOME.pos);
      controls.target.copy(HOME.target);
    }
    camera.zoom = 1;
    camera.updateProjectionMatrix();
    controls.update();
  }

  // ---------- picking and Mark's walk ----------
  let destination = null, waypoints = [], selected = null;
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  let down;
  renderer.domElement.addEventListener("pointerdown", (e) => { down = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 7 || orbital) return;
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(pickables, false).find((h) => h.object.userData.objectId);
    if (hit) onPick(hit.object.userData.objectId);
  });
  function focus(id) {
    if (!objects[id]) return;
    selected = id;
    const g = objects[id].group;
    ring.visible = true;
    ring.position.set(g.position.x, 0.13, g.position.z);
    ring.scale.setScalar(id === "air" ? 3.6 : id === "farm" ? 3 : 2);
    for (const o of Object.values(objects)) o.label.classList.toggle("selected", o === objects[id]);
    const [x, z] = APPROACH[id];
    waypoints = [new THREE.Vector3(mark.position.x, 0, 2.4), new THREE.Vector3(x, 0, 2.4), new THREE.Vector3(x, 0, z)];
    destination = waypoints.shift();
  }

  // ---------- orbit travel ----------
  let diveFrom = null, orbital = false, travelling = false, transStart = 0, transTarget = false, swapped = false, transZoom = 1, flight = 0, inspection = null;
  const flightFrom = new THREE.Vector3(), flightTo = new THREE.Vector3(), flightLook = new THREE.Vector3();
  function switchView(toOrbit) {
    orbital = toOrbit;
    baseWorld.visible = !orbital;
    labelLayer.hidden = orbital;
    spaceWorld.visible = orbital;
    scene.fog = orbital ? null : new THREE.Fog("#cf946e", 55, 120);
    stateRoot.classList.toggle("orbital", orbital);
    controls.enabled = !orbital;
    spaceCtl.enabled = orbital;
    look.setCamera(orbital ? spaceCam : camera);
    resize();
    if (orbital) {
      solar.update(missionSol, CONFIG.missionSols, performance.now(), reduced);
      focusSpace("mars", true);
    } else {
      home();
      camera.zoom = 0.86;
      camera.updateProjectionMatrix();
    }
  }
  function travel(toOrbit) {
    if (travelling || toOrbit === orbital) return false;
    inspection = null;
    travelling = true;
    transStart = performance.now();
    transTarget = toOrbit;
    swapped = false;
    transZoom = camera.zoom;
    controls.enabled = false;
    stateRoot.classList.add("travelling");
    flightFrom.copy(camera.position);
    flightLook.copy(controls.target);
    flightTo.copy(camera.position).multiplyScalar(1.4);
    flightTo.y += 12;
    spaceCtl.enabled = false;
    diveFrom = orbital ? spaceCam.position.clone() : null;
    return true;
  }
  marker.addEventListener("click", () => travel(false));
  controls.addEventListener("change", () => { if (!orbital && !travelling && camera.zoom < 0.47) travel(true); });

  // ---------- render loop ----------
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  setLimits();
  resize();
  home();
  let previous = performance.now(), running = true, paused = false, frameAvg = 16, frameCount = 0;
  const maxRatio = renderer.getPixelRatio(), startedAt = performance.now();
  const projected = new THREE.Vector3(), worldPoint = new THREE.Vector3();
  const baseClip = new THREE.Matrix4(), previousBaseClip = new THREE.Matrix4();
  const labelObjects = Object.values(objects);
  const tagEntries = Object.entries(spaceTags);
  // Performance probe: open the game with #perf to read draw calls and frame time.
  const perf = typeof location !== "undefined" && location.hash.includes("perf") ? { frames: [], fixed: location.hash.includes("fixed") } : null;
  if (perf) { renderer.info.autoReset = false; globalThis.__oneSolPerf = () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, programs: renderer.info.programs.length, geometries: renderer.info.memory.geometries, avgMs: perf.frames.reduce((a, b) => a + b, 0) / Math.max(1, perf.frames.length), pixelRatio: renderer.getPixelRatio(), shadows: perf.shadows }); }
  renderer.setAnimationLoop((now) => {
    if (!running) return;
    if (perf) { perf.frames.push(now - previous); if (perf.frames.length > 120) perf.frames.shift(); renderer.info.reset(); }
    const dt = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (paused) { if (travelling) transStart += dt * 1000; return; }
    if (!travelling && !orbital) controls.update();

    // travel animation
    if (travelling) {
      const duration = reduced ? 500 : 4000, p = Math.min(1, (now - transStart) / duration);
      flight = reduced ? Math.sin(Math.PI * p) * 8 : Math.pow(Math.sin(Math.PI * p), 1.4) * 8;
      if (!swapped && p >= 0.49) { switchView(transTarget); swapped = true; }
      if (!swapped) {
        const e = ease(Math.min(1, p / 0.49));
        if (diveFrom) { // leaving space: dive toward the outpost on Mars
          const c = focusPoint("mars"), d = diveFrom.clone().sub(c);
          spaceCam.position.copy(c).addScaledVector(d.normalize(), Math.exp(THREE.MathUtils.lerp(Math.log(diveFrom.distanceTo(c)), Math.log(RADIUS.mars * 1.02), e)));
          spaceCam.lookAt(c);
        }
        camera.position.lerpVectors(flightFrom, flightTo, e);
        camera.lookAt(flightLook);
        camera.zoom = THREE.MathUtils.lerp(transZoom, 0.48, e);
      } else camera.zoom = THREE.MathUtils.lerp(transTarget ? 1.18 : 0.86, 1, ease(Math.min(1, (p - 0.49) / 0.5)));
      camera.updateProjectionMatrix();
      if (p >= 1) { travelling = false; flight = 0; controls.enabled = !orbital; spaceCtl.enabled = orbital; stateRoot.classList.remove("travelling"); }
    } else flight = 0;
    if (inspection) {
      const p = Math.min(1, (now - inspection.start) / (reduced ? 1 : 900)), e = ease(p);
      controls.target.lerpVectors(inspection.from, inspection.to, e);
      camera.position.lerpVectors(inspection.camFrom, inspection.camTo, e);
      camera.zoom = THREE.MathUtils.lerp(inspection.zoomFrom, 2.15, e);
      camera.updateProjectionMatrix();
      if (p >= 1) inspection = null;
    }

    // atmosphere
    view.night = damp(view.night, view.nightTarget, 1.2, dt);
    view.frost = damp(view.frost, view.frostTarget, view.frostTarget > view.frost ? 0.25 : 0.6, dt);
    view.storm = damp(view.storm, view.stormTarget, 0.9, dt);
    view.flash = damp(view.flash, 0, 2.2, dt);
    if (orbital) {
      scene.background = starTex;
      scene.environmentIntensity = 0.07;
      hemi.intensity = 0.12;
      sun.intensity = 0;
      renderer.toneMappingExposure = 1.05;
      solar.update(missionSol, CONFIG.missionSols, now, reduced);
      solar.setGuides(spaceFocus === "system" ? 1 : spaceFocus === "ship" ? .08 : .45);
      if (focusing && focusAnim) runFocus(now);
      else if (!travelling) spaceCtl.update();
      const dist = spaceCam.position.distanceTo(spaceCtl.target);
      // depth range follows the distance to what we look at, so the 1:1 scale renders cleanly
      // Keep the ship's bow clear of the flight-data panel in the inspection shot.
      const sidebarShare = Math.min(330, viewWidth * .35) / viewWidth;
      spaceCam.filmOffset = spaceFocus === "ship" ? -sidebarShare * spaceCam.getFilmWidth() *
        Math.tan(THREE.MathUtils.degToRad(spaceCam.fov / 2)) * spaceCam.aspect : 0;
      spaceCam.near = Math.max(1e-6, dist * 0.03);
      spaceCam.far = 40000;
      spaceCam.updateProjectionMatrix();
      spaceCam.updateMatrixWorld();
      // ship: a fixed close-up model when focused, otherwise an icon of constant on-screen size
      const shipDist = spaceCam.position.distanceTo(solar.ship.position);
      solar.ship.scale.setScalar(spaceFocus === "ship" ? SHIP_SIZE : Math.max(SHIP_SIZE, shipDist * 0.0032));
      // leaving Mars by flying down to it lands at the base
      if (spaceFocus === "mars" && !focusing && !travelling && dist < RADIUS.mars * 1.16) travel(false);
      const w = viewWidth, h = viewHeight;
      for (const [name, tag] of tagEntries) {
        if (spaceFocus === "ship" || travelling) {
          if (!tag.hidden) tag.hidden = true;
          continue;
        }
        const r = name === "sun" ? SUN_RADIUS : name === "ship" ? 0 : RADIUS[name];
        const p = spaceObject(name).getWorldPosition(projected).addScaledVector(UP, r).project(spaceCam);
        tag.style.left = (p.x * 0.5 + 0.5) * w + "px";
        tag.style.top = (-p.y * 0.5 + 0.5) * h - 6 + "px";
        tag.hidden = p.z > 1 || Math.abs(p.x) > 1.05 || Math.abs(p.y) > 1.05;
      }
      // finder dots only while a body is smaller than a few pixels
      for (const [name, body] of Object.entries(solar.bodies)) body.dot.visible = pxRadius(body.pivot.position, RADIUS[name]) < 2.5;
      solar.sunDot.visible = pxRadius(solar.sun.position, SUN_RADIUS) < 3;
      updateSunFlare();
      const marsC = solar.bodies.mars.planet.getWorldPosition(worldPoint), v = markerAnchor.getWorldPosition(projected);
      const front = v.clone().sub(marsC).dot(spaceCam.position.clone().sub(marsC)) > 0 && pxRadius(marsC, RADIUS.mars) > 40;
      v.project(spaceCam);
      marker.style.left = (v.x * 0.5 + 0.5) * w + "px";
      marker.style.top = (-v.y * 0.5 + 0.5) * h + "px";
      marker.hidden = !front || travelling || v.z > 1;
    } else {
      marker.hidden = true;
      sunFlare.hidden = true;
      // Mars sky: butterscotch by day, blue around dawn and dusk, near-black at night, brown in dust storms.
      const n = view.night, bg = n < 0.6 ? bgColor.copy(SKY.day).lerp(SKY.dusk, n / 0.6) : bgColor.copy(SKY.dusk).lerp(SKY.night, (n - 0.6) / 0.4);
      bg.lerp(SKY.storm, view.storm * 0.7);
      scene.background = bgColor;

      if (scene.fog) { scene.fog.color.copy(bg); scene.fog.near = 55 - view.storm * 25; scene.fog.far = 120 - view.storm * 45; }
      sandPoints.visible = view.storm > .001;
      sandPoints.material.opacity = view.storm * 0.55;
      if (view.storm > 0.01) {
        for (let i = 0; i < sandCount; i++) {
          sand[i * 3] += dt * (9 + (i % 5) * 1.5);
          sand[i * 3 + 1] += Math.sin(now * 0.001 + i) * dt * 0.4;
          if (sand[i * 3] > 40) sand[i * 3] = -40;
        }
        sandGeo.attributes.position.needsUpdate = true;
      }
      updatePanels(dt);
    }

    // Walk cycle follows displacement, including partial steps on arrival.
    let travel=0;
    if (destination) {
      const dx=destination.x-mark.position.x, dz=destination.z-mark.position.z;
      const distance=Math.hypot(dx,dz);
      if (distance<.012) destination=waypoints.shift() ?? null;
      else {
        travel=Math.min(dt*1.65,distance);
        mark.position.x+=dx*travel/distance;
        mark.position.z+=dz*travel/distance;
        const turn=Math.atan2(dx,dz)-mark.rotation.y;
        mark.rotation.y+=Math.atan2(Math.sin(turn),Math.cos(turn))*Math.min(dt*16,1);
      }
    }
    const walking=travel>0;
    mark.userData.step(travel,dt,reduced);
    const followX=mark.position.x+1.1-beep.position.x, followZ=mark.position.z+1-beep.position.z;
    const gap=Math.hypot(followX,followZ);
    if (gap>.025) {
      const fraction=1-Math.exp(-2.2*dt);
      beep.position.x+=followX*fraction;
      beep.position.z+=followZ*fraction;
      const turn=Math.atan2(followX,followZ)-beep.rotation.y;
      beep.rotation.y+=Math.atan2(Math.sin(turn),Math.cos(turn))*Math.min(dt*8,1);
      if (!reduced) beep.userData.roll(gap*fraction);
    }

    // The labels are anchored to static buildings. Only their camera or viewport can move.
    if (!orbital) {
      camera.updateMatrixWorld();
      baseClip.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      if (labelViewDirty || !baseClip.equals(previousBaseClip)) {
        previousBaseClip.copy(baseClip);
        labelViewDirty = false;
        for (const obj of labelObjects) {
          projected.copy(obj.group.position);
          projected.y = obj.height;
          projected.applyMatrix4(baseClip);
          obj.label.style.left = (projected.x * .5 + .5) * viewWidth + "px";
          obj.label.style.top = (-projected.y * .5 + .5) * viewHeight + "px";
          obj.label.hidden = Math.abs(projected.x) > 1 || Math.abs(projected.y) > 1;
        }
      }
    }

    // Shadows are only re-rendered when something moves.
    if (!orbital && ((walking && frameCount % 2 === 0) || travelling || panelsMoving || shadowFrames > 0)) {
      renderer.shadowMap.needsUpdate = true;
      if (perf) perf.shadows = (perf.shadows ?? 0) + 1;
      shadowFrames = Math.max(0, shadowFrames - 1);
    }
    // Resolution safety net: only drops below the device ratio when frames stay slow.
    frameAvg = frameAvg * 0.95 + dt * 1000 * 0.05;
    if (++frameCount % 90 === 0 && !low && now - startedAt > 6000 && !perf?.fixed) {
      const ratio = renderer.getPixelRatio();
      const next = frameAvg > 24 ? Math.max(Math.min(1.25, maxRatio), ratio - 0.25) : frameAvg < 13 ? Math.min(maxRatio, ratio + 0.25) : ratio;
      if (next !== ratio) { renderer.setPixelRatio(next); look.setPixelRatio(next); resize(); shadowFrames = 1; }
    }
    if (!orbital) {
      // The antenna slews once to acquire a link, then holds its bearing.
      const gimbal = groups.comms.userData.gimbal;
      const bearing = view.radioActive ? 1.73 : 2.35;
      const tracking=Math.abs(gimbal.rotation.y-bearing)>.003;
      if(tracking && frameCount%4===0) shadowFrames=1;
      gimbal.rotation.y = reduced || !tracking ? bearing : damp(gimbal.rotation.y,bearing,1.5,dt);
      const carriage = groups.repair.userData.carriage;
      if (!reduced && view.repairActive) carriage.position.x = Math.sin(now * .0008) * .9;
      groups.farm.userData.growLights.emissiveIntensity = view.farmActive ? 2.2 : .25;
      const light = groups.air.userData.entryLight;
      light.emissive.setHex(view.alarm ? 0xff552c : 0xffba69);
      light.emissiveIntensity = view.alarm && !reduced
        ? 1.5 + 0.9 * Math.sin(now * 0.003)
        : 1.1 + view.night;
    }
    const dustStrength = flight > 0 ? flight : orbital ? 0 : view.storm * 1.35;
    look.render(now, { frost: view.frost, night: view.night, storm: orbital ? 0 : view.storm, orbital, flight, flash: view.flash, alarm: view.alarm,
      dust: [renderDust, now, dustStrength, flight] });
  });

  const PHASE_NIGHT = { morning: 0.3, day: 0, evening: 0.55, night: 1 };
  // Frost forms in the cold night and burns off during the day (seen by Viking Lander 2).
  const PHASE_FROST = { morning: 0.75, day: 0, evening: 0.15, night: 1 };
  const WEATHER = { clear: 0, dusty: 0.32, storm: 1 };
  return {
    /** Apply the visible parts of STATE. */
    setState(state) {
      if (!state) return;
      view.radioActive = state.phase === "day" && state.alloc?.comms > 0;
      view.repairActive = state.phase === "day" && state.alloc?.repair > 0;
      view.farmActive = state.alloc?.farm > 0;
      missionSol = state.sol ?? missionSol;
      if (state.site && state.site !== currentSite) { currentSite = state.site; placeMarker(state.site); }
      view.nightTarget = PHASE_NIGHT[state.phase] ?? 0;
      view.frostTarget = state.weather === "storm" ? 0 : PHASE_FROST[state.phase] ?? 0;
      view.stormTarget = WEATHER[state.weather] ?? 0;
      view.broken = state.panels?.broken ?? 0;
      view.dusty = state.panels?.dusty ?? 0;
      view.alarm = Boolean(state.scrubberBroken) || state.damage > 50;
      const crop = state.crop;
      const total = crop && { lettuce: 4, radish: 5, potato: 8 }[crop.type];
      setCrop(total ? Math.min(1, crop.progress / total) : 0.15);
    },
    setLabels(map) {
      for (const [id, obj] of Object.entries(objects)) obj.label.textContent = map[id] ?? id;
      marker.textContent = map.marker ?? "";
      for (const [name, tag] of Object.entries(spaceTags)) tag.textContent = map["space." + name] ?? name;
    },
    setFolded(value) { view.folded = value; },
    setPaused(value) { paused = value; },
    flare() { view.flash = 1; },
    focus,
    zoom(factor) {
      if (travelling) return;
      if (!orbital && factor < 1 && camera.zoom <= 0.6) { travel(true); return; }
      if (orbital) { // dolly the space camera
        const d = spaceCam.position.clone().sub(spaceCtl.target), len = THREE.MathUtils.clamp(d.length() / factor, spaceCtl.minDistance, spaceCtl.maxDistance);
        spaceCam.position.copy(spaceCtl.target).addScaledVector(d.normalize(), len);
        return;
      }
      camera.zoom = THREE.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom);
      camera.updateProjectionMatrix();
    },
    home,
    travel,
    inspect(id) {
      if (orbital || travelling || !objects[id]) return;
      const g = objects[id].group, to = new THREE.Vector3(g.position.x, 1.2, g.position.z), off = camera.position.clone().sub(controls.target);
      inspection = { start: performance.now(), from: controls.target.clone(), to, camFrom: camera.position.clone(), camTo: to.clone().add(off), zoomFrom: camera.zoom };
    },
    get orbital() { return orbital; },
    focusSpace,
    get spaceFocus() { return spaceFocus; },
    dispose() { running = false; ro.disconnect(); renderer.setAnimationLoop(null); renderer.dispose(); },
  };
}
