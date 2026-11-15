import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium}from'playwright';
const url=new URL('../index.html',import.meta.url).href;
for(const touch of [false,true])test('hands-on inspection and cleaning '+(touch?'on a landscape touch screen':'on desktop'),async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());
 const context=await browser.newContext({viewport:touch?{width:800,height:360}:{width:1280,height:800},hasTouch:touch,offline:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);assert(await page.locator('#guide-layer').isHidden());await page.locator('#start').click();
 await page.locator('#field-next').click();
 assert(await page.locator('#field-layer').isVisible());
 await page.locator('[data-probe="dust"]').click();assert(await page.locator('.field-question').isHidden());
 await page.locator('[data-probe="crack"]').click();
 await page.getByRole('button',{name:'The brush makes the Sun stronger',exact:true}).click();
 assert(await page.locator('.field-result').count()===0);
 await page.getByRole('button',{name:'Brush away dust; replace a cracked panel',exact:true}).click();
 await page.getByRole('button',{name:'Back to the base',exact:true}).click();
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('oneSolToRescue.save')).state);
 const inspected=await read();assert(inspected.sim.done.inspectArray);
 await page.locator('#field-next').click();
 const canvas=page.locator('[data-tool="brush"]'),bounds=await canvas.boundingBox();
 const cdp=touch?await context.newCDPSession(page):null;
 for(let row=0;row<5;row++){
  const y=bounds.y+bounds.height*(.15+row*.17);
  if(touch){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bounds.x+bounds.width*.05,y}]});
   for(let col=1;col<=12;col++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bounds.x+bounds.width*(.05+col*.075),y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
   await page.mouse.move(bounds.x+bounds.width*.05,y);await page.mouse.down();
   await page.mouse.move(bounds.x+bounds.width*.95,y,{steps:16});await page.mouse.up();
  }
 }
 await page.getByRole('button',{name:'More light reaches the cells',exact:true}).click();
 await page.getByRole('button',{name:'Back to the base',exact:true}).click();
 const cleaned=await read();assert.equal(cleaned.panels.dusty,inspected.panels.dusty-1);
 assert.equal(cleaned.sim.workedHours,2);
 // Cancelled tools do not perform a repair or keep a spare part.
 await page.locator('#work-open').click();await page.getByRole('button',{name:/^Replace the damaged power cable/}).click();
 await page.getByRole('button',{name:'Put tools away',exact:true}).click();
 assert.equal((await read()).sim.spares,cleaned.sim.spares);
 assert.equal((await read()).sim.done.cable,undefined);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.deepEqual(errors,[]);
});

