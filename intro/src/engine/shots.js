// @ts-nocheck
// Five-shot choreography. Every function is a pure function of the shot-local frame t (24 fps),
// so frames render identically in any order (parallel rendering).
import {POSES, mixPose, applyPose, gait, place, clamp, lerp, ease, easeInOut, easeOut, easeIn, seg, yawTo} from './pose.js';
import {RAVINE, MAST} from './layout.js';

const PAD_Y = .045;
const V3 = (W, x, y, z) => new W.THREE.Vector3(x, y, z);
const gy = (W, x, z) => W.heightAt(x, z) + PAD_Y;

function setCam(W, pos, look, fov = 32) {
  W.camera.fov = fov; W.camera.updateProjectionMatrix();
  W.camera.position.copy(pos); W.camera.lookAt(look);
}
function bez(a, b, c, d, t) { // cubic bezier on THREE vectors
  const u = 1 - t; return a.clone().multiplyScalar(u * u * u).add(b.clone().multiplyScalar(3 * u * u * t)).add(c.clone().multiplyScalar(3 * u * t * t)).add(d.clone().multiplyScalar(t * t * t));
}
function headPos(W, char) {char.updateMatrixWorld(true); return char.localToWorld(V3(W, 0, 1.66, 0));}

// ---------- environment presets ----------
function env(W, o) {
  const {sky, scene, sun, hemi, dust} = W;
  const u = sky.uniforms;
  u.uTop.value.set(o.top ?? '#e9b98c'); u.uHorizon.value.set(o.horizon ?? '#f6d2a8');
  u.uSunVis.value = o.sunVis ?? 1; u.uSunGlow.value = o.sunGlow ?? 1; u.uSunSize.value = o.sunSize ?? .012;
  u.uBand.value = o.band ?? 0; u.uCover.value = o.cover ?? 0; u.uCoverColor.value.set(o.coverColor ?? '#8a5634');
  u.uBandColor.value.set(o.bandColor ?? '#6b3c24');
  const fogC = o.fog ?? o.horizon ?? '#f6d2a8';
  scene.fog.color.set(fogC); scene.fog.near = o.fogNear ?? 60; scene.fog.far = o.fogFar ?? 160; scene.background.set(fogC);
  dust.params.depth = W.look.gtao.depthTexture; dust.params.strength = o.dust ?? 0; dust.params.front = o.front ?? 60; dust.params.start = o.dStart ?? 2; dust.params.step = o.dStep ?? 3.2; dust.params.dark = o.dDark ?? 0; dust.params.ceil = o.dCeil ?? 16;
  // sun direction / shadow framing
  const sd = sky.uniforms.uSunDir.value;
  const target = o.target ?? V3(W, 10, 0, 0);
  sun.target.position.copy(target); sun.position.copy(target).addScaledVector(sd, 45);
  sun.shadow.camera.left = -(o.shadowR ?? 30); sun.shadow.camera.right = o.shadowR ?? 30; sun.shadow.camera.top = o.shadowR ?? 30; sun.shadow.camera.bottom = -(o.shadowR ?? 30);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 120; sun.shadow.camera.updateProjectionMatrix();
  sun.target.updateMatrixWorld();
  W.amberMat.emissiveIntensity = o.amber ?? .2; W.amberLights.forEach(l => l.intensity = (o.amber ?? 0) * 2.2);
  W.bokeh.enabled = !!o.dof; if (o.dof) {W.bokeh.uniforms.focus.value = o.dof.focus; W.bokeh.uniforms.aperture.value = o.dof.aperture; W.bokeh.uniforms.maxblur.value = o.dof.maxblur ?? .012;}
  W.visorMat.envMap = o.visorEnv != null ? W.visorEnvs[o.visorEnv] : W.visorBase; W.visorMat.envMapIntensity = o.visorEnv != null ? 2.2 : 1.6;
  W.visorMat.needsUpdate = true;
}
const DAY = {top: '#eab88a', horizon: '#f7d3a7', sunVis: 1};

