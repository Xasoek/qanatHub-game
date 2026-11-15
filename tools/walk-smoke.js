import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',args:['--use-gl=angle','--use-angle=metal']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},offline:true});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL('../index.html',import.meta.url).href);await page.locator('#start').click();await page.locator('#base canvas').waitFor();
 await page.locator('.world-label[data-object="panels"]').click();
 assert(await page.locator('#work-screen').isHidden());assert(await page.locator('#field-layer').isHidden());
 assert.equal(await page.locator('[data-walking="panels"]').count(),1);
 await page.locator('#work-screen').waitFor({state:'visible',timeout:20000});
 assert.equal(await page.locator('[data-filter="panels"]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.getByRole('button',{name:/^Inspect the greenhouse/}).count(),0);
 await page.locator('#work-screen').getByRole('button',{name:/^Inspect the solar array/}).click();await page.locator('#field-layer').waitFor({state:'visible'});
 await page.getByRole('button',{name:'Put tools away',exact:true}).click();
 // Free choice starts a real walk. Cancellation refunds the reserved job.
 await page.locator('#work-open').click();await page.locator('[data-filter="farm"]').click();
 await page.getByRole('button',{name:/^Inspect the greenhouse/}).click();
 assert(await page.locator('#field-layer').isHidden());
 const snapshot=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('oneSolToRescue.save')).state);
 assert((await snapshot()).sim.plan.includes('inspectFarm'));
 const sol=(await snapshot()).sol;
 await page.locator('#field-cancel-walk').click();
 assert(!(await snapshot()).sim.plan.includes('inspectFarm'));assert.equal((await snapshot()).sol,sol);
 // A new destination replaces the old callback; the old job must not open later.
 await page.locator('.world-label[data-object="farm"]').click();await page.locator('.world-label[data-object="air"]').click();
 await page.locator('#work-screen').waitFor({state:'visible',timeout:20000});
 assert.equal(await page.locator('[data-filter="air"]').getAttribute('aria-pressed'),'true');
 assert(await page.locator('#field-layer').isHidden());
 await page.locator('[data-filter="all"]').click();assert(await page.getByRole('button',{name:/^Inspect the greenhouse/}).count());
 assert.deepEqual(errors,[]);console.log('3D object arrival, local activity choice, free choice, cancellation/refund and destination replacement passed');
}finally{await browser.close();}
