// Artistic post-storm deposits. The bulk is accumulated dust; the air stays still.
// Broad lee-side banks hide equipment while narrow paths remain readable.
import { batchStatic } from "./batch.js";

export function createBurial(T, parent, land) {
  const root=new T.Group();root.name="buried-outpost";parent.add(root);
  // Deposits share the terrain grain, without the terrain's costly dynamic
  // dust/frost shader: they are already entirely covered by dust.
  const material=new T.MeshStandardMaterial({
    vertexColors:true,roughness:1,map:land.material.map,
    bumpMap:land.material.bumpMap,bumpScale:.12
  });
  const low=new T.Color("#8c604b"),high=new T.Color("#c09674");
  function bank(p,x,z,rx,rz,height,angle=0){
    const near=Math.hypot(x,z)<14;
    const geo=new T.PlaneGeometry(rx*2,rz*2,near?24:16,near?20:14);geo.rotateX(-Math.PI/2);
    const pos=geo.attributes.position,uv=geo.attributes.uv,colors=new Float32Array(pos.count*3);
    const c=new T.Color();
    for(let i=0;i<pos.count;i++){
      const u=pos.getX(i)/rx,v=pos.getZ(i)/rz,r=Math.hypot(u,v);
      const body=Math.pow(Math.max(0,1-r*r),1.35);
      const crest=body*(.9+.12*Math.sin(u*4+v*2));
      pos.setY(i,-.04+height*crest);
      const lx=pos.getX(i),lz=pos.getZ(i),ca=Math.cos(angle),sa=Math.sin(angle);
      const wx=x+lx*ca+lz*sa,wz=z-lx*sa+lz*ca;
      uv.setXY(i,wx/240+.5,.5-wz/240);
      c.copy(low).lerp(high,.45+.3*body);
      colors.set([c.r,c.g,c.b],i*3);
    }
    const indices=geo.index.array,visible=[];
    for(let i=0;i<indices.length;i+=3){
      if([indices[i],indices[i+1],indices[i+2]].some(j=>pos.getY(j)>-.039))
        visible.push(indices[i],indices[i+1],indices[i+2]);
    }
    geo.setIndex(visible);
    geo.setAttribute("color",new T.BufferAttribute(colors,3));geo.computeVertexNormals();
    const o=new T.Mesh(geo,material);o.position.set(x,.045,z);o.rotation.y=angle;
    o.castShadow=o.receiveShadow=true;p.add(o);
  }
  const permanent=new T.Group(),access=new T.Group(),solar=new T.Group(),radio=new T.Group();
  root.add(permanent,access,solar,radio);
  // Secondary modules lie under connected, asymmetric deposits, with only roofs showing.
  for(const a of [
    [-2,-11.9,6.8,4.5,3.25,.15],[11.8,-7.7,5.8,4.4,2.95,-.15],
    [-12,-6.7,4.7,4.0,2.95,-.3],
    [-14.8,4.0,5.8,3.7,1.35,.15],
    [13.9,12.8,4.9,3.4,1.8,.2],[6.2,11.7,4.6,3.7,1.6,-.3],
    [-10,12.2,4,2.2,1.25,.1],[20.5,-3.4,4.8,3.4,1.2,.1],
    [-2.3,-2.8,4.7,3.8,2.55,0],[.6,-2.4,2.1,3.1,1.85,-.2],
    [5.7,-2.4,3.5,3.8,2.25,.15],[4.8,-7.2,3.5,2.8,2.05,-.2]
  ])bank(permanent,...a);
  // A cleared access job cuts these deposits away from the entrance and service road.
  for(const a of [
    [-2.6,1.45,2.9,1.0,1.0,-.15],[1.7,2.6,3.5,1.1,.8,-.05],
    [5.3,.65,2.5,1.5,1.15,0],[-1.7,5.5,3.3,1.8,1.45,.1],
    [9.3,4.8,2.4,1.7,.65,.2]
  ])bank(access,...a);
  for(const a of [
    [-9.4,6.0,2.0,2.5,1.27,.25],[-6.5,8.9,2.2,2.1,1.52,-.2],
    [-9.7,9.1,2,1.7,.9,.15],[-7.0,5.6,1.8,1.6,.82,.2]
  ])bank(solar,...a);
  bank(radio,-8.7,-3.5,2.6,2.1,1.65,-.4);
  bank(radio,-6.5,-2.6,1.5,2.1,1.12,.25);
  for(const group of [permanent,access,solar,radio])batchStatic(T,group);
  let previous="";
  return {root,update(state){
    const sim=state.sim;
    const key=JSON.stringify([Boolean(sim),sim?.debris,sim?.radioBroken,state.panels.broken,state.panels.dusty]);
    if(key===previous)return false;previous=key;
    root.visible=Boolean(sim);
    access.visible=Boolean(sim?.debris);
    radio.scale.y=sim?.radioBroken?1:.25;
    const down=state.panels.broken+state.panels.dusty;
    solar.scale.y=down?Math.min(1,.20+down*.27):.07;
    return true;
  }};
}
