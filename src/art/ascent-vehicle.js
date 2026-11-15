// Fictional two-stage ascent vehicle for the evacuation cutscene. Conceptual design, ~9 m tall
// (1 unit ≈ 1 m). Not a model of any real NASA vehicle.
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function buildAscentVehicle(THREE){
  const root=new THREE.Group();root.name='AscentVehicle';
  const M=(name,color,o={})=>{const m=new THREE.MeshStandardMaterial({color,roughness:.55,...o});m.name=name;return m};
  const white=M('hull_white','#e9e7df',{roughness:.5}),steel=M('steel','#7c868a',{metalness:.75,roughness:.38}),metal=M('metal_bright','#b4bcbf',{metalness:.9,roughness:.28}),
    dark=M('dark','#33393c',{metalness:.4,roughness:.55}),gold=M('mli_gold','#cfa24c',{metalness:1,roughness:.42}),orange=M('accent_orange','#d8682e'),
    win=M('window','#29586a',{metalness:.25,roughness:.08}),bell=M('engine_bell','#4a4542',{metalness:.85,roughness:.35,side:THREE.DoubleSide});
  const add=(geo,m,p,x=0,y=0,z=0,rx=0,ry=0,rz=0,name)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=o.receiveShadow=true;if(name)o.name=name;p.add(o);return o};
  const beam=(a,b,r,m,p)=>{const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),d=vb.clone().sub(va);const o=add(new THREE.CylinderGeometry(r,r,d.length(),10),m,p);o.position.copy(va.add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o};

  // ---- descent stage (stays on Mars) ----
  const descent=new THREE.Group();descent.name='DescentStage';root.add(descent);
  add(new THREE.CylinderGeometry(2.25,2.45,1.1,8),steel,descent,0,1.85,0,0,Math.PI/8);
  // Form foil as shallow creased geometry so highlights follow the facets at
  // every camera angle. Reuse one blanket across the eight service bays.
  const blanket=new THREE.PlaneGeometry(1.63,.84,14,8);
  const points=blanket.attributes.position;
  for(let i=0;i<points.count;i++){
    const x=points.getX(i), y=points.getY(i);
    const edge=Math.max(0,(1-Math.pow(x/.815,4))*(1-Math.pow(y/.42,4)));
    points.setZ(i,edge*(.04*Math.abs(Math.sin(13*x+9*y))+.035*Math.cos(7*y-4*x)));
  }
  blanket.computeVertexNormals();
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4, bay=new THREE.Group();
    bay.rotation.y=a;descent.add(bay);
    add(blanket,gold,bay,0,1.85,2.28,-.09);
    for(const x of [-.82,.82]) beam([x,1.38,2.32],[x,2.29,2.22],.04,metal,bay);
    add(new THREE.BoxGeometry(1.67,.07,.10),dark,bay,0,2.31,2.22);
  }
  // Separation collar and fastener blocks mark where the upper stage detached.
  add(new THREE.CylinderGeometry(2.3,2.3,.1,8),metal,descent,0,2.45,0,0,Math.PI/8);
  add(new THREE.CylinderGeometry(1.44,1.58,.16,32),dark,descent,0,2.57,0);
  add(new THREE.TorusGeometry(1.44,.075,8,48),metal,descent,0,2.67,0,Math.PI/2);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    add(new RoundedBoxGeometry(.21,.16,.26,1,.025),orange,descent,Math.cos(a)*1.47,2.68,Math.sin(a)*1.47,0,-a);
  }
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,c=Math.cos(a),s=Math.sin(a);
    add(new THREE.SphereGeometry(.62,28,18),white,descent,c*1.55,1.85,s*1.55);add(new THREE.TorusGeometry(.63,.035,8,32),steel,descent,c*1.55,1.85,s*1.55,Math.PI/2);
    const leg=new THREE.Group();leg.name='Leg'+(i+1);descent.add(leg);
    beam([c*2.0,1.7,s*2.0],[c*3.35,.32,s*3.35],.09,metal,leg);beam([c*2.2,2.3,s*2.2],[c*3.25,.5,s*3.25],.06,steel,leg);
    beam([c*1.9+s*.6,1.35,s*1.9-c*.6],[c*3.3,.35,s*3.3],.05,steel,leg);beam([c*1.9-s*.6,1.35,s*1.9+c*.6],[c*3.3,.35,s*3.3],.05,steel,leg);
    add(new THREE.CylinderGeometry(.45,.5,.12,24),metal,leg,c*3.38,.08,s*3.38);add(new THREE.CylinderGeometry(.12,.12,.3,12),dark,leg,c*3.38,.28,s*3.38)}
  add(new THREE.CylinderGeometry(.35,.85,1.1,32,1,true),bell,descent,0,.85,0,0,0,0,'DescentEngine');
  // ladder on leg 1
  {const a=Math.PI/4,c=Math.cos(a),s=Math.sin(a),lad=new THREE.Group();lad.name='Ladder';descent.add(lad);
    for(const o of [-.25,.25])beam([c*2.35+s*o,2.4,s*2.35-c*o],[c*3.05+s*o,.35,s*3.05-c*o],.025,metal,lad);
    for(let k=1;k<8;k++){const t=k/8,x=c*(2.35+.7*t),z=s*(2.35+.7*t),y=2.4-2.05*t;beam([x+s*.25,y,z-c*.25],[x-s*.25,y,z+c*.25],.018,metal,lad)}}

  // ---- ascent stage (lifts off) ----
  const ascent=new THREE.Group();ascent.name='AscentStage';root.add(ascent);
  add(new THREE.CylinderGeometry(1.35,1.4,2.7,48),white,ascent,0,3.85,0);
  add(new THREE.CylinderGeometry(1.36,1.36,.22,48),orange,ascent,0,4.75,0);
  for(const y of [2.7,5.18])add(new THREE.TorusGeometry(1.37,.04,8,64),metal,ascent,0,y,0,Math.PI/2);
  add(new THREE.CylinderGeometry(.55,1.35,2.3,48),white,ascent,0,6.35,0);
  add(new THREE.SphereGeometry(.55,32,16,0,Math.PI*2,0,Math.PI/2),white,ascent,0,7.5,0);
  add(new THREE.CylinderGeometry(.18,.18,.5,16),metal,ascent,0,8.0,0);add(new THREE.ConeGeometry(.18,.35,16),metal,ascent,0,8.42,0);
  // crew windows, hatch, docking ring
  for(const a of [-.35,0,.35]){const g=new THREE.Group();g.position.set(Math.sin(a)*1.05,6.55,Math.cos(a)*1.05);g.rotation.set(-.33,a,0);ascent.add(g);add(new RoundedBoxGeometry(.34,.24,.05,2,.05),dark,g);add(new THREE.PlaneGeometry(.26,.17),win,g,0,0,.03,0,0,0,'Window')}
  {const g=new THREE.Group();g.position.set(0,3.9,1.39);ascent.add(g);add(new RoundedBoxGeometry(.95,1.4,.08,3,.12),steel,g,0,0,0,0,0,0,'Hatch');add(new THREE.TorusGeometry(.13,.02,8,24),metal,g,0,-.1,.06);add(new THREE.CircleGeometry(.14,24),win,g,0,.35,.05)}
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,c=Math.cos(a),s=Math.sin(a);const q=new THREE.Group();q.name='RCS'+(i+1);q.position.set(c*1.42,5.6,s*1.42);q.rotation.y=-a+Math.PI/2;ascent.add(q);
    add(new RoundedBoxGeometry(.28,.28,.2,2,.04),steel,q);for(const [x,y,rx,rz] of [[.18,0,0,-Math.PI/2],[-.18,0,0,Math.PI/2],[0,.18,0,0],[0,-.18,Math.PI,0]])add(new THREE.ConeGeometry(.045,.12,10,1,true),bell,q,x,y,0,rx,0,rz)}
  add(new THREE.CylinderGeometry(.45,.8,.9,32,1,true),bell,ascent,0,2.2,0,0,0,0,'AscentEngine');
  // decal: vehicle name
  const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.fillStyle='#2b3134';x.font='700 56px system-ui,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('ZARYA  AV-1',256,50);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const dm=new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.4,roughness:.6});dm.name='decal_name';
  add(new THREE.PlaneGeometry(1.5,.28),dm,ascent,0,4.35,1.42,0,0,0,'NameDecal');
  return root;
}
