// @ts-nocheck
// Perspective version of the game's procedural dust volume (weather.js): density sampled along
// camera rays. A slow, soft brown-orange haze; no sprites, no flying debris.
export function makeDust(THREE, renderer, camera) {
  const uniforms = {uLin: {value: 1}, uTime: {value: 0}, uStrength: {value: 0}, uFront: {value: 60}, uStart: {value: 2}, uStep: {value: 3.2},
    uOrigin: {value: new THREE.Vector3()}, uRight: {value: new THREE.Vector3()}, uUp: {value: new THREE.Vector3()}, uForward: {value: new THREE.Vector3()}, uTan: {value: new THREE.Vector2()},
    uDark: {value: 0}, uCeil: {value: 16}, tDepth: {value: null}, uNear: {value: .05}, uFar: {value: 900}, uHasDepth: {value: 0}};
  const material = new THREE.ShaderMaterial({uniforms, transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader: `precision highp float;varying vec2 vUv;uniform float uLin,uTime,uStrength,uFront,uStart,uStep,uDark,uCeil;uniform vec3 uOrigin,uRight,uUp,uForward;uniform vec2 uTan;uniform sampler2D tDepth;uniform float uNear,uFar,uHasDepth;
    float hash(vec3 p){p=fract(p*.3183099+vec3(.13,.27,.39));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    float field(vec3 p){float n=noise3(p)*.57;n+=noise3(p*2.07+vec3(7.1,1.8,4.2))*.28;n+=noise3(p*4.13)*.15;return n;}
    void main(){
     vec2 xy=vUv*2.-1.;vec3 dir=normalize(uForward+uRight*xy.x*uTan.x+uUp*xy.y*uTan.y);
     float transmission=1.;vec3 colour=vec3(0.);float jitter=hash(vec3(gl_FragCoord.xy,4.));
     float maxDist=1e5;if(uHasDepth>.5){float d=texture2D(tDepth,vUv).x;float zn=d*2.-1.;float vz=(2.*uNear*uFar)/(uFar+uNear-zn*(uFar-uNear));maxDist=vz/max(.05,dot(dir,uForward));}
     for(int i=0;i<24;i++){
      float dist=uStart+(float(i)+jitter*.5)*uStep*(1.+float(i)*.06);if(dist>maxDist)break;vec3 w=uOrigin+dir*dist;
      vec3 p=w*vec3(.19,.28,.19)+vec3(-uTime*.16,uTime*.01,uTime*.03);
      p.y+=.32*sin(p.x*.84+p.z*.61);
      float n=field(p);float fine=noise3(p*8.2+vec3(uTime*.08));
      float height=exp(-max(w.y,0.)*.12)*smoothstep(-2.,.2,w.y)*(1.-smoothstep(uCeil-6.,uCeil,w.y));
      float front=smoothstep(uFront-4.,uFront+4.,w.x+n*7.);
      float billow=smoothstep(.22,.76,n)*(.8+fine*.3)+.25;
      float density=billow*height*front*uStrength*.11;
      float a=1.-exp(-density*3.65*uStep/3.65);
      float light=clamp(.66+noise3(p+vec3(-1.2,1.8,.6))*.38-n*.22,.4,1.);
      vec3 dust=mix(vec3(.38,.235,.14),vec3(.78,.55,.36),light)*(1.-uDark*.55);
      colour+=transmission*a*dust;transmission*=1.-a;
      if(transmission<.006)break;
     }
     float alpha=clamp(1.-transmission,0.,1.);gl_FragColor=vec4(pow(colour/max(alpha,.0001),vec3(uLin)),alpha);
    }`});
  const passScene = new THREE.Scene(); passScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)); const passCamera = new THREE.Camera();
  const params = {depth: null, strength: 0, front: 60, start: 2, step: 3.2, dark: 0, ceil: 16};
  function render(time, strength, flight, target) {
    if (params.strength < .003) return;
    if (target !== undefined) {renderer.setRenderTarget(target); uniforms.uLin.value = 2.2;} else uniforms.uLin.value = 1;
    camera.updateMatrixWorld();
    uniforms.uTime.value = time * .001; uniforms.uStrength.value = params.strength; uniforms.uFront.value = params.front;
    uniforms.uStart.value = params.start; uniforms.uStep.value = params.step; uniforms.uDark.value = params.dark; uniforms.uCeil.value = params.ceil;uniforms.tDepth.value = params.depth; uniforms.uHasDepth.value = params.depth ? 1 : 0; uniforms.uNear.value = camera.near; uniforms.uFar.value = camera.far;
    uniforms.uOrigin.value.copy(camera.position);
    uniforms.uRight.value.setFromMatrixColumn(camera.matrixWorld, 0); uniforms.uUp.value.setFromMatrixColumn(camera.matrixWorld, 1);
    uniforms.uForward.value.setFromMatrixColumn(camera.matrixWorld, 2).negate();
    const ty = Math.tan(camera.fov * Math.PI / 360); uniforms.uTan.value.set(ty * camera.aspect, ty);
    renderer.autoClear = false; renderer.render(passScene, passCamera); renderer.autoClear = true;
  }
  return {render, params};
}
