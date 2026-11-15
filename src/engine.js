// Role 1: game state, rules, events, delayed consequences and saves.
// The UI changes the game only through the exported functions.
import { makeSimulation, labor, planned, canTask, queueTask, cancelTask,
  startSimulationSol, settleSimulationDay, previewSimulation } from "./simulator.js";
import { CONFIG } from "./config.js";

export let STATE;
// Engine-only bookkeeping. It is saved together with STATE.
let meta;

const PHASES = Object.keys(CONFIG.phasesMs);
const listeners = new Map(["event", "phase", "gameover"].map((type) => [type, new Set()]));
// Log entries that record outcomes rather than player decisions.
const OUTCOMES = new Set(["sol.end", "farm.harvest"]);

export function on(type, fn) {
  const subscribers = listeners.get(type);
  if (!subscribers) throw new RangeError(`Unknown engine event: ${type}`);
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function emit(type, payload) {
  for (const listener of listeners.get(type)) listener(payload);
}

// ---------- Seeded randomness (mulberry32) ----------

function random() {
  meta.rng = (meta.rng + 0x6d2b79f5) >>> 0;
  let value = meta.rng;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
}
const randInt = (min, max) => min + Math.floor(random() * (max - min + 1));
const chance = (probability) => random() < probability;
const pick = (list) => list[Math.floor(random() * list.length)];

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// ---------- Small helpers ----------

const round = (value) => Math.round(value * 100) / 100;
const rules = () => CONFIG.siteRules[STATE.site];
const unlocked = (system) => Boolean(STATE.sim) || STATE.sol >= CONFIG.unlockSol[system];
const downPanels = () => STATE.panels.broken + STATE.panels.dusty;

function resetAllocation() {
  return Object.fromEntries(CONFIG.systems.map((system) => [system, 0]));
}

function addDamage(base) {
  const before = STATE.damage;
  STATE.damage = Math.min(CONFIG.damageLimit, before + Math.round(base * rules().damageMultiplier));
  return STATE.damage - before;
}

function logEntry(choice, cost = {}) {
  const entry={sol:STATE.sol,choice,cost,note:`log.${choice}`};
  STATE.log.push(entry);
  return STATE.log.length - 1;
}

function addEffect(logIndex, kind, cost) {
  if (logIndex == null) return;
  meta.effects.push({ logIndex, sol: STATE.sol, kind, cost });
}

function addPending({ kind, logIndex, triggerSol, sols = 1, cubes = 0, damage = 0 }) {
  STATE.pending.push({
    id: `${kind}-${STATE.sol}-${meta.nextId++}`, kind,
    sol: STATE.sol, choice: STATE.log[logIndex]?.choice ?? null, logIndex,
    triggerSol, fromSol: triggerSol, toSol: triggerSol + sols - 1, cubes, damage, fired: false,
  });
}

// Systems a decision closes for the rest of the sol. Their cubes come back.
function block(systems, logIndex) {
  for (const system of systems) {
    STATE.cubes += STATE.alloc[system];
    STATE.alloc[system] = 0;
    if (!meta.blocked.includes(system)) meta.blocked.push(system);
    meta.blockedBy[system] = logIndex;
  }
}

// ---------- Mission setup ----------

function buildSchedule() {
  const rulesForActs = CONFIG.schedule;
  const schedule = {
    [rulesForActs.cropChoiceSol]: "cropChoice",
    [rulesForActs.finalStormSol]: "storm",
  };
  for (const act of rulesForActs.acts) {
    const free = [];
    for (let sol = act.from; sol <= act.to; sol++) if (!schedule[sol]) free.push(sol);
    shuffle(free);
    const place = (type) => {
      const sol = free.pop();
      if (sol) schedule[sol] = type;
    };
    for (let i = 0; i < act.storms; i++) place("storm");
    for (let i = 0; i < act.flares; i++) place("flare");
    for (let i = 0; i < act.scrubber; i++) place("scrubber");
    const count = randInt(...act.random);
    for (let i = 0; i < count; i++) place(pick(rulesForActs.randomPool));
  }
  return schedule;
}

// Presentation mode: a storm and a strong flare right after the start.
function addShowcaseEvents() {
  const { stormAfter, flareAfter } = CONFIG.presentation;
  meta.schedule[STATE.sol + stormAfter] = "storm";
  meta.schedule[STATE.sol + flareAfter] = "flare";
  meta.showcaseFlareSol = STATE.sol + flareAfter;
}

/**
 * Starts a mission. `presentation: {act: 1|2|3}` starts that act with ready
 * reserves at x4 and never touches the save. Acts 2 and 3 open with a storm and a flare.
 */
export function newGame({ site = CONFIG.defaults.site, difficulty = CONFIG.defaults.difficulty,
  seed = CONFIG.defaults.seed, solarData, presentation = null, simulation = false } = {}) {
  if (!CONFIG.sites.includes(site)) throw new RangeError(`Unknown site: ${site}`);
  if (!Object.hasOwn(CONFIG.difficulties, difficulty)) {
    throw new RangeError(`Unknown difficulty: ${difficulty}`);
  }
  if (!Number.isFinite(seed)) throw new RangeError("seed must be a finite number");
  const act = presentation ? presentation.act ?? 3 : null;
  if (presentation && !Object.hasOwn(CONFIG.presentation.acts, act)) {
    throw new RangeError(`Unknown presentation act: ${act}`);
  }
  const preset = presentation ? CONFIG.presentation.acts[act] : {};
  const { oxygen, food } = CONFIG.difficulties[difficulty];
  meta = {
    elapsedInPhase: 0, rng: (seed >>> 0) ^ 0x9e3779b9, nextId: 1,
    schedule: {}, queue: [], active: null, autoPaused: false,
    blocked: [], blockedBy: {}, blackoutNight: null, zeroCubesNext: null, scrubberLog: null,
    coldNights: 0, damageStreak: 0, samples: 0, forecastAsked: false, flaresUsed: 0,
    warned: { oxygen: false, food: false }, effects: [],
    presentation: Boolean(presentation), showcaseFlareSol: null,
  };
  STATE = {
    sol: preset.sol ?? 1, phase: "morning", status: "playing", paused: false,
    speed: presentation ? CONFIG.presentation.speed : 1,
    site, difficulty,
    oxygen: preset.oxygen ?? oxygen, food: preset.food ?? food, damage: preset.damage ?? 0,
    cubes: 0, alloc: resetAllocation(),
    panels: { total: CONFIG.panels, broken: 0, dusty: 0 },
    crop: structuredClone(preset.crop ?? { type: CONFIG.defaults.crop, progress: 0 }),
    dose: 0, fatigue: 0, crates: 0, stars: 0,
    weather: "clear", forecast: null, scrubberBroken: false, pending: [], log: [],
    solarMode: solarData?.mode ?? "archive",
    flares: structuredClone(solarData?.flares ?? []),
    seed,
  };
  if (simulation) {
    STATE.sim=makeSimulation();
    if (!presentation) {
      STATE.damage=CONFIG.simulation.startingDamage;
      STATE.panels.broken=CONFIG.simulation.startingBroken;
      STATE.panels.dusty=CONFIG.simulation.startingDusty;
    }
    STATE.paused=true;
  }
  meta.schedule = buildSchedule();
  if (preset.showcase) addShowcaseEvents();
  startSol();
  return STATE;
}

// ---------- Start of a sol ----------

function rollWeather() {
  if (meta.schedule[STATE.sol] === "storm") return "storm";
  if (STATE.sol <= CONFIG.schedule.tutorialSols) return "clear";
  return chance(rules().dustyChance) ? "dusty" : "clear";
}

function computeCubes() {
  const penalty = CONFIG.cubePenalty;
  let cubes = CONFIG.cubesByWeather[STATE.weather] + rules().bonusCubes + (STATE.sim?CONFIG.simulation.generationBonus:0);
  cubes -= downPanels() * penalty.perDownPanel;
  if (STATE.fatigue >= penalty.fatigueAt) cubes -= penalty.fatigue;
  for (const item of STATE.pending) {
    if (item.fired && item.cubes && STATE.sol >= item.fromSol && STATE.sol <= item.toSol) {
      cubes -= item.cubes;
    }
  }
  return Math.max(0, cubes);
}

function firePending() {
  for (const item of STATE.pending) {
    if (item.fired || item.triggerSol > STATE.sol) continue;
    item.fired = true;
    const cost = {};
    if (item.damage) cost.damage = addDamage(item.damage);
    if (item.cubes) cost.cubes = item.cubes * (item.toSol - item.fromSol + 1);
    addEffect(item.logIndex, item.kind, cost);
    meta.queue.push({ type: "consequence",
      data: { kind: item.kind, sourceSol: item.sol, sourceChoice: item.choice, cost } });
  }
  STATE.pending = STATE.pending.filter((item) => !item.fired || STATE.sol <= item.toSol);
}

function deliverForecast() {
  const { forecastSols, staleChance } = CONFIG.comms;
  if (STATE.forecast && STATE.sol - STATE.forecast.sol >= forecastSols) STATE.forecast = null;
  if (!meta.forecastAsked) return;
  meta.forecastAsked = false;
  const ahead = (type) => {
    for (let sol = STATE.sol; sol < STATE.sol + forecastSols; sol++) {
      if (meta.schedule[sol] === type) return true;
    }
    return false;
  };
  const stale = chance(staleChance);
  const estimate = (coming) => (stale ? randInt(5, 95) : coming ? randInt(65, 90) : randInt(5, 20));
  STATE.forecast = { sol: STATE.sol, sols: forecastSols,
    storm: estimate(ahead("storm")), flare: estimate(ahead("flare")), stale };
  meta.queue.push({ type: "earthAdvice", data: { ...STATE.forecast } });
}

function checkReserves() {
  for (const resource of ["oxygen", "food"]) {
    const low = STATE[resource] < CONFIG.lowReserveSols;
    if (low && !meta.warned[resource]) {
      meta.queue.push({ type: "lowReserve", data: { resource, value: STATE[resource] } });
    }
    meta.warned[resource] = low;
  }
}

function startSol() {
  STATE.weather = rollWeather();
  startSimulationSol(STATE);
  firePending();
  if (updateStatus()) {
    finishGame();
    return;
  }
  const cubes = computeCubes();
  if (meta.zeroCubesNext != null) {
    addEffect(meta.zeroCubesNext, "noPower", { cubes });
    STATE.cubes = 0;
    meta.zeroCubesNext = null;
    if (STATE.sim) STATE.sim.battery=0;
  } else {
    STATE.cubes = cubes;
  }
  if (STATE.sim) STATE.sim.generated=STATE.cubes;
  STATE.alloc = resetAllocation();
  meta.blocked = [];
  meta.blockedBy = {};
  deliverForecast();
  checkReserves();
  const scheduled = meta.schedule[STATE.sol];
  if (scheduled) meta.queue.push({ type: scheduled, data: {} });
}

// ---------- Events ----------

function weightedFlareClass() {
  const weights = Object.entries(CONFIG.events.flare.classWeights);
  let roll = random() * weights.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [flareClass, weight] of weights) {
    roll -= weight;
    if (roll < 0) return flareClass;
  }
  return weights.at(-1)[0];
}

