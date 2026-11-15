import {CONFIG} from "../config.js";
// Orbital mechanics for the rescue ship: a Hohmann transfer from Earth to Mars.
// Real constants; circular, coplanar planet orbits are a teaching simplification (noted in the UI).
export const AU_KM = 149_597_870.7;
export const GM_SUN = 1.32712440018e11; // km^3/s^2
export const LIGHT_KMS = 299_792.458;
export const SOL_DAYS = 1.0275; // one sol in Earth days (24 h 39.6 min)
/** Game time compression: one mission sol advances one Martian day along its flight. */
export const SHIP_DAYS_PER_SOL = SOL_DAYS;
export const ORBITS = { // semi-major axis in AU, period in days
  mercury: { a: 0.387, period: 87.97 }, venus: { a: 0.723, period: 224.7 }, earth: { a: 1, period: 365.256 },
  mars: { a: 1.524, period: 686.98 }, jupiter: { a: 5.203, period: 4332.6 }, saturn: { a: 9.537, period: 10759 },
  uranus: { a: 19.19, period: 30687 }, neptune: { a: 30.07, period: 60190 },
};
const A = (ORBITS.earth.a + ORBITS.mars.a) / 2; // transfer ellipse semi-major axis, AU
const E = (ORBITS.mars.a - ORBITS.earth.a) / (ORBITS.mars.a + ORBITS.earth.a);
/** Half the transfer ellipse's period: the Earth-to-Mars flight time in days (~259). */
export const TRANSFER_DAYS = Math.PI * Math.sqrt((A * AU_KM) ** 3 / GM_SUN) / 86400;

function solveKepler(M) {
  let e = M;
  for (let i = 0; i < 12; i++) e -= (e - E * Math.sin(e) - M) / (1 - E * Math.cos(e));
  return e;
}
const angleAt = (planet, day, phase = 0) => phase + (2 * Math.PI * day) / ORBITS[planet].period;

/**
 * Where everything is on a given mission sol. The ship left Earth at day 0 and reaches Mars
 * at TRANSFER_DAYS, timed so that it lands on sol CONFIG.missionSols.
 */
export function missionSnapshot(sol, missionSols = CONFIG.missionSols) {
  const remaining = Math.max(0, (missionSols - sol) * SHIP_DAYS_PER_SOL);
  const day = Math.max(0, TRANSFER_DAYS - remaining);
  const M = Math.PI * Math.min(1, day / TRANSFER_DAYS);
  const ecc = solveKepler(M);
  const rAU = A * (1 - E * Math.cos(ecc));
  const nu = 2 * Math.atan2(Math.sqrt(1 + E) * Math.sin(ecc / 2), Math.sqrt(1 - E) * Math.cos(ecc / 2));
  const ship = { x: rAU * Math.cos(nu), y: rAU * Math.sin(nu) };
  const speed = Math.sqrt(GM_SUN * (2 / (rAU * AU_KM) - 1 / (A * AU_KM))); // vis-viva, km/s
  // Earth starts at angle 0 on launch day; Mars is placed so it reaches angle π on arrival.
  const earthAngle = angleAt("earth", day);
  const marsAngle = Math.PI - (2 * Math.PI * (TRANSFER_DAYS - day)) / ORBITS.mars.period;
  const earth = { x: Math.cos(earthAngle), y: Math.sin(earthAngle) };
  const mars = { x: ORBITS.mars.a * Math.cos(marsAngle), y: ORBITS.mars.a * Math.sin(marsAngle) };
  const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y) * AU_KM;
  const earthMars = dist(earth, mars);
  return {
    day, remaining, totalDays: TRANSFER_DAYS, rAU, speed, ship, earth, mars, nu,
    distToMarsKm: dist(ship, mars), distFromEarthKm: dist(ship, earth), earthMarsKm: earthMars,
    delayMin: earthMars / LIGHT_KMS / 60,
    earthAngle, marsAngle,
    planetAngle: (planet) => planet === "earth" ? earthAngle : planet === "mars" ? marsAngle : angleAt(planet, day, planet.length),
  };
}

/** Points along the transfer half-ellipse (perihelion at Earth, aphelion at Mars), in AU. */
export function transferPath(steps = 160) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const nu = (Math.PI * i) / steps, r = (A * (1 - E * E)) / (1 + E * Math.cos(nu));
    pts.push({ x: r * Math.cos(nu), y: r * Math.sin(nu), nu });
  }
  return pts;
}
