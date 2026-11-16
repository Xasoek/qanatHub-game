// Procedural 3D density sampled along camera rays; no smoke sprites or cloud images.
export function createDustPass(THREE,renderer,camera){
 const uniforms={uLin:{value:1},uTime:{value:0},uStrength:{value:0},uFlight:{value:0},uOrigin:{value:new THREE.Vector3()},uRight:{value:new THREE.Vector3()},uUp:{value:new THREE.Vector3()},uForward:{value:new THREE.Vector3()},uHalf:{value:new THREE.Vector2()}};
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
 precision highp float;
 varying vec2 vUv;uniform float uLin,uTime,uStrength,uFlight;uniform vec3 uOrigin,uRight,uUp,uForward;uniform vec2 uHalf;
 float hash(vec3 p){p=fract(p*.3183099+vec3(.13,.27,.39));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
 float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
 float field(vec3 p){float n=noise3(p)*.57;n+=noise3(p*2.07+vec3(7.1,1.8,4.2))*.28;n+=noise3(p*4.13)*.15;return n;}
 void main(){
  vec2 xy=(vUv*2.-1.)*uHalf;vec3 origin=uOrigin+uRight*xy.x+uUp*xy.y;
  float transmission=1.;vec3 colour=vec3(0.);float jitter=hash(vec3(gl_FragCoord.xy,4.))*(1.-step(.001,uFlight));
  for(int i=0;i<20;i++){
   float dist=5.+(float(i)+jitter*.35)*3.65;vec3 w=origin+uForward*dist;
   vec3 flow=w*vec3(.19,.28,.19)+vec3(-uTime*.24,uTime*.012,uTime*.048);
   vec3 fly=vec3(xy*.075,dist*.06)+vec3(-uTime*.18,uTime*.04,0.);
   float flight=step(.001,uFlight);vec3 p=mix(flow,fly,flight);
   // Stretch the foreground sheets along the direction of the wind.
   p.y += .32*sin(p.x*.84 + p.z*.61);
   float n=mix(field(p),noise3(p)*.72+noise3(p*2.03+vec3(3.1))*.28,step(.001,uFlight));float fine=noise3(p*8.2+vec3(uTime*.1));
   float height=exp(-max(w.y,0.)*.17)*smoothstep(-1.,.2,w.y)* (1.-smoothstep(10.,18.,w.y));
   float front=smoothstep(18.-uStrength*48.-3.,18.-uStrength*48.+3.,w.x+n*5.);
   float gate=mix(height*front,1.,flight);
   float movingFront=mix(1.7,-1.8,clamp(uFlight/5.,0.,1.));
   gate*=mix(1.,smoothstep(movingFront-.4,movingFront+.4,vUv.x*2.-1.+(n-.5)*.6),flight);

   // Storm: soft realistic billows. Planet transition: a soft, almost single-tone sand haze (no hard shapes).
   float billow=mix(smoothstep(.22,.76,n)*(.8+fine*.3),.55+.45*smoothstep(.15,.85,n),flight);
   float density=(billow+uFlight*.03)*gate*uStrength*mix(.075,.16,flight);
   float a=1.-exp(-density*3.65);
   float light=clamp(.66+noise3(p+vec3(-1.2,1.8,.6))*.38-n*.22,.4,1.);
   // transition haze: the ground's sand colour with only a slight shade change
   vec3 haze=mix(vec3(.48,.32,.25),vec3(.91,.69,.48),smoothstep(.35,.9,light+.14*(fine-.5)));
   vec3 dust=mix(mix(vec3(.38,.255,.15),vec3(.76,.59,.39),light),haze,flight);
   colour+=transmission*a*dust;transmission*=1.-a;
   if(transmission<.008)break;
  }
  float alpha=clamp(1.-transmission,0.,1.);gl_FragColor=vec4(pow(colour/max(alpha,.0001),vec3(uLin)),alpha);
 }
 `});
 const passScene=new THREE.Scene();passScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));const passCamera=new THREE.Camera();
 return function renderDust(time,strength,flight,target){if(strength<.003)return;if(target!==undefined){renderer.setRenderTarget(target);uniforms.uLin.value=2.2}else uniforms.uLin.value=1;camera.updateMatrixWorld();uniforms.uTime.value=time*.001;uniforms.uStrength.value=strength;uniforms.uFlight.value=flight;uniforms.uOrigin.value.copy(camera.position);uniforms.uRight.value.setFromMatrixColumn(camera.matrixWorld,0);uniforms.uUp.value.setFromMatrixColumn(camera.matrixWorld,1);uniforms.uForward.value.setFromMatrixColumn(camera.matrixWorld,2).negate();uniforms.uHalf.value.set((camera.right-camera.left)/camera.zoom/2,(camera.top-camera.bottom)/camera.zoom/2);renderer.autoClear=false;renderer.render(passScene,passCamera);renderer.autoClear=true;};
}