// The first flare uses any NASA record, later flares prefer class X (TZ 4).
// The presentation's showcase flare is always strong.
function nextFlare() {
  const records = STATE.flares.filter((flare) => typeof flare?.classType === "string");
  const strong = records.filter((flare) => flare.classType.startsWith("X"));
  const showcase = STATE.sol === meta.showcaseFlareSol;
  const preferStrong = meta.flaresUsed++ > 0 || showcase;
  const pool = preferStrong && strong.length ? strong : records;
  if (!pool.length) {
    return { flareClass: showcase ? CONFIG.presentation.flareClass : weightedFlareClass(), flare: null };
  }
  const flare = pick(pool);
  const letter = flare.classType[0];
  return {
    flareClass: "CMX".includes(letter) ? letter : "C",
    flare: { beginTime: flare.beginTime ?? null, classType: flare.classType,
      flrID: flare.flrID ?? null, link: flare.link ?? null },
  };
}

function buildEvent({ type, data }) {
  const rulesFor = CONFIG.events;
  const event = {
    id: `${type}-${STATE.sol}-${meta.nextId++}`, type, sol: STATE.sol,
    timeoutMs: null, remainingMs: null, data: structuredClone(data ?? {}),
    choices: [{ id: "ack", cost: {} }], defaultChoice: "ack",
  };
  switch (type) {
    case "cropChoice":
      event.choices = Object.entries(CONFIG.crops)
        .map(([id, crop]) => ({ id, cost: {}, sols: crop.sols, food: crop.food }));
      event.defaultChoice = CONFIG.defaults.crop;
      break;
    case "storm":
      event.timeoutMs = CONFIG.difficulties[STATE.difficulty].stormDecisionMs;
      event.remainingMs = event.timeoutMs;
      event.data.damage = rulesFor.storm.damage;
      event.choices = [
        { id: "fold", cost: {}, blocks: ["heat"] },
        { id: "keep", cost: {}, risk: rulesFor.storm.dustChance },
      ];
      event.defaultChoice = "keep";
      break;
    case "flare": {
      const { flareClass, flare } = nextFlare();
      const rule = rulesFor.flare;
      Object.assign(event.data, { flareClass, flare, damage: rule.damage[flareClass] });
      event.choices = [
        { id: "shelter", cost: {}, blocks: ["farm", "repair"] },
        { id: "work", cost: { dose: rule.dose[flareClass],
          cubes: rule.doseCubes[flareClass] * rule.doseSols[flareClass] } },
      ];
      event.defaultChoice = "shelter";
      break;
    }
    case "scrubber":
      event.choices = [
        { id: "fix", cost: { cubes: rulesFor.scrubber.fixCubes }, spend: rulesFor.scrubber.fixCubes },
        { id: "later", cost: {} },
      ];
      event.defaultChoice = "later";
      break;
    case "dustyPanels":
      event.choices = [
        { id: "clean", cost: {}, blocks: ["farm", "repair"] },
        { id: "live", cost: { cubes: CONFIG.cubePenalty.perDownPanel } },
      ];
      event.defaultChoice = "live";
      break;
    case "roverCrate": {
      const rule = rulesFor.rover;
      event.choices = [
        { id: "food", cost: { food: -rule.food }, risk: rule.stormRisk, blocks: ["farm"] },
        { id: "oxygen", cost: { oxygen: -rule.oxygen }, risk: rule.stormRisk, blocks: ["farm"] },
        { id: "stay", cost: {} },
      ];
      event.defaultChoice = "stay";
      break;
    }
    case "coldNight": {
      const rule = rulesFor.coldNight;
      event.choices = [
        { id: "heat", cost: { cubes: rule.extraCubes }, spend: rule.extraCubes },
        { id: "skip", cost: { fatigue: rule.fatigue, crop: rule.cropSteps } },
      ];
      event.defaultChoice = "skip";
      break;
    }
    default: // earthAdvice, consequence and lowReserve only need an acknowledgement.
      break;
  }
  return event;
}

