// Role 1 engine tests. Run: node --test tests/
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { CONFIG } from "../src/config.js";
import {
  STATE, allocate, endSol, getActiveEvent, getBlockedSystems, getEndReport, hasSave, load, newGame, on,
  resolveEvent, save, setSpeed, skipToDecision, tick,
} from "../src/engine.js";
import { playMission, runBatch } from "../tools/sim.js";

// ---------- helpers ----------

function memoryStorage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return {
    items,
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
  };
}

function useStorage(storage) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
}

afterEach(() => {
  delete globalThis.localStorage;
});

function answerDefaults() {
  for (let event = getActiveEvent(); event; event = getActiveEvent()) {
    resolveEvent(event.id, event.defaultChoice);
  }
}

/** Plays careful days until an event of `type` is open. Returns it or null. */
function playUntil(type, options) {
  newGame(options);
  for (let day = 0; day < 40 && STATE.status === "playing"; day++) {
    if (STATE.phase !== "day") skipToDecision();
    for (let event = getActiveEvent(); event; event = getActiveEvent()) {
      if (event.type === type) return event;
      resolveEvent(event.id, event.defaultChoice);
    }
    allocate("air", 2);
    allocate("farm", 1);
    allocate("heat", 1);
    endSol();
  }
  return null;
}

/** Ends the current sol and runs the night through to the next day. */
function nextDay() {
  endSol();
  skipToDecision();
}

// Cubes at the start of the current sol by the TZ 3.4 formula, with active consequences.
function expectedCubes() {
  const base = CONFIG.cubesByWeather[STATE.weather] + CONFIG.siteRules[STATE.site].bonusCubes;
  const down = STATE.panels.broken + STATE.panels.dusty;
  const fatigue = STATE.fatigue >= CONFIG.cubePenalty.fatigueAt ? CONFIG.cubePenalty.fatigue : 0;
  const consequences = STATE.pending
    .filter((item) => item.fired && STATE.sol >= item.fromSol && STATE.sol <= item.toSol)
    .reduce((sum, item) => sum + item.cubes, 0);
  return Math.max(0, base - down * CONFIG.cubePenalty.perDownPanel - fatigue - consequences);
}

// ---------- setup ----------

test("newGame follows the STATE contract and validates options", () => {
  newGame({ seed: 1 });
  assert.deepEqual(Object.keys(STATE).sort(), [
    "alloc", "crates", "crop", "cubes", "damage", "difficulty", "dose", "fatigue", "flares",
    "food", "forecast", "log", "oxygen", "panels", "paused", "pending", "phase", "scrubberBroken",
    "seed", "site", "sol", "solarMode", "speed", "stars", "status", "weather",
  ]);
  assert.equal(STATE.sol, 1);
  assert.equal(STATE.phase, "morning");
  assert.equal(STATE.status, "playing");
  assert.equal(STATE.oxygen, CONFIG.difficulties.engineer.oxygen);
  assert.equal(STATE.cubes, CONFIG.cubesByWeather.clear + CONFIG.siteRules.gale.bonusCubes);
  assert.throws(() => newGame({ site: "olympus" }), RangeError);
  assert.throws(() => newGame({ difficulty: "hard" }), RangeError);
  assert.throws(() => newGame({ seed: Number.NaN }), RangeError);
  assert.throws(() => newGame({ presentation: { act: 4 } }), RangeError);
});

test("the same seed replays the same mission, other seeds change the events", () => {
  assert.deepEqual(playMission({ seed: 7 }), playMission({ seed: 7 }));
  const orders = [0, 1, 2, 3, 4].map((seed) => {
    const seen = [];
    const off = on("event", (event) => seen.push(`${event.sol}:${event.type}`));
    playMission({ seed });
    off();
    return seen.join(",");
  });
  assert.ok(new Set(orders).size > 1, "different seeds give different event orders");
});

// ---------- systems ----------

