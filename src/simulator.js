// Mission simulator for normal browser games (newGame({simulation:true})).
// The engine validates every command before it calls these helpers; the UI only reads the results.
// Missions and steps are data in CONFIG.simulation (IMPLEMENTATION_PLAN.md).
import { CONFIG } from "./config.js";

const cfg = CONFIG.simulation;
const round = (value) => Math.round(value * 100) / 100;

export const MISSION_IDS = Object.keys(cfg.missions);

export function makeSimulation() {
  const sim = {
    battery: cfg.batteryInitial, generated: 0, charged: 0, nightUse: 0,
    spares: cfg.spares, plan: [], lastPlan: [], done: {}, water: cfg.water.start,
    patchUntil: 0, crates: { near: false, far: false }, robotUsed: false,
    departed: false, sentSol: null, sentDamage: null, reply: null, notes: [], commsLevel: 0,
  };
  syncLegacy(sim);
  return sim;
}

/**
 * Fills fields that older saves do not have and rebuilds completed steps from the old flags.
 * Returns the same object.
 */
export function normalizeSimulation(sim) {
  if (!sim || typeof sim !== "object") return sim;
  const fresh = makeSimulation();
  for (const [key, value] of Object.entries(fresh)) if (!(key in sim)) sim[key] = structuredClone(value);
  if (!sim.done || typeof sim.done !== "object") sim.done = {};
  const legacy = {
    inspect: sim.inspected, seal: sim.sealBroken === false, radio: sim.radioBroken === false,
    debris: sim.debris === false, beacon: sim.ready?.beacon, route: sim.ready?.route, lander: sim.ready?.lander,
  };
  for (const [key, value] of Object.entries(legacy)) if (value) sim.done[key] = true;
  // Older saves had no separate power, comms and water chains: a repaired radio meant contact.
  if (sim.done.radio) sim.done.inspectAntenna = true;
  if (sim.done.lander) Object.assign(sim.done, { inspectArray: true, cable: true, powerTest: true });
  if (sim.done.beacon) Object.assign(sim.done, { actuator: true });
  if (!Array.isArray(sim.plan)) sim.plan = [];
  if (!Array.isArray(sim.lastPlan)) sim.lastPlan = [];
  if (!Array.isArray(sim.notes)) sim.notes = [];
  if (!Number.isFinite(sim.water)) sim.water = cfg.water.start;
  syncLegacy(sim);
  return sim;
}

/** Keeps the flags that the 3D scene and older code read in step with the completed steps. */
function syncLegacy(sim) {
  sim.inspected = Boolean(sim.done.inspect);
  sim.sealBroken = !sim.done.seal;
  sim.radioBroken = !sim.done.radio;
  sim.debris = !sim.done.debris;
  sim.ready = { beacon: Boolean(sim.done.beacon), route: Boolean(sim.done.route), lander: Boolean(sim.done.lander) };
  sim.commsLevel = commsLevelOf(sim);
}

function commsLevelOf(sim) {
  return sim.done.align ? 3 : sim.done.actuator ? 2 : sim.done.radio ? 1 : 0;
}

/** 0 no link, 1 emergency beacon, 2 basic messages and telemetry, 3 full link. */
export function commsLevel(state) {
  return state.sim ? commsLevelOf(state.sim) : 2;
}

export function labor(state, alloc = state.alloc) {
  return Object.entries(alloc).reduce((sum, [key, n]) => sum + n * cfg.labor[key], 0);
}

export function planned(state) {
  return state.sim.plan.reduce((sum, key) => sum + cfg.tasks[key].hours, 0);
}

/** Work hours today. A tired astronaut works fewer hours (Mark's health). */
export function availableHours(state) {
  return cfg.hours - cfg.fatigueHours.filter((level) => state.fatigue >= level).length;
}

/** Extra generation from the base power system; the repaired main cable adds more. */
export function generationBonus(state) {
  if (!state.sim) return 0;
  return cfg.generationBonus + (cfg.generationBySite[state.site] ?? 0) + (state.sim.done.cable ? cfg.cableBonus : 0);
}

/** Night energy for base load and heating. */
export function nightNeed(state) {
  const extra = state.sim && !state.sim.done.insulation ? cfg.damagedInsulationHeat : 0;
  return cfg.nightBase + CONFIG.siteRules[state.site].heatCubes + extra;
}

/**
 * Air lost today in sols of reserve, shared by the engine and the preview so they never disagree.
 * The scrubber (CO2 removal) with full power stops the loss; without it Mark has to use stored air.
 */
