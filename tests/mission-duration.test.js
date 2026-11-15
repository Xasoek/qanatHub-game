import test from 'node:test';
import assert from 'node:assert/strict';
import {CONFIG}from'../src/config.js';
import {STATE,newGame,save,load}from'../src/engine.js';
import {missionSnapshot,SOL_DAYS}from'../src/art/orbits.js';
import {t}from'../src/text.js';
test('the 210-sol campaign keeps the ship en route on sol 30 and reaches Mars at its new ending',()=>{
 assert.equal(CONFIG.missionSols,210);assert.equal(CONFIG.simulation.evacuationFrom,207);assert.equal(CONFIG.schedule.finalStormSol,209);
 const early=missionSnapshot(30),end=missionSnapshot(CONFIG.missionSols);
 assert(early.remaining>0);assert(early.distToMarsKm>1e6);assert.equal(end.remaining,0);assert(end.distToMarsKm<1);
 assert(Math.abs(missionSnapshot(1).remaining-209*SOL_DAYS)<1e-6);
 for(const lang of ['en','ru']){
  assert.match(t(lang,'ev.earthPlan.body'),/210/);assert.match(t(lang,'sim.reason.notYet'),/207/);
  assert(!t(lang,'sim.final').includes('{'));
 }
});
test('unfinished saves from the shorter campaign preserve resources and gain the new future schedule',()=>{
 let value;globalThis.localStorage={getItem:()=>value,setItem:(_,s)=>value=s,removeItem(){value=null;}};
 try{
  newGame({simulation:true,seed:7});save();const old=JSON.parse(value),air=STATE.oxygen;
  delete old.meta.missionSols;old.meta.schedule={2:'cropChoice',29:'storm'};value=JSON.stringify(old);
  assert(load());assert.equal(STATE.sol,1);assert.equal(STATE.oxygen,air);save();
  const migrated=JSON.parse(value);assert.equal(migrated.meta.missionSols,210);assert.equal(migrated.meta.schedule[209],'storm');
  const keys=Object.keys(migrated.meta.schedule).map(Number);assert(keys.some(n=>n>30&&n<209));assert(keys.every(n=>n<=210));
 }finally{delete globalThis.localStorage;}
});
