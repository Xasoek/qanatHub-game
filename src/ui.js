import { renderBase } from "./art.js";
import { CONFIG } from "./config.js";
import { loadSolarData } from "./data.js";
import {
  STATE, allocate, endSol, getActiveEvent, getEndReport, newGame, on, resolveEvent, skipToDecision, tick,
} from "./engine.js";
import { DAILY_TASKS, STORY_SOURCES, TRAINING_TASKS, playIntro, t } from "./text.js";

const studyKeys = ["bip.study.sleep", "bip.study.muscle", "bip.study.bone"];
const realKeys = ["real.storm", "real.flare", "real.lettuce", "real.radish", "real.potato", "real.cropTiming"];
const terms = ["sol", "radiation", "dose", "flare", "flareClasses", "delay", "pressure"];
const actionKeys = { next: "game.next", end: "game.end", advance: "game.advance", restart: "end.retry" };

export async function mountGame(root) {
  let lang = "en";
  let screen = "intro";
  let returnScreen;
  let player;
  let introFrame;
  let introPosition;
  let afterIntro;
  let before;
  let task;
  let completedTask;
  let message;
  let warning;
  let flareRecords;
  let previousEvent;
  let lastTick;
  const solarData = await loadSolarData();

  const copy = (key, vars) => t(lang, key, vars);
  const find = (id) => root.querySelector("#" + id);
  const text = (id, key, vars) => { find(id).textContent = copy(key, vars); };

  root.innerHTML = `
    <header><h1 id="game-title"></h1><button id="language" type="button"></button></header>
    <nav class="actions">
      <button id="watch" type="button"></button><button id="facts" type="button"></button>
      <button id="teachers" type="button"></button><button id="sources" type="button"></button>
    </nav>
    <section id="intro-screen">
      <div id="intro-art" role="img"></div>
      <p id="intro-progress"></p><p id="intro-caption" aria-live="polite"></p>
      <div class="actions"><button id="intro-next" type="button"></button><button id="intro-skip" type="button"></button></div>
    </section>
    <section id="setup-screen" hidden>
      <p id="premise"></p>
      <label><span id="site-label"></span> <select id="site"></select></label>
      <label><span id="difficulty-label"></span> <select id="difficulty"></select></label>
      <button id="start" type="button"></button>
    </section>
    <section id="mission-screen" hidden>
      <p id="sol"></p>
      <dl class="resources">
        <div><dt id="oxygen-label"></dt><dd id="oxygen"></dd></div>
        <div><dt id="food-label"></dt><dd id="food"></dd></div>
        <div><dt id="energy-label"></dt><dd id="energy"></dd></div>
      </dl>
      <div id="base" role="img"></div><p id="solar"></p>
      <p id="daily"></p><p id="task-result" role="status"></p>
      <p id="bip" aria-live="polite"></p><p id="warning" role="status"></p>
      <section id="event" hidden aria-labelledby="event-title">
        <h2 id="event-title"></h2><p id="event-body"></p><p id="event-timer"></p>
        <div id="choices" class="actions"></div>
      </section>
      <div id="systems" class="actions"></div>
      <div class="actions">
        <button id="next" type="button"></button><button id="end" type="button"></button>
        <button id="advance" type="button"></button>
      </div>
      <section id="ending" hidden aria-live="polite"></section>
      <button id="restart" type="button" hidden></button>
    </section>
    <section id="reading-screen" hidden>
      <button id="back" type="button"></button><h2 id="reading-title"></h2><div id="reading-copy"></div>
    </section>`;

  const listen = (id, fn) => find(id).addEventListener("click", fn);
  function node(tag, value = "") {
    const element = document.createElement(tag);
    element.textContent = value;
    return element;
  }

  function paragraph(container, key, vars, source) {
    const line = node("p", copy(key, vars));
    if (source) {
      const link = node("a", copy("sources.title"));
      link.href = source;
      line.append(" ", link);
    }
    container.append(line);
  }

  function show(next) {
    screen = next;
    render();
  }

  function openReading(next) {
    if (screen === "mission" && getActiveEvent()?.remainingMs != null) return;
    if (!["facts", "teachers", "sources"].includes(screen)) returnScreen = screen;
    if (screen === "intro") player.stop();
    show(next);
  }

  function startIntro(onFinish) {
    player?.stop();
    screen = "intro";
    afterIntro = onFinish;
    player = playIntro({
      render(frame, position) {
        introFrame = frame;
        introPosition = position;
        render();
      },
      onFinish,
    });
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
        paragraph(container, "real.flareRecord", { date: flare.beginTime.slice(0, 10), class: flare.classType }, flare.link);
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
    else if (STATE.sol <= TRAINING_TASKS.length + studyKeys.length) {
      message = { key: studyKeys[STATE.sol - TRAINING_TASKS.length - 1] };
    } else message = null;
  }

  function checkTask() {
    if (completedTask?.sol === before.sol) return;
    const after = { ...STATE };
    const alloc = STATE.sol === before.sol ? STATE.alloc : before.finalAlloc;
    if (task.check({ before, after, alloc })) completedTask = { sol: before.sol };
  }

  function startMission() {
    newGame({ site: find("site").value, difficulty: find("difficulty").value, solarData });
    completedTask = null;
    previousEvent = null;
    flareRecords = new Map();
    chooseTask();
    show("mission");
  }

  on("phase", ({ phase }) => {
    if (!before) return;
    if (phase === "evening") before.finalAlloc = { ...STATE.alloc };
    if (phase === "morning") {
      checkTask();
      chooseTask();
    }
  });

  on("event", ({ type, data }) => {
    if (type === "flare" && data.flare?.beginTime) flareRecords?.set(data.flare.flrID ?? data.flare.beginTime, data.flare);
  });

  function setEventResponse(event, choice) {
    if (event.type === "consequence") {
      message = { key: "bip.consequence." + event.data.kind, vars: { sol: event.data.sourceSol } };
    } else if (event.type === "lowReserve") {
      message = { key: "bip.warning." + event.data.resource };
    } else {
      const suffix = choice[0].toUpperCase() + choice.slice(1);
      message = { key: `ev.${event.type}.after${suffix}` };
    }
  }

  function eventChoices(event) {
    const { type, data } = event;
    text("event-title", `ev.${type}.title`);
    text("event-body", `ev.${type}.body`, { ...data, sol: data.sourceSol });
    if (type === "earthAdvice" && data.stale) {
      find("event-body").textContent = copy("earth.staleStorm", { p: data.storm }) + " " + copy("earth.staleFlare", { p: data.flare });
    }
    if (type === "flare") {
      find("event-body").append(" ", copy("bip.term.radiation"), " ", copy("bip.term.dose"), " ", copy("bip.term.flareClasses"));
    }
    const list = find("choices");
    list.replaceChildren();
    for (const choice of event.choices) {
      const button = node("button", copy(`ev.${type}.${choice.id}`));
      button.type = "button";
      button.disabled = choice.disabled;
      for (const [unit, value] of Object.entries(choice.cost)) {
        if (!value) continue;
        button.append(" · ", copy(value > 0 ? "story.cost" : "story.gain", {
          value: Math.abs(value), unit: copy("story.units." + unit),
        }));
      }
      button.addEventListener("click", () => {
        if (resolveEvent(event.id, choice.id)) {
          setEventResponse(event, choice.id);
          previousEvent = null;
        }
        render();
      });
      list.append(button);
    }
  }

  function renderEvent(event) {
    find("event").hidden = !event;
    if (!event) {
      previousEvent = null;
      return;
    }
    if (previousEvent?.id !== event.id || previousEvent?.lang !== lang) {
      eventChoices(event);
      previousEvent = { id: event.id, lang };
    }
    find("event-timer").hidden = event.remainingMs == null;
    if (event.remainingMs != null) text("event-timer", "story.timer", { n: Math.ceil(event.remainingMs / 1000) });
  }

  function costs(container, cost) {
    for (const [unit, value] of Object.entries(cost)) {
      if (!value) continue;
      paragraph(container, value > 0 ? "story.cost" : "story.gain", {
        value: Math.abs(value), unit: copy("story.units." + unit),
      });
    }
  }

  function renderEnding() {
    const container = find("ending");
    const report = getEndReport();
    container.replaceChildren(node("h2", copy(`end.${report.status}.title`)));
    paragraph(container, `end.${report.status}.body`);
    paragraph(container, "end.oxygen", { n: report.oxygen });
    paragraph(container, "end.food", { n: report.food });
    paragraph(container, "end.panels", { n: report.panelsWorking, total: CONFIG.panels });
    paragraph(container, "end.stars", { n: report.stars, total: CONFIG.science.starSamples.length });
    if (!report.chains.length) return;
    container.append(node("h3", copy("end.review")));
    const list = node("ol");
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

  function renderSystems(event, playing) {
    for (const system of CONFIG.systems) {
      const controls = find("system-" + system);
      controls.hidden = !playing || STATE.sol < CONFIG.unlockSol[system];
      const label = copy("story.systems." + system);
      controls.querySelector("span").textContent = label + " · " + STATE.alloc[system];
      for (const button of controls.querySelectorAll("button")) {
        const delta = Number(button.dataset.delta);
        button.setAttribute("aria-label", button.textContent + " " + label);
        button.disabled = Boolean(event) || STATE.phase !== "day" ||
          (delta > 0 ? STATE.cubes === 0 || STATE.alloc[system] >= CONFIG.maxAlloc[system] : STATE.alloc[system] === 0);
      }
    }
  }

  function renderMission() {
    const event = getActiveEvent();
    const playing = STATE.status === "playing";
    const base = find("base");
    base.setAttribute("aria-label", copy("game.scene"));
    base.innerHTML = renderBase(STATE);
    text("sol", "game.turn", { sol: STATE.sol, total: CONFIG.missionSols, phase: copy("phases." + STATE.phase) });
    for (const [key, value] of Object.entries({ oxygen: STATE.oxygen, food: STATE.food, energy: STATE.cubes })) {
      text(key + "-label", "game." + key);
      find(key).textContent = value;
    }
    text("solar", solarData.mode === "live" ? "solar.live" : solarData.flares.length ? "solar.archive" : "solar.unavailable",
      { date: solarData.asOf });
    find("daily").textContent = playing ? copy("story.task") + " · " + copy(task.key) : "";
    find("task-result").textContent = completedTask?.sol >= STATE.sol - 1 ? copy("story.done") : "";
    find("bip").textContent = message ? copy(message.key, message.vars) : "";
    find("warning").textContent = warning ? copy(warning) : "";
    if (STATE.sol === 5 && playing) find("warning").append(copy("earth.rescue"));
    renderEvent(event);
    renderSystems(event, playing);
    for (const [id, key] of Object.entries(actionKeys)) text(id, key);
    find("next").disabled = !playing || STATE.phase !== "morning" || Boolean(event);
    find("end").disabled = !playing || STATE.phase !== "day" || Boolean(event);
    find("advance").disabled = !playing || !["evening", "night"].includes(STATE.phase) || Boolean(event);
    find("ending").hidden = playing;
    find("restart").hidden = playing;
    if (!playing) renderEnding();
  }

  function render() {
    document.documentElement.lang = lang;
    document.title = copy("game.title");
    text("game-title", "game.title");
    find("language").textContent = lang === "en" ? "Русский" : "English";
    find("language").lang = lang === "en" ? "ru" : "en";
    text("watch", "intro.play");
    text("facts", "real.title");
    text("teachers", "teachers.title");
    text("sources", "sources.title");
    find("watch").hidden = screen === "intro";
    const timedDecision = screen === "mission" && getActiveEvent()?.remainingMs != null;
    for (const id of ["watch", "facts", "teachers", "sources"]) find(id).disabled = timedDecision;
    for (const id of ["intro", "setup", "mission"]) find(id + "-screen").hidden = screen !== id;
    find("reading-screen").hidden = !["facts", "teachers", "sources"].includes(screen);

    if (screen === "intro") {
      const art = find("intro-art");
      art.setAttribute("aria-label", copy("intro.art." + introFrame.art));
      art.innerHTML = renderIntroScene(introFrame.art);
      text("intro-progress", "intro.progress", introPosition);
      text("intro-caption", introFrame.textKey);
      text("intro-next", introPosition.n === introPosition.total ? "intro.finish" : "intro.next");
      text("intro-skip", "intro.skip");
    } else if (screen === "setup") {
      text("premise", "game.intro");
      text("site-label", "story.site");
      text("difficulty-label", "story.difficulty");
      text("start", "story.start");
      for (const option of find("site").options) option.textContent = copy("site." + option.value);
      for (const option of find("difficulty").options) option.textContent = copy("story." + option.value);
    } else if (screen === "mission") renderMission();
    else renderReading();
  }

  for (const [id, options] of [["site", CONFIG.sites], ["difficulty", Object.keys(CONFIG.difficulties)]]) {
    for (const key of options) {
      const option = node("option");
      option.value = key;
      find(id).append(option);
    }
    find(id).value = CONFIG.defaults[id];
  }

  for (const system of CONFIG.systems) {
    const controls = node("div");
    controls.id = "system-" + system;
    controls.append(node("span"));
    for (const delta of [-1, 1]) {
      const button = node("button", delta > 0 ? "+" : "−");
      button.type = "button";
      button.dataset.delta = delta;
      button.addEventListener("click", () => { allocate(system, delta); renderMission(); });
      controls.append(button);
    }
    find("systems").append(controls);
  }

  listen("language", () => { lang = lang === "en" ? "ru" : "en"; render(); });
  listen("watch", () => {
    if (screen === "mission" && getActiveEvent()?.remainingMs != null) return;
    const next = screen === "mission" ? "mission" : "setup";
    startIntro(() => show(next));
  });
  for (const id of ["facts", "teachers", "sources"]) listen(id, () => openReading(id));
  listen("back", () => {
    if (returnScreen === "intro") startIntro(afterIntro);
    else show(returnScreen);
  });
  listen("intro-next", () => player.next());
  listen("intro-skip", () => player.skip());
  listen("start", startMission);
  listen("restart", () => show("setup"));
  listen("next", () => { skipToDecision(); render(); });
  listen("end", () => {
    endSol();
    if (STATE.status !== "playing") checkTask();
    renderMission();
  });
  listen("advance", () => {
    tick((CONFIG.phasesMs.evening + CONFIG.phasesMs.night) / STATE.speed);
    renderMission();
  });

  // Only the storm countdown runs in real time in this starter interface.
  function updateTimer(now) {
    if (lastTick != null && screen === "mission") {
      const event = getActiveEvent();
      if (event?.remainingMs != null) {
        tick(now - lastTick);
        const current = getActiveEvent();
        if (current?.id !== event.id) {
          setEventResponse(event, event.defaultChoice);
          render();
        } else if (Math.ceil(current.remainingMs / 1000) !== Math.ceil(event.remainingMs / 1000)) {
          renderEvent(current);
        }
      }
    }
    lastTick = now;
    requestAnimationFrame(updateTimer);
  }

  startIntro(() => show("setup"));
  requestAnimationFrame(updateTimer);
}

const introScenes = {
  frame2: '<path d="M600 70Q465 40 375 105L270 180H600Z" fill="#ffca8b" opacity=".75"/><path d="m300 45 30 60h-60Z" fill="#ffcf77"/><path d="M300 64v19m0 7v4" stroke="#793747" stroke-width="5"/>',
  frame3: '<path d="M0 145 150 125 300 195 465 125 600 145V220H0Z" fill="#50293c"/><circle cx="280" cy="145" r="13" fill="#e6eff5"/><path d="m277 159 13 22m-9-15-18 9m26 5-10 17m10-17 18 8" stroke="#e6eff5" stroke-width="8"/><path d="M0 97h250M390 76h210M72 129h220" stroke="#f5b88d" stroke-width="8" opacity=".55"/>',
  frame4: '<path d="M300 35q-25 20-23 60h46q2-40-23-60Z" fill="#dce9f3"/><circle cx="300" cy="67" r="8" fill="#426a94"/><path d="m285 97 15 54 15-54" fill="#ffd790"/><path d="M0 167q160-38 320 0t280 0v53H0Z" fill="#c36750"/>',
  frame5: '<path d="M0 174q150-30 300 0t300 0v46H0Z" fill="#c36750"/><circle cx="258" cy="112" r="23" fill="#e6eff5"/><path d="M239 142h38v49h-38Z" fill="#f5c28b"/><rect x="318" y="136" width="48" height="40" rx="12" fill="#dee7ee"/><path d="M342 136v-15" stroke="#dee7ee" stroke-width="5"/><circle cx="333" cy="151" r="4" fill="#315988"/><circle cx="352" cy="151" r="4" fill="#315988"/>',
};

function renderIntroScene(frame) {
  if (frame === "frame1") return renderBase();
  return `<svg viewBox="0 0 600 220" aria-hidden="true"><rect width="600" height="220" fill="#793747"/>${introScenes[frame]}</svg>`;
}
