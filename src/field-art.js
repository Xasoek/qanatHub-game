import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

// A small, disposable equipment scene. It only illustrates procedure state;
// mission effects remain in the shared simulator.
export function createEquipmentView(host,kind){
 const canvas=document.createElement('canvas');canvas.className='equipment-canvas';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
 let renderer;
 try{renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch{canvas.remove();return {set(){},dispose(){}};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,2.8,.1,60);camera.position.set(6,6.7,8.8);camera.lookAt(0,.4,0);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xcbe6ff,0x8c5240,2));
 const sun=new T.DirectionalLight(0xffd4a3,4);sun.position.set(-4,8,3);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-6;sun.shadow.camera.right=6;sun.shadow.camera.top=6;sun.shadow.camera.bottom=-6;sun.shadow.normalBias=.025;scene.add(sun);
 const rim=new T.DirectionalLight(0x66cde0,2);rim.position.set(4,3,-4);scene.add(rim);
 const grain=document.createElement('canvas');grain.width=grain.height=128;const gc=grain.getContext('2d');const pixels=gc.createImageData(128,128);for(let i=0;i<pixels.data.length;i+=4){const v=165+((i*17+(i>>7)*13)%59);pixels.data.set([v,v,v,255],i);}gc.putImageData(pixels,0,0);const finish=new T.CanvasTexture(grain);finish.wrapS=finish.wrapT=T.RepeatWrapping;finish.repeat.set(3,3);
 const materials=[];function mat(color,metalness=.4,roughness=.45,extra={}){const m=new T.MeshStandardMaterial({color,metalness,roughness,bumpMap:finish,bumpScale:.008,...extra});materials.push(m);return m;}
 const ivory=mat('#ded7be',.45),dark=mat('#20323a',.65),metal=mat('#879da4',.85,.28),orange=mat('#d16b35'),blue=mat('#1c435c',.6,.25),soil=mat('#3b2920',0,.95),green=mat('#72a751',.05),red=mat('#d77448',.2),cyan=mat('#8fdacb',.3,.3,{emissive:0x347a68,emissiveIntensity:.8});
 const rig=new T.Group();scene.add(rig);
 const moving=[],flags={},targets=[];
 function pick(mesh,selector){mesh.userData.action=selector;targets.push(mesh);}let state={},disposed=false,frame,lastFrame=0;
 function mesh(geo,m,x=0,y=0,z=0,parent=rig){const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const box=(w,h,d,m,x,y,z,p)=>mesh(Math.min(w,h,d)>.08?new RoundedBoxGeometry(w,h,d,2,Math.min(.035,Math.min(w,h,d)*.18)):new T.BoxGeometry(w,h,d),m,x,y,z,p);
 const cyl=(r,h,m,x,y,z,p)=>mesh(new T.CylinderGeometry(r,r,h,32),m,x,y,z,p);
 function tube(points,r,m,parent=rig){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),m,0,0,0,parent);}
 function fracture(points,parent){const curve=new T.CurvePath();for(let i=1;i<points.length;i++)curve.add(new T.LineCurve3(new T.Vector3(...points[i-1]),new T.Vector3(...points[i])));return mesh(new T.TubeGeometry(curve,points.length*4,.012,4,false),dark,0,0,0,parent);}
 function bolt(x,y,z){cyl(.055,.045,metal,x,y,z);}
 function lamp(x,y,z,m=cyan){const a=cyl(.055,.03,m,x,y,z);moving.push(a);return a;}
 function housing(x,z,w=1.7){box(w,.85,1.55,ivory,x,.6,z);box(w+.04,.1,1.59,metal,x,1.08,z);box(w-.2,.025,1.3,dark,x,1.145,z);for(const dx of [-1,1])for(const dz of [-1,1])bolt(x+dx*(w/2-.12),1.18,z+dz*.62);box(.15,.4,1.57,orange,x-w/2+.16,.65,z);for(let i=0;i<5;i++)box(.55,.035,.05,dark,x+w/2-.4,.4+i*.09,z+.785);}
 box(8,.18,4.2,dark,0,-.12,0);box(7.9,.035,4.1,metal,0,-.01,0);
 for(let i=-3;i<=3;i++)box(.012,.005,4, dark,i,.012,0);
 for(const x of [-3.65,3.65])for(const z of [-1.8,1.8])bolt(x,.03,z);
 // Perimeter handles and an instrument rail give all jobs the same base hardware language.
 for(const x of [-3.7,3.7]){box(.12,.16,1.5,orange,x,.1,0);box(.15,.12,.15,metal,x,.1,-.9);box(.15,.12,.15,metal,x,.1,.9);}
 const screen=box(.95,.04,.6,dark,2.7,.15,1.3);screen.rotation.x=.25;
 for(let i=0;i<7;i++)box(.06,.025,.12+Math.sin(i)*.06,cyan,2.4+i*.09,.2,1.3);
 if(kind==='replace'){
  flags.part=new T.Group();rig.add(flags.part);const p=flags.part;
  box(5.7,.18,2.9,metal,0,.42,0,p);box(5.45,.08,2.65,dark,0,.54,0,p);
  for(let row=0;row<4;row++)for(let col=0;col<10;col++){
   box(.51,.035,.59,blue,-2.43+col*.54,.61,-.94+row*.63,p);
   for(let line=0;line<3;line++)box(.004,.006,.58,metal,-2.6+col*.54+line*.15,.635,-.94+row*.63,p);
  }
  flags.crack=new T.Group();p.add(flags.crack);
  fracture([[-1.1,.641,-1.3],[-.5,.641,-.6],[-.7,.641,-.1],[.5,.641,.8],[.3,.641,1.3]],flags.crack);
  fracture([[-.5,.641,-.6],[.1,.641,-.75],[.6,.641,-.7],[1.2,.641,-.2]],flags.crack);
  flags.clamps=[];
  for(let i=0;i<4;i++){const x=i%2?2.85:-2.85,z=i<2?-.95:.95;const c=box(.24,.13,.4,orange,x,.64,z);flags.clamps.push(c);pick(c,'[data-clamp="'+i+'"]');bolt(x,.74,z);}
  tube([[2.7,.4,1.3],[3.1,.15,1.5],[2.8,.15,1.7]],.055,orange);
 }else if(kind==='circuit'){
  housing(-2,0);housing(2,0);for(const [x,id]of [[-2,'source'],[2,'sink']]){const target=box(1.5,.08,1.2,blue,x,1.23,0);pick(target,'[data-port="'+id+'"]');}
  for(const x of [-2,2]){box(1.28,.045,.7,blue,x,1.18,-.12);for(let i=0;i<6;i++)box(.018,.008,.68,metal,x-.5+i*.2,1.21,-.12);lamp(x+.5,1.21,.45);}
  tube([[-1.2,.6,.5],[-.8,.15,.7],[-.3,.12,.9]],.065,orange);
  flags.wire=tube([[-1.2,.6,.5],[-.7,.18,1],[.7,.18,1],[1.2,.6,.5]],.065,orange);flags.wire.visible=false;
  for(const x of [-1.2,1.2]){const port=cyl(.14,.18,metal,x,.55,.5);port.rotation.z=Math.PI/2;}
  flags.part=new T.Group();rig.add(flags.part);box(1.7,.14,1.3,metal,0,.3,-.2,flags.part);box(1.5,.05,1.1,blue,0,.4,-.2,flags.part);
  for(let i=0;i<7;i++)box(.012,.01,1.08,ivory,-.65+i*.22,.43,-.2,flags.part);
  flags.part.visible=kind==='replace';
  flags.crack=tube([[-.7,.46,-.7],[-.25,.46,-.2],[-.4,.46,.1],[.5,.46,.3]],.025,dark,flags.part);
 }else if(['valves','seal','thermal'].includes(kind)){
  for(let i=0;i<3;i++){
   const x=(i-1)*2;housing(x,-.65,1.45);const pad=box(1.18,.04,1.08,dark,x,1.19,-.65);pick(pad,'[data-probe="'+i+'"]');
   if(i===1&&kind==='valves'){for(const z of [.28,1.32]){const half=cyl(.18,.43,metal,x,.3,z);half.rotation.x=Math.PI/2;}}
   else {const pipe=cyl(.18,1.4,metal,x,.3,.8);pipe.rotation.x=Math.PI/2;}
   for(const z of [.2,1.4]){const ring=cyl(.26,.13,dark,x,.3,z);ring.rotation.x=Math.PI/2;}
   const wheel=mesh(new T.TorusGeometry(.27,.045,8,28),orange,x,.76,.7);wheel.rotation.x=Math.PI/2;
   box(.5,.04,.07,orange,x,.76,.7);box(.07,.04,.5,orange,x,.76,.7);
   lamp(x+.38,1.21,-.3,i===1?red:cyan);
  }
  flags.leak=new T.Group();rig.add(flags.leak);
  for(let i=0;i<11;i++){const d=mesh(new T.SphereGeometry(.025+(i%3)*.012,8,6),cyan,(i%3)*.065-.06,.12+(i*.07),.8,flags.leak);moving.push(d);}
  flags.patch=box(1.3,.035,.9,kind==='thermal'?orange:ivory,0,1.22,-.65);flags.patch.visible=false;
  if(kind==='valves'){flags.pipe=cyl(.21,.68,metal,0,.3,.8);flags.pipe.rotation.x=Math.PI/2;flags.pipe.visible=false;}
 }else if(kind==='filter'){
  housing(0,0,5.7);
  for(let i=0;i<3;i++){
   const x=(i-1)*1.7;const rack=new T.Group();rack.position.set(x,1.2,0);rig.add(rack);
   cyl(.46,.18,metal,0,.1,0,rack);const cartridge=cyl(.38,.9,i===1?orange:ivory,0,.62,0,rack);pick(cartridge,'[data-cartridge="'+['oxygen','co2','battery'][i]+'"]');cyl(.46,.12,metal,0,1.1,0,rack);
   for(let j=0;j<8;j++)box(.022,.68,.1,dark,Math.sin(j*Math.PI/4)*.395,.62,Math.cos(j*Math.PI/4)*.395,rack);
   if(i===1)flags.cartridge=rack;
   tube([[x,.55,-.8],[x,.55,-1.25],[x+.5,.2,-1.45]],.08,dark);lamp(x+.5,1.21,.5,i===1?red:cyan);
  }
 }else if(['plant','nutrients'].includes(kind)){
  box(5.8,.28,2.6,ivory,0,.22,0);box(5.5,.1,2.3,dark,0,.4,0);
  flags.seeds=[];flags.water=[];
  for(let i=0;i<6;i++){
   const x=(i%3-1)*1.6,z=(i<3?-.5:.5);const plug=cyl(.35,.1,soil,x,.5,z);pick(plug,'[data-seed="'+i+'"]');
   const seed=new T.Group();seed.position.set(x,.57,z);rig.add(seed);flags.seeds.push(seed);seed.visible=false;
   const stem=cyl(.023,.25,green,0,.12,0,seed);
   for(const s of [-1,1]){const leaf=mesh(new T.SphereGeometry(1,12,8),green,s*.13,.22,0,seed);leaf.scale.set(.18,.045,.1);leaf.rotation.z=s*.4;}
   const ring=mesh(new T.TorusGeometry(.33,.014,6,24),cyan,x,.56,z);ring.rotation.x=Math.PI/2;ring.visible=false;flags.water.push(ring);
  }
  tube([[-2.8,.35,.9],[-3.2,.3,1.3],[-2.6,.2,1.6],[1.8,.2,1.6],[2.7,.35,.9]],.05,orange);
  for(let i=0;i<6;i++)box(.18,.1,.08,metal,-2.6+i*1.03,.3,1.55);
  for(const x of [-3,3])box(.1,2.6,.15,metal,x,1.3,-1.4);
  flags.lamp=new T.Group();rig.add(flags.lamp);box(5.9,.16,.45,dark,0,2.65,-.3,flags.lamp);
  for(let i=0;i<12;i++)box(.28,.025,.25,cyan,-2.6+i*.47,2.55,-.3,flags.lamp);
 }else if(kind==='aim'){
  cyl(.7,.18,ivory,0,.15,0);cyl(.18,1.7,metal,0,1,0);
  flags.dish=new T.Group();flags.dish.position.y=1.6;rig.add(flags.dish);
  const dish=mesh(new T.SphereGeometry(1.05,40,20,0,Math.PI*2,0,Math.PI*.48),ivory,0,0,0,flags.dish);dish.rotation.x=-.6;dish.material.side=T.DoubleSide;
  tube([[0,0,0],[0,1.5,.5]],.035,metal,flags.dish);mesh(new T.SphereGeometry(.12,16,10),orange,0,1.5,.5,flags.dish);
  for(let i=0;i<4;i++){const ring=mesh(new T.TorusGeometry(.4+i*.28,.012,6,40),cyan,0,2+i*.15,.65+i*.25);ring.rotation.x=.8;moving.push(ring);}
 }else{
  box(5,.07,2.7,soil,0,.1,0);
  for(let i=0;i<20;i++){const r=mesh(new T.DodecahedronGeometry(.13+(i%3)*.08,0),orange,Math.sin(i*2.4)*2.3,.25,Math.cos(i*5)*1.1);r.rotation.set(i,i*.4,0);}
  tube([[-2,.24,.8],[-1,.25,1.15],[1,.25,1.15],[2,.24,.8]],.035,cyan);
  for(const x of [-2,2])housing(x,-.2,.6);
 }
 function set(next){state={...state,...next};
  if(flags.wire)flags.wire.visible=Boolean(state.connected);
  if(flags.crack)flags.crack.visible=!state.fixed;
  if(flags.part&&state.removed)flags.part.visible=false;
  if(flags.part&&state.fixed){flags.part.visible=true;flags.part.position.set(0,0,0);flags.part.rotation.z=0;}
  if(flags.patch)flags.patch.visible=kind!=='valves'&&Boolean(state.fixed);
  if(flags.pipe)flags.pipe.visible=Boolean(state.fixed&&state.pipe);
  if(flags.clamps&&state.clamp!==undefined)flags.clamps[state.clamp].material=cyan;
  if(flags.leak)flags.leak.visible=!state.fixed;
  if(flags.seeds)flags.seeds.forEach((s,i)=>{s.visible=i<(state.sown??0);s.scale.setScalar(state.watered?1:.5);});
  if(flags.water)flags.water.forEach(r=>r.visible=Boolean(state.watered));
 }
 const ray=new T.Raycaster(),pointer=new T.Vector2();
 function hit(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(targets,false)[0]?.object;}
 function choose(e){const o=hit(e);if(o){const control=host.querySelector(o.userData.action);if(control&&!control.disabled)control.click();}}
 function hover(e){const o=hit(e),control=o&&host.querySelector(o.userData.action);canvas.style.cursor=control&&!control.disabled?'pointer':'default';}
 canvas.addEventListener('click',choose);canvas.addEventListener('pointermove',hover);
 const observer=new ResizeObserver(()=>{const w=canvas.getBoundingClientRect().width,h=Math.max(240,Math.min(420,w*.72));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe(host);
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function render(t){if(disposed)return;frame=requestAnimationFrame(render);if(t-lastFrame<32)return;lastFrame=t;const time=t*.001;
  if(flags.cartridge)flags.cartridge.position.y=T.MathUtils.damp(flags.cartridge.position.y,state.fixed?1.2:state.selected?1.8:1.2,5,.016);
  if(flags.dish)flags.dish.rotation.y=T.MathUtils.damp(flags.dish.rotation.y,((state.aim??10)-50)*.025,4,.016);
  if(flags.lamp)flags.lamp.position.z=T.MathUtils.damp(flags.lamp.position.z,((state.aim??66)-66)*.025,4,.016);
  if(!reduce){rig.rotation.y=Math.sin(time*.3)*.012;moving.forEach((m,i)=>{if(flags.leak?.children.includes(m))m.position.y=.15+((time*.7+i*.08)%.8);});}
  renderer.render(scene,camera);
 }frame=requestAnimationFrame(render);
 return {set,dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();const geos=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);});geos.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());finish.dispose();env.dispose();renderer.dispose();renderer.forceContextLoss();canvas.removeEventListener('click',choose);canvas.removeEventListener('pointermove',hover);canvas.remove();}};
}
