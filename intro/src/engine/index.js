// @ts-nocheck
// Film engine: renders any frame of the 40 s intro deterministically, with 12-frame cross-dissolves.
import {createWorld} from './world.js';
import {SHOT_FNS} from './shots.js';
import {SHOTS, TRANS, FPS} from './layout.js';

export async function createFilm(glCanvas, outCanvas, opts = {}) {
  const W = await createWorld(glCanvas, opts);
  const {THREE} = W;
  // pixel-eye face uses map + emissiveMap (no alpha)
  W.faceMat.transparent = false; W.faceMat.alphaMap = null; W.faceMat.color.set('#ffffff'); W.faceMat.emissiveIntensity = 1.3;
  // vent spot on top of the dome for the crew member checking it
  const habBox = new THREE.Box3().setFromObject(W.groups.hab);
  W.ventY = habBox.max.y - 1.15;
  // amber "oxygen" icon on Mark's helmet display (an icon, never letters)
  {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    x.strokeStyle = '#ffb347'; x.fillStyle = '#ffb347'; x.lineWidth = 6;
    x.beginPath(); x.arc(32, 32, 26, 0, 7); x.stroke();
    for (const [bx, by, r] of [[26, 38, 8], [38, 26, 6], [40, 41, 4]]) {x.beginPath(); x.arc(bx, by, r, 0, 7); x.fill();}
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.MeshBasicMaterial({map: t, transparent: true, toneMapped: false, depthWrite: false, color: new THREE.Color(2.2, 2.2, 2.2)});
    const icon = new THREE.Mesh(new THREE.PlaneGeometry(.075, .075), m);
    icon.position.set(.17, 1.72, .30); icon.rotation.y = .5; icon.visible = false;
    W.mark.add(icon); W.o2 = icon;
  }
  const out = outCanvas.getContext('2d');
  const snap = document.createElement('canvas'); snap.width = outCanvas.width; snap.height = outCanvas.height; const sx = snap.getContext('2d');

  function renderShot(id, t, frame) {
    const o = SHOT_FNS[id](W, t);
    W.sky.uniforms.uTime.value = frame / FPS;
    W.sky.mesh.position.copy(W.camera.position);
    const now = frame / FPS * 1000;
    W.look.render(now, {...o, dust: [W.dust.render, now, 1, 0]});
  }
  function plan(frame) {
    const list = [];
    for (let i = 0; i < SHOTS.length; i++) {
      const s = SHOTS[i];
      if (frame >= s.start && frame < s.end) list.push({id: s.id, t: frame - s.start, w: 1});
    }
    // cross-dissolve windows centred on each cut
    for (let i = 1; i < SHOTS.length; i++) {
      const b = SHOTS[i].start, a = SHOTS[i - 1];
      if (frame >= b - TRANS / 2 && frame < b + TRANS / 2) {
        const w = (frame - (b - TRANS / 2) + .5) / TRANS; // weight of the incoming shot
        return [{id: a.id, t: frame - a.start, w: 1 - w}, {id: SHOTS[i].id, t: frame - SHOTS[i].start, w}];
      }
    }
    return list;
  }
  function renderFrame(frame) {
    const p = plan(frame);
    if (p.length === 1) {renderShot(p[0].id, p[0].t, frame); out.globalAlpha = 1; out.drawImage(glCanvas, 0, 0, outCanvas.width, outCanvas.height); return p;}
    const ease = (x) => x * x * (3 - 2 * x);
    renderShot(p[0].id, p[0].t, frame); sx.globalAlpha = 1; sx.drawImage(glCanvas, 0, 0, snap.width, snap.height);
    renderShot(p[1].id, p[1].t, frame);
    out.globalAlpha = 1; out.drawImage(snap, 0, 0);
    out.globalAlpha = ease(p[1].w); out.drawImage(glCanvas, 0, 0, outCanvas.width, outCanvas.height); out.globalAlpha = 1;
    return p;
  }
  return {renderFrame, W};
}
