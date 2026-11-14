import { renderBase } from "./art.js";
import { CONFIG } from "./config.js";
import { loadSolarData } from "./data.js";
import { STATE, allocate, endSol, newGame, skipToDecision, tick } from "./engine.js";
import { t } from "./text.js";

export async function mountGame(root) {
  let lang = "en";
  const solarData = await loadSolarData();
  newGame({ solarData });

  const copy = (key, vars) => t(lang, key, vars);

  function render() {
    document.documentElement.lang = lang;
    document.title = copy("game.title");
    root.querySelector("#game-title").textContent = document.title;
    root.querySelector("#intro").textContent = copy("game.intro");
    const base = root.querySelector("#base");
    base.setAttribute("aria-label", copy("game.scene"));
    base.innerHTML = renderBase(STATE);
    root.querySelector("#sol").textContent = copy("game.turn", {
      sol: STATE.sol, total: CONFIG.missionSols, phase: copy(`phases.${STATE.phase}`),
    });
    for (const [id, value] of Object.entries({ oxygen: STATE.oxygen, food: STATE.food, energy: STATE.cubes })) {
      root.querySelector(`#${id}-label`).textContent = copy(`game.${id}`);
      root.querySelector(`#${id}`).textContent = value;
    }

    const solarKey = solarData.mode === "live" ? "solar.live"
      : solarData.flares.length ? "solar.archive" : "solar.unavailable";
    root.querySelector("#solar").textContent = copy(solarKey, { date: solarData.asOf });
    root.querySelector("#outcome").textContent = STATE.status === "playing"
      ? "" : copy(`game.${STATE.status}`);

    const actions = { air: "addAir", next: "next", end: "end", advance: "advance", restart: "restart" };
    for (const [id, key] of Object.entries(actions)) {
      root.querySelector(`#${id}`).textContent = copy(`game.${key}`);
    }
    const playing = STATE.status === "playing";
    root.querySelector("#air").disabled = !playing || STATE.phase !== "day" ||
      STATE.cubes === 0 || STATE.alloc.air >= CONFIG.airUseByCubes.length - 1;
    root.querySelector("#next").disabled = !playing || STATE.phase !== "morning";
    root.querySelector("#end").disabled = !playing || STATE.phase !== "day";
    root.querySelector("#advance").disabled = !playing || STATE.phase !== "evening";
    root.querySelector("#language").lang = lang === "en" ? "ru" : "en";
    root.querySelector("#language").textContent = lang === "en" ? "Русский" : "English";
  }

  root.innerHTML = `
    <header>
      <h1 id="game-title"></h1>
      <button type="button" id="language"></button>
    </header>
    <p id="intro"></p>
    <p id="sol" aria-live="polite"></p>
    <dl class="resources">
      <div><dt id="oxygen-label"></dt><dd id="oxygen"></dd></div>
      <div><dt id="food-label"></dt><dd id="food"></dd></div>
      <div><dt id="energy-label"></dt><dd id="energy"></dd></div>
    </dl>
    <div id="base" role="img"></div>
    <p id="solar"></p>
    <div class="actions">
      <button type="button" id="next"></button>
      <button type="button" id="air"></button>
      <button type="button" id="end"></button>
      <button type="button" id="advance"></button>
      <button type="button" id="restart"></button>
    </div>
    <p id="outcome" role="status"></p>`;
  const actions = {
    language: () => { lang = lang === "en" ? "ru" : "en"; },
    next: skipToDecision,
    air: () => allocate("air", 1),
    end: endSol,
    advance: () => tick((CONFIG.phasesMs.evening + CONFIG.phasesMs.night) / STATE.speed),
    restart: () => newGame({ solarData }),
  };
  for (const [id, action] of Object.entries(actions)) {
    root.querySelector(`#${id}`).addEventListener("click", () => {
      action();
      render();
    });
  }
  render();
}
