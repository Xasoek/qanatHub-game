// @ts-nocheck
// Deterministic posing for the game's astronaut rig (hip/knee/ankle, shoulder/elbow) and Beep.
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => {t = clamp(t); return t * t * (3 - 2 * t);};
export const easeInOut = (t) => {t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;};
export const easeOut = (t) => {t = clamp(t); return 1 - Math.pow(1 - t, 3);};
export const easeIn = (t) => {t = clamp(t); return t * t * t;};
export const seg = (t, a, b) => clamp((t - a) / (b - a));

// Pose = {hip:[l,r], knee:[l,r], ankle:[l,r], sh:[l,r], shz:[l,r], el:[l,r], hipz:[l,r]}
export const POSES = {
  stand: {hip: [0, 0], knee: [0, 0], ankle: [0, 0], sh: [.05, .05], shz: [.12, -.12], el: [-.25, -.25], drop: 0},
  crouch: {hip: [-1.55, -.35], knee: [2.25, 1.95], ankle: [-.7, -1.6], sh: [-.55, -.2], shz: [.1, -.15], el: [-1.1, -.6], drop: .42, lean: .32},
  // lying flat on the back, arms resting
  lie: {hip: [0, 0], knee: [.12, .18], ankle: [-.1, -.1], sh: [-.15, -.1], shz: [.35, -.35], el: [-.3, -.35], drop: 0},
  // sitting up on the ground (legs forward)
  sit: {hip: [-1.35, -1.45], knee: [.45, .3], ankle: [-.2, -.2], sh: [.3, .25], shz: [.25, -.3], el: [-.3, -.4], drop: 0},
  // seated in a chair
  seat: {hip: [-1.5, -1.5], knee: [1.45, 1.45], ankle: [0, 0], sh: [-.55, -.5], shz: [.12, -.12], el: [-.9, -.9], drop: 0},
  carry: {hip: [0, 0], knee: [0, 0], ankle: [0, 0], sh: [-.75, -.75], shz: [.05, -.05], el: [-.75, -.75], drop: 0},
  reachUp: {hip: [0, 0], knee: [0, 0], ankle: [0, 0], sh: [-2.4, -.4], shz: [.2, -.15], el: [-.4, -.7], drop: 0},
  work: {hip: [-.2, .05], knee: [.35, .1], ankle: [-.15, -.15], sh: [-.85, -1.0], shz: [.15, -.15], el: [-.9, -.7], drop: .05, lean: .18},
};
export function mixPose(a, b, t) {
  const o = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[k] ?? (Array.isArray(b[k]) ? [0, 0] : 0), vb = b[k] ?? (Array.isArray(a[k]) ? [0, 0] : 0);
    o[k] = Array.isArray(va) ? [lerp(va[0], vb[0], t), lerp(va[1], vb[1], t)] : lerp(va, vb, t);
  }
  return o;
}
export function applyPose(char, p) {
  const {legs, arms} = char.userData.joints;
  for (let s = 0; s < 2; s++) {
    legs[s].hip.rotation.set(p.hip?.[s] ?? 0, 0, p.hipz?.[s] ?? 0);
    legs[s].knee.rotation.x = p.knee?.[s] ?? 0;
    legs[s].ankle.rotation.x = p.ankle?.[s] ?? 0;
    arms[s].shoulder.rotation.set(p.sh?.[s] ?? 0, 0, p.shz?.[s] ?? 0);
    arms[s].elbow.rotation.x = p.el?.[s] ?? 0;
  }
}
// Walking / low-gravity running gait from the game's IK (characters.js), but driven by an
// explicit phase so every frame is reproducible. bounce>0 gives the bouncy low-g lope.
export function gait(phase, {amount = 1, lift = .085, reach: reachMul = 1, run = 0} = {}) {
  const cycle = .9, stance = .5, reach = cycle * stance / 2 * reachMul;
  const out = {hip: [0, 0], knee: [0, 0], ankle: [0, 0], sh: [0, 0], shz: [.12, -.12], el: [0, 0], drop: 0};
  for (let side = 0; side < 2; side++) {
    const t = ((phase + side * .5) % 1 + 1) % 1;
    const swing = Math.max(0, (t - stance) / (1 - stance));
    const z = amount * (t < stance ? reach - (2 * reach) * (t / stance) : -reach * Math.cos(swing * Math.PI));
    const lf = amount * lift * Math.sin(Math.PI * swing) ** 2;
    const drop = .645 - .075 - lf;
    const distance = Math.hypot(drop, z);
    const c1 = clamp((.32 ** 2 + distance ** 2 - .31 ** 2) / (.64 * distance), -1, 1);
    const c2 = clamp((.32 ** 2 + .31 ** 2 - distance ** 2) / (2 * .32 * .31), -1, 1);
    const hipAngle = -Math.atan2(z, drop) - Math.acos(c1);
    const kneeAngle = Math.PI - Math.acos(c2);
    out.hip[side] = hipAngle; out.knee[side] = kneeAngle; out.ankle[side] = -hipAngle - kneeAngle;
    out.sh[1 - side] = -(.34 + run * .5) * z / Math.max(1e-6, reach);
    out.el[side] = -.24 - .12 * lf / .085 - run * .7;
  }
  return out;
}
// Place a character: position on ground y, facing yaw (0 = +z), extra pitch (lean / lie).
export function place(char, x, y, z, yaw = 0, pitch = 0, roll = 0) {
  char.position.set(x, y, z);
  char.rotation.set(0, 0, 0);
  char.rotation.order = 'YXZ';
  char.rotation.y = yaw; char.rotation.x = pitch; char.rotation.z = roll;
}
export const yawTo = (fx, fz, tx, tz) => Math.atan2(tx - fx, tz - fz);