function publicEvent(event) {
  return {
    id: event.id, type: event.type, sol: event.sol, timeoutMs: event.timeoutMs,
    defaultChoice: event.defaultChoice, data: structuredClone(event.data),
    choices: event.choices.map((choice) => ({
      ...structuredClone(choice), disabled: (choice.spend ?? 0) > STATE.cubes,
    })),
  };
}

function activateNext() {
  if (meta.active || STATE.status !== "playing") return;
  const item = meta.queue.shift();
  if (!item) {
    if (meta.autoPaused) {
      STATE.paused = false;
      meta.autoPaused = false;
    }
    return;
  }
  meta.active = buildEvent(item);
  if (!STATE.paused) {
    STATE.paused = true;
    meta.autoPaused = true;
  }
  emit("event", publicEvent(meta.active));
}

function applyChoice(event, choice) {
  const rulesFor = CONFIG.events;
  const key = `${event.type}.${choice}`;
  switch (event.type) {
    case "cropChoice":
      STATE.crop = { type: choice, progress: 0 };
      logEntry(key);
      break;
    case "storm": {
      const damage = addDamage(randInt(...rulesFor.storm.damage));
      if (choice === "fold") {
        const index = logEntry(key, { damage });
        block(["heat"], index);
        meta.blackoutNight = index;
        meta.zeroCubesNext = index;
      } else {
        let panels = 0;
        if (chance(rulesFor.storm.dustChance)) {
          panels = Math.min(randInt(...rulesFor.storm.dustPanels), STATE.panels.total - downPanels());
          STATE.panels.dusty += panels;
        }
        logEntry(key, { damage, panels });
      }
      break;
    }
    case "flare": {
      const { flareClass } = event.data;
      const rule = rulesFor.flare;
      const damage = addDamage(rule.damage[flareClass]);
      if (choice === "shelter") {
        block(["farm", "repair"], logEntry(key, { damage }));
      } else {
        STATE.dose += rule.dose[flareClass];
        const index = logEntry(key, { damage, dose: rule.dose[flareClass] });
        addPending({ kind: "dose", logIndex: index, triggerSol: STATE.sol + 1,
          sols: rule.doseSols[flareClass], cubes: rule.doseCubes[flareClass] });
      }
      break;
    }
    case "scrubber":
      if (choice === "fix") {
        STATE.cubes -= rulesFor.scrubber.fixCubes;
        logEntry(key, { cubes: rulesFor.scrubber.fixCubes });
      } else {
        STATE.scrubberBroken = true;
        meta.scrubberLog = logEntry(key);
      }
      break;
    case "dustyPanels":
      if (choice === "clean") {
        // Cleaning takes the whole sol and removes the dust from every panel,
        // including dust left by earlier storms. Full power returns tomorrow.
        const cleaned = STATE.panels.dusty;
        STATE.panels.dusty = 0;
        block(["farm", "repair"], logEntry(key, { panels: -cleaned }));
      } else {
        const panels = STATE.panels.total - downPanels() > 0 ? 1 : 0;
        STATE.panels.dusty += panels;
        logEntry(key, { panels });
      }
      break;
    case "roverCrate": {
      if (choice === "stay") {
        logEntry(key);
        break;
      }
      const rule = rulesFor.rover;
      STATE[choice] += rule[choice];
      const damage = chance(rule.stormRisk) ? addDamage(rule.stormDamage) : 0;
      block(["farm"], logEntry(key, { [choice]: -rule[choice], damage }));
      break;
    }
    case "coldNight": {
      const rule = rulesFor.coldNight;
      if (choice === "heat") {
        STATE.cubes -= rule.extraCubes;
        logEntry(key, { cubes: rule.extraCubes });
      } else {
        const before = STATE.crop.progress;
        STATE.fatigue += rule.fatigue;
        STATE.crop.progress = Math.max(0, before - rule.cropSteps);
        logEntry(key, { fatigue: rule.fatigue, crop: before - STATE.crop.progress });
      }
      break;
    }
    default:
      break;
  }
}

