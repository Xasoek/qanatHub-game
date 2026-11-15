// Role 2: game interface over the 3D outpost. The UI reads STATE and changes it only through the engine API.
import { ART_CREDITS, createWorld, hasCapableGpu, missionSnapshot, renderBase, renderProfile } from "./art.js";
import { CONFIG } from "./config.js";
import { FACTS, SITES, loadSolarData } from "./data.js";
import {
  STATE, allocate, endSol, getActiveEvent, getBlockedSystems, getEndReport, hasSave, load, newGame, on, resolveEvent, setSpeed,
  skipToDecision, tick, planTask, unplanTask, taskAvailable, simulationPreview, drawBattery, reviewSol, save,
} from "./engine.js";
import { DAILY_TASKS, STORY_SOURCES, TRAINING_TASKS, playIntro, t } from "./text.js";

const studyKeys = ["bip.study.sleep", "bip.study.muscle", "bip.study.bone"];
const realKeys = ["real.storm", "real.flare", "real.lettuce", "real.radish", "real.potato", "real.cropTiming"];
const terms = ["sol", "radiation", "dose", "flare", "flareClasses", "delay", "pressure"];
const actionKeys = { next: "game.next", end: "game.end", advance: "game.advance", restart: "end.retry" };
// Which building Mark walks to for each system, and which system a building opens.
const SYSTEM_OBJECT = { air: "air", farm: "farm", repair: "repair", heat: "air", comms: "comms", science: "science" };
const OBJECT_SYSTEM = { air: "air", farm: "farm", repair: "repair", heat: null, comms: "comms", science: "science", panels: "repair" };
const ICONS = {
  air: '<path d="M8 25V14a8 8 0 0 1 16 0v11M5 25h22M12 25v-8h8v8M10 12h12"/>',
  farm: '<path d="M16 27V14m0 6C3 21 3 9 3 9s13-1 13 11Zm0-5C16 3 28 3 28 3s1 12-12 12Z"/>',
  repair: '<path d="M20 3a8 8 0 0 0-8 10L4 23a3 3 0 0 0 5 5l10-9A8 8 0 0 0 29 9l-6 5-5-5 5-6Z"/>',
  heat: '<path d="M16 4v14m0 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 8h4m-4 4h4"/><path d="M23 9c2 2 2 5 0 7m3-10c3 4 3 9 0 13"/>',
  comms: '<path d="M5 5c-2 10 4 17 14 14L5 5Zm14 14 6 8H9l4-8m5-11 6-6m-4 0h4v4M20 9a5 5 0 0 1 5 5m-5-9a9 9 0 0 1 9 9"/>',
  science: '<path d="M12 3h8m-6 0v8L6 26a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-8-15V3M9 20h14"/>',
  oxygen: '<path d="M7 12a8 8 0 0 1 16 0v10a8 8 0 0 1-16 0V12Z"/><path d="M11 10h8m-8 13h8"/>',
  food: '<path d="M16 27V14m0 6C3 21 3 9 3 9s13-1 13 11Zm0-5C16 3 28 3 28 3s1 12-12 12Z"/>',
  energy: '<path d="M18 2 5 19h10l-1 11 13-18H17l1-10Z"/>',
  planet: '<circle cx="16" cy="16" r="10"/><path d="M4 19c-7 8 8 8 19-3S34 4 27 7"/>',
  home: '<path d="M5 15 16 5l11 10M8 13v13h16V13"/>',
  pause: '<path d="M11 7v18M21 7v18"/>',
  skip: '<path d="m6 7 10 9-10 9V7Zm10 0 10 9-10 9V7Z"/>',
  sound: '<path d="M5 12h5l7-6v20l-7-6H5Z"/><path d="M21 11a6 6 0 0 1 0 10m3-14a11 11 0 0 1 0 18"/>',
  mute: '<path d="M5 12h5l7-6v20l-7-6H5Z"/><path d="m21 12 8 8m0-8-8 8"/>',
  menu: '<path d="M5 9h22M5 16h22M5 23h22"/>',
};
const icon = (name) => `<svg class="ico" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

// Short Web Audio cues, no sound files.
function createSound() {
  let ctx = null, enabled = true;
  return {
    get enabled() { return enabled; },
    toggle() { enabled = !enabled; return enabled; },
    play(kind) {
      if (!enabled) return;
      try {
        ctx ??= new AudioContext();
        const notes = { tap: [[660, 0.04]], event: [[520, 0.12], [780, 0.16]], alarm: [[880, 0.1], [660, 0.1], [880, 0.1]], tick: [[1200, 0.03]], good: [[523, 0.1], [659, 0.1], [784, 0.18]] }[kind] ?? [];
        let at = ctx.currentTime;
        for (const [freq, len] of notes) {
          const osc = ctx.createOscillator(), gain = ctx.createGain();
          osc.frequency.value = freq;
          osc.type = kind === "alarm" ? "square" : "sine";
          gain.gain.setValueAtTime(0.0001, at);
          gain.gain.exponentialRampToValueAtTime(kind === "alarm" ? 0.05 : 0.08, at + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, at + len);
          osc.connect(gain).connect(ctx.destination);
          osc.start(at);
          osc.stop(at + len + 0.02);
          at += len * 0.9;
        }
      } catch { enabled = false; }
    },
  };
}

export async function mountGame(root) {
  let lang = "en";
  // The intro cutscene is removed for now; the game opens on the mission setup.
  let screen = "setup";
  let returnScreen;
  let before;
  let task;
  let completedTask;
  let message;
  let warning;
  let flareRecords;
  let previousEvent;
  let lastTick;
  let lastHud = 0;
  let world = null;
  let walkHint = null;
  let picked = null;
  let menuOpen = false;
  const sound = createSound();
  let solarData = await loadSolarData();
  let dataChoice = "archive";
  let dataNotice = null;
  let starting = false;
  // Systems a decision closed for the rest of the sol (issue #11): system -> event type.
  let demoRunning=false;
  let savedSolar=false;
  let lastSeed=null;
  let intro=null, introFrame=null, introPosition=null;
  const memo = {};
  const changed = (key, sig) => { if (memo[key] === sig) return false; memo[key] = sig; return true; };

  const copy = (key, vars) => t(lang, key, vars);
  const find = (id) => root.querySelector("#" + id);
  const text = (id, key, vars) => { find(id).textContent = copy(key, vars); };
  const fact = (id) => FACTS.find((f) => f.id === id)?.value;

  root.classList.add("app");
  root.innerHTML = `
    <div id="base" class="world" role="img"></div>
    <div class="topbar">
      <div class="brand"><span class="planet-logo" aria-hidden="true"></span><h1 id="game-title"></h1></div>
      <div class="resbar" id="resbar">
        <div class="res solx"><div><b id="sol-number"></b><i id="sol-total"></i></div><small id="rescue"></small></div>
        <div class="res o2">${icon("oxygen")}<div><span class="k" id="oxygen-label"></span><b id="oxygen"></b><span class="meter"><i id="oxygen-meter"></i></span></div></div>
        <div class="res food">${icon("food")}<div><span class="k" id="food-label"></span><b id="food"></b><span class="meter"><i id="food-meter"></i></span></div></div>
        <div class="res energy">${icon("energy")}<div><span class="k" id="energy-label"></span><b id="energy"></b><span class="pips" id="energy-pips"></span></div></div>
      </div>
      <div class="topright">
        <p id="solar" class="chip"></p>
        <button id="sound" type="button" class="icon-button"></button>
        <button id="language" type="button"></button>
        <button id="menu" type="button" class="icon-button" aria-expanded="false">${icon("menu")}</button>
        <nav class="menu-panel" id="menu-panel" hidden>
          <button id="mission-menu" type="button"></button><button id="watch" type="button"></button>
          <button id="demo-start" type="button"></button><button id="demo-exit" type="button" hidden></button>
          <button id="facts" type="button"></button>
          <button id="teachers" type="button"></button><button id="sources" type="button"></button>
        </nav>
      </div>
    </div>
    <section id="setup-screen" class="sheet setup" hidden>
      <h2 id="premise"></h2>
      <p class="eyebrow" id="site-label"></p>
      <div class="cards" id="site-cards"></div>
      <p class="eyebrow" id="difficulty-label"></p>
      <div class="cards two" id="difficulty-cards"></div>
      <p class="eyebrow" id="data-label"></p>
      <div class="cards two" id="data-cards"></div>
      <div class="hidden-controls"><select id="site" aria-hidden="true" tabindex="-1"></select><select id="difficulty" aria-hidden="true" tabindex="-1"></select></div>
      <div class="setup-actions">
        <button id="start" type="button" class="primary"></button>
        <button id="continue" type="button" hidden></button>
      </div>
      <details class="presentation"><summary id="presentation-label"></summary><div class="acts" id="acts"></div></details>
    </section>
    <section id="mission-screen" hidden>
      <p id="sol" class="sol-line"></p>
      <aside class="side">
        <section class="beep-card"><button id="work-open" type="button"></button>
          <div class="beep-title"><span class="robot" aria-hidden="true"></span><span id="beep-name">Beep</span><span id="phase-chip" class="chip"></span></div>
          <p id="bip" aria-live="polite"></p><p id="warning" role="status"></p><p id="walk" class="muted"></p>
          <p id="daily" class="task"></p><p id="task-result" role="status" class="done"></p>
        </section>
        <section class="earth-card" id="earth-card" hidden><span class="eyebrow" id="earth-label"></span><p id="forecast"></p></section>
        <details class="sensors" id="sensors"><summary id="sensors-label"></summary><dl id="sensor-list"></dl></details>
      </aside>
      <nav class="rail" id="rail">
        <button id="orbit" type="button">${icon("planet")}</button><span class="sep"></span>
        <button id="zoom-in" type="button">+</button><button id="zoom-out" type="button">−</button><button id="home" type="button">${icon("home")}</button>
      </nav>
      <div class="orbit-heading"><h2 id="orbit-title"></h2><div class="focus-tabs"><button id="focus-mars" type="button"></button><button id="focus-earth" type="button"></button><button id="focus-system" type="button"></button><button id="focus-ship" type="button"></button></div><section class="trip"><p class="eyebrow" id="trip-ship"></p><dl id="trip-list"></dl><p id="trip-note" class="muted"></p></section><p id="orbit-note"></p><button id="to-base" type="button" class="primary"></button></div>
      <div class="dock">
        <div class="speed" id="speed">
          <button id="pause" type="button" data-speed="0">${icon("pause")}</button>
          <button type="button" data-speed="1">×1</button><button type="button" data-speed="2">×2</button><button type="button" data-speed="4">×4</button>
          <button id="skip" type="button">${icon("skip")}</button>
        </div>
        <div id="systems" class="systems"></div>
        <div class="phase-actions">
          <span id="cubes-free" class="cubes-free"></span>
          <button id="next" type="button" class="primary"></button><button id="end" type="button" class="primary"></button>
          <button id="advance" type="button" class="primary"></button>
        </div>
      </div>
      <div class="modal-backdrop" id="event-backdrop" hidden></div>
      <section id="event" class="modal" hidden aria-labelledby="event-title" role="dialog">
        <div class="timer" id="event-timer-ring" hidden><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17"/><circle id="timer-arc" cx="20" cy="20" r="17"/></svg><p id="event-timer"></p></div>
        <h2 id="event-title"></h2><p id="event-body"></p>
        <div id="choices" class="choices"></div>
      </section>
      <section id="ending" class="modal ending" hidden aria-live="polite"></section>
      <button id="restart" type="button" class="primary restart" hidden></button>
    </section>
    <section id="intro-screen" class="sheet intro-sequence" hidden aria-labelledby="intro-caption">
      <div id="intro-art" role="img"></div><p id="intro-progress"></p><h2 id="intro-caption"></h2>
      <div class="intro-actions"><button id="intro-next" type="button"></button><button id="intro-skip" type="button"></button></div>
    </section>
    <section id="work-screen" class="sheet work-screen" hidden role="dialog" aria-labelledby="work-title">
      <div class="sheet-head"><h2 id="work-title"></h2><button id="work-close" type="button"></button></div>
      <div id="work-stats" class="work-stats"></div><p id="work-preview" role="status"></p>
      <p id="work-fault"></p><p id="work-crop"></p><p id="work-radio"></p>
      <p id="work-reply"></p><p id="work-tip"></p><p id="work-eva"></p><p id="work-final"></p>
      <button id="work-draw" type="button"></button>
      <div id="work-tasks" class="work-tasks"></div><p id="work-error" role="status"></p><p id="work-model"></p>
    </section>
    <section id="portrait-lock" class="portrait-lock" role="alert"><div class="rotate-device" aria-hidden="true"></div><h2 id="rotate-title"></h2><p id="rotate-hint"></p></section>
    <section id="reading-screen" class="sheet reading" hidden>
      <div class="sheet-head"><h2 id="reading-title"></h2><button id="back" type="button"></button></div><div id="reading-copy"></div>
    </section>`;

  const listen = (id, fn) => find(id).addEventListener("click", fn);
  function node(tag, value = "", cls) {
    const element = document.createElement(tag);
    element.textContent = value;
    if (cls) element.className = cls;
    return element;
  }
  function paragraph(container, key, vars, source) {
    const line = node("p", copy(key, vars));
    if (source) {
      const link = node("a", copy("sources.title"));
      link.href = source;
      link.target = "_blank";
      link.rel = "noopener";
      line.append(" ", link);
    }
    container.append(line);
  }

  // ---------- 3D world, with the SVG scene as a fallback ----------
  const base = find("base");
  root.classList.add("flat");
  // The 3D scene is built after the first paint, so the page loads and the setup shows at once.
  function initWorld() {
    try {
      if (!hasCapableGpu()) throw new Error("No hardware WebGL 2");
      world = createWorld(base, { stateRoot: root, onPick: pick });
      base.querySelector("svg")?.remove();
      root.classList.remove("flat");
      world.setPaused(matchMedia("(orientation: portrait)").matches);
      render();
    } catch (error) {
      console.info("3D view unavailable, using the 2D scene:", error.message);
      world = null;
      base.innerHTML = renderBase(STATE);
      base.title = copy("ui.webgl");
    }
  }
  function pick(id) {
    if (screen !== "mission") return;
    world?.focus(id);
    picked = OBJECT_SYSTEM[id] ?? null;
    walkHint = { key: "ui.walk", vars: { place: copy("ui.objects." + id) } };
    sound.play("tap");
    renderMission();
  }

  function show(next) {
    if(next!=="mission")find("work-screen").hidden=true;
    screen = next;
    menuOpen = false;
    render();
  }
  function openReading(next) {
    if (screen === "mission" && getActiveEvent()?.remainingMs != null) return;
    if (!["facts", "teachers", "sources"].includes(screen)) returnScreen = screen;
    show(next);
  }
  function renderReading() {
    const container = find("reading-copy");
    container.replaceChildren();
    text("back", "story.back");
    if (screen === "facts") {
      text("reading-title", "real.title");
      for (const key of realKeys) paragraph(container, key, {}, STORY_SOURCES[key]);
      if (STATE?.site) paragraph(container, "real.site", { site: copy("site." + STATE.site) }, STORY_SOURCES["real.site"]);
      for (const flare of flareRecords?.values() ?? []) {
        paragraph(container, "real.flareRecord", { date: flare.beginTime.slice(0, 10), class: flare.classType }, flare.link ?? flare.messageURL);
      }
      if (STATE?.site && !flareRecords?.size) paragraph(container, "real.noFlares");
    } else if (screen === "teachers") {
      text("reading-title", "teachers.title");
      paragraph(container, "teachers.intro", {}, STORY_SOURCES["teachers.intro"]);
      const list = node("ol");
      for (let i = 1; i <= 6; i++) list.append(node("li", copy("teachers.q" + i)));
      container.append(list);
    } else {
      text("reading-title", "sources.title");
      for (const [key, url] of Object.entries(STORY_SOURCES)) paragraph(container, key, { site: copy("site." + (STATE?.site ?? CONFIG.defaults.site)) }, url);
      for (const term of terms) paragraph(container, "bip.term." + term);
      container.append(node("h3", copy("ui.credits")));
      for (const credit of ART_CREDITS) {
        const line = node("p");
        const link = node("a", credit.title);
        link.href = credit.url;
        link.target = "_blank";
        link.rel = "noopener";
        line.append(link, " — ", copy("ui.credit." + credit.id));
        container.append(line);
      }
      paragraph(container, "ui.credit.art");
    }
  }

  function chooseTask() {
    before = structuredClone(STATE);
    const fixedKey = TRAINING_TASKS[STATE.sol - 1];
    task = DAILY_TASKS.find(({ key }) => key === fixedKey);
    if (!task) {
      const available = DAILY_TASKS.filter(({ key }) => {
        if (key === "task.reduceDamage") return STATE.damage > 0;
        if (key === "task.restorePanel") return STATE.panels.broken + STATE.panels.dusty > 0;
        if (key === "task.lessFatigue") return STATE.fatigue > 0;
        return true;
      });
      task = available[(STATE.sol - 1) % available.length];
    }
    warning = STATE.damage > CONFIG.leakDamage ? "bip.warning.damage" : null;
    if (STATE.sol <= TRAINING_TASKS.length) message = { key: "bip.training.s" + STATE.sol };
    else if (STATE.sol <= TRAINING_TASKS.length + studyKeys.length) message = { key: studyKeys[STATE.sol - TRAINING_TASKS.length - 1] };
    else message = null;
  }
  function checkTask() {
    if (!task || completedTask?.sol === before.sol) return;
    const after = { ...STATE };
    const alloc = STATE.sol === before.sol ? STATE.alloc : before.finalAlloc;
    if (task.check({ before, after, alloc })) {
      completedTask = { sol: before.sol };
      sound.play("good");
    }
  }
  function beginMission(state) {
    find("work-screen").hidden=true;
    completedTask = null;
    previousEvent = null;
    flareRecords = new Map();
    for(const entry of state?.log??[]){
      const flare=entry.sourceFlare;
      if(flare?.beginTime)flareRecords.set(flare.flrID??flare.beginTime,flare);
    }
    picked = null;
    walkHint = null;
    world?.setFolded(false);
    if (state) chooseTask();
    show("mission");
  }
  function freshSeed(){
    let value=crypto.getRandomValues(new Uint32Array(1))[0];
    if(value===lastSeed)value=(value+1)>>>0;
    lastSeed=value;return value;
  }
  function continueMission(){
    const state=load();if(!state)return;
    demoRunning=false;savedSolar=state.solarMode==="live";dataNotice=null;
    solarData={mode:state.solarMode,flares:state.flares,asOf:state.solarMode==="archive"?"2024-05-31":null};
    beginMission(state);
  }
  async function startMission(presentation) {
    if (starting) return;
    if(presentation&&!demoRunning&&screen==="mission")save();
    savedSolar=false;
    if (dataChoice === "live") {
      starting = true;
      find("start").disabled = true;
      text("start", "ui.loading");
      solarData = await loadSolarData({ mode: "live" });
      starting = false;
      find("start").disabled = false;
    } else if (solarData.mode !== "archive") solarData = await loadSolarData();
    dataNotice = solarData.noticeKey;
    newGame({ site: find("site").value, difficulty: find("difficulty").value, solarData,
      simulation: !presentation, seed: presentation?9:freshSeed(), ...(presentation ? { presentation: { act: presentation } } : {}) });
    demoRunning=Boolean(presentation);
    beginMission(STATE);
  }

  on("phase", ({ phase }) => {
    if (!before) return;
    if (phase === "evening") before.finalAlloc = { ...STATE.alloc };
    if (phase === "morning") {
      checkTask();
      chooseTask();
      world?.setFolded(false);

    }
  });
  on("event", (event) => {
    const { type, data } = event;
    if (type === "flare") {
      if (data.flare?.beginTime) flareRecords?.set(data.flare.flrID ?? data.flare.beginTime, data.flare);
      world?.flare();
    }
    sound.play(type === "storm" || type === "flare" || type === "consequence" ? "alarm" : "event");
  });
  on("gameover", () => sound.play("good"));

  function setEventResponse(event, choice) {
    if (event.type === "consequence") message = { key: "bip.consequence." + event.data.kind, vars: { sol: event.data.sourceSol } };
    else if (event.type === "lowReserve") message = { key: "bip.warning." + event.data.resource };
    else {
      const suffix = choice[0].toUpperCase() + choice.slice(1);
      message = { key: `ev.${event.type}.after${suffix}` };
    }
    if (event.type === "storm") world?.setFolded(choice === "fold");

  }

  function eventChoices(event) {
    const { type, data } = event;
    text("event-title", `ev.${type}.title`);
    text("event-body", `ev.${type}.body`, { ...data, sol: data.sourceSol });
    if (type === "earthAdvice" && data.stale) {
      find("event-body").textContent = copy("earth.staleStorm", { p: data.storm }) + " " + copy("earth.staleFlare", { p: data.flare });
    }
    if (type === "flare") find("event-body").append(" ", copy("bip.term.radiation"), " ", copy("bip.term.dose"), " ", copy("bip.term.flareClasses"));
    find("event").dataset.type = type;
    const list = find("choices");
    list.replaceChildren();
    for (const choice of event.choices) {
      const button = node("button", "", "choice");
      button.type = "button";
      button.disabled = choice.disabled;
      button.append(node("b", copy(`ev.${type}.${choice.id}`)));
      for (const [unit, value] of Object.entries(choice.cost)) {
        if (!value) continue;
        button.append(node("span", copy(value > 0 ? "story.cost" : "story.gain", { value: Math.abs(value), unit: copy("story.units." + unit) }), value > 0 ? "cost" : "gain"));
      }
      button.addEventListener("click", () => {
        if (resolveEvent(event.id, choice.id)) {
          setEventResponse(event, choice.id);
          previousEvent = null;
          sound.play("tap");
        }
        render();
      });
      list.append(button);
    }
  }
  function renderEvent(event) {
    find("event").hidden = !event;
    find("event-backdrop").hidden = !event;
    if (!event) {
      previousEvent = null;
      return;
    }
    if (previousEvent?.id !== event.id || previousEvent?.lang !== lang) {
      eventChoices(event);
      previousEvent = { id: event.id, lang };
    }
    const timed = event.remainingMs != null;
    find("event-timer-ring").hidden = !timed;
    if (timed) {
      const seconds = Math.ceil(event.remainingMs / 1000);
      text("event-timer", "story.timer", { n: seconds });
      const total = event.timeoutMs ?? CONFIG.difficulties[STATE.difficulty].stormDecisionMs;
      find("timer-arc").style.strokeDashoffset = String(106.8 * (1 - event.remainingMs / total));
    }
  }

  function costs(container, cost) {
    for (const [unit, value] of Object.entries(cost)) {
      if (!value) continue;
      paragraph(container, value > 0 ? "story.cost" : "story.gain", { value: Math.abs(value), unit: copy("story.units." + unit) });
    }
  }
  function renderEnding() {
    const container = find("ending");
    const report = getEndReport();
    container.dataset.status = report.status;
    container.replaceChildren(node("h2", copy(`end.${report.status}.title`)));
    paragraph(container, `end.${report.status}.body`);
    if(STATE.sim){
      if(STATE.sol>=CONFIG.missionSols&&!STATE.sim.departed)paragraph(container,"sim.notes.notReady");
      paragraph(container,"sim.ready",{n:Object.values(STATE.sim.ready).filter(Boolean).length});
    }
    const stats = node("div", "", "end-stats");
    paragraph(stats, "end.oxygen", { n: report.oxygen });
    paragraph(stats, "end.food", { n: report.food });
    paragraph(stats, "end.panels", { n: report.panelsWorking, total: CONFIG.panels });
    paragraph(stats, "end.stars", { n: report.stars, total: CONFIG.science.starSamples.length });
    container.append(stats);
    if (report.chains.length) {
      container.append(node("h3", copy("end.review")));
      const list = node("ol", "", "chains");
      for (const chain of report.chains) {
        const item = node("li");
        item.append(node("h4", copy("end.chain.choice", { sol: chain.sol, choice: copy("log." + chain.choice) })));
        costs(item, chain.cost);
        for (const effect of chain.effects) {
          paragraph(item, "end.chain.choice", { sol: effect.sol, choice: copy("log.effect." + effect.kind) });
          costs(item, effect.cost);
        }
        if (!chain.effects.length) paragraph(item, "story.noEffect");
        list.append(item);
      }
      container.append(list);
    }
    const facts = node("button", copy("real.title"));
    facts.type = "button";
    facts.addEventListener("click", () => openReading("facts"));
    container.append(facts);
  }

  function renderSystems(event, playing) {
    const blockedSystems=getBlockedSystems();
    for (const system of CONFIG.systems) {
      const tile = find("system-" + system);
      const locked = !STATE.sim && STATE.sol < CONFIG.unlockSol[system];
      const closedChoice=blockedSystems[system];
      const closedBy=Object.hasOwn(blockedSystems,system);
      tile.classList.toggle("blocked", Boolean(closedBy));
      const reason=tile.querySelector(".why");
      reason.textContent=closedBy?copy(closedChoice?"story.blockedReason":"story.blocked",{reason:closedChoice?copy("log."+closedChoice):""}):"";
      reason.hidden=!closedBy;
      tile.hidden = !playing;
      tile.classList.toggle("locked", locked);
      tile.classList.toggle("picked", picked === system);
      const label = copy("story.systems." + system);
      tile.querySelector(".name").textContent = label;
      tile.querySelector("span").textContent = label + " · " + STATE.alloc[system];
      const pips = tile.querySelector(".pips");
      if (changed("pips-" + system, STATE.alloc[system])) pips.replaceChildren(...Array.from({ length: CONFIG.maxAlloc[system] }, (_, i) => node("i", "", i < STATE.alloc[system] ? "on" : "")));
      tile.title = locked ? copy("ui.locked", { sol: CONFIG.unlockSol[system] }) : closedBy ? reason.textContent : label;
      for (const button of tile.querySelectorAll("button")) {
        const delta = Number(button.dataset.delta);
        button.setAttribute("aria-label", copy(delta > 0 ? "ui.allocAdd" : "ui.allocRemove", { system: label }));
        if(closedBy)button.setAttribute("aria-describedby",reason.id);
        else button.removeAttribute("aria-describedby");
        button.disabled = Boolean(event) || STATE.phase !== "day" || locked || Boolean(closedBy) ||
          (delta > 0 ? STATE.cubes === 0 || STATE.alloc[system] >= CONFIG.maxAlloc[system] : STATE.alloc[system] === 0);
      }
    }
  }

  function renderWork() {
    const sim=STATE.sim, forecast=simulationPreview();
    if(!sim || !forecast)return;
    text("work-title","sim.title");text("work-close","sim.close");text("work-draw","sim.draw");
    text("work-tip","sim.tip");text("work-eva","sim.returnPath");find("work-eva").append(" ",copy("sim.farWarning"));text("work-final","sim.final");text("work-model","sim.balance");
    find("work-stats").replaceChildren(
      node("b",copy("sim.hours",{used:forecast.hours,total:CONFIG.simulation.hours})),
      node("b",copy("sim.battery",{n:sim.battery,total:CONFIG.simulation.batteryCapacity})),
      node("b",copy("sim.parts",{n:sim.spares})),
      node("b",copy("sim.ready",{n:forecast.ready}))
    );
    find("work-preview").textContent=copy("sim.preview",forecast);
    find("work-preview").classList.toggle("work-danger",forecast.charge<forecast.need);
    find("work-fault").textContent=sim.sealBroken
      ? sim.patchUntil?copy("sim.patched",{sol:sim.patchUntil}):copy(sim.inspected?"sim.diagnosed":"sim.leak")
      :copy("sim.fixed");
    find("work-radio").textContent=sim.radioBroken?copy("sim.radio"):"";
    text("work-crop","sim.harvest",{n:STATE.crop.progress,total:CONFIG.crops[STATE.crop.type].sols});
    find("work-reply").textContent=sim.reply?copy("sim.request",{sent:sim.reply.sentSol,received:sim.reply.receivedSol})+" "+copy(sim.reply.stale?"sim.stale":"sim.fresh"):"";
    find("work-draw").disabled=STATE.phase!=="day" || !sim.battery || Boolean(getActiveEvent()) || STATE.status!=="playing";
    const key=lang+JSON.stringify([getActiveEvent()?.id,STATE.sol,STATE.phase,STATE.cubes,STATE.alloc,STATE.oxygen,STATE.panels,STATE.status,sim]);
    if(!changed("work",key))return;
    const tasks=find("work-tasks");tasks.replaceChildren();
    for(const [id,rule]of Object.entries(CONFIG.simulation.tasks)){
      const queued=sim.plan.includes(id), available=taskAvailable(id);
      const button=node("button","","work-job"+(queued?" reserved":""));
      button.type="button";button.disabled=!queued&&!available;
      button.setAttribute("aria-pressed",String(queued));
      button.append(node("b",copy("sim.tasks."+id)),node("span",copy("sim.why."+id)),
        node("small",copy("sim.cost",rule)),node("em",queued?copy("sim.pending"):available?"":copy("sim.locked")));
      button.addEventListener("click",()=>{
        const done=queued?unplanTask(id):planTask(id);
        find("work-error").textContent=done?"":copy("sim.failed");
        if(done&&!queued)world?.focus(rule.target);
        renderMission();
      });
      tasks.append(button);
    }
  }
  listen("work-open",()=>{find("work-screen").hidden=false;setSpeed(0);renderWork();find("work-close").focus();});
  listen("work-close",()=>{find("work-screen").hidden=true;find("work-open").focus();});
  listen("work-draw",()=>{drawBattery();renderMission();});

  // Rescue-ship trajectory panel for the space view (numbers from src/art/orbits.js).
  function renderTrip(force) {
    const sol = STATE?.sol ?? 1;
    if (!force && !changed("trip", lang + sol)) return;
    memo.trip = lang + sol;
    const m = missionSnapshot(sol, CONFIG.missionSols), mkm = (km) => (km / 1e6).toFixed(1);
    text("trip-ship", "ui.trip.ship");
    text("trip-note", "ui.trip.note");
    const rows = [
      ["day", copy("ui.trip.dayValue", { d: Math.round(m.day), total: Math.round(m.totalDays) })],
      ["arrival", copy("ui.trip.arrivalValue", { n: Math.round(m.remaining), s: Math.max(0, CONFIG.missionSols - sol) })],
      ["speed", copy("ui.trip.speedValue", { v: m.speed.toFixed(1) })],
      ["toMars", copy("ui.trip.million", { d: mkm(m.distToMarsKm) })],
      ["fromEarth", copy("ui.trip.million", { d: mkm(m.distFromEarthKm) })],
      ["delay", copy("ui.trip.delayValue", { m: m.delayMin.toFixed(1) })],
    ];
    find("trip-list").replaceChildren(...rows.flatMap(([k, v]) => [node("dt", copy("ui.trip." + k)), node("dd", v)]));
  }
  function renderSensors() {
    const list = find("sensor-list");
    const working = CONFIG.panels - STATE.panels.broken - STATE.panels.dusty;
    const cropTotal = CONFIG.crops[STATE.crop.type]?.sols ?? 1;
    const temp = fact("temperature"), pressure = fact("surfacePressure");
    const rows = [
      ["damage", copy("ui.value.percent", { n: Math.round(STATE.damage) }), STATE.damage > CONFIG.leakDamage ? "bad" : STATE.damage > 30 ? "warn" : ""],
      ["panels", copy("ui.value.ofTotal", { n: working, total: CONFIG.panels }), working < CONFIG.panels ? "warn" : ""],
      ["crop", copy("ui.value.ofTotal", { n: STATE.crop.progress, total: cropTotal }) + " · " + copy("ev.cropChoice." + STATE.crop.type), ""],
      ["scrubber", copy(STATE.scrubberBroken ? "ui.value.broken" : "ui.value.ok"), STATE.scrubberBroken ? "bad" : ""],
      ["dose", String(STATE.dose), STATE.dose > 5 ? "warn" : ""],
      ["fatigue", String(STATE.fatigue), STATE.fatigue >= CONFIG.cubePenalty.fatigueAt ? "warn" : ""],
      ["crates", String(STATE.crates), ""],
      ...(temp ? [["temp", copy("ui.value.temp", { c: temp.averageC }), ""]] : []),
      ...(temp ? [["rangeLabel", copy("ui.range", { min: temp.minC, max: temp.maxC }), ""]] : []),
      ...(pressure ? [["pressure", copy("ui.value.pressure", { mb: pressure.mb }), ""]] : []),
    ];
    if (!changed("sensors", lang + JSON.stringify(rows))) return;
    list.replaceChildren(...rows.flatMap(([key, value, level]) => {
      const dt = node("dt", copy(key === "rangeLabel" ? "ui.rangeLabel" : "ui.sensor." + key));
      const dd = node("dd", value, level);
      return [dt, dd];
    }));
  }

  function setMeter(id, value, full) {
    const meter = find(id);
    meter.style.width = Math.max(0, Math.min(100, (value / full) * 100)) + "%";
    meter.classList.toggle("low", value < CONFIG.lowReserveSols);
  }

  function renderMission() {
    if (!STATE) return;
    const event = getActiveEvent();
    const playing = STATE.status === "playing";
    world?.setState(STATE);
    if (!world) find("base").innerHTML = renderBase(STATE);
    find("base").setAttribute("aria-label", copy("game.scene"));
    text("sol", "game.turn", { sol: STATE.sol, total: CONFIG.missionSols, phase: copy("phases." + STATE.phase) });
    find("sol-number").textContent = String(STATE.sol).padStart(2, "0");
    find("sol-total").textContent = "/" + CONFIG.missionSols;
    text("rescue", "ui.rescueIn", { n: Math.max(0, CONFIG.missionSols - STATE.sol) });
    const difficulty = CONFIG.difficulties[STATE.difficulty];
    for (const [key, value] of Object.entries({ oxygen: STATE.oxygen, food: STATE.food, energy: STATE.cubes })) {
      text(key + "-label", "game." + key);
      find(key).textContent = value;
    }
    setMeter("oxygen-meter", STATE.oxygen, difficulty.oxygen);
    setMeter("food-meter", STATE.food, difficulty.food);
    const allocated = Object.values(STATE.alloc).reduce((a, b) => a + b, 0);
    if (changed("energy", STATE.cubes + "/" + allocated)) find("energy-pips").replaceChildren(...Array.from({ length: STATE.cubes + allocated }, (_, i) => node("i", "", i < STATE.cubes ? "on" : "")));
    text("cubes-free", "ui.cubesFree", { n: STATE.cubes });
    text("phase-chip", "phases." + STATE.phase);
    find("phase-chip").dataset.phase = STATE.phase;

    find("daily").textContent = playing && task ? copy("story.task") + " · " + copy(task.key) : "";
    find("task-result").textContent = completedTask?.sol >= STATE.sol - 1 ? copy("story.done") : "";
    find("bip").textContent = message ? copy(message.key, message.vars) : copy("ui.pickHint");
    find("warning").textContent = warning ? copy(warning) : dataNotice && STATE.sol === 1 ? copy(dataNotice) : "";
    if (STATE.sol === 5 && playing) find("warning").append(copy("earth.rescue"));
    find("walk").textContent = walkHint ? copy(walkHint.key, walkHint.vars) : "";
    const forecast = STATE.forecast;
    find("earth-card").hidden = !forecast;
    if (forecast) {
      text("earth-label", "ui.earth");
      find("forecast").textContent = forecast.stale
        ? copy("earth.staleStorm", { p: forecast.storm }) + " " + copy("earth.staleFlare", { p: forecast.flare })
        : copy("ui.forecast", forecast);
    }
    text("sensors-label", "ui.sensors");
    if (root.classList.contains("orbital")) renderTrip(false);
    renderSensors();
    root.classList.toggle("alert", STATE.damage > CONFIG.leakDamage || STATE.scrubberBroken);
    root.dataset.weather = STATE.weather;

    if(STATE.sim){
      if(STATE.sol===1 && !STATE.sim.inspected)find("bip").textContent=copy("sim.intro");
      if(STATE.sim.notes.length)find("warning").textContent=STATE.sim.notes.map(n=>copy("sim.notes."+n)).join(" ");
      if(event)find("work-screen").hidden=true;
      renderWork();
    }
    find("work-open").hidden=!STATE.sim || !playing;
    text("work-open","sim.open");
    renderEvent(event);
    renderSystems(event, playing);
    for (const [id, key] of Object.entries(actionKeys)) text(id, key);
    find("next").disabled = !playing || STATE.phase !== "morning" || Boolean(event);
    find("end").disabled = !playing || STATE.phase !== "day" || Boolean(event);
    find("advance").disabled = !playing || !["evening", "night"].includes(STATE.phase) || Boolean(event);
    find("next").hidden = playing && STATE.phase !== "morning";
    find("end").hidden = playing && STATE.phase !== "day";
    find("advance").hidden = playing && !["evening", "night"].includes(STATE.phase);
    for (const button of find("speed").querySelectorAll("[data-speed]")) {
      const value = Number(button.dataset.speed);
      button.classList.toggle("active", value === 0 ? STATE.paused && !event : !STATE.paused && STATE.speed === value);
      button.disabled = !playing;
      button.setAttribute("aria-label", value === 0 ? copy("ui.pause") : copy("ui.speed", { n: value }));
    }
    find("skip").disabled = !playing || STATE.phase === "day" || Boolean(event);
    find("skip").setAttribute("aria-label", copy("ui.skip"));
    find("ending").hidden = playing;
    find("restart").hidden = playing;
    if (!playing) renderEnding();
  }

  function renderSetup() {
    text("premise", "sim.premise");
    text("site-label", "story.site");
    text("difficulty-label", "story.difficulty");
    text("start", "story.start");
    text("continue", "ui.continue");
    text("presentation-label", "ui.presentation");
    text("data-label", "ui.dataSource");
    for (const card of find("data-cards").children) {
      const mode = card.dataset.value;
      card.querySelector("b").textContent = copy(`ui.${mode === "live" ? "dataLive" : "dataArchive"}.title`);
      card.querySelector("p").textContent = copy(`ui.${mode === "live" ? "dataLive" : "dataArchive"}.note`);
      card.setAttribute("aria-pressed", String(dataChoice === mode));
    }
    if (starting) text("start", "ui.loading");
    find("continue").hidden = !hasSave();
    for (const option of find("site").options) option.textContent = copy("site." + option.value);
    for (const option of find("difficulty").options) option.textContent = copy("story." + option.value);
    for (const card of find("site-cards").children) {
      const site = card.dataset.value;
      card.querySelector("b").textContent = copy("site." + site);
      card.querySelector("p").textContent = copy("ui.siteNote." + site);
      card.querySelector("small").textContent = copy("ui.profile");
      card.setAttribute("aria-pressed", String(find("site").value === site));
    }
    for (const card of find("difficulty-cards").children) {
      const level = card.dataset.value;
      card.querySelector("b").textContent = copy("story." + level);
      card.querySelector("p").textContent = copy("ui.diffNote." + level);
      card.setAttribute("aria-pressed", String(find("difficulty").value === level));
    }
    for (const button of find("acts").children) {
      const act = Number(button.dataset.act);
      button.querySelector("b").textContent = copy("ui.act", { n: act });
      button.querySelector("span").textContent = copy("ui.actHint", { sol: CONFIG.presentation.acts[act].sol });
    }
  }

  function render() {
    document.documentElement.lang = lang;
    document.title = copy("game.title");
    root.dataset.screen = screen;
    text("game-title", "game.title");
    find("language").textContent = lang === "en" ? "RU" : "EN";
    find("language").lang = lang === "en" ? "ru" : "en";
    find("language").setAttribute("aria-label", lang === "en" ? "Русский" : "English");
    find("sound").innerHTML = icon(sound.enabled ? "sound" : "mute");
    find("sound").setAttribute("aria-label", copy(sound.enabled ? "ui.soundOn" : "ui.soundOff"));
    find("sound").setAttribute("aria-pressed", String(sound.enabled));
    find("menu").setAttribute("aria-label", copy("ui.menu"));
    find("menu").setAttribute("aria-expanded", String(menuOpen));
    find("menu-panel").hidden = !menuOpen;
    text("mission-menu","ui.missionMenu");text("watch","intro.play");text("demo-start","ui.demoStart");text("demo-exit","ui.demoExit");
    find("demo-exit").hidden=!demoRunning;
    text("facts", "real.title");
    text("teachers", "teachers.title");
    text("sources", "sources.title");
    text("solar", savedSolar?"ui.savedSolar":solarData.mode === "live" ? "solar.live" : solarData.flares.length ? "solar.archive" : "solar.unavailable", { date: solarData.asOf });
    const timedDecision = screen === "mission" && getActiveEvent()?.remainingMs != null;
    for (const id of ["facts", "teachers", "sources", "menu"]) find(id).disabled = timedDecision;
    for (const id of ["setup", "mission"]) find(id + "-screen").hidden = screen !== id;
    find("reading-screen").hidden = !["facts", "teachers", "sources"].includes(screen);
    find("resbar").hidden = !STATE || screen === "setup";
    for (const [id, key] of [["orbit", "ui.planet"], ["zoom-in", "ui.zoomIn"], ["zoom-out", "ui.zoomOut"], ["home", "ui.home"]]) find(id).setAttribute("aria-label", copy(key));
    text("rotate-title", "ui.rotateTitle");
    text("rotate-hint", "ui.rotateHint");
    text("orbit-title", "ui.orbitTitle");
    text("orbit-note", "ui.orbitNote");
    for (const f of ["mars", "earth", "system", "ship"]) { text("focus-" + f, "ui.focus." + f); find("focus-" + f).classList.toggle("active", world?.spaceFocus === f); }
    renderTrip(true);
    text("to-base", "ui.toBase");
    world?.setLabels({ ...Object.fromEntries(Object.keys(SYSTEM_OBJECT).concat("panels").map((id) => [id, copy("ui.objects." + id)])), marker: copy("ui.marker"), ...Object.fromEntries(["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "ship"].map((n) => ["space." + n, copy("ui.space." + n)])) });

    if(intro)renderIntro();
    if (screen === "setup") renderSetup();
    else if (screen === "mission") renderMission();
    else renderReading();
  }

  // ---------- static controls ----------
  for (const [id, options] of [["site", CONFIG.sites], ["difficulty", Object.keys(CONFIG.difficulties)]]) {
    for (const key of options) {
      const option = node("option");
      option.value = key;
      find(id).append(option);
      const card = node("button", "", "card");
      card.type = "button";
      card.dataset.value = key;
      card.append(node("b"), node("p"));
      if (id === "site") card.insertAdjacentHTML("beforeend", renderProfile(SITES[key]?.profile) + "<small></small>");
      card.addEventListener("click", () => { find(id).value = key; sound.play("tap"); renderSetup(); });
      find(id + "-cards").append(card);
    }
    find(id).value = CONFIG.defaults[id];
  }
  for (const mode of ["archive", "live"]) {
    const card = node("button", "", "card");
    card.type = "button";
    card.dataset.value = mode;
    card.append(node("b"), node("p"));
    card.addEventListener("click", () => { dataChoice = mode; sound.play("tap"); renderSetup(); });
    find("data-cards").append(card);
  }
  for (const act of Object.keys(CONFIG.presentation.acts)) {
    const button = node("button", "", "act");
    button.type = "button";
    button.dataset.act = act;
    button.append(node("b"), node("span"));
    button.addEventListener("click", () => startMission(Number(act)));
    find("acts").append(button);
  }
  for (const system of CONFIG.systems) {
    const tile = node("div", "", "sys");
    tile.id = "system-" + system;
    tile.innerHTML = `${icon(system)}<b class="name"></b><span class="sr"></span><span class="pips"></span><small class="why"></small>`;
    tile.querySelector(".why").id="system-"+system+"-reason";
    const minus = node("button", "−", "minus");
    const plus = node("button", "+", "plus");
    for (const [button, delta] of [[minus, -1], [plus, 1]]) {
      button.type = "button";
      button.dataset.delta = delta;
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        if (allocate(system, delta)) {
          sound.play("tap");
          if (delta > 0) {
            world?.focus(SYSTEM_OBJECT[system]);
            picked = system;
            walkHint = { key: "ui.walk", vars: { place: copy("ui.objects." + SYSTEM_OBJECT[system]) } };
          }
        }
        renderMission();
      });
    }
    tile.append(minus, plus);
    find("systems").append(tile);
  }

  function renderIntro(){
    if(!introFrame)return;
    const n=introPosition.n;
    find("intro-art").innerHTML=renderBase({phase:n===5?"morning":"day",weather:n===3||n===4?"storm":"clear",panels:{broken:n===5?1:0,dusty:n===5?2:0},crop:{progress:1}});
    find("intro-art").setAttribute("aria-label",copy(introFrame.textKey));
    find("intro-caption").textContent=copy(introFrame.textKey);
    find("intro-progress").textContent=n+" / "+introPosition.total;
    text("intro-next","intro.next");text("intro-skip","intro.skip");
  }
  function watchIntro(){
    menuOpen=false;find("menu-panel").hidden=true;
    intro?.stop();find("intro-screen").hidden=false;
    intro=playIntro({render:(frame,position)=>{introFrame=frame;introPosition=position;renderIntro();},onFinish:()=>{find("intro-screen").hidden=true;intro=null;}});
  }
  listen("intro-next",()=>intro?.next());listen("intro-skip",()=>intro?.skip());
  listen("watch",watchIntro);
  listen("mission-menu",()=>{if(!demoRunning)save();menuOpen=false;find("work-screen").hidden=true;show("setup");});
  listen("demo-start",()=>{menuOpen=false;startMission(3);});
  listen("demo-exit",()=>{menuOpen=false;demoRunning=false;if(hasSave())continueMission();else show("setup");});
  listen("language", () => { lang = lang === "en" ? "ru" : "en"; render(); });
  listen("sound", () => { sound.toggle(); render(); });
  listen("menu", () => { menuOpen = !menuOpen; render(); });
  for (const id of ["facts", "teachers", "sources"]) listen(id, () => openReading(id));
  listen("back", () => {
    show(returnScreen ?? "setup");
  });
  listen("start", () => startMission());
  listen("continue",continueMission);
  listen("restart", () => {find("work-screen").hidden=true;show("setup");});
  listen("next", () => { skipToDecision(); render(); });
  listen("skip", () => { skipToDecision(); render(); });
  listen("end", () => {
    endSol();
    if (STATE.status !== "playing") checkTask();
    renderMission();
  });
  listen("advance", () => {
    if(STATE.sim)reviewSol();
    else tick((CONFIG.phasesMs.evening + CONFIG.phasesMs.night) / STATE.speed);
    renderMission();
  });
  for (const button of find("speed").querySelectorAll("[data-speed]")) {
    button.addEventListener("click", () => { setSpeed(Number(button.dataset.speed)); sound.play("tap"); renderMission(); });
  }
  listen("orbit", () => world?.travel(!world.orbital));
  listen("to-base", () => world?.travel(false));
  for (const f of ["mars", "earth", "system", "ship"]) listen("focus-" + f, () => { world?.focusSpace(f); sound.play("tap"); render(); });
  listen("zoom-in", () => world?.zoom(1.18));
  listen("zoom-out", () => world?.zoom(1 / 1.18));
  listen("home", () => world?.home());
  document.addEventListener("keydown", (e) => {
    if(e.key==="Escape")find("work-screen").hidden=true;
    if (e.key === "Escape" && ["facts", "teachers", "sources"].includes(screen)) find("back").click();
    if (e.key === " " && screen === "mission" && e.target === document.body && STATE?.status === "playing") {
      e.preventDefault();
      setSpeed(STATE.paused ? STATE.speed || 1 : 0);
      renderMission();
    }
  });

  // ---------- real-time loop: the engine runs the sol, the UI redraws the HUD ----------
  // Landscape only: in portrait the scene and the mission (including the storm timer) wait.
  const portrait = matchMedia("(orientation: portrait)");
  const applyOrientation = () => { root.classList.toggle("portrait", portrait.matches); world?.setPaused(portrait.matches); };
  portrait.addEventListener("change", applyOrientation);
  applyOrientation();
  let lastSecond = null;
  function frame(now) {
    if (lastTick != null && screen === "mission" && STATE?.status === "playing" && !portrait.matches) {
      const event = getActiveEvent();
      const previousPhase=STATE.phase;
      if(find("work-screen").hidden&&find("intro-screen").hidden)tick(Math.min(250, now - lastTick));
      const current = getActiveEvent();
      if (event && current?.id !== event.id && event.remainingMs != null) setEventResponse(event, event.defaultChoice);
      if (current?.remainingMs != null) {
        const second = Math.ceil(current.remainingMs / 1000);
        if (second !== lastSecond && second <= 5) sound.play("tick");
        lastSecond = second;
      } else lastSecond = null;
      if (STATE.status!=="playing" || STATE.phase!==previousPhase || current?.id !== event?.id || now - lastHud > 150) {
        lastHud = now;
        renderMission();
        if (current?.id !== event?.id) render();
      }
    }
    lastTick = now;
    requestAnimationFrame(frame);
  }

  render();
  requestAnimationFrame(frame);
  setTimeout(initWorld, 50);
}
