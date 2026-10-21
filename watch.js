const THREE = window.__THREE;

const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const ss = t => t * t * (3 - 2 * t);

export const EDITIONS = [
  { case: 0xdedfdf, rough: 0.16, strap: 0x141c30, d0: '#21396b', d1: '#070f24', ink: '#dcc293', moonBg: '#0c1838' },
  { case: 0xeab49a, rough: 0.19, strap: 0x3a2317, d0: '#e7b197', d1: '#a6624a', ink: '#4b2416', moonBg: '#2a1a3a' },
  { case: 0x4a4a4e, rough: 0.33, strap: 0x0f0f10, d0: '#45474c', d1: '#111214', ink: '#dcc293', moonBg: '#101114' },
];

function cnv(S) { const c = document.createElement('canvas'); c.width = c.height = S; return [c, c.getContext('2d')]; }

function dialCanvas(ed, R) {
  const S = 1024, [c, g] = cnv(S), cx = S / 2, px = u => (u / R) * (S / 2);
  const gr = g.createRadialGradient(cx * 0.8, cx * 0.7, 0, cx, cx, S * 0.62);
  gr.addColorStop(0, ed.d0); gr.addColorStop(1, ed.d1);
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  g.save(); g.translate(cx, cx);
  for (let i = 0; i < 900; i++) { g.rotate(TAU / 900); g.fillStyle = i % 2 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)'; g.fillRect(0, -0.8, cx, 1.6); }
  g.restore();
  g.save(); g.translate(cx, cx); g.strokeStyle = ed.ink;
  for (let i = 0; i < 60; i++) {
    const a = i / 60 * TAU, big = i % 5 === 0;
    const r0 = px(big ? 1.7 : 1.73), r1 = px(1.77);
    g.lineWidth = big ? 3 : 1.6; g.globalAlpha = big ? 0.9 : 0.6;
    g.beginPath(); g.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); g.lineTo(Math.sin(a) * r1, -Math.cos(a) * r1); g.stroke();
  }
  g.globalAlpha = 1; g.fillStyle = ed.ink; g.textAlign = 'center'; g.textBaseline = 'middle';
  try { g.letterSpacing = '9px'; } catch (e) {}
  g.font = '500 38px "Cormorant Garamond", Georgia, serif'; g.fillText('VAUCLAIR', 0, -px(0.36));
  try { g.letterSpacing = '5px'; } catch (e) {}
  g.font = '400 13px "IBM Plex Mono", monospace'; g.globalAlpha = 0.8; g.fillText('PERIHELION', 0, -px(0.24));
  g.font = '400 11px "IBM Plex Mono", monospace'; g.globalAlpha = 0.65; g.fillText('SWISS MADE', 0, px(1.6));
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(1 / (2 * R), 1 / (2 * R)); t.offset.set(0.5, 0.5);
  return t;
}

