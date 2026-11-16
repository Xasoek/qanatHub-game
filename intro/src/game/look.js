// "AAA pass": render pipeline, terrain, rocks, surface dust, characters and night lights.
// Everything here is procedural and embedded; no runtime downloads. Terrain shape is artistic.
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {GTAOPass} from 'three/addons/postprocessing/GTAOPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {buildCharacters} from './characters.js';
import {Pass} from 'three/addons/postprocessing/Pass.js';
import {FLATS} from './expansion.js';
const mix=(a,b,t)=>a+(b-a)*t;

// ---------- deterministic noise shared by terrain and rocks ----------
function hash2(x,z){const h=Math.sin(x*127.1+z*311.7)*43758.5453;return h-Math.floor(h)}
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);const a=hash2(xi,zi),b=hash2(xi+1,zi),c=hash2(xi,zi+1),d=hash2(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,z,o=5){let s=0,a=.5,f=1;for(let i=0;i<o;i++){s+=a*vnoise(x*f,z*f);f*=2.03;a*=.5}return s}
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const CRATERS=[[-31,-23,7.5],[35,19,5],[23,-36,9.5],[-42,27,4.5],[-17,41,6.5],[48,-8,3.5]];
const PAD_Y=.045;
export function heightAt(x,z){
  const r=Math.hypot(x*1.08,z*1.25);
  // Hills start far from the base so they never block the camera at any angle.
  const near=smooth(13,21,r),far=smooth(28,62,r);
  let h=near*(fbm(x*.11+3,z*.11-7,3)-.5)*.45;
  h+=far*(Math.pow(fbm(x*.024+11,z*.024+5,5),1.6)*12-1.2);
  for(const [cx,cz,R] of CRATERS){const d=Math.hypot(x-cx,z-cz)/R;if(d<2.2){h+=(d<1?-(1-d*d)*R*.2:0)+Math.exp(-Math.pow((d-1)/.24,2))*R*.075}}
  let flat=0;for(const [fx,fz,R] of FLATS){const d=Math.hypot(x-fx,z-fz);flat=Math.max(flat,1-smooth(R,R+3,d))}
  h=h*(1-flat);
  return h+(globalThis.__ravine?globalThis.__ravine(x,z):0);
}
export const inFlat=(x,z,pad=1)=>FLATS.some(([fx,fz,R])=>Math.hypot(x-fx,z-fz)<R+pad);

