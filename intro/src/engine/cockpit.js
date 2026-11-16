// @ts-nocheck
// Tulpar cockpit: navy interior lit by soft light-blue screens. No letters or numbers anywhere.
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function buildCockpit(THREE, {charactersBuilder, crewAccent, cmdBand}) {
  const root = new THREE.Group(); root.name = 'Cockpit';
  const M = (c, o = {}) => new THREE.MeshStandardMaterial({color: c, roughness: .6, ...o});
  const navy = M('#172f56', {roughness: .7}), deep = M('#0d1b30', {roughness: .8}), trim = M('#c9cbc4', {roughness: .5, metalness: .2}), seatM = M('#3a4a63', {roughness: .9});
  const add = (geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, p = root) => {const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); o.castShadow = o.receiveShadow = true; p.add(o); return o;};
  // shell: rounded cabin (cylinder interior)
  const shell = add(new THREE.CylinderGeometry(2.2, 2.2, 3.4, 40, 1, true), navy, 0, 1.5, 0); shell.material = navy.clone(); shell.material.side = THREE.BackSide;
  add(new THREE.CircleGeometry(2.2, 40), deep, 0, -.2, 0, -Math.PI / 2);
  add(new THREE.CircleGeometry(2.2, 40), navy, 0, 3.2, 0, Math.PI / 2);
  for (const y of [.4, 1.6, 2.8]) add(new THREE.TorusGeometry(2.18, .03, 6, 60), trim, 0, y, 0, Math.PI / 2);
  // window looking out into the brown haze
  const winTex = (() => {const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, '#6e4330'); g.addColorStop(.6, '#a2683f'); g.addColorStop(1, '#7a4a2f'); x.fillStyle = g; x.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;})();
  const winMat = new THREE.MeshBasicMaterial({map: winTex});
  const win = add(new THREE.PlaneGeometry(1.5, .7), winMat, 0, 2.15, 2.12, 0, Math.PI, 0); win.castShadow = false;
  add(new THREE.TorusGeometry(.5, .04, 8, 4, Math.PI * 2), trim, 0, 2.15, 2.1, 0, 0, Math.PI / 4).scale.set(1.55, .73, 1);
  // console
  add(new RoundedBoxGeometry(2.6, .9, .9, 3, .12), deep, 0, .75, 1.6);
  const slope = add(new RoundedBoxGeometry(2.4, .08, .8, 2, .03), navy, 0, 1.28, 1.45, -.55);
  // screens (soft light blue, abstract graphics only)
  const screenTex = (draw) => {const c = document.createElement('canvas'); c.width = 512; c.height = 288; const x = c.getContext('2d'); x.fillStyle = '#0f2340'; x.fillRect(0, 0, 512, 288); draw(x); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;};
  const glowScreen = (t, I = .9) => new THREE.MeshStandardMaterial({color: '#000000', map: t, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: I, roughness: .3});
  const blue = '#abd0ff';
  const sideA = screenTex(x => {x.strokeStyle = blue; x.lineWidth = 6; x.globalAlpha = .9; x.beginPath(); for (let i = 0; i <= 50; i++) {const X = 30 + i * 9, Y = 160 + Math.sin(i * .5) * 50 * Math.exp(-i * .02); i ? x.lineTo(X, Y) : x.moveTo(X, Y);} x.stroke();
    x.globalAlpha = .35; for (let i = 0; i < 6; i++) x.fillRect(30, 30 + i * 40, 452, 2);});
  const sideB = screenTex(x => {x.fillStyle = blue; x.globalAlpha = .85; x.beginPath(); x.arc(256, 150, 95, 0, 7); x.lineWidth = 10; x.strokeStyle = blue; x.stroke(); x.beginPath(); x.moveTo(256, 150); x.arc(256, 150, 95, -Math.PI / 2, .9); x.fill();});
  add(new THREE.PlaneGeometry(.62, .35), glowScreen(sideA), -.85, 1.34, 1.47, -.55 - Math.PI / 2 + Math.PI / 2, 0, 0).rotation.set(-1.0, 0, 0);
  add(new THREE.PlaneGeometry(.62, .35), glowScreen(sideB), .85, 1.34, 1.47).rotation.set(-1.0, 0, 0);
  // crew status panel: five round icons (state drawn per frame)
  const stC = document.createElement('canvas'); stC.width = 640; stC.height = 300; const stX = stC.getContext('2d');
  const stT = new THREE.CanvasTexture(stC); stT.colorSpace = THREE.SRGBColorSpace;
  const statusMat = glowScreen(stT, 1.0);
  const status = add(new THREE.PlaneGeometry(.78, .37), statusMat, 0, 1.72, 1.78); status.rotation.set(-.35, Math.PI, 0); status.rotation.y = Math.PI; status.rotation.set(.35, Math.PI, 0);
  status.lookAt(0, 1.45, 0);
  function drawStatus(t) {
    const x = stX; x.fillStyle = '#0f2340'; x.fillRect(0, 0, 640, 300);
    x.strokeStyle = blue; x.globalAlpha = .5; x.lineWidth = 4; x.strokeRect(14, 14, 612, 272); x.globalAlpha = 1;
    for (let i = 0; i < 5; i++) {
      const cx = 80 + i * 120, cy = 150, grey = i === 4;
      const pulse = grey ? .55 + .45 * (0.5 + 0.5 * Math.sin(t * 4)) : 1;
      x.fillStyle = grey ? `rgba(130,140,150,${.5 + .3 * pulse})` : '#57e08a';
      x.beginPath(); x.arc(cx, cy, 44, 0, 7); x.fill();
      // simple helmet silhouette inside each icon (no letters)
      x.fillStyle = '#0f2340'; x.beginPath(); x.arc(cx, cy - 6, 20, 0, 7); x.fill();
      x.fillRect(cx - 22, cy + 16, 44, 12);
      x.fillStyle = grey ? '#9aa3ad' : '#c9ffd9'; x.beginPath(); x.ellipse(cx, cy - 6, 13, 9, 0, 0, 7); x.fill();
      if (grey) {x.strokeStyle = `rgba(171,208,255,${.4 + .5 * pulse})`; x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, 54, 0, 7); x.stroke();}
    }
    stT.needsUpdate = true;
  }
  drawStatus(0);
  // launch control: large round button under a hinged guard
  const btnBase = add(new THREE.CylinderGeometry(.13, .14, .04, 32), trim, 0, 1.33, 1.25);
  btnBase.rotation.x = -.55;
  const btnMat = new THREE.MeshStandardMaterial({color: '#ffb46a', emissive: '#ff8a2a', emissiveIntensity: .6, roughness: .35});
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(.095, .1, .05, 32), btnMat); btn.position.y = .04; btnBase.add(btn);
  const guard = new THREE.Mesh(new THREE.TorusGeometry(.125, .012, 8, 32, Math.PI), trim); guard.rotation.x = Math.PI / 2; guard.position.y = .03; btnBase.add(guard);
  // seats
  const seat = (x, z, ry) => {const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); add(new RoundedBoxGeometry(.7, .14, .7, 2, .05), seatM, 0, .48, 0, 0, 0, 0, g); add(new RoundedBoxGeometry(.7, .9, .14, 2, .05), seatM, 0, .95, -.35, -.12, 0, 0, g); add(new THREE.CylinderGeometry(.05, .05, .45, 10), trim, 0, .24, 0, 0, 0, 0, g); return g;};
  seat(0, .55, 0); seat(-1.05, -.25, .3); seat(1.05, -.25, -.3); seat(-.5, -1.1, .15); seat(.5, -1.1, -.15);
  // crew: commander (front) + three seated behind
  const people = [];
  for (let i = 0; i < 4; i++) {const c = new THREE.Group(), d = new THREE.Group(); charactersBuilder(c, d);
    c.traverse(o => {if (o.isMesh && o.material?.name === 'suit_accent') o.material = crewAccent; if (o.isMesh) o.castShadow = o.receiveShadow = true;});
    if (i === 0) for (const a of c.userData.joints.arms) {const band = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .07, 16), cmdBand); band.position.y = -.07; a.shoulder.add(band);}
    root.add(c); people.push(c);}
  // interior lights: cool screen glow + warm haze from the window
  const screenLight = new THREE.PointLight('#abd0ff', 1.3, 6, 1.4); screenLight.position.set(0, 1.6, 1.1); root.add(screenLight);
  const fill = new THREE.PointLight('#5b7fc0', .9, 8, 1.4); fill.position.set(0, 2.6, -1); root.add(fill);
  const warm = new THREE.SpotLight('#ffb37a', 2.5, 7, .7, .7, 1.2); warm.position.set(0, 2.2, 2); warm.target.position.set(0, 1, 0); root.add(warm, warm.target);
  const rim = new THREE.PointLight('#ffc38d', 1.2, 5, 1.5); rim.position.set(-1.2, 2.3, -1.3); root.add(rim);
  return {root, people, btn, btnMat, btnBase, drawStatus, statusMat, screenLight, warm, winMat};
}