// ---------- reset per frame ----------
function resetActors(W) {
  W.cockpit.root.visible = false;
  for (const c of [W.mark, ...W.crew]) {c.visible = true; c.rotation.set(0, 0, 0);}
  W.beep.visible = true; W.props.crate.visible = false; W.props.tools.forEach(t => t.visible = false);
  W.scorch.visible = false; W.ascent.position.set(0, 0, 0); W.engineFlame.visible = false; W.engineLight.intensity = 0;
  W.headlamp.intensity = 0; W.lampLens.material.emissiveIntensity = 0;
  setFace(W, 'normal');
  // weather mast stands in all exterior shots
  W.props.mast.position.set(MAST[0], gy(W, MAST[0], MAST[1]), MAST[1]);
  W.props.line.poles.forEach(p => {p.visible = true; p.userData.clip.position.set(0, .98, .045); p.userData.clip.rotation.set(0, 0, 0);});
  W.props.line.rope.visible = true; setRope(W, 0, 0);
  if (W.o2) W.o2.visible = false;
}
function setFace(W, name) {const f = W.faces[name]; W.faceMat.map = f.map; W.faceMat.emissiveMap = f.glow; W.faceMat.needsUpdate = true;}

// rope through the clips; slack (0..1) lets the section after the broken clip sag to the ground
function setRope(W, slack, swing) {
  const {THREE} = W; const poles = W.props.line.poles, pts = [];
  const MASTP = V3(W, MAST[0] - .1, gy(W, MAST[0], MAST[1]) + .95, MAST[1]);
  const clips = poles.map(p => p.position.clone().add(V3(W, 0, .98, .06)));
  const chain = [MASTP, ...clips];
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i], b = chain[i + 1];
    for (let k = 0; k < 12; k++) {
      const t = k / 12; const p = a.clone().lerp(b, t);
      let sag = Math.sin(t * Math.PI) * .07;
      // section 2..3 (between poles 1 and 2) loses its clip at pole index 2 → hangs low
      if (i >= 2) {const dropAmt = slack * (i === 2 ? t : 1 - t * .7); const g0 = W.heightAt(p.x, p.z) + .07; p.y = lerp(p.y - sag, g0, ease(dropAmt)); p.z += Math.sin(t * Math.PI) * swing * .25;}
      else p.y -= sag;
      pts.push(p);
    }
  }
  pts.push(chain[chain.length - 1].clone());
  const curve = new THREE.CatmullRomCurve3(pts);
  W.props.line.rope.geometry.dispose();
  W.props.line.rope.geometry = new THREE.TubeGeometry(curve, 160, .022, 6, false);
}

// ---------- characters: common blocking ----------
const MARK_SPOT = [MAST[0] - .75, MAST[1] + .05];
const BEEP_HOME = [MAST[0] - .55, MAST[1] + 1.05];

function markCrouched(W, yaw = Math.PI / 2) {
  const p = POSES.crouch; applyPose(W.mark, p);
  place(W.mark, MARK_SPOT[0], gy(W, ...MARK_SPOT) - p.drop, MARK_SPOT[1], yaw, p.lean);
}
function beepAt(W, x, z, yaw, pitch = 0) {place(W.beep, x, gy(W, x, z), z, yaw, pitch);}
function spinWheels(W, d) {for (const w of W.beep.userData.parts.wheels) w.rotation.x = (d / .105) % (Math.PI * 2);}

// Crew positions in the ordinary day
const CREW_DAY = [
  {x: 10.9, z: 6.4, yaw: -2.3, pose: 'work'}, // commander at the rover
  {x: 8.0, z: 6.9, yaw: 2.6, pose: 'work'},   // by the rover
  {x: -0.3, z: -2.2, yaw: Math.PI / 2, pose: 'reachUp', y: 0}, // at the dome vent (y set below)
  {x: -1.2, z: 4.6, yaw: Math.PI, pose: 'carry'},  // carrying a crate
];
function crewDay(W, t) {
  W.crew.forEach((c, i) => {
    const d = CREW_DAY[i];
    let p = POSES[d.pose];
    if (d.pose === 'work') p = mixPose(p, POSES.stand, .25 + .25 * Math.sin(t * .09 + i * 2));
    if (d.pose === 'reachUp') p = mixPose(p, POSES.stand, .2 + .2 * Math.sin(t * .11));
    applyPose(c, p);
    let x = d.x, z = d.z;
    if (d.pose === 'carry') {
      const speed = .9 / 24; // slow low-gravity step
      z = d.z - t * speed; const ph = t * speed / .9 * 1.1;
      const g = gait(ph, {lift: .14, reach: .9});
      applyPose(c, {...g, sh: [-.75, -.75], shz: [.05, -.05], el: [-.75, -.75]});
      const bob = Math.abs(Math.sin(ph * Math.PI * 2)) * .06;
      place(c, x, gy(W, x, z) + bob, z, d.yaw);
      const crate = W.props.crate; crate.visible = true; c.updateMatrixWorld(true);
      crate.position.copy(c.localToWorld(V3(W, 0, 1.0, .42))); crate.rotation.set(0, d.yaw, 0);
      return;
    }
    const y = d.pose === 'reachUp' ? W.ventY : gy(W, x, z) - (p.drop ?? 0);
    place(c, x, y, z, d.yaw, p.lean ?? 0);
  });
  // tools in the rover crew's hands
  [0, 1].forEach(i => {const tool = W.props.tools[i]; tool.visible = true; const hand = W.crew[i].userData.joints.arms[1].elbow; hand.updateMatrixWorld(true);
    tool.position.copy(hand.localToWorld(V3(W, 0, -.3, .05))); tool.quaternion.setFromRotationMatrix(hand.matrixWorld); tool.rotateX(-1.3);});
}