/** Answers the active event. `choice` is one of the event's choice IDs. */
export function resolveEvent(id, choice) {
  const event = meta.active;
  if (STATE.status !== "playing" || !event || event.id !== id) return false;
  const option = event.choices.find((item) => item.id === choice);
  if (!option || (option.spend ?? 0) > STATE.cubes) return false;
  meta.active = null;
  const beforeLog=STATE.log.length;
  applyChoice(event, choice);
  if(event.type==="flare"&&event.data.flare){
    const entry=STATE.log.slice(beforeLog).find(item=>item.choice===`flare.${choice}`);
    if(entry)entry.sourceFlare=structuredClone(event.data.flare);
  }
  if (updateStatus()) finishGame();
  else activateNext();
  return true;
}

/** The decision on screen with the real milliseconds left, or null. */
export function getActiveEvent() {
  if (!meta.active) return null;
  return { ...publicEvent(meta.active), remainingMs: meta.active.remainingMs };
}

/**
 * Systems a decision closed until the next sol, with the choice that closed them,
 * e.g. {farm: "flare.shelter", repair: "flare.shelter"}. Empty when nothing is closed.
 */
export function getBlockedSystems() {
  return Object.fromEntries(meta.blocked.map((system) =>
    [system, STATE.log[meta.blockedBy[system]]?.choice ?? null]));
}

