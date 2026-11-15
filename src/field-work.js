import {createEquipmentView} from './field-art.js';
import {CONFIG} from './config.js';

export function activityFor(key){
 if(key==='clean')return 'brush';
 if(key==='panel')return 'replace';
 if(key==='nutrients')return 'sow';
 if(key==='debris')return 'salvage';
 if(key==='inspectArray')return 'scan';
 const mission=CONFIG.simulation.tasks[key]?.mission;
 if(mission==='power'||mission==='rover'||key==='lander')return 'circuit';
 if(mission==='life')return 'filter';
 if(mission==='pressure')return 'seal';
 if(mission==='thermal')return 'thermal';
 if(key==='pumpTest')return 'circuit';
 if(mission==='water')return 'valves';
 if(key==='radio')return 'circuit';
 if(mission==='comms'||key==='beacon')return 'aim';
 if(key==='nutrients'||key==='inspectFarm')return 'nutrients';
 if(mission==='farm')return 'plant';
 return 'route';
}
export function createFieldWork({layer,copy,onCancel,onComplete,onClose}){
 let current=null,controller=null,opener=null,finished=false,art=null;
 const node=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;e.className=cls;return e;};
 const text=(key,vars)=>copy('field.'+key,vars);
 function listen(el,type,fn){el.addEventListener(type,fn,{signal:controller.signal});}
 function button(label,fn,cls=''){const b=node('button',label,cls);b.type='button';listen(b,'click',fn);return b;}
 function setOthers(value){for(const el of layer.parentElement.children)if(el!==layer)el.inert=value;}
 function close(cancel=false){
  if(!current)return;
  if(cancel&&!finished)onCancel(current);
  art?.dispose();art=null;controller?.abort();layer.hidden=true;setOthers(false);current=null;onClose();opener?.focus();
 }
 function open(key){
  if(current)return false;
  current=key;finished=false;opener=document.activeElement;controller=new AbortController();
  layer.replaceChildren();layer.hidden=false;setOthers(true);
  const panel=node('section','','field-console');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','field-heading');layer.append(panel);
  const head=node('header','','field-head'),caption=node('div');caption.append(node('p',text('label'),'field-eyebrow'));
  const title=node('h2',copy('sim.tasks.'+key));title.id='field-heading';caption.append(title);head.append(caption,button(text('cancel'),()=>close(true),'field-cancel'));panel.append(head);
  const cost=node('p',text('cost',CONFIG.simulation.tasks[key]),'field-cost');panel.append(cost);
  const hint=node('p','','field-instruction');panel.append(hint);
  const stage=node('div','','field-stage');panel.append(stage);
  const feedback=node('p','','field-feedback');feedback.setAttribute('role','status');panel.append(feedback);
  const question=node('div','','field-question');question.hidden=true;panel.append(question);
  const foot=node('footer');foot.append(node('p',text('pause')));panel.append(foot);
  function say(key){feedback.textContent=text(key);}
  function quiz(correct,wrong){
   if(!question.hidden)return;
   question.hidden=false;question.append(node('h3',text('question')));
   // Rotate answer position deterministically so reasoning matters on repeated repairs.
   const options=[...wrong];options.splice(key.length%(wrong.length+1),0,correct);
   for(const answer of options){
    const choice=button(text('answers.'+answer),()=>{
     if(answer!==correct){choice.classList.add('incorrect');say('retry');return;}
     const summary=onComplete(current);
     if(summary===false){say('locked');return;}
     finished=true;question.replaceChildren(node('h3',text('done')),
       node('p',copy('sim.learn.'+key)),node('p',summary,'field-result'),
       node('p',text('resultHint')),button(text('continue'),()=>close(),'primary'));
     stage.classList.add('field-complete');head.querySelector('.field-cancel').hidden=true;
    });
    question.append(choice);
   }
  }
  function ready(correct,wrong){step(4);quiz(correct,wrong);question.scrollIntoView({block:'nearest',behavior:'smooth'});}
  const kind=activityFor(key);
  stage.dataset.activity=kind;
  if(!['brush','scan'].includes(kind))art=createEquipmentView(stage,kind==='sow'?'nutrients':kind==='salvage'?'route':kind);
  function step(n){panel.dataset.step=n;panel.style.setProperty('--work-progress',(n/4*100)+'%');}
  step(1);
  if(kind==='brush'){
   hint.textContent=text('brush');
   const canvas=document.createElement('canvas');canvas.width=720;canvas.height=300;
   canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',text('brushTool'));canvas.dataset.tool='brush';stage.append(canvas);
   const meter=node('progress');meter.max=100;meter.value=0;meter.setAttribute('aria-label',text('output'));stage.append(meter);
   const label=node('p',text('clear',{n:0}));stage.append(label);
   const ctx=canvas.getContext('2d'),cfg=CONFIG.field,clear=new Set();let pressed=false,last=null;
   function draw(){
    const bg=ctx.createLinearGradient(0,0,720,300);bg.addColorStop(0,'#445863');bg.addColorStop(.45,'#24343d');bg.addColorStop(1,'#101c25');ctx.fillStyle=bg;ctx.fillRect(0,0,720,300);
    ctx.strokeStyle='#82969922';ctx.lineWidth=1;for(let i=0;i<720;i+=24){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,300);ctx.stroke();}
    ctx.shadowColor='#000b';ctx.shadowBlur=15;ctx.shadowOffsetY=8;
    ctx.fillStyle='#0a1118';ctx.fillRect(32,21,660,263);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    const frame=ctx.createLinearGradient(0,22,0,276);frame.addColorStop(0,'#eef0de');frame.addColorStop(.08,'#788f99');frame.addColorStop(.5,'#b8c3bd');frame.addColorStop(1,'#3c545f');ctx.fillStyle=frame;ctx.fillRect(35,22,650,254);
    for(let row=0;row<cfg.brushRows;row++)for(let col=0;col<cfg.brushColumns;col++){
     const x=43+col*26.4,y=30+row*19.8,i=row*cfg.brushColumns+col;
     const glass=ctx.createLinearGradient(x,y,x+25,y+18);glass.addColorStop(0,'#40759a');glass.addColorStop(.4,'#203955');glass.addColorStop(1,'#152f49');ctx.fillStyle=glass;ctx.fillRect(x,y,25,18.5);
     ctx.fillStyle='#a4c3cf';ctx.fillRect(x+12,y,.7,18.5);
     if(!clear.has(i)){
      ctx.fillStyle=['#a77a54','#ba8a5c','#9b7352'][(row*7+col*3)%3];
      ctx.fillRect(x-.4,y-.3,26.5,20.2);
      for(let g=0;g<12;g++){const a=((col*31+row*17+g*13)%101)/101,b=((col*11+row*29+g*19)%97)/97;ctx.fillStyle=g%2?'#ddba8c80':'#76543b50';ctx.fillRect(x+a*25,y+b*19,1.3,1.1);}
     }
    }
    for(const x of [38,677])for(const y of [25,267]){ctx.fillStyle='#182a32';ctx.beginPath();ctx.arc(x+2,y+2,2.6,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b4c5bf';ctx.beginPath();ctx.moveTo(x,y+2);ctx.lineTo(x+4,y+2);ctx.stroke();}
    if(last){ctx.save();ctx.translate(last.x,last.y);ctx.rotate(-.45);ctx.shadowColor='#0008';ctx.shadowBlur=6;ctx.fillStyle='#dfd5bc';ctx.fillRect(-20,-7,40,16);ctx.fillStyle='#c2763c';ctx.fillRect(-8,-46,16,40);ctx.fillStyle='#7c6351';ctx.fillRect(-22,8,44,9);ctx.strokeStyle='#d9b88c';for(let i=-20;i<22;i+=3){ctx.beginPath();ctx.moveTo(i,8);ctx.lineTo(i,20);ctx.stroke();}ctx.restore();}
    const n=Math.round(clear.size/(cfg.brushRows*cfg.brushColumns)*100);
    meter.value=n;label.textContent=text('clear',{n});
    if(question.hidden&&n>=cfg.clearFraction*100)ready('light',['stronger','air']);
   }
   function paint(x,y){
    const radius=720*cfg.brushRadius;
    for(let row=0;row<cfg.brushRows;row++)for(let col=0;col<cfg.brushColumns;col++)
     if(Math.hypot(56+col*26.4-x,40+row*19.8-y)<radius)clear.add(row*cfg.brushColumns+col);
    draw();
   }
   function position(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*720/r.width,y:(e.clientY-r.top)*300/r.height};}
   function sweep(e){
    if(!pressed)return;const p=position(e);
    if(last){const count=Math.ceil(Math.hypot(p.x-last.x,p.y-last.y)/12);for(let i=1;i<=count;i++)paint(last.x+(p.x-last.x)*i/count,last.y+(p.y-last.y)*i/count);}
    else paint(p.x,p.y);last=p;
   }
   listen(canvas,'pointerdown',e=>{pressed=true;last=null;canvas.setPointerCapture(e.pointerId);sweep(e);});
   listen(canvas,'pointermove',sweep);listen(canvas,'pointerup',()=>{pressed=false;last=null;});listen(canvas,'pointercancel',()=>{pressed=false;last=null;});
   let cursor={x:60,y:40};listen(canvas,'keydown',e=>{
    const d={ArrowRight:[25,0],ArrowLeft:[-25,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];
    if(!d)return;e.preventDefault();cursor={x:Math.max(40,Math.min(680,cursor.x+d[0])),y:Math.max(30,Math.min(265,cursor.y+d[1]))};paint(cursor.x,cursor.y);
   });draw();
  }else if(kind==='scan'){
   hint.textContent=text('scan');const read=new Set(),tiles=node('div','','field-panels');stage.append(tiles);
   for(const [id,label]of [['dust','scanDust'],['crack','scanCrack']]){
    const tile=button(text(id),()=>{
     read.add(id);tile.classList.add('measured');feedback.textContent=text(label);
     if(read.size===2){hint.textContent=text('scanned');ready('inspect',['stronger','air']);}
    },'field-panel '+id);
    tile.dataset.probe=id;const image=node('span','','panel-grid');image.innerHTML='<svg viewBox="0 0 300 150" aria-hidden="true"><defs><linearGradient id="glass-'+id+'" x2="1" y2="1"><stop stop-color="#57839b"/><stop offset=".5" stop-color="#123754"/><stop offset="1" stop-color="#3a5b73"/></linearGradient></defs><path d="M35 34L245 12 279 116 62 142Z" fill="#4c5c62" stroke="#b8c5c5" stroke-width="5"/><path d="M40 35L242 17 273 113 65 136Z" fill="url(#glass-'+id+')"/><path d="M90 31L113 130M140 26L164 124M190 22L215 119M49 67L254 47M56 102L264 81" stroke="#91bac5" stroke-width="1"/>'+(id==='dust'?'<path d="M40 35L242 17 273 113 65 136Z" fill="#bc936a" opacity=".88"/>':'<path d="M178 24L143 59 166 76 138 128M147 57L94 78" fill="none" stroke="#0a1521" stroke-width="4"/>')+'</svg>';tile.append(image);tiles.append(tile);
   }
  }else if(kind==='replace'){
   hint.textContent=text('replaceHint');let isolated=false,removed=false,fitted=false,bolts=0;
   const tools=node('div','','field-ports');stage.append(tools);
   const isolate=button(text('isolate'),()=>{isolated=true;isolate.disabled=true;remove.disabled=false;step(2);});
   const remove=button(text('removeBroken'),()=>{if(!isolated)return;removed=true;remove.disabled=true;fit.disabled=false;art?.set({removed:true});say('brokenRemoved');});remove.disabled=true;
   const fit=button(text('fitNew'),()=>{if(!removed)return;fitted=true;fit.disabled=true;art?.set({fixed:true});step(3);for(const b of clamps.children)b.disabled=false;});fit.disabled=true;
   tools.append(isolate,remove,fit);const clamps=node('div','','field-ports');stage.append(clamps);
   for(let i=0;i<CONFIG.field.panelClamps;i++){const clamp=button(text('clamp',{n:i+1}),()=>{if(!fitted)return;clamp.disabled=true;clamp.classList.add('selected');art?.set({clamp:i});bolts++;if(bolts===CONFIG.field.panelClamps)test.disabled=false;});clamp.disabled=true;clamp.dataset.clamp=String(i);clamps.append(clamp);}
   const test=button(text('testCircuit'),()=>{art?.set({connected:true});say('panelGood');ready('replace',['stronger','free']);},'primary');test.disabled=true;stage.append(test);
  }else if(kind==='sow'){
   hint.textContent=text('sowHint');let sown=0,watered=false;const beds=node('div','','field-seed-beds');stage.append(beds);
   for(let i=0;i<CONFIG.field.seedSites;i++){
    const seed=button(text('seedSite',{n:i+1}),()=>{seed.disabled=true;seed.classList.add('selected');sown++;art?.set({sown});step(2);if(sown===CONFIG.field.seedSites)water.disabled=false;});seed.dataset.seed=String(i);beds.append(seed);
   }
   const water=button(text('waterTray'),()=>{watered=true;water.disabled=true;art?.set({watered:true});step(3);hint.textContent=text('doseHint',{min:CONFIG.field.waterRange[0],max:CONFIG.field.waterRange[1]});dose.disabled=false;test.disabled=false;});water.disabled=true;stage.append(water);
   const dose=node('input');dose.type='range';dose.min=0;dose.max=100;dose.value=10;dose.disabled=true;dose.setAttribute('aria-label',text('waterDose'));const label=node('label',text('waterDose'));label.append(dose);stage.append(label);
   const test=button(text('checkTray'),()=>{if(!watered)return;const v=Number(dose.value);if(v<CONFIG.field.waterRange[0]||v>CONFIG.field.waterRange[1]){say(v<CONFIG.field.waterRange[0]?'tooDry':'tooWet');return;}say('sownGood');ready('plant',['lightOnly','free']);},'primary');test.disabled=true;stage.append(test);
  }else if(kind==='salvage'){
   hint.textContent=text('salvageHint');let selected=0;const parts=node('div','','field-ports');stage.append(parts);
   for(const id of ['sharp','salvageCable','salvageBracket']){const part=button(text(id),()=>{if(id==='sharp'){say('sharpWarn');return;}part.disabled=true;part.classList.add('selected');selected++;step(2);if(selected===2){art?.set({fixed:true});say('salvageGood');ready('salvage',['free','oneWay']);}});parts.append(part);}
  }else if(kind==='circuit'){
   const mission=CONFIG.simulation.tasks[key].mission;
   const sourceName=(key==='pumpTest'||mission==='rover'||key==='radio')?'batteryOutput':'source';
   const sinkName=key==='pumpTest'?'pumpMotor':mission==='rover'?'driveControl':key==='radio'?'radioController':'sink';
   const wiringHint=()=>{feedback.textContent=text('circuitHint',{source:text(sourceName),sink:text(sinkName)});};
   hint.textContent=text('circuit');let isolated=false,source=false,connected=false;
   const diagram=node('div','','field-circuit'),connections=node('div','','field-ports');stage.append(diagram,connections);
   diagram.hidden=true;diagram.innerHTML='<svg viewBox="0 0 600 140" aria-hidden="true"><path d="M50 70H215m170 0h165" stroke="#bfc9ce" stroke-width="10"/><path class="circuit-gap" d="M215 70Q300 13 385 70" fill="none" stroke="#536674" stroke-width="8" stroke-dasharray="8 8"/><rect x="30" y="35" width="70" height="70" rx="8" fill="#254f6a"/><rect x="500" y="35" width="70" height="70" rx="8" fill="#4c666c"/></svg>';
   const isolate=button(text('isolate'),()=>{isolated=true;step(2);art?.set({isolated:true});isolate.textContent=text('isolated');isolate.disabled=true;diagram.classList.add('isolated');});stage.prepend(isolate);
   const test=button(text('testCircuit'),()=>{
    if(!connected){wiringHint();return;}
    diagram.classList.add('powered');say('powered');ready('flow',['free','air']);
   },'primary');test.disabled=true;stage.append(test);
   for(const id of ['wrongA','source','wrongB','sink']){
    const port=button(text(id==='source'?sourceName:id==='sink'?sinkName:id),()=>{
     if(!isolated){say('unsafe');return;}
     if(id==='source'){source=true;port.classList.add('selected');return;}
     if(id==='sink'&&source){connected=true;step(3);art?.set({connected:true});port.classList.add('selected');test.disabled=false;say('connected');return;}
     wiringHint();
    });port.dataset.port=id;connections.append(port);
   }
  }else if(kind==='seal'||kind==='valves'||kind==='thermal'){
   hint.textContent=text(kind==='valves'?'valves':kind==='thermal'?'thermal':'leak');
   const probes=node('div','','field-probes');stage.append(probes);let found=false,probed=new Set();
   const diagnostic=['inspect','inspectHeat','findLeak'].includes(key);
   const fix=button(text(key==='pipe'?'removePipe':kind==='valves'?'valve':kind==='thermal'?'thermalFit':'fit'),()=>{
    if(!found)return;if(key==='pipe'&&!stage.dataset.pipeRemoved){stage.dataset.pipeRemoved='true';fix.textContent=text('fitPipe');hint.textContent=text('pipeRemoved');step(2);return;}fix.disabled=true;art?.set({fixed:true,pipe:key==='pipe'});step(3);stage.classList.add('fixed');say(kind==='valves'?'valveGood':kind==='thermal'?'thermalDone':'sealed');
    test.disabled=false;
   });fix.disabled=true;
   const test=button(text(kind==='thermal'?'thermalTest':'testSeal'),()=>{say(kind==='valves'?'valveGood':kind==='thermal'?'thermalDone':'sealed');ready(kind==='valves'?(key==='pipe'?'pipe':'water'):kind==='thermal'?'heat':'pressure',[kind==='valves'?'moreWater':kind==='thermal'?'heatFree':'wind','free']);},'primary');test.disabled=true;
   for(let i=0;i<3;i++){
    const probe=button(text('probe',{n:i+1}),()=>{
     probed.add(i);probe.classList.add(i===1?'leaking':'measured');
     probe.textContent=String(i+1)+' · '+text(kind==='thermal'?(i===1?'cold':'warm'):(i===1?'falling':'stable'));
     if(i===1)found=true;
     say(i===1?'falling':'stable');
     if(found&&probed.size===3){
      if(diagnostic){say('markLeak');ready(kind==='valves'?(key==='pipe'?'pipe':'water'):kind==='thermal'?'heat':'pressure',[kind==='valves'?'moreWater':kind==='thermal'?'heatFree':'wind','free']);}
      else{hint.textContent=text('seal');fix.disabled=false;}
     }
    });probe.dataset.probe=String(i);probe.prepend(node('span',String(i+1).padStart(2,'0'),'seal-icon'));probes.append(probe);
   }
   if(!diagnostic)stage.append(fix,test);
  }else if(kind==='filter'){
   hint.textContent=text(key==='airTest'?'filterTest':'filter');const choices=node('div','','field-ports');stage.append(choices);
   const filter=button(text('fitFilter'),()=>{filter.disabled=true;art?.set({fixed:true,pipe:key==='pipe'});step(3);stage.classList.add('fixed');say('filterGood');test.disabled=false;});filter.hidden=true;
   const test=button(text('testFilter'),()=>{say('filterGood');ready('filter',['makeOxygen','air']);},'primary');test.hidden=true;test.disabled=true;
   for(const id of ['oxygen','co2','battery']){
    const choice=button(text(id),()=>{if(id!=='co2'){say('filterWrong');return;}choice.classList.add('selected');art?.set({selected:true});step(2);if(key==='inspectAir'||key==='airTest'){say('filterObserved');ready('filter',['makeOxygen','air']);return;}say('filterRight');filter.hidden=false;test.hidden=false;});choice.dataset.cartridge=id;choices.append(choice);
   }
   stage.append(filter,test);
  }else if(kind==='nutrients'){
   hint.textContent=text('nutrients');const selected=new Set();
   for(const id of ['waterNeed','lightNeed','timeNeed']){
    const option=button(text(id),()=>{selected.add(id);option.classList.add('selected');if(selected.size===3)ready('plant',['lightOnly','free']);});stage.append(option);
   }
  }else if(kind==='aim'||kind==='plant'){
   const plant=kind==='plant';hint.textContent=text(plant?'plant':'aim');
   const diagram=node('div','',plant?'field-plant':'field-dish');
   diagram.hidden=true;
   stage.append(diagram);
   const label=node('label',text(plant?'lamp':'bearing')),slider=node('input');slider.type='range';slider.min='0';slider.max='100';slider.value='10';slider.setAttribute('aria-label',text(plant?'lamp':'bearing'));label.append(slider);stage.append(label);
   const meter=node('progress');meter.max=100;meter.value=15;meter.setAttribute('aria-label',text('signal'));stage.append(meter);
   function adjust(){const value=Number(slider.value);art?.set({aim:value,sown:plant?6:0,watered:plant});meter.value=Math.max(10,100-Math.abs(66-value)*2);diagram.style.setProperty('--aim',value+'%');diagram.classList.toggle('aligned',Math.abs(value-66)<=CONFIG.field.antennaTolerance);}
   listen(slider,'input',adjust);
   stage.append(button(text('lock'),()=>{
    if(Math.abs(Number(slider.value)-66)>CONFIG.field.antennaTolerance){say('aimWeak');return;}
    say(plant?'lightGood':'aimGood');ready(plant?'plant':'direction',[plant?'lightOnly':'instant','free']);
   },'primary'));adjust();
  }else{
   hint.textContent=text('route');const map=node('div','','field-route');
   map.innerHTML='<svg viewBox="0 0 600 140" aria-hidden="true"><rect x="215" y="10" width="170" height="90" rx="38" fill="#a57953"/><path d="M50 65H550" stroke="#d6a276" stroke-width="4" stroke-dasharray="10 7"/><path d="M50 65Q80 120 180 120H440Q530 120 550 65" stroke="#82c5b7" fill="none" stroke-width="5"/><circle cx="50" cy="65" r="15" fill="#e0d9c3"/><circle cx="550" cy="65" r="15" fill="#e0d9c3"/></svg>';
   stage.append(map,button(text('short'),()=>say('routeRisk')),button(text('safe'),()=>{say('routeGood');ready('reserve',['oneWay','free']);},'primary'));
  }
  listen(panel,'keydown',e=>{
   if(e.key==='Escape'){e.stopPropagation();close(true);return;}
   if(e.key!=='Tab')return;
   const focus=[...panel.querySelectorAll('button:not(:disabled),input,canvas[tabindex]')].filter(o=>!o.hidden&&o.offsetParent!==null);
   if(e.shiftKey&&document.activeElement===focus[0]){e.preventDefault();focus.at(-1)?.focus();}
   else if(!e.shiftKey&&document.activeElement===focus.at(-1)){e.preventDefault();focus[0]?.focus();}
  });
  head.querySelector('button').focus();return true;
 }
 return {open,close:()=>close(true),get isOpen(){return Boolean(current);},get task(){return current;}};
}