// =============== SHOT 1 — ORDINARY DAY (0–168) ===============
function shot1(W, t) {
  resetActors(W);
  const T = 168, k = easeInOut(clamp(t / T));
  const cam = bez(V3(W, -4, 24, 36), V3(W, 10, 19, 30), V3(W, 33, 7, 13), V3(W, 35.6, 2.5, 7.0), k);
  const look = bez(V3(W, 4, 0, 0), V3(W, 10, 0, 0), V3(W, 22, 1, 0), V3(W, 24.5, 1.7, .6), k);
  setCam(W, cam, look, 32);
  env(W, {...DAY, target: V3(W, 12, 0, 1), shadowR: 34});
  crewDay(W, t);
  // Mark crouches by the weather mast, adjusting it; Beep rolls a happy little circle
  markCrouched(W, Math.PI / 2 + .25);
  const arms = W.mark.userData.joints.arms; arms[0].shoulder.rotation.x = -1.15 + .12 * Math.sin(t * .15); arms[0].elbow.rotation.x = -.7;
  const a = t / 24 * 1.25;
  const cx = BEEP_HOME[0], cz = BEEP_HOME[1], r = .55;
  const bx = cx + Math.cos(a) * r, bz = cz + Math.sin(a) * r;
  beepAt(W, bx, bz, -a, 0); spinWheels(W, a * r);
  setFace(W, (t % 60) > 54 ? 'blink' : 'happy');
  W.props.mastCups.rotation.y = t * .08;
  return {storm: 0, night: 0, sunMul: 1.0, hemiMul: 1.0, exposure: 1.0, cover: 0, lensStorm: 0, beacon: .3};
}

