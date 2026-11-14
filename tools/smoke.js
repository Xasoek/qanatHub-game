import assert from "node:assert/strict";
import vm from "node:vm";
import { CONFIG } from "../src/config.js";
import { loadSolarData, NASA_ARCHIVE } from "../src/data.js";
import { STATE, allocate, endSol, newGame, on, skipToDecision, tick } from "../src/engine.js";
import { TEXT } from "../src/text.js";
import { renderIndex } from "./build.js";
import { runStarterMission } from "./sim.js";

const archive = await loadSolarData();
assert.equal(archive.mode, "archive");
assert.deepEqual(archive.flares, NASA_ARCHIVE);
assert.notStrictEqual(archive.flares, NASA_ARCHIVE);

function textKeys(catalog, prefix = "") {
  return Object.entries(catalog).flatMap(([key, value]) => {
    const path = prefix + key;
    return typeof value === "string" ? [path] : textKeys(value, path + ".");
  });
}

assert.deepEqual(textKeys(TEXT.en).sort(), textKeys(TEXT.ru).sort());

newGame({ solarData: archive });
const phases = [];
const unsubscribe = on("phase", ({ phase }) => phases.push(phase));
assert.equal(skipToDecision(), true);
const cubes = STATE.cubes;
assert.equal(allocate("air", cubes + 1), false);
assert.equal(STATE.cubes, cubes);
assert.equal(allocate("air", 2), true);
assert.equal(STATE.cubes, cubes - 2);
const { oxygen, food, sol } = STATE;
assert.equal(endSol(), true);
tick(CONFIG.phasesMs.evening + CONFIG.phasesMs.night);
unsubscribe();
assert.deepEqual(phases, ["day", "evening", "night", "morning"]);
assert.equal(STATE.sol, sol + 1);
assert.equal(STATE.oxygen, oxygen);
assert.ok(STATE.food <= food);
const outcome = runStarterMission(17);
assert.notEqual(outcome.status, "playing");
assert.deepEqual(runStarterMission(17), outcome);

const html = await renderIndex();
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
assert.equal((html.match(/<script\b/gi) ?? []).length, 1);
assert.equal(scripts.length, 1);
assert.doesNotThrow(() => new vm.Script(scripts[0][1]));
assert.equal((html.match(/<style>/g) ?? []).length, 1);
assert.match(html, /<main id="game"><\/main>/);
console.log("Smoke checks passed");