test("allocate respects the day phase, tutorial unlocks, limits and free cubes", () => {
  newGame({ seed: 1 });
  assert.equal(allocate("air", 1), false, "no allocation in the morning");
  skipToDecision();
  assert.equal(allocate("farm", 1), false, "farm opens on sol 2");
  assert.equal(allocate("air", CONFIG.maxAlloc.air + 1), false);
  assert.equal(allocate("air", 1.5), false);
  assert.equal(allocate("air", -1), false);
  assert.equal(allocate("air", 2), true);
  assert.equal(STATE.cubes, expectedCubes() - 2);
  assert.equal(allocate("air", -1), true);
  assert.equal(STATE.alloc.air, 1);
  endSol();
  assert.equal(STATE.cubes, 0, "unplaced cubes burn in the evening");
});

test("air cubes set the oxygen loss and Jezero needs one cube less", () => {
  for (const [site, cubes, loss] of [
    ["gale", 0, 1], ["gale", 1, 0.5], ["gale", 2, 0], ["jezero", 1, 0], ["jezero", 0, 1],
  ]) {
    newGame({ seed: 2, site });
    skipToDecision();
    const before = STATE.oxygen;
    if (cubes) allocate("air", cubes);
    endSol();
    assert.equal(before - STATE.oxygen, loss, `${site} with ${cubes} air cubes`);
  }
});

test("two nights without heat give a cold that costs a cube for two sols", () => {
  newGame({ seed: 4 });
  // Heat opens on sol 4. Leave the nights of sols 4 and 5 unheated.
  const lastColdSol = CONFIG.unlockSol.heat + CONFIG.consequences.cold.nightsWithoutHeat - 1;
  while (STATE.sol < lastColdSol || STATE.phase !== "evening") {
    skipToDecision();
    answerDefaults();
    allocate("air", 2);
    endSol();
  }
  assert.equal(STATE.fatigue, CONFIG.consequences.cold.nightsWithoutHeat - 1, "the last night is still ahead");
  skipToDecision();
  assert.equal(STATE.sol, lastColdSol + 1);
  const cold = STATE.pending.find((item) => item.kind === "cold");
  assert.ok(cold?.fired, "cold consequence fired");
  assert.equal(cold.sol, lastColdSol);
  assert.equal(cold.fromSol, STATE.sol);
  assert.equal(cold.toSol, STATE.sol + CONFIG.consequences.cold.sols - 1);
  assert.equal(cold.cubes, CONFIG.consequences.cold.cubes);
  assert.equal(getActiveEvent()?.type, "consequence");
  assert.equal(getActiveEvent().data.kind, "cold");
  assert.equal(STATE.cubes, expectedCubes());
});

// ---------- events ----------

test("every mission has a storm", () => {
  for (let seed = 0; seed < 40; seed++) {
    let storms = 0;
    const off = on("event", (event) => { if (event.type === "storm") storms += 1; });
    playMission({ seed, site: CONFIG.sites[seed % 3] });
    off();
    assert.ok(storms > 0, `seed ${seed} has a storm`);
  }
});

test("the storm timer runs in real seconds and defaults to keeping the panels", () => {
  const storm = playUntil("storm", { seed: 3 });
  assert.ok(storm);
  assert.equal(storm.timeoutMs, CONFIG.difficulties.engineer.stormDecisionMs);
  assert.deepEqual(storm.choices.map((choice) => choice.id), ["fold", "keep"]);
  assert.equal(STATE.paused, true, "autopause");
  setSpeed(4);
  setSpeed(0); // even a user pause does not stop the decision timer
  tick(storm.timeoutMs - 1);
  assert.equal(getActiveEvent()?.id, storm.id);
  assert.equal(getActiveEvent().remainingMs, 1);
  tick(1);
  assert.notEqual(getActiveEvent()?.id, storm.id);
  assert.ok(STATE.log.some((entry) => entry.choice === "storm.keep"));

  const cadetStorm = playUntil("storm", { seed: 3, difficulty: "cadet" });
  assert.equal(cadetStorm.timeoutMs, CONFIG.difficulties.cadet.stormDecisionMs);
});

test("time controls never skip a decision", () => {
  newGame({ seed: 1 });
  skipToDecision();
  allocate("air", 2);
  endSol();
  setSpeed(4);
  tick(10 * 60_000);
  assert.equal(STATE.sol, CONFIG.schedule.cropChoiceSol);
  assert.equal(STATE.phase, "day");
  assert.equal(getActiveEvent()?.type, "cropChoice");
  assert.equal(skipToDecision(), false);
  assert.equal(resolveEvent(getActiveEvent().id, "potato"), true);
  assert.equal(STATE.crop.type, "potato");
  assert.equal(STATE.paused, false, "autopause ends after the answer");
});