// =============== SHOT 2 — ALARM (168–360) ===============
function shot2(W, t) {
  resetActors(W);
  const band = lerp(.03, .3, ease(seg(t, 0, 190)));
  const cool = ease(seg(t, 40, 190));
  const skyE = {top: mixHex('#eab88a', '#b79a8c', cool), horizon: mixHex('#f7d3a7', '#c99c7c', cool), band, sunVis: 1 - cool * .45};
  const amber = t > 70 ? (.5 + .5 * Math.sign(Math.sin((t - 70) / 24 * Math.PI * 2 * 1.1))) * 3 : 0;
  crewDay(W, 168 + Math.min(t, 140));
  if (t < 112) {
    // A) visor close-up, then B) rack focus to the real horizon
    markCrouched(W, Math.PI / 2);
    const arms = W.mark.userData.joints.arms; arms[0].shoulder.rotation.x = lerp(-.55, -.2, ease(seg(t, 20, 60))); arms[0].elbow.rotation.x = -.7;
    beepAt(W, BEEP_HOME[0] + .2, BEEP_HOME[1] - .1, Math.PI / 2);
    setFace(W, t > 88 ? 'wide' : 'normal');
    const head = headPos(W, W.mark);
    let pos, look, dof = null;
    if (t < 50) {
      const k = easeOut(seg(t, 0, 50));
      pos = head.clone().add(V3(W, lerp(1.35, 1.12, k), lerp(.1, .05, k), lerp(-1.3, -1.05, k)));
      look = head.clone().add(V3(W, 0, -.1, 0));
      setCam(W, pos, look, 28);
    } else {
      const k = easeInOut(seg(t, 50, 100));
      // swing around the helmet to look over his shoulder at the horizon
      const ang = lerp(-.75, -Math.PI + .25, k);
      const rad = lerp(1.6, 1.15, k);
      pos = head.clone().add(V3(W, Math.cos(ang) * rad, lerp(.03, .18, k), Math.sin(ang) * rad * .9));
      const horizon = V3(W, 80, 2 + band * 40, 10);
      look = head.clone().lerp(horizon, ease(seg(t, 58, 100)));
      setCam(W, pos, look, lerp(30, 34, k));
      const focus = lerp(1.0, 60, easeInOut(seg(t, 66, 98)));
      dof = {focus, aperture: .012, maxblur: .01};
    }
    env(W, {...skyE, target: V3(W, 26, 0, 3), shadowR: 12, dof, visorEnv: Math.round(clamp(seg(t, 0, 60)) * 4) + 1});
  } else if (t < 152) {
    // C) Mark stands and turns; Beep's eyes go wide. Base & ship behind them, amber lights pulsing.
    const k = seg(t, 112, 134);
    const p = mixPose(POSES.crouch, POSES.stand, easeInOut(k));
    applyPose(W.mark, p);
    const yaw = lerp(Math.PI / 2, -Math.PI / 2 - .35, easeInOut(seg(t, 126, 146)));
    place(W.mark, MARK_SPOT[0], gy(W, ...MARK_SPOT) - p.drop, MARK_SPOT[1], yaw, (p.lean ?? 0));
    beepAt(W, BEEP_HOME[0] + .2, BEEP_HOME[1] - .1, lerp(Math.PI / 2, Math.PI / 2 + .4, ease(seg(t, 120, 140))));
    setFace(W, 'wide');
    const pos = V3(W, MARK_SPOT[0] + 4.2, 1.15 + gy(W, ...MARK_SPOT), MARK_SPOT[1] + 1.5);
    const look = V3(W, MARK_SPOT[0] - 1.5, gy(W, ...MARK_SPOT) + 1.05 + .2 * ease(seg(t, 112, 134)), MARK_SPOT[1] - .2);
    setCam(W, pos, look, 34);
    env(W, {...skyE, target: V3(W, 22, 0, 1), shadowR: 22, amber});
  } else {
    // D) pan: the crew drop their tools and run to Tulpar in big bouncy low-g strides
    const tt = t - 152;
    const runners = [[10.9, 6.4], [8.0, 6.9], [-0.3, -2.2], [-1.2, 4.6 - 168 * .9 / 24 * 1.0]];
    W.crew.forEach((c, i) => {
      const [sx, sz] = runners[i];
      const start = [sx + 3.5, sz - 1.4]; // already on their way when the pan starts
      const goal = [19 - 2.6, -2 + 1.6];
      const dx = goal[0] - start[0], dz = goal[1] - start[1], L = Math.hypot(dx, dz);
      const d = Math.min(L - .4, tt * 4.2 / 24 + i * .6);
      const x = start[0] + dx / L * d, z = start[1] + dz / L * d;
      const ph = d / 1.5 + i * .27;
      const g = gait(ph, {lift: .3, reach: 1.4, run: 1});
      applyPose(c, g);
      const hop = Math.abs(Math.sin(ph * Math.PI * 2)) * .28; // low gravity: long airborne phase
      place(c, x, gy(W, x, z) + hop, z, Math.atan2(dx, dz), .18);
    });
    W.props.crate.visible = false;
    // dropped tools lie on the ground near the rover
    [[9.4, 6.2], [8.3, 7.4]].forEach(([x, z], i) => {const tl = W.props.tools[i]; tl.visible = true; tl.position.set(x, gy(W, x, z) + .03, z); tl.rotation.set(Math.PI / 2, 0, i * 1.3);});
    // Mark starts moving too (far right, towards the ship)
    const md = tt * 2.4 / 24;
    const mx = MARK_SPOT[0] - md, mz = MARK_SPOT[1] - md * .3;
    const g = gait(md / 1.1, {lift: .16, reach: 1.1, run: .4}); applyPose(W.mark, g);
    place(W.mark, mx, gy(W, mx, mz) + Math.abs(Math.sin(md / 1.1 * Math.PI * 2)) * .1, mz, -Math.PI / 2 - .3, .12);
    beepAt(W, mx + .9, mz + .7, -Math.PI / 2 - .3); spinWheels(W, md);
    setFace(W, 'wide');
    const k = easeInOut(seg(tt, 0, 46));
    const pos = V3(W, lerp(11.5, 13.5, k), 1.9, 12.5);
    const look = V3(W, lerp(9.5, 18.5, k), 1.4, lerp(4, -1.5, k));
    setCam(W, pos, look, 30);
    env(W, {...skyE, target: V3(W, 14, 0, 2), shadowR: 22, amber});
  }
  return {storm: cool * .25, night: cool * .12, sunMul: 1 - cool * .45, hemiMul: 1 - cool * .25, exposure: 1 - cool * .05, cover: 0, lensStorm: 0, beacon: amber ? 4 : .3, beaconColor: '#ffa21f'};
}

