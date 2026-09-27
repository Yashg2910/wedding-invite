(function () {
  'use strict';
  var CFG = window.INVITE_CONFIG || {};
  var A = CFG.assets;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WEDDING_DATE = new Date(CFG.weddingDate);
  var HOST_FAMILY = CFG.hostFamily || '';

  function clamp(v, a, b) { a = a === undefined ? 0 : a; b = b === undefined ? 1 : b; return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeIO(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeIn(t) { return t * t * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---------- Guest name ---------- */
  function cleanName(raw) {
    if (!raw) return '';
    var s = String(raw).replace(/[-_+]+/g, ' ');
    try { s = s.replace(/[^\p{L}\p{M}\s.]/gu, ''); } catch (e) { s = s.replace(/[^A-Za-z\s.]/g, ''); }
    s = s.replace(/\s+/g, ' ').trim().slice(0, 60);
    return s.split(' ').map(function (w) { return w ? w.charAt(0).toLocaleUpperCase() + w.slice(1) : ''; }).join(' ');
  }
  function greeting(name, style) {
    if (!name) return 'Dear Family & Friends';
    if (style === 'friend') return 'Dear ' + name;
    return 'Shri ' + name + ' ji & Parivar';
  }
  var params = new URLSearchParams(location.search);
  var invitee = document.getElementById('invitee');
  var urlStyle = params.get('style');
  invitee.textContent = greeting(cleanName(params.get('to')), urlStyle);
  if (HOST_FAMILY) document.getElementById('host').textContent = 'The ' + HOST_FAMILY + ' family welcomes you to the wedding of';
  // The guest-name preview control only shows with ?preview in the URL
  if (!params.has('preview')) { var pc = document.getElementById('proto'); if (pc) pc.remove(); }
  var proto = document.getElementById('proto'), protoBtn = document.getElementById('protoBtn'), protoName = document.getElementById('protoName');
  if (proto) {
    protoBtn.addEventListener('click', function () {
      var on = proto.classList.toggle('editing'); protoBtn.textContent = on ? 'Done' : 'Preview a guest name'; if (on) protoName.focus();
    });
    protoName.addEventListener('input', function () { invitee.textContent = greeting(cleanName(protoName.value), urlStyle); });
  }

  var gateUI = document.getElementById('gateUI'), enterBtn = document.getElementById('enter');
  var flash = document.getElementById('flash'), story = document.getElementById('story'), thread = document.getElementById('thread');
  var chapters = Array.from(document.querySelectorAll('.chapter'));
  var savedate = document.getElementById('savedate');

  /* ---------- Event art direction ---------- */
  var EV = [
    { key: 'haldi', focus: [.5, .54], clear: '#f1c96e', sway: .005, bob: .003, glitter: 0, fall: 1, spark: 0, cols: ['#ff8a1c', '#ffb01f', '#ffd24a'], psize: .055, edge: '#ffb300', seed: 1.3 },
    { key: 'sangeet', focus: [.36, .64], clear: '#140f33', sway: .014, bob: .008, glitter: 1.1, fall: .1, spark: 1, cols: ['#ff8fe0', '#8fe3ff', '#ffe39a'], psize: .08, edge: '#c07bff', seed: 4.1 },
    { key: 'phere', focus: [.5, .57], clear: '#e5ad78', sway: .004, bob: .002, glitter: .45, fall: 1, spark: 0, cols: ['#f7c6d0', '#ffffff', '#e8849a'], psize: .05, edge: '#ff6a3d', seed: 7.7 },
    { key: 'reception', focus: [.5, .5], clear: '#2a141c', sway: .005, bob: .0025, glitter: .75, fall: 0, spark: 1, cols: ['#ffe39a', '#ffd98a', '#fff3c8'], psize: .06, edge: '#ffd36b', seed: 2.9 }
  ];
  var GATE = { clear: '#120a1c', fall: 0, spark: 1, cols: ['#ffd98a', '#ffe7b0', '#ffb347'], psize: .045 };
  // Door rectangle in the gate image (u0, u1, v0, v1 with v measured from the bottom) and the arch shoulder height
  var DOOR = [.2886, .7114, .0168, .5049], SHOULDER = .565, GATE_ASPECT = 900 / 1847;

  var entered = false;
  function unlockStory() {
    story.classList.add('on');
    document.documentElement.classList.remove('locked');
    window.scrollTo(0, 0);
    thread.classList.add('on');
    if (proto) proto.remove();
  }

  /* ---------- Fallback without WebGL ---------- */
  function fallback() {
    document.documentElement.classList.add('nogl');
    gateUI.style.setProperty('--gate-img', 'url(' + A.gate + ')');
    gateUI.classList.add('ready');
    chapters.forEach(function (c, i) {
      var k = EV[i].key, pin = c.querySelector('.pin');
      pin.style.setProperty('--bg-img', 'url(' + A[k + '_bg'] + ')');
      pin.style.setProperty('--fg-img', 'url(' + A[k + '_fg'] + ')');
      c.style.setProperty('--r', 1);
    });
    enterBtn.addEventListener('click', function () {
      if (entered) return; entered = true;
      gateUI.classList.add('gone'); unlockStory();
      function vars() {
        var vh = innerHeight;
        chapters.forEach(function (c) { var r = c.getBoundingClientRect(); c.style.setProperty('--p', clamp(-r.top / (r.height - vh)).toFixed(3)); c.style.setProperty('--tx', 1); c.style.setProperty('--x', clamp(1 - r.bottom / vh).toFixed(3)); });
      }
      addEventListener('scroll', vars, { passive: true }); vars();
    });
    initExtras();
  }

  if (typeof THREE === 'undefined') { fallback(); return; }
  var canvas = document.getElementById('gl'), renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  } catch (e) { fallback(); return; }
  var mobile = Math.min(screen.width, screen.height) < 700;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, .05, 60);
  var D = 5, h0 = 1, w0 = 1, res = new THREE.Vector2(1, 1);

  /* ---------- Shaders ---------- */
  var NOISE = [
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }',
    'float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);',
    '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x), f.y); }',
    'float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<4;i++){ v+=a*noise(p); p*=2.03; a*=.5; } return v; }'
  ].join('\n');
  var ARCH = [
    'uniform float uShoulder;',
    'float archIn(vec2 d){',
    '  if(d.x<0.||d.x>1.||d.y<0.) return 0.;',
    '  if(d.y<uShoulder) return 1.;',
    '  float t=(d.y-uShoulder)/(1.-uShoulder); if(t>1.) return 0.;',
    '  float hw=.5*pow(max(0.,1.-pow(t,1.35)),.62) - .016*abs(sin(t*15.));',
    '  return step(abs(d.x-.5),hw); }'
  ].join('\n');
  var BASIC_VS = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }';

  function mat(opts) {
    return new THREE.ShaderMaterial(Object.assign({ transparent: true, depthTest: false, depthWrite: false }, opts));
  }
  var loader = new THREE.TextureLoader();
  function tex(uri, cb) {
    var t = loader.load(uri, cb);
    t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  }

  /* ================= GATE ================= */
  var gateG = new THREE.Group(); scene.add(gateG);
  var U = { t: { value: 0 } };
  var gateTex = tex(A.gate, function () { gateUI.classList.add('ready'); });
  var doorV = new THREE.Vector4(DOOR[0], DOOR[1], DOOR[2], DOOR[3]);
  var gateOpen = { value: 0 };
  var gatePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({
    transparent: false,
    uniforms: { map: { value: gateTex }, uDoor: { value: doorV }, uShoulder: { value: SHOULDER }, uOpen: gateOpen, uTime: U.t, uRes: { value: res } },
    vertexShader: BASIC_VS,
    fragmentShader: [
      'uniform sampler2D map; uniform vec4 uDoor; uniform float uOpen, uTime; uniform vec2 uRes; varying vec2 vUv;', ARCH,
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
      '  gl_FragColor=vec4(c.rgb,1.); }'
    ].join('\n')
  }));
  gateG.add(gatePlane);
  var gateBack = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({
    transparent: false,
    uniforms: { map: { value: gateTex } },
    vertexShader: BASIC_VS,
    fragmentShader: [
      'uniform sampler2D map; varying vec2 vUv;',
      'void main(){ vec3 c=vec3(0.); float n=0.;',
      '  for(int i=-3;i<=3;i++) for(int j=-3;j<=3;j++){ c+=texture2D(map,vUv+vec2(float(i),float(j))*.011).rgb; n+=1.; }',
      '  c/=n; c*=.38; c=mix(c,c*vec3(.85,.7,1.05),.5); gl_FragColor=vec4(c,1.); }'
    ].join('\n')
  }));
  gateBack.renderOrder = -1; gateBack.position.z = -.05; gateG.add(gateBack);

  function leafMat(side) {
    return mat({
      transparent: false, side: THREE.DoubleSide,
      uniforms: { map: { value: gateTex }, uDoor: { value: doorV }, uShoulder: { value: SHOULDER }, uSide: { value: side }, uOpen: gateOpen, uAngle: { value: 0 }, uTime: U.t },
      vertexShader: BASIC_VS,
      fragmentShader: [
        'uniform sampler2D map; uniform vec4 uDoor; uniform float uSide, uOpen, uAngle, uTime; varying vec2 vUv;', ARCH,
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
        '  gl_FragColor=vec4(c.rgb,1.); }'
      ].join('\n')
    });
  }
  var leafL = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(.5, 0, 0), leafMat(0));
  var leafR = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(-.5, 0, 0), leafMat(1));
  leafL.renderOrder = leafR.renderOrder = 1;
  gateG.add(leafL, leafR);

  var rays = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({
    blending: THREE.AdditiveBlending,
    uniforms: { uOpen: gateOpen, uTime: U.t },
    vertexShader: BASIC_VS,
    fragmentShader: [
      'uniform float uOpen, uTime; varying vec2 vUv;',
      'void main(){ vec2 p=vUv-.5; float r=length(p); float a=atan(p.y,p.x);',
      '  float rays=pow(.5+.5*sin(a*14.+uTime*.6),6.)+.6*pow(.5+.5*sin(a*9.-uTime*.45),8.);',
      '  float v=(rays*smoothstep(.5,.06,r)*.75+exp(-r*8.))*uOpen;',
      '  gl_FragColor=vec4(vec3(1.,.8,.48)*v,v); }'
    ].join('\n')
  }));
  rays.renderOrder = 2; gateG.add(rays);

  function glowSprite(color, flicker) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(color) }, uI: { value: 1 }, uTime: U.t, uF: { value: flicker }, uSeed: { value: Math.random() * 10 } },
      vertexShader: BASIC_VS,
      fragmentShader: [
        'uniform vec3 uColor; uniform float uI, uTime, uF, uSeed; varying vec2 vUv;',
        'void main(){ float r=length(vUv-.5)*2.; float f=1.+uF*(.25*sin(uTime*9.+uSeed)+.15*sin(uTime*23.+uSeed*3.));',
        '  float v=pow(max(0.,1.-r),2.4)*uI*f; gl_FragColor=vec4(uColor*v,v); }'
      ].join('\n')
    }));
    m.renderOrder = 3; return m;
  }
  function starSprite(color) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({
      blending: THREE.AdditiveBlending,
      uniforms: { uColor: { value: new THREE.Color(color) }, uI: { value: 1 }, uTime: U.t, uSeed: { value: Math.random() * 10 } },
      vertexShader: BASIC_VS,
      fragmentShader: [
        'uniform vec3 uColor; uniform float uI, uTime, uSeed; varying vec2 vUv;',
        'void main(){ vec2 p=(vUv-.5)*2.; float tw=pow(.5+.5*sin(uTime*2.2+uSeed*6.),3.);',
        '  float cr=exp(-abs(p.x)*28.)*exp(-abs(p.y)*3.2)+exp(-abs(p.y)*28.)*exp(-abs(p.x)*3.2);',
        '  float v=(cr*.9+exp(-dot(p,p)*18.))*tw*uI; gl_FragColor=vec4(uColor*v,v); }'
      ].join('\n')
    }));
    m.renderOrder = 4; return m;
  }
  var diyaL = glowSprite('#ffb347', 1), diyaR = glowSprite('#ffb347', 1);
  gateG.add(diyaL, diyaR);

  var DOOR_FRAC = .64, beckon = document.getElementById('beckon'), hv = new THREE.Vector3();
  function layoutGate() {
    // Doorway fills about two thirds of the screen height, threshold just above the bottom edge
    var dh = h0 * DOOR_FRAC, H = dh / (DOOR[3] - DOOR[2]), W = H * GATE_ASPECT;
    var yb = -h0 / 2 + h0 * .03, yc = yb + (.5 - DOOR[2]) * H;
    gatePlane.scale.set(W, H, 1); gatePlane.position.set(0, yc, 0);
    var x0 = (-.5 + DOOR[0]) * W, x1 = (-.5 + DOOR[1]) * W, yt = yb + dh, dw = x1 - x0, cy = (yb + yt) / 2;
    leafL.scale.set(dw / 2, dh, 1); leafL.position.set(x0, cy, .003);
    leafR.scale.set(dw / 2, dh, 1); leafR.position.set(x1, cy, .003);
    rays.scale.set(dw * 3.6, dw * 3.6, 1); rays.position.set(0, yb + dh * .4, .01);
    diyaL.scale.set(W * .16, W * .16, 1); diyaL.position.set(x0 - W * .055, yb + H * .012, .02);
    diyaR.scale.copy(diyaL.scale); diyaR.position.set(x1 + W * .055, yb + H * .012, .02);
    var Hb = Math.max(h0, w0 / GATE_ASPECT) * 1.04;
    gateBack.scale.set(Hb * GATE_ASPECT, Hb, 1); gateBack.visible = W < w0 * 1.01;
    GATE.door = { cy: yb + dh * .42, dw: dw, seamY: yb + dh * .5 };
    // Point the hand at the seam between the doors
    var keep = camera.position.clone();
    camera.position.set(0, 0, D); camera.updateMatrixWorld();
    hv.set(0, GATE.door.seamY, 0).project(camera);
    camera.position.copy(keep); camera.updateMatrixWorld();
    beckon.style.left = ((hv.x * .5 + .5) * innerWidth).toFixed(1) + 'px';
    beckon.style.top = ((-hv.y * .5 + .5) * innerHeight).toFixed(1) + 'px';
  }

  /* ================= STORY ================= */
  var storyG = new THREE.Group(); storyG.visible = false; scene.add(storyG);
  var ZB = .8;
  var LAYER_VS = [
    'varying vec2 vUv; uniform float uTime, uSway, uBob, uFg;',
    'void main(){ vUv=uv; vec3 p=position;',
    '  if(uFg>.5){ float h=uv.y; float br=sin(uTime*1.7)*.5+.5;',
    '    p.x+=sin(uTime*1.25)*uSway*h*h;',
    '    p.y=(p.y+.5)*(1.+uBob*br)-.5; }',
    '  gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }'
  ].join('\n');
  var LAYER_FS = [
    'uniform sampler2D map; uniform float uReveal, uTime, uGlitter, uDim, uSeed, uFade; uniform vec2 uRes; uniform vec3 uEdge; varying vec2 vUv;', NOISE,
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
    '  gl_FragColor=vec4(c.rgb,a); }'
  ].join('\n');

  EV.forEach(function (ev, i) {
    var g = new THREE.Group(); g.visible = false; storyG.add(g); ev.group = g;
    ev.size = A[ev.key + '_size']; ev.aspect = ev.size[0] / ev.size[1];
    ev.u = { reveal: { value: 0 }, dim: { value: 0 }, fade: { value: 0 } };
    function layer(uri, isFg, seg) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1, seg), mat({
        uniforms: {
          map: { value: tex(uri) }, uReveal: ev.u.reveal, uDim: ev.u.dim, uFade: ev.u.fade, uTime: U.t, uRes: { value: res },
          uGlitter: { value: isFg ? ev.glitter : 0 }, uSeed: { value: ev.seed }, uEdge: { value: new THREE.Color(ev.edge) },
          uSway: { value: isFg ? ev.sway : 0 }, uBob: { value: isFg ? ev.bob : 0 }, uFg: { value: isFg ? 1 : 0 }
        },
        vertexShader: LAYER_VS, fragmentShader: LAYER_FS
      }));
      m.renderOrder = i * 10 + (isFg ? 3 : 0);
      return m;
    }
    ev.bg = layer(A[ev.key + '_bg'], false, 1); ev.bg.position.z = -ZB;
    ev.fg = layer(A[ev.key + '_fg'], true, 24);
    g.add(ev.bg, ev.fg);
    ev.extras = [];
  });

  // Sangeet: sweeping stage beams between the backdrop and the couple
  (function () {
    var ev = EV[1];
    var beamMat = function (col) {
      return mat({
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color(col) }, uI: { value: 0 } },
        vertexShader: BASIC_VS,
        fragmentShader: [
          'uniform vec3 uColor; uniform float uI; varying vec2 vUv;',
          'void main(){ float w=.02+.42*(1.-vUv.y); float x=abs(vUv.x-.5);',
          '  float v=(1.-smoothstep(w*.35,w,x))*pow(vUv.y,.45)*(.25+.75*vUv.y)*uI;',
          '  gl_FragColor=vec4(uColor*v,v); }'
        ].join('\n')
      });
    };
    [[.04, .82, '#ff6fd8', -.35], [.2, .81, '#ff9ae8', -.15], [.8, .81, '#7fdcff', .15], [.96, .82, '#ffe39a', .35]].forEach(function (b, k) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, -.5, 0), beamMat(b[2]));
      m.renderOrder = 1 * 10 + 1; m.userData = { u: b[0], v: b[1], base: b[3], ph: k * 1.7, kind: 'beam' };
      ev.group.add(m); ev.extras.push(m);
    });
  })();
  // Phere: firelight from the havan kund
  (function () {
    var ev = EV[2], f1 = glowSprite('#ff9a3c', 1.6), f2 = glowSprite('#ffd27a', 2.2);
    f1.renderOrder = f2.renderOrder = 2 * 10 + 4;
    f1.userData = { u: .509, v: .27, s: .5, kind: 'glow', I: .95 }; f2.userData = { u: .509, v: .255, s: .22, kind: 'glow', I: 1 };
    ev.group.add(f1, f2); ev.extras.push(f1, f2);
  })();
  // Reception: chandeliers catching the light
  (function () {
    var ev = EV[3];
    [[.505, .9, .28], [.44, .88, .12], [.57, .885, .12], [.03, .76, .16], [.97, .76, .16], [.5, .66, .12]].forEach(function (p) {
      var s = starSprite('#fff4d6'); s.renderOrder = 3 * 10 + 4;
      s.userData = { u: p[0], v: p[1], s: p[2], kind: 'star', I: 1 };
      ev.group.add(s); ev.extras.push(s);
    });
    var halo = glowSprite('#ffd98a', .3); halo.renderOrder = 3 * 10 + 1;
    halo.userData = { u: .505, v: .9, s: .7, kind: 'glow', I: .55 };
    ev.group.add(halo); ev.extras.push(halo);
  })();
  // Haldi: warm sunlight bloom
  (function () {
    var ev = EV[0], sun = glowSprite('#fff1b0', .2); sun.renderOrder = 1;
    sun.userData = { u: .5, v: .78, s: 1.1, kind: 'glow', I: .45 };
    ev.group.add(sun); ev.extras.push(sun);
  })();

  function layoutStory() {
    var H = h0 * 1.1, S = (D + ZB) / D;
    EV.forEach(function (ev) {
      var W = H * ev.aspect; ev.W = W; ev.H = H;
      ev.fg.scale.set(W, H, 1);
      ev.bg.scale.set(W * S * 1.03, H * S * 1.03, 1);
      ev.u.fade.value = W < w0 * 1.02 ? 1 : 0;
      ev.extras.forEach(function (m) {
        var d = m.userData, x = (d.u - .5) * W, y = (d.v - .5) * H;
        if (d.kind === 'beam') { m.scale.set(W * .55, H * 1.1, 1); m.position.set(x * S, y * S, -ZB * .5); }
        else { m.scale.set(W * d.s, W * d.s, 1); m.position.set(x, y, .01); }
      });
    });
  }

  /* ================= PARTICLES ================= */
  var N = reduce ? 60 : (mobile ? 230 : 380);
  var base = new THREE.PlaneGeometry(1, 1);
  var pgeo = new THREE.InstancedBufferGeometry();
  pgeo.index = base.index; pgeo.setAttribute('position', base.attributes.position); pgeo.setAttribute('uv', base.attributes.uv);
  var seeds = new Float32Array(N * 4); for (var si = 0; si < seeds.length; si++) seeds[si] = Math.random();
  pgeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  pgeo.instanceCount = N;
  var P = {
    uTime: U.t, uFall: { value: 0 }, uSpark: { value: 1 }, uSize: { value: .05 }, uBox: { value: new THREE.Vector3(2, 4, 1) }, uAlpha: { value: 1 },
    uC1: { value: new THREE.Color(GATE.cols[0]) }, uC2: { value: new THREE.Color(GATE.cols[1]) }, uC3: { value: new THREE.Color(GATE.cols[2]) }
  };
  var particles = new THREE.Mesh(pgeo, mat({
    uniforms: P,
    vertexShader: [
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
      '  vSpark=uSpark; vTw=.35+.65*pow(.5+.5*sin(t*(1.6+aSeed.w*3.5)+aSeed.z*20.),2.); }'
    ].join('\n'),
    fragmentShader: [
      'varying vec2 vUv; varying vec3 vCol; varying float vSpark, vTw; uniform float uAlpha;',
      'void main(){ vec2 p=vUv-.5;',
      '  float petal=smoothstep(.5,.36,length(p*vec2(1.,1.7)));',
      '  float shade=.72+.55*(p.y+.5);',
      '  float glow=exp(-dot(p,p)*42.)+.55*(exp(-abs(p.x)*40.)*exp(-abs(p.y)*6.)+exp(-abs(p.y)*40.)*exp(-abs(p.x)*6.));',
      '  float a=mix(petal*.92,glow*vTw,vSpark)*uAlpha;',
      '  vec3 col=mix(vCol*shade,vCol+.4*glow,vSpark);',
      '  if(a<.01) discard; gl_FragColor=vec4(col,a); }'
    ].join('\n')
  }));
  particles.frustumCulled = false; particles.renderOrder = 100; scene.add(particles);

  /* ---------- Layout ---------- */
  function resize() {
    var w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(res);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    h0 = 2 * D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); w0 = h0 * camera.aspect;
    P.uBox.value.set(Math.max(w0, h0 * .6) * 1.5, h0 * 1.35, 1);
    layoutGate(); layoutStory();
  }
  addEventListener('resize', resize); resize();

  /* ---------- Tweens ---------- */
  var tweens = [];
  function tween(dur, fn, ease, delay) {
    tweens.push({ t0: performance.now() + (delay || 0) * 1000, dur: dur * 1000, fn: fn, ease: ease || easeIO });
  }
  function runTweens(now) {
    for (var i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i], k = (now - tw.t0) / tw.dur;
      if (k < 0) continue;
      k = clamp(k); tw.fn(tw.ease(k));
      if (k >= 1) tweens.splice(i, 1);
    }
  }

  /* ---------- Pointer parallax ---------- */
  var ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener('pointermove', function (e) { ptr.x = e.clientX / innerWidth * 2 - 1; ptr.y = -(e.clientY / innerHeight * 2 - 1); }, { passive: true });

  /* ---------- Opening sequence ---------- */
  var mode = 'gate', cam = { x: 0, y: 0, z: D }, angle = 0, entryReveal = 0;
  function openGate() {
    if (entered || !gateUI.classList.contains('ready')) return; entered = true;
    gateUI.classList.add('opening');
    // Background music would start here: this tap is the user gesture browsers require.
    tween(reduce ? .8 : 2.3, function (k) { angle = k * 1.34; leafL.rotation.y = angle; leafR.rotation.y = -angle; leafL.material.uniforms.uAngle.value = leafR.material.uniforms.uAngle.value = angle; });
    tween(reduce ? .6 : 1.3, function (k) { gateOpen.value = k; }, easeOut);
    var dolly = reduce ? 0 : 1.95, startDolly = reduce ? 0 : 1.05;
    if (!reduce) tween(dolly, function (k) { cam.z = lerp(D, .3, k); cam.y = lerp(0, GATE.door.cy, easeOut(k)); }, easeIn, startDolly);
    var tFlash = reduce ? 900 : (startDolly + dolly - .45) * 1000;
    setTimeout(function () { flash.style.opacity = '1'; }, tFlash);
    setTimeout(function () {
      mode = 'story'; gateG.visible = false; storyG.visible = true;
      cam.x = 0; cam.y = 0; cam.z = D;
      gateUI.classList.add('gone'); unlockStory();
      tween(reduce ? .3 : 1.9, function (k) { entryReveal = k; }, easeOut, .15);
      setTimeout(function () { flash.style.opacity = '0'; }, 120);
      setTimeout(function () { gateUI.remove(); }, 900);
    }, tFlash + 600);
  }
  enterBtn.addEventListener('click', openGate);

  /* ---------- Frame loop ---------- */
  var cA = new THREE.Color(), cB = new THREE.Color(), cC = new THREE.Color();
  var mixCol = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
  function blendUniforms(weights, gateW) {
    var fall = gateW * GATE.fall, spark = gateW * GATE.spark, size = gateW * GATE.psize;
    cC.set(GATE.clear).multiplyScalar(gateW);
    for (var c = 0; c < 3; c++) mixCol[c].set(GATE.cols[c]).multiplyScalar(gateW);
    EV.forEach(function (ev, i) {
      var w = weights[i]; if (!w) return;
      fall += w * ev.fall; spark += w * ev.spark; size += w * ev.psize;
      cC.add(cA.set(ev.clear).multiplyScalar(w));
      for (var c = 0; c < 3; c++) mixCol[c].add(cB.set(ev.cols[c]).multiplyScalar(w));
    });
    P.uFall.value = fall; P.uSpark.value = spark; P.uSize.value = size;
    P.uC1.value.copy(mixCol[0]); P.uC2.value.copy(mixCol[1]); P.uC3.value.copy(mixCol[2]);
    renderer.setClearColor(cC);
  }
  var bead = thread.querySelector('i');
  var SM = { rev: [0, 0, 0, 0], prog: [0, 0, 0, 0], x: [0, 0, 0, 0], dim: 0 }, lastNow = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden) { lastNow = now; return; }
    var t = now / 1000; U.t.value = t;
    var dt = Math.min(.05, Math.max(0, (now - lastNow) / 1000)); lastNow = now;
    var kk = 1 - Math.exp(-dt * 11);
    runTweens(now);
    ptr.sx += (ptr.x - ptr.sx) * .05; ptr.sy += (ptr.y - ptr.sy) * .05;
    var drift = reduce ? 0 : 1;
    if (mode === 'gate') {
      camera.position.set(cam.x + (ptr.sx * .05 + Math.sin(t * .4) * .02) * drift * (cam.z / D), cam.y + ptr.sy * .03 * drift * (cam.z / D), cam.z);
      blendUniforms([0, 0, 0, 0], 1);
      P.uAlpha.value = 1;
    } else {
      var vh = innerHeight, rev = [], prog = [];
      chapters.forEach(function (c, i) {
        var r = c.getBoundingClientRect();
        var tp = clamp(-r.top / (r.height - vh));
        var tr = i === 0 ? entryReveal : clamp((vh - r.top) / (vh * .8));
        var tx = clamp(1 - r.bottom / vh);
        SM.prog[i] += (tp - SM.prog[i]) * kk; SM.rev[i] += (tr - SM.rev[i]) * kk; SM.x[i] += (tx - SM.x[i]) * kk;
        prog[i] = SM.prog[i]; rev[i] = SM.rev[i];
        c.style.setProperty('--r', rev[i].toFixed(3)); c.style.setProperty('--p', prog[i].toFixed(3));
        c.style.setProperty('--tx', clamp((rev[i] - .5) / .5 + prog[i] * 4).toFixed(3));
        c.style.setProperty('--x', SM.x[i].toFixed(3));
      });
      var sd = savedate.getBoundingClientRect();
      SM.dim += (clamp(1 - sd.top / vh) * .72 - SM.dim) * kk; var dim = SM.dim;
      var weights = [], cur = 0;
      EV.forEach(function (ev, i) {
        var next = i < EV.length - 1 ? rev[i + 1] : 0;
        weights[i] = rev[i] * (1 - next);
        if (rev[i] > 0) cur = i;
        ev.group.visible = rev[i] > 0 && next < 1;
        ev.u.reveal.value = easeIO(rev[i]);
        ev.u.dim.value = dim;
        var f = lerp(ev.focus[0], ev.focus[1], easeIO(prog[i]));
        ev.group.position.x = (.5 - f) * ev.W;
        var vis = weights[i] * (1 - dim);
        ev.extras.forEach(function (m) {
          var d = m.userData, uu = m.material.uniforms;
          if (d.kind === 'beam') { uu.uI.value = .55 * vis; m.rotation.z = d.base + Math.sin(t * .8 + d.ph) * .32 * drift; }
          else uu.uI.value = d.I * vis;
        });
      });
      blendUniforms(weights, 0);
      P.uAlpha.value = 1 - dim * .4;
      var z = D * (1 - .075 * easeIO(prog[cur]));
      camera.position.set(
        (ptr.sx * .06 + Math.sin(t * .33) * .03) * drift,
        (ptr.sy * .04 + Math.cos(t * .27) * .018) * drift,
        z);
      var max = document.documentElement.scrollHeight - vh;
      bead.style.setProperty('--p', (max > 0 ? scrollY / max * 100 : 0).toFixed(2) + '%');
    }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);
  initExtras();

  /* ================= Scratch card + countdown (DOM) ================= */
  function initExtras() {
    var canvas2 = document.getElementById('scratch'), ctx = canvas2.getContext('2d');
    var revealed = false, drawing = false, last = null, moves = 0;
    function paintFoil() {
      var r = canvas2.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
      if (!r.width) return;
      canvas2.width = Math.round(r.width * dpr); canvas2.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over';
      var g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, '#b8862f'); g.addColorStop(.3, '#f5d98a'); g.addColorStop(.5, '#c99a3c'); g.addColorStop(.7, '#ffe9a8'); g.addColorStop(1, '#a8741f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height);
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1;
      for (var x = -r.height; x < r.width; x += 7) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + r.height, r.height); ctx.stroke(); }
      ctx.fillStyle = '#5a3410'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '600 13px "Cinzel", serif'; ctx.fillText('S C R A T C H   H E R E', r.width / 2, r.height / 2 - 22);
      ctx.font = '44px "Pinyon Script", cursive'; ctx.fillText('Y & I', r.width / 2, r.height / 2 + 16);
    }
    function pos(e) { var r = canvas2.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    function scratchAt(p) {
      ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = 'round'; ctx.lineWidth = 42;
      ctx.beginPath(); ctx.moveTo((last || p).x, (last || p).y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
      if (++moves % 8 === 0) check();
    }
    function check() {
      var data = ctx.getImageData(0, 0, canvas2.width, canvas2.height).data, clear = 0, total = 0;
      for (var k = 3; k < data.length; k += 64) { total++; if (data[k] < 40) clear++; }
      if (clear / total > .5) reveal();
    }
    function reveal() {
      if (revealed) return; revealed = true; canvas2.classList.add('done');
      var host = savedate, cols = ['#ffd24a', '#ff8a1c', '#f7c6d0', '#ffffff', '#d4a445'];
      for (var q = 0; q < 30; q++) {
        var p = document.createElement('span'); p.className = 'confetti';
        var ang = Math.random() * Math.PI * 2, dist = 110 + Math.random() * 110;
        p.style.setProperty('--c', cols[q % cols.length]); p.style.setProperty('--tx', (Math.cos(ang) * dist).toFixed(0) + 'px'); p.style.setProperty('--ty', (Math.sin(ang) * dist - 20).toFixed(0) + 'px');
        host.appendChild(p); (function (el) { setTimeout(function () { el.remove(); }, 1700); })(p);
      }
      document.getElementById('count').classList.add('live');
    }
    canvas2.addEventListener('pointerdown', function (e) { if (revealed) return; drawing = true; last = null; canvas2.setPointerCapture(e.pointerId); scratchAt(pos(e)); });
    canvas2.addEventListener('pointermove', function (e) { if (drawing) scratchAt(pos(e)); });
    ['pointerup', 'pointercancel'].forEach(function (ev) { canvas2.addEventListener(ev, function () { drawing = false; last = null; if (!revealed) check(); }); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paintFoil);
    paintFoil();
    var ro = new ResizeObserver(function () { if (!revealed) paintFoil(); }); ro.observe(canvas2);

    var cells = { d: 'cd', h: 'chh', m: 'cm', s: 'cs' }, prev = {};
    Object.keys(cells).forEach(function (k) { cells[k] = document.getElementById(cells[k]); });
    function setCell(k, v) {
      var str = String(v).padStart(2, '0'); if (prev[k] === str) return; prev[k] = str;
      var sp = document.createElement('span'); sp.textContent = str; if (!reduce) sp.className = 'flip'; cells[k].replaceChildren(sp);
    }
    function tick() {
      var diff = Math.max(0, WEDDING_DATE - new Date());
      setCell('d', Math.floor(diff / 864e5)); setCell('h', Math.floor(diff / 36e5) % 24);
      setCell('m', Math.floor(diff / 6e4) % 60); setCell('s', Math.floor(diff / 1e3) % 60);
    }
    tick(); setInterval(tick, 1000);
  }
})();