test("pause stops the phases and a speed resumes them", () => {
  newGame({ seed: 5 });
  setSpeed(0);
  tick(60_000);
  assert.equal(STATE.phase, "morning");
  assert.equal(setSpeed(3), false);
  setSpeed(2);
  assert.equal(STATE.paused, false);
  tick(CONFIG.phasesMs.morning / 2);
  assert.equal(STATE.phase, "day");
});

test("endSol answers open events with their default choice", () => {
  const crop = playUntil("cropChoice", { seed: 1 });
  assert.ok(crop);
  assert.equal(endSol(), true);
  assert.equal(getActiveEvent(), null);
  assert.equal(STATE.phase, "evening");
  assert.ok(STATE.log.some((entry) => entry.choice === `cropChoice.${CONFIG.defaults.crop}`));
});

test("resolveEvent rejects wrong IDs, unknown choices and unaffordable choices", () => {
  const crop = playUntil("cropChoice", { seed: 1 });
  assert.equal(resolveEvent("nope", "radish"), false);
  assert.equal(resolveEvent(crop.id, "banana"), false);
  const scrubber = (() => {
    for (let seed = 0; seed < 30; seed++) {
      const event = playUntil("scrubber", { seed });
      if (event) return event;
    }
    return null;
  })();
  assert.ok(scrubber);
  while (allocate("air", 1) || allocate("farm", 1) || allocate("heat", 1) || allocate("science", 1));
  if (STATE.cubes < CONFIG.events.scrubber.fixCubes) {
    assert.equal(getActiveEvent().choices.find((choice) => choice.id === "fix").disabled, true);
    assert.equal(resolveEvent(scrubber.id, "fix"), false);
  }
  assert.equal(resolveEvent(scrubber.id, "later"), true);
  assert.equal(STATE.scrubberBroken, true);
});

/** Finds the first seed where an event of `type` happens and leaves it open. */
function findEvent(type, options = {}) {
  for (let seed = 0; seed < 60; seed++) {
    const event = playUntil(type, { ...options, seed });
    if (event) return event;
  }
  return null;
}

test("getBlockedSystems names the systems a decision closed until the next sol (#11)", () => {
  newGame({ seed: 1 });
  assert.deepEqual(getBlockedSystems(), {});

  const flare = findEvent("flare");
  assert.ok(flare);
  assert.equal(allocate("farm", 1), true, "planning is allowed while the event is open");
  const freeBefore = STATE.cubes;
  resolveEvent(flare.id, "shelter");
  assert.deepEqual(getBlockedSystems(), { farm: "flare.shelter", repair: "flare.shelter" });
  assert.equal(STATE.alloc.farm, 0, "cubes in a closed system come back");
  assert.equal(STATE.cubes, freeBefore + 1);
  assert.equal(allocate("farm", 1), false);
  assert.equal(allocate("repair", 1), false);
  assert.equal(allocate("air", 1), true, "other systems stay open");
  getBlockedSystems().air = "changed";
  assert.equal(getBlockedSystems().air, undefined, "the result is a copy");
  nextDay();
  assert.deepEqual(getBlockedSystems(), {}, "the next sol opens everything again");

  const storm = findEvent("storm");
  resolveEvent(storm.id, "fold");
  assert.deepEqual(getBlockedSystems(), { heat: "storm.fold" });
  assert.equal(allocate("heat", 1), false);

  const dust = findEvent("dustyPanels");
  resolveEvent(dust.id, "clean");
  assert.deepEqual(getBlockedSystems(), { farm: "dustyPanels.clean", repair: "dustyPanels.clean" });

  const rover = findEvent("roverCrate");
  resolveEvent(rover.id, "food");
  assert.deepEqual(getBlockedSystems(), { farm: "roverCrate.food" });

  const keep = findEvent("storm");
  resolveEvent(keep.id, "keep");
  assert.deepEqual(getBlockedSystems(), {}, "choices without blocks close nothing");
});

