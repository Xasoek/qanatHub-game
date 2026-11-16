// @ts-nocheck
// Sky dome: butterscotch-peach day sky, small pale Sun, rising brown storm band.
export function makeSky(THREE) {
  const uniforms = {
    uTop: {value: new THREE.Color('#e9b98c')}, uHorizon: {value: new THREE.Color('#f6d2a8')},
    uSunDir: {value: new THREE.Vector3(.55, .3, -.78).normalize()}, uSunColor: {value: new THREE.Color('#fff4e2')},
    uSunSize: {value: .012}, uSunGlow: {value: 1}, uSunVis: {value: 1},
    uBand: {value: 0}, uBandColor: {value: new THREE.Color('#6b3c24')}, uBandDir: {value: new THREE.Vector3(1, 0, 0)}, uTime: {value: 0},
    uCover: {value: 0}, uCoverColor: {value: new THREE.Color('#8a5634')},
  };
  const mat = new THREE.ShaderMaterial({uniforms, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: true,
    vertexShader: `varying vec3 vDir;void main(){vDir=normalize(position);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;}`,
    fragmentShader: `uniform vec3 uTop,uHorizon,uSunDir,uSunColor,uBandColor,uBandDir,uCoverColor;uniform float uSunSize,uSunGlow,uSunVis,uBand,uTime,uCover;varying vec3 vDir;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n2(p);p*=2.03;a*=.5;}return s;}
    void main(){vec3 d=normalize(vDir);float el=d.y;
     vec3 col=mix(uHorizon,uTop,smoothstep(-.02,.55,el));
     col=mix(col,uHorizon*.92,smoothstep(.02,-.2,el));
     // sun
     float sd=distance(d,normalize(uSunDir));
     float disc=smoothstep(uSunSize,uSunSize*.8,sd);
     float glow=exp(-sd*9.)*.35*uSunGlow+exp(-sd*40.)*.4*uSunGlow;
     // storm band towards uBandDir (rises with uBand)
     float az=atan(d.z,d.x)-atan(uBandDir.z,uBandDir.x);az=atan(sin(az),cos(az));
     float spread=smoothstep(2.6,.3,abs(az));
     float edge=uBand*spread*(.75+.5*fbm(vec2(az*3.+uTime*.03,uTime*.02)))+ (fbm(vec2(az*9.,uTime*.05))-.5)*.05*uBand;
     float inBand=smoothstep(edge+.015,edge-.03,el)*step(.001,uBand);
     float shade=.75+.35*fbm(vec2(az*6.-uTime*.05,el*14.-uTime*.04));
     vec3 bandCol=uBandColor*shade;
     float sunOcc=1.-inBand;
     col+=uSunColor*(disc*1.6+glow)*uSunVis*sunOcc;
     col=mix(col,bandCol,inBand*.96);
     // full cover (inside the storm)
     float cv=fbm(d.xz*3.+vec2(uTime*.05,0.));
     col=mix(col,uCoverColor*(.8+.4*cv),uCover);
     col+=uSunColor*(disc*.5+glow*.6)*uSunVis*uCover*.25;
     gl_FragColor=vec4(col,1.);
     #include <tonemapping_fragment>
     #include <colorspace_fragment>
    }`});
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(420, 48, 24), mat);
  mesh.renderOrder = -10; mesh.frustumCulled = false;
  return {mesh, uniforms};
}
