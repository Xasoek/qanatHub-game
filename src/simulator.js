// Optional mission extension. All choices are validated by the engine before mutation.
import { CONFIG } from "./config.js";
const cfg = CONFIG.simulation;
export function makeSimulation() {
  return {
    battery: cfg.batteryInitial, generated: 0, charged: 0, nightUse: 0,
    spares: cfg.spares, plan: [], lastPlan: [], inspected: false,
    sealBroken: true, radioBroken: true, debris: true, patchUntil: 0,
    crates: { near: false, far: false }, robotUsed: false,
    ready: { beacon: false, route: false, lander: false }, departed: false,
    sentSol: null, sentDamage: null, reply: null, notes: [],
  };
}
export function labor(state, alloc = state.alloc) {
  return Object.entries(alloc).reduce((sum, [key, n]) => sum + n * cfg.labor[key], 0);
}
export function planned(state) {
  return state.sim.plan.reduce((sum, key) => sum + cfg.tasks[key].hours, 0);
}
export function canTask(state, key) {
  const sim = state.sim, task = cfg.tasks[key];
  if (!sim || !task || state.phase !== "day" || state.status !== "playing") return false;
  if (sim.plan.includes(key) || state.cubes < task.cubes || sim.spares < task.parts ||
      state.oxygen <= task.oxygen || planned(state) + labor(state) + task.hours > cfg.hours) return false;
  if (["patch","seal"].includes(key)) return sim.inspected && sim.sealBroken && !sim.plan.some(k => ["patch","seal"].includes(k));
  if (key === "inspect") return !sim.inspected;
  if (key === "panel") return state.panels.broken > 0;
  if (key === "clean") return state.panels.dusty > 0;
  if (key === "radio") return sim.radioBroken;
  if (key === "debris") return sim.debris;
  if (key === "near" || key === "far") return !sim.crates[key] && !sim.plan.some(k => ["near","far"].includes(k));
  if (key === "robot") return !sim.robotUsed;
  if (Object.hasOwn(sim.ready,key)) return !sim.ready[key] && (key !== "beacon" || !sim.radioBroken) && (key !== "route" || !sim.debris);
  if (key === "depart") return state.sol >= cfg.evacuationFrom && Object.values(sim.ready).every(Boolean) &&
    !sim.departed && !sim.radioBroken && !sim.sealBroken;
  return false;
}
export function queueTask(state,key) {
  if (!canTask(state,key)) return false;
  const t=cfg.tasks[key];
  state.cubes-=t.cubes;
  state.sim.spares-=t.parts;
  state.oxygen=Math.round((state.oxygen-t.oxygen)*100)/100;
  state.sim.plan.push(key);
  return true;
}
export function cancelTask(state,key) {
  const i=state.sim?.plan.indexOf(key) ?? -1;
  if (i<0) return false;
  const task=cfg.tasks[key];
  state.sim.plan.splice(i,1);
  state.cubes+=task.cubes;state.sim.spares+=task.parts;
  state.oxygen=Math.round((state.oxygen+task.oxygen)*100)/100;
  return true;
}
export function startSimulationSol(state) {
  const sim=state.sim;
  if (!sim) return;
  sim.notes=[];
  if (sim.patchUntil && state.sol>=sim.patchUntil) {
    sim.patchUntil=0;
    state.damage=Math.min(CONFIG.damageLimit,state.damage+cfg.patchDamageReturn);
    sim.notes.push("patchExpired");
  }
  if (sim.sentSol != null && sim.sentSol < state.sol) {
    sim.reply={sentSol:sim.sentSol,receivedSol:state.sol,stale:sim.sentDamage!==state.damage};
    sim.sentSol=null;
  }
  sim.plan=[];
}
export function settleSimulationDay(state,blocked) {
  const sim=state.sim;
  if (!sim) return;
  sim.lastPlan=[];
  for (const key of [...sim.plan]) {
    const task=cfg.tasks[key];
    // An unplanned shelter/cleaning decision prevents outdoor and maintenance work.
    if (blocked && key !== "robot") {
      cancelTask(state,key);
      sim.notes.push("cancelled");
      continue;
    }
    sim.lastPlan.push(key);
    if (key==="inspect") sim.inspected=true;
    if (key==="patch") {sim.patchUntil=state.sol+cfg.patchSols;state.damage=Math.max(0,state.damage-cfg.patchDamageReturn);}
    if (key==="seal") {sim.sealBroken=false;sim.patchUntil=0;state.damage=Math.max(0,state.damage-cfg.patchDamageReturn);}
    if (key==="radio") sim.radioBroken=false;
    if (key==="debris") sim.debris=false;
    if (key==="panel") state.panels.broken=Math.max(0,state.panels.broken-1);
    if (key==="clean") state.panels.dusty=Math.max(0,state.panels.dusty-1);
    if (key==="near" || key==="far") {
      sim.crates[key]=true;
      state.food+=task.food;
      if (state.weather==="storm") {
        const damage=CONFIG.events.rover.stormDamage;
        state.damage=Math.min(CONFIG.damageLimit,state.damage+damage);
        sim.notes.push("evaStorm");
      }
    }
    if (key==="robot") {sim.robotUsed=true;sim.inspected=true;sim.notes.push("scouted");}
    if (Object.hasOwn(sim.ready,key)) sim.ready[key]=true;
    if (key==="depart") sim.departed=true;
  }
  sim.plan=[];
}
export function previewSimulation(state) {
  const sim=state.sim;
  if (!sim) return null;
  const need=cfg.nightBase+CONFIG.siteRules[state.site].heatCubes;
  const charge=Math.min(cfg.batteryCapacity,sim.battery+state.cubes+state.alloc.heat);
  const patch=sim.patchUntil>state.sol || sim.plan.includes("patch");
  const seal=sim.sealBroken && !sim.plan.includes("seal") && !patch;
  const airLevel=state.alloc.air>=CONFIG.siteRules[state.site].airFullCubes?2:state.alloc.air>0?1:0;
  let loss=CONFIG.airUseByCubes[airLevel];
  let factor=state.scrubberBroken?CONFIG.oxygenMultiplier.scrubberBroken:1;
  if(state.damage>CONFIG.leakDamage)factor*=CONFIG.oxygenMultiplier.leak;
  if(factor>1)loss=Math.max(loss,CONFIG.oxygenMultiplier.minLossWhenFaulty)*factor;
  return {hours:planned(state)+labor(state),charge,need,after:Math.max(0,charge-need),
    oxygen:Math.round((loss+(seal?cfg.sealLoss:0))*100)/100,
    blockedFarm:sim.plan.includes("far"),ready:Object.values(sim.ready).filter(Boolean).length};
}