export function airLoss(state, alloc = state.alloc, plan = state.sim?.plan ?? []) {
  const airLevel = alloc.air >= CONFIG.siteRules[state.site].airFullCubes ? 2 : alloc.air > 0 ? 1 : 0;
  const base = CONFIG.airUseByCubes[airLevel];
  const faults = CONFIG.oxygenMultiplier;
  let factor = 1;
  if (state.scrubberBroken) factor *= faults.scrubberBroken;
  if (state.damage > CONFIG.leakDamage) factor *= faults.leak;
  let total = factor > 1 ? Math.max(base, faults.minLossWhenFaulty) * factor : base;
  const sim = state.sim;
  if (sim) {
    const patched = sim.patchUntil > state.sol || plan.includes("patch") || plan.includes("seal");
    if (!sim.done.seal && !patched) total += cfg.sealLoss;
    if (!sim.done.co2 && !plan.includes("co2")) total += cfg.co2Loss;
  }
  return { base, total: round(total) };
}

/** Water used today in sols of reserve: drinking and hygiene after recycling, the leak and plants. */
export function waterUse(state, farmSteps = 0, plan = state.sim?.plan ?? []) {
  const sim = state.sim, w = cfg.water;
  if (!sim) return 0;
  let leak = 0;
  if (!sim.done.pipe && !plan.includes("pipe")) leak = sim.done.isolate || plan.includes("isolate") ? w.isolatedLeak : w.leak;
  const recycling = sim.done.pumpTest || plan.includes("pumpTest") ? w.recovery : 0;
  return round(w.use + leak + farmSteps * w.farmStep - recycling);
}

/** Greenhouse growth steps the simulator allows today. */
export function farmSteps(state, cubes) {
  const sim = state.sim;
  if (!sim) return cubes * CONFIG.farm.stepPerCube;
  let steps = cubes * CONFIG.farm.stepPerCube;
  if (!sim.done.lights && !sim.plan.includes("lights")) steps = Math.min(steps, cfg.damagedLightsMaxSteps);
  const waterLeft = sim.water - waterUse(state, 0);
  return Math.max(0, Math.min(steps, Math.floor(waterLeft / cfg.water.farmStep)));
}

/** Why a step is not possible right now, or null when it can be planned. */
export function taskBlocker(state, key) {
  const sim = state.sim, task = cfg.tasks[key];
  if (!sim || !task) return "unknown";
  if (state.status !== "playing" || state.phase !== "day") return "notDay";
  if (sim.plan.includes(key)) return "queued";
  if (!task.repeat && sim.done[key]) return "done";
  const missing = (task.requires ?? []).filter((need) => !sim.done[need]);
  if (missing.length) return "needs:" + missing[0];
  switch (key) {
    case "panel": if (!state.panels.broken) return "nothing"; break;
    case "clean": if (!state.panels.dusty) return "nothing"; break;
    case "patch": if (sim.done.seal || sim.patchUntil > state.sol || sim.plan.includes("seal")) return "nothing"; break;
    case "seal": if (sim.plan.includes("patch")) return "nothing"; break;
    case "near": case "far":
      if (sim.crates[key] || sim.plan.some((k) => k === "near" || k === "far")) return "nothing"; break;
    case "robot": if (sim.robotUsed || sim.done.inspect) return "nothing"; break;
    case "rest": if (state.fatigue <= 0) return "nothing"; break;
    case "depart":
      if (state.sol < cfg.evacuationFrom || sim.departed) return "notYet";
      if (!sim.done.seal && !(sim.patchUntil > state.sol)) return "needs:seal";
      break;
  }
  if (state.cubes < task.cubes) return "energy";
  if (sim.spares < task.parts) return "parts";
  if (state.oxygen <= task.oxygen) return "air";
  if (planned(state) + labor(state) + task.hours > availableHours(state)) return "hours";
  return null;
}

export function canTask(state, key) {
  return taskBlocker(state, key) === null;
}

export function queueTask(state, key) {
  if (!canTask(state, key)) return false;
  const task = cfg.tasks[key];
  state.cubes -= task.cubes;
  state.sim.spares -= task.parts;
  state.oxygen = round(state.oxygen - task.oxygen);
  state.sim.plan.push(key);
  return true;
}

export function cancelTask(state, key) {
  const i = state.sim?.plan.indexOf(key) ?? -1;
  if (i < 0) return false;
  const task = cfg.tasks[key];
  state.sim.plan.splice(i, 1);
  state.cubes += task.cubes;
  state.sim.spares += task.parts;
  state.oxygen = round(state.oxygen + task.oxygen);
  return true;
}

/** LOCKED, AVAILABLE, IN_PROGRESS or COMPLETED, computed from completed steps only. */
export function missionStatus(state, id) {
  const sim = state.sim, mission = cfg.missions[id];
  if (!sim || !mission) return "LOCKED";
  if (sim.done[mission.goal] || (id === "rescue" && sim.departed)) return "COMPLETED";
  const steps = missionSteps(id);
  if (steps.some((key) => sim.done[key] || sim.plan.includes(key))) return "IN_PROGRESS";
  const open = steps.some((key) => (cfg.tasks[key].requires ?? []).every((need) => sim.done[need]));
  return open ? "AVAILABLE" : "LOCKED";
}

