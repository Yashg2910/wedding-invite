// GLSL ported VERBATIM from the old js/app.js so the look is preserved exactly.

export const NOISE = [
  'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }',
  'float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);',
  '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }',
  'float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }',
].join('\n')

export const ARCH = [
  'uniform float uShoulder;',
  'float archIn(vec2 d){',
  '  if(d.x<0.||d.x>1.||d.y<0.) return 0.;',
  '  if(d.y<uShoulder) return 1.;',
  '  float t=(d.y-uShoulder)/(1.-uShoulder); if(t>1.) return 0.;',
  '  float hw=.5*pow(max(0.,1.-pow(t,1.35)),.62) - .016*abs(sin(t*15.));',
  '  return step(abs(d.x-.5),hw); }',
].join('\n')

export const BASIC_VS =
  'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }'

/* ---------------- Gate ---------------- */
export const GATE_FS = [
  'uniform sampler2D map; uniform vec4 uDoor; uniform float uOpen, uTime; uniform vec2 uRes; varying vec2 vUv;',
  ARCH,
  'void main(){',
  '  vec4 c=texture2D(map,vUv);',
  '  vec2 d=vec2((vUv.x-uDoor.x)/(uDoor.y-uDoor.x),(vUv.y-uDoor.z)/(uDoor.w-uDoor.z));',
  '  float ins=archIn(d);',
  '  vec3 glow=mix(vec3(1.,.58,.16),vec3(1.,.97,.86),smoothstep(.95,0.,length((d-vec2(.5,.32))*vec2(1.25,.8))));',
  '  glow*=.93+.07*sin(uTime*7.)*sin(uTime*3.1);',
  '  float sy=gl_FragCoord.y/uRes.y; float top=smoothstep(.56,1.,sy); c.rgb*=1.-top*.7; c.rgb=mix(c.rgb,c.rgb*vec3(.8,.66,.98),top*.55);',
  '  c.rgb*=1.-smoothstep(.12,0.,sy)*.35;',
  '  float spill=uOpen*exp(-length((d-vec2(.5,.35))*vec2(.85,.55))*2.);',
  '  c.rgb+=vec3(1.,.66,.28)*spill*.6;',
  '  float vig=smoothstep(1.2,.3,length((gl_FragCoord.xy/uRes-vec2(.5,.42))*vec2(1.5,1.)));',
  '  c.rgb*=mix(.62,1.,vig);',
  '  c.rgb=mix(c.rgb,glow,ins);',
  '  gl_FragColor=vec4(c.rgb,1.); }',
].join('\n')

// 49-tap blur — used ONCE to bake a static backdrop texture (not per frame).
export const GATE_BACK_FS = [
  'uniform sampler2D map; varying vec2 vUv;',
  'void main(){ vec3 c=vec3(0.); float n=0.;',
  '  for(int i=-3;i<=3;i++) for(int j=-3;j<=3;j++){ c+=texture2D(map,vUv+vec2(float(i),float(j))*.011).rgb; n+=1.; }',
  '  c/=n; c*=.38; c=mix(c,c*vec3(.85,.7,1.05),.5); gl_FragColor=vec4(c,1.); }',
].join('\n')

export const LEAF_FS = [
  'uniform sampler2D map; uniform vec4 uDoor; uniform float uSide, uOpen, uAngle, uTime; varying vec2 vUv;',
  ARCH,
  'void main(){',
  '  float dx = uSide<.5 ? vUv.x*.5 : .5+vUv.x*.5;',
  '  vec2 d=vec2(dx,vUv.y);',
  '  if(archIn(d)<.5) discard;',
  '  vec2 uv=vec2(mix(uDoor.x,uDoor.y,d.x), mix(uDoor.z,uDoor.w,d.y));',
  '  vec4 c=texture2D(map,uv);',
  '  c.rgb*=1.-.5*sin(uAngle);',
  '  float seam = uSide<.5 ? smoothstep(.465,.5,dx) : smoothstep(.535,.5,dx);',
  '  c.rgb+=vec3(1.,.72,.3)*seam*(1.-uOpen)*(.5+.5*sin(uTime*2.4))*1.25;',
  '  float rim = uSide<.5 ? smoothstep(.42,.5,dx) : smoothstep(.58,.5,dx);',
  '  c.rgb+=vec3(1.,.7,.3)*rim*uOpen*.5;',
  '  gl_FragColor=vec4(c.rgb,1.); }',
].join('\n')

export const RAYS_FS = [
  'uniform float uOpen, uTime; varying vec2 vUv;',
  'void main(){ vec2 p=vUv-.5; float r=length(p); float a=atan(p.y,p.x);',
  '  float rays=pow(.5+.5*sin(a*14.+uTime*.6),6.)+.6*pow(.5+.5*sin(a*9.-uTime*.45),8.);',
  '  float v=(rays*smoothstep(.5,.06,r)*.75+exp(-r*8.))*uOpen;',
  '  gl_FragColor=vec4(vec3(1.,.8,.48)*v,v); }',
].join('\n')

export const GLOW_FS = [
  'uniform vec3 uColor; uniform float uI, uTime, uF, uSeed; varying vec2 vUv;',
  'void main(){ float r=length(vUv-.5)*2.; float f=1.+uF*(.25*sin(uTime*9.+uSeed)+.15*sin(uTime*23.+uSeed*3.));',
  '  float v=pow(max(0.,1.-r),2.4)*uI*f; gl_FragColor=vec4(uColor*v,v); }',
].join('\n')

