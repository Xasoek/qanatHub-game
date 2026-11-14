import { CONFIG } from "./config.js";

export let STATE;

const phases = Object.keys(CONFIG.phasesMs);
const listeners = new Map(["event", "phase", "gameover"].map((type) => [type, new Set()]));
let elapsedInPhase = 0;

export function on(type, fn) {
  const subscribers = listeners.get(type);
  if (!subscribers) throw new RangeError(`Unknown engine event: ${type}`);
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function emit(type, payload) {
  for (const listener of listeners.get(type)) listener(payload);
}

function resetAllocation() {
  return Object.fromEntries(CONFIG.systems.map((system) => [system, 0]));
}

export function newGame({ site = CONFIG.defaults.site, difficulty = CONFIG.defaults.difficulty,
  seed = CONFIG.defaults.seed, solarData } = {}) {
  if (!CONFIG.sites.includes(site)) throw new RangeError(`Unknown site: ${site}`);
  if (!Object.hasOwn(CONFIG.difficulties, difficulty)) {
    throw new RangeError(`Unknown difficulty: ${difficulty}`);
  }
  const { oxygen, food } = CONFIG.difficulties[difficulty];
  elapsedInPhase = 0;
  STATE = {
    sol: 1, phase: "morning", speed: 1, paused: false, status: "playing",
    site, difficulty, oxygen, food, damage: 0,
    cubes: CONFIG.cubesByWeather.clear, alloc: resetAllocation(),
    panels: { total: CONFIG.panels, broken: 0, dusty: 0 },
    crop: { type: CONFIG.defaults.crop, progress: 0 },
    dose: 0, fatigue: 0, crates: 0, stars: 0,
    weather: "clear", forecast: null, scrubberBroken: false, pending: [], log: [],
    solarMode: solarData?.mode ?? "archive",
    flares: structuredClone(solarData?.flares ?? []),
    seed,
  };
  return STATE;
}

export function allocate(system, delta) {
  if (STATE.status !== "playing" || STATE.phase !== "day" ||
      !CONFIG.systems.includes(system) || !Number.isInteger(delta) ||
      STATE.alloc[system] + delta < 0 || STATE.cubes - delta < 0) return false;
  STATE.alloc[system] += delta;
  STATE.cubes -= delta;
  return true;
}

function setPhase(phase) {
  STATE.phase = phase;
  if (phase === "evening") STATE.cubes = 0;
  elapsedInPhase = 0;
  emit("phase", { sol: STATE.sol, phase });
}

function finishSol() {
  const airIndex = Math.min(STATE.alloc.air, CONFIG.airUseByCubes.length - 1);
  const oxygen = Math.min(STATE.oxygen, CONFIG.airUseByCubes[airIndex]);
  const food = Math.min(STATE.food, CONFIG.foodUsePerSol);
  STATE.oxygen -= oxygen;
  STATE.food -= food;
  STATE.log.push({ sol: STATE.sol, choice: "endSol", cost: { oxygen, food }, note: null });

  if (!STATE.oxygen || !STATE.food || STATE.damage >= CONFIG.damageLimit) {
    STATE.status = "emergencySleep";
  } else if (STATE.sol >= CONFIG.missionSols) {
    STATE.status = "rescued";
  }

  if (STATE.status !== "playing") {
    emit("gameover", getEndReport());
    return;
  }
  STATE.sol += 1;
  STATE.cubes = CONFIG.cubesByWeather[STATE.weather];
  STATE.alloc = resetAllocation();
  setPhase("morning");
}

export function endSol() {
  if (STATE.status !== "playing" || !["morning", "day"].includes(STATE.phase)) return false;
  setPhase("evening");
  return true;
}

export function tick(dtMs) {
  if (!Number.isFinite(dtMs) || dtMs < 0) throw new RangeError("dtMs must be non-negative and finite");
  if (STATE.paused || STATE.status !== "playing") return;
  let remaining = dtMs * STATE.speed;
  while (remaining > 0 && !STATE.paused && STATE.status === "playing") {
    const timeLeft = CONFIG.phasesMs[STATE.phase] - elapsedInPhase;
    if (remaining < timeLeft) {
      elapsedInPhase += remaining;
      return;
    }
    remaining -= timeLeft;
    const next = phases[phases.indexOf(STATE.phase) + 1];
    if (next) setPhase(next);
    else finishSol();
  }
}

// Deliberate starter stubs. Role 1 supplies decisions and versioned saves.
export function resolveEvent(_id, _choice) { return false; }
export function save() { return false; }
export function load() { return null; }

export function setSpeed(speed) {
  if (!CONFIG.speeds.includes(speed)) return false;
  STATE.speed = speed;
  return true;
}

export function skipToDecision() {
  if (STATE.paused || STATE.status !== "playing") return false;
  if (STATE.phase === "morning") {
    setPhase("day");
    return true;
  }
  return false;
}

export function getEndReport() {
  return { status: STATE.status, sol: STATE.sol, chains: [] };
}

newGame();
