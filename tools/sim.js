// Role 1 balance simulator. Plays whole missions through the public engine API.
// Usage: npm run sim -- 1000
import { fileURLToPath } from "node:url";
import { CONFIG } from "../src/config.js";
import {
  STATE, allocate, endSol, getActiveEvent, getEndReport, newGame, resolveEvent, skipToDecision,
} from "../src/engine.js";

const MAX_STEPS = 200;

function seededRandom(seed) {
  let state = (seed >>> 0) ^ 0x2545f491;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

const give = (system, cubes) => {
  for (let i = 0; i < cubes; i++) if (!allocate(system, 1)) return;
};
const downPanels = () => STATE.panels.broken + STATE.panels.dusty;

// A careful player: keeps air and heat up, waters the crop, repairs before damage piles up.
const smart = () => ({
  choose(event) {
    const enabled = (id) => event.choices.some((choice) => choice.id === id && !choice.disabled);
    switch (event.type) {
      case "cropChoice": return "radish";
      case "storm": return "keep";
      case "flare": return event.data.flareClass === "C" ? "work" : "shelter";
      case "scrubber": return enabled("fix") ? "fix" : "later";
      case "dustyPanels": return "clean";
      case "roverCrate":
        if (STATE.damage > 60) return "stay";
        return STATE.oxygen <= STATE.food ? "oxygen" : "food";
      case "coldNight": return enabled("heat") ? "heat" : "skip";
      default: return event.defaultChoice;
    }
  },
  allocate() {
    const site = CONFIG.siteRules[STATE.site];
    give("air", site.airFullCubes);
    if (STATE.scrubberBroken) give("repair", CONFIG.repair.cubesPerFix);
    give("farm", 1);
    give("heat", site.heatCubes);
    if (downPanels() > 0) give("repair", CONFIG.repair.cubesPerFix);
    if (STATE.damage >= 30) give("repair", 2);
    give("farm", 1);
    if (STATE.damage > 0) give("repair", 1);
    if (STATE.sol % 4 === 0) give("comms", 1);
    give("science", STATE.cubes);
  },
});

// Random button presses: picks any enabled choice and drops cubes anywhere.
const randomPlayer = (seed) => {
  const random = seededRandom(seed);
  return {
    choose(event) {
      const options = event.choices.filter((choice) => !choice.disabled);
      return options[Math.floor(random() * options.length)].id;
    },
    allocate() {
      const presses = Math.floor(random() * (STATE.cubes + 1));
      for (let i = 0; i < presses; i++) {
        allocate(CONFIG.systems[Math.floor(random() * CONFIG.systems.length)], 1);
      }
    },
  };
};

const STRATEGIES = { smart, random: randomPlayer };

function check(seed) {
  const fail = (message) => {
    throw new Error(`Impossible state (seed ${seed}, sol ${STATE.sol}): ${message}`);
  };
  for (const key of ["oxygen", "food", "damage", "cubes", "dose", "fatigue", "crates", "stars"]) {
    if (!Number.isFinite(STATE[key]) || STATE[key] < 0) fail(`${key} = ${STATE[key]}`);
  }
  if (STATE.damage > CONFIG.damageLimit) fail(`damage = ${STATE.damage}`);
  if (STATE.stars > CONFIG.science.starSamples.length) fail(`stars = ${STATE.stars}`);
  if (!Number.isInteger(STATE.sol) || STATE.sol < 1 || STATE.sol > CONFIG.missionSols) fail(`sol = ${STATE.sol}`);
  const { total, broken, dusty } = STATE.panels;
  if (broken < 0 || dusty < 0 || broken + dusty > total) fail(`panels = ${JSON.stringify(STATE.panels)}`);
  for (const system of CONFIG.systems) {
    const cubes = STATE.alloc[system];
    if (!Number.isInteger(cubes) || cubes < 0 || cubes > CONFIG.maxAlloc[system]) fail(`alloc.${system} = ${cubes}`);
  }
  if (!Object.hasOwn(CONFIG.crops, STATE.crop.type) || STATE.crop.progress < 0) fail("crop");
  for (const entry of STATE.log) {
    for (const value of Object.values(entry.cost)) if (!Number.isFinite(value)) fail(`log cost ${entry.choice}`);
  }
}

function resolveAll(player, seed) {
  for (let guard = 0; getActiveEvent(); guard++) {
    if (guard > 20) throw new Error(`Event loop did not settle (seed ${seed})`);
    const event = getActiveEvent();
    if (!resolveEvent(event.id, player.choose(event))) resolveEvent(event.id, event.defaultChoice);
  }
}

/** Plays one mission to the end and returns the engine's end report. */
export function playMission({ strategy = "smart", seed = 0, site, difficulty, presentation } = {}) {
  const player = STRATEGIES[strategy](seed);
  newGame({ seed, site, difficulty, presentation });
  for (let step = 0; STATE.status === "playing"; step++) {
    if (step > MAX_STEPS) throw new Error(`Mission did not finish (seed ${seed})`);
    if (STATE.phase !== "day") skipToDecision();
    if (STATE.status !== "playing") break;
    resolveAll(player, seed);
    if (STATE.status !== "playing") break;
    player.allocate();
    check(seed);
    endSol();
    check(seed);
  }
  return getEndReport();
}

/** Kept for tools/smoke.js: a full mission with the careful player. */
export function runStarterMission(seed = 0) {
  return playMission({ strategy: "smart", seed });
}

export function runBatch({ count, strategy, difficulty = "engineer", site, presentation }) {
  const result = { wins: 0, causes: { oxygen: 0, food: 0, damage: 0 }, solSum: 0 };
  for (let seed = 0; seed < count; seed++) {
    const missionSite = site ?? CONFIG.sites[seed % CONFIG.sites.length];
    const report = playMission({ strategy, seed, site: missionSite, difficulty, presentation });
    if (report.status === "rescued") result.wins += 1;
    else {
      result.solSum += report.sol;
      if (report.oxygen <= 0) result.causes.oxygen += 1;
      else if (report.food <= 0) result.causes.food += 1;
      else result.causes.damage += 1;
    }
  }
  return result;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = Number(process.argv[2] ?? 1000);
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError("Expected a positive mission count");
  const rows = {};
  for (const difficulty of Object.keys(CONFIG.difficulties)) {
    for (const strategy of Object.keys(STRATEGIES)) {
      for (const site of [undefined, ...CONFIG.sites]) {
        const { wins, causes, solSum } = runBatch({ count, strategy, difficulty, site });
        const losses = count - wins;
        rows[`${difficulty} · ${strategy} · ${site ?? "all sites"}`] = {
          "win %": Math.round((wins / count) * 1000) / 10,
          "lost on sol": losses ? Math.round((solSum / losses) * 10) / 10 : "-",
          "no oxygen": causes.oxygen, "no food": causes.food, "damage 100%": causes.damage,
        };
      }
    }
  }
  console.log(`${count} missions per row. Target for engineer: smart 40-60%, random below 10%.`);
  console.table(rows);

  // Presentation mode: how often the demo reaches the rescue and how long it runs at x4.
  const { presentation } = CONFIG;
  const solMinutes = Object.values(CONFIG.phasesMs).reduce((sum, ms) => sum + ms, 0) / 60_000;
  const demo = {};
  for (const act of Object.keys(presentation.acts)) {
    const sols = CONFIG.missionSols - presentation.acts[act].sol + 1;
    for (const strategy of Object.keys(STRATEGIES)) {
      const { wins } = runBatch({ count, strategy, presentation: { act: Number(act) } });
      demo[`act ${act} · ${strategy}`] = {
        "win %": Math.round((wins / count) * 1000) / 10,
        "minutes at x4 to rescue": Math.round((sols * solMinutes / presentation.speed) * 10) / 10,
      };
    }
  }
  console.log("Presentation mode (engineer, all sites). Decision time is not included.");
  console.table(demo);
}