function moonCanvas(ed) {
  const S = 512, [c, g] = cnv(S), cx = S / 2;
  g.fillStyle = ed.moonBg; g.fillRect(0, 0, S, S);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(232,205,150,${0.4 + rnd() * 0.6})`; g.beginPath(); g.arc(rnd() * S, rnd() * S, 0.6 + rnd() * 1.6, 0, TAU); g.fill(); }
  const moon = (x, y) => {
    const r = cx * 0.2 / 0.72 * 1.0;
    const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    gr.addColorStop(0, '#f6dfa8'); gr.addColorStop(1, '#b88c45');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.fillStyle = 'rgba(120,85,35,0.25)';
    [[-0.3, -0.1, 0.22], [0.25, 0.2, 0.16], [0.05, -0.4, 0.1], [0.3, -0.25, 0.08]].forEach(([a, b, s]) => { g.beginPath(); g.arc(x + a * r, y + b * r, s * r, 0, TAU); g.fill(); });
  };
  const off = cx * 0.46 / 0.72;
  moon(cx, cx - off); moon(cx, cx + off);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function cotesCanvas() {
  const S = 512, [c, g] = cnv(S);
  g.fillStyle = '#c4c8cc'; g.fillRect(0, 0, S, S);
  g.save(); g.translate(S / 2, S / 2); g.rotate(-0.5);
  const w = 46;
  for (let x = -S; x < S; x += w) {
    const gr = g.createLinearGradient(x, 0, x + w, 0);
    gr.addColorStop(0, '#8e9398'); gr.addColorStop(0.35, '#eef0f2'); gr.addColorStop(0.6, '#d6d9dc'); gr.addColorStop(1, '#8e9398');
    g.fillStyle = gr; g.fillRect(x, -S, w, S * 2);
  }
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.7, 0.7); return t;
}

function perlageCanvas() {
  const S = 512, [c, g] = cnv(S);
  g.fillStyle = '#a9adb2'; g.fillRect(0, 0, S, S);
  const st = 28;
  for (let y = 0; y < S + st; y += st * 0.8) for (let x = 0; x < S + st; x += st * 0.8) {
    const gr = g.createRadialGradient(x - 3, y - 3, 1, x, y, st * 0.62);
    gr.addColorStop(0, '#f2f3f5'); gr.addColorStop(0.6, '#b8bcc1'); gr.addColorStop(1, '#8a8f95');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, st * 0.62, 0, TAU); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.9, 0.9); return t;
}

function crocCanvas() {
  const S = 512, [c, g] = cnv(S);
  g.fillStyle = '#808080'; g.fillRect(0, 0, S, S);
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < S; y += 36) {
    let x = -rnd() * 30;
    while (x < S) { const w = 30 + rnd() * 34; g.fillStyle = `rgb(${150 + rnd() * 60|0},${150 + rnd() * 60|0},${150 + rnd() * 60|0})`; g.beginPath(); g.roundRect(x + 3, y + 3, w - 6, 30, 7); g.fill(); x += w; }
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3.5); return t;
}

function gearShape(r, n, d = 0.035, windows = 5, hub = 0.07) {
  const s = new THREE.Shape(), w = TAU / n;
  for (let i = 0; i < n; i++) {
    const a = i * w, P = (rr, aa) => [Math.cos(aa) * rr, Math.sin(aa) * rr];
    const pts = [P(r - d, a), P(r, a + w * 0.18), P(r, a + w * 0.42), P(r - d, a + w * 0.6)];
    pts.forEach((p, k) => (i === 0 && k === 0 ? s.moveTo(p[0], p[1]) : s.lineTo(p[0], p[1])));
  }
  const ro = r - d - 0.04, ri = hub + 0.03;
  if (windows && ro - ri > 0.05) {
    for (let k = 0; k < windows; k++) {
      const a1 = k / windows * TAU + 0.12, a2 = (k + 1) / windows * TAU - 0.12;
      const p = new THREE.Path(); p.absarc(0, 0, ro, a1, a2, false); p.absarc(0, 0, ri, a2, a1, true); s.holes.push(p);
    }
  }
  const h = new THREE.Path(); h.absarc(0, 0, 0.022, 0, TAU, true); s.holes.push(h);
  return s;
}

function stadium(a, b, r) {
  const s = new THREE.Shape(), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  s.absarc(b[0], b[1], r, ang - Math.PI / 2, ang + Math.PI / 2, false);
  s.absarc(a[0], a[1], r, ang + Math.PI / 2, ang + Math.PI * 1.5, false);
  return s;
}

const flat = (shape, depth, opts = {}) => { const g = new THREE.ExtrudeGeometry(shape, Object.assign({ depth, bevelEnabled: false, curveSegments: 48 }, opts)); g.rotateX(-Math.PI / 2); return g; };
const lathe = pts => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 160);

export async function createWatch(canvas, { mobile = false } = {}) {
  try { await Promise.all([document.fonts.load('500 38px "Cormorant Garamond"'), document.fonts.load('400 13px "IBM Plex Mono"')]); } catch (e) {}
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.75 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);

  // Studio environment: softboxes rendered into a PMREM
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene(); env.background = new THREE.Color(0x030302);
  const panel = (w, h, pos, rot, col, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.rotation.set(...rot); env.add(m); };
  panel(7, 2.2, [-3, 6, 2], [Math.PI / 2, 0, 0.5], 0xffffff, 3.2);
  panel(1.2, 9, [7, 0, 1], [0, -Math.PI / 2, 0], 0xffefd6, 2.4);
  panel(1, 9, [-7, 0, -1], [0, Math.PI / 2, 0], 0xdfe7ff, 1.1);
  panel(10, 3, [0, -6, 0], [-Math.PI / 2, 0, 0], 0x3a2a18, 0.9);
  panel(4, 4, [1, 2, -7], [0, 0, 0], 0xffd29a, 1.6);
  panel(12, 1.1, [0, 3.5, 7], [0, Math.PI, 0], 0xffffff, 1.8);
  panel(3, 1, [-4, -2, 6], [0, Math.PI * 0.8, 0], 0xffe2bf, 1.2);
  const envRT = pmrem.fromScene(env, 0.025);
  scene.environment = envRT.texture;

  const key = new THREE.DirectionalLight(0xfff1de, 1.4); key.position.set(-4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd39a, 2.4); rim.position.set(6, 3, -6); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xf1e6d4, 0x0a0806, 0.25));

  // Materials
  const caseMat = new THREE.MeshPhysicalMaterial({ color: EDITIONS[0].case, metalness: 1, roughness: 0.16, clearcoat: 0.35, clearcoatRoughness: 0.08 });
  const goldMat = new THREE.MeshPhysicalMaterial({ color: 0xf0cf95, metalness: 1, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.05, envMapIntensity: 1.8, emissive: 0x2a1c08 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xd8dbe0, metalness: 1, roughness: 0.12 });
  const bluedMat = new THREE.MeshStandardMaterial({ color: 0x2a52b8, metalness: 1, roughness: 0.2 });
  const rubyMat = new THREE.MeshPhysicalMaterial({ color: 0xb3123d, metalness: 0, roughness: 0.04, clearcoat: 1, emissive: 0x3a0010 });
  const crystalMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.12, depthWrite: false, envMapIntensity: 2.4, clearcoat: 1 });
  const cotes = cotesCanvas(), perl = perlageCanvas(), croc = crocCanvas();
  [cotes, perl, croc].forEach(t => (t.anisotropy = aniso));
  const bridgeMat = new THREE.MeshStandardMaterial({ map: cotes, metalness: 1, roughness: 0.26 });
  const plateMat = new THREE.MeshStandardMaterial({ map: perl, metalness: 1, roughness: 0.32 });
  const strapMat = new THREE.MeshStandardMaterial({ color: EDITIONS[0].strap, roughness: 0.58, metalness: 0, bumpMap: croc, bumpScale: 2.2, side: THREE.DoubleSide });
  const slotMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0c });

  const outer = new THREE.Group(), inner = new THREE.Group();
  inner.rotation.x = Math.PI / 2; outer.add(inner); scene.add(outer);
  const P = {}; ['crystal', 'hands', 'dial', 'moon', 'case', 'movement', 'back', 'strapA', 'strapB'].forEach(k => { P[k] = new THREE.Group(); inner.add(P[k]); });
  const EX = { crystal: 2.25, hands: 1.7, dial: 1.12, moon: 0.58, case: 0, movement: -1.05, back: -2.0 };

  // Case
  P.case.add(new THREE.Mesh(lathe([[1.62, -0.44], [1.8, -0.44], [1.93, -0.39], [2.0, -0.27], [2.025, -0.08], [2.01, 0.1], [1.97, 0.2], [1.62, 0.2]]), caseMat));
  P.case.add(new THREE.Mesh(lathe([[1.97, 0.19], [1.995, 0.22], [1.99, 0.31], [1.94, 0.37], [1.86, 0.385], [1.8, 0.34], [1.8, 0.15]]), caseMat));
  {
    const n = mobile ? 120 : 180, fl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.075, 0.016), caseMat, n), d = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const a = i / n * TAU; d.position.set(Math.cos(a) * 1.998, 0.265, Math.sin(a) * 1.998); d.rotation.set(0, -a, 0); d.updateMatrix(); fl.setMatrixAt(i, d.matrix); }
    P.case.add(fl);
  }
  {
    const ls = new THREE.Shape();
    ls.moveTo(1.5, 0.16); ls.quadraticCurveTo(2.2, 0.15, 2.7, -0.15); ls.lineTo(2.72, -0.36); ls.quadraticCurveTo(2.1, -0.3, 1.5, -0.42); ls.lineTo(1.5, 0.16);
    const lg = new THREE.ExtrudeGeometry(ls, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 4, curveSegments: 24 });
    lg.translate(0, 0, -0.11); lg.rotateY(-Math.PI / 2);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const m = new THREE.Mesh(lg, caseMat); m.position.x = sx * 1.07; m.scale.z = sz; P.case.add(m); }
  }
  {
    const cg = new THREE.CylinderGeometry(0.21, 0.21, 0.3, 96, 1);
    const p = cg.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z); if (r > 0.15) { const a = Math.atan2(z, x), k = 1 + 0.05 * Math.max(0, Math.cos(a * 28)); p.setX(i, x * k); p.setZ(i, z * k); } }
    cg.computeVertexNormals(); cg.rotateZ(Math.PI / 2);
    const crown = new THREE.Mesh(cg, caseMat); crown.position.set(2.2, -0.1, 0); P.case.add(crown);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 48).rotateZ(Math.PI / 2), goldMat); cap.position.set(2.36, -0.1, 0); P.case.add(cap);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 32).rotateZ(Math.PI / 2), caseMat); stem.position.set(2.03, -0.1, 0); P.case.add(stem);
  }

  // Dial
  const R = 1.82;
  const ds = new THREE.Shape(); ds.absarc(0, 0, R, 0, TAU, false);
  const mh = new THREE.Path(); mh.moveTo(-0.46, 0.62); mh.absarc(0, 0.62, 0.46, Math.PI, 0, true); mh.absarc(0.23, 0.62, 0.23, 0, Math.PI, false); mh.absarc(-0.23, 0.62, 0.23, 0, Math.PI, false);
  const th = new THREE.Path(); th.absarc(0, -0.84, 0.48, 0, TAU, true);
  ds.holes.push(mh, th);
  const dg = flat(ds, 0.04, { curveSegments: 96 });
  const dialTex = EDITIONS.map(e => { const t = dialCanvas(e, R); t.anisotropy = aniso; return t; });
  const moonTex = EDITIONS.map(e => moonCanvas(e));
  const dialMat = new THREE.MeshPhysicalMaterial({ map: dialTex[0], metalness: 0.12, roughness: 0.36, clearcoat: 1, clearcoatRoughness: 0.04 });
  const dial = new THREE.Mesh(dg, dialMat); dial.position.y = 0.1; P.dial.add(dial);
  const dialBMat = dialMat.clone(); dialBMat.transparent = true; dialBMat.opacity = 0; dialBMat.polygonOffset = true; dialBMat.polygonOffsetFactor = -2;
  const dialB = new THREE.Mesh(dg, dialBMat); dialB.position.y = 0.1005; dialB.visible = false; P.dial.add(dialB);
  P.dial.add(Object.assign(new THREE.Mesh(lathe([[1.84, 0.13], [1.81, 0.2], [1.79, 0.2]]), caseMat)));
  {
    const ig = new THREE.BoxGeometry(0.055, 0.04, 0.26);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, offs = i === 0 ? [-0.055, 0.055] : [0];
      for (const o of offs) {
        const m = new THREE.Mesh(ig, goldMat), cx = Math.sin(a) * 1.48 + Math.cos(a) * o, cz = -Math.cos(a) * 1.48 + Math.sin(a) * o;
        m.position.set(cx, 0.16, cz); m.rotation.y = -a; P.dial.add(m);
      }
    }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.014, 8, 96), goldMat); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.14, 0.84); P.dial.add(ring);
  }

  // Moon disc
  const moonPivot = new THREE.Group(); moonPivot.position.set(0, 0.07, -0.38); P.moon.add(moonPivot);
  const moonMat = new THREE.MeshPhysicalMaterial({ map: moonTex[0], metalness: 0.35, roughness: 0.32, clearcoat: 0.6 });
  moonPivot.add(new THREE.Mesh(new THREE.CircleGeometry(0.72, 96).rotateX(-Math.PI / 2), moonMat));

  // Hands
  const dauph = (L, w) => { const s = new THREE.Shape(); s.moveTo(0, -0.16); s.lineTo(w, 0.02); s.lineTo(0, L); s.lineTo(-w, 0.02); s.lineTo(0, -0.16); const g = new THREE.ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.036, bevelSegments: 1 }); g.rotateX(-Math.PI / 2); return g; };
  const hourP = new THREE.Group(), minP = new THREE.Group();
  const hh = new THREE.Mesh(dauph(0.9, 0.03), goldMat); hh.position.y = 0.17; hourP.add(hh);
  const mm = new THREE.Mesh(dauph(1.42, 0.026), goldMat); mm.position.y = 0.2; minP.add(mm);
  P.hands.add(hourP, minP);
  const capM = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.05, 32), goldMat); capM.position.y = 0.22; P.hands.add(capM);

  // Movement
  const plS = new THREE.Shape(); plS.absarc(0, 0, 1.72, 0, TAU, false);
  const plH = new THREE.Path(); plH.absarc(0, -0.84, 0.5, 0, TAU, true); plS.holes.push(plH);
  const plG = flat(plS, 0.07, { curveSegments: 96 });
  const plate = new THREE.Mesh(plG, plateMat); plate.position.y = -0.2; P.movement.add(plate);
  perl.repeat.set(0.9, 0.9);

  const tb = new THREE.Group(); tb.position.set(0, -0.03, 0.84); P.movement.add(tb);
  const cage = new THREE.Group(); tb.add(cage);
  for (const y of [0.08, -0.13]) {
    const rg = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.02, 10, 72), steelMat); rg.rotation.x = Math.PI / 2; rg.position.y = y; cage.add(rg);
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + (y > 0 ? 0 : Math.PI / 3); const arm = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.022, 0.05), steelMat); arm.position.set(Math.cos(a) * 0.21, y, Math.sin(a) * 0.21); arm.rotation.y = -a; cage.add(arm); }
  }
  for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + Math.PI / 6; const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.21, 12), steelMat); pl.position.set(Math.cos(a) * 0.42, -0.025, Math.sin(a) * 0.42); cage.add(pl); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 24), steelMat); hub.position.y = 0.09; cage.add(hub);
  const jw = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 24), rubyMat); jw.position.y = 0.105; cage.add(jw);
  const balance = new THREE.Group(); balance.position.y = -0.03; cage.add(balance);
  { const bw = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.022, 10, 72), goldMat); bw.rotation.x = Math.PI / 2; balance.add(bw);
    for (let k = 0; k < 3; k++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.012, 0.028), goldMat); sp.rotation.y = k / 3 * Math.PI; balance.add(sp); }
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, sc = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 8), goldMat); sc.position.set(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32); balance.add(sc); }
    const pts = []; for (let i = 0; i <= 260; i++) { const u = i / 260, a = u * TAU * 9, r = 0.05 + u * 0.17; pts.push(new THREE.Vector3(Math.cos(a) * r, 0.03, Math.sin(a) * r)); }
    balance.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), mobile ? 260 : 520, 0.0035, 4), bluedMat));
  }
  const escape = new THREE.Mesh(flat(gearShape(0.12, 15, 0.03, 0), 0.02), steelMat); escape.position.set(0.24, -0.11, 0.12); cage.add(escape);

  const gears = [];
  const addGear = (r, n, x, y, sp, mat = goldMat, lvl = -0.25, thick = 0.03) => { const m = new THREE.Mesh(flat(gearShape(r, n), thick), mat); m.position.set(x, lvl, -y); P.movement.add(m); gears.push([m, sp]); return m; };
  addGear(0.56, 80, -0.72, 0.62, 0.02);
  addGear(0.4, 64, 0.12, 0.08, 1);
  addGear(0.32, 54, 0.78, -0.12, -6);
  addGear(0.27, 46, 0.92, -0.72, 40);
  addGear(0.2, 30, 1.25, 0.45, -0.3);
  addGear(0.42, 90, -0.72, 0.62, -0.05, steelMat, -0.365, 0.025);

  const bridges = [[[-1.2, 0.72], [-0.2, 1.0], 0.36], [[0.12, 0.08], [0.92, -0.72], 0.2], [[-0.64, -0.84], [0.64, -0.84], 0.08], [[-1.25, -0.3], [-0.5, -0.12], 0.22], [[0.62, 0.95], [1.3, 0.32], 0.17]];
  const ends = [];
  bridges.forEach(([a, b, r]) => {
    const g = new THREE.ExtrudeGeometry(stadium(a, b, r), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 32 }); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, bridgeMat); m.position.y = -0.33; P.movement.add(m); ends.push(a, b);
  });
  const jewelG = new THREE.CylinderGeometry(0.045, 0.045, 0.012, 24), chatonG = new THREE.CylinderGeometry(0.075, 0.075, 0.008, 32), screwG = new THREE.CylinderGeometry(0.055, 0.055, 0.02, 24), slotG = new THREE.BoxGeometry(0.1, 0.006, 0.014);
  [[0.12, 0.08], [0.78, -0.12], [0.92, -0.72], [0, -0.84], [1.25, 0.45], [-0.85, -0.2]].forEach(([x, y]) => {
    const c = new THREE.Mesh(chatonG, goldMat); c.position.set(x, -0.348, -y); P.movement.add(c);
    const j = new THREE.Mesh(jewelG, rubyMat); j.position.set(x, -0.352, -y); P.movement.add(j);
  });
  ends.forEach(([x, y], i) => {
    if (i === 4 || i === 5) return;
    const ox = x + 0.12 * Math.cos(i), oy = y + 0.12 * Math.sin(i);
    const s = new THREE.Mesh(screwG, bluedMat); s.position.set(ox, -0.35, -oy); P.movement.add(s);
    const sl = new THREE.Mesh(slotG, slotMat); sl.position.set(ox, -0.361, -oy); sl.rotation.y = i * 0.7; P.movement.add(sl);
  });

  // Caseback
  P.back.add(new THREE.Mesh(lathe([[1.38, -0.47], [1.4, -0.55], [1.62, -0.55], [1.76, -0.5], [1.8, -0.44]]), caseMat));
  const bc = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.03, 96), crystalMat); bc.position.y = -0.5; bc.renderOrder = 2; P.back.add(bc);

  // Crystal
  { const Rs = 10, tht = Math.asin(1.82 / Rs); const cg = new THREE.SphereGeometry(Rs, 128, 8, 0, TAU, 0, tht); const cr = new THREE.Mesh(cg, crystalMat); cr.position.y = 0.36 - Rs * Math.cos(tht); cr.renderOrder = 3; P.crystal.add(cr); }

  // Straps
  const strapGeo = () => {
    const L = 5.4, W = 1.88, T = 0.11, Rb = 2.4; const g = new THREE.BoxGeometry(W, T, L, 1, 1, mobile ? 48 : 80); g.translate(0, 0, L / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i); const y = p.getY(i), t = p.getZ(i), a = Math.min(t / Rb, 2.2), ex = t - a * Rb;
      x *= 1 - 0.15 * Math.min(1, t / 3.4);
      let zc = Rb * Math.sin(a) + ex * Math.cos(a), yc = -Rb * (1 - Math.cos(a)) - ex * Math.sin(a);
      p.setXYZ(i, x, yc + y * Math.cos(a), zc + y * Math.sin(a));
    }
    g.computeVertexNormals(); return g;
  };
  const sg = strapGeo();
  P.strapA.add(new THREE.Mesh(sg, strapMat)); P.strapB.add(new THREE.Mesh(sg, strapMat)); P.strapB.scale.z = -1;

  // Label anchors (local to parts)
  const anchors = [['crystal', 1.75, 0.4, 0.2], ['hands', 0.55, 0.2, -0.55], ['dial', 1.82, 0.12, 0.25], ['moon', 0.5, 0.07, -0.7], ['movement', 1.72, -0.2, 0.2], ['case', 2.03, -0.05, 0.4]].map(([k, x, y, z]) => ({ part: P[k], v: new THREE.Vector3(x, y, z) }));

  // State
  let dist = 10, aspect = 1, W = 1, H = 1, t = 0, moonA = 0, moonTarget = 0, ed = 0, fade = 1;
  const tgt = { case: new THREE.Color(EDITIONS[0].case), strap: new THREE.Color(EDITIONS[0].strap), rough: EDITIONS[0].rough };
  function resize() {
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setSize(W, H, false); aspect = W / H; camera.aspect = aspect;
    dist = Math.max(10, 2.8 / (Math.tan(THREE.MathUtils.degToRad(15)) * aspect));
    camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  }
  resize();

  function setEdition(i) {
    if (i === ed) return; ed = i; const e = EDITIONS[i];
    tgt.case.set(e.case); tgt.strap.set(e.strap); tgt.rough = e.rough;
    dialBMat.map = dialTex[i]; dialBMat.needsUpdate = true; dialBMat.opacity = 0; dialB.visible = true; fade = 0;
    moonMat.map = moonTex[i]; moonMat.needsUpdate = true;
  }
  function setMoon(day) { moonTarget = (day / 29.530588 - 0.5) * Math.PI; }

  const tv = new THREE.Vector3();
  function frame({ pose, dt, mx = 0, my = 0, intro = 1, visible = true }) {
    t += dt;
    const k = 1 - Math.exp(-dt * 3.5);
    caseMat.color.lerp(tgt.case, k); strapMat.color.lerp(tgt.strap, k); caseMat.roughness = lerp(caseMat.roughness, tgt.rough, k);
    if (fade < 1) { fade = Math.min(1, fade + dt * 1.4); dialBMat.opacity = ss(fade); if (fade >= 1) { dialMat.map = dialTex[ed]; dialMat.needsUpdate = true; dialB.visible = false; } }
    if (!visible) { canvas.style.visibility = 'hidden'; return null; }
    canvas.style.visibility = 'visible';

    const d = new Date(), sec = d.getSeconds() + d.getMilliseconds() / 1000, min = d.getMinutes() + sec / 60, hr = (d.getHours() % 12) + min / 60;
    hourP.rotation.y = -hr / 12 * TAU; minP.rotation.y = -min / 60 * TAU;
    cage.rotation.y = -sec / 60 * TAU;
    balance.rotation.y = Math.sin(t * TAU * 4) * 1.7;
    escape.rotation.y = -Math.floor(t * 8) * (TAU / 30);
    gears.forEach(([m, s]) => (m.rotation.y = -t * 0.05 * s));
    moonA = lerp(moonA, moonTarget, 1 - Math.exp(-dt * 6)); moonPivot.rotation.y = moonA;

    const e = pose.e || 0;
    for (const kk in EX) P[kk].position.y = EX[kk] * e;
    P.strapA.position.set(0, -0.26 - e * 0.6, 2.56 + e * 1.8);
    P.strapB.position.set(0, -0.26 - e * 0.6, -(2.56 + e * 1.8));

    const halfH = dist * Math.tan(THREE.MathUtils.degToRad(15)), halfW = halfH * aspect;
    const ie = 1 - Math.pow(1 - intro, 3);
    const s = pose.s * (0.78 + 0.22 * ie);
    outer.position.set(pose.x * halfW, pose.y * halfH - (pose.fz || 0) * 0.84 * s, 0);
    outer.scale.setScalar(s);
    outer.rotation.set(pose.rx + my * 0.07, pose.ry + mx * 0.12 - (1 - ie) * 1.6, pose.rz + (1 - ie) * 0.3);
    renderer.toneMappingExposure = 0.1 + 0.95 * ie;
    renderer.render(scene, camera);

    const out = { labels: null, center: null };
    tv.copy(outer.position).project(camera); out.center = [(tv.x + 1) / 2 * W, (1 - tv.y) / 2 * H, s];
    if (e > 0.05) {
      out.labels = anchors.map(a => { tv.copy(a.v); a.part.localToWorld(tv); tv.project(camera); return [(tv.x + 1) / 2 * W, (1 - tv.y) / 2 * H]; });
    }
    return out;
  }

  window.addEventListener('resize', resize);
  // warm up shaders
  renderer.compile(scene, camera);
  return { frame, setEdition, setMoon, resize };
}
