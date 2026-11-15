// Outpost expansion: science lab with tunnel, ISRU oxygen plant, second solar field and batteries,
// landing zone with the descent stage left behind, cargo yard, lamps, cables and rover tracks.
// All conceptual and artistic; the ISRU unit is inspired by NASA's MOXIE experiment, not a copy of it.
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {buildAscentVehicle} from './ascent-vehicle.js';

export const FLATS=[[-2,-11.5,6],[12,-7,4.5],[-14.5,4.5,6.5],[-11,11.5,3.2],[19,-2,6.5],[5.5,10.8,4],[15,3.5,2],[-18,-12,5.2],[-10,-16.5,4.6],[13.5,12.5,5],[-11.5,-6.5,4.2]];

export function buildExpansion({THREE,scene,panels}){
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const M=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:.6,...o});
  const tex=(w,h,draw,srgb=true)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t};
  const label=(text,size=54,color='#2f383c')=>tex(512,96,x=>{x.fillStyle=color;x.font=`700 ${size}px system-ui,Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,50)});
  const corr=tex(64,8,(x,w)=>{for(let i=0;i<w;i++){const v=128+Math.sin(i/w*Math.PI*8)*120;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(i,0,1,8)}},false);corr.wrapS=corr.wrapT=THREE.RepeatWrapping;corr.repeat.set(10,1);
  const mat={white:M('#e6e4dc',{roughness:.55}),panel:M('#dcdbd2',{roughness:.6,metalness:.08}),metal:M('#aab2b5',{metalness:.85,roughness:.32}),steel:M('#788388',{metalness:.7,roughness:.42}),
    dark:M('#3a4246',{metalness:.45,roughness:.5}),rubber:M('#26292b',{roughness:.92}),gold:M('#caa04a',{metalness:1,roughness:.38}),orange:M('#d8682e',{roughness:.5}),
    win:M('#29586a',{roughness:.08,metalness:.25}),lamp:M('#34525c',{roughness:.2}),concrete:M('#9e978a',{roughness:.95}),track:M('#94593c',{roughness:1}),
    fabric:M('#ecebe3',{roughness:.88,side:THREE.DoubleSide}),cargo:M('#d9d6cc',{metalness:.3,roughness:.5,bumpMap:corr,bumpScale:2.5}),
    cargoO:M('#cf6a35',{metalness:.3,roughness:.5,bumpMap:corr,bumpScale:2.5}),green:M('#5ff08e',{emissive:'#36e070',emissiveIntensity:2}),beacon:M('#e99c59')};
  const decal=t=>new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.4,roughness:.7});
  function add(geo,m,p,x=0,y=0,z=0,rx=0,ry=0,rz=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=o.receiveShadow=true;p.add(o);return o}
  const box=(w,h,d,m,p,x,y,z,r=0)=>add(r?new RoundedBoxGeometry(w,h,d,r<.08?1:2,r):new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
  const cyl=(rt,rb,h,m,p,x,y,z,seg=24)=>add(new THREE.CylinderGeometry(rt,rb,h,seg),m,p,x,y,z);
  function beam(a,b,r,m,p,seg=8){const va=V(...a),vb=V(...b),d=vb.clone().sub(va);const o=add(new THREE.CylinderGeometry(r,r,d.length(),seg),m,p);o.position.copy(va.add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o}
  const tube=(pts,r,m,p)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(a=>V(...a))),Math.max(16,pts.length*10),r,8,false),m,p);
  const plate=(t,w,h,p,x,y,z,ry=0,rx=0)=>add(new THREE.PlaneGeometry(w,h),decal(t),p,x,y,z,rx,ry,0);
  const group=(x,z,name)=>{const g=new THREE.Group();g.position.set(x,0,z);g.name=name;scene.add(g);return g};
  const Y=.045;

  // ---------- LAB-2: horizontal science module north of the habitat, linked by a tunnel ----------
  {const L=group(-2,-11.5,'lab');const R=1.6,len=6.4,cy=2.0;
    for(const x of [-2.2,0,2.2]){box(.5,.32,2.6,mat.steel,L,x,.2,0);for(const z of [-1,1])beam([x,.3,z*.9],[x,cy-R*.75,z*.75],.07,mat.metal,L)}
    add(new THREE.CylinderGeometry(R,R,len,48),mat.white,L,0,cy,0,0,0,Math.PI/2);
    for(const s of [-1,1]){const d=add(new THREE.SphereGeometry(R,40,20,0,Math.PI*2,0,Math.PI/2),mat.white,L,s*len/2,cy,0,0,0,-s*Math.PI/2);d.scale.y=.42}
    for(const x of [-2.4,-.8,.8,2.4])add(new THREE.TorusGeometry(R+.025,.045,8,56),mat.steel,L,x,cy,0,0,Math.PI/2);
    add(new THREE.CylinderGeometry(R+.01,R+.01,.5,48,1,true),mat.orange,L,1.6,cy,0,0,0,Math.PI/2);
    add(new THREE.CylinderGeometry(R+.012,R+.012,1.4,48,1,true,-.9,1.8),mat.gold,L,-1.6,cy,0,0,0,Math.PI/2);
    for(const x of [-2.8,-1.9,-.2,.6,2.0,2.8]){const g=new THREE.Group();g.position.set(x,cy+.35,Math.sqrt(R*R-.35*.35)+.01);g.rotation.x=-.22;L.add(g);add(new THREE.TorusGeometry(.2,.04,10,28),mat.metal,g);add(new THREE.CircleGeometry(.19,28),mat.win,g,0,0,.01)}
    plate(label('LAB-2  SCIENCE'),1.6,.3,L,-.1,cy-.42,Math.sqrt(R*R-.42*.42)+.02,0,.26);
    // end airlock, glovebox, roof radiator, sample cache
    add(new THREE.CylinderGeometry(.75,.75,1.1,32),mat.panel,L,-len/2-1.05,1.55,0,0,0,Math.PI/2);add(new THREE.CircleGeometry(.5,32),mat.dark,L,-len/2-1.61,1.55,0,0,-Math.PI/2,0);add(new THREE.TorusGeometry(.52,.05,8,32),mat.metal,L,-len/2-1.62,1.55,0,0,Math.PI/2,0);
    // sealed sample transfer port: samples pass in through a small airlock, nobody reaches outside with gloves
    box(1.2,.9,.7,mat.panel,L,2.4,.75,1.75,.05);add(new THREE.CylinderGeometry(.26,.26,.08,28),mat.steel,L,2.4,.85,2.12,Math.PI/2);add(new THREE.CircleGeometry(.2,28),mat.dark,L,2.4,.85,2.165);add(new THREE.TorusGeometry(.13,.02,6,20),mat.metal,L,2.4,.85,2.18);plate(label('SAMPLE PORT',44),.9,.16,L,2.4,1.3,2.105);
    for(const x of [-2,0,2])beam([x,cy+R-.05,0],[x,cy+R+.45,0],.035,mat.metal,L);box(5,.05,1.4,mat.panel,L,0,cy+R+.48,0);for(let i=0;i<20;i++)box(.03,.03,1.3,mat.steel,L,-2.4+i*.25,cy+R+.52,0);
    beam([2.6,cy+R,-.4],[2.6,cy+R+1.4,-.4],.012,mat.metal,L);
    for(let i=0;i<4;i++)cyl(.09,.09,.32,mat.metal,L,-1.2+i*.28,.2,1.85,14);
    // tunnel to the habitat
    const T=group(-2,-7.55,'lab-tunnel');add(new THREE.CylinderGeometry(.62,.62,5.3,32,1,true),mat.fabric,T,0,1.25,0,Math.PI/2);
    for(let i=0;i<7;i++)add(new THREE.TorusGeometry(.64,.045,10,40),mat.steel,T,0,1.25,-2.4+i*.8);
    for(const z of [-1.6,0,1.6])for(const s of [-1,1])beam([0,.65,z],[s*.5,.05,z],.035,mat.metal,T);}

  // ---------- ISRU oxygen plant (CO2 in, O2 out) ----------
  {const I=group(12,-7,'isru');box(6,.12,5,mat.concrete,I,0,.06,0);
    box(1.9,1.4,1.3,mat.panel,I,-1.4,.82,-.6,.06);for(let i=0;i<8;i++)box(.04,.03,1.0,mat.dark,I,-2.37,.45+i*.11,-.6);box(.42,.42,.42,mat.gold,I,-1.4,1.74,-.6,.04);
    add(new THREE.ConeGeometry(.35,.6,24,1,true),mat.steel,I,-2.6,1.6,.5,Math.PI);cyl(.12,.12,1.2,mat.steel,I,-2.6,.75,.5,14);plate(label('CO2 INTAKE',46),.8,.15,I,-2.6,.25,.95);
    cyl(.38,.38,1.0,mat.steel,I,.2,.6,-1.5,24);for(let k=0;k<6;k++)add(new THREE.TorusGeometry(.39,.02,6,24),mat.dark,I,.2,.2+k*.16,-1.5,Math.PI/2);
    for(const z of [-.2,.75,1.7]){add(new THREE.CylinderGeometry(.45,.45,2.6,28),mat.white,I,1.2,.85,z,0,0,Math.PI/2);for(const s of [-1,1])add(new THREE.SphereGeometry(.45,24,12,0,Math.PI*2,0,Math.PI/2),mat.white,I,1.2+s*1.3,.85,z,0,0,-s*Math.PI/2);
      for(const x of [.3,2.1]){box(.15,.4,.9,mat.steel,I,x,.3,z);}tube([[2.5,.85,z],[2.8,1.1,z],[2.8,1.4,.75]],.03,mat.metal,I)}
    tube([[-.45,1.1,-.6],[.1,1.3,-.5],[.2,1.1,-1.5]],.04,mat.metal,I);tube([[.2,1.1,-1.5],[.5,1.4,-.6],[1.2,1.4,-.2]],.04,mat.gold,I);
    box(1.6,1.2,.05,mat.panel,I,-1.2,1.4,1.9);for(let i=0;i<10;i++)box(.03,1.1,.07,mat.steel,I,-1.9+i*.155,1.4,1.95);for(const x of [-1.8,-.6])beam([x,.12,1.85],[x,.8,1.9],.04,mat.metal,I);
    plate(label('ISRU  O2  PLANT'),1.4,.26,I,-1.4,1.25,.06+.0);
    [mat.green,mat.green,mat.beacon].forEach((m,i)=>add(new THREE.SphereGeometry(.03,8,6),m,I,-1.9+i*.12,1.3,.07));
    tube([[-2.4,.08,-1.9],[-5,.08,-1],[-8.5,.08,1.6],[-9.5,.08,4.2]],.05,mat.rubber,I);}

  // ---------- second solar field and battery bank ----------
  if(panels)for(const [x,z] of [[-14.5,1.4],[-14.5,6.6]]){const c=panels.clone(true);c.position.set(x,0,z);c.name='solar-field-2';scene.add(c)}
  {const B=group(-11,11.5,'batteries');box(5.2,.12,2.6,mat.concrete,B,0,.06,0);
    for(const x of [-1.6,0,1.6]){box(1.4,1.3,1.5,mat.panel,B,x,.78,0,.05);for(let i=0;i<6;i++)box(1.0,.03,.03,mat.dark,B,x,.4+i*.14,.76);plate(label('BATT',60),.5,.1,B,x,1.25,.76);add(new THREE.SphereGeometry(.03,8,6),mat.green,B,x+.5,1.25,.77)}
    for(const x of [-1.6,0,1.6])box(1.0,.12,.8,mat.steel,B,x,1.5,0);tube([[2.3,.4,.3],[4,.08,-.5],[6.2,.08,-3.2],[9,.08,-4.4]],.05,mat.rubber,B);tube([[-2.3,.4,-.3],[-3.2,.08,-1.6],[-3.6,.08,-3.4]],.05,mat.rubber,B);}

  // ---------- landing zone with the descent stage that stayed behind ----------
  {const P=group(19,-2,'landing-zone');
    const mark=tex(1024,1024,(x,w)=>{x.fillStyle='#7d786f';x.fillRect(0,0,w,w);const c=w/2;x.strokeStyle='#e0b23e';x.lineWidth=26;x.beginPath();x.arc(c,c,w*.42,0,7);x.stroke();x.lineWidth=12;x.setLineDash([60,40]);x.beginPath();x.arc(c,c,w*.3,0,7);x.stroke();x.setLineDash([]);x.fillStyle='#d9d4c8';x.font='800 120px system-ui,Arial';x.textAlign='center';x.fillText('LZ-1',c,c+w*.2);for(let i=0;i<2600;i++){x.fillStyle=`rgba(40,30,25,${Math.random()*.25})`;x.fillRect(Math.random()*w,Math.random()*w,3,3)}});
    const pad=add(new THREE.CylinderGeometry(4.5,4.6,.14,64),[mat.concrete,M('#ffffff',{map:mark,roughness:.9}),mat.concrete],P,0,.07,0);
    const scorch=tex(256,256,(x,w)=>{const g=x.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);g.addColorStop(0,'rgba(20,14,10,.85)');g.addColorStop(.6,'rgba(40,26,18,.4)');g.addColorStop(1,'rgba(40,26,18,0)');x.fillStyle=g;x.fillRect(0,0,w,w)});
    add(new THREE.PlaneGeometry(6,6),new THREE.MeshStandardMaterial({map:scorch,transparent:true,depthWrite:false,roughness:1}),P,0,.15,0,-Math.PI/2).castShadow=false;
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;box(.2,.12,.2,mat.steel,P,Math.cos(a)*4.75,.08,Math.sin(a)*4.75);add(new THREE.BoxGeometry(.12,.05,.12),mat.lamp,P,Math.cos(a)*4.75,.16,Math.sin(a)*4.75)}
    const berm=add(new THREE.TorusGeometry(6.1,.7,10,48,Math.PI*.9),M('#a3694a',{roughness:1}),P,0,0,0,Math.PI/2,0,Math.PI*.55);berm.scale.z=.55;
    const av=buildAscentVehicle(THREE),ds=av.getObjectByName('DescentStage');const dim=new Map();ds.traverse(o=>{if(o.isMesh&&o.material){if(!dim.has(o.material)){const m=o.material.clone();m.color.multiplyScalar(.82);dim.set(o.material,m)}o.material=dim.get(o.material)}});ds.position.y=.14;ds.rotation.y=.4;P.add(ds);
    plate(label('ZARYA  AV-1  DESCENT STAGE',40),2.2,.2,P,0,.155,3.6,0,-Math.PI/2);
    // relay mast
    const Rm=group(15,3.5,'relay');cyl(.5,.55,.15,mat.concrete,Rm,0,.08,0);beam([0,.1,0],[0,3.2,0],.06,mat.metal,Rm);for(const a of [0,2.1,4.2])beam([0,2.2,0],[Math.cos(a)*1.1,.1,Math.sin(a)*1.1],.015,mat.steel,Rm);
    const d=add(new THREE.SphereGeometry(.55,24,12,0,Math.PI*2,0,Math.PI/2),M('#ece9df',{side:THREE.DoubleSide}),Rm,0,3.1,0,-.9,-.6,0);d.scale.y=.35;add(new THREE.SphereGeometry(.06,10,8),mat.beacon,Rm,0,3.3,0);}

  // ---------- cargo yard ----------
  {const C=group(5.5,10.8,'cargo');box(7,.1,4.6,mat.concrete,C,0,.05,0);
    const crate=(m,x,y,z,ry,t)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;C.add(g);box(2.4,1.2,1.2,m,g,0,.6,0,.06);for(const s of [-1,1])box(.08,1.22,1.22,mat.steel,g,s*1.18,.6,0);plate(label(t,50),.9,.17,g,0,.75,.61);return g};
    crate(mat.cargo,-1.8,.1,-.9,0,'CARGO 01');crate(mat.cargoO,-1.8,1.32,-.9,.04,'CARGO 02');crate(mat.cargo,1.2,.1,-1.1,.08,'FOOD RESERVE');crate(mat.cargoO,1.6,.1,.9,-.3,'SPARES');
    const cart=new THREE.Group();cart.position.set(-1.4,0,1.3);cart.rotation.y=.5;C.add(cart);box(1.6,.12,.9,mat.steel,cart,0,.45,0);for(const x of [-.6,.6])for(const z of [-.5,.5])add(new THREE.CylinderGeometry(.2,.2,.14,18),mat.rubber,cart,x,.2,z,Math.PI/2);
    box(.5,.4,.5,M('#b89a6a',{roughness:.85}),cart,-.3,.72,0,.03);box(.4,.3,.4,M('#b89a6a',{roughness:.85}),cart,.35,.67,.1,.03);beam([.8,.5,0],[1.2,1.0,0],.03,mat.metal,cart);}

  // ---------- FSP-1: fission surface power unit (concept after NASA's Fission Surface Power project) ----------
  // Solar power collapses in dust storms; a small reactor keeps the base alive. It sits away from the habitat,
  // half behind a regolith berm, with a keep-out fence and radiators that shed its waste heat.
  {const R=group(-18,-12,'fission');box(5,.12,5,mat.concrete,R,0,.06,0);
    const berm=add(new THREE.TorusGeometry(2.2,.8,10,40,Math.PI*1.25),M('#a3694a',{roughness:1}),R,0,0,0,Math.PI/2,0,-Math.PI*.15);berm.scale.z=.6;
    cyl(.55,.6,1.0,mat.gold,R,0,.55,0,32);cyl(.62,.62,.12,mat.steel,R,0,1.08,0,32);
    beam([0,1.1,0],[0,4.8,0],.13,mat.steel,R);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2,g=new THREE.Group();g.position.set(0,3.3,0);g.rotation.y=a;R.add(g);box(.03,2.6,1.25,mat.white,g,0,0,.72);for(let k=0;k<5;k++)box(.035,2.5,.02,mat.steel,g,0,0,.2+k*.25)}
    cyl(.22,.22,.18,mat.steel,R,0,4.85,0,20);add(new THREE.SphereGeometry(.05,10,8),mat.beacon,R,0,5.0,0);
    box(1.1,.8,.8,mat.panel,R,1.9,.5,1.2,.05);plate(label('FSP-1',60),.6,.13,R,1.9,.75,1.61);
    const tref=tex(256,256,(x,w)=>{x.fillStyle='#f0c23d';x.fillRect(0,0,w,w);x.fillStyle='#1d1f20';const c=w/2;x.beginPath();x.arc(c,c,18,0,7);x.fill();for(let k=0;k<3;k++){const q=-Math.PI/2+k*Math.PI*2/3;x.beginPath();x.moveTo(c+Math.cos(q-.52)*30,c+Math.sin(q-.52)*30);x.arc(c,c,92,q-.52,q+.52);x.lineTo(c+Math.cos(q+.52)*30,c+Math.sin(q+.52)*30);x.arc(c,c,30,q+.52,q-.52,true);x.fill()}});
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2,x=Math.cos(a)*4.4,z=Math.sin(a)*4.4;beam([x,.05,z],[x,.9,z],.035,mat.orange,R);if(i%2===0){const b=(i+2)/14*Math.PI*2;beam([x,.8,z],[Math.cos(b)*4.4,.8,Math.sin(b)*4.4],.012,mat.orange,R)}}
    add(new THREE.PlaneGeometry(.5,.5),decal(tref),R,3.2,.9,3.05,0,-.8,0);beam([3.05,.05,3.2],[3.05,.7,3.2],.03,mat.metal,R);
    tube([[2.4,.08,1.4],[7,.08,4.5],[12.5,.08,7.5],[14.5,.08,9.5]],.05,mat.rubber,R);}

  // ---------- water-ice extraction (concept after the Rodwell, studied by NASA for Mars ice deposits) ----------
  // A heated drill melts buried ice and pumps the water up; a small hopper also bakes water out of regolith.
  {const W2=group(-10,-16.5,'water-ice');box(6,.12,5,mat.concrete,W2,0,.06,0);
    const legs=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,z])=>[x*.7,z*.7]);
    for(const [x,z] of legs)beam([x*1.5,.1,z*1.5],[x*.35,4.2,z*.35],.06,mat.orange,W2);
    for(let k=1;k<5;k++){const y=k*.85,f=1.5-(1.15*y/4.2);for(let i=0;i<4;i++){const [x1,z1]=legs[i],[x2,z2]=legs[(i+1)%4];beam([x1*f,y,z1*f],[x2*f,y,z2*f],.025,mat.steel,W2)}}
    box(.6,.5,.6,mat.panel,W2,0,4.4,0,.05);cyl(.09,.09,4.6,mat.metal,W2,0,1.9,0,14);cyl(.3,.3,.18,mat.dark,W2,0,.15,0,24);
    tube([[0,3.9,.3],[.8,2.2,1.4],[1.6,.9,1.6]],.05,mat.gold,W2);
    box(1.6,1.1,1.2,mat.panel,W2,2.0,.65,.9,.06);plate(label('H2O  ICE  WELL',46),1.1,.18,W2,2.0,1.05,1.51);
    add(new THREE.CylinderGeometry(.55,.55,2.4,28),M('#efeee6',{roughness:.95}),W2,-1.9,.75,1.4,0,0,Math.PI/2);for(const x of [-2.8,-1.0])box(.15,.5,1.0,mat.steel,W2,x,.3,1.4);
    add(new THREE.ConeGeometry(.7,.9,24,1,true),mat.steel,W2,1.9,1.7,-1.2,Math.PI);cyl(.5,.55,.9,mat.panel,W2,1.9,.55,-1.2,24);beam([1.4,.2,-.6],[2.4,.2,-.6],.04,mat.metal,W2);
    tube([[1.2,.6,.9],[-.6,.5,1.2],[-1.0,.75,1.4]],.04,mat.metal,W2);}

  // ---------- rover garage and charging dock (pressurized rover after NASA's SEV concept) ----------
  // The crew rover docks its rear suitports to the base so astronauts step into suits without an airlock cycle.
  {const G=group(13.5,12.5,'rover-garage');box(6.4,.12,5.4,mat.concrete,G,0,.06,0);
    // half-cylinder lying along x: rotating about z maps the angle range 0..π to the upper half
    add(new THREE.CylinderGeometry(1.9,1.9,4.6,40,1,true,0,Math.PI),M('#d6d3c6',{metalness:.3,roughness:.5,side:THREE.DoubleSide}),G,.6,.12,-.8,0,0,Math.PI/2);
    for(const x of [-1.7,.6,2.9])add(new THREE.TorusGeometry(1.92,.05,8,40,Math.PI),mat.steel,G,x,.12,-.8,0,Math.PI/2,0);
    const endWall=new THREE.Shape();endWall.absarc(0,0,1.9,0,Math.PI,false);endWall.lineTo(1.9,0);
    add(new THREE.ShapeGeometry(endWall,24),M('#d9d6cc',{roughness:.6,side:THREE.DoubleSide}),G,2.9,.12,-.8,0,Math.PI/2,0);
    // the open end faces the base; the rover is parked half inside, nose out
    const rv=new THREE.Group();rv.position.set(-1.3,0,-.8);rv.rotation.y=Math.PI/2;G.add(rv);
    box(1.7,1.2,2.8,mat.white,rv,0,1.05,0,.3);box(1.5,.5,.06,mat.win,rv,0,1.35,1.42);box(.06,.35,.9,mat.win,rv,.86,1.35,.6);box(.06,.35,.9,mat.win,rv,-.86,1.35,.6);
    box(1.72,.12,2.82,mat.orange,rv,0,.62,0);
    for(const z of [-1.0,0,1.0])for(const x of [-.95,.95]){add(new THREE.CylinderGeometry(.33,.33,.26,20),mat.rubber,rv,x,.36,z,0,0,Math.PI/2);add(new THREE.CylinderGeometry(.16,.16,.28,14),mat.steel,rv,x,.36,z,0,0,Math.PI/2)}
    for(const x of [-.4,.4]){add(new THREE.CircleGeometry(.24,24),mat.dark,rv,x,1.05,-1.43,0,Math.PI,0);add(new THREE.TorusGeometry(.25,.04,8,24),mat.metal,rv,x,1.05,-1.44)}
    plate(label('SEV-2',60),.6,.14,rv,.87,1.0,-.3,Math.PI/2);beam([.5,1.65,-.8],[.5,2.2,-.8],.015,mat.metal,rv);
    // charging pylon with the cable to the rover
    box(.5,1.4,.4,mat.panel,G,-3,.75,1.4,.05);add(new THREE.SphereGeometry(.03,8,6),mat.green,G,-3,1.3,1.62);
    tube([[-3,.6,1.2],[-2.6,.2,.6],[-1.7,.6,0]],.03,mat.rubber,G);plate(label('CHARGE',52),.4,.09,G,-3,1.15,1.61);}

  // ---------- extra living quarters: two inflatable domes and a two-storey vertical habitat ----------
  const seam=M('#c9cbc4',{roughness:.7});
  function habDome(x,z,ry,name){const H=group(x,z,name);H.rotation.y=ry;const R=2.6,Y0=.74,HT=2.35;
    const prof=t=>{const a=t*Math.PI/2;return [R*Math.pow(Math.cos(a),.72),Y0+HT*Math.sin(a)]};
    cyl(R+.28,R+.28,.2,mat.steel,H,0,.46,0,8);cyl(R+.16,R+.24,.34,mat.dark,H,0,.2,0,8);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8,px=Math.cos(a)*(R+.02),pz=Math.sin(a)*(R+.02);cyl(.055,.065,.38,mat.metal,H,px,.19,pz,10);cyl(.18,.2,.05,mat.dark,H,px,.03,pz,14)}
    const pts=[];for(let i=0;i<=36;i++){const [r,y]=prof(i/36);pts.push(new THREE.Vector2(Math.max(r,.001),y))}
    add(new THREE.LatheGeometry(pts,80),mat.fabric,H);add(new THREE.TorusGeometry(R,.18,14,80),mat.fabric,H,0,Y0+.02,0,Math.PI/2);
    for(let k=0;k<12;k++){const a=k/12*Math.PI*2,line=[];for(let i=0;i<=20;i++){const [r,y]=prof(i/20*.96);line.push([Math.cos(a)*r*1.004,y,Math.sin(a)*r*1.004])}tube(line,.016,seam,H)}
    for(const t of [.3,.6]){const [r,y]=prof(t);add(new THREE.TorusGeometry(r*1.004,.025,8,80),seam,H,0,y,0,Math.PI/2)}
    const top=Y0+HT;cyl(.48,.54,.18,mat.metal,H,0,top+.02,0,28);beam([0,top+.1,0],[0,top+.9,0],.025,mat.metal,H);add(new THREE.SphereGeometry(.06,12,8),mat.beacon,H,0,top+.93,0);
    for(const phi of [.6,2.0,3.6,5.0]){const t=.3,[r,y]=prof(t),[r2,y2]=prof(t+.01),nr=y2-y,ny=-(r2-r),l=Math.hypot(nr,ny);const n=V(Math.cos(phi)*nr/l,ny/l,Math.sin(phi)*nr/l);
      const g=new THREE.Group();g.position.set(Math.cos(phi)*r,y,Math.sin(phi)*r);g.quaternion.setFromUnitVectors(V(0,0,1),n);H.add(g);add(new THREE.TorusGeometry(.3,.055,10,32),mat.metal,g,0,0,.02);add(new THREE.CircleGeometry(.28,32),mat.win,g,0,0,.03)}
    // airlock facing local +z
    box(1.6,1.75,1.1,mat.panel,H,0,1.15,R+.25,.1);box(1.66,.1,1.14,mat.steel,H,0,.28,R+.25);
    box(.9,1.3,.1,mat.steel,H,0,1.02,R+.82,.04);add(new THREE.CircleGeometry(.14,24),mat.win,H,0,1.35,R+.875);add(new THREE.TorusGeometry(.11,.018,8,24),mat.metal,H,0,.9,R+.885);
    for(const sx of [-.5,.5])box(.07,1.38,.02,mat.orange,H,sx,1.02,R+.875);box(.42,.09,.16,mat.steel,H,0,1.86,R+.86);add(new THREE.BoxGeometry(.34,.035,.12),mat.lamp,H,0,1.81,R+.89);
    box(.95,.1,.34,mat.steel,H,0,.2,R+1.05);
    plate(label(name.toUpperCase().replace('-',' - '),56),.9,.17,H,.81,1.6,R+.25,Math.PI/2);
    // radiator on the back
    const rad=new THREE.Group();rad.position.set(0,1.2,-R-.5);H.add(rad);box(1.6,1.1,.05,mat.panel,rad,0,0,0);for(let i=0;i<10;i++)box(.03,1.0,.07,seam,rad,-.68+i*.15,0,.04);beam([0,-.55,0],[0,-1.18,.3],.04,mat.metal,rad);
    return H}
  function tunnel(a,b,y=1.25){const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);const T=new THREE.Group();T.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);T.rotation.y=Math.atan2(dx,dz);T.name='tunnel';scene.add(T);
    add(new THREE.CylinderGeometry(.6,.6,len,28,1,true),mat.fabric,T,0,y,0,Math.PI/2);
    const n=Math.max(2,Math.round(len/.8));for(let i=0;i<=n;i++)add(new THREE.TorusGeometry(.62,.045,8,32),mat.steel,T,0,y,-len/2+i*len/n);
    for(let i=1;i<n;i+=2)for(const s2 of [-1,1])beam([0,y-.6,-len/2+i*len/n],[s2*.5,.05,-len/2+i*len/n],.032,mat.metal,T)}
  habDome(-11.5,-6.5,Math.PI*.15,'hab-3');tunnel([-9.1,-5.9],[-4.6,-3.9]);
  // ---------- lamps, tracks, cables ----------
  for(const [x,z] of [[1.6,2.7],[-5.3,2.7],[8.6,1.4],[3.4,5.4],[12.4,1.2],[15.6,-3.6],[-11.2,3.2],[9.2,-5.2],[-5.2,-8.6],[1.4,-8.6]]){const g=group(x,z,'lamp');box(.3,.06,.3,mat.steel,g,0,.05,0);beam([0,.05,0],[0,2.3,0],.04,mat.metal,g);box(.42,.08,.2,mat.steel,g,.12,2.32,0);add(new THREE.BoxGeometry(.32,.03,.14),mat.lamp,g,.12,2.27,0)}
  const trk=(a,b,w=.9)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz);const o=add(new THREE.BoxGeometry(w,.02,l),mat.track,scene,(a[0]+b[0])/2,Y+.012,(a[1]+b[1])/2,0,Math.atan2(dx,dz),0);o.castShadow=false;o.userData.noDust=true};
  trk([8.5,2.4],[14.6,-1.4],1.1);trk([8,-3.6],[10,-5.6]);trk([5,3],[5,8.4]);trk([-6,2.4],[-11.5,3]);trk([-2,-5.4],[-2,-8.6],.6);trk([9,5.5],[11.4,11.2],1.1);trk([-5.5,-9.5],[-8.5,-14.5]);
  tube([[3.3,.08,4],[4.5,.08,8.4]],.04,mat.rubber,scene);
}
