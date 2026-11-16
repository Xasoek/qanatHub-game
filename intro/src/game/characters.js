// Characters: Mark (pressure suit with posable limbs) and Beep (helper robot).
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
export function buildCharacters({THREE,mark,beep,limbs,beaconMat}){
    for(const g of [mark,beep])for(const c of [...g.children]){g.remove(c);c.traverse?.(n=>n.geometry?.dispose())}
    limbs.length=0;
    const suit=new THREE.MeshStandardMaterial({color:'#ece8dd',roughness:.82}),suitDark=new THREE.MeshStandardMaterial({color:'#9aa3a3',roughness:.7}),
      metal=new THREE.MeshStandardMaterial({color:'#b8bec0',metalness:.85,roughness:.3}),boot=new THREE.MeshStandardMaterial({color:'#5d6467',roughness:.75}),
      orange=new THREE.MeshStandardMaterial({color:'#e2733a',roughness:.6}),
      visorMat=new THREE.MeshPhysicalMaterial({color:'#d8a24a',metalness:1,roughness:.12,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:1.6});
    const add=(geo,m,p,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o};
    const legs = [];
    for (const x of [-.15,.15]) {
      const hip = new THREE.Group(), knee = new THREE.Group(), ankle = new THREE.Group();
      hip.position.set(x,.645,0);
      knee.position.y = -.32;
      ankle.position.y = -.31;
      mark.add(hip); hip.add(knee); knee.add(ankle);
      add(new THREE.CapsuleGeometry(.114,.135,5,12),suit,hip,0,-.15,0);
      add(new THREE.SphereGeometry(.108,14,10),suitDark,knee,0,0,0);
      add(new RoundedBoxGeometry(.17,.14,.07,2,.025),orange,knee,0,0,.08);
      add(new THREE.CapsuleGeometry(.1,.125,5,12),suit,knee,0,-.15,0);
      add(new RoundedBoxGeometry(.25,.13,.37,3,.04),boot,ankle,0,.009,.052);
      add(new RoundedBoxGeometry(.25,.04,.38,2,.014),suitDark,ankle,0,-.055,.053);
      legs.push({hip,knee,ankle}); limbs.push(hip);
    }
    // torso, chest unit, backpack (life-support pack)
    add(new RoundedBoxGeometry(.6,.66,.4,4,.14),suit,mark,0,1.02,0);
    add(new THREE.TorusGeometry(.2,.04,10,28),suitDark,mark,0,.72,0).rotation.x=Math.PI/2;
    add(new RoundedBoxGeometry(.32,.2,.1,3,.03),suitDark,mark,0,1.06,.22);
    for(let i=0;i<3;i++)add(new THREE.CylinderGeometry(.025,.025,.03,12),[orange,metal,orange][i],mark,-.08+i*.08,1.08,.275).rotation.x=Math.PI/2;
    add(new RoundedBoxGeometry(.52,.66,.28,4,.08),suit,mark,0,1.05,-.33);
    add(new RoundedBoxGeometry(.44,.12,.04,2,.02),suitDark,mark,0,1.2,-.48);
    add(new THREE.BoxGeometry(.16,.06,.02),orange,mark,-.22,1.2,.205);
    // Contrasting shoulder yoke, helmet stripe and paired backpack cylinders.
    for (const side of [-1,1]) {
      add(new THREE.CapsuleGeometry(.065,.33,4,10),metal,mark,side*.215,1.03,-.49);
      add(new RoundedBoxGeometry(.16,.10,.32,2,.035),orange,mark,side*.25,1.28,.02);
    }
    const arms = [];
    for (const x of [-.41,.41]) {
      const shoulder = new THREE.Group(), elbow = new THREE.Group();
      shoulder.position.set(x,1.25,0); elbow.position.y = -.27;
      mark.add(shoulder); shoulder.add(elbow);
      add(new THREE.SphereGeometry(.13,16,12),suit,shoulder,0,0,0);
      add(new THREE.CapsuleGeometry(.095,.11,6,14),suit,shoulder,0,-.13,0);
      add(new THREE.SphereGeometry(.096,14,10),suitDark,elbow,0,0,0);
      add(new THREE.CapsuleGeometry(.088,.105,6,14),suit,elbow,0,-.126,0);
      add(new THREE.TorusGeometry(.08,.018,8,20),orange,elbow,0,-.209,0).rotation.x=Math.PI/2;
      add(new THREE.SphereGeometry(.085,14,10),boot,elbow,0,-.275,0);
      arms.push({shoulder,elbow}); limbs.push(shoulder);
    }
    // helmet: shell, neck ring, gold sun visor, lamps
    add(new THREE.CylinderGeometry(.22,.24,.08,28),metal,mark,0,1.38,0);
    add(new THREE.SphereGeometry(.33,32,24),suit,mark,0,1.66,0);
    add(new THREE.SphereGeometry(.335,40,24,Math.PI/2-1.05,2.1,.62,1.18),visorMat,mark,0,1.66,0);
    for(const x of [-.25,.25]){add(new THREE.CylinderGeometry(.045,.045,.07,14),metal,mark,x,1.85,.12).rotation.x=Math.PI/2}
    // Beep: rounded chassis, face screen, eyes, tracks and antenna
    const shell=new THREE.MeshStandardMaterial({color:'#e3e6df',roughness:.55,metalness:.1}),dark=new THREE.MeshStandardMaterial({color:'#2f3a3f',roughness:.6}),
      glass=new THREE.MeshPhysicalMaterial({color:'#0e1f26',roughness:.08,metalness:.2,clearcoat:1}),eyes=new THREE.MeshStandardMaterial({color:'#7ff3e3',emissive:'#4ff0dc',emissiveIntensity:2.2}),
      accent=new THREE.MeshStandardMaterial({color:'#e2733a',roughness:.5});
    add(new RoundedBoxGeometry(.62,.4,.52,4,.12),shell,beep,0,.62,0);
    add(new RoundedBoxGeometry(.46,.26,.06,3,.05),glass,beep,0,.66,.25);
    const eyeMeshes=[];for(const x of [-.1,.1])eyeMeshes.push(add(new RoundedBoxGeometry(.075,.11,.02,2,.03),eyes,beep,x,.67,.285));beep.userData.eyeMeshes=eyeMeshes;
    // Protective side bumpers, distinct even when the screen faces away.
    for (const side of [-1,1]) {
      add(new RoundedBoxGeometry(.08,.26,.51,2,.035),accent,beep,side*.32,.62,0);
    }
    add(new THREE.BoxGeometry(.64,.05,.54),accent,beep,0,.44,0);
    const wheels = [];
    for (const side of [-1,1]) {
      const x=side*.31;
      add(new RoundedBoxGeometry(.14,.21,.59,3,.095),dark,beep,x,.105,0);
      add(new RoundedBoxGeometry(.10,.15,.31,2,.04),metal,beep,x,.285,0);
      for (const z of [-.18,0,.18]) {
        const wheel=new THREE.Group();
        wheel.position.set(x+side*.073,.105,z); beep.add(wheel);
        add(new THREE.CylinderGeometry(.084,.084,.018,12),metal,wheel,0,0,0).rotation.z=Math.PI/2;
        add(new THREE.BoxGeometry(.015,.020,.128),dark,wheel,side*.014,0,0);
        wheels.push(wheel);
      }
    }
    add(new THREE.CylinderGeometry(.012,.012,.28,8),metal,beep,.18,.95,-.1);
    add(new THREE.SphereGeometry(.035,12,8),beaconMat,beep,.18,1.1,-.1);
  
    let phase=0, gait=0, atRest=false;
    mark.userData.step = (travel,dt,reduced) => {
      if (atRest && (reduced || travel === 0)) return;
      const cycle=.9, stance=.5, reach=cycle*stance/2;
      gait = reduced ? 0 : THREE.MathUtils.damp(gait, travel>0 ? 1 : 0, 18, dt);
      atRest = (reduced || travel === 0) && gait < .0001;
      if (atRest) gait = 0;
      phase = (phase+travel/cycle)%1;
      for (let side=0;side<2;side++) {
        const t=(phase+side*.5)%1;
        const swing=Math.max(0,(t-stance)/(1-stance));
        // A planted boot slides backwards by exactly the distance the hips move.
        const z=gait*(t<stance ? reach-cycle*t : -reach*Math.cos(swing*Math.PI));
        const lift=gait*.085*Math.sin(Math.PI*swing)**2;
        const drop=.645-.075-lift;
        const distance=Math.hypot(drop,z);
        const hipAngle=-Math.atan2(z,drop)-Math.acos((.32**2+distance**2-.31**2)/(.64*distance));
        const kneeAngle=Math.PI-Math.acos((.32**2+.31**2-distance**2)/(2*.32*.31));
        const {hip,knee,ankle}=legs[side];
        hip.rotation.x=hipAngle; knee.rotation.x=kneeAngle;
        ankle.rotation.x=-hipAngle-kneeAngle;
        arms[side].shoulder.rotation.x=.34*z/reach;
        arms[side].elbow.rotation.x=-.24-.12*lift/.085;
      }
    };
    beep.userData.roll = distance => {
      for (const wheel of wheels) wheel.rotation.x=(wheel.rotation.x+distance/.105)%(2*Math.PI);
    };

    mark.userData.joints={legs,arms};beep.userData.parts={wheels,eyes,shell,glass};
    mark.name='Mark';beep.name='Beep';['LegL','LegR','ArmL','ArmR'].forEach((n,i)=>{if(limbs[i])limbs[i].name='Mark_'+n});
    suit.name='suit';orange.name='suit_accent';visorMat.name='visor_gold';shell.name='beep_shell';eyes.name='beep_eyes';
}