test("cleaning removes the dust from every panel and power returns the next sol", () => {
  const dust = findEvent("dustyPanels");
  assert.ok(dust);
  STATE.panels.dusty = 2; // dust left by an earlier storm
  resolveEvent(dust.id, "clean");
  assert.equal(STATE.panels.dusty, 0, "the panels are clean");
  assert.deepEqual(STATE.log.at(-1).cost, { panels: -2 });
  allocate("air", 2);
  nextDay();
  assert.equal(STATE.panels.dusty, 0);
  assert.equal(STATE.cubes, expectedCubes(), "no dusty-panel penalty");

  const again = findEvent("dustyPanels");
  const before = STATE.panels.dusty;
  resolveEvent(again.id, "live");
  assert.equal(STATE.panels.dusty, before + 1, "living with the dust adds a dusty panel");
});

test("working through a strong flare causes a dose consequence on the next sol", () => {
  for (let seed = 0; seed < 60; seed++) {
    const flare = playUntil("flare", { seed });
    if (!flare || flare.data.flareClass === "C") continue;
    const flareClass = flare.data.flareClass;
    resolveEvent(flare.id, "work");
    const dose = STATE.pending.find((item) => item.kind === "dose");
    assert.equal(dose.triggerSol, flare.sol + 1);
    assert.equal(dose.choice, "flare.work");
    allocate("air", 2);
    nextDay();
    const event = getActiveEvent();
    assert.equal(event?.type, "consequence");
    assert.deepEqual([event.data.kind, event.data.sourceSol, event.data.sourceChoice],
      ["dose", flare.sol, "flare.work"]);
    assert.ok(dose.fired);
    assert.equal(dose.cubes, CONFIG.events.flare.doseCubes[flareClass]);
    assert.equal(dose.toSol - dose.fromSol + 1, CONFIG.events.flare.doseSols[flareClass]);
    assert.equal(STATE.cubes, expectedCubes());
    return;
  }
  assert.fail("no M or X flare found");
});

test("flares use the class of real NASA records", () => {
  const solarData = { mode: "archive", flares: [{ classType: "X1.1", beginTime: "2024-05-14T16:46Z" }] };
  const flare = playUntil("flare", { seed: 4, solarData });
  assert.equal(flare.data.flareClass, "X");
  assert.deepEqual(flare.data.flare,
    { beginTime: "2024-05-14T16:46Z", classType: "X1.1", flrID: null, link: null });
});

test("flare events keep the DONKI record id and link for the facts screen", () => {
  const record = {
    flrID: "2024-05-14T16:46:00-FLR-001", beginTime: "2024-05-14T16:46Z", classType: "X8.7",
    link: "https://ccmc.gsfc.nasa.gov/DONKI/view/Alert/30851/1",
  };
  const flare = playUntil("flare", { seed: 4, solarData: { mode: "archive", flares: [record] } });
  assert.deepEqual(flare.data.flare, record);
});

// ---------- saves and reports ----------

test("the engine saves every night, loads the same sol and clears the save after the end", () => {
  const storage = memoryStorage();
  useStorage(storage);
  newGame({ seed: 9 });
  for (let sol = 0; sol < 3; sol++) {
    skipToDecision();
    answerDefaults();
    allocate("air", 2);
    endSol();
  }
  skipToDecision();
  assert.equal(hasSave(), true);
  const savedSol = JSON.parse(storage.getItem(CONFIG.saveKey)).state.sol;
  newGame({ seed: 123 });
  assert.equal(load().sol, savedSol);
  assert.equal(STATE.sol, savedSol);
  while (STATE.status === "playing") nextDay(); // no cubes: a quick loss
  assert.equal(hasSave(), false);
});