// =============== SHOT 3 — LOST IN THE DUST (360–552) ===============
function shot3(W, t) {
  resetActors(W);
  W.crew.forEach(c => c.visible = false); // crew are aboard
  if (t < 64) {
    // A) the dust wall rolls over the base; the Sun fades and disappears
    const k = seg(t, 0, 64);
    const front = lerp(62, 6, easeIn(k) * .55 + k * .45);
    const pos = V3(W, lerp(4, 6, k), lerp(9.5, 9.0, k), 25);
    const look = V3(W, 26, 3.5, -2);
    setCam(W, pos, look, 34);
    // Mark & Beep still at the mast, tiny, heading to the line
    const md = 2.0 + t * 1.6 / 24; const mx = MARK_SPOT[0] - md * .6, mz = MARK_SPOT[1] - md * .25;
    applyPose(W.mark, gait(md / 1.1, {lift: .14})); place(W.mark, mx, gy(W, mx, mz), mz, -Math.PI / 2 - .3, .2);
    beepAt(W, mx + .9, mz + .8, -Math.PI / 2 - .2); setFace(W, 'worried');
    env(W, {top: mixHex('#b79a8c', '#7a5440', k), horizon: mixHex('#c99c7c', '#8a5b3d', k), band: lerp(.22, .9, ease(k)), sunVis: lerp(.55, 0, ease(seg(t, 10, 56))), sunGlow: lerp(1, .2, k),
      cover: ease(seg(t, 40, 64)) * .8, fog: mixHex('#c99c7c', '#8a5b3d', k), fogNear: lerp(40, 14, k), fogFar: lerp(130, 70, k),
      dust: 1, front, dStart: 3, dStep: 3.4, dCeil: 22, target: V3(W, 18, 0, 0), shadowR: 30, amber: (Math.sin(t / 24 * Math.PI * 2.2) > 0) ? 3 : 0});
    return {storm: .45 + k * .4, night: .15, sunMul: lerp(.5, .15, k), hemiMul: lerp(.75, .55, k), exposure: 1, cover: 0, lensStorm: 0, beacon: 4, beaconColor: '#ffa21f'};
  }
  if (t < 150) {
    // B) one-step visibility: Mark walks bent forward along the yellow safety line
    const tt = t - 64;
    const poles = RAVINE.line;
    const P0 = [poles[0][0] - .2, poles[0][1] + .35], P1 = [poles[2][0] - .15, poles[2][1] + .45];
    const walkEnd = 58; // frames of walking along the line
    let x, z, y, yaw, pitch = .32, pose;
    if (tt < walkEnd) {
      const k = tt / walkEnd; x = lerp(P0[0], P1[0], k); z = lerp(P0[1], P1[1], k);
      const ph = (tt * 1.05 / 24) / .9;
      pose = gait(ph, {lift: .1, reach: .8}); pose.sh[0] = -.95; pose.el[0] = -.45; // left hand slides along the rope
      yaw = Math.atan2(P1[0] - P0[0], P1[1] - P0[1]);
      // after the clip gives way (tt 26) he drifts sideways (+z), losing the line
      const drift = ease(seg(tt, 30, walkEnd)) * .9; z += drift;
      y = gy(W, x, z);
    } else {
      // steps onto the unseen slope, sits back and slides gently down on his back (feet first)
      const k = seg(tt, walkEnd, 86);
      const sx = P1[0] - .1, sz = P1[1] + .9;
      const ex = sx - .3, ez = RAVINE.z + .6;
      const slide = easeIn(seg(k, .18, 1));
      x = lerp(sx, ex, slide); z = lerp(sz, ez, slide);
      yaw = lerp(Math.atan2(P1[0] - P0[0], P1[1] - P0[1]), 0, ease(seg(k, 0, .3)));
      const sitK = ease(seg(k, .05, .3)), lieK = ease(seg(k, .3, .7));
      pose = mixPose(mixPose(POSES.stand, POSES.sit, sitK), POSES.lie, lieK);
      pitch = lerp(lerp(.15, 0, sitK), -1.25, lieK);
      y = gy(W, x, z) + lerp(0, .35, sitK) - lieK * .1;
    }
    applyPose(W.mark, pose); place(W.mark, x, y, z, yaw, pitch);
    // the clip on pole 2 gives way at tt=26 and the rope goes slack
    const clipK = seg(tt, 26, 34);
    const clip = W.props.line.poles[2].userData.clip;
    clip.position.set(.05 * clipK, .98 - .9 * easeIn(clipK), .045 + .05 * clipK); clip.rotation.set(clipK * 2, 0, clipK);
    setRope(W, ease(seg(tt, 26, 46)), Math.sin(seg(tt, 26, 60) * Math.PI) * .6);
    W.beep.visible = false;
    // camera: side-on at walking distance, gently tracking, then holding as he slides out of frame
    const camK = ease(seg(tt, 0, walkEnd));
    const cx = lerp(P0[0] - .6, P1[0] - .2, camK), cz = lerp(P0[1], P1[1], camK) - 2.6;
    const pos = V3(W, cx, gy(W, cx, cz) + 1.35, cz);
    const look = V3(W, cx - .1, gy(W, cx, cz) + .9 - .25 * ease(seg(tt, walkEnd, 86)), cz + 3);
    setCam(W, pos, look, 36);
    env(W, {top: '#6b4632', horizon: '#7c5038', band: 0, sunVis: 0, cover: 1, coverColor: '#6f4630', fog: '#7a4f36', fogNear: .5, fogFar: 9.5,
      dust: 1, front: -200, dStart: .6, dStep: 1.1, dCeil: 30, target: V3(W, x, 0, z), shadowR: 8});
    return {storm: .95, night: .35, sunMul: .1, hemiMul: .55, exposure: 1.15, cover: 0, lensStorm: 0, beacon: 0};
  }
  // C) inside the helmet: the dust outside, light-blue display (drawn as overlay) losing signal
  const tt = t - 150;
  W.mark.visible = false; W.beep.visible = false;
  const head = V3(W, RAVINE.line[2][0] - .4, gy(W, RAVINE.line[2][0] - .4, RAVINE.z + .6) + .35, RAVINE.z + .6);
  setCam(W, head, head.clone().add(V3(W, .2 * Math.sin(tt * .02), 4, 1.2)), 70);
  env(W, {top: '#6b4632', horizon: '#7c5038', band: 0, sunVis: 0, cover: 1, coverColor: '#5f3c2a', fog: '#6a4331', fogNear: .3, fogFar: 6,
    dust: 1, front: -200, dStart: .3, dStep: .9, dCeil: 30, target: head, shadowR: 6, dof: {focus: .2, aperture: .02, maxblur: .02}});
  return {storm: 1, night: .4, sunMul: .05, hemiMul: .45, exposure: 1.0, cover: 0, lensStorm: 0, beacon: 0};
}

