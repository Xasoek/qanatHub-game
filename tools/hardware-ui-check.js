import {chromium}from'playwright';
import assert from'node:assert/strict';
const b=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=metal']});
try{
 const p=await b.newPage({viewport:{width:1440,height:860},offline:true});const errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,200))});
 await p.goto(new URL('../index.html',import.meta.url).href);await p.locator('#start').click();
 await p.locator('#base canvas').waitFor();await p.waitForTimeout(800);
 if(process.env.ONE_SOL_PREVIEW)await p.screenshot({path:process.env.ONE_SOL_PREVIEW,type:'jpeg',quality:88});
 await p.locator('#next').click();await p.locator('#work-open').click();
 await p.getByRole('button',{name:/^Inspect the airlock/}).click();await p.locator('#work-close').click();
 await p.locator('#end').click();await p.locator('#advance').click();
 assert.match(await p.locator('#sol').textContent(),/^Sol 2 /);
 await p.setViewportSize({width:800,height:360});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await p.locator('#menu').click();await p.locator('#mission-menu').click();
 await p.locator('#continue').click();assert.match(await p.locator('#sol').textContent(),/^Sol 2 /);
 assert.deepEqual(errors,[]);console.log('Hardware 3D, simulator, landscape phone, menu and Continue passed');
}finally{await b.close()}
