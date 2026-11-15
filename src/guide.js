// "How to play" survival guide: short steps with Beep's tips, plus a tour of every button.
// Texts live in text.js under `guide`; numbers come from CONFIG and button names from the
// interface texts, so the guide always matches the game. The guide never changes the game state.
import { CONFIG } from "./config.js";
import { icon as gameIcon } from "./icons.js";

const sim = CONFIG.simulation;

/**
 * Steps in order. `lines` short lines come first, then `rows`: one row per control.
 * A row shows the control as the player sees it: an `icon` from icons.js or a `badge`
 * (an interface text key or literal text). Its name is `label` (an interface key) or
 * `guide.names.<id>`; keyed badges are their own name. The description is `guide.rows.<id>`.
 */
export const GUIDE_STEPS = [
  { id: "mission", icons: ["planet"], lines: 3 },
  { id: "base", icons: ["home", "air", "farm", "comms"], lines: 3 },
  { id: "resources", icons: ["oxygen", "food", "energy"], lines: 4 },
  { id: "bottom", icons: ["pause", "skip", "energy"], lines: 1, rows: [
    { id: "start", badge: { key: "game.next" }, primary: true },
    { id: "end", badge: { key: "game.end" }, primary: true },
    { id: "advance", badge: { key: "game.advance" }, primary: true },
    { id: "pause", icon: "pause", label: "ui.pause" },
    { id: "speed", badge: { text: "×1 ×2 ×4" } },
    { id: "skip", icon: "skip", label: "ui.skip" },
    { id: "plusMinus", badge: { text: "− +" } },
    { id: "free", badge: { key: "ui.cubesFree", vars: () => ({ n: 3 }) } },
  ] },
  { id: "systems", icons: [], lines: 1,
    rows: CONFIG.systems.map((system) => ({ id: system, icon: system, label: "story.systems." + system })) },
  { id: "screen", icons: ["help", "menu", "planet"], lines: 0, rows: [
    { id: "help", icon: "help", label: "guide.open" },
    { id: "sound", icon: "sound" },
    { id: "language", badge: { text: "RU · EN" } },
    { id: "menu", icon: "menu", label: "ui.menu" },
    { id: "data", badge: { key: "solar.archive" }, label: "ui.dataSource" },
    { id: "plan", badge: { key: "sim.open" } },
    { id: "sensors", badge: { key: "ui.sensors" } },
    { id: "planet", icon: "planet", label: "ui.planet" },
    { id: "zoom", badge: { text: "+ −" } },
    { id: "home", icon: "home", label: "ui.home" },
  ] },
  { id: "work", icons: ["repair", "energy"], lines: 1, rows: [
    { id: "missions", badge: { key: "sim.priority.critical" } },
    { id: "status", badge: { key: "sim.status.AVAILABLE" } },
    { id: "job", badge: { key: "sim.tasks.inspect" } },
    { id: "cost", badge: { key: "sim.cost", vars: () => sim.tasks.seal } },
    { id: "reason", badge: { key: "sim.reason.needs", vars: (copy) => ({ step: copy("sim.tasks.inspect") }) } },
    { id: "draw", badge: { key: "sim.draw" } },
    { id: "rest", badge: { key: "sim.tasks.rest" } },
    { id: "close", badge: { key: "sim.close" } },
  ] },
  { id: "survive", icons: ["repair", "heat", "oxygen"], lines: 4 },
  { id: "rescue", icons: ["comms", "planet"], lines: 4 },
];

// Separate from the mission save: the mission save is deleted after an ending,
// but a player who has seen the guide should not be asked again.
export const GUIDE_KEY = "oneSolToRescue.guide";

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** True once the player finished, skipped or declined the guide. */
export function guideSeen() {
  try {
    return storage()?.getItem(GUIDE_KEY) === "done";
  } catch {
    return false;
  }
}

