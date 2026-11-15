// Rehearses the actual browser UI with a virtual clock. No production debug hooks.
import {CONFIG}from'../src/config.js';
import {chromium}from'playwright';
import assert from'node:assert/strict';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1280,height:800},offline:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();await page.goto(new URL('../index.html',import.meta.url).href);
 if(await page.locator('#guide-layer').isVisible())await page.locator('#guide-skip').click();
 await page.locator('#menu').click();await page.locator('#demo-start').click();
 let ms=0;const decisions=[];let allocatedSol=0;
 for(;ms<420000;ms+=1000){
  await page.clock.runFor(1000);
  const snapshot=await page.evaluate(()=>({sol:Number(document.querySelector('#sol-number').textContent),
   phase:document.querySelector('#phase-chip').dataset.phase,
   event:document.querySelector('#event').hidden?null:document.querySelector('#event').dataset.type,
   ended:!document.querySelector('#ending').hidden}));
  if(snapshot.ended)break;
  if(snapshot.event){
   const options=page.locator('#choices button:enabled');
   const preferred=snapshot.event==='storm'?options.filter({hasText:/^Leave them open/}):snapshot.event==='dustyPanels'?options.filter({hasText:/^Clean/}):snapshot.event==='scrubber'?options.filter({hasText:/^Fix/}):options.first();
   const choice=await preferred.count()?preferred.first():options.first();
   decisions.push({sol:snapshot.sol,event:snapshot.event,choice:await choice.textContent()});await choice.click();
  }else if(snapshot.phase==='day'&&allocatedSol!==snapshot.sol){
   allocatedSol=snapshot.sol;
   for(const system of ['air','air','farm','farm','heat','repair','repair']){
    const button=page.locator('#system-'+system+' [data-delta="1"]');
    if(await button.isEnabled())await button.click();
   }
  }
 }
 console.log(JSON.stringify({ms,decisions,sol:await page.locator('#sol').textContent(),speed:await page.locator('#speed').innerText()},null,2));
 assert(await page.locator('#ending').isVisible());
 assert.equal(await page.locator('#ending').getAttribute('data-status'),'rescued');
 assert(decisions.some(d=>d.sol===CONFIG.presentation.acts[3].sol+CONFIG.presentation.stormAfter&&d.event==='storm'));
 assert(decisions.some(d=>d.sol===CONFIG.presentation.acts[3].sol+CONFIG.presentation.flareAfter&&d.event==='flare'));
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({elapsedVirtualSeconds:ms/1000,decisions,status:'rescued'},null,2));
}finally{await browser.close()}
