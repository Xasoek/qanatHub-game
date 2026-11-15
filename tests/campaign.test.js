// Engineering campaign: missions, prerequisites, interconnected systems, saves and balance.
import test from "node:test";
import assert from "node:assert/strict";
import {
  STATE, newGame, allocate, planTask, unplanTask, skipToDecision, endSol, reviewSol, resolveEvent,
  getActiveEvent, save, load, missionBoard, taskReason, simulationPreview, getEndReport,
} from "../src/engine.js";
import { CONFIG } from "../src/config.js";
import { airLoss, waterUse } from "../src/simulator.js";
import { playCampaign, failureReason } from "../tools/campaign-bot.js";

const sim = CONFIG.simulation;

function day() {
  if (["evening", "night"].includes(STATE.phase)) reviewSol();
  skipToDecision();
  for (let event = getActiveEvent(); event; event = getActiveEvent()) resolveEvent(event.id, event.defaultChoice);
}
function finishDay() {
  endSol();
  for (let event = getActiveEvent(); event; event = getActiveEvent()) resolveEvent(event.id, event.defaultChoice);
}
function memoryStorage() {
  const data = new Map();
  return { setItem: (k, v) => data.set(k, v), getItem: (k) => data.get(k) ?? null, removeItem: (k) => data.delete(k) };
}

test("every mission has a goal step, steps belong to known missions and prerequisites exist", () => {
  for (const [id, mission] of Object.entries(sim.missions)) {
    assert.ok(sim.tasks[mission.goal], id);
    assert.equal(sim.tasks[mission.goal].mission, id);
    assert.ok(["critical", "optional"].includes(mission.priority));
  }
  for (const [key, task] of Object.entries(sim.tasks)) {
    for (const need of task.requires ?? []) assert.ok(sim.tasks[need], `${key} needs ${need}`);
    assert.ok(task.hours > 0 && task.hours <= sim.hours, key);
  }
});

test("optional missions never sit on the rescue path", () => {
  const optional = new Set(Object.entries(sim.missions).filter(([, m]) => m.priority === "optional").map(([id]) => id));
  const seen = new Set();
  const walk = (key) => {
    if (seen.has(key)) return;
    seen.add(key);
    assert.ok(!optional.has(sim.tasks[key].mission), `rescue path reaches optional step ${key}`);
    for (const need of sim.tasks[key].requires ?? []) walk(need);
  };
  walk("depart");
});

test("missions start locked or available and a diagnostic step unlocks the repair", () => {
  newGame({ simulation: true, seed: 11 });
  day();
  const board = Object.fromEntries(missionBoard().map((m) => [m.id, m.status]));
  assert.equal(board.power, "AVAILABLE");
  assert.equal(board.water, "AVAILABLE");
  assert.equal(taskReason("cable"), "needs:inspectArray");
  assert.equal(planTask("cable"), false);
  assert.equal(planTask("inspectArray"), true);
  assert.equal(missionBoard().find((m) => m.id === "power").status, "IN_PROGRESS");
  finishDay();
  day();
  assert.equal(STATE.sim.done.inspectArray, true);
  assert.equal(taskReason("cable"), null);
});

test("the repaired main cable raises generation and a reserved step refunds its costs", () => {
  newGame({ simulation: true, seed: 12, site: "gale" });
  day();
  planTask("inspectArray");
  finishDay();
  day();
  const before = { cubes: STATE.cubes, parts: STATE.sim.spares, oxygen: STATE.oxygen };
  assert(planTask("cable"));
  assert(unplanTask("cable"));
  assert.deepEqual({ cubes: STATE.cubes, parts: STATE.sim.spares, oxygen: STATE.oxygen }, before);
  assert(planTask("cable"));
  const generatedBefore = STATE.sim.generated;
  finishDay();
  day();
  assert.equal(STATE.sim.done.cable, true);
  const sameWeather = STATE.weather;
  assert.ok(STATE.sim.generated >= generatedBefore || sameWeather !== "clear");
  assert.equal(STATE.sim.generated, Math.max(0, CONFIG.cubesByWeather[STATE.weather] + CONFIG.siteRules.gale.bonusCubes
    + sim.cableBonus + sim.generationBySite.gale - STATE.panels.broken - STATE.panels.dusty
    - (STATE.fatigue >= CONFIG.cubePenalty.fatigueAt ? CONFIG.cubePenalty.fatigue : 0)
    - STATE.pending.filter((p) => p.fired && p.cubes && STATE.sol >= p.fromSol && STATE.sol <= p.toSol).reduce((s, p) => s + p.cubes, 0)));
});

test("CO2 removal and the airlock seal are separate air losses shared by engine and preview", () => {
  newGame({ simulation: true, seed: 13 });
  day();
  allocate("air", CONFIG.siteRules[STATE.site].airFullCubes);
  const full = airLoss(STATE).total;
  assert.equal(full, sim.sealLoss + sim.co2Loss); // scrubber powered, but no CO2 cartridge and a leaking seal
  assert.equal(simulationPreview().oxygen, full);
  const oxygen = STATE.oxygen;
  finishDay();
  assert.equal(STATE.oxygen, Math.round((oxygen - full) * 100) / 100);
});