/** Remembers that the guide was offered. Returns false when storage is unavailable. */
export function markGuideSeen() {
  try {
    const store = storage();
    if (!store) return false;
    store.setItem(GUIDE_KEY, "done");
    return true;
  } catch {
    return false;
  }
}

// Mission statuses as the engine names them, for the "{locked}, {ready}, …" words in the guide.
const MISSION_STATUS = { locked: "LOCKED", ready: "AVAILABLE", inProgress: "IN_PROGRESS", completed: "COMPLETED" };

/** Values the guide texts insert, taken from the rules and the interface labels. */
export function guideVars(copy) {
  return {
    sols: CONFIG.missionSols,
    hours: sim.hours,
    battery: sim.batteryCapacity,
    draw: sim.drawLimit,
    restHours: sim.tasks.rest.hours,
    depart: sim.evacuationFrom,
    patch: sim.patchSols,
    stars: CONFIG.science.starSamples.length,
    airFull: CONFIG.siteRules.gale.airFullCubes,
    airFullJezero: CONFIG.siteRules.jezero.airFullCubes,
    storm: CONFIG.difficulties.engineer.stormDecisionMs / 1000,
    stormCadet: CONFIG.difficulties.cadet.stormDecisionMs / 1000,
    ship: copy("ui.space.ship"),
    start: copy("game.next"),
    end: copy("game.end"),
    advance: copy("game.advance"),
    plan: copy("sim.open"),
    sensors: copy("ui.sensors"),
    leave: copy("sim.tasks.depart"),
    toBase: copy("ui.toBase"),
    critical: copy("sim.priority.critical"),
    optional: copy("sim.priority.optional"),
    ...Object.fromEntries(Object.entries(CONFIG.difficulties).map(([level]) => [level, copy("story." + level)])),
    ...Object.fromEntries(CONFIG.systems.map((system) => [system, copy("story.systems." + system)])),
    ...Object.fromEntries(Object.entries(MISSION_STATUS).map(([name, status]) => [name, copy("sim.status." + status)])),
  };
}

/** What a row shows: the control's text as it appears in the game. */
export function rowBadge(row, copy) {
  if (!row.badge) return "";
  if (row.badge.text) return row.badge.text;
  return copy(row.badge.key, row.badge.vars?.(copy) ?? {});
}

/** The bold name before a row's description, or "" when the badge already names the control. */
export function rowName(row, copy) {
  if (row.label) return copy(row.label);
  if (row.icon || row.badge?.text) return copy("guide.names." + row.id);
  return "";
}

/**
 * Builds the guide dialog inside `layer`, a hidden element that is a direct child of the app root.
 * `copy(key, vars)` translates in the current language, `icon(name)` returns the game's SVG icons.
 */
