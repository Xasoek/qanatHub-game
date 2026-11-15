import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,STATE,skipToDecision,beginFieldTask,finishFieldTask,unplanTask,endSol,reviewSol,fieldReadings,save,load,simulationPreview}from'../src/engine.js';
function start(){newGame({simulation:true,seed:0});skipToDecision();}
test('hands-on work reserves resources, executes once, consumes hours and immediately opens the next real repair',()=>{
 start();const oxygen=STATE.oxygen;
 assert(beginFieldTask('inspectArray'));assert.equal(STATE.sim.done.inspectArray,undefined);
 assert(finishFieldTask('inspectArray'));assert(STATE.sim.done.inspectArray);
 assert.equal(finishFieldTask('inspectArray'),false);
 const before=fieldReadings();assert(beginFieldTask('clean'));assert(finishFieldTask('clean'));
 assert.equal(STATE.panels.dusty,before.dust-1);
 assert.equal(fieldReadings().energy,before.energy+1);
 assert.equal(simulationPreview().hours,2);
 assert.equal(STATE.oxygen,oxygen-.5);
 const dust=STATE.panels.dusty;endSol();assert.equal(STATE.panels.dusty,dust);
 assert.equal(STATE.log.filter(e=>e.choice==='sim.clean').length,1);
 reviewSol();assert.equal(STATE.sim.workedHours,0);
});
test('an unfinished or reloaded exercise cannot turn into an automatic repair at sunset',()=>{
 const values=new Map();globalThis.localStorage={setItem:(k,v)=>values.set(k,v),getItem:k=>values.get(k),removeItem:k=>values.delete(k)};
 try{
  start();const oxygen=STATE.oxygen;assert(beginFieldTask('inspectArray'));save();load();
  assert.equal(STATE.sim.interactive.inspectArray,true);
  endSol();assert.equal(STATE.sim.done.inspectArray,undefined);
  assert.equal(STATE.sim.plan.length,0);
  assert.equal(STATE.oxygen,oxygen-2); // unpowered scrubber + seal + CO2 loss, reserved EVA refunded
 }finally{delete globalThis.localStorage;}
});
test('cancelled field work refunds its costs, completed work is not refundable',()=>{
 start();const oxygen=STATE.oxygen;assert(beginFieldTask('inspectArray'));assert(unplanTask('inspectArray'));
 assert.equal(STATE.oxygen,oxygen);assert.equal(STATE.sim.interactive.inspectArray,undefined);
 assert(beginFieldTask('inspectArray'));assert(finishFieldTask('inspectArray'));assert.equal(unplanTask('inspectArray'),false);
});
