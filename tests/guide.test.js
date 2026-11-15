// "How to play" guide: remembered status, both languages and accuracy against the rules.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { CONFIG } from "../src/config.js";
import { GUIDE_KEY, GUIDE_STEPS, guideSeen, guideVars, markGuideSeen } from "../src/guide.js";
import { TEXT, t } from "../src/text.js";

afterEach(() => {
  delete globalThis.localStorage;
});

function useStorage(initial = {}) {
  const items = new Map(Object.entries(initial));
  const storage = {
    items,
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
  };
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  return storage;
}

/** Every line of a step in reading order. */
function stepParts(step) {
  return ["title", ...Array.from({ length: step.lines }, (_, i) => "l" + (i + 1)), "tip"];
}

function guideText(lang) {
  const copy = (key, vars) => t(lang, key, vars);
  const vars = guideVars(copy);
  return GUIDE_STEPS.flatMap((step) => stepParts(step).map((part) => copy(`guide.steps.${step.id}.${part}`, vars)));
}

test("the guide is offered once and keeps its status apart from the mission save", () => {
  const save = JSON.stringify({ v: CONFIG.saveVersion, state: { sol: 4 } });
  const storage = useStorage({ [CONFIG.saveKey]: save });
  assert.equal(guideSeen(), false, "a new player is offered the guide");
  assert.equal(markGuideSeen(), true);
  assert.equal(guideSeen(), true, "a returning player is not asked again");
  assert.equal(storage.getItem(GUIDE_KEY), "done");
  assert.notEqual(GUIDE_KEY, CONFIG.saveKey);
  assert.equal(storage.getItem(CONFIG.saveKey), save, "old mission saves stay untouched");
});

test("the guide works without storage or with blocked storage", () => {
  assert.equal(guideSeen(), false);
  assert.equal(markGuideSeen(), false);
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw new Error("blocked"); } });
  assert.doesNotThrow(() => guideSeen());
  assert.equal(guideSeen(), false);
  assert.equal(markGuideSeen(), false);
});

test("the guide has six steps with every line in English and Russian", () => {
  assert.deepEqual(GUIDE_STEPS.map((step) => step.id), ["mission", "base", "resources", "plan", "survive", "rescue"]);
  for (const lang of ["en", "ru"]) {
    for (const key of ["open", "title", "progress", "otherLanguage", "back", "next", "skip", "finish", "tipLabel",
      "offer.text", "offer.open", "offer.dismiss"]) {
      assert.doesNotMatch(t(lang, "guide." + key), /^\[/, `${lang} guide.${key}`);
    }
    for (const line of guideText(lang)) {
      assert.doesNotMatch(line, /\[|\{|\}/, `${lang}: every key and number resolves in "${line}"`);
      assert.ok(line.length <= 200, `${lang}: lines stay short for children: "${line}"`);
    }
  }
  assert.deepEqual(Object.keys(TEXT.en.guide.steps), Object.keys(TEXT.ru.guide.steps));
});

test("the guide numbers and labels come from the game rules and interface", () => {
  const vars = guideVars((key) => t("en", key));
  assert.equal(vars.sols, CONFIG.missionSols);
  assert.equal(vars.hours, CONFIG.simulation.hours);
  assert.equal(vars.battery, CONFIG.simulation.batteryCapacity);
  assert.equal(vars.depart, CONFIG.simulation.evacuationFrom);
  assert.equal(vars.patch, CONFIG.simulation.patchSols);
  assert.equal(vars.storm * 1000, CONFIG.difficulties.engineer.stormDecisionMs);
  assert.equal(vars.stormCadet * 1000, CONFIG.difficulties.cadet.stormDecisionMs);
  for (const [name, key] of [["start", "game.next"], ["end", "game.end"], ["advance", "game.advance"], ["plan", "sim.open"],
    ["sensors", "ui.sensors"], ["leave", "sim.tasks.depart"], ["ship", "ui.space.ship"]]) {
    assert.equal(vars[name], t("en", key), `${name} is the label the player sees`);
  }
  const text = guideText("en").join(" ");
  for (const number of [vars.sols, vars.hours, vars.battery, vars.depart, vars.patch, vars.storm, vars.stormCadet]) {
    assert.match(text, new RegExp(`\\b${number}\\b`), `the guide mentions ${number}`);
  }
});

test("the guide does not describe features the game does not have", () => {
  // The mission has oxygen, food, energy and a battery, but no water supply.
  assert.doesNotMatch(guideText("en").join(" "), /\bwater\b/i);
  // \b does not see Cyrillic letters, so the Russian check spells out the word edges.
  assert.doesNotMatch(guideText("ru").join(" "), /(^|[^а-яё])вод[аыуеой]?([^а-яё]|$)/i);
  assert.match("запас воды", /(^|[^а-яё])вод[аыуеой]?([^а-яё]|$)/i, "the Russian check really finds the word");
  for (const lang of ["en", "ru"]) {
    const text = guideText(lang).join(" ");
    assert.match(text, new RegExp(t(lang, "ui.space.ship")), `${lang}: names the rescue ship`);
    assert.match(text, lang === "en" ? /Beep/ : /Бип/, `${lang}: introduces Beep`);
  }
});
