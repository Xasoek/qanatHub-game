// "How to play" survival guide: six short steps with Beep's tips.
// Texts live in text.js under `guide`; numbers come from CONFIG so the guide
// always matches the mission rules. The guide never changes the game state.
import { CONFIG } from "./config.js";

/** Steps in order. `lines` is how many short lines the step has in text.js. */
export const GUIDE_STEPS = [
  { id: "mission", icons: ["planet"], lines: 3 },
  { id: "base", icons: ["home", "air", "farm", "comms"], lines: 3 },
  { id: "resources", icons: ["oxygen", "food", "energy"], lines: 3 },
  { id: "plan", icons: ["energy", "repair", "skip"], lines: 4 },
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

/** Values the guide texts insert, taken from the rules and the interface labels. */
export function guideVars(copy) {
  const sim = CONFIG.simulation;
  return {
    sols: CONFIG.missionSols,
    hours: sim.hours,
    battery: sim.batteryCapacity,
    depart: sim.evacuationFrom,
    patch: sim.patchSols,
    storm: CONFIG.difficulties.engineer.stormDecisionMs / 1000,
    stormCadet: CONFIG.difficulties.cadet.stormDecisionMs / 1000,
    ship: copy("ui.space.ship"),
    start: copy("game.next"),
    end: copy("game.end"),
    advance: copy("game.advance"),
    plan: copy("sim.open"),
    sensors: copy("ui.sensors"),
    leave: copy("sim.tasks.depart"),
    ...Object.fromEntries(CONFIG.systems.map((system) => [system, copy("story.systems." + system)])),
  };
}

/**
 * Builds the guide dialog inside `layer`, a hidden element that is a direct child of the app root.
 * `copy(key, vars)` translates in the current language, `icon(name)` returns the game's SVG icons.
 */
export function createGuide({ layer, copy, icon, onLanguage, onClose = () => {} }) {
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
    find("guide-tip-label").textContent = copy("guide.tipLabel");
    find("guide-tip").textContent = copy(key("tip"), vars);
    find("guide-back").textContent = copy("guide.back");
    find("guide-back").disabled = index === 0;
    find("guide-skip").textContent = copy("guide.skip");
    find("guide-skip").hidden = isLast();
    find("guide-next").textContent = copy(isLast() ? "guide.finish" : "guide.next");
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