// =============== SHOT 4 — LIFTOFF (552–744) ===============
function shot4(W, t) {
  resetActors(W);
  if (t < 100) {
    // inside Tulpar's cockpit
    const C = W.cockpit; C.root.visible = true;
    W.mark.visible = false; W.beep.visible = false; W.crew.forEach(c => c.visible = false);
    const o = C.root.position;
    const [cmd, ...rest] = C.people;
    // commander seated at the console (faces +z towards the console)
    const press = seg(t, 84, 92), release = seg(t, 94, 100);
    const hover = ease(seg(t, 46, 66));
    const lookDown = ease(seg(t, 18, 40));
    const p = mixPose(POSES.seat, POSES.seat, 0);
    applyPose(cmd, p);
    const arms = cmd.userData.joints.arms;
    // right arm (index 0) reaches to the launch control: hover, pause, press
    arms[0].shoulder.rotation.set(lerp(-.55, -1.25, hover) - .1 * press * (1 - release), 0, lerp(.12, -.18, hover));
    arms[0].elbow.rotation.x = lerp(-.9, -.55, hover) + .12 * press * (1 - release);
    place(cmd, 0, .02 - .03 * press * (1 - release), .4, 0, lerp(0, .22, lookDown) + .05 * Math.sin(t * .05) * (1 - hover));
    cmd.rotation.z = lerp(0, -.05, lookDown);
    const seats = [[-1.05, -.25, .3], [1.05, -.25, -.3], [-.5, -1.1, .15]];
    rest.forEach((c, i) => {applyPose(c, POSES.seat); const [sx, sz, ry] = seats[i]; place(c, sx, .02, sz - .15, ry, .05);});
    C.btnBase.children[0].position.y = .04 - .025 * press * (1 - release);
    C.btnMat.emissiveIntensity = .6 + 2.5 * press * (1 - release * .5);
    C.drawStatus(t / 24);
    let pos, look;
    if (t < 44) {
      // over the commander's shoulder: five round icons, four green, one grey
      const k = easeOut(seg(t, 0, 44));
      pos = V3(W, o.x - .2 + .1 * k, o.y + 2.15 - .05 * k, o.z - .35 + .2 * k); look = V3(W, o.x, o.y + 1.68, o.z + 1.75);
      setCam(W, pos, look, lerp(34, 30, k));
    } else {
      // side: the glove hovers over the large launch control, pauses, presses
      const k = easeOut(seg(t, 44, 100));
      pos = V3(W, o.x + 1.35 - .1 * k, o.y + 1.75, o.z + .95 - .1 * k); look = V3(W, o.x - .05, o.y + 1.35, o.z + .95);
      setCam(W, pos, look, 38);
    }
    env(W, {...DAY, target: o.clone(), shadowR: 4, fogNear: 50, fogFar: 200});
    return {storm: 0, night: .3, sunMul: 0, hemiMul: .12, exposure: 1.1, cover: 0, bloomStrength: .22, ao: false, vig: .5};
  }
  // exterior: Tulpar lifts off through the brown haze, climbs, shrinks and fades into the dust
  const tt = t - 100;
  W.mark.visible = false; W.beep.visible = false; W.crew.forEach(c => c.visible = false);
  const ign = ease(seg(tt, 4, 14));
  const rise = Math.max(0, tt - 12);
  const h = .012 * rise * rise; // gentle acceleration (Mars gravity)
  W.ascent.position.y = h;
  W.engineFlame.visible = ign > 0; W.engineFlame.scale.setScalar(.6 + .5 * ign); W.engineLight.intensity = 60 * ign;
  W.flameMat.opacity = .85 * ign;
  const shipTop = W.PAD.clone().add(V3(W, 0, 4 + h, 0));
  const pos = V3(W, 4.5, 2.4, 15);
  const look = V3(W, 19, lerp(4, 4 + h * .75, ease(seg(tt, 20, 92))), -2);
  setCam(W, pos, look, 30);
  env(W, {top: '#7a5440', horizon: '#8d5d40', band: 0, sunVis: 0, cover: .92, coverColor: '#82533a', fog: '#8a5b3d', fogNear: 18, fogFar: 120,
    dust: .35, front: -200, dStart: 3, dStep: 2.6, dCeil: 40, target: W.PAD.clone(), shadowR: 18, amber: (Math.sin(tt / 24 * Math.PI * 2.2) > 0) ? 2 : 0});
  return {storm: .8, night: .3, sunMul: .12, hemiMul: .55, exposure: 1.05, cover: 0, lensStorm: 0, bloomStrength: .5 + .4 * ign, beacon: 3, beaconColor: '#ffa21f'};
}