test("the water leak, isolation, pipe and recycler change water use", () => {
  newGame({ simulation: true, seed: 14 });
  day();
  const leak = waterUse(STATE);
  assert.equal(leak, sim.water.use + sim.water.leak);
  planTask("findLeak");
  finishDay();
  day();
  planTask("isolate");
  assert.equal(waterUse(STATE), sim.water.use + sim.water.isolatedLeak);
  const water = STATE.sim.water;
  finishDay();
  assert.ok(STATE.sim.water < water);
  STATE.sim.done.pipe = STATE.sim.done.pumpTest = true;
  assert.equal(waterUse(STATE), Math.round((sim.water.use - sim.water.recovery) * 100) / 100);
});

test("communication rises in three levels and Earth answers each one", () => {
  newGame({ simulation: true, seed: 15 });
  const messages = [];
  for (let d = 0; d < 12 && STATE.status === "playing"; d++) {
    if (["evening", "night"].includes(STATE.phase)) reviewSol();
    skipToDecision();
    for (let event = getActiveEvent(); event; event = getActiveEvent()) {
      if (event.type.startsWith("earth")) messages.push(event.type);
      resolveEvent(event.id, event.defaultChoice);
    }
    allocate("air", 2);
    for (const key of ["inspectAntenna", "radio", "actuator", "align"]) planTask(key);
    STATE.sim.spares = 6; // this test is about the link, not the parts budget
    endSol();
  }
  assert.equal(STATE.sim.commsLevel, 3);
  for (const type of ["earthContact", "earthLink", "earthPlan"]) assert.ok(messages.includes(type), type);
});

test("fatigue shortens the workday and rest restores it", () => {
  newGame({ simulation: true, seed: 16 });
  day();
  STATE.fatigue = sim.fatigueHours[1];
  assert.equal(simulationPreview().total, sim.hours - 2);
  assert(planTask("rest"));
  finishDay();
  assert.equal(STATE.fatigue, sim.fatigueHours[1] - 1);
});

test("a save from before the campaign loads with safe defaults and keeps its repairs", () => {
  const storage = memoryStorage();
  globalThis.localStorage = storage;
  try {
    newGame({ simulation: true, seed: 17 });
    day();
    save();
    const raw = JSON.parse(storage.getItem(CONFIG.saveKey));
    // Shape of an older save: legacy flags only.
    const old = raw.state.sim;
    for (const key of ["done", "water", "commsLevel"]) delete old[key];
    Object.assign(old, { inspected: true, sealBroken: false, radioBroken: false, debris: true });
    storage.setItem(CONFIG.saveKey, JSON.stringify(raw));
    assert.ok(load());
    assert.equal(STATE.sim.done.seal, true);
    assert.equal(STATE.sim.done.radio, true);
    assert.equal(STATE.sim.commsLevel, 1);
    assert.equal(STATE.sim.water, sim.water.start);
    assert.equal(STATE.sim.sealBroken, false);
    assert.equal(STATE.sim.debris, true);
  } finally {
    delete globalThis.localStorage;
  }
});

test("the rescue ending carries a rating and the mission board", () => {
  const report = playCampaign({ seed: 7, site: "gale", difficulty: "cadet" });
  assert.equal(report.status, "rescued");
  assert.ok(["exceptional", "operational", "damaged", "limited"].includes(report.simulation.rating));
  assert.equal(report.simulation.missions.find((m) => m.id === "rescue").status, "COMPLETED");
  assert.equal(getEndReport().simulation.rating, report.simulation.rating);
});

test("balance: a long campaign is winnable, cadet is easier, and random clicks rarely win", () => {
  const rate = (style, difficulty) => {
    let won = 0, games = 0;
    for (const site of CONFIG.sites) for (let s = 1; s <= 20; s++) {
      games++;
      if (failureReason(playCampaign({ seed: s * 2654435761 >>> 0, site, difficulty, style })) === "rescued") won++;
    }
    return (100 * won) / games;
  };
  const engineer = rate("sensible", "engineer");
  assert.ok(engineer > 0 && engineer < 100, `sensible engineer ${engineer}%`);
  assert.ok(rate("sensible", "cadet") > engineer, "cadet is easier");
  assert.ok(rate("random", "engineer") < 10, "random play rarely wins");
});

test("fatigue limits system work as well as queued steps, while air and refunds remain available", () => {
  newGame({simulation:true,seed:0});skipToDecision();
  STATE.fatigue=CONFIG.simulation.fatigueHours.at(-1);
  for(const key of ["inspectArray","inspectAir","findLeak","inspect"])assert.equal(planTask(key),true);
  assert.equal(allocate("farm",1),false);
  assert.equal(allocate("air",1),true);
  assert.equal(unplanTask("inspect"),true);
  assert.equal(allocate("farm",1),true);
  assert.equal(allocate("farm",-1),true);
});
