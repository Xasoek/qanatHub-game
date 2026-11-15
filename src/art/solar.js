import { buildSunkar } from './sunkar.js';
// Solar-system view: Sun, planets, the Earth–Mars transfer orbit and the rescue ship "Sunkar".
// Inner orbits (Mercury–Mars) are to scale with each other; planet sizes and outer distances are not.
import { ORBITS, missionSnapshot, transferPath } from "./orbits.js";
import { EARTH_CLOUDS } from "./assets/earth-clouds.js";
import { EARTH_MAP } from "./assets/earth-map.js";

// Readable scale: inner orbits keep their true proportions; planets are enlarged and the outer planets moved closer.
export const AU = 20; // scene units per astronomical unit (inner system)
// outer planets at 60% of their real distance
const OUTER_SHARE = 0.6;
const OUTER = Object.fromEntries(["jupiter", "saturn", "uranus", "neptune"].map((n) => [n, ORBITS[n].a * AU * OUTER_SHARE]));
export const SUN_RADIUS = 1.5;
export const RADIUS = { mercury: 0.22, venus: 0.42, earth: 0.62, mars: 0.5, jupiter: 1.6, saturn: 1.35, uranus: 0.9, neptune: 0.88 };
const SIZE = RADIUS;
const COLOR = { mercury: "#9c8f84", venus: "#e3c58f", jupiter: "#d6b48c", saturn: "#e3cf9f", uranus: "#a9dbe0", neptune: "#5f86d6" };
const toScene = (THREE, p) => new THREE.Vector3(p.x * AU, 0, -p.y * AU);

