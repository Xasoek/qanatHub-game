// Bots that play the engineering campaign through the public engine API (tests and tools/sim.js).
// They never touch STATE directly, so they exercise the same validation as the UI.
import { CONFIG } from "../src/config.js";
import * as engine from "../src/engine.js";

/** Priority order of a player who reads the mission board. */
export const SMART_ORDER = [
  "inspectAir", "co2", "inspect", "seal", "patch", "findLeak", "isolate",
  "inspectArray", "cable", "panel", "clean", "powerTest", "pipe", "pumpTest", "airTest",
  "inspectAntenna", "radio", "actuator", "align", "debris", "route", "beacon", "lander", "depart",
  "near", "inspectFarm", "lights", "nutrients", "roverDiag", "roverFix", "far", "inspectHeat", "insulation",
];

const SMART_CHOICES = {
  storm: "fold", flare: "shelter", scrubber: "fix", dustyPanels: "live", coldNight: "heat",
  roverCrate: "stay", cropChoice: "radish",
};

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function answerEvents(pick) {
  for (let guard = 0, event = engine.getActiveEvent(); event && guard < 20; guard++, event = engine.getActiveEvent()) {
    const wanted = pick(event);
    if (!engine.resolveEvent(event.id, wanted)) engine.resolveEvent(event.id, event.defaultChoice);
  }
}

/**
 * Plays one mission to the end and returns the end report plus the steps the bot completed.
 * style: "expert" (plans night energy and spare parts ahead), "sensible" (follows the mission
 * board in order, keeps air full, repairs damage, rests when tired), "careless" (skips life support
 * and water until sol 12, ignores fatigue), "random" (random legal clicks).
 */
export function playCampaign({ seed = 1, site = "gale", difficulty = "engineer", style = "sensible", solarData } = {}) {
  engine.newGame({ seed, site, difficulty, simulation: true, solarData });
  const random = rng(seed ^ 0x5eed);
  const S = () => engine.STATE;
  const tasks = Object.keys(CONFIG.simulation.tasks);
  for (let guard = 0; S().status === "playing" && guard < CONFIG.missionSols * 4; guard++) {
    if (["evening", "night"].includes(S().phase)) { engine.reviewSol(); continue; }
    engine.skipToDecision();
    answerEvents((event) => {
      if (style === "random") return event.choices[Math.floor(random() * event.choices.length)].id;
      return SMART_CHOICES[event.type] ?? event.defaultChoice;
    });
    if (S().status !== "playing" || S().phase !== "day") continue;
    if (style === "random") {
      for (let n = 0; n < 8; n++) {
        const roll = random();
        if (roll < 0.5) engine.planTask(tasks[Math.floor(random() * tasks.length)]);
        else engine.allocate(CONFIG.systems[Math.floor(random() * CONFIG.systems.length)], 1);
      }
    } else {
      const air = CONFIG.siteRules[S().site].airFullCubes;
      // Short of energy for air and one repair: take what the battery holds.
      if (style === "sensible" && S().cubes < air + 1) engine.drawBattery();
      for (let i = 0; i < air; i++) engine.allocate("air", 1);
      if (style !== "careless" && S().fatigue >= CONFIG.simulation.fatigueHours[0]) engine.planTask("rest");
      let order = style === "careless" && S().sol < 12
        ? SMART_ORDER.filter((key) => !["inspectAir", "co2", "findLeak", "isolate", "pipe"].includes(key))
        : SMART_ORDER;
      // On a cold site the heating repair pays for itself every night, so it goes first.
      if (style === "sensible" && CONFIG.siteRules[S().site].heatCubes > 1) {
        order = ["inspectHeat", "insulation", ...order.filter((key) => key !== "inspectHeat" && key !== "insulation")];
      }
      for (const key of order) {
        if (key === "patch" && S().sim.spares > 0) continue;
        // A sensible player keeps spare parts for the rescue path before optional upgrades.
        const coldSiteHeat = key === "insulation" && CONFIG.siteRules[S().site].heatCubes > 1;
        const investment = key === "roverFix"; // the rover reaches the far crate with two parts
        if (style === "expert" && !coldSiteHeat && !investment && isOptionalPart(key) && S().sim.spares <= criticalPartsLeft()) continue;
        if ((key === "near" || key === "far") && S().food > 8 && S().sim.spares > 1) continue;
        engine.planTask(key);
      }
      // Damage above 30% turns into cracks and leaks later, so it is repaired first.
      if (style !== "careless" && S().damage > CONFIG.consequences.crack.damageAbove) {
        engine.allocate("repair", 1);
        engine.allocate("repair", 1);
      }
      engine.allocate("farm", 1);
      // Keep energy for the night: base load and heating come from the battery.
      if (style === "expert") {
        const preview = engine.simulationPreview();
        for (let n = preview.need - preview.charge; n > 0; n--) engine.allocate("heat", 1);
      }
      engine.allocate("farm", 1);
      if (style !== "expert") while (engine.allocate("repair", 1)) { /* spends everything left */ }
      else {
        const preview = engine.simulationPreview();
        for (let n = preview.charge - preview.need; n > 0; n--) if (!engine.allocate("repair", 1)) break;
      }
    }
    engine.endSol();
  }
  const report = engine.getEndReport();
  return { ...report, done: { ...S().sim.done }, fatigue: S().fatigue };
}

function isOptionalPart(key) {
  const task = CONFIG.simulation.tasks[key];
  return task.parts > 0 && CONFIG.simulation.missions[task.mission]?.priority === "optional";
}

function criticalPartsLeft() {
  const { tasks, missions } = CONFIG.simulation;
  const sim = engine.STATE.sim;
  let parts = Object.entries(tasks).filter(([key, task]) => !task.repeat && !sim.done[key] &&
    missions[task.mission]?.priority === "critical" && !sim.plan.includes(key)).reduce((sum, [, task]) => sum + task.parts, 0);
  parts += engine.STATE.panels.broken * tasks.panel.parts;
  return parts;
}

/** Why a mission ended, for the balance table. */
export function failureReason(report) {
  if (report.status === "rescued") return "rescued";
  if (report.oxygen <= 0) return "oxygen";
  if (report.food <= 0) return "food";
  if (report.damage >= CONFIG.damageLimit) return "damage";
  if (!report.simulation?.departed) return "notReady";
  return "other";
}