export function createGuide({ layer, copy, icon = gameIcon, onLanguage, onClose = () => {} }) {
  let index = 0;
  let open = false;
  let opener = null;
  layer.innerHTML = `
    <div class="modal-backdrop"></div>
    <section class="modal guide" role="dialog" aria-modal="true" aria-labelledby="guide-title">
      <div class="guide-head">
        <span class="robot" aria-hidden="true"></span><span class="eyebrow" id="guide-kicker"></span>
        <span class="chip" id="guide-progress"></span><button id="guide-language" type="button"></button>
      </div>
      <div class="guide-dots" id="guide-dots" aria-hidden="true"></div>
      <div class="guide-icons" id="guide-icons" aria-hidden="true"></div>
      <h2 id="guide-title"></h2>
      <ul class="guide-lines" id="guide-lines"></ul>
      <ul class="guide-rows" id="guide-rows"></ul>
      <p class="guide-tip"><span class="robot" aria-hidden="true"></span><span><b id="guide-tip-label"></b> <span id="guide-tip"></span></span></p>
      <div class="guide-actions">
        <button id="guide-back" type="button"></button><button id="guide-skip" type="button"></button>
        <button id="guide-next" type="button" class="primary"></button>
      </div>
    </section>`;
  const find = (id) => layer.querySelector("#" + id);
  const others = () => [...(layer.parentElement?.children ?? [])].filter((element) => element !== layer);
  const isLast = () => index === GUIDE_STEPS.length - 1;

  function item(tag, value, className) {
    const element = document.createElement(tag);
    if (value) element.textContent = value;
    if (className) element.className = className;
    return element;
  }

  function row(control, vars) {
    const line = item("li", "", "guide-row");
    const key = item("span", "", "guide-key" + (control.primary ? " primary" : "") + (control.icon ? " icon" : ""));
    if (control.icon) key.innerHTML = icon(control.icon);
    else key.textContent = rowBadge(control, copy);
    const text = item("span", "", "guide-desc");
    const name = rowName(control, copy);
    if (name) text.append(item("b", name), " ");
    text.append(copy("guide.rows." + control.id, vars));
    line.append(key, text);
    return line;
  }

  function render() {
    if (!open) return;
    const step = GUIDE_STEPS[index];
    const vars = guideVars(copy);
    const key = (part) => `guide.steps.${step.id}.${part}`;
    find("guide-kicker").textContent = copy("guide.title");
    find("guide-progress").textContent = copy("guide.progress", { n: index + 1, total: GUIDE_STEPS.length });
    find("guide-language").textContent = copy("guide.otherLanguage");
    find("guide-dots").replaceChildren(...GUIDE_STEPS.map((_, i) =>
      item("i", "", i === index ? "on" : i < index ? "done" : "")));
    find("guide-icons").innerHTML = step.icons.map(icon).join("");
    find("guide-title").textContent = copy(key("title"), vars);
    find("guide-lines").replaceChildren(...Array.from({ length: step.lines }, (_, i) => item("li", copy(key("l" + (i + 1)), vars))));
    find("guide-lines").hidden = !step.lines;
    find("guide-rows").replaceChildren(...(step.rows ?? []).map((control) => row(control, vars)));
    find("guide-rows").hidden = !step.rows?.length;
    find("guide-tip-label").textContent = copy("guide.tipLabel");
    find("guide-tip").textContent = copy(key("tip"), vars);
    find("guide-back").textContent = copy("guide.back");
    find("guide-back").disabled = index === 0;
    find("guide-skip").textContent = copy("guide.skip");
    find("guide-skip").hidden = isLast();
    find("guide-next").textContent = copy(isLast() ? "guide.finish" : "guide.next");
    find("guide-next").closest(".guide").scrollTop = 0;
  }

  function go(delta) {
    index = Math.max(0, Math.min(GUIDE_STEPS.length - 1, index + delta));
    render();
    const focused = document.activeElement;
    if (!layer.contains(focused) || focused.disabled || focused.hidden) find("guide-next").focus();
  }

  function show(from) {
    opener = from ?? document.activeElement;
    index = 0;
    open = true;
    layer.hidden = false;
    for (const element of others()) element.inert = true;
    render();
    find("guide-next").focus();
  }

  function close() {
    if (!open) return;
    open = false;
    layer.hidden = true;
    for (const element of others()) element.inert = false;
    markGuideSeen();
    onClose();
    if (opener?.isConnected && !opener.closest("[hidden]")) opener.focus();
  }

  find("guide-back").addEventListener("click", () => go(-1));
  find("guide-next").addEventListener("click", () => (isLast() ? close() : go(1)));
  find("guide-skip").addEventListener("click", close);
  find("guide-language").addEventListener("click", () => onLanguage?.());
  layer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowRight" && !isLast()) go(1);
    else if (event.key === "ArrowLeft") go(-1);
    else return;
    event.preventDefault();
    event.stopPropagation();
  });

  return {
    open: show,
    close,
    render,
    get isOpen() { return open; },
    get step() { return index; },
  };
}