// ---------- Settling a sol ----------

function settleDay() {
  const siteRules = rules();
  const { alloc } = STATE;
  if (STATE.sim) {
    settleSimulationDay(STATE,meta.blocked.includes("repair"));
    for(const key of STATE.sim.lastPlan){
      const rule=CONFIG.simulation.tasks[key];
      logEntry("sim."+key,{cubes:rule.cubes,oxygen:rule.oxygen});
    }
    if (STATE.sim.lastPlan.includes("far")) block(["farm"],null);
    const sim=STATE.sim;
    sim.charged=Math.min(CONFIG.simulation.batteryCapacity-sim.battery,STATE.cubes+alloc.heat);
    sim.battery+=sim.charged;
    STATE.cubes=0;
  }

  // Air (TZ 3.4): full power stops the loss, partial power halves it.
  const airLevel = alloc.air >= siteRules.airFullCubes ? 2 : alloc.air > 0 ? 1 : 0;
  const baseLoss = CONFIG.airUseByCubes[airLevel];
  const faults = CONFIG.oxygenMultiplier;
  let factor = 1;
  if (STATE.scrubberBroken) factor *= faults.scrubberBroken;
  if (STATE.damage > CONFIG.leakDamage) factor *= faults.leak;
  let oxygenLoss = factor > 1 ? Math.max(baseLoss, faults.minLossWhenFaulty) * factor : baseLoss;
  if (STATE.sim?.sealBroken && !STATE.sim.patchUntil) oxygenLoss+=CONFIG.simulation.sealLoss;
  if (baseLoss > 0) logEntry("air.low", { oxygen: baseLoss });
  if (STATE.scrubberBroken && oxygenLoss > baseLoss) {
    addEffect(meta.scrubberLog, "scrubberBroken", { oxygen: round(oxygenLoss - baseLoss) });
  }
  STATE.oxygen = Math.max(0, round(STATE.oxygen - oxygenLoss));

  // Greenhouse: each cube is a growth step, a skipped sol wilts one step.
  if (unlocked("farm")) {
    const crop = CONFIG.crops[STATE.crop.type];
    const farmBlocked = meta.blocked.includes("farm");
    const steps = farmBlocked ? 0 : alloc.farm * CONFIG.farm.stepPerCube;
    if (steps > 0) {
      STATE.crop.progress += steps;
      if (STATE.crop.progress >= crop.sols) {
        STATE.crop.progress = 0;
        STATE.food += crop.food;
        logEntry("farm.harvest", { food: -crop.food });
      }
    } else if (siteRules.cropWilts && STATE.crop.progress > 0) {
      const lost = Math.min(STATE.crop.progress, CONFIG.farm.wiltSteps);
      STATE.crop.progress -= lost;
      if (farmBlocked) addEffect(meta.blockedBy.farm, "wilt", { crop: lost });
      else logEntry("farm.skip", { crop: lost });
    }
  }

  // Repair: the scrubber first, then panels, the rest lowers damage.
  let repair = alloc.repair;
  const fixCost = CONFIG.repair.cubesPerFix;
  if (STATE.scrubberBroken && repair >= fixCost) {
    STATE.scrubberBroken = false;
    repair -= fixCost;
  }
  while (repair >= fixCost && downPanels() > 0) {
    if (STATE.panels.broken) STATE.panels.broken -= 1;
    else STATE.panels.dusty -= 1;
    repair -= fixCost;
  }
  STATE.damage = Math.max(0, STATE.damage - repair * CONFIG.repair.damagePerCube);

  meta.samples += alloc.science;
  STATE.stars = CONFIG.science.starSamples.filter((samples) => meta.samples >= samples).length;
  if (alloc.comms > 0 && !STATE.sim?.radioBroken) {
    meta.forecastAsked = true;
    if(STATE.sim){STATE.sim.sentSol=STATE.sol;STATE.sim.sentDamage=STATE.damage;}
  }

  const food = Math.min(STATE.food, CONFIG.foodUsePerSol);
  STATE.food = round(STATE.food - food);
  logEntry("sol.end", { oxygen: oxygenLoss, food });
}

