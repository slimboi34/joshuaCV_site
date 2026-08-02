/* ============================================================================
 * hero3d.js — WebGL hero: 40k GPU particles that morph between four formations,
 * each one representing a slice of the work on this site.
 *
 *   0 Globe        — the baseline sphere
 *   1 Monte Carlo  — particles fill a lognormal severity density (RiskPY)
 *   2 Agent Mesh   — orchestrator + agent clusters joined by edges
 *   3 Pipeline     — double helix data stream
 *
 * Degrades to nothing (silently) if WebGL is unavailable or the user has
 * asked for reduced motion.
 * ==========================================================================*/
import * as THREE from "three";

const canvas = document.getElementById("hero-canvas");
if (canvas) boot();

function boot() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COUNT = reduce ? 12000 : 42000;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance"
    });
  } catch (e) {
    canvas.style.display = "none";
    return;                                   // no WebGL — CSS background stands in
  }

  const DPR = Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 400);
  camera.position.set(0, 0, 78);

  /* ------------------------------------------------------------ formations */
  const FORMATIONS = [globe, monteCarlo, agentMesh, pipeline].map((f) => f(COUNT));

  function globe(n) {
    const a = new Float32Array(n * 3);
    const gold = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = gold * i;
      const R = 26 + (Math.random() - 0.5) * 1.6;
      a[i * 3] = Math.cos(th) * r * R;
      a[i * 3 + 1] = y * R;
      a[i * 3 + 2] = Math.sin(th) * r * R;
    }
    return a;
  }

  // Particles fill the area under a lognormal pdf — the severity distribution
  // RiskPY simulates. Rejection sampling gives the shape for free.
  function monteCarlo(n) {
    const a = new Float32Array(n * 3);
    const mu = 0, sigma = 0.82, XMAX = 6.5;
    const pdf = (x) =>
      x <= 0 ? 0
        : Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sigma * sigma)) /
          (x * sigma * Math.sqrt(2 * Math.PI));
    const pmax = pdf(Math.exp(mu - sigma * sigma));
    const W = 74, H = 40, D = 11;
    for (let i = 0; i < n; i++) {
      let x, y, guard = 0;
      do {
        x = Math.random() * XMAX;
        y = Math.random() * pmax;
      } while (y > pdf(x) && ++guard < 64);
      a[i * 3] = (x / XMAX) * W - W * 0.46;
      a[i * 3 + 1] = (y / pmax) * H - H * 0.4;
      a[i * 3 + 2] = (Math.random() - 0.5) * D;
    }
    return a;
  }

  function agentMesh(n) {
    const a = new Float32Array(n * 3);
    const K = 8, hubs = [];
    for (let k = 0; k < K; k++) {
      const ang = (k / K) * Math.PI * 2;
      hubs.push([Math.cos(ang) * 27, Math.sin(ang) * 18, Math.sin(ang * 2) * 12]);
    }
    hubs.push([0, 0, 0]);                     // the orchestrator
    for (let i = 0; i < n; i++) {
      if (i % 3 === 0) {                      // edges radiating from centre
        const h = hubs[i % K], t = Math.random();
        a[i * 3] = h[0] * t + (Math.random() - 0.5) * 1.5;
        a[i * 3 + 1] = h[1] * t + (Math.random() - 0.5) * 1.5;
        a[i * 3 + 2] = h[2] * t + (Math.random() - 0.5) * 1.5;
      } else {                                // node clouds
        const h = hubs[i % hubs.length];
        const r = 5 * Math.cbrt(Math.random());
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        a[i * 3] = h[0] + r * Math.sin(ph) * Math.cos(th);
        a[i * 3 + 1] = h[1] + r * Math.sin(ph) * Math.sin(th);
        a[i * 3 + 2] = h[2] + r * Math.cos(ph);
      }
    }
    return a;
  }

  function pipeline(n) {
    const a = new Float32Array(n * 3);
    const turns = 4.5, L = 76, R = 12;
    for (let i = 0; i < n; i++) {
      const t = i / n, ang = t * Math.PI * 2 * turns, x = t * L - L / 2;
      if (i % 3 < 2) {                        // two strands
        const off = (i % 3) * Math.PI;
        a[i * 3] = x;
        a[i * 3 + 1] = Math.cos(ang + off) * R + (Math.random() - 0.5) * 1.3;
        a[i * 3 + 2] = Math.sin(ang + off) * R + (Math.random() - 0.5) * 1.3;
      } else {                                // rungs between them
        const u = Math.random() * 2 - 1;
        a[i * 3] = x;
        a[i * 3 + 1] = Math.cos(ang) * R * u;
        a[i * 3 + 2] = Math.sin(ang) * R * u;
      }
    }
    return a;
  }

  /* -------------------------------------------------------------- geometry */
  const geo = new THREE.BufferGeometry();
  const posA = FORMATIONS[0].slice();
  const posB = FORMATIONS[0].slice();
  const seed = new Float32Array(COUNT);
  const scale = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    seed[i] = Math.random();
    scale[i] = 0.55 + Math.random() * Math.random() * 1.9;
  }
  geo.setAttribute("aPosA", new THREE.BufferAttribute(posA, 3));
  geo.setAttribute("aPosB", new THREE.BufferAttribute(posB, 3));
  geo.setAttribute("position", new THREE.BufferAttribute(posA, 3)); // frustum only
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 90);

  const uniforms = {
    uTime:     { value: 0 },
    uMix:      { value: 0 },
    uMouse:    { value: new THREE.Vector2(9999, 9999) },
    uMouseStr: { value: 0 },
    uSize:     { value: 3.4 },
    uDpr:      { value: DPR },
    uColorA:   { value: new THREE.Color("#ffb257") },
    uColorB:   { value: new THREE.Color("#6ee7d3") },
    uOpacity:  { value: 1 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uMix, uSize, uDpr, uMouseStr;
      uniform vec2 uMouse;
      attribute vec3 aPosA;
      attribute vec3 aPosB;
      attribute float aSeed;
      attribute float aScale;
      varying float vSeed;
      varying float vDepth;

      void main() {
        // ease the morph per-particle so the swarm arrives in waves
        float stagger = aSeed * 0.32;
        float m = clamp((uMix - stagger) / (1.0 - 0.32), 0.0, 1.0);
        m = m * m * (3.0 - 2.0 * m);
        vec3 pos = mix(aPosA, aPosB, m);

        // idle drift
        float t = uTime * 0.4 + aSeed * 6.2831;
        pos += vec3(sin(t * 0.9), cos(t * 1.13), sin(t * 0.71)) * 0.42;

        // outward burst at the midpoint of a morph
        pos += normalize(pos + 0.0001) * sin(m * 3.14159) * (2.0 + aSeed * 4.5);

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);

        // cursor pushes particles aside in view space
        vec2 d = mv.xy - uMouse;
        float dd = dot(d, d);
        mv.xy += normalize(d + 0.0001) * uMouseStr * exp(-dd / 260.0);

        vDepth = -mv.z;
        vSeed = aSeed;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * aScale * uDpr * (70.0 / max(vDepth, 0.1));
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uOpacity;
      varying float vSeed;
      varying float vDepth;

      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float alpha = pow(smoothstep(0.5, 0.0, d), 1.7);
        vec3 col = mix(uColorA, uColorB, smoothstep(0.15, 0.95, vSeed));
        float fog = smoothstep(150.0, 30.0, vDepth);
        gl_FragColor = vec4(col, alpha * fog * uOpacity * 0.92);
      }
    `
  });

  const points = new THREE.Points(geo, material);
  scene.add(points);

  // On wide screens the copy occupies the left half — push the field right so
  // the two share the frame instead of fighting over it.
  function placeField() {
    points.position.x = innerWidth > 900 ? 17 : 0;
  }
  placeField();

  /* ------------------------------------------------------------ morph state */
  let currentF = 0;
  let morphing = false;

  function morphTo(index) {
    if (morphing || index === currentF) return;
    morphing = true;
    geo.attributes.aPosB.array.set(FORMATIONS[index]);
    geo.attributes.aPosB.needsUpdate = true;

    const start = performance.now(), DUR = 1750;
    (function step(now) {
      const p = Math.min((now - start) / DUR, 1);
      uniforms.uMix.value = p;
      if (p < 1) return requestAnimationFrame(step);
      // bake the result back into A and reset, so the next morph starts clean
      geo.attributes.aPosA.array.set(FORMATIONS[index]);
      geo.attributes.aPosA.needsUpdate = true;
      uniforms.uMix.value = 0;
      currentF = index;
      morphing = false;
    })(start);

    document.querySelectorAll(".formation").forEach((b, i) => {
      b.classList.toggle("is-active", i === index);
      b.setAttribute("aria-pressed", i === index ? "true" : "false");
    });
  }

  document.querySelectorAll(".formation").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      autoCycle = false;                      // user took the wheel
      morphTo(i);
    });
  });

  let autoCycle = !reduce;
  setInterval(() => {
    if (autoCycle && visible && !document.hidden) {
      morphTo((currentF + 1) % FORMATIONS.length);
    }
  }, 6200);

  /* ------------------------------------------------------------ interaction */
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / innerHeight) * 2 - 1);
    // convert to a view-space point on the z=0 plane for the repulsion field
    const vh = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    uniforms.uMouse.value.set(mouse.tx * vh * camera.aspect, mouse.ty * vh);
    uniforms.uMouseStr.value = 7.5;
  }, { passive: true });

  addEventListener("pointerleave", () => { uniforms.uMouseStr.value = 0; });

  /* ------------------------------------------------------------------ loop */
  let visible = true;
  const hero = document.querySelector(".hero");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(
      ([e]) => { visible = e.isIntersecting; },
      { threshold: 0 }
    ).observe(hero);
  }

  const clock = new THREE.Clock();
  function render() {
    requestAnimationFrame(render);
    if (!visible || document.hidden) return;  // don't burn cycles off-screen

    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt;

    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;

    points.rotation.y += dt * 0.075;
    points.rotation.x = mouse.y * 0.28;
    points.rotation.z = mouse.x * 0.06;
    camera.position.x = mouse.x * 7;
    camera.position.y = mouse.y * 5;
    camera.lookAt(0, 0, 0);

    // fade the field out as the hero scrolls away
    uniforms.uOpacity.value = Math.max(0, 1 - scrollY / (innerHeight * 0.85));

    renderer.render(scene, camera);
  }
  render();

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
    placeField();
  });

  // first morph shortly after load so the page opens with movement
  if (!reduce) setTimeout(() => morphTo(1), 2600);

  document.documentElement.classList.add("webgl-on");
}