export function createLook({THREE,renderer,scene,camera,sun,hemi,porch,low=false}){
  const coarse=low||matchMedia('(pointer:coarse)').matches;
  // ---------- lights ----------
  sun.color.set('#ffd9ae');hemi.color.set('#d9c7b5');hemi.groundColor.set('#8c4c2e');
  sun.shadow.mapSize.set(low?1024:coarse?2048:4096,low?1024:coarse?2048:4096);sun.shadow.radius=3;sun.position.set(-19,15,10);sun.shadow.normalBias=.03;sun.shadow.map?.dispose();sun.shadow.map=null;Object.assign(sun.shadow.camera,{left:-34,right:34,top:34,bottom:-34,near:1,far:110});sun.shadow.camera.updateProjectionMatrix();
  const daySun=new THREE.Color('#ffd9ae'),nightSun=new THREE.Color('#8ea3cf');

  // ---------- pipeline: MSAA HDR target → GTAO → bloom → grade → output ----------
  const size=renderer.getDrawingBufferSize(new THREE.Vector2());
  const target=new THREE.WebGLRenderTarget(size.x,size.y,{type:THREE.HalfFloatType,samples:low?0:(coarse||renderer.getPixelRatio()>=1.5)?2:4});
  const composer=new EffectComposer(renderer,target);
  const renderPass=new RenderPass(scene,camera);composer.addPass(renderPass);
  const gtao=new GTAOPass(scene,camera,size.x,size.y);
  gtao.updateGtaoMaterial({radius:1.1,distanceExponent:1.6,thickness:1.4,scale:1.1,samples:coarse?8:16,distanceFallOff:1,screenSpaceRadius:false});
  gtao.blendIntensity=.9;composer.addPass(gtao);
  // AO is low-frequency: half resolution looks the same and costs a quarter.
  const gtaoSize=gtao.setSize.bind(gtao);gtao.setSize=(w,h)=>gtaoSize(Math.max(1,Math.ceil(w/2)),Math.max(1,Math.ceil(h/2)));gtao.setSize(size.x,size.y);
  let dustArgs=null;
  class DustPass extends Pass{constructor(){super();this.needsSwap=false}render(r,w,read){if(dustArgs)dustArgs[0](dustArgs[1],dustArgs[2],dustArgs[3],read)}}
  composer.addPass(new DustPass());
  const bloom=new UnrealBloomPass(new THREE.Vector2(size.x,size.y),.28,.6,1.5);composer.addPass(bloom);
  const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},uFlash:{value:0},uNight:{value:0},uStorm:{value:0},uVig:{value:.34}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform sampler2D tDiffuse;uniform float uFlash,uNight,uStorm,uVig;varying vec2 vUv;
    void main(){vec4 c=texture2D(tDiffuse,vUv);vec3 col=c.rgb;float l=dot(col,vec3(.2126,.7152,.0722));
     vec3 shade=mix(vec3(.9,.97,1.1),vec3(.8,.9,1.2),uNight);vec3 high=mix(vec3(1.05,1.,.93),vec3(1.,1.,1.02),uNight);
     col*=mix(shade,high,smoothstep(.02,.55,l));
     col=.18*pow(max(col,vec3(0.))/.18,vec3(1.12));col=mix(vec3(l),col,1.1-uStorm*.3);
     col=mix(col,col*vec3(1.08,.93,.78)+vec3(.012,.006,0.),uStorm*.55);
     vec2 d=vUv-.5;col*=clamp(1.-dot(d,d)*uVig*2.,0.,1.);
     col=col*(1.+uFlash*1.6)+uFlash*vec3(.55,.62,.75);
     gl_FragColor=vec4(col,c.a);}`});
  // grade runs inside the lens pass (one full-screen pass instead of two)
  // ---------- lens: sand sticking to the camera glass, wind-blown streaks, transition blur ----------
  function makeGrit(){const N=1024,d=new Uint8Array(N*N*4);for(let i=0;i<N*N;i++){d[i*4]=128;d[i*4+1]=128;d[i*4+2]=255;d[i*4+3]=0}
    let q=99;const r=()=>{q=(Math.imul(q,1664525)+1013904223)>>>0;return q/4294967296};
    const drop=(cx,cy,rad,thr,el)=>{const R=Math.ceil(rad*Math.max(1,el))+1;for(let y=-R;y<=R;y++)for(let x=-R;x<=R;x++){const ex=x/(rad*el),ey=y/rad,qq=ex*ex+ey*ey;if(qq>1)continue;const k=(((cy+y+N)%N)*N+((cx+x+N)%N))*4,a=Math.pow(1-qq,.55)*255;if(a>d[k+3]){d[k]=128+ex*120;d[k+1]=128-ey*120;d[k+2]=thr*255;d[k+3]=a}}};
    for(let i=0;i<6500;i++)drop(r()*N|0,r()*N|0,.7+Math.pow(r(),3)*2.6,r(),1);
    for(let i=0;i<420;i++)drop(r()*N|0,r()*N|0,6+Math.pow(r(),2)*18,r(),1+r()*.35);
    for(let i=0;i<110;i++)drop(r()*N|0,r()*N|0,1.5+r()*2.5,r(),4+r()*7);
    const t=new THREE.DataTexture(d,N,N);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return t}
  const lens=new ShaderPass({uniforms:{uFlash:{value:0},uNight:{value:0},uVig:{value:.34},tDiffuse:{value:null},tGrit:{value:makeGrit()},uCover:{value:0},uTime:{value:0},uStorm:{value:0},uFlight:{value:0},uAspect:{value:size.x/size.y}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:`uniform float uFlash,uNight,uVig;uniform sampler2D tDiffuse,tGrit;uniform float uCover,uTime,uStorm,uFlight,uAspect;varying vec2 vUv;
    float h1(float n){return fract(sin(n)*43758.5453);}
    void main(){vec4 g=texture2D(tGrit,vec2(vUv.x*uAspect,vUv.y)*.78);float on=smoothstep(g.b,g.b+.08,uCover*1.1)*g.a;vec2 n=(g.rg-.5)*2.;
     vec2 uv=vUv+n*on*.004;vec3 col;
     if(uFlight>.001){vec2 dir=uv-.5;vec3 acc=vec3(0.);for(int i=0;i<12;i++){float t=float(i)/11.;acc+=texture2D(tDiffuse,uv-dir*t*.05*uFlight).rgb;}col=acc/12.;
       float ca=.003*uFlight;col.r=mix(col.r,texture2D(tDiffuse,uv+dir*ca).r,.6);col.b=mix(col.b,texture2D(tDiffuse,uv-dir*ca).b,.6);}
     else col=texture2D(tDiffuse,uv).rgb;
     {float l=dot(col,vec3(.2126,.7152,.0722));
     vec3 shade=mix(vec3(.9,.97,1.1),vec3(.8,.9,1.2),uNight);vec3 high=mix(vec3(1.05,1.,.93),vec3(1.,1.,1.02),uNight);
     col*=mix(shade,high,smoothstep(.02,.55,l));
     col=.18*pow(max(col,vec3(0.))/.18,vec3(1.12));col=mix(vec3(l),col,1.1-uStorm*.3);
     col=mix(col,col*vec3(1.08,.93,.78)+vec3(.012,.006,0.),uStorm*.55);
     vec2 gd=vUv-.5;col*=clamp(1.-dot(gd,gd)*uVig*2.,0.,1.);
     col=col*(1.+uFlash*1.6)+uFlash*vec3(.55,.62,.75);
     }
     vec3 dust=vec3(.58,.34,.19);float l=dot(col,vec3(.3,.59,.11));
     col=mix(col,dust*(l*.7+.05),on*.86);
     col+=on*pow(max(0.,dot(n,normalize(vec2(-.5,.8)))),2.)*.12*vec3(1.,.82,.62)*(.35+l);
     col=mix(col,col*.8+dust*.07,uCover*.4);
     float s=0.;for(int i=0;i<4;i++){float fi=float(i);vec2 p=vec2(vUv.x*(1.4+fi*.7)-uTime*(1.2+fi*.85),(vUv.y+vUv.x*.07)*(60.+fi*38.));float row=floor(p.y);float hh=h1(row*12.9898+fi*78.233);float seg=fract(p.x+hh*9.);
       s+=step(.92,hh)*smoothstep(0.,.07,seg)*smoothstep(.42,.07,seg)*(1.-abs(fract(p.y)-.5)*2.)*(.6+.4*h1(row+3.1));}
     col=mix(col,dust*1.7*(.45+l),clamp(s,0.,1.)*uStorm*.5);
     // transition: a bright, warm, sandy wash instead of a dark vignette
     col=mix(col,col*1.04+vec3(.03,.018,.008),uFlight*.35);
     gl_FragColor=vec4(col,1.);}`});
  composer.addPass(lens);
  composer.addPass(new OutputPass());

  // ---------- remove placeholder ground dressing ----------
  const land=scene.children.find(o=>o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width===160);
  const groundDetail=land.material.map;
  for(const o of [...scene.children]){
    const g=o.geometry,p=g?.parameters;
    const isPad=g?.type==='BoxGeometry'&&p.width===25&&p.depth===20;
    const isCone=g?.type==='ConeGeometry'&&p.radialSegments===5;
    const isRock=g?.type==='DodecahedronGeometry';
    if(o.isGridHelper||isPad||isCone||isRock){scene.remove(o);if(isCone||isRock||isPad)g.dispose()}
    else if(g?.type==='BoxGeometry'&&p.height===.065){o.material=new THREE.MeshStandardMaterial({color:'#9d6244',roughness:1});o.scale.y=.35;o.position.y=PAD_Y+.008;o.receiveShadow=true;o.castShadow=false;o.userData.noDust=true}
  }

  // ---------- terrain heightfield with craters and slope colouring ----------
  // Match the original grid pitch around the base, then widen cells past the outpost.
  // The outer landscape is mostly distant or fogged. Keep world-space texture density.
  const SPAN=240, innerRadius=30, innerCells=90, outerCells=24;
  const half=innerCells+outerCells;
  const coords=[];
  for(let i=-half;i<=half;i++){
    const n=Math.abs(i), t=(n-innerCells)/outerCells;
    const distance=n<=innerCells ? innerRadius*n/innerCells :
      innerRadius+(SPAN/2-innerRadius)*(.2*t+.8*t*t);
    coords.push(Math.sign(i)*distance);
  }
  const geo=new THREE.PlaneGeometry(SPAN,SPAN,half*2,half*2);
  geo.rotateX(-Math.PI/2);
  const pos=geo.attributes.position, uv=geo.attributes.uv;
  for(let row=0;row<coords.length;row++)for(let col=0;col<coords.length;col++){
    const i=row*coords.length+col, x=coords[col], z=coords[row];
    pos.setXYZ(i,x,heightAt(x,z),z);
    uv.setXY(i,x/SPAN+.5,.5-z/SPAN);
  }
  geo.computeVertexNormals();const nrm=geo.attributes.normal,cols=new Float32Array(pos.count*3);
  const cBase=new THREE.Color('#9e6451'),cWarm=new THREE.Color('#bf8562'),cRock=new THREE.Color('#705048'),cDust=new THREE.Color('#cd9c79'),cPad=new THREE.Color('#a68066'),tmp=new THREE.Color();
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=pos.getY(i),r=Math.hypot(x*1.08,z*1.25);
    tmp.copy(cBase).lerp(cWarm,fbm(x*.06,z*.06,4));
    tmp.lerp(cRock,smooth(.93,.72,nrm.getY(i))*.85);
    tmp.lerp(cDust,smooth(-.4,-2.2,y)*.6);
    // Parallel aeolian streaks fade under the levelled landing pad.
    const ripple = .5 + .5 * Math.sin(z*1.9+x*.43+5*fbm(x*.085,z*.09,3));
    tmp.lerp(cDust, ripple*ripple * smooth(7,25,r)*.24);
    tmp.lerp(cPad,(1-smooth(9,15,r))*.4);
    const speck=.9+hash2(x*3.1,z*3.1)*.16;cols[i*3]=tmp.r*speck;cols[i*3+1]=tmp.g*speck;cols[i*3+2]=tmp.b*speck}
  geo.setAttribute('color',new THREE.BufferAttribute(cols,3));
  const detail=groundDetail.clone();detail.generateMipmaps=true;detail.minFilter=THREE.LinearMipmapLinearFilter;detail.magFilter=THREE.LinearFilter;detail.needsUpdate=true;detail.repeat.set(SPAN/7,SPAN/7);
  land.geometry.dispose();land.geometry=geo;land.position.set(0,PAD_Y,0);land.castShadow=false;land.receiveShadow=true;
  land.material=new THREE.MeshStandardMaterial({vertexColors:true,map:detail,bumpMap:detail,bumpScale:.6,roughness:1});land.userData.noDust=true;

  // ---------- rocks: noise-displaced icosahedra, instanced in three shapes ----------
  function rockGeo(seed,detail=3){const g=new THREE.IcosahedronGeometry(1,detail),p=g.attributes.position,v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=fbm(v.x*1.3+seed,v.z*1.3+v.y*.7-seed,4);const flat=v.y<-.2?.55:1;v.multiplyScalar(.72+n*.6);v.y*=flat*.72;p.setXYZ(i,v.x,v.y,v.z)}
    g.computeVertexNormals();return g}
  const rockMat=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.93});
  // Pebbles get fewer facets than boulders: at their size on screen the extra triangles are invisible.
  const mkRocks=(detail,n)=>[0,1,2].map(i=>{const m=new THREE.InstancedMesh(rockGeo(i*17.3,detail),rockMat,n);m.castShadow=m.receiveShadow=true;m.count=0;scene.add(m);return m});
  const bigRocks=mkRocks(3,coarse?60:110),smallRocks=mkRocks(1,coarse?150:260),rocks=[...bigRocks,...smallRocks];
  const dummy=new THREE.Object3D(),rc=new THREE.Color();let s=771;const rnd=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};
  function placeRock(x,z,size){const m=(size>=.35?bigRocks:smallRocks)[Math.floor(rnd()*3)];if(m.count>=m.instanceMatrix.count)return;
    dummy.position.set(x,PAD_Y+heightAt(x,z)-size*.18,z);dummy.rotation.set((rnd()-.5)*.5,rnd()*6.3,(rnd()-.5)*.5);dummy.scale.set(size*(.8+rnd()*.5),size*(.6+rnd()*.5),size*(.8+rnd()*.5));dummy.updateMatrix();
    m.setMatrixAt(m.count,dummy.matrix);rc.set('#8e5539').lerp(new THREE.Color('#c08060'),rnd()).multiplyScalar(.85+rnd()*.3);m.setColorAt(m.count,rc);m.count++}
  for(let i=0;i<620;i++){const a=rnd()*Math.PI*2,r=11+Math.pow(rnd(),.8)*75,x=Math.cos(a)*r,z=Math.sin(a)*r*.85;
    if(Math.abs(x)<12&&Math.abs(z)<10||inFlat(x,z))continue;const big=rnd()<.06;placeRock(x,z,big?.7+rnd()*.9:.07+Math.pow(rnd(),2.5)*.55)}
  // rims of craters carry the larger ejected blocks
  for(const [cx,cz,R] of CRATERS)for(let k=0;k<10;k++){const a=rnd()*Math.PI*2,d=R*(1+rnd()*.35);placeRock(cx+Math.cos(a)*d,cz+Math.sin(a)*d,.25+rnd()*.7)}
  rocks.forEach(m=>{m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere()});

  // ---------- surface dust: settles on upward faces and near the ground ----------
  const DUST={uDust:{value:new THREE.Color('#b87650')},uDustAmt:{value:1},uFrost:{value:0}};
  function patch(m,frostOnly=false){if(!m||m.userData.dusted||m.transparent||!m.isMeshStandardMaterial||m.emissiveMap)return;m.userData.dusted=true;m.customProgramCacheKey=()=>frostOnly?'mars-frost':'mars-dust';
    m.onBeforeCompile=sh=>{sh.uniforms.uDust=DUST.uDust;sh.uniforms.uDustAmt=DUST.uDustAmt;sh.uniforms.uFrost=DUST.uFrost;
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vDW;varying vec3 vDN;').replace('#include <begin_vertex>',`#include <begin_vertex>
      {vec4 dw=vec4(transformed,1.);vec3 dn=objectNormal;
      #ifdef USE_INSTANCING
      dw=instanceMatrix*dw;dn=mat3(instanceMatrix)*dn;
      #endif
      dw=modelMatrix*dw;vDW=dw.xyz;vDN=normalize(mat3(modelMatrix)*dn);}`);
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
      varying vec3 vDW;varying vec3 vDN;uniform vec3 uDust;uniform float uDustAmt;uniform float uFrost;
      float dH(vec3 p){p=fract(p*.3183+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float dN(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(dH(i),dH(i+vec3(1,0,0)),f.x),mix(dH(i+vec3(0,1,0)),dH(i+vec3(1,1,0)),f.x),f.y),mix(mix(dH(i+vec3(0,0,1)),dH(i+vec3(1,0,1)),f.x),mix(dH(i+vec3(0,1,1)),dH(i+vec3(1,1,1)),f.x),f.y),f.z);}`)
      .replace('#include <color_fragment>',`#include <color_fragment>
      float dsN=dN(vDW*2.7)*.6+dN(vDW*13.)*.4;
      float dsAmt=(smoothstep(.5,.97,normalize(vDN).y)*.42+(1.-smoothstep(.05,.6,vDW.y))*.6)*smoothstep(.28,.78,dsN+.12);
      dsAmt=clamp(dsAmt*uDustAmt*${frostOnly?'0.':'1.'},0.,.82);
      diffuseColor.rgb=mix(diffuseColor.rgb,uDust*(.78+dsN*.4),dsAmt);
      // thin water-ice frost, as photographed by Viking Lander 2: a faint, fairly even whitish film
      float frN=dN(vDW*1.7)*.6+dN(vDW*9.)*.4;
      float fr=uFrost*smoothstep(.6,.95,normalize(vDN).y)*(.55+.45*smoothstep(.25,.75,frN));
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.8,.82,.84),fr*.26);`)
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(mix(roughnessFactor,1.,dsAmt),.5,fr*.5);')
      .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor*=1.-dsAmt;')};
    m.needsUpdate=true}
  function dust(root){patch(land.material,true);root.traverse(o=>{if(!o.isMesh||o.userData.noDust)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(patch)})}

  // ---------- night lights: habitat windows, greenhouse grow LEDs, status beacons ----------
  const windowMat=new THREE.MeshStandardMaterial({color:'#24414f',emissive:'#ffb36e',emissiveIntensity:.1,roughness:.18,metalness:.2});
  const growMat=new THREE.MeshStandardMaterial({color:'#e7c9e6',emissive:'#ff5fd6',emissiveIntensity:.6,roughness:.4});
  const beaconMat=new THREE.MeshStandardMaterial({color:'#ff6a4d',emissive:'#ff3b22',emissiveIntensity:1});
  scene.traverse(o=>{if(!o.isMesh||!o.material?.color)return;const hex=o.material.color.getHex();
    if(hex===0x29586a||hex===0x274b59||hex===0x34525c)o.material=windowMat;
    else if(o.material.emissive?.getHex()===0x806785)o.material=growMat;
    else if(hex===0xe99c59&&o.geometry.type==='SphereGeometry')o.material=beaconMat});
  scene.traverse(o=>{if(o.isMesh&&o.material?.transparent&&o.material.color?.getHex()===0xa1d8c1){o.material.roughness=.06;o.material.opacity=.24;o.material.envMapIntensity=.6}});
  const growLight=new THREE.PointLight('#ff6be0',0,9,1.6);growLight.position.set(5,2.6,-1.9);scene.add(growLight);
  const habGlow=new THREE.PointLight('#ffb36e',0,10,1.6);habGlow.position.set(-2,1.4,1.4);scene.add(habGlow);

  // ---------- characters ----------
  function characters(o){buildCharacters({THREE,beaconMat,...o})}

  function setSize(w,h){composer.setSize(w,h);lens.uniforms.uAspect.value=w/h}
  let last=0,cover=0,sandPts=null;
  function render(now,opts={}){const {night=0,storm=0,orbital=false,flight=0,flash=0,alarm=false,frost=0,dust:da=null,sunMul=1,hemiMul=1,exposure=1,vig=.34,bloomStrength=null,beacon=null}=opts;
    DUST.uFrost.value=orbital?0:frost;
    const dt=Math.min(.1,last?(now-last)/1000:0);last=now;dustArgs=da;
    if(!sandPts){scene.traverse(o=>{if(o.isPoints&&o.material.color.getHex()===0xdfc49e)sandPts=o});if(sandPts){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);const m=sandPts.material;m.map=new THREE.CanvasTexture(c);m.size=3.2*renderer.getPixelRatio();m.sizeAttenuation=false;m.color.set('#e2b88a');m.needsUpdate=true}}
    cover=THREE.MathUtils.clamp(cover+(orbital?-1:storm>.55?.055:-.4)*dt,0,.9);if(opts.cover!==undefined)cover=opts.cover;
    lens.uniforms.uCover.value=cover;lens.uniforms.uTime.value=now*.001;lens.uniforms.uStorm.value=orbital?0:(opts.lensStorm??storm);lens.uniforms.uFlight.value=Math.min(1,flight/8);
    const n=typeof night==='number'?night:(night?1:0);
    if(!orbital){
      sun.intensity=mix(4.4,.32,n)*(1-storm*.82);sun.color.copy(daySun).lerp(nightSun,n);
      hemi.intensity=mix(1.05,.45,n)*(1-storm*.3);scene.environmentIntensity=mix(.42,.1,n);
      renderer.toneMappingExposure=mix(1.0,1.3,n);
      windowMat.emissiveIntensity=mix(.12+storm*.6,1.5,n);growMat.emissiveIntensity=mix(.7,3,n);
      growLight.intensity=mix(storm*2.5,7,n);habGlow.intensity=mix(storm*2,5,n);
      porch.intensity=mix(storm*4,3.5,n);
      beaconMat.emissiveIntensity=alarm?(Math.sin(now*.018)>0?5:.2):(Math.sin(now*.004)>.6?3.5:.25);beaconMat.emissive.set(alarm?'#ff1a0a':'#ff3b22');
      DUST.uDustAmt.value=1+storm*.35;sun.intensity*=sunMul;hemi.intensity*=hemiMul;renderer.toneMappingExposure*=exposure;lens.uniforms.uVig.value=vig;if(beacon!==null)beaconMat.emissiveIntensity=beacon;if(opts.beaconColor)beaconMat.emissive.set(opts.beaconColor);
    }
    const nn=typeof night==='number'?night:(night?1:0);gtao.enabled=!orbital&&!low;bloom.enabled=!low&&(orbital||nn>.12||flash>.02||alarm);gtao.enabled=gtao.enabled&&opts.ao!==false;bloom.strength=orbital?.45:mix(.24,.55,nn);lens.uniforms.uFlash.value=flash;if(bloomStrength!==null){bloom.enabled=true;bloom.strength=bloomStrength;}
    lens.uniforms.uNight.value=orbital?0:nn;
    // Mars air is ~1% of Earth's: storms don't shake a camera, so there is no shake.
    const shake=0,saved=camera.position.clone();
    if(shake){const t=now*.001;camera.position.x+=Math.sin(t*7.3)*shake+Math.sin(t*17.1)*shake*.4;camera.position.y+=Math.sin(t*9.1+1.3)*shake*.6;camera.position.z+=Math.sin(t*6.2+.7)*shake}
    composer.render();
    if(shake)camera.position.copy(saved);
  }
  function setPixelRatio(r){composer.setPixelRatio(r)}
  // the space view draws through its own perspective camera
  function setCamera(c){renderPass.camera=c}
  return {render,setSize,setPixelRatio,setCamera,dust,characters,beaconMat,windowMat,growMat,composer,gtao,bloom,lens,land};
}