test("a damaged, foreign or finished save never offers Continue (#9)", () => {
  const storage = memoryStorage();
  useStorage(storage);
  newGame({ seed: 9 });
  skipToDecision();
  allocate("air", 2);
  nextDay(); // the night autosaves sol 2
  const good = JSON.parse(storage.getItem(CONFIG.saveKey));
  assert.equal(hasSave(), true);

  const broken = {
    "not JSON": "{oops",
    "empty object": "{}",
    "another version": JSON.stringify({ ...good, v: CONFIG.saveVersion + 1 }),
    "no state": JSON.stringify({ v: good.v, meta: good.meta }),
    "finished mission": JSON.stringify({ ...good, state: { ...good.state, status: "rescued" } }),
    "sol out of range": JSON.stringify({ ...good, state: { ...good.state, sol: 99 } }),
    "unknown site": JSON.stringify({ ...good, state: { ...good.state, site: "olympus" } }),
    "negative oxygen": JSON.stringify({ ...good, state: { ...good.state, oxygen: -1 } }),
    "missing log": JSON.stringify({ ...good, state: { ...good.state, log: null } }),
    "missing engine data": JSON.stringify({ ...good, meta: { ...good.meta, queue: undefined } }),
  };
  newGame({ seed: 1 });
  for (const [name, raw] of Object.entries(broken)) {
    storage.setItem(CONFIG.saveKey, raw);
    assert.equal(hasSave(), false, `${name}: no Continue`);
    assert.equal(load(), null, `${name}: load gives null`);
    assert.equal(STATE.seed, 1, `${name}: the current game stays`);
  }
  assert.doesNotThrow(() => newGame({ seed: 2 }), "a new game still starts");
  storage.setItem(CONFIG.saveKey, JSON.stringify(good));
  assert.equal(hasSave(), true);
  assert.equal(load().sol, good.state.sol);
});

test("saves fail quietly without storage", () => {
  newGame({ seed: 1 });
  assert.equal(save(), false);
  assert.equal(load(), null);
  assert.equal(hasSave(), false);
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true, get() { throw new Error("blocked"); },
  });
  assert.equal(save(), false);
  assert.equal(load(), null);
  assert.equal(hasSave(), false);
});

test("a game over reports at most three decision chains, most expensive first", () => {
  let report;
  const off = on("gameover", (payload) => { report = payload; });
  newGame({ seed: 11 });
  while (STATE.status === "playing") nextDay();
  off();
  assert.equal(report.status, "emergencySleep");
  assert.deepEqual(report, getEndReport());
  assert.ok(report.chains.length >= 1 && report.chains.length <= 3);
  for (let i = 1; i < report.chains.length; i++) {
    assert.ok(report.chains[i - 1].score >= report.chains[i].score);
  }
  for (const chain of report.chains) assert.ok(Array.isArray(chain.effects));
});

// ---------- presentation ----------

test("presentation act 3 always shows a storm on sol 22 and an X flare on sol 23 (#8)", () => {
  const noData = { mode: "archive", flares: [] };
  for (const solarData of [undefined, noData]) { // NASA archive, then no flare data at all
    for (let seed = 0; seed < 40; seed++) {
      const seen = [];
      const off = on("event", (event) => seen.push(`${event.sol}:${event.type}:${event.data.flareClass ?? ""}`));
      playMission({ seed, site: "gale", presentation: { act: 3 }, ...(solarData && { solarData }) });
      off();
      assert.ok(seen.includes("22:storm:"), `seed ${seed}: storm on sol 22`);
      assert.ok(seen.includes("23:flare:X"), `seed ${seed}: X flare on sol 23`);
    }
  }
  newGame({ presentation: { act: 3 } });
  assert.equal(STATE.sol, CONFIG.presentation.acts[3].sol);
  assert.equal(STATE.speed, CONFIG.presentation.speed);
});

test("presentation never reads, writes or clears the player's save", () => {
  const storage = memoryStorage({ [CONFIG.saveKey]: "{\"v\":1,\"player\":true}" });
  useStorage(storage);
  newGame({ seed: 3, presentation: { act: 3 } });
  while (STATE.status === "playing") nextDay();
  assert.equal(storage.getItem(CONFIG.saveKey), "{\"v\":1,\"player\":true}");
});

// ---------- balance ----------

test("balance stays on target and no mission reaches an impossible state", () => {
  // tools/sim.js throws on impossible states, so these runs also check invariants.
  const count = 300;
  const smart = runBatch({ count, strategy: "smart" });
  const random = runBatch({ count, strategy: "random" });
  const smartRate = smart.wins / count;
  assert.ok(smartRate >= 0.4 && smartRate <= 0.6, `smart engineer wins ${smartRate}`);
  assert.ok(random.wins / count < 0.1, `random engineer wins ${random.wins / count}`);
});