export function missionSteps(id) {
  return Object.keys(cfg.tasks).filter((key) => cfg.tasks[key].mission === id);
}

export function missionSummary(state) {
  return MISSION_IDS.map((id) => ({ id, priority: cfg.missions[id].priority, status: missionStatus(state, id) }));
}

export function startSimulationSol(state) {
  const sim = state.sim;
  if (!sim) return;
  sim.notes = [];
  if (sim.patchUntil && state.sol >= sim.patchUntil) {
    sim.patchUntil = 0;
    state.damage = Math.min(CONFIG.damageLimit, state.damage + cfg.patchDamageReturn);
    sim.notes.push("patchExpired");
  }
  if (sim.sentSol != null && sim.sentSol < state.sol) {
    sim.reply = { sentSol: sim.sentSol, receivedSol: state.sol, stale: sim.sentDamage !== state.damage };
    sim.sentSol = null;
  }
  sim.plan = [];
}

/** Completes the reserved steps at sunset. Returns the comms level before the work, for the engine. */
export function settleSimulationDay(state, blocked) {
  const sim = state.sim;
  if (!sim) return 0;
  const levelBefore = commsLevelOf(sim);
  sim.lastPlan = [];
  for (const key of [...sim.plan]) {
    const task = cfg.tasks[key];
    // A shelter or cleaning decision keeps Mark indoors: field and maintenance work is refunded.
    if (blocked && key !== "robot" && key !== "rest") {
      cancelTask(state, key);
      sim.notes.push("cancelled");
      continue;
    }
    sim.lastPlan.push(key);
    if (!task.repeat) sim.done[key] = true;
    sim.notes.push("done:" + key);
    if (key === "patch") {
      sim.patchUntil = state.sol + cfg.patchSols;
      state.damage = Math.max(0, state.damage - cfg.patchDamageReturn);
    }
    if (key === "seal") {
      sim.patchUntil = 0;
      state.damage = Math.max(0, state.damage - cfg.patchDamageReturn);
    }
    if (key === "panel") state.panels.broken = Math.max(0, state.panels.broken - 1);
    if (key === "clean") state.panels.dusty = Math.max(0, state.panels.dusty - 1);
    if (key === "rest") state.fatigue = Math.max(0, state.fatigue - 1);
    if (key === "near" || key === "far") {
      sim.crates[key] = true;
      state.food += task.food;
      sim.spares += cfg.crateParts[key];
      if (state.weather === "storm") {
        state.damage = Math.min(CONFIG.damageLimit, state.damage + CONFIG.events.rover.stormDamage);
        sim.notes.push("evaStorm");
      }
    }
    if (key === "robot") {
      sim.robotUsed = true;
      sim.done.inspect = true;
      sim.notes.push("scouted");
    }
    if (key === "debris") sim.spares += cfg.salvageParts;
    if (key === "depart") sim.departed = true;
  }
  sim.plan = [];
  syncLegacy(sim);
  return levelBefore;
}

/** Uses water at sunset. Without water the plants stop and Mark gets tired. */
export function settleWater(state, steps) {
  const sim = state.sim;
  if (!sim) return;
  sim.water = Math.min(cfg.water.capacity, round(sim.water - waterUse(state, steps, [])));
  if (sim.water <= 0) {
    sim.water = 0;
    state.fatigue += cfg.water.dehydrationFatigue;
    sim.notes.push("thirsty");
  }
}

export function previewSimulation(state) {
  const sim = state.sim;
  if (!sim) return null;
  const need = nightNeed(state);
  const charge = Math.min(cfg.batteryCapacity, sim.battery + state.cubes + state.alloc.heat);
  const steps = farmSteps(state, state.alloc.farm);
  return {
    hours: planned(state) + labor(state), total: availableHours(state), charge, need,
    after: Math.max(0, charge - need), oxygen: airLoss(state).total,
    water: sim.water, waterUse: waterUse(state, steps), comms: commsLevelOf(sim),
    blockedFarm: sim.plan.includes("far"), ready: Object.values(sim.ready).filter(Boolean).length,
  };
}

/** Final grade of a rescue for the ending screen. */
export function rescueRating(state) {
  const sim = state.sim;
  if (!sim || state.status !== "rescued") return null;
  const optional = MISSION_IDS.filter((id) => cfg.missions[id].priority === "optional");
  const allOptional = optional.every((id) => missionStatus(state, id) === "COMPLETED");
  if (allOptional && state.stars >= 1 && state.damage < 30) return "exceptional";
  if (state.oxygen < CONFIG.lowReserveSols || state.food < CONFIG.lowReserveSols || sim.water < CONFIG.lowReserveSols) return "limited";
  if (state.damage >= 40 || state.panels.broken + state.panels.dusty > 1) return "damaged";
  return "operational";
}
