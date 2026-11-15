// Repair-linked damage. Reuse meshes and toggle visibility only when faults change.
import { createBurial } from "./burial.js";

export function createDamage(THREE, parent, groups, racks, land) {
  const burial=createBurial(THREE,parent,land);
  const root=new THREE.Group();root.name="storm-aftermath";parent.add(root);
  const steel=new THREE.MeshStandardMaterial({color:"#58616a",metalness:.55,roughness:.7});
  const rust=new THREE.MeshStandardMaterial({color:"#8d4b31",roughness:.95});
  const warning=new THREE.MeshStandardMaterial({color:"#edb55f",emissive:"#ad501c",emissiveIntensity:.5});
  const crackMat=new THREE.LineBasicMaterial({color:"#151f29"});
  const box=(p,m,pos,size,rot=0)=>{
    const o=new THREE.Mesh(new THREE.BoxGeometry(...size),m);
    o.position.set(...pos);o.rotation.z=rot;o.castShadow=true;p.add(o);return o;
  };
  const seal=new THREE.Group(),radio=new THREE.Group(),debris=new THREE.Group(),patch=new THREE.Group();
  root.add(seal,radio,debris,patch);
  seal.position.copy(groups.air.position);patch.position.copy(groups.air.position);
  box(seal,rust,[.55,1.2,4.135],[.09,1.12,.035],.12);
  box(seal,steel,[.69,.42,4.21],[.24,.10,.20],-.45);
  box(patch,steel,[.50,1.22,4.17],[.41,.72,.055]);
  for(const y of [.98,1.43])box(patch,warning,[.50,y,4.21],[.46,.055,.028],-.16);
  radio.position.copy(groups.comms.position);
  box(radio,steel,[-1.7,.22,.50],[.055,2.2,.06],-.9);
  box(radio,rust,[1.26,.62,.78],[.6,.09,.04],.45);
  for(let i=0;i<14;i++){
    const x=-4+(i%5)*1.1,z=3.2+Math.floor(i/5)*1.05;
    const o=box(debris,i%3?steel:rust,[x,.09,z],[.29+(i%3)*.13,.025,.19+(i%4)*.1],.04);
    o.rotation.y=i*1.71;
  }
  const wrecks=[];
  const glass=new THREE.MeshStandardMaterial({color:"#1b3144",metalness:.35,roughness:.56,side:THREE.DoubleSide});
  // Each failed tracker leaves a bare support and its own recoverable wreck pile.
  // Broken cell fragments are actual separate geometry, so their gaps remain visible.
  for(const [index,rack] of racks.entries()){
    const wreck=new THREE.Group();
    wreck.position.copy(groups.panels.position).add(rack.position);
    wreck.position.y=0;root.add(wreck);
    for(let i=0;i<7;i++){
      const shape=new THREE.Shape();
      shape.moveTo(-.48,-.30);shape.lineTo(.29,-.38);shape.lineTo(.55,.11);
      shape.lineTo(.16,.35);shape.lineTo(-.43,.19);shape.closePath();
      const fragment=new THREE.Mesh(new THREE.ShapeGeometry(shape),glass);
      fragment.rotation.set(-Math.PI/2+(i%3)*.13,i*.19,index*.21+i*1.27);
      fragment.position.set(-1.05+(i%3)*.73,.11+(i%2)*.075,-1.65-Math.floor(i/3)*.47);
      fragment.castShadow=fragment.receiveShadow=true;wreck.add(fragment);
      const rail=box(wreck,steel,[fragment.position.x,.13,fragment.position.z],[.80,.045,.045],.08);
      rail.rotation.y=i*1.27+.3;
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-.4,-.19,.012),new THREE.Vector3(-.08,.03,.012),
        new THREE.Vector3(.13,-.04,.012),new THREE.Vector3(.4,.19,.012)
      ]),crackMat);
      fragment.add(line);
    }
    const remnant=box(wreck,steel,[0,.70,0],[.12,1.03,.10],.38);
    remnant.rotation.x=.18;
    box(wreck,glass,[.48,.53,-.19],[.74,.045,.86],-.63).rotation.x=.31;
    const cable=new THREE.CatmullRomCurve3([
      new THREE.Vector3(.15,.82,0),new THREE.Vector3(.50,.24,-.45),
      new THREE.Vector3(.77,.08,-.96),new THREE.Vector3(1.2,.06,-1.41)
    ]);
    wreck.add(new THREE.Mesh(new THREE.TubeGeometry(cable,12,.022,5,false),steel));
    wrecks.push(wreck);
  }
  let previous="";
  return { root, objects:[root,burial.root], update(state){
    const burialChanged=burial.update(state);
    const sim=state.sim;
    const key=JSON.stringify([Boolean(sim),sim?.sealBroken,sim?.patchUntil,sim?.radioBroken,sim?.debris,state.panels.broken]);
    if(key===previous)return burialChanged;previous=key;
    root.visible=Boolean(sim);
    seal.visible=Boolean(sim?.sealBroken)&&!sim.patchUntil;
    patch.visible=Boolean(sim?.patchUntil);
    radio.visible=Boolean(sim?.radioBroken);
    debris.visible=Boolean(sim?.debris);
    wrecks.forEach((o,i)=>{
      const broken=i<state.panels.broken;
      o.visible=broken;
      racks[i].visible=!broken;
    });
    return true;
  }};
}
