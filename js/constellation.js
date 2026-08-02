/* ============================================================================
 * constellation.js — a draggable 3D sphere of the tech Joshua actually ships
 * with. Labels are canvas textures on sprites, arranged on a Fibonacci sphere,
 * wrapped in a wireframe icosahedron.
 * ==========================================================================*/
import * as THREE from "three";

const canvas = document.getElementById("stack-canvas");
if (canvas) boot();

function boot() {
  const TAGS = [
    { t: "Python",       w: 1.35 }, { t: "C++",           w: 1.35 },
    { t: "TypeScript",   w: 1.15 }, { t: "JavaScript",    w: 1.15 },
    { t: "pybind11",     w: 1.0  }, { t: "CMake",         w: 0.95 },
    { t: "NumPy",        w: 0.95 }, { t: "pandas",        w: 0.95 },
    { t: "Monte Carlo",  w: 1.1  }, { t: "Chain Ladder",  w: 0.95 },
    { t: "Bühlmann",     w: 0.9  }, { t: "IBNR",          w: 0.9  },
    { t: "LLM Agents",   x: 1, w: 1.3 }, { t: "MCP",      w: 1.1  },
    { t: "RAG",          w: 1.0  }, { t: "NLP",           w: 0.95 },
    { t: "GitHub Actions", w: 1.0 }, { t: "Jenkins",      w: 1.0  },
    { t: "CI/CD",        w: 1.05 }, { t: "PyPI",          w: 1.0  },
    { t: "Railway",      w: 0.95 }, { t: "Docker",        w: 0.9  },
    { t: "Stripe",       w: 0.95 }, { t: "Solidity",      w: 1.0  },
    { t: "FHE",          w: 0.9  }, { t: "SQL",           w: 0.95 },
    { t: "JSON",         w: 0.9  }, { t: "Jupyter",       w: 0.9  },
    { t: "scikit-build", w: 0.9  }, { t: "Three.js",      w: 0.95 },
    { t: "Data Viz",     w: 1.0  }, { t: "Excel Automation", w: 0.85 }
  ];

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    canvas.closest(".stack")?.remove();
    return;
  }

  const size = () => ({
    w: canvas.clientWidth || 600,
    h: canvas.clientHeight || 460
  });
  let { w, h } = size();

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.z = 30;

  const group = new THREE.Group();
  scene.add(group);

  /* ------------------------------------------------------------- wireframe */
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(10.4, 1)),
    new THREE.LineBasicMaterial({ color: 0xffa63d, transparent: true, opacity: 0.13 })
  );
  group.add(shell);

  /* ---------------------------------------------------------- label sprites */
  const isLight = () => document.documentElement.getAttribute("data-theme") === "light";

  function labelTexture(text, accent) {
    const pad = 26, font = 700 + " " + 60 + "px ui-monospace, Menlo, monospace";
    const m = document.createElement("canvas").getContext("2d");
    m.font = font;
    const tw = Math.ceil(m.measureText(text).width);
    const c = document.createElement("canvas");
    c.width = tw + pad * 2;
    c.height = 110;
    const g = c.getContext("2d");
    g.font = font;
    g.textBaseline = "middle";
    g.textAlign = "center";
    g.fillStyle = accent ? "#ffb257" : (isLight() ? "#1b1e24" : "#e9ecf1");
    g.fillText(text, c.width / 2, c.height / 2);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return { tex, ratio: c.width / c.height };
  }

  const sprites = [];
  const gold = Math.PI * (3 - Math.sqrt(5));
  const R = 10.4;

  TAGS.forEach((tag, i) => {
    const y = 1 - (i / (TAGS.length - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = gold * i;

    const { tex, ratio } = labelTexture(tag.t, !!tag.x);
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    );
    const scl = 1.5 * tag.w;
    sp.scale.set(scl * ratio, scl, 1);
    sp.position.set(Math.cos(th) * r * R, y * R, Math.sin(th) * r * R);
    group.add(sp);
    sprites.push(sp);

    const dot = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xffa63d, transparent: true, opacity: 0.5, depthTest: false })
    );
    dot.scale.setScalar(0.16);
    dot.position.copy(sp.position).multiplyScalar(1.045);
    group.add(dot);
  });

  // repaint labels when the theme flips
  new MutationObserver(() => {
    TAGS.forEach((tag, i) => {
      const { tex } = labelTexture(tag.t, !!tag.x);
      sprites[i].material.map.dispose();
      sprites[i].material.map = tex;
      sprites[i].material.needsUpdate = true;
    });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ------------------------------------------------------------- drag spin */
  const vel = { x: 0.0016, y: 0.0035 };
  let dragging = false, last = { x: 0, y: 0 };

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    vel.y = (e.clientX - last.x) * 0.00042;
    vel.x = (e.clientY - last.y) * 0.00042;
    group.rotation.y += (e.clientX - last.x) * 0.0055;
    group.rotation.x += (e.clientY - last.y) * 0.0055;
    last = { x: e.clientX, y: e.clientY };
  });
  const stop = (e) => {
    dragging = false;
    canvas.style.cursor = "grab";
    if (e && e.pointerId != null && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
  };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  /* ------------------------------------------------------------------ loop */
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 })
    .observe(canvas);

  (function render() {
    requestAnimationFrame(render);
    if (!visible || document.hidden) return;

    if (!dragging) {
      group.rotation.y += vel.y;
      group.rotation.x += vel.x;
      vel.x += (0.0006 - vel.x) * 0.02;       // ease back to the idle drift
      vel.y += (0.0035 - vel.y) * 0.02;
    }
    group.rotation.x = Math.max(-0.85, Math.min(0.85, group.rotation.x));

    // labels facing away fade out, so the sphere reads as a sphere
    const camDir = new THREE.Vector3();
    sprites.forEach((sp) => {
      camDir.copy(sp.position).applyQuaternion(group.quaternion).normalize();
      sp.material.opacity = 0.2 + Math.max(0, camDir.z) * 0.95;
    });

    renderer.render(scene, camera);
  })();

  addEventListener("resize", () => {
    ({ w, h } = size());
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });

  canvas.style.cursor = "grab";
}
