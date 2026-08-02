/* ============================================================================
 * hero3d.js — the hero particle field.
 *
 * 120k GPU particles driven by curl-flow noise in the vertex shader, morphing
 * between eight formations. Every formation carries its own palette, rotation
 * behaviour and turbulence level, so the field never sits still and never
 * looks the same twice.
 *
 *   0 Globe        fibonacci sphere
 *   1 Monte Carlo  lognormal severity density  (RiskPY)
 *   2 Agent Mesh   orchestrator + agent clusters joined by edges
 *   3 Pipeline     double helix data stream
 *   4 Galaxy       barred spiral with a bulge
 *   5 Torus Knot   (3,7) knot swept into a tube
 *   6 Wave Field   interference grid
 *   7 Lattice      cubic crystal lattice
 *
 * Adaptive quality: if the frame budget slips the particle count is cut live
 * rather than letting the page stutter.
 * ==========================================================================*/
import * as THREE from "three";

export function initHero(cfg = {}) {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = cfg.compact || innerWidth < 760;

  // Particle budget is chosen by js/boot.js from the device + connection tier.
  const MAX = cfg.count || (reduce ? 14000 : small ? 26000 : 120000);
  let live = MAX;                                   // adaptive draw range

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: false, powerPreference: "high-performance"
    });
  } catch (e) {
    canvas.style.display = "none";
    return;
  }

  const DPR = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 900);
  camera.position.set(0, 0, 132);

  /* ============================================================ formations */
  const R = 44;                                     // base scale — much larger

  function globe(n) {
    const a = new Float32Array(n * 3);
    const gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = gold * i;
      const rad = R * (0.94 + Math.random() * 0.12);
      a[i * 3] = Math.cos(th) * r * rad;
      a[i * 3 + 1] = y * rad;
      a[i * 3 + 2] = Math.sin(th) * r * rad;
    }
    return a;
  }

  function monteCarlo(n) {
    const a = new Float32Array(n * 3);
    const mu = 0, sigma = 0.82, XMAX = 6.5;
    const pdf = (x) => x <= 0 ? 0
      : Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sigma * sigma)) /
        (x * sigma * Math.sqrt(2 * Math.PI));
    const pmax = pdf(Math.exp(mu - sigma * sigma));
    const W = 130, H = 70, D = 22;
    for (let i = 0; i < n; i++) {
      let x, y, guard = 0;
      do { x = Math.random() * XMAX; y = Math.random() * pmax; }
      while (y > pdf(x) && ++guard < 64);
      a[i * 3] = (x / XMAX) * W - W * 0.46;
      a[i * 3 + 1] = (y / pmax) * H - H * 0.4;
      a[i * 3 + 2] = (Math.random() - 0.5) * D;
    }
    return a;
  }

  function agentMesh(n) {
    const a = new Float32Array(n * 3);
    const K = 9, hubs = [];
    for (let k = 0; k < K; k++) {
      const ang = (k / K) * Math.PI * 2;
      hubs.push([Math.cos(ang) * R * 1.05, Math.sin(ang) * R * 0.72, Math.sin(ang * 2) * 22]);
    }
    hubs.push([0, 0, 0]);
    for (let i = 0; i < n; i++) {
      if (i % 3 === 0) {
        const h = hubs[i % K], t = Math.random();
        a[i * 3] = h[0] * t + (Math.random() - 0.5) * 2.4;
        a[i * 3 + 1] = h[1] * t + (Math.random() - 0.5) * 2.4;
        a[i * 3 + 2] = h[2] * t + (Math.random() - 0.5) * 2.4;
      } else {
        const h = hubs[i % hubs.length];
        const r = 9 * Math.cbrt(Math.random());
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        a[i * 3] = h[0] + r * Math.sin(ph) * Math.cos(th);
        a[i * 3 + 1] = h[1] + r * Math.sin(ph) * Math.sin(th);
        a[i * 3 + 2] = h[2] + r * Math.cos(ph);
      }
    }
    return a;
  }

  function pipeline(n) {
    const a = new Float32Array(n * 3);
    const turns = 6, L = 150, rad = 20;
    for (let i = 0; i < n; i++) {
      const t = i / n, ang = t * Math.PI * 2 * turns, x = t * L - L / 2;
      if (i % 3 < 2) {
        const off = (i % 3) * Math.PI;
        a[i * 3] = x;
        a[i * 3 + 1] = Math.cos(ang + off) * rad + (Math.random() - 0.5) * 2;
        a[i * 3 + 2] = Math.sin(ang + off) * rad + (Math.random() - 0.5) * 2;
      } else {
        const u = Math.random() * 2 - 1;
        a[i * 3] = x;
        a[i * 3 + 1] = Math.cos(ang) * rad * u;
        a[i * 3 + 2] = Math.sin(ang) * rad * u;
      }
    }
    return a;
  }

  function galaxy(n) {
    const a = new Float32Array(n * 3);
    const ARMS = 4, SPIN = 2.6;
    for (let i = 0; i < n; i++) {
      const t = Math.pow(Math.random(), 0.62);
      const rad = t * R * 1.35;
      const arm = (i % ARMS) / ARMS * Math.PI * 2;
      const spread = (1 - t) * 0.65 + 0.06;
      const ang = arm + t * SPIN + (Math.random() - 0.5) * spread;
      const bulge = Math.exp(-t * 5) * 14;
      a[i * 3] = Math.cos(ang) * rad + (Math.random() - 0.5) * 4;
      a[i * 3 + 1] = (Math.random() - 0.5) * (3 + bulge);
      a[i * 3 + 2] = Math.sin(ang) * rad + (Math.random() - 0.5) * 4;
    }
    return a;
  }

  function torusKnot(n) {
    const a = new Float32Array(n * 3);
    const p = 3, q = 7, tube = 7.5, s = R * 0.52;
    for (let i = 0; i < n; i++) {
      const u = (i / n) * Math.PI * 2 * q;
      const r = 2 + Math.cos((p / q) * u);
      const cx = r * Math.cos(u) * s, cy = r * Math.sin(u) * s, cz = Math.sin((p / q) * u) * s * 2;
      const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      const rr = tube * Math.cbrt(Math.random());
      a[i * 3] = cx + rr * Math.sin(ph) * Math.cos(th);
      a[i * 3 + 1] = cy + rr * Math.sin(ph) * Math.sin(th);
      a[i * 3 + 2] = cz + rr * Math.cos(ph);
    }
    return a;
  }

  function waveField(n) {
    const a = new Float32Array(n * 3);
    const side = Math.ceil(Math.sqrt(n)), W = R * 2.6;
    for (let i = 0; i < n; i++) {
      const gx = (i % side) / side - 0.5;
      const gz = Math.floor(i / side) / side - 0.5;
      const x = gx * W, z = gz * W;
      const d = Math.sqrt(x * x + z * z);
      a[i * 3] = x + (Math.random() - 0.5) * 2;
      a[i * 3 + 1] = Math.sin(d * 0.16) * 13 * Math.exp(-d * 0.012) + Math.cos(x * 0.09) * 4;
      a[i * 3 + 2] = z + (Math.random() - 0.5) * 2;
    }
    return a;
  }

  function lattice(n) {
    const a = new Float32Array(n * 3);
    const side = Math.round(Math.cbrt(n)), W = R * 1.7;
    for (let i = 0; i < n; i++) {
      const ix = i % side;
      const iy = Math.floor(i / side) % side;
      const iz = Math.floor(i / (side * side)) % side;
      const jitter = () => (Math.random() - 0.5) * 1.6;
      a[i * 3] = (ix / (side - 1) - 0.5) * W + jitter();
      a[i * 3 + 1] = (iy / (side - 1) - 0.5) * W + jitter();
      a[i * 3 + 2] = (iz / (side - 1) - 0.5) * W + jitter();
    }
    return a;
  }

  // palette, turbulence, spin — per formation
  const FORMATIONS = [
    { name: "Globe",       build: globe,      a: "#ffb257", b: "#6ee7d3", turb: 0.55, spin: 0.075 },
    { name: "Monte Carlo", build: monteCarlo, a: "#ffd166", b: "#ff5d8f", turb: 0.35, spin: 0.030 },
    { name: "Agent Mesh",  build: agentMesh,  a: "#a78bfa", b: "#22d3ee", turb: 0.75, spin: 0.100 },
    { name: "Pipeline",    build: pipeline,   a: "#22d3ee", b: "#a3e635", turb: 0.60, spin: 0.055 },
    { name: "Galaxy",      build: galaxy,     a: "#f472b6", b: "#fbbf24", turb: 0.40, spin: 0.145 },
    { name: "Torus Knot",  build: torusKnot,  a: "#2dd4bf", b: "#c084fc", turb: 0.85, spin: 0.115 },
    { name: "Wave Field",  build: waveField,  a: "#60a5fa", b: "#ffb257", turb: 1.05, spin: 0.045 },
    { name: "Lattice",     build: lattice,    a: "#a3e635", b: "#fb7185", turb: 0.95, spin: 0.085 }
  ];
  const POS = FORMATIONS.map((f) => f.build(MAX));

  /* ============================================================== geometry */
  const geo = new THREE.BufferGeometry();
  const posA = POS[0].slice();
  const posB = POS[0].slice();
  const seed = new Float32Array(MAX);
  const scale = new Float32Array(MAX);
  for (let i = 0; i < MAX; i++) {
    seed[i] = Math.random();
    scale[i] = 0.45 + Math.random() * Math.random() * 2.4;
  }
  geo.setAttribute("aPosA", new THREE.BufferAttribute(posA, 3));
  geo.setAttribute("aPosB", new THREE.BufferAttribute(posB, 3));
  geo.setAttribute("position", new THREE.BufferAttribute(posA, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 300);
  geo.setDrawRange(0, live);

  const U = {
    uTime:     { value: 0 },
    uMix:      { value: 0 },
    uMouse:    { value: new THREE.Vector2(9999, 9999) },
    uMouseStr: { value: 0 },
    uVortex:   { value: 0 },
    uSize:     { value: small ? 3.0 : 3.9 },
    uDpr:      { value: DPR },
    uColorA:   { value: new THREE.Color(FORMATIONS[0].a) },
    uColorB:   { value: new THREE.Color(FORMATIONS[0].b) },
    uTurb:     { value: FORMATIONS[0].turb },
    uOpacity:  { value: 1 },
    uBurst:    { value: 0 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms: U,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uMix, uSize, uDpr, uMouseStr, uTurb, uVortex, uBurst;
      uniform vec2 uMouse;
      attribute vec3 aPosA;
      attribute vec3 aPosB;
      attribute float aSeed;
      attribute float aScale;
      varying float vSeed;
      varying float vDepth;
      varying float vGlow;

      // --- Ashima simplex noise (3D) -------------------------------------
      vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }

      // curl of the noise field — divergence-free, so it reads as real flow
      vec3 curl(vec3 p) {
        float e = 0.28;
        float x1 = snoise(vec3(p.x, p.y + e, p.z)) - snoise(vec3(p.x, p.y - e, p.z));
        float x2 = snoise(vec3(p.x, p.y, p.z + e)) - snoise(vec3(p.x, p.y, p.z - e));
        float y1 = snoise(vec3(p.x, p.y, p.z + e)) - snoise(vec3(p.x, p.y, p.z - e));
        float y2 = snoise(vec3(p.x + e, p.y, p.z)) - snoise(vec3(p.x - e, p.y, p.z));
        float z1 = snoise(vec3(p.x + e, p.y, p.z)) - snoise(vec3(p.x - e, p.y, p.z));
        float z2 = snoise(vec3(p.x, p.y + e, p.z)) - snoise(vec3(p.x, p.y - e, p.z));
        return normalize(vec3(x1 - x2, y1 - y2, z1 - z2) + 0.0001);
      }

      void main() {
        // per-particle stagger so the swarm arrives in waves
        float stagger = aSeed * 0.38;
        float m = clamp((uMix - stagger) / (1.0 - 0.38), 0.0, 1.0);
        m = m * m * (3.0 - 2.0 * m);
        vec3 pos = mix(aPosA, aPosB, m);

        // curl-flow turbulence
        float t = uTime * 0.12;
        vec3 flow = curl(pos * 0.016 + vec3(t, t * 0.7, -t * 0.9));
        float amp = uTurb * (2.2 + aSeed * 5.0) * (1.0 + uBurst * 2.2);
        pos += flow * amp;

        // breathing
        pos *= 1.0 + sin(uTime * 0.55 + aSeed * 6.283) * 0.018;

        // outward shockwave through the midpoint of a morph
        pos += normalize(pos + 0.0001) * sin(m * 3.14159) * (5.0 + aSeed * 12.0);

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);

        // cursor: repel + swirl
        vec2 d = mv.xy - uMouse;
        float dd = dot(d, d);
        float fall = exp(-dd / 900.0);
        vec2 dir = normalize(d + 0.0001);
        mv.xy += dir * uMouseStr * fall;
        mv.xy += vec2(-dir.y, dir.x) * uVortex * fall * 26.0;

        vGlow = fall;
        vDepth = -mv.z;
        vSeed = aSeed;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * aScale * uDpr * (110.0 / max(vDepth, 0.1));
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uOpacity;
      varying float vSeed;
      varying float vDepth;
      varying float vGlow;

      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float alpha = pow(smoothstep(0.5, 0.0, d), 1.7);
        vec3 col = mix(uColorA, uColorB, smoothstep(0.1, 0.95, vSeed));
        col += vGlow * 0.55;                       // particles near the cursor flare
        float fog = smoothstep(300.0, 40.0, vDepth);
        gl_FragColor = vec4(col, alpha * fog * uOpacity * 0.85);
      }
    `
  });

  const points = new THREE.Points(geo, material);
  scene.add(points);

  function placeField() { points.position.x = innerWidth > 900 ? 26 : 0; }
  placeField();

  /* ================================================================ morph */
  let currentF = 0, morphing = false, spin = FORMATIONS[0].spin;
  const cA = new THREE.Color(), cB = new THREE.Color();

  function morphTo(index) {
    if (morphing || index === currentF) return;
    morphing = true;
    const f = FORMATIONS[index];

    geo.attributes.aPosB.array.set(POS[index]);
    geo.attributes.aPosB.needsUpdate = true;

    const fromA = U.uColorA.value.clone(), toA = cA.set(f.a).clone();
    const fromB = U.uColorB.value.clone(), toB = cB.set(f.b).clone();
    const fromT = U.uTurb.value, fromS = spin;

    const start = performance.now(), DUR = 2000;
    (function step(now) {
      const p = Math.min((now - start) / DUR, 1);
      U.uMix.value = p;
      U.uColorA.value.copy(fromA).lerp(toA, p);
      U.uColorB.value.copy(fromB).lerp(toB, p);
      U.uTurb.value = fromT + (f.turb - fromT) * p;
      U.uBurst.value = Math.sin(p * Math.PI);
      spin = fromS + (f.spin - fromS) * p;
      if (p < 1) return requestAnimationFrame(step);
      geo.attributes.aPosA.array.set(POS[index]);
      geo.attributes.aPosA.needsUpdate = true;
      U.uMix.value = 0;
      U.uBurst.value = 0;
      currentF = index;
      morphing = false;
    })(start);

    document.querySelectorAll(".formation").forEach((b, i) => {
      b.classList.toggle("is-active", i === index);
      b.setAttribute("aria-pressed", i === index ? "true" : "false");
    });
    document.dispatchEvent(new CustomEvent("formationchange", {
      detail: { index, name: f.name, a: f.a, b: f.b }
    }));
  }

  // build the buttons from the formation table so the two can't drift apart
  const bar = document.getElementById("formations");
  if (bar) {
    FORMATIONS.forEach((f, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "formation" + (i === 0 ? " is-active" : "");
      b.textContent = f.name;
      b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
      b.addEventListener("click", () => { autoCycle = false; morphTo(i); });
      bar.appendChild(b);
    });
  }

  let autoCycle = !reduce;
  setInterval(() => {
    if (autoCycle && visible && !document.hidden) morphTo((currentF + 1) % FORMATIONS.length);
  }, 5200);

  /* ========================================================== interaction */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / innerHeight) * 2 - 1);
    const vh = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    U.uMouse.value.set(mouse.tx * vh * camera.aspect, mouse.ty * vh);
    U.uMouseStr.value = 16;
  }, { passive: true });
  addEventListener("pointerleave", () => { U.uMouseStr.value = 0; U.uVortex.value = 0; });

  // click anywhere in the hero to swirl the field
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a, button")) return;
      U.uVortex.value = 1;
      const t0 = performance.now();
      (function decay(now) {
        const k = Math.max(0, 1 - (now - t0) / 900);
        U.uVortex.value = k * k;
        if (k > 0) requestAnimationFrame(decay);
      })(t0);
    });
  }

  /* ================================================================= loop */
  let visible = true;
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 })
      .observe(hero);
  }

  let last = performance.now(), acc = 0, frames = 0;
  function render(now) {
    requestAnimationFrame(render);
    if (!visible || document.hidden) { last = now; return; }

    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    U.uTime.value += dt;

    // adaptive quality — trim the draw range if we're missing frame budget
    acc += dt; frames++;
    if (acc >= 1) {
      const fps = frames / acc;
      if (fps < 40 && live > MAX * 0.3) {
        live = Math.max(Math.floor(MAX * 0.3), Math.floor(live * 0.75));
        geo.setDrawRange(0, live);
      } else if (fps > 57 && live < MAX) {
        live = Math.min(MAX, Math.floor(live * 1.12));
        geo.setDrawRange(0, live);
      }
      acc = 0; frames = 0;
    }

    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;

    points.rotation.y += dt * spin;
    points.rotation.x = mouse.y * 0.3 + Math.sin(U.uTime.value * 0.17) * 0.05;
    points.rotation.z = mouse.x * 0.07;
    camera.position.x = mouse.x * 12;
    camera.position.y = mouse.y * 8;
    camera.lookAt(0, 0, 0);

    U.uOpacity.value = Math.max(0, 1 - scrollY / (innerHeight * 0.9));
    renderer.render(scene, camera);
  }
  requestAnimationFrame(render);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    placeField();
  });

  if (!reduce) setTimeout(() => morphTo(1), 2400);
  document.documentElement.classList.add("webgl-on");
}
