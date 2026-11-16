// Visual reconstruction from the film still of Hermes, under the mission name Sunkar.
// The local +X end is the bow. Lengths are visual proportions, not survey dimensions.
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { batchStatic } from './batch.js';

export function buildSunkar(T) {
  const ship = new T.Group();
  ship.name = 'Sunkar';
  const wheel = new T.Group();
  wheel.position.x = -.64;
  ship.add(wheel);
  const material = (color, roughness, metalness=0) => new T.MeshStandardMaterial({color, roughness, metalness});
  const shell=material('#d5d5c9',.63,.18), tile=material('#eeede1',.72,.06);
  const frame=material('#a9aaa4',.42,.45), shadow=material('#364047',.6,.32);
  const gasket=material('#727670',.7,.1), copper=material('#ac7b53',.58,.32);
  const window=material('#1a3041',.16,.53);
  window.emissive.setHex(0x101d24);
  const blue=new T.MeshBasicMaterial({color:'#b0d7ef'});
  // Raised seams, rivet lines and occasional service panels on the pressure hull.
  const hullCanvas=document.createElement('canvas');
  hullCanvas.width=512;hullCanvas.height=256;
  const hx=hullCanvas.getContext('2d');
  for(let row=0;row<4;row++)for(let col=0;col<8;col++){
    const x=col*64,y=row*64, value=222+(row*5+col*7)%23;
    hx.fillStyle='rgb('+value+','+(value-1)+','+(value-4)+')';
    hx.fillRect(x,y,64,64);
    hx.strokeStyle='#a6a9a5';hx.strokeRect(x+1,y+1,62,62);
    hx.fillStyle='#939b9c';
    for(let i=0;i<5;i++)hx.fillRect(x+5+i*12,y+4,2,2);
    if((row+col)%3===0){
      hx.fillStyle='#b8bfbd'; hx.fillRect(x+30,y+36,22,13);
      hx.fillStyle='#566168'; hx.fillRect(x+33,y+39,15,2);
    }
  }
  const skin=new T.CanvasTexture(hullCanvas);
  skin.colorSpace=T.SRGBColorSpace; skin.anisotropy=4;
  shell.map=skin;tile.map=skin;
  const cabinGeometry=new RoundedBoxGeometry(1.02,.59,.55,2,.10);
  const cabinGlass=material('#4f6060',.24,.22);
  cabinGlass.emissive.setHex(0x755637);
  cabinGlass.emissiveIntensity=.58;
  const cube=new T.BoxGeometry();
  const rod=new T.CylinderGeometry(1,1,1,8);
  const sphere=new T.SphereGeometry(1,24,14);
  const xAxis=new T.Vector3(1,0,0), up=new T.Vector3(0,1,0);
  function mesh(parent, geo, mat, x,y,z) {
    const part=new T.Mesh(geo,mat);
    part.position.set(x,y,z);
    parent.add(part);
    return part;
  }
  function box(parent,mat,x,y,z,l,h,w) {
    const part=mesh(parent,cube,mat,x,y,z);
    part.scale.set(l,h,w);
    return part;
  }
  function beam(parent,mat,a,b,r) {
    const start=new T.Vector3(...a), delta=new T.Vector3(...b).sub(start);
    const part=mesh(parent,rod,mat,0,0,0);
    part.position.copy(start).addScaledVector(delta,.5);
    part.scale.set(r,delta.length(),r);
    part.quaternion.setFromUnitVectors(up,delta.normalize());
  }
  function drum(parent,mat,x,y,z,len,front,back,sides=40) {
    const part=mesh(parent,new T.CylinderGeometry(front,back,len,sides),mat,x,y,z);
    part.rotation.z=-Math.PI/2;
    return part;
  }
  function radial(parent,angle,x=0) {
    const part=new T.Group();
    part.position.x=x;part.rotation.x=angle;parent.add(part);return part;
  }
  const polar=(x,r,a)=>[x,r*Math.cos(a),r*Math.sin(a)];

  // Nose lock and narrow connecting neck, then the broad faceted flight deck.
  drum(ship,shell,6.49,0,0,1.18,.335,.35);
  drum(ship,frame,7.13,0,0,.15,.22,.335);
  drum(ship,shadow,7.22,0,0,.04,.174,.174);
  drum(ship,shell,5.65,0,0,.57,.25,.255);
  for(const x of [5.42,5.86])drum(ship,gasket,x,0,0,.056,.267,.267);
  drum(ship,tile,5.11,0,0,.55,.25,.55,12);
  drum(ship,shell,4.38,0,0,.94,.55,.57,12);
  drum(ship,shadow,3.83,0,0,.16,.49,.46,12);
  for(const x of [6.02,6.93,4.74,3.97]) {
    const r=x>5?.35:.58;
    drum(ship,frame,x,0,0,.045,r,r);
  }
  for(let i=0;i<12;i++){
    const g=radial(ship,i*Math.PI/6);
    box(g,i%3===0?shadow:tile,4.4,.545,0,.71,.039,.20);
    box(g,shell,6.48,.335,0,.73,.034,.115);
    const pane=box(g,i%3===0?window:shell,5.12,.419,0,.28,.046,.176);
    pane.rotation.z=-.49;
  }
  // Layered fairings, a blue-black visor band and the small servicing arms.
  for(const side of [-1,1]){
    const flank=radial(ship,side*1.2);
    box(flank,shadow,4.34,.552,0,.70,.036,.25);
    for(let k=0;k<3;k++)box(flank,window,4.11+k*.22,.581,0,.18,.037,.181);
    beam(flank,frame,[3.92,.59,-.19],[4.74,.59,-.19],.023);
    box(flank,shell,4.25,.579,.27,.84,.086,.16);
  }
  // Forward docking node with radial ports and the communications dishes.
  // A continuous insulated tunnel runs from the bridge into the rotating joint.
  // The pale skin is the pressure envelope; the external truss aft stays open.
  drum(ship,shell,1.68,0,0,4.16,.335,.335,28);
  drum(ship,tile,1.68,0,0,1.54,.455,.455,20);
  drum(ship,shell,.80,0,0,.22,.455,.335,20);
  drum(ship,shell,2.56,0,0,.22,.335,.455,20);
  for(const x of [-.34,.65,2.73,3.62])drum(ship,gasket,x,0,0,.055,.359,.359,24);
  for(const angle of [0, Math.PI/2, Math.PI, -Math.PI/2]){
    const deck=radial(ship,angle);
    box(deck,shadow,1.67,.448,0,1.15,.035,.14);
    for(const x of [1.27,1.53,1.79,2.05])
      box(deck,cabinGlass,x,.47,0,.186,.017,.09);
  }
  for(let i=0;i<4;i++){
    const port=radial(ship,i*Math.PI/2,2.68);
    box(port,shell,0,.43,0,.39,.56,.37);
    box(port,shadow,0,.73,0,.4,.065,.38);
  }
  for(const side of [-1,1]){
    const g=radial(ship,side*.64,2.52);
    beam(g,frame,[0,.3,0],[-.15,.86,.06],.052);
    const dish=mesh(g,new T.SphereGeometry(.26,24,10,0,Math.PI*2,0,Math.PI/2),shell,-.14,.9,.06);
    dish.scale.y=.29;dish.rotation.z=.45;
    beam(g,frame,[-.3,.92,.06],[-.22,1.13,.06],.017);
  }
  // Open axial truss carrying service pipes and equipment pallets.
  drum(ship,gasket,-2.75,0,0,5.6,.18,.18);
  const railEnd=-5.48, rails=[[.24,.24],[.24,-.24],[-.24,-.24],[-.24,.24]];
  for(let side=0;side<4;side++){
    const [y,z]=rails[side], [ny,nz]=rails[(side+1)%4];
    beam(ship,frame,[railEnd,y,z],[.14,y,z],.035);
    for(let j=0;j<14;j++){
      const x=railEnd+j*.4;
      beam(ship,frame,[x,y,z],[x+.4,ny,nz],.019);
      beam(ship,frame,[x,y,z],[x,ny,nz],.021);
    }
  }

  // Paired polygonal rails and open crossbracing. Four separate hab blocks
  // occupy the rim, leaving space between them to see the stationary spine.
  drum(wheel,tile,0,0,0,.80,.52,.52,32);
  for(const x of [-.36,.36])drum(wheel,gasket,x,0,0,.09,.55,.55,32);
  const radius=1.99, bays=32;
  // A sealed circumferential passage bridges each pair of living quarters.
  // Its centreline follows the wheel and remains inside the external braces.
  const corridor=mesh(wheel,new T.TorusGeometry(radius,.167,10,64),shell,0,0,0);
  corridor.rotation.y=Math.PI/2;
  for(let i=0;i<bays;i++){
    const a=i*2*Math.PI/bays,b=(i+1)*2*Math.PI/bays;
    for(const x of [-.17,.17]){
      beam(wheel,frame,polar(x,radius,a),polar(x,radius,b),.032);
      beam(wheel,tile,polar(x,radius-.16,a),polar(x,radius-.16,b),.023);
      beam(wheel,frame,polar(x,radius,a),polar(x,radius-.16,b),.018);
    }
    beam(wheel,frame,polar(-.17,radius,a),polar(.17,radius,b),.019);
  }
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2+.16;
    const access=radial(wheel,a);
    const spoke=mesh(access,rod,tile,0,1.11,0);
    spoke.scale.set(.173,1.47,.173);
    for(const y of [.55,1.28,1.77]){
      const coupling=mesh(access,rod,gasket,0,y,0);
      coupling.scale.set(.19,.064,.19);
    }
    for(const side of [-1,1]){
      beam(wheel,shell,polar(side*.19,.33,a),polar(side*.18,radius-.13,a+.08),.055);
      beam(wheel,frame,polar(-side*.16,.48,a),polar(side*.16,radius-.15,a+side*.29),.025);
    }
    for(const segment of [-1,0,1]){
      const pod=radial(wheel,a+segment*.254);
      mesh(pod,cabinGeometry,shell,0,radius,0);
      box(pod,tile,0,radius+.30,0,1.02,.07,.49);
      for(const face of [-1,1]){
        box(pod,shadow,face*.513,radius+.02,0,.018,.159,.42);
        for(const z of [-.106,.106])box(pod,cabinGlass,face*.527,radius+.02,z,.018,.096,.144);
      }
      for(const x of [-.40,.40])box(pod,frame,x,radius+.35,0,.027,.026,.36);
    }
  }

  // Copper photovoltaic blankets, each divided into cell strings and two leaves.
  const canvas=document.createElement('canvas');
  canvas.width=128;canvas.height=512;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#9d8877';ctx.fillRect(0,0,128,512);
  for(let row=0;row<32;row++) for(let col=0;col<6;col++){
    const k=(row*7+col*13)%17;
    ctx.fillStyle='rgb('+(128+k)+','+(77+k)+','+(47+k)+')';
    ctx.fillRect(col*21.3+1,row*16+1,20.1,14.9);
  }
  const cells=new T.CanvasTexture(canvas);
  cells.colorSpace=T.SRGBColorSpace;cells.anisotropy=4;
  const pv=new T.MeshStandardMaterial({map:cells,color:0xffffff,roughness:.51,metalness:.15,emissive:0x402015,emissiveIntensity:.22,side:T.DoubleSide});
  const leaf=new T.PlaneGeometry(.56,2.91);
  for(const x of [.64,-2.91,-4.32])for(const side of [-1,1]){
    const wing=radial(ship,side===1?.25:Math.PI+.25,x);
    beam(wing,frame,[0,.23,0],[0,3.69,0],.036);
    for(const dx of [-.31,.31]){
      mesh(wing,leaf,pv,dx,2.19,0);
      for(const end of [.72,3.66])box(wing,frame,dx,end,0,.58,.031,.038);
    }
  }
  // Aft thermal fins, tanks in warm insulation and the dark engine bell.
  for(const x of [-4.72,-5.17])for(let i=0;i<4;i++){
    const g=radial(ship,Math.PI/4+i*Math.PI/2,x);
    const tank=mesh(g,sphere,copper,0,.45,0);tank.scale.set(.31,.27,.27);
    beam(g,shadow,[-.19,.28,0],[.19,.28,0],.044);
  }
  for(const x of [-3.65,-4.16])for(const side of [-1,1]){
    const fin=radial(ship,side*Math.PI/2,x);
    box(fin,gasket,0,.85,0,.34,1.22,.055);
    for(let j=0;j<7;j++)box(fin,frame,0,.33+j*.165,.035,.34,.025,.025);
  }
  drum(ship,frame,-5.68,0,0,.48,.27,.37);
  drum(ship,shadow,-6.07,0,0,.38,.27,.44);
  drum(ship,gasket,-6.28,0,0,.05,.43,.43);
  drum(ship,blue,-6.315,0,0,.022,.286,.286);
  const plume=mesh(ship,new T.ConeGeometry(.30,1.42,32,1,true),new T.MeshBasicMaterial({
    color:'#6d9dff',transparent:true,opacity:.14,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide
  }),-7.03,0,0);
  plume.quaternion.setFromUnitVectors(up,xAxis.clone().negate());
  batchStatic(T,wheel);
  batchStatic(T,ship,obj=>obj===wheel||obj===plume);
  // Low emissive lift preserves local colours in a strongly backlit inspection.
  for (const m of [shell,tile,frame,gasket,copper]) {
    m.emissive.copy(m.color);
    m.emissiveIntensity=.17;
  }
  return {ship, animate(time,reduced){
    if(!reduced)wheel.rotation.x=(time*.00016)%(Math.PI*2);
    plume.material.opacity=reduced?.13:.13+.021*Math.sin(time*.003);
  }};
}