import {newGame,STATE,skipToDecision,save}from'../src/engine.js';
import {CONFIG}from'../src/config.js';
import {TEXT}from'../src/text.js';
function prepared(key){
 let value;globalThis.localStorage={getItem:()=>value,setItem:(_,s)=>value=s,removeItem:()=>{}};
 try{
  newGame({simulation:true,seed:0});skipToDecision();
  function prerequisite(id){for(const parent of CONFIG.simulation.tasks[id].requires??[]){STATE.sim.done[parent]=true;prerequisite(parent);}}
  prerequisite(key);save();return value;
 }finally{delete globalThis.localStorage;}
}
for(const task of ['cable','seal','isolate','co2','actuator','lights','route','panel','pipe','nutrients','debris'])test('equipment lesson '+task+' requires the procedure before committing',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage({viewport:{width:1280,height:800},offline:true});
 const fixture=prepared(task);await page.addInitScript(fixture=>localStorage.setItem('oneSolToRescue.save',fixture),fixture);
 await page.goto(url);await page.locator('#continue').click();await page.locator('#work-open').click();
 const title=TEXT.en.sim.tasks[task];await page.getByRole('button',{name:new RegExp('^'+title)}).click();
 let answer;
 if(task==='panel'){
  assert(await page.locator('.field-question').isHidden());
  await page.getByRole('button',{name:'Isolate power',exact:true}).click();
  await page.getByRole('button',{name:'Remove the broken panel',exact:true}).click();
  await page.getByRole('button',{name:'Fit a spare panel',exact:true}).click();
  for(let i=1;i<=CONFIG.field.panelClamps;i++)await page.getByRole('button',{name:'Secure clamp '+i,exact:true}).click();
  await page.getByRole('button',{name:'Restore power and test',exact:true}).click();answer='Replacing broken cells restores the useful circuit';
 }else if(task==='nutrients'){
  for(let i=0;i<CONFIG.field.seedSites;i++)await page.locator('[data-seed="'+i+'"]').click();
  await page.getByRole('button',{name:'Connect the water feed',exact:true}).click();
  await page.getByRole('button',{name:'Check the growing tray',exact:true}).click();assert(await page.locator('.field-question').isHidden());
  const slider=page.locator('.field-stage input');await slider.fill('95');await slider.dispatchEvent('input');
  await page.getByRole('button',{name:'Check the growing tray',exact:true}).click();assert.match(await page.locator('.field-feedback').textContent(),/Too much/);
  await slider.fill('55');await slider.dispatchEvent('input');await page.getByRole('button',{name:'Check the growing tray',exact:true}).click();answer='Plants need light, water and time';
 }else if(task==='debris'){
  await page.getByRole('button',{name:'Sharp cell shards',exact:true}).click();assert(await page.locator('.field-question').isHidden());
  await page.getByRole('button',{name:'Recover the intact cable',exact:true}).click();await page.getByRole('button',{name:'Recover the mounting bracket',exact:true}).click();answer='Only intact parts can be reused safely';
 }else if(task==='pipe'){
  for(const n of ['0','1','2'])await page.locator('[data-probe="'+n+'"]').click();
  await page.getByRole('button',{name:'Remove the damaged pipe',exact:true}).click();assert(await page.locator('.field-question').isHidden());
  await page.getByRole('button',{name:'Fit the replacement pipe',exact:true}).click();
  await page.getByRole('button',{name:'Run the pressure test',exact:true}).click();answer='A sealed pipe keeps water in the circuit';
 }else if(task==='cable'){
  await page.locator('[data-port="source"]').click();assert.match(await page.locator('.field-feedback').textContent(),/Isolate/);
  await page.getByRole('button',{name:'Isolate power',exact:true}).click();
  await page.locator('[data-port="source"]').click();await page.locator('[data-port="sink"]').click();
  await page.getByRole('button',{name:'Restore power and test',exact:true}).click();answer='A connected circuit lets current reach the load';
 }else if(task==='seal'||task==='isolate'){
  for(const n of ['0','1','2'])await page.locator('[data-probe="'+n+'"]').click();
  await page.getByRole('button',{name:task==='seal'?'Fit the seal':'Close this branch',exact:true}).click();
  await page.getByRole('button',{name:'Run the pressure test',exact:true}).click();
  answer=task==='seal'?'The seal stops cabin air escaping':'Isolating one leaking branch preserves the rest';
 }else if(task==='co2'){
  await page.locator('[data-cartridge="oxygen"]').click();assert.match(await page.locator('.field-feedback').textContent(),/does not remove/);
  await page.locator('[data-cartridge="co2"]').click();await page.getByRole('button',{name:'Fit the cartridge',exact:true}).click();
  await page.getByRole('button',{name:'Test airflow',exact:true}).click();answer='The cartridge removes CO₂ from cabin air';
 }else if(task==='actuator'||task==='lights'){
  await page.getByRole('button',{name:'Lock the direction',exact:true}).click();assert(await page.locator('.field-question').isHidden());
  const slider=page.locator('.field-stage input'),bounds=await slider.boundingBox();
  await slider.click({position:{x:bounds.width*.66,y:bounds.height/2}});
  await page.getByRole('button',{name:'Lock the direction',exact:true}).click();answer=task==='lights'?'Plants need light, water and time':'The antenna must point toward the relay';
 }else{
  await page.getByRole('button',{name:'Around the dust zone',exact:true}).click();answer='A round trip needs a return reserve';
 }
 await page.getByRole('button',{name:answer,exact:true}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('oneSolToRescue.save')).state);
 if(task==='panel')assert.equal(saved.panels.broken,0);else assert(saved.sim.done[task]);assert.equal(saved.sim.workedHours,CONFIG.simulation.tasks[task].hours);
});

test('free activity choice works from morning, filters by object and keeps prerequisite locks',async t=>{
 const browser=await chromium.launch();t.after(()=>browser.close());const page=await browser.newPage({viewport:{width:1280,height:800},offline:true});
 await page.goto(url);await page.locator('#start').click();await page.locator('#work-open').click();
 assert(await page.locator('#work-screen').isVisible());
 await page.locator('[data-filter="farm"]').click();
 assert.equal(await page.locator('#work-screen').getByRole('button',{name:/^Inspect the solar array/}).count(),0);
 assert(await page.getByRole('button',{name:/^Plant seeds and prepare/}).isDisabled());
 await page.getByRole('button',{name:/^Inspect the greenhouse/}).click();await page.locator('#field-layer').waitFor({state:'visible'});
 assert.match(await page.locator('#field-heading').textContent(),/greenhouse/);
 await page.getByRole('button',{name:'Put tools away',exact:true}).click();
 await page.locator('#work-open').click();await page.locator('[data-filter="all"]').click();
 assert(await page.locator('#work-screen').getByRole('button',{name:/^Inspect the solar array/}).isEnabled());
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('oneSolToRescue.save')).state);
 assert(!state.sim.done.inspectFarm);assert(!state.sim.plan.includes('inspectFarm'));assert.equal(state.sim.workedHours,0);
});