// =============== SHOT 5 — ALONE, BUT NOT ALONE (744–960) ===============
const MARK_LIE = [RAVINE.line[2][0] - .4, RAVINE.z + .6];
function shot5(W, t) {
  resetActors(W);
  W.crew.forEach(c => c.visible = false);
  W.ascent.visible = false; W.scorch.visible = true;
  W.props.line.rope.visible = true; setRope(W, 1, 0);
  const clip = W.props.line.poles[2].userData.clip; clip.position.set(.05, .08, .1); clip.rotation.set(2, 0, 1);
  const settled = {top: '#a99486', horizon: '#c4a28a', sunVis: .35, sunGlow: .5, sunSize: .01, fog: '#bf9d86', fogNear: 30, fogFar: 140, coverColor: '#8a6a55'};
  const lights = {night: .55, sunMul: .3, hemiMul: .6, exposure: 1.12, beacon: 1.5};
  // Mark lying in the ravine (on his back, feet down-slope towards +z)
  const lieG = gy(W, MARK_LIE[0], MARK_LIE[1]); const lieY = lieG + .47;
  if (t < 52) {
    // A) wide: the empty pad with a dark scorch ring; the base small and far away
    W.mark.visible = false; W.beep.visible = false;
    const k = seg(t, 0, 52);
    const pos = V3(W, lerp(31.5, 31, k), 3.4, lerp(7.5, 7.2, k));
    setCam(W, pos, V3(W, 14, .8, -3.5), 30);
    env(W, {...settled, target: V3(W, 16, 0, -2), shadowR: 26});
    return {storm: .1, ...lights, cover: 0, lensStorm: 0};
  }
  if (t < 168) {
    const tt = t - 52;
    // Mark: lies still, stirs, then sits up and looks toward the base
    const stir = seg(tt, 20, 36), sitK = easeInOut(seg(tt, 84, 106)), lookK = easeInOut(seg(tt, 100, 114));
    let pose = POSES.lie;
    pose = mixPose(pose, {...POSES.lie, sh: [-.6, -.2], el: [-1.0, -.4], knee: [.5, .2], hip: [-.35, 0]}, Math.sin(stir * Math.PI) * .9 + (stir >= 1 ? .25 : 0));
    pose = mixPose(pose, POSES.sit, sitK);
    applyPose(W.mark, pose);
    const pitch = lerp(-Math.PI / 2 + .04, -.06, sitK);
    const yaw = lerp(0, -1.15, lookK);
    // lying on his back, head up-slope (-z); sitting up pivots around the hips
    place(W.mark, MARK_LIE[0], lerp(lieY, lieG - .5, sitK), MARK_LIE[1] - .645 * sitK, yaw, pitch);
    // small amber oxygen icon blinking on his helmet display
    if (W.o2) {W.o2.visible = true; W.o2.material.opacity = (Math.floor(tt / 9) % 2 === 0) ? 1 : .15;}
    // Beep: headlamp beam sweeps from the top of the slope, then rolls carefully down to Mark
    const beamK = seg(tt, 38, 56), rollK = easeInOut(seg(tt, 50, 78)), nudge = Math.sin(seg(tt, 104, 116) * Math.PI);
    const top = [MARK_LIE[0] + .9, MARK_LIE[1] - 2.9], stop = [MARK_LIE[0] + .75, MARK_LIE[1] - .35];
    const bx = lerp(top[0], stop[0], rollK) - .12 * nudge, bz = lerp(top[1], stop[1], rollK) + .1 * nudge;
    const by = gy(W, bx, bz);
    const ahead = gy(W, bx, bz + .3);
    const slope = Math.atan2(by - ahead, .3);
    const yawB = lerp(lerp(-.9, .4, beamK), lerp(.25, -.6, ease(seg(tt, 80, 98))), rollK);
    place(W.beep, bx, by, bz, yawB, slope * .9);
    spinWheels(W, rollK * 2.6 + nudge * .2);
    W.headlamp.intensity = 25 * ease(seg(tt, 34, 42)); W.lampLens.material.emissiveIntensity = 4 * ease(seg(tt, 34, 42));
    setFace(W, tt < 78 ? 'worried' : (tt > 112 && tt < 116 ? 'blink' : 'relieved'));
    // camera: low, close, from the side of the ravine
    const k = seg(tt, 0, 116);
    const pos = V3(W, MARK_LIE[0] + 2.9 - .3 * k, lieG + 1.25 + .1 * k, MARK_LIE[1] + 1.2);
    const look = V3(W, MARK_LIE[0] + .1, lieG + .35 + .3 * sitK, MARK_LIE[1] - .7);
    setCam(W, pos, look, 36);
    env(W, {...settled, target: V3(W, MARK_LIE[0], 0, MARK_LIE[1]), shadowR: 8});
    return {storm: .1, ...lights, sunMul: .25, cover: 0, lensStorm: 0};
  }
  // C) final steady wide: two small figures facing the distant base — hold still
  applyPose(W.mark, POSES.sit);
  W.mark.rotation.set(0, 0, 0); W.mark.rotation.order = 'YXZ';
  W.mark.position.set(MARK_LIE[0], lieG - .5, MARK_LIE[1] - .645); W.mark.rotation.y = -1.15; W.mark.rotation.x = -.06;
  const bx = MARK_LIE[0] + .75, bz = MARK_LIE[1] - .35;
  place(W.beep, bx, gy(W, bx, bz), bz, -.6, 0); setFace(W, 'relieved');
  W.headlamp.intensity = 25; W.lampLens.material.emissiveIntensity = 4;
  if (W.o2) {W.o2.visible = true; W.o2.material.opacity = .6;}
  const pos = V3(W, MARK_LIE[0] + 8.5, lieG + 3.3, MARK_LIE[1] + 4.0);
  setCam(W, pos, V3(W, MARK_LIE[0] - 9, lieG + .2, MARK_LIE[1] - 4.8), 30);
  env(W, {...settled, target: V3(W, 14, 0, 2), shadowR: 22});
  return {storm: .1, ...lights, cover: 0, lensStorm: 0};
}

function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map(s => Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, clamp(t))));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

export const SHOT_FNS = {1: shot1, 2: shot2, 3: shot3, 4: shot4, 5: shot5};
