import test from "node:test";
import assert from "node:assert/strict";
import {STATE,newGame,allocate,planTask,unplanTask,simulationPreview,drawBattery,skipToDecision,endSol,
  reviewSol,resolveEvent,getActiveEvent,save,load} from "../src/engine.js";
import {CONFIG} from "../src/config.js";
import {playCampaign} from "../tools/campaign-bot.js";
function day(){
  skipToDecision();
  for(let e=getActiveEvent();e;e=getActiveEvent())resolveEvent(e.id,e.defaultChoice);
}
test("reservations, labor, cancellation, stored energy and inspection survive day transitions",()=>{
  newGame({simulation:true,seed:42});
  assert.equal(STATE.damage,CONFIG.simulation.startingDamage);
  assert.equal(STATE.panels.broken,1);
  day();
  const start=STATE.cubes;
  assert.equal(planTask("seal"),false);
  assert.equal(planTask("inspect"),true);
  assert.equal(planTask("inspect"),false);
  assert.equal(unplanTask("inspect"),true);
  assert.equal(planTask("robot"),true);
  assert.equal(STATE.cubes,start-1);
  assert.equal(unplanTask("robot"),true);
  assert.equal(STATE.cubes,start);
  planTask("inspect");
  allocate("air",2);
  const charge=simulationPreview().charge;
  endSol();
  assert.equal(STATE.sim.inspected,true);
  assert.equal(STATE.sim.battery,charge);
  reviewSol();day();
  assert.equal(planTask("patch"),true);
  const oxygen=STATE.oxygen,spares=STATE.sim.spares;
  assert.equal(planTask("seal"),false);
  unplanTask("patch");
  assert.equal(STATE.oxygen,oxygen);
  planTask("seal");allocate("air",2);
  endSol();
  assert.equal(STATE.sim.sealBroken,false);
  assert.equal(STATE.sim.spares,spares-1);
});
test("patch expires, unique expeditions cannot be repeated, battery withdrawal is bounded",()=>{
  newGame({simulation:true,seed:6});day();planTask("inspect");endSol();reviewSol();day();
  assert(planTask("patch"));endSol();
  const expiry=STATE.sim.patchUntil;
  while(STATE.sol<expiry&&STATE.status==="playing"){
    if(STATE.phase==="evening")reviewSol();day();
    allocate("air",2);if(STATE.sol<expiry)endSol();
  }
  assert.equal(STATE.sim.patchUntil,0);
  assert(STATE.sim.notes.includes("patchExpired"));
  newGame({simulation:true,seed:1});day();
  const charge=STATE.sim.battery;
  assert(drawBattery());
  assert.equal(STATE.sim.battery,Math.max(0,charge-CONFIG.simulation.drawLimit));
  assert(planTask("near"));assert(!planTask("far"));endSol();
  reviewSol();day();assert(!planTask("near"));
});
test("simulator saves and restores reserved plans and repairs",()=>{
  const data=new Map();
  globalThis.localStorage={setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k),removeItem:k=>data.delete(k)};
  try{
    newGame({simulation:true,seed:7});day();planTask("inspect");save();
    const snapshot=structuredClone(STATE.sim);
    unplanTask("inspect");load();
    assert.deepEqual(STATE.sim,snapshot);
    endSol();assert(STATE.sim.inspected);
  }finally{delete globalThis.localStorage;}
});
test("a complete 210-sol simulator mission requires the prepared surface return",()=>{
  // The campaign bot plays through the public API; see tests/campaign.test.js for the balance.
  const rescued=playCampaign({seed:7,site:"gale",difficulty:"cadet",style:"sensible"});
  assert.equal(rescued.status,"rescued");
  assert.equal(rescued.sol,CONFIG.missionSols);
  assert(Object.values(rescued.simulation.ready).every(Boolean));
  newGame({simulation:true,seed:3,difficulty:"cadet"});
  for(let d=0;d<CONFIG.missionSols&&STATE.status==="playing";d++){
    if(["evening","night"].includes(STATE.phase))reviewSol();
    day();allocate("air",2);endSol();
  }
  assert.notEqual(STATE.status,"rescued");
});
test('a resolved flare retains the exact NASA record for facts after reload',()=>{
  const record={flrID:'TEST-RECORD',beginTime:'2024-05-10T06:27Z',classType:'X3.9',link:'https://example.invalid/test'};
  newGame({presentation:{act:3},seed:9,solarData:{mode:'archive',flares:[record]}});
  for(let n=0;n<5;n++){
    skipToDecision();
    for(let event=getActiveEvent();event;event=getActiveEvent()){
      const source=event.data.flare;
      resolveEvent(event.id,event.type==='storm'?'keep':event.defaultChoice);
      if(source){assert.deepEqual(STATE.log.at(-1).sourceFlare,source);return;}
    }
    allocate('air',2);allocate('farm',2);endSol();
  }
  assert.fail('Showcase flare was not reached');
});
