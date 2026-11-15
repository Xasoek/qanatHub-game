// Detailed procedural outpost models. Replaces the placeholder building geometry while keeping
// group positions, object IDs and the scientific displays (DONKI, RadLab, Mars Trek).
// Equipment is conceptual: inspired by real habitat practice, not copies of certified hardware.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

export function rebuildBase({THREE,groups,science}){
  const {hab,farm,panels,comms,shelter,shop}=groups;
  const ids=new Map([[hab,'air'],[farm,'farm'],[panels,'panels'],[comms,'comms'],[shelter,'heat'],[shop,'repair']]);
  for(const g of ids.keys())for(const c of [...g.children]){g.remove(c);c.traverse(n=>{n.geometry?.dispose()})}
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);

  // ---------- textures ----------
  function tex(w,h,draw,{srgb=true,repeat}={}){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat)}return t}
  let sd=1234;const rnd=()=>{sd=(Math.imul(sd,1664525)+1013904223)>>>0;return sd/4294967296};
  const noiseTex=tex(128,128,(x,w,h)=>{const d=x.createImageData(w,h);for(let i=0;i<w*h;i++){const v=150+rnd()*90;d.data.set([v,v,v,255],i*4)}x.putImageData(d,0,0)},{srgb:false,repeat:[2,2]});
  const corrugate=tex(64,8,(x,w)=>{for(let i=0;i<w;i++){const v=128+Math.sin(i/w*Math.PI*2*4)*120;x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(i,0,1,8)}},{srgb:false,repeat:[10,1]});
  const hazard=tex(256,32,(x,w,h)=>{x.fillStyle='#e7b23c';x.fillRect(0,0,w,h);x.fillStyle='#24282a';for(let i=-2;i<12;i++){x.beginPath();x.moveTo(i*32,h);x.lineTo(i*32+16,h);x.lineTo(i*32+32,0);x.lineTo(i*32+16,0);x.fill()}},{repeat:[1,1]});
  hazard.wrapS=THREE.RepeatWrapping;
  const pv=tex(512,512,(x,w,h)=>{x.fillStyle='#aeb7bf';x.fillRect(0,0,w,h);const cols=8,rows=6,cw=w/cols,ch=h/rows;
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const X=i*cw+3,Y=j*ch+3,W=cw-6,H=ch-6;const g=x.createLinearGradient(X,Y,X+W,Y+H);g.addColorStop(0,'#1d3768');g.addColorStop(1,'#14284f');x.fillStyle=g;x.beginPath();x.moveTo(X+6,Y);x.lineTo(X+W-6,Y);x.lineTo(X+W,Y+6);x.lineTo(X+W,Y+H-6);x.lineTo(X+W-6,Y+H);x.lineTo(X+6,Y+H);x.lineTo(X,Y+H-6);x.lineTo(X,Y+6);x.fill();
      x.fillStyle='#c4ccd2';for(let b=1;b<4;b++)x.fillRect(X+W*b/4-1,Y,2,H);x.fillStyle='#3a5384';for(let f=1;f<14;f++)x.fillRect(X,Y+H*f/14,W,.6)}});
  const label=(text,{w=512,h=96,color='#2f383c',size=54,bg=null}={})=>tex(w,h,(x)=>{if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h)}x.fillStyle=color;x.font=`700 ${size}px system-ui,Arial`;x.textAlign='center';x.textBaseline='middle';x.fillText(text,w/2,h/2+2)});
  const trefoil=tex(256,256,(x,w)=>{x.fillStyle='#f0c23d';x.fillRect(0,0,w,w);x.strokeStyle='#1d1f20';x.lineWidth=10;x.strokeRect(8,8,w-16,w-16);x.fillStyle='#1d1f20';const c=w/2;x.beginPath();x.arc(c,c,18,0,7);x.fill();for(let k=0;k<3;k++){const a=-Math.PI/2+k*Math.PI*2/3;x.beginPath();x.moveTo(c+Math.cos(a-.52)*30,c+Math.sin(a-.52)*30);x.arc(c,c,92,a-.52,a+.52);x.lineTo(c+Math.cos(a+.52)*30,c+Math.sin(a+.52)*30);x.arc(c,c,30,a+.52,a-.52,true);x.fill()}});
  function screen(lines){const t=tex(512,256,(x,w,h)=>{x.fillStyle='#0f2a33';x.fillRect(0,0,w,h);x.strokeStyle='#3d6e70';x.strokeRect(6,6,w-12,h-12);x.fillStyle='#b4e0cf';x.font='600 25px system-ui,Arial';lines.forEach((l,i)=>x.fillText(l,26,48+i*44))});
    return new THREE.MeshStandardMaterial({color:'#ffffff',map:t,emissive:'#a6d6c4',emissiveMap:t,emissiveIntensity:.35,roughness:.35})}

  // Woven shell with darker lower panels and alternating copper thermal gores.
  const envelope = tex(1024, 512, (ctx, w, h) => {
    for (let panel = 0; panel < 16; panel++) {
      const left = panel * w / 16;
      const copper = panel % 4 === 1;
      const fade = ctx.createLinearGradient(0, 0, 0, h);
      fade.addColorStop(0, copper ? '#e0a172' : '#f2ebd8');
      fade.addColorStop(0.72, copper ? '#bd6541' : '#dfd9c8');
      fade.addColorStop(1, copper ? '#814b3b' : '#aa9482');
      ctx.fillStyle = fade;
      ctx.fillRect(left, 0, w / 16, h);
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(57,47,42,.17)';
    ctx.beginPath();
    for (let x = -h; x < w + h; x += 16) {
      ctx.moveTo(x, 0); ctx.lineTo(x + h, h);
      ctx.moveTo(x, 0); ctx.lineTo(x - h, h);
    }
    ctx.stroke();
  });

  // ---------- materials ----------
  const M=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:.6,...o});
  const mat={
    fabric:M('#ecebe3',{roughness:.88,side:THREE.DoubleSide}),seam:M('#c9cbc4',{roughness:.7}),
    panel:M('#e2e1d8',{roughness:.62,metalness:.08}),concrete:M('#a9a395',{roughness:.95,bumpMap:noiseTex,bumpScale:1.2}),
    metal:M('#aab2b5',{metalness:.85,roughness:.32}),steel:M('#788388',{metalness:.7,roughness:.42}),dark:M('#3d4549',{metalness:.5,roughness:.5}),
    rubber:M('#26292b',{roughness:.92}),orange:M('#d8682e',{roughness:.5}),gold:M('#caa04a',{metalness:1,roughness:.38}),
    win:M('#29586a',{roughness:.08,metalness:.25}),lamp:M('#34525c',{roughness:.2}),hazard:M('#ffffff',{map:hazard,roughness:.6}),
    corr:M('#d6d3c6',{metalness:.35,roughness:.5,bumpMap:corrugate,bumpScale:2.5}),
    glass:new THREE.MeshStandardMaterial({color:'#d5edf2',transparent:true,opacity:.17,roughness:.04,metalness:.1,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.2}),
    pv:new THREE.MeshPhysicalMaterial({map:pv,roughness:.3,metalness:.15,clearcoat:.8,clearcoatRoughness:.12}),
    tray:M('#f1f0ea',{roughness:.5}),led:M('#c6bbc8',{emissive:'#806785',emissiveIntensity:.5,roughness:.4}),
    green:M('#5ff08e',{emissive:'#36e070',emissiveIntensity:2}),amber:M('#ffc15a',{emissive:'#ffad2e',emissiveIntensity:2}),
    beacon:M('#e99c59'),bag:M('#ffffff',{roughness:1,bumpMap:noiseTex,bumpScale:2})};
  const decal=(t)=>new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.4,roughness:.7});

  // ---------- builders ----------
  function add(geo,m,p,x=0,y=0,z=0,rx=0,ry=0,rz=0){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.castShadow=o.receiveShadow=true;p.add(o);return o}
  const box=(w,h,d,m,p,x,y,z,r=0)=>add(r?new RoundedBoxGeometry(w,h,d,r<.08?1:2,r):new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
  const cyl=(rt,rb,h,m,p,x,y,z,seg=24)=>add(new THREE.CylinderGeometry(rt,rb,h,seg),m,p,x,y,z);
  function tube(pts,r,m,p,seg=24){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(a=>V(...a))),seg,r,8,false),m,p)}
  function beam(a,b,r,m,p,seg=8){const va=V(...a),vb=V(...b),d=vb.clone().sub(va);const o=add(new THREE.CylinderGeometry(r,r,d.length(),seg),m,p);o.position.copy(va.add(vb).multiplyScalar(.5));o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o}
  function inst(geo,m,p,list){const o=new THREE.InstancedMesh(geo,m,list.length);const d=new THREE.Object3D();list.forEach((t,i)=>{d.position.set(t[0],t[1],t[2]);d.rotation.set(t[3]||0,t[4]||0,t[5]||0);d.scale.setScalar(t[6]||1);d.updateMatrix();o.setMatrixAt(i,d.matrix)});o.castShadow=o.receiveShadow=true;p.add(o);return o}
  const bolt=new THREE.CylinderGeometry(.03,.03,.03,6);
  const plate=(t,w,h,p,x,y,z,ry=0)=>add(new THREE.PlaneGeometry(w,h),decal(t),p,x,y,z,0,ry,0);

  // ================= HABITAT (inflatable dome on an octagonal deck) =================
  {const H=hab,R=3.0,Y0=.78,HT=2.82;
    const prof=t=>{const a=t*Math.PI/2;return [R*Math.pow(Math.cos(a),.72),Y0+HT*Math.sin(a)]};
    cyl(3.3,3.3,.22,mat.steel,H,0,.48,0,8);cyl(3.18,3.26,.36,mat.dark,H,0,.2,0,8);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8,x=Math.cos(a)*3.02,z=Math.sin(a)*3.02;cyl(.06,.07,.4,mat.metal,H,x,.2,z,10);cyl(.2,.22,.05,mat.dark,H,x,.03,z,16)}
    const pts=[];for(let i=0;i<=40;i++){const [r,y]=prof(i/40);pts.push(new THREE.Vector2(Math.max(r,.001),y))}
    add(new THREE.LatheGeometry(pts,96),M('#ffffff',{map:envelope,roughness:.86}),H);
    // Three reinforced bands follow the slope of the pressure shell.
    for (const level of [.16,.19,.68]) {
      const band = [level, level + .012].map(t => {
        const [r,y] = prof(t);
        return new THREE.Vector2(r * 1.006, y);
      });
      add(new THREE.LatheGeometry(band,96), mat.dark, H);
    }
    add(new THREE.TorusGeometry(R,.2,16,96),mat.fabric,H,0,Y0+.02,0,Math.PI/2);
    for(let k=0;k<16;k++){const a=k/16*Math.PI*2,line=[];for(let i=0;i<=24;i++){const [r,y]=prof(i/24*.96);line.push([Math.cos(a)*r*1.004,y,Math.sin(a)*r*1.004])}tube(line,.017,mat.seam,H,32)}
    for(const t of [.28,.55,.78]){const [r,y]=prof(t);add(new THREE.TorusGeometry(r*1.004,.028,8,96),mat.seam,H,0,y,0,Math.PI/2)}
    const top=Y0+HT;cyl(.6,.66,.2,mat.metal,H,0,top+.02,0,32);cyl(.4,.4,.14,mat.panel,H,0,top+.18,0,32);beam([0,top+.2,0],[0,top+1.1,0],.03,mat.metal,H);add(new THREE.SphereGeometry(.07,14,10),mat.beacon,H,0,top+1.14,0);
    // Eight-sided lookout. The tapered sill sits down inside the shell so it reads
    // as a pressure module, with individual recessed panes and a projecting brow.
    const crownY=top-.14;
    const visorGlass = new THREE.MeshPhysicalMaterial({
      color:'#203f50',metalness:.52,roughness:.16,clearcoat:1,
      emissive:'#367080',emissiveIntensity:.19
    });
    cyl(1.26,1.52,.26,mat.panel,H,0,crownY-.10,0,8);
    cyl(1.23,1.29,.43,visorGlass,H,0,crownY+.22,0,8);
    cyl(1.32,1.35,.095,mat.dark,H,0,crownY+.46,0,8);
    cyl(.82,1.32,.19,mat.panel,H,0,crownY+.59,0,8);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4, x=Math.sin(a), z=Math.cos(a);
      beam([x*1.29,crownY+.015,z*1.29],[x*1.23,crownY+.44,z*1.23],.055,mat.metal,H);
    }
    // Formed ceramic protection around the skirt. Leave clear apertures for
    // the airlock and the connecting passage instead of burying them in plates.
    const ceramic=M('#c8c9b7',{roughness:.72,metalness:.12});
    for(let i=0;i<16;i++){
      if([0,1,4,15].includes(i))continue;
      const a=i*Math.PI/8;
      const carrier=new THREE.Group();
      carrier.rotation.y=a; H.add(carrier);
      const plaque=box(.99,.49,.12,ceramic,carrier,0,1.11,2.99,.04);
      plaque.rotation.x=-.13;
      box(.57,.075,.05,mat.dark,carrier,0,1.1,3.065);
      for(const side of [-1,1]) box(.07,.34,.08,mat.steel,carrier,side*.39,1.11,3.067);
    }
    // portholes, oriented to the dome normal
    for(const phi of [.95,2.25,4.05,5.35]){const t=.3,e=.01,[r,y]=prof(t),[r2,y2]=prof(t+e),nr=y2-y,ny=-(r2-r),l=Math.hypot(nr,ny);const n=V(Math.cos(phi)*nr/l,ny/l,Math.sin(phi)*nr/l);
      const g=new THREE.Group();g.position.set(Math.cos(phi)*r,y,Math.sin(phi)*r);g.quaternion.setFromUnitVectors(V(0,0,1),n);H.add(g);
      add(new THREE.TorusGeometry(.36,.065,12,40),mat.metal,g,0,0,.02);add(new THREE.CircleGeometry(.34,40),mat.win,g,0,0,.03);add(new THREE.TorusGeometry(.42,.03,8,40),mat.seam,g,0,0,0);
      inst(bolt,mat.steel,g,Array.from({length:8},(_,i)=>[Math.cos(i/8*6.283)*.36,Math.sin(i/8*6.283)*.36,.08,Math.PI/2]))}
    // airlock module facing +z
    box(1.9,2.0,1.35,mat.panel,H,0,1.27,3.33,.12);box(1.96,.12,1.4,mat.steel,H,0,.3,3.33);
    box(1.08,1.56,.12,mat.steel,H,0,1.12,4.0,.05);box(.92,1.4,.06,mat.dark,H,0,1.12,4.06,.04);
    add(new THREE.CircleGeometry(.17,32),mat.win,H,0,1.5,4.095);add(new THREE.TorusGeometry(.18,.025,8,32),mat.metal,H,0,1.5,4.1);
    add(new THREE.TorusGeometry(.13,.02,8,28),mat.metal,H,0,.98,4.13);for(let i=0;i<4;i++)beam([0,.98,4.13],[Math.cos(i*1.571)*.13,.98+Math.sin(i*1.571)*.13,4.13],.012,mat.metal,H);
    for(const x of [-.6,.6])add(new THREE.BoxGeometry(.1,1.62,.02),mat.hazard,H,x,1.12,4.01);add(new THREE.BoxGeometry(1.3,.1,.02),mat.hazard,H,0,1.97,4.01);
    box(.5,.11,.2,mat.steel,H,0,2.12,4.05);add(new THREE.BoxGeometry(.42,.04,.14),mat.lamp,H,0,2.06,4.08);
    box(.3,.38,.08,mat.panel,H,.78,1.25,4.05,.02);add(new THREE.PlaneGeometry(.2,.14),screen(['P 101.2 kPa','O2 21%']),H,.78,1.3,4.095);add(new THREE.SphereGeometry(.022,8,6),mat.green,H,.72,1.12,4.1);add(new THREE.SphereGeometry(.022,8,6),mat.amber,H,.84,1.12,4.1);
    box(1.1,.12,.4,mat.steel,H,0,.24,4.22);box(1.1,.12,.32,mat.steel,H,0,.12,4.5);
    for(const x of [-.62,.62])tube([[x,.2,4.62],[x,.85,4.6],[x,1.0,4.25],[x,1.0,4.05]],.025,mat.metal,H,16);
    plate(label('HAB-1  ZARYA'),.95,.18,H,.962,1.75,3.3,Math.PI/2);plate(label('HAB-1  ZARYA'),.95,.18,H,-.962,1.75,3.3,-Math.PI/2);
    // A projecting visor frames the airlock from the overhead camera.
    const visor = box(2.34,.16,1.14,mat.orange,H,0,2.38,3.98,.07);
    visor.rotation.x = -.08;
    for (const side of [-1,1]) {
      beam([side*.91,1.87,3.77],[side*.91,2.32,4.41],.055,mat.dark,H);
    }
    const entryLight = M('#ffe0a8',{emissive:'#ffba69',emissiveIntensity:1.1});
    box(1.88,.09,.10,entryLight,H,0,2.31,4.53);
    H.userData.entryLight = entryLight;
    // sealed life-support unit (west): no air vents to the outside, heat leaves through radiator fins
    box(1.0,1.25,1.5,mat.panel,H,-3.85,.82,.65,.06);inst(new THREE.BoxGeometry(.03,1.0,.06),mat.seam,H,Array.from({length:12},(_,i)=>[-4.37,.82,.12+i*.095]));plate(label('ECLSS'),.5,.1,H,-4.36,1.38,.65,-Math.PI/2);
    for(const [z,c] of [[-.75,'O2'],[-1.65,'N2']]){add(new THREE.SphereGeometry(.42,28,18),mat.panel,H,-3.85,.62,z);add(new THREE.TorusGeometry(.43,.03,8,40),mat.steel,H,-3.85,.62,z,0,Math.PI/2);box(.6,.14,.3,mat.steel,H,-3.85,.16,z);plate(label(c,{w:128,h:96,size:60}),.24,.18,H,-4.28,.68,z,-Math.PI/2)}
    tube([[-3.85,1.05,-.75],[-3.4,1.25,-.5],[-2.9,1.2,-.1]],.035,mat.metal,H);tube([[-3.85,1.05,-1.65],[-3.3,1.35,-1.1],[-2.85,1.3,-.5]],.035,mat.gold,H);
    // radiators (north)
    for(const x of [-1.75,1.75]){const g=new THREE.Group();g.position.set(x,1.4,-3.75);H.add(g);box(1.7,1.25,.05,mat.panel,g,0,0,0);inst(new THREE.BoxGeometry(.03,1.15,.08),mat.seam,g,Array.from({length:12},(_,i)=>[-.77+i*.14,0,.05]));beam([0,-.62,0],[0,-1.35,.25],.04,mat.metal,g);beam([-.7,-.62,0],[-.7,-1.35,.35],.03,mat.metal,g);beam([.7,-.62,0],[.7,-1.35,.35],.03,mat.metal,g)}
    tube([[-1.75,.8,-3.7],[-1.1,.3,-3.3],[1.1,.3,-3.3],[1.75,.8,-3.7]],.03,mat.steel,H);
    // pressurised corridor to the greenhouse (east)
    add(new THREE.CylinderGeometry(.62,.62,2.0,32,1,true),mat.fabric,H,3.75,1.25,.1,0,0,Math.PI/2);
    for(const x of [2.95,3.55,4.15,4.7])add(new THREE.TorusGeometry(.64,.045,10,40),mat.steel,H,x,1.25,.1,0,Math.PI/2);
    for(const x of [3.3,4.4]){beam([x,.62,.1],[x-.25,.05,.55],.035,mat.metal,H);beam([x,.62,.1],[x-.25,.05,-.35],.035,mat.metal,H)}
    tube([[-2.4,.08,2.6],[-4.1,.08,4.6],[-5.7,.08,7.2]],.05,mat.rubber,H);}

  // ================= GREENHOUSE (arched growth module with tiered hydroponics) =================
  {const F=farm,RX=2.28,B=.88,L=5.2;
    box(4.9,.24,5.6,mat.steel,F,0,.32,0);for(const x of [-2.2,2.2])for(const z of [-2.5,0,2.5])cyl(.07,.08,.3,mat.metal,F,x,.14,z,10);
    box(4.66,.46,5.36,mat.panel,F,0,.66,0,.04);box(4.74,.06,5.44,mat.metal,F,0,B,0);
    inst(new THREE.BoxGeometry(.02,.4,.02),mat.seam,F,[...Array.from({length:7},(_,i)=>[-2.34,.66,-2.4+i*.8]),...Array.from({length:7},(_,i)=>[2.34,.66,-2.4+i*.8])]);
    const gl=add(new THREE.CylinderGeometry(RX,RX,L,64,1,true,Math.PI/2,Math.PI),mat.glass,F,0,B,0,Math.PI/2);gl.castShadow=false;
    for(let i=0;i<7;i++){const z=-L/2+i*L/6,arc=[];for(let k=0;k<=20;k++){const a=k/20*Math.PI;arc.push([Math.cos(a)*RX,B+Math.sin(a)*RX,z])}tube(arc,.045,mat.panel,F,40)}
    for(const a of [.32,.8,1.25,1.57,1.89,2.34,2.82])beam([Math.cos(a)*RX,B+Math.sin(a)*RX,-L/2],[Math.cos(a)*RX,B+Math.sin(a)*RX,L/2],.022,mat.metal,F);
    // Glazed bays, crown rail and insulated end arches give the greenhouse a distinct silhouette.
    const enamel=M('#32776e',{metalness:.3,roughness:.42});
    for(const z of [-L/2,0,L/2]){
      const arch=[];
      for(let k=0;k<=28;k++){
        const a=k*Math.PI/28;
        arch.push([Math.cos(a)*(RX+.095),B+Math.sin(a)*(RX+.095),z]);
      }
      tube(arch,.095,enamel,F,32);
    }
    box(.43,.13,L+.25,enamel,F,0,B+RX+.13,0,.045);
    for(const x of [-RX,RX])box(.15,.19,L+.2,enamel,F,x,B+.03,0);
    F.userData.growLights=mat.led;
    const half=new THREE.Shape();half.absarc(0,0,RX,0,Math.PI,false);half.lineTo(RX,0);
    // Pressure pushes outward with tonnes of force, so the ends are solid insulated bulkheads, not flat panes.
    const bulk=M('#e4e3da',{roughness:.7,side:THREE.DoubleSide});
    for(const z of [-L/2,L/2]){add(new THREE.ShapeGeometry(half,32),bulk,F,0,B,z);add(new THREE.TorusGeometry(RX,.07,8,48,Math.PI),mat.steel,F,0,B,z);for(const x of [-1.2,0,1.2])beam([x,B,z+(z>0?.03:-.03)],[x,B+Math.sqrt(RX*RX-x*x)-.05,z+(z>0?.03:-.03)],.03,mat.seam,F)}
    // An external shade shields alternate roof bays. Louvres follow the roof
    // curvature while leaving the near glazing clear for the growing racks.
    const shade=M('#b9c9bc',{roughness:.48,metalness:.45});
    for(const z of [-1.72,0,1.72]){
      for(let i=0;i<5;i++){
        const a=1.54+i*.14, r=RX+.17;
        const slat=box(.23,.065,1.28,shade,F,r*Math.cos(a),B+r*Math.sin(a),z,.022);
        slat.rotation.z=a-Math.PI/2+.18;
      }
    }
    const outer=add(new THREE.CylinderGeometry(RX+.07,RX+.07,L,64,1,true,Math.PI/2,Math.PI),mat.glass,F,0,B,0,Math.PI/2);outer.castShadow=false;
    // vestibule (+z) with door window
    box(1.4,1.95,1.0,mat.panel,F,0,B+.97,L/2+.45,.1);box(.82,1.45,.06,mat.dark,F,0,B+.78,L/2+.97,.03);box(.5,.62,.02,mat.win,F,0,B+1.1,L/2+1.0);
    add(new THREE.BoxGeometry(.04,.3,.06),mat.metal,F,.3,B+.75,L/2+1.03);plate(label('G-1  GROWTH'),1.1,.2,F,0,B+1.75,L/2+.955);
    // sealed air-handling unit on the far bulkhead (air is recycled inside; heat goes to a radiator)
    box(1.6,.8,.5,mat.panel,F,0,B+.5,-L/2-.28,.05);inst(new THREE.BoxGeometry(.03,.62,.05),mat.seam,F,Array.from({length:10},(_,i)=>[-.68+i*.15,B+.5,-L/2-.55]));tube([[.5,B+.9,-L/2-.3],[.5,B+1.3,-L/2-.06]],.035,mat.metal,F);
    // racks, trays, LED bars
    const tiers=[1.12,1.66,2.18];
    for(const sx of [-1,1]){const cx=sx*1.0;
      for(const z of [-2.2,-.75,.75,2.2])for(const dx of [-.48,.48])beam([cx+dx,B,z],[cx+dx,2.5,z],.022,mat.metal,F);
      for(const y of tiers){box(1.05,.07,4.7,mat.tray,F,cx,y,0);box(1.05,.05,.04,mat.steel,F,cx,y+.04,2.35);box(.12,.025,4.4,mat.led,F,cx,y+.48,0)}
      tube([[cx-.5,1.0,-2.35],[cx-.5,1.0,2.3],[cx-.5,2.1,2.3]],.018,mat.steel,F)}
    box(.9,.02,5.0,mat.dark,F,0,B+.01,0);
    // plants: red romaine & green lettuce (grown in NASA Veggie) on lower tiers, radish on top
    const leafShape=new THREE.Shape();leafShape.moveTo(0,0);leafShape.bezierCurveTo(-.22,.1,-.26,.48,0,.62);leafShape.bezierCurveTo(.26,.48,.22,.1,0,0);
    const leafGeo=new THREE.ShapeGeometry(leafShape,10);{const p=leafGeo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),x=p.getX(i);p.setZ(i,Math.sin(y*3.2)*.12+Math.cos(x*14)*.015)}leafGeo.computeVertexNormals()}
    const leafMat=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.72,side:THREE.DoubleSide});
    const leaves=[],cols=[],roots=[];
    for(const sx of [-1,1])tiers.forEach((y,ti)=>{for(const dx of [-.25,.25])for(let j=0;j<7;j++){const x=sx*1.0+dx,z=-1.98+j*.66,radish=ti===2,n=radish?6:8;
      for(let k=0;k<n;k++){leaves.push([x,y+.05,z,(radish?.5:.75)+(k%2)*.22,k/n*6.283+j,0,radish?.38:.42+(k%3)*.05]);cols.push(radish?'#4f8a3c':((j+ti+(sx>0?1:0))%3===0?'#8c2f3a':'#6caa4a'))}
      if(radish)roots.push([x,y+.06,z,0,0,0,1])}});
    const lm=inst(leafGeo,leafMat,F,leaves);lm.name='crop-leaves';const c=new THREE.Color();cols.forEach((h,i)=>lm.setColorAt(i,c.set(h).multiplyScalar(.85+rnd()*.3)));lm.instanceColor.needsUpdate=true;
    inst(new THREE.SphereGeometry(.07,12,8),M('#b83d4b',{roughness:.55}),F,roots).name='crop-roots';
    // nutrient tank, pump and plumbing (east)
    cyl(.42,.42,1.3,mat.panel,F,2.95,.72,-1.3,32);for(const y of [.25,1.2])add(new THREE.TorusGeometry(.43,.03,8,32),mat.steel,F,2.95,y,-1.3,Math.PI/2);plate(label('H2O + NUTRIENTS',{size:40}),.62,.13,F,2.95,.95,-.86);
    box(.45,.35,.4,mat.steel,F,2.85,.22,-.2,.04);tube([[2.95,1.3,-1.3],[2.6,1.4,-1.0],[2.3,1.2,-.6]],.03,mat.metal,F);tube([[2.85,.4,-.2],[2.5,.55,.3],[2.3,.75,.4]],.03,mat.metal,F);
    box(.3,.3,.12,mat.panel,F,-2.36,1.6,1.6);add(new THREE.SphereGeometry(.02,8,6),mat.green,F,-2.42,1.65,1.6);}

  // ================= SOLAR ARRAY (tilting racks, junction boxes, power cabinet) =================
  {const P=panels;
    // Two clipped-corner leaves share a central torque tube. Keep a single
    // active material per rack so a damaged or dusty tracker tints both wings.
    const leaf = new THREE.Shape();
    const outline = [[.09,-.98],[1.01,-.98],[1.22,-.77],[1.22,.77],[1.01,.98],[.09,.98]];
    outline.forEach(([x,y],i) => i ? leaf.lineTo(x,y) : leaf.moveTo(x,y));
    leaf.closePath();
    function wingPair(backing) {
      const geo = backing ? new THREE.ExtrudeGeometry(leaf,{depth:.06,bevelEnabled:false}) : new THREE.ShapeGeometry(leaf);
      if (!backing) {
        const pos=geo.attributes.position, uv=geo.attributes.uv;
        for (let i=0;i<pos.count;i++) uv.setXY(i,(pos.getX(i)-.09)/1.13,(pos.getY(i)+.98)/1.96);
        geo.scale(.96,.96,1);
        geo.translate(.024,0,.063);
      }
      geo.rotateX(-Math.PI/2);
      const opposite=geo.clone().rotateY(Math.PI);
      const pair=mergeGeometries([geo,opposite]);
      geo.dispose(); opposite.dispose();
      return pair;
    }
    const frame=wingPair(true), cells=wingPair(false);
    for(const [x,z] of [[-1.3,0],[1.4,0],[-1.3,2.8],[1.4,2.8]]){
      box(.78,.10,.64,mat.concrete,P,x,.06,z);
      inst(bolt,mat.steel,P,[[x-.27,.12,z-.21],[x+.27,.12,z-.21],[x-.27,.12,z+.21],[x+.27,.12,z+.21]]);
      cyl(.13,.19,.58,mat.panel,P,x,.38,z,12);
      for(const side of [-1,1]) beam([x,.62,z],[x+.36*side,1.13,z],.075,mat.steel,P);
      const r=new THREE.Group();r.name='pv-rack';r.position.set(x,1.1,z);r.rotation.x=-.42;P.add(r);
      add(new THREE.CylinderGeometry(.10,.10,.91,12),mat.dark,r,0,0,0,0,0,Math.PI/2);
      add(frame,mat.metal,r);
      add(cells,mat.pv,r);
      box(.075,.09,2.01,mat.steel,r,0,.022,0);
      for(const side of [-1,1]) box(.28,.048,.14,mat.orange,r,0,.04,side*.74);
      // Paired underside spars and scalloped end brackets follow the moving panel.
      for(const side of [-1,1]){
        beam([side*1.14,-.085,-.94],[side*.13,-.23,0],.038,mat.metal,r);
        beam([side*.13,-.23,0],[side*1.14,-.085,.94],.038,mat.metal,r);
        box(.12,.13,.38,mat.orange,r,side*1.21,0,0,.025);
      }
      box(.25,.07,.16,mat.dark,r,.6,-.07,.4);beam([0,-.04,-.6],[0,-.75,.0],.025,mat.steel,r);
      tube([[x+.6,.95,z+.35],[x+.3,.5,z+.25],[x+.1,.08,z+.3],[0,.06,1.4]],.02,mat.rubber,P)}
    box(.75,1.1,.5,mat.panel,P,0,.6,1.4,.05);inst(new THREE.BoxGeometry(.5,.025,.02),mat.dark,P,Array.from({length:6},(_,i)=>[0,.35+i*.07,1.66]));
    [mat.green,mat.green,mat.amber].forEach((m,i)=>add(new THREE.SphereGeometry(.025,8,6),m,P,-.2+i*.08,.98,1.66));plate(label('PWR-1'),.4,.08,P,.18,.98,1.656);}

  // ================= ANTENNA (az-el dish, feed, weather mast, DONKI display) =================
  {const C=comms;
    cyl(1.6,1.65,.2,mat.concrete,C,0,.1,0,40);inst(bolt,mat.steel,C,Array.from({length:12},(_,i)=>[Math.cos(i/12*6.283)*1.3,.21,Math.sin(i/12*6.283)*1.3]));
    cyl(.34,.46,2.2,mat.panel,C,0,1.3,0,32);box(.3,.5,.05,mat.steel,C,0,.75,.42,.02);
    for(const s of [-1,1])beam([s*.18,.2,-.5],[s*.18,2.3,-.45],.02,mat.metal,C);inst(new THREE.CylinderGeometry(.012,.012,.36,6),mat.metal,C,Array.from({length:9},(_,i)=>[0,.35+i*.22,-.47,0,0,Math.PI/2]));
    cyl(.56,.56,.26,mat.steel,C,0,2.52,0,40);add(new THREE.TorusGeometry(.57,.045,8,48),mat.dark,C,0,2.52,0,Math.PI/2);
    const az=new THREE.Group();az.position.y=2.65;az.rotation.y=2.35;C.add(az);C.userData.gimbal=az;
    for(const s of [-1,1])box(.1,.95,.62,mat.panel,az,s*.6,.42,0,.03);box(1.3,.12,.5,mat.steel,az,0,.02,0);box(.5,.4,.4,mat.dark,az,0,.35,-.7,.04);beam([0,.3,-.2],[0,.35,-.55],.06,mat.steel,az);
    const dish=new THREE.Group();dish.position.set(0,.85,0);dish.rotation.x=.78;az.add(dish);
    add(new THREE.CylinderGeometry(.08,.08,1.3,14),mat.steel,dish,0,0,0,0,0,Math.PI/2);
    const f=.95,pp=[];for(let i=0;i<=24;i++){const r=i/24*1.75;pp.push(new THREE.Vector2(Math.max(r,.001),r*r/(4*f)))}
    // Individual reflector petals leave real seams and expose a triangulated rear frame.
    const reflector=[M('#eee7d6',{roughness:.47,metalness:.28,side:THREE.DoubleSide}),
      M('#c0c7c4',{roughness:.4,metalness:.38,side:THREE.DoubleSide})];
    for(let k=0;k<12;k++){
      const a=k*Math.PI/6, gap=.012;
      add(new THREE.LatheGeometry(pp,8,a+gap,Math.PI/6-2*gap),reflector[k%3===0?1:0],dish,0,.08,0);
      const rim=angle=>[Math.sin(angle)*1.68,.72,Math.cos(angle)*1.68];
      const hub=[Math.sin(a)*.44,-.27,Math.cos(a)*.44];
      beam(hub,rim(a),.037,mat.steel,dish);
      beam(hub,rim(a+Math.PI/6),.028,mat.metal,dish);
    }
    cyl(.44,.30,.22,mat.dark,dish,0,-.17,0,16);
    add(new THREE.TorusGeometry(1.75,.035,8,72),mat.metal,dish,0,.08+1.75*1.75/(4*f),0,Math.PI/2);
    for(let k=0;k<12;k++){const a=k/12*6.283,l=[];for(let i=1;i<=8;i++){const r=.25+i/8*1.45;l.push([Math.cos(a)*r,.02+r*r/(4*f),Math.sin(a)*r])}tube(l,.022,mat.metal,dish,12)}
    add(new THREE.TorusGeometry(1.1,.03,8,48),mat.metal,dish,0,.02+1.1*1.1/(4*f),0,Math.PI/2);
    for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;beam([Math.cos(a)*1.6,.08+1.6*1.6/(4*f),Math.sin(a)*1.6],[0,f-.05,0],.018,mat.metal,dish)}
    cyl(.09,.13,.3,mat.panel,dish,0,f,0,20);add(new THREE.ConeGeometry(.11,.18,20,1,true),mat.gold,dish,0,f-.22,0,Math.PI);
    box(.85,.9,.7,mat.panel,C,1.25,.65,.4,.05);add(new THREE.PlaneGeometry(.66,.38),screen(['NASA DONKI / ARCHIVE',science.flare.classType,'2024-05-10 06:27 UTC','FLR-001']),C,1.25,.75,.756);
    for(const x of [1.05,1.45])beam([x,1.1,.3],[x,1.85,.3],.01,mat.metal,C);tube([[1.1,.35,.6],[.55,.12,.6],[.2,.3,.3],[0,2.3,.2]],.03,mat.rubber,C,20);
    // weather mast (wind, temperature)
    beam([-1.2,.2,.8],[-1.2,2.3,.8],.035,mat.metal,C);beam([-1.55,2.1,.8],[-.85,2.1,.8],.02,mat.metal,C);
    // wind is measured by sensors on booms (as on Curiosity's REMS and Perseverance's MEDA); cup anemometers barely turn in thin air
    for(const [a,y] of [[0,2.3],[2.1,2.15]]){const x2=-1.2+Math.cos(a)*.42,z2=.8+Math.sin(a)*.42;beam([-1.2,y,.8],[x2,y,z2],.014,mat.metal,C);box(.12,.05,.08,mat.panel,C,x2,y,z2,.015);for(let k=0;k<3;k++)box(.006,.07,.05,mat.dark,C,x2-.04+k*.04,y+.05,z2)}
    cyl(.05,.05,.12,mat.panel,C,-1.2,2.38,.8,12);
    box(.12,.18,.1,mat.panel,C,-1.55,2.0,.8,.02);box(.1,.14,.1,mat.panel,C,-.85,2.0,.8,.02);plate(label('MET'),.26,.07,C,-1.2,1.7,.84);}

  // ================= RADIATION SHELTER (regolith-bag vault, water wall, RadLab display) =================
  {const S=shelter,R=1.45,Lx=3.8;
    box(4.3,.12,3.6,mat.concrete,S,0,.06,0);
    add(new THREE.CylinderGeometry(R,R,Lx,40,1,true,0,Math.PI),mat.steel,S,0,.1,0,0,0,Math.PI/2);
    const bags=[];for(let c=0;c<9;c++){const phi=.16+c/8*(Math.PI-.32);for(let b=0;b<8;b++){const x=-1.75+b*.5+(c%2)*.25;if(x>1.9)continue;bags.push([x,.1+(R+.17)*Math.sin(phi),(R+.17)*Math.cos(phi),Math.PI/2-phi,(rnd()-.5)*.12,(rnd()-.5)*.08])}}
    const bm=inst(new RoundedBoxGeometry(.5,.3,.36,2,.1),mat.bag,S,bags);const c2=new THREE.Color(),c3=new THREE.Color('#7a6142');bags.forEach((_,i)=>bm.setColorAt(i,c2.set('#a8895f').lerp(c3,rnd()*.6).multiplyScalar(.9+rnd()*.2)));bm.instanceColor.needsUpdate=true;
    const berm=add(new THREE.SphereGeometry(2.4,32,16,0,6.283,0,Math.PI/2),M('#a3694a',{roughness:1}),S,0,0,-.35);berm.scale.set(1.05,.42,.8);
    // Retaining buttresses hold the buried vault between two stepped cheeks.
    const retaining=M('#907e6a',{roughness:.94,bumpMap:noiseTex,bumpScale:.055});
    for (const side of [-1,1]){
      for (let course=0;course<3;course++){
        const x=side*(2.1-course*.14), y=.2+course*.36;
        box(.46,.35,3.48-course*.44,retaining,S,x,y,-.28,.05);
      }
      const yoke=new THREE.Group();
      yoke.position.set(side*1.16,0,2.18); S.add(yoke);
      beam([side*.21,.09,.38],[0,2.12,-.18],.095,mat.steel,yoke);
      box(.28,.09,.56,mat.metal,yoke,side*.21,.07,.35);
    }
    // portal (+z)
    box(2.4,2.0,1.0,M('#c8c5b8',{roughness:.85,bumpMap:noiseTex,bumpScale:.8}),S,0,1.0,1.65,.06);box(2.5,.16,1.1,mat.steel,S,0,2.06,1.65);
    box(.95,1.45,.16,mat.steel,S,0,.88,2.2,.04);box(.32,.2,.03,mat.lamp,S,0,1.3,2.29);for(const y of [.55,1.2])box(.1,.12,.08,mat.dark,S,-.4,y,2.3);
    for(const x of [-.55,.55])add(new THREE.BoxGeometry(.09,1.55,.02),mat.hazard,S,x,.9,2.16);
    plate(trefoil,.36,.36,S,-.85,1.45,2.16);plate(label('STORM SHELTER',{size:46}),1.5,.18,S,0,1.86,2.16);
    box(.62,.5,.1,mat.panel,S,.85,1.12,2.17,.02);const rate=science.radlab.data[0][2];add(new THREE.PlaneGeometry(.54,.4),screen(['ARCHIVE / ISS / DosTel2',rate.toFixed(3)+' microGy/h','2022-04-01 23:00','NOT A MARS READING']),S,.85,1.12,2.225);
    for(const x of [-1.55,1.55]){cyl(.34,.34,1.3,M('#efeee6',{roughness:.95}),S,x,.72,1.55,28);for(const y of [.2,1.25])add(new THREE.TorusGeometry(.35,.03,8,28),mat.steel,S,x,y,1.55,Math.PI/2);plate(label('H2O',{w:128,h:64,size:44}),.22,.11,S,x,.9,1.9)}
    cyl(.11,.11,1.0,mat.steel,S,.9,1.9,-.5,14);add(new THREE.CylinderGeometry(.2,.2,.08,16),mat.steel,S,.9,2.42,-.5);}

  // ================= WORKSHOP (corrugated hangar, roll-up door, bench, crane, Mars Trek table) =================
  {const W=shop;
    box(3.9,.14,3.3,mat.concrete,W,0,.08,0);
    box(3.4,1.9,2.8,mat.corr,W,0,1.1,0);box(3.6,.16,3.0,mat.steel,W,0,2.12,0);for(const x of [-1.72,1.72])for(const z of [-1.42,1.42])box(.1,1.95,.1,mat.metal,W,x,1.1,z);
    // Fixed loading gantry with a travelling hoist and a stowed sling.
    const gantry=M('#ba713a',{roughness:.65,metalness:.32});
    for(const x of [-1.48,1.48]){
      beam([x,.18,1.9],[x,3.25,1.9],.095,gantry,W);
      beam([x,.18,2.38],[x,1.22,1.9],.06,mat.steel,W);
      beam([x,2.64,1.9],[x*.69,3.22,1.9],.06,gantry,W);
    }
    box(3.3,.23,.21,gantry,W,0,3.25,1.9);
    const carriage=box(.42,.28,.36,mat.dark,W,.3,3.1,1.9,.035);
    beam([0,-.14,0],[0,-.78,0],.021,mat.steel,carriage);
    add(new THREE.TorusGeometry(.095,.027,8,18,Math.PI*1.68),gantry,carriage,0,-.85,0);
    W.userData.carriage=carriage;
    // roll-up door faces the base (-z)
    const doorMat=M('#c9c8bd',{metalness:.4,roughness:.5,bumpMap:corrugate,bumpScale:2.5});
    const door=box(2.0,1.5,.06,doorMat,W,0,.92,-1.43);door.rotation.z=0;box(2.2,.12,.16,mat.steel,W,0,1.72,-1.45);for(const x of [-1.06,1.06])box(.1,1.6,.12,mat.steel,W,x,.92,-1.45);
    add(new THREE.BoxGeometry(2.0,.12,.02),mat.hazard,W,0,.24,-1.47);box(.36,.1,.16,mat.steel,W,0,1.9,-1.48);add(new THREE.BoxGeometry(.3,.04,.1),mat.lamp,W,0,1.84,-1.52);
    plate(label('W-2  WORKSHOP'),1.2,.2,W,-.4,2.12,-1.51,Math.PI);box(.7,.4,.02,mat.win,W,1.71,1.4,.4).rotation.y=Math.PI/2;
    // A raised glazed monitor brings daylight over the workbench. The opaque
    // roof slopes toward the rear; the front light band faces the loading rail.
    const monitor = new THREE.Shape();
    monitor.moveTo(-1.30,0); monitor.lineTo(1.30,0); monitor.lineTo(1.30,.46);
    monitor.lineTo(-.86,.75); monitor.closePath();
    add(new THREE.ExtrudeGeometry(monitor,{depth:1.16,bevelEnabled:false}),mat.panel,W,0,2.2,-1.13);
    for(const z of [-1.145,.046]) {
      beam([-.86,2.96,z],[1.31,2.66,z],.055,gantry,W);
      beam([-1.31,2.20,z],[-.86,2.96,z],.055,gantry,W);
    }
    for(const x of [-.91,-.38,.15,.68,1.12]){
      const y=2.62-.135*x;
      box(x>1?.31:.48,.23,.042,mat.win,W,x,y,.061);
    }
    // The service wall carries removable diagonal armour and lifting eyes.
    for(const x of [-1.27,0,1.27]){
      box(1.09,1.0,.07,mat.panel,W,x,1.12,1.43,.04);
      beam([x-.44,.67,1.49],[x+.44,1.55,1.49],.048,gantry,W);
    }
    for(const x of [-1.43,1.43]) {
      add(new THREE.TorusGeometry(.105,.029,7,16),gantry,W,x,2.30,.98);
    }
    // roof plant
    const rad=new THREE.Group();rad.position.set(-.6,2.6,.4);rad.rotation.x=-.5;W.add(rad);box(1.6,.04,.9,mat.panel,rad,0,0,0);inst(new THREE.BoxGeometry(1.5,.03,.02),mat.seam,rad,Array.from({length:8},(_,i)=>[0,.03,-.38+i*.11]));for(const x of [-.7,.7])beam([-.6+x,2.2,.4],[-.6+x,2.5,.4],.025,mat.metal,W);cyl(.06,.06,.5,mat.steel,W,.9,2.45,-.6,10);
    // map table with the Mars Trek hillshade tile (on the base-facing side)
    const map=new THREE.TextureLoader().load(science.trekImage,()=>{map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;map.needsUpdate=true});
    // sealed, heated outdoor terminal showing the Mars Trek tile (paper maps and bare screens would not survive the cold and dust)
    cyl(.07,.1,.95,mat.steel,W,1.1,.5,-2.05,12);const term=new THREE.Group();term.position.set(1.1,1.05,-2.05);term.rotation.x=-.75;term.rotation.y=Math.PI;W.add(term);
    box(1.3,.08,.86,mat.panel,term,0,0,0,.03);add(new THREE.PlaneGeometry(1.16,.73),M('#ffffff',{map,emissive:'#ffffff',emissiveMap:map,emissiveIntensity:.25,roughness:.25,metalness:.1}),term,0,.045,0,-Math.PI/2);
    // workbench, vise and toolbox (west side)
    // closed tool locker: tools are kept sealed from dust and handled in suit gloves
    box(.7,1.1,1.6,mat.panel,W,-2.15,.62,.1,.04);for(const z of [-.3,.5])box(.02,.9,.7,mat.seam,W,-2.51,.62,z);inst(new THREE.BoxGeometry(.04,.22,.04),mat.steel,W,[[-2.53,.7,.05],[-2.53,.7,.15]]);plate(label('TOOLS'),.42,.09,W,-2.515,1.05,.1,-Math.PI/2);
    // gas cylinders in a rack
    ['#e6e6e0','#3d77a8','#4f8a4a'].forEach((col,i)=>{cyl(.15,.15,1.15,M(col,{roughness:.4,metalness:.3}),W,-2.0,.72,-1.2+i*.34,20);add(new THREE.SphereGeometry(.15,16,8,0,6.283,0,1.57),M(col,{roughness:.4,metalness:.3}),W,-2.0,1.3,-1.2+i*.34);cyl(.04,.04,.12,mat.steel,W,-2.0,1.47,-1.2+i*.34,8)});
    box(.06,.06,1.2,mat.steel,W,-2.17,1.0,-.86);
    // crates with straps, spare panel, small crane
    const crate=M('#b89a6a',{roughness:.85,bumpMap:noiseTex,bumpScale:.6});for(const [x,y,z,s] of [[2.25,.4,.5,.62],[2.25,.4,1.2,.62],[2.25,1.0,.85,.55]]){box(s,s,s,crate,W,x,y,z,.03);box(s+.01,.04,s+.01,mat.rubber,W,x,y+s*.2,z);plate(label('SPARES',{size:58}),.4,.09,W,x-s/2-.01,y,z,-Math.PI/2)}
    const sp=add(new THREE.PlaneGeometry(1.2,.9),mat.pv,W,1.75,.65,1.0,0,Math.PI/2,0);sp.rotation.set(0,Math.PI/2,.18);box(.06,.94,1.24,mat.metal,W,1.765,.65,1.0).rotation.z=.18;
    beam([1.55,.15,-1.1],[1.55,2.75,-1.1],.06,mat.orange,W);beam([1.55,2.7,-1.1],[.4,2.7,-1.6],.045,mat.orange,W);beam([.5,2.68,-1.56],[.5,2.0,-1.56],.006,mat.dark,W);add(new THREE.TorusGeometry(.05,.012,6,16,4.5),mat.steel,W,.5,1.95,-1.56);}

  // ---------- object IDs for picking ----------
  for(const [g,id] of ids)g.traverse(o=>{if(o.isMesh)o.userData.objectId=id});
}