export function createSolarSystem(THREE, { marsMap }) {
  const root = new THREE.Group();
  root.name = "solar-system";
  const light = new THREE.PointLight("#fff2dc", 3.2, 0, 0);
  // soft fill so the night side stays readable when the Sun is behind the planet
  root.add(light, new THREE.AmbientLight("#4f5d78", 1.35));

  // Sun with a soft glow
  const sunDot = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3)), new THREE.PointsMaterial({ color: "#ffd27a", size: 9, sizeAttenuation: false }));
  root.add(sunDot);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 48, 24), new THREE.MeshBasicMaterial({ color: "#ffd27a" }));
  root.add(sun);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS * 3.5, 32, 16), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    vertexShader: "varying vec3 vN;varying vec3 vP;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vP=p.xyz;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*p;}",
    fragmentShader: "varying vec3 vN;varying vec3 vP;void main(){float a=pow(abs(dot(normalize(vN),normalize(-vP))),2.5);gl_FragColor=vec4(1.,.72,.35,a*.55);}",
  }));
  root.add(glow);

  const guides = [];
  const ring = (r, color, opacity) => {
    const pts = [];
    for (let i = 0; i < 160; i++) { const a = (i / 160) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    root.add(line);
    line.userData.baseOpacity = opacity;
    guides.push(line);
    return line;
  };

  const bodies = {};
  let cloudShell;
  for (const name of Object.keys(ORBITS)) {
    const r = OUTER[name] ?? ORBITS[name].a * AU;
    ring(r, name === "earth" ? "#7fb6ff" : name === "mars" ? "#ff9d6b" : "#8aa0b8", name === "earth" || name === "mars" ? 0.55 : 0.22);
    const pivot = new THREE.Group();
    root.add(pivot);
    let mat;
    if (name === "mars") {
      mat = new THREE.MeshStandardMaterial({ color: "#c99370", roughness: 0.94 });
      const tex = new THREE.TextureLoader().load(marsMap, () => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; mat.color.set("#ffffff"); mat.map = tex; mat.needsUpdate = true; });
    } else if (name === "earth") {
      // Blue Marble surface and our precomputed procedural clouds.
      const clouds = new THREE.TextureLoader().load(EARTH_CLOUDS);
      clouds.colorSpace = THREE.SRGBColorSpace;
      mat = new THREE.MeshStandardMaterial({ color: "#7aa0c8", roughness: 0.62, metalness: 0.02 });
      const tex = new THREE.TextureLoader().load(EARTH_MAP, () => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; mat.color.set("#ffffff"); mat.map = tex; mat.needsUpdate = true; });
      cloudShell = new THREE.Mesh(new THREE.SphereGeometry(SIZE.earth * 1.02, 64, 32), new THREE.MeshStandardMaterial({ map: clouds, transparent: true, depthWrite: false, roughness: 1 }));
      cloudShell.name = "clouds";
      pivot.add(cloudShell);
      const moon = new THREE.Mesh(new THREE.SphereGeometry(0.17, 32, 16), new THREE.MeshStandardMaterial({ color: "#b8b6b0", roughness: 1 }));
      moon.name = "moon";
      moon.position.set(1.25, 0.1, 0.3);
      pivot.add(moon);
    } else mat = new THREE.MeshStandardMaterial({ color: COLOR[name], roughness: 0.85 });
    const planet = new THREE.Mesh(new THREE.SphereGeometry(SIZE[name], name === "mars" || name === "earth" ? 96 : 32, name === "mars" || name === "earth" ? 64 : 16), mat);
    planet.name = name;
    pivot.add(planet);
    if (name === "saturn") {
      const rings = new THREE.Mesh(new THREE.RingGeometry(SIZE.saturn * 1.35, SIZE.saturn * 2.2, 64), new THREE.MeshStandardMaterial({ color: "#d9c79a", side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
      rings.rotation.x = -Math.PI / 2 + 0.45;
      pivot.add(rings);
    }
    if (name === "mars" || name === "earth") {
      const atmo = new THREE.Mesh(new THREE.SphereGeometry(SIZE[name] * 1.07, 48, 24), new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
        uniforms: { tint: { value: new THREE.Color(name === "earth" ? "#5fa8ff" : "#d4643a") } },
        vertexShader: "varying vec3 vN;varying vec3 vP;void main(){vec4 p=modelViewMatrix*vec4(position,1.);vP=p.xyz;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*p;}",
        fragmentShader: "uniform vec3 tint;varying vec3 vN;varying vec3 vP;void main(){float a=pow(1.-abs(dot(normalize(vN),normalize(-vP))),3.);gl_FragColor=vec4(tint,a*.35);}",
      }));
      pivot.add(atmo);
    }
    // a small fixed-size dot so the planet can be found when it is smaller than a pixel
    const dot = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3)), new THREE.PointsMaterial({ color: name === "earth" ? "#7fb6ff" : name === "mars" ? "#ff9d6b" : COLOR[name], size: 6, sizeAttenuation: false }));
    pivot.add(dot);
    bodies[name] = { pivot, planet, dot, radius: OUTER[name] ?? ORBITS[name].a * AU };
  }

  // transfer orbit: travelled part solid, the rest dashed
  const path = transferPath();
  const travelled = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: "#ffd98f", transparent: true, opacity: 0.95 }));
  const ahead = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: "#ffd98f", dashSize: 0.5, gapSize: 0.35, transparent: true, opacity: 0.7 }));
  root.add(travelled, ahead);
  travelled.userData.baseOpacity = 0.95;
  ahead.userData.baseOpacity = 0.7;
  guides.push(travelled, ahead);

  const { ship, animate } = buildSunkar(THREE);
  ship.scale.setScalar(0.32);
  root.add(ship);

  let lastSol = null;
  function update(sol, missionSols, now, reduced = false) {
    if (sol !== lastSol) {
      lastSol = sol;
      const m = missionSnapshot(sol, missionSols);
      for (const [name, body] of Object.entries(bodies)) {
        const a = m.planetAngle(name);
        body.pivot.position.set(Math.cos(a) * body.radius, 0, -Math.sin(a) * body.radius);
      }
      const done = path.filter((p) => p.nu <= m.nu).map((p) => toScene(THREE, p));
      done.push(toScene(THREE, m.ship));
      const rest = [toScene(THREE, m.ship), ...path.filter((p) => p.nu > m.nu).map((p) => toScene(THREE, p))];
      travelled.geometry.dispose();
      travelled.geometry = new THREE.BufferGeometry().setFromPoints(done);
      ahead.geometry.dispose();
      ahead.geometry = new THREE.BufferGeometry().setFromPoints(rest.length > 1 ? rest : [rest[0], rest[0]]);
      ahead.computeLineDistances();
      ship.position.copy(toScene(THREE, m.ship));
      ship.position.y = 0.35;
      // heading along the orbit: perpendicular to the radius, tilted by the flight-path angle
      const e = (ORBITS.mars.a - 1) / (ORBITS.mars.a + 1), gamma = Math.atan2(e * Math.sin(m.nu), 1 + e * Math.cos(m.nu));
      ship.rotation.y = m.nu + Math.PI / 2 - gamma;
    }
    bodies.earth.planet.rotation.y = now * 0.00012;
    cloudShell.rotation.y = now * 0.00016;
    animate(now, reduced);
  }

  // orbit and trajectory lines are always shown; close-ups dim them so they don't dominate the frame
  let guideStrength = 1;
  function setGuides(strength) {
    if (guideStrength === strength) return;
    guideStrength = strength;
    for (const guide of guides) guide.material.opacity = guide.userData.baseOpacity * strength;
  }
  return { root, bodies, ship, sun, sunDot, update, setGuides };
}
