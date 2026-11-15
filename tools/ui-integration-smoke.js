import test from 'node:test';
import assert from 'node:assert/strict';
import {chromium}from'playwright';
import {newGame,STATE,save,skipToDecision,planTask}from'../src/engine.js';
import {NASA_ARCHIVE}from'../src/data.js';
const url=new URL('../index.html',import.meta.url).href;
const key='oneSolToRescue.save';

async function withPage(t,fn,options={}){
 const browser=await chromium.launch();t.after(()=>browser.close());
 const context=await browser.newContext({viewport:{width:1280,height:800},...options});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await fn(page,context);
 assert.deepEqual(errors,[]);
}
async function menu(page,id){await page.locator('#menu').click();await page.locator(id).click();}
// A first visit opens the "How to play" guide (tested in browser-smoke.js); these checks close it.
// Closing it with Skip, rather than presetting localStorage from an init script, keeps the
// storage writes in page order: an init-script write at document start raced the autosave on reload.
async function skipGuide(page){if(await page.locator('#guide-layer').isVisible())await page.locator('#guide-skip').click();}
async function state(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)).state,key);}

test('UI restores saved missions, varies new seeds, and preserves a normal game across a repeatable demo',async t=>withPage(t,async page=>{
 await page.goto(url);await skipGuide(page);await page.locator('#start').click();await page.locator('#intro-skip').click();await page.locator('#next').click();
 await page.locator('#system-air [data-delta="1"]').click();await page.locator('#system-air [data-delta="1"]').click();
 await page.locator('#end').click();await page.locator('#advance').click();
 const saved=await state(page);assert.equal(saved.sol,2);
 await page.reload();assert(await page.locator('#continue').isVisible());await page.locator('#continue').click();
 assert.match(await page.locator('#sol').textContent(),/^Sol 2 /);assert.equal(Number(await page.locator('#oxygen').textContent()),saved.oxygen);
 await menu(page,'#demo-start');assert.match(await page.locator('#sol').textContent(),/^Sol 21 /);
 assert.equal((await state(page)).seed,saved.seed);
 await menu(page,'#demo-exit');assert.match(await page.locator('#sol').textContent(),/^Sol 2 /);
 assert.equal((await state(page)).seed,saved.seed);
 await menu(page,'#mission-menu');await page.locator('#start').click();await page.locator('#intro-skip').click();await menu(page,'#mission-menu');
 assert.notEqual((await state(page)).seed,saved.seed);
 // A damaged save must not leave an unusable Continue control.
 await page.evaluate(key=>localStorage.setItem(key,'{"broken":true}'),key);await page.reload();
 assert(await page.locator('#continue').isHidden());
 // The video prologue remains reachable from the menu.
 await menu(page,'#watch');assert(await page.locator('#intro-screen').isVisible());
 assert(await page.locator('#intro-video').getAttribute('src'));await page.locator('#intro-next').click();
 await page.locator('#intro-skip').click();assert(await page.locator('#start').isVisible());
}));

for(const live of [true,false])test('UI NASA selection '+(live?'shows successful data and date':'falls back to archive honestly'),async t=>withPage(t,async page=>{
 let requests=0;
 await page.route('https://**/*',async route=>{
  requests++;
  const data=live?[{flrID:'UI-TEST-ONLY',beginTime:new Date().toISOString(),classType:'M1.2',link:'https://example.invalid/ui-test'}]:[];
  await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(data)});
 });
 await page.goto(url);await skipGuide(page);assert.equal(requests,0);
 await page.locator('#data-cards [data-value="live"]').click();await page.locator('#start').click();await page.locator('#intro-skip').click();
 await page.locator('#next').waitFor();assert(requests>0);
 assert.match(await page.locator('#solar').textContent(),live?/Live NASA data.*\d{4}-\d{2}-\d{2}/:/NASA archive/);
 if(!live)assert.match(await page.locator('#warning').textContent(),/Live NASA data is unavailable/);
}));

function blockedSave(){
 let raw;globalThis.localStorage={setItem:(_,value)=>raw=value,getItem:()=>raw,removeItem:()=>{}};
 try{
  newGame({site:'gale',difficulty:'cadet',solarData:{mode:'archive',flares:NASA_ARCHIVE}});save();
  const fixture=JSON.parse(raw);fixture.state.sol=11;fixture.state.phase='day';fixture.state.paused=true;
  fixture.state.cubes=4;fixture.state.alloc.farm=0;fixture.state.alloc.repair=0;
  fixture.state.log=[{sol:11,choice:'flare.shelter',cost:{},note:'log.flare.shelter'}];
  fixture.meta.blocked=['farm','repair'];fixture.meta.blockedBy={farm:0,repair:0};fixture.meta.active=null;fixture.meta.queue=[];
  return JSON.stringify(fixture);
 }finally{delete globalThis.localStorage;}
}
test('blocked controls use the engine reason after reload in EN and RU',async t=>withPage(t,async page=>{
 const fixture=blockedSave();await page.addInitScript(({key,fixture})=>localStorage.setItem(key,fixture),{key,fixture});
 await page.goto(url);await skipGuide(page);await page.locator('#continue').click();
 for(const ru of [false,true]){
  if(ru)await page.locator('#language').click();
  for(const system of ['farm','repair']){
   assert(await page.locator('#system-'+system+' [data-delta="1"]').isDisabled());
   const reason=page.locator('#system-'+system+'-reason');assert(await reason.isVisible());
   assert.match(await reason.textContent(),ru?/Недоступно.*В укрытие/:/Unavailable.*Take shelter/);
  }
 }
 assert(await page.locator('#system-air [data-delta="1"]').isEnabled());
}));


test('campaign work-hour limit disables only unavailable allocations in the UI',async t=>withPage(t,async page=>{
 let fixture;
 globalThis.localStorage={setItem:(_,value)=>fixture=value,getItem:()=>fixture,removeItem:()=>{}};
 try{
  newGame({simulation:true,seed:0});skipToDecision();
  for(const task of ['inspectArray','inspectAir','findLeak','inspect'])planTask(task);
  STATE.fatigue=5;save();
 }finally{delete globalThis.localStorage;}
 await page.addInitScript(({key,fixture})=>localStorage.setItem(key,fixture),{key,fixture});
 await page.goto(url);await page.locator('#continue').click();
 assert(await page.locator('#system-farm [data-delta="1"]').isDisabled());
 assert.match(await page.locator('#system-farm-reason').textContent(),/work hours/);
 assert(await page.locator('#system-air [data-delta="1"]').isEnabled());
 await page.locator('#work-open').click();
 await page.getByRole('button',{name:/^Inspect the airlock/}).click();
 await page.locator('#work-close').click();
 assert(await page.locator('#system-farm [data-delta="1"]').isEnabled());
}));