function settleNight() {
  if (unlocked("heat")) {
    let heated = meta.blackoutNight == null && STATE.alloc.heat >= rules().heatCubes;
    if(STATE.sim){
      const need=CONFIG.simulation.nightBase+rules().heatCubes;
      heated=meta.blackoutNight==null && STATE.sim.battery>=need;
      STATE.sim.nightUse=Math.min(need,STATE.sim.battery);
      STATE.sim.battery-=STATE.sim.nightUse;
      if(!heated)STATE.sim.notes.push("cold");
    }
    if (heated) {
      STATE.fatigue = Math.max(0, STATE.fatigue - CONFIG.heat.fatigueRecovery);
      meta.coldNights = 0;
    } else {
      const fatigue = CONFIG.heat.fatigueWithoutHeat;
      STATE.fatigue += fatigue;
      meta.coldNights += 1;
      let index = meta.blackoutNight;
      if (index == null) index = logEntry("heat.skip", { fatigue });
      else addEffect(index, "cold", { fatigue });
      const cold = CONFIG.consequences.cold;
      if (meta.coldNights >= cold.nightsWithoutHeat) {
        meta.coldNights = 0;
        addPending({ kind: "cold", logIndex: index, triggerSol: STATE.sol + 1,
          sols: cold.sols, cubes: cold.cubes });
      }
    }
  }
  meta.blackoutNight = null;

  // Damage left high for several sols turns into a crack later (TZ 3.7).
  const crack = CONFIG.consequences.crack;
  if (STATE.damage > crack.damageAbove) {
    meta.damageStreak += 1;
    if (meta.damageStreak >= crack.streakSols) {
      meta.damageStreak = 0;
      const index = logEntry("repair.neglect", { damage: 0 });
      addPending({ kind: "crack", logIndex: index,
        triggerSol: STATE.sol + randInt(...crack.delaySols), damage: crack.damage });
    }
  } else {
    meta.damageStreak = 0;
  }
}

