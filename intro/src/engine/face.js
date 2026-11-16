// @ts-nocheck
// Beep's screen-face: two expressive pixel eyes (teal, as in the game), no letters.
const EYE = '#7ff3e3', BG = '#0e1f26';
const W = 40, H = 21;
const SHAPES = {
  normal: (p) => {for (const cx of [12, 28]) p.rect(cx - 2, 6, 4, 9, true);},
  blink: (p) => {for (const cx of [12, 28]) p.rect(cx - 3, 11, 6, 1);},
  wide: (p) => {for (const cx of [12, 28]) {p.rect(cx - 4, 3, 8, 14, true); p.clear(cx + 1, 5, 2, 3);} },
  happy: (p) => {for (const cx of [12, 28]) {p.rect(cx - 4, 10, 2, 2); p.rect(cx - 3, 8, 2, 2); p.rect(cx - 1, 7, 2, 2); p.rect(cx + 1, 8, 2, 2); p.rect(cx + 2, 10, 2, 2);} },
  relieved: (p) => {for (const cx of [12, 28]) {p.rect(cx - 4, 11, 2, 2); p.rect(cx - 3, 9, 2, 2); p.rect(cx - 1, 8, 2, 2); p.rect(cx + 1, 9, 2, 2); p.rect(cx + 2, 11, 2, 2);} p.rect(18, 16, 4, 1);},
  look: (p) => {for (const cx of [10, 26]) p.rect(cx - 2, 6, 4, 9, true);},
  worried: (p) => {for (const cx of [12, 28]) {p.rect(cx - 2, 8, 4, 7, true);} p.rect(8, 5, 4, 1); p.rect(28, 5, 4, 1);},
};
export function makeFaceTextures(THREE) {
  const out = {};
  for (const [name, draw] of Object.entries(SHAPES)) {
    const mk = (bg, glow) => {
      const S = 12, c = document.createElement('canvas'); c.width = W * S; c.height = H * S; const x = c.getContext('2d');
      x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
      const p = {
        rect: (px, py, w, h, round) => {x.fillStyle = glow; for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) {
          if (round && ((i === 0 || i === w - 1) && (j === 0 || j === h - 1))) continue;
          x.fillRect((px + i) * S + 1, (py + j) * S + 1, S - 2, S - 2);}},
        clear: (px, py, w, h) => {x.fillStyle = bg; x.fillRect(px * S, py * S, w * S, h * S);},
      };
      draw(p);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.LinearFilter; return t;
    };
    out[name] = {map: mk(BG, EYE), glow: mk('#000000', EYE)};
  }
  return out;
}
