import { fileURLToPath } from "node:url";
import { CONFIG } from "../src/config.js";
import { STATE, allocate, endSol, getEndReport, newGame, skipToDecision, tick } from "../src/engine.js";

export function runStarterMission(seed = 0) {
  newGame({ seed });
  for (let turn = 0; turn < CONFIG.missionSols && STATE.status === "playing"; turn++) {
    skipToDecision();
    allocate("air", Math.min(2, STATE.cubes));
    endSol();
    tick(CONFIG.phasesMs.evening + CONFIG.phasesMs.night);
  }
  return getEndReport();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const count = Number(process.argv[2] ?? 1000);
  if (!Number.isSafeInteger(count) || count < 1) throw new RangeError("Expected a positive mission count");
  const totals = { rescued: 0, emergencySleep: 0, playing: 0 };
  for (let seed = 0; seed < count; seed++) {
    totals[runStarterMission(seed).status] += 1;
  }
  console.log("Starter engine only. Win rates are not game balance results.");
  console.table(totals);
}