function updateStatus() {
  if (STATE.status !== "playing") return false;
  if (STATE.oxygen <= 0 || STATE.food <= 0 || STATE.damage >= CONFIG.damageLimit) {
    STATE.status = "emergencySleep";
  } else if (STATE.phase === "evening" && STATE.sol >= CONFIG.missionSols) {
    STATE.status = !STATE.sim || STATE.sim.departed ? "rescued" : "emergencySleep";
    if(STATE.sim && !STATE.sim.departed)STATE.sim.notes.push("notReady");
  } else {
    return false;
  }
  return true;
}

function finishGame() {
  meta.active = null;
  meta.queue = [];
  meta.autoPaused = false;
  STATE.paused = false;
  if (!meta.presentation) clearSave(); // a demo must not erase the player's save
  emit("gameover", getEndReport());
}

// ---------- Phases and time ----------

function setPhase(phase) {
  STATE.phase = phase;
  meta.elapsedInPhase = 0;
  let ended = false;
  if (phase === "evening") {
    if(!STATE.sim) STATE.cubes = 0; // simulator stores unused generation
    settleDay();
    ended = updateStatus();
  }
  emit("phase", { sol: STATE.sol, phase });
  if (ended) finishGame();
  else if (phase === "day") activateNext();
}

function finishSol() {
  settleNight();
  STATE.sol += 1;
  startSol();
  if (STATE.status !== "playing") return;
  setPhase("morning");
  save(); // autosave every night (TZ 3.2)
}

function advancePhase() {
  const next = PHASES[PHASES.indexOf(STATE.phase) + 1];
  if (next) setPhase(next);
  else finishSol();
}

export function allocate(system, delta) {
  if (STATE.status !== "playing" || STATE.phase !== "day" ||
      !CONFIG.systems.includes(system) || !Number.isInteger(delta) ||
      !unlocked(system) || meta.blocked.includes(system)) return false;
  const next = STATE.alloc[system] + delta;
  if (next < 0 || next > CONFIG.maxAlloc[system] || STATE.cubes - delta < 0) return false;
  if(STATE.sim && labor(STATE,{...STATE.alloc,[system]:next})+planned(STATE)>CONFIG.simulation.hours)return false;
  STATE.alloc[system] = next;
  STATE.cubes -= delta;
  return true;
}

/** Plan field and maintenance work. Resource reservations are refundable until day settlement. */
export function planTask(key) {
  if(!STATE?.sim || meta.active)return false;
  const result=queueTask(STATE,key);
  if(result)save();
  return result;
}
export function unplanTask(key) {
  if(!STATE?.sim || meta.active || STATE.phase!=="day" || STATE.status!=="playing")return false;
  return cancelTask(STATE,key);
}
export function taskAvailable(key) {return !meta.active && canTask(STATE,key);}
export function simulationPreview(){return previewSimulation(STATE);}
export function drawBattery() {
  const sim=STATE?.sim;
  if(!sim || meta.active || STATE.status!=="playing" || STATE.phase!=="day")return false;
  const amount=Math.min(CONFIG.simulation.drawLimit,sim.battery);
  if(!amount)return false;
  sim.battery-=amount;STATE.cubes+=amount;return true;
}

/** Goes to the evening. Unanswered decisions take their default choice. */
export function endSol() {
  if (STATE.status !== "playing" || !["morning", "day"].includes(STATE.phase)) return false;
  if (STATE.phase === "morning") setPhase("day");
  while (meta.active && STATE.status === "playing") {
    resolveEvent(meta.active.id, meta.active.defaultChoice);
  }
  if (STATE.status === "playing") setPhase("evening");
  return true;
}

/** Explicit review button advances a paused simulator night without changing the clock setting. */
export function reviewSol(){
  if(!STATE.sim || STATE.status!=="playing" || !["evening","night"].includes(STATE.phase) || meta.active)return false;
  finishSol();
  return true;
}

/** Real milliseconds since the last call. Decision timers ignore the speed. */
export function tick(dtMs) {
  if (!Number.isFinite(dtMs) || dtMs < 0) throw new RangeError("dtMs must be non-negative and finite");
  if (STATE.status !== "playing") return;
  const event = meta.active;
  if (event?.timeoutMs != null) {
    event.remainingMs = Math.max(0, event.remainingMs - dtMs);
    if (event.remainingMs === 0) resolveEvent(event.id, event.defaultChoice);
    return;
  }
  if (STATE.paused || event) return;
  let remaining = dtMs * STATE.speed;
  while (remaining > 0 && !STATE.paused && !meta.active && STATE.status === "playing") {
    const timeLeft = CONFIG.phasesMs[STATE.phase] - meta.elapsedInPhase;
    if (remaining < timeLeft) {
      meta.elapsedInPhase += remaining;
      return;
    }
    remaining -= timeLeft;
    advancePhase();
  }
}