export const STAR_FS = [
  'uniform vec3 uColor; uniform float uI, uTime, uSeed; varying vec2 vUv;',
  'void main(){ vec2 p=(vUv-.5)*2.; float tw=pow(.5+.5*sin(uTime*2.2+uSeed*6.),3.);',
  '  float cr=exp(-abs(p.x)*28.)*exp(-abs(p.y)*3.2)+exp(-abs(p.y)*28.)*exp(-abs(p.x)*3.2);',
  '  float v=(cr*.9+exp(-dot(p,p)*18.))*tw*uI; gl_FragColor=vec4(uColor*v,v); }',
].join('\n')

export const BEAM_FS = [
  'uniform vec3 uColor; uniform float uI; varying vec2 vUv;',
  'void main(){ float w=.02+.42*(1.-vUv.y); float x=abs(vUv.x-.5);',
  '  float v=(1.-smoothstep(w*.35,w,x))*pow(vUv.y,.45)*(.25+.75*vUv.y)*uI;',
  '  gl_FragColor=vec4(uColor*v,v); }',
].join('\n')

/* ---------------- Story layers ---------------- */
export const LAYER_VS = [
  'varying vec2 vUv; uniform float uTime, uSway, uBob, uFg;',
  'void main(){ vUv=uv; vec3 p=position;',
  '  if(uFg>.5){ float h=uv.y; float br=sin(uTime*1.7)*.5+.5;',
  '    p.x+=sin(uTime*1.25)*uSway*h*h;',
  '    p.y=(p.y+.5)*(1.+uBob*br)-.5; }',
  '  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }',
].join('\n')

export const LAYER_FS = [
  'uniform sampler2D map; uniform float uReveal, uTime, uGlitter, uDim, uSeed, uFade; uniform vec2 uRes; uniform vec3 uEdge; varying vec2 vUv;',
  NOISE,
  'void main(){ vec4 c=texture2D(map,vUv);',
  '  float vis=1., band=0.;',
  '  if(uReveal<.999){',
  '    vec2 s=gl_FragCoord.xy/uRes; vec2 sa=s*vec2(uRes.x/uRes.y,1.);',
  '    float n=fbm(sa*3.2+uSeed)*.65+length((s-vec2(.5,.36))*vec2(1.,1.3))*.75;',
  '    float e=uReveal*1.55-.1;',
  '    vis=1.-smoothstep(e-.025,e,n);',
  '    band=smoothstep(e-.13,e-.025,n)*vis; }',
  '  if(uGlitter>0.){ float l=dot(c.rgb,vec3(.3,.59,.11)); vec2 g=floor(vUv*vec2(240.,320.));',
  '    float tw=step(.982,hash(g+floor(uTime*6.)))*smoothstep(.6,.92,l); c.rgb+=tw*uGlitter*c.a; }',
  '  c.rgb=mix(c.rgb,uEdge*1.7,band*.95);',
  '  c.rgb*=1.-uDim;',
  '  float a=c.a*vis;',
  '  if(uFade>.5) a*=smoothstep(0.,.07,vUv.x)*smoothstep(1.,.93,vUv.x);',
  '  if(a<.004) discard;',
  '  gl_FragColor=vec4(c.rgb,a); }',
].join('\n')

/* ---------------- Particles ---------------- */
export const PARTICLE_VS = [
  'attribute vec4 aSeed; uniform float uTime, uFall, uSpark, uSize; uniform vec3 uBox, uC1, uC2, uC3;',
  'varying vec2 vUv; varying vec3 vCol; varying float vSpark, vTw;',
  'void main(){ vUv=uv; float t=uTime;',
  '  float sp=mix(.045,.11,aSeed.x);',
  '  float yF=.5-fract(aSeed.y+t*sp);',
  '  float yR=-.5+fract(aSeed.y+t*sp*.55);',
  '  float y=mix(yR,yF,uFall);',
  '  float x=aSeed.z-.5+sin(t*(.5+aSeed.w)+aSeed.x*6.283)*.035;',
  '  float z=mix(-.4,1.1,aSeed.w);',
  '  vec4 mv=modelViewMatrix*vec4(x*uBox.x,y*uBox.y,z,1.);',
  '  float petal=1.-uSpark;',
  '  float spin=t*(1.2+aSeed.x*2.2)+aSeed.z*6.283;',
  '  vec2 q=position.xy; q.x*=mix(1.,abs(cos(spin))*.85+.15,petal);',
  '  float ang=aSeed.y*6.283+t*.6*petal; q=mat2(cos(ang),-sin(ang),sin(ang),cos(ang))*q;',
  '  mv.xy+=q*uSize*mix(.55,1.45,aSeed.x)*mix(1.,.6,uSpark);',
  '  gl_Position=projectionMatrix*mv;',
  '  float k=fract(aSeed.x*7.13); vCol=k<.33?uC1:(k<.66?uC2:uC3);',
  '  vSpark=uSpark; vTw=.35+.65*pow(.5+.5*sin(t*(1.6+aSeed.w*3.5)+aSeed.z*20.),2.); }',
].join('\n')

export const PARTICLE_FS = [
  'varying vec2 vUv; varying vec3 vCol; varying float vSpark, vTw; uniform float uAlpha;',
  'void main(){ vec2 p=vUv-.5;',
  '  float petal=smoothstep(.5,.36,length(p*vec2(1.,1.7)));',
  '  float shade=.72+.55*(p.y+.5);',
  '  float glow=exp(-dot(p,p)*42.)+.55*(exp(-abs(p.x)*40.)*exp(-abs(p.y)*6.)+exp(-abs(p.y)*40.)*exp(-abs(p.x)*6.));',
  '  float a=mix(petal*.92,glow*vTw,vSpark)*uAlpha;',
  '  vec3 col=mix(vCol*shade,vCol+.4*glow,vSpark);',
  '  if(a<.01) discard; gl_FragColor=vec4(col,a); }',
].join('\n')