/** 0 pauses the game. 1, 2 or 4 set the speed and resume. */
export function setSpeed(speed) {
  if (speed === 0) {
    STATE.paused = true;
    meta.autoPaused = false;
    return true;
  }
  if (!CONFIG.speeds.includes(speed)) return false;
  STATE.speed = speed;
  if (!meta.active) STATE.paused = false;
  return true;
}

/** Fast-forwards to the next day phase or decision. */
export function skipToDecision() {
  if (STATE.status !== "playing" || meta.active || STATE.phase === "day") return false;
  do advancePhase();
  while (STATE.status === "playing" && STATE.phase !== "day");
  return true;
}

// ---------- Saves ----------

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function save() {
  try {
    const store = storage();
    if (!store || STATE.status !== "playing" || meta.presentation) return false;
    store.setItem(CONFIG.saveKey, JSON.stringify({ v: CONFIG.saveVersion, state: STATE, meta }));
    return true;
  } catch {
    return false;
  }
}

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isReserve = (value) => Number.isFinite(value) && value >= 0;

// Reads the save and checks that it can continue a mission. Null when it is
// missing, damaged, from another version or already finished (#9).
function readSave() {
  try {
    const raw = storage()?.getItem(CONFIG.saveKey);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    const state = saved?.state;
    const valid = saved?.v === CONFIG.saveVersion && isObject(saved.meta) && isObject(state) &&
      state.status === "playing" && PHASES.includes(state.phase) &&
      Number.isInteger(state.sol) && state.sol >= 1 && state.sol <= CONFIG.missionSols &&
      CONFIG.sites.includes(state.site) && Object.hasOwn(CONFIG.difficulties, state.difficulty) &&
      ["oxygen", "food", "damage", "cubes"].every((key) => isReserve(state[key])) &&
      isObject(state.alloc) && isObject(state.panels) && isObject(state.crop) &&
      Array.isArray(state.pending) && Array.isArray(state.log) &&
      Array.isArray(saved.meta.queue) && Array.isArray(saved.meta.blocked);
    return valid ? saved : null;
  } catch {
    return null;
  }
}

/** True only when load() would restore a mission, so Continue never fails. */
export function hasSave() {
  return readSave() !== null;
}

function clearSave() {
  try {
    storage()?.removeItem(CONFIG.saveKey);
  } catch {
    // Storage is optional.
  }
}

/** Restores the saved mission and returns STATE, or null and keeps the current game. */
export function load() {
  const saved = readSave();
  if (!saved) return null;
  STATE = saved.state;
  meta = saved.meta;
  return STATE;
}

// ---------- End report ----------

function costScore(cost) {
  return Object.entries(cost ?? {}).reduce((sum, [key, value]) =>
    sum + (Number.isFinite(value) ? value * (CONFIG.costWeights[key] ?? 0) : 0), 0);
}

/** Final numbers and up to three most expensive decisions with their effects. */
export function getEndReport() {
  const chains = STATE.log
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => !OUTCOMES.has(entry.choice))
    .map(({ entry, index }) => {
      const effects = meta.effects
        .filter((effect) => effect.logIndex === index)
        .map(({ sol, kind, cost }) => ({ sol, kind, cost }));
      const score = costScore(entry.cost) + effects.reduce((sum, effect) => sum + costScore(effect.cost), 0);
      return { sol: entry.sol, choice: entry.choice, cost: entry.cost, effects, score: round(score) };
    })
    .filter((chain) => chain.score > 0)
    .sort((a, b) => b.score - a.score || a.sol - b.sol)
    .slice(0, 3);
  return {
    status: STATE.status, sol: STATE.sol, chains,
    oxygen: STATE.oxygen, food: STATE.food, damage: STATE.damage,
    panelsWorking: STATE.panels.total - downPanels(), stars: STATE.stars,
    ...(STATE.sim?{simulation:{ready:{...STATE.sim.ready},departed:STATE.sim.departed,battery:STATE.sim.battery}}:{}),
  };
}

newGame();
