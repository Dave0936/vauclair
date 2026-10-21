const docW = () => (document.body && document.body.clientWidth) || window.innerWidth;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));

const ED = [
  { name: 'Nocturne', metal: 'Platinum 950', n: 40, desc: 'Midnight grand feu enamel in a platinum case. The sky an hour after dusk.' },
  { name: 'Aube', metal: '18k 5N rose gold', n: 30, desc: 'Salmon enamel in warm rose gold. The sky in the minute before sunrise.' },
  { name: 'Éclipse', metal: 'Blackened titanium', n: 18, desc: 'Slate enamel in grade 5 titanium. The sky at totality.' },
];
const CH = [['s-hero', 'I', 'Overture'], ['s-manifesto', 'II', 'Approach'], ['s-explode', 'III', 'Anatomy'], ['s-movement', 'IV', 'Calibre'], ['s-moon', 'V', 'The moon'], ['s-editions', 'VI', 'Editions'], ['s-interlude', 'VI', 'Perihelion'], ['s-atelier', 'VII', 'Atelier'], ['s-film', 'VIII', 'Film'], ['s-reserve', 'IX', 'Allocation']];
const SECS = CH.map(c => c[0]);

export async function start() {
  const root = document.getElementById('loader'); if (!root || root.__started) return; root.__started = 1;
  try { history.scrollRestoration = 'manual'; } catch (e) {}
  const mob = () => docW() < 760;
  const fine = matchMedia('(pointer:fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // responsive inline-style overrides
  const resp = $$('[data-m]'); resp.forEach(e => (e.dataset.d = e.getAttribute('style') || ''));
  let lastMob = null;
  const applyResp = () => { const m = mob(); if (m === lastMob) return; lastMob = m; resp.forEach(e => e.setAttribute('style', e.dataset.d + (m ? ';' + e.dataset.m : ''))); };
  applyResp();

  const grain = $('#grain');
  if (grain) grain.style.backgroundImage = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

  // split hero title + manifesto
  const ht = $('#hero-title-text');
  const letters = [];
  if (ht) { const txt = ht.textContent; ht.textContent = ''; [...txt].forEach((ch, i) => { const s = document.createElement('span'); s.textContent = ch; s.style.cssText = `display:inline-block;transform:translateY(105%);transition:transform 1.6s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.06}s`; ht.appendChild(s); letters.push(s); }); }
  const mt = $('#manifesto-text'); const words = [];
  if (mt) { const txt = mt.textContent.trim().split(/\s+/); mt.textContent = ''; txt.forEach((w, i) => { const s = document.createElement('span'); s.textContent = w; s.style.cssText = 'opacity:.14;transition:opacity .25s linear'; if (w === 'closer.' || w === 'nine') s.style.fontStyle = 'italic'; mt.appendChild(s); mt.appendChild(document.createTextNode(' ')); words.push(s); }); }

  // loader
  const pct = $('#loader-pct'), loader = $('#loader'), lline = $('#loader-line');
  let target = 8, shown = 0, loading = true;
  const t0 = performance.now();
  (function tickL() { shown += (target - shown) * 0.06; if (pct) pct.textContent = String(Math.round(shown)).padStart(3, '0'); if (lline) lline.style.transform = `scaleX(${shown / 100})`; if (loading) requestAnimationFrame(tickL); })();

  let watch = null;
  try {
    await (document.fonts ? document.fonts.ready : Promise.resolve());
    target = 35;
    const R = window.__resources || {};
    window.__THREE = await import(R.three || new URL('./three.module.js', document.baseURI).href);
    const mod = await import(R.watch || new URL('./watch.js', document.baseURI).href);
    target = 70;
    watch = await mod.createWatch($('#gl'), { mobile: mob() });
    target = 100;
  } catch (e) {
    console.warn('WebGL unavailable, using still', e);
    const fb = $('#fallback'); if (fb) fb.style.opacity = '1';
    target = 100;
  }
  await new Promise(r => { const w = () => (shown > 99 && performance.now() - t0 > 1400 ? r() : requestAnimationFrame(w)); w(); });
  loading = false;
  if (pct) pct.textContent = '100';
  loader.style.transition = 'transform 1.3s cubic-bezier(.76,0,.24,1), opacity 1.3s';
  loader.style.transform = 'translateY(-100%)';
  setTimeout(() => (loader.style.display = 'none'), 1400);
  letters.forEach(s => (s.style.transform = 'translateY(0)'));
  let introStart = performance.now() + 250;
  $$('[data-intro]').forEach((el, i) => { el.style.transition = `opacity 1.4s ease ${0.8 + i * 0.12}s, transform 1.4s cubic-bezier(.16,1,.3,1) ${0.8 + i * 0.12}s`; el.style.opacity = '1'; el.style.transform = 'none'; });

  // sections
  const secs = {};
  const track = $('#atelier-track'), atelier = $('#s-atelier');
  function measure() {
    applyResp();
    if (track && atelier) { const extra = Math.max(0, track.scrollWidth - docW()); atelier.style.height = (extra + innerHeight * 1.15) + 'px'; }
    SECS.forEach(id => { const el = document.getElementById(id); if (!el) return; const top = el.getBoundingClientRect().top + scrollY; secs[id] = { top, h: el.offsetHeight, len: Math.max(1, el.offsetHeight - innerHeight) }; });
    buildKeys();
    if (watch) watch.resize();
  }
  const prog = (id, y) => clamp((y - secs[id].top) / secs[id].len);
  const at = (id, f) => secs[id].top + f * secs[id].len;

  let keys = [];
  const PZ = o => Object.assign({ x: 0, y: 0, s: 1, rx: 0, ry: 0, rz: 0, e: 0, fz: 0 }, o);
  function buildKeys() {
    const p = docW() / innerHeight < 0.85;
    const d = (D, M) => PZ(p ? Object.assign({}, D, M) : D);
    const PI = Math.PI;
    keys = [
      [0, d({ x: 0, y: 0.0, s: 0.8, rx: -0.16, ry: 0.55, rz: 0.06 }, { y: 0.02, s: 1.0 })],
      [at('s-manifesto', 0.15), d({ x: 0.42, y: 0, s: 0.86, rx: -0.3, ry: -0.6, rz: -0.08 }, { x: 0, y: 0.52, s: 0.55 })],
      [at('s-manifesto', 0.85), d({ x: 0.42, y: 0, s: 0.86, rx: -0.45, ry: -0.22, rz: -0.04 }, { x: 0, y: 0.52, s: 0.55 })],
      [at('s-explode', 0.1), d({ x: 0.06, y: -0.04, s: 0.72, rx: -1.05, ry: 0.45 }, { x: -0.14, y: -0.06, s: 0.86 })],
      [at('s-explode', 0.42), d({ x: 0.06, y: -0.04, s: 0.72, rx: -1.05, ry: 0.62, e: 1 }, { x: -0.14, y: -0.06, s: 0.86, e: 1 })],
      [at('s-explode', 0.9), d({ x: 0.06, y: -0.04, s: 0.74, rx: -0.92, ry: 0.95, e: 1 }, { x: -0.14, y: -0.06, s: 0.88, e: 1 })],
      [at('s-movement', 0.14), d({ x: -0.36, y: 0, s: 0.88, rx: 0.14, ry: PI - 0.45 }, { x: 0, y: 0.48, s: 0.66 })],
      [at('s-movement', 0.9), d({ x: -0.36, y: 0, s: 0.92, rx: -0.08, ry: PI + 0.3 }, { x: 0, y: 0.48, s: 0.68 })],
      [at('s-moon', 0.14), d({ x: 0.24, y: 0.02, s: 3, rx: 0.04, ry: 0.06, fz: 1 }, { x: 0, y: 0.42, s: 1.9 })],
      [at('s-moon', 0.9), d({ x: 0.24, y: 0.02, s: 3.3, rx: -0.02, ry: -0.08, fz: 1 }, { x: 0, y: 0.42, s: 2.05 })],
      [at('s-editions', 0.12), d({ x: 0.26, y: 0, s: 0.86, rx: -0.14, ry: -0.45 }, { x: 0, y: 0.47, s: 0.64 })],
      [at('s-editions', 0.92), d({ x: 0.26, y: 0, s: 0.86, rx: -0.08, ry: 0.45 }, { x: 0, y: 0.47, s: 0.64 })],
      [secs['s-interlude'].top, d({ x: 0.26, y: 0.9, s: 0.95, rx: 0.25, ry: 0.7 }, { x: 0, y: 1.3, s: 0.78 })],
    ];
  }
  function poseAt(y) {
    if (y <= keys[0][0]) return Object.assign({}, keys[0][1]);
    for (let i = 0; i < keys.length - 1; i++) {
      const [y0, a] = keys[i], [y1, b] = keys[i + 1];
      if (y < y1) { const t = ss(clamp((y - y0) / Math.max(1, y1 - y0))); const o = {}; for (const k in a) o[k] = lerp(a[k], b[k], t); return o; }
    }
    return Object.assign({}, keys[keys.length - 1][1]);
  }

  // reveals
  const reveals = $$('[data-r]').map(el => { const [a, b] = el.dataset.r.split(' ').map(Number); const sec = el.dataset.sec || (el.closest('section') || {}).id; return { el, a, b, sec }; }).filter(r => r.sec);

  // editions
  let edition = -1;
  const edTabs = $$('[data-ed]');
  function setEdition(i) {
    if (i === edition) return; edition = i;
    if (watch) watch.setEdition(i);
    edTabs.forEach((b, k) => { b.style.opacity = k === i ? '1' : '0.38'; const bar = b.querySelector('[data-bar]'); if (bar) bar.style.transform = `scaleX(${k === i ? 1 : 0})`; });
    const bg = $('#bg-ed'), desc = $('#ed-desc');
    [bg, desc].forEach(el => { if (!el) return; el.style.transition = 'opacity .35s'; el.style.opacity = '0'; });
    setTimeout(() => { if (bg) { bg.textContent = ED[i].name; bg.style.opacity = ''; } if (desc) { desc.textContent = ED[i].desc; desc.style.opacity = '1'; } }, 360);
    $$('[data-pick]').forEach((b, k) => pick(k === i ? b : null, k));
  }
  edTabs.forEach((b, i) => b.addEventListener('click', () => { const y = at('s-editions', 0.05 + ((i + 0.5) / 3) * 0.9); scrollTo({ top: y, behavior: 'smooth' }); }));

  // reserve pills
  function pick(btn, k) { const all = $$('[data-pick]'); const b = all[k]; if (!b) return; const on = !!btn; b.style.background = on ? '#d6b98a' : 'transparent'; b.style.color = on ? '#0b0a09' : '#efe9de'; b.style.borderColor = on ? '#d6b98a' : 'rgba(239,233,222,.28)'; b.dataset.on = on ? '1' : ''; }
  $$('[data-pick]').forEach((b, k) => b.addEventListener('click', e => { e.preventDefault(); $$('[data-pick]').forEach((_, j) => pick(j === k ? 1 : null, j)); }));
  const form = $('#reserve-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const name = (form.querySelector('[name=name]') || {}).value || '';
    const ok = $('#form-ok'); const nm = $('#ok-name');
    if (nm) nm.textContent = name.split(' ')[0] || 'friend';
    form.style.transition = 'opacity .5s'; form.style.opacity = '0';
    setTimeout(() => { form.style.display = 'none'; if (ok) { ok.style.display = 'block'; requestAnimationFrame(() => (ok.style.opacity = '1')); } }, 500);
  });

  // film modal
  const modal = $('#film-modal');
  const openFilm = () => { modal.style.display = 'flex'; requestAnimationFrame(() => (modal.style.opacity = '1')); };
  const closeFilm = () => { modal.style.opacity = '0'; setTimeout(() => (modal.style.display = 'none'), 400); };
  $('#film-open')?.addEventListener('click', openFilm);
  $('#film-close')?.addEventListener('click', closeFilm);
  modal?.addEventListener('click', e => { if (e.target === modal) closeFilm(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeFilm(); });

  // sound — synthesized escapement ticks, 8 beats per second
  let actx = null, soundOn = false, tickTimer = null, beat = 0;
  const bars = $$('[data-sbar]'), slabel = $('#sound-label');
  function tick() {
    if (!actx) return; const now = actx.currentTime;
    const len = 0.012, buf = actx.createBuffer(1, actx.sampleRate * len, actx.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 4);
    const src = actx.createBufferSource(); src.buffer = buf;
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = beat++ % 2 ? 3400 : 2600; bp.Q.value = 6;
    const g = actx.createGain(); g.gain.value = 0.55;
    src.connect(bp).connect(g).connect(actx.destination); src.start(now);
  }
  $('#sound')?.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn) { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); tickTimer = setInterval(tick, 125); }
    else clearInterval(tickTimer);
    if (slabel) slabel.textContent = soundOn ? 'Sound on' : 'Sound off';
  });

  // pointer
  let mx = 0, my = 0, smx = 0, smy = 0, cx = docW() / 2, cy = innerHeight / 2, rx = cx, ry = cy;
  addEventListener('pointermove', e => { mx = e.clientX / docW() * 2 - 1; my = e.clientY / innerHeight * 2 - 1; cx = e.clientX; cy = e.clientY; }, { passive: true });
  const cur = $('#cursor'), curLabel = $('#cursor-label');
  let curHover = false, curText = '';
  if (fine && cur) {
    cur.style.display = 'flex'; document.documentElement.setAttribute('data-cursor', '');
    addEventListener('pointerover', e => { const h = e.target.closest && e.target.closest('a,button,[data-hover],input,select'); curHover = !!h; curText = h ? (h.dataset.cursor || '') : ''; });
  }

  // drag to orbit
  let yaw = 0, yawV = 0, dragging = false, lastX = 0, current = 's-hero';
  const dragOK = () => current === 's-movement' || current === 's-editions';
  addEventListener('pointerdown', e => { if (!dragOK() || (e.target.closest && e.target.closest('a,button,input,select,textarea,label'))) return; dragging = true; lastX = e.clientX; }, { passive: true });
  addEventListener('pointermove', e => { if (!dragging) return; const dx = e.clientX - lastX; lastX = e.clientX; yaw += dx * 0.008; yawV = dx * 0.5; }, { passive: true });
  ['pointerup', 'pointercancel'].forEach(t => addEventListener(t, () => (dragging = false)));

  // clocks
  const clock = $('#clock');
  const target27 = new Date('2027-01-03T00:00:00+01:00').getTime();
  const cd = ['#cd-d', '#cd-h', '#cd-m', '#cd-s'].map(s => $(s));
  function secondTick() {
    const now = new Date();
    if (clock) { try { clock.textContent = 'Le Brassus  ' + now.toLocaleTimeString('en-GB', { timeZone: 'Europe/Zurich', hour12: false }); } catch (e) { clock.textContent = now.toLocaleTimeString(); } }
    let s = Math.max(0, Math.floor((target27 - now.getTime()) / 1000));
    const v = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
    cd.forEach((el, i) => el && (el.textContent = String(v[i]).padStart(i ? 2 : 3, '0')));
  }
  secondTick(); setInterval(secondTick, 1000);
  const lunarAge = (((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % 29.530588 + 29.530588) % 29.530588;

  // DOM refs
  const heroContent = $('#hero-content'), heroTitle = $('#hero-title'), glow = $('#glow'), chap = $('#chap'), progress = $('#progress');
  const labelsWrap = $('#labels'), labels = $$('[data-label]'), moonDay = $('#moon-day'), interImg = $('#interlude-img'), scrollLine = $('#scroll-line');
  const clockWrap = $('#clock-wrap');
  let chapShown = '';

  measure();
  addEventListener('resize', () => { measure(); });
  addEventListener('load', measure);
  setTimeout(measure, 1200);
  if (location.hash) { const el = document.querySelector(location.hash); if (el) scrollTo(0, el.getBoundingClientRect().top + scrollY); } else scrollTo(0, 0);

  let sy = scrollY, last = performance.now(), dbg = null;
  const stickies = $$('main section > div').filter(d => getComputedStyle(d).position === 'sticky');
  window.__peek = y => {
    const main = $('main'); main.style.transform = ''; dbg = null; scrollTo(0, 0); measure();
    stickies.forEach(st => { const sec = st.parentElement; st.style.position = 'relative'; st.style.top = clamp(y - secs[sec.id].top, 0, sec.offsetHeight - innerHeight) + 'px'; });
    main.style.transform = `translateY(${-y}px)`; dbg = y; sy = y;
  };
  window.__at = at;
  setEdition(0);
  function frame(now) {
    if (!root.isConnected) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const ty = dbg ?? scrollY, vh = innerHeight;
    sy += (ty - sy) * (reduce ? 1 : 1 - Math.exp(-dt * 7)); if (Math.abs(ty - sy) < 0.05) sy = ty;
    smx += (mx - smx) * (1 - Math.exp(-dt * 3)); smy += (my - smy) * (1 - Math.exp(-dt * 3));

    // chapter
    let c = SECS[0]; for (const id of SECS) if (secs[id] && secs[id].top <= sy + vh * 0.45) c = id;
    current = c;
    if (chap && c !== chapShown) { chapShown = c; const ch = CH.find(x => x[0] === c); chap.style.opacity = '0'; setTimeout(() => { chap.textContent = `${ch[1]} — ${ch[2]}`; chap.style.opacity = '1'; }, 220); }
    if (progress) progress.style.transform = `scaleX(${clamp(sy / Math.max(1, document.documentElement.scrollHeight - vh))})`;

    // hero
    const hp = clamp(sy / (vh * 0.9));
    if (heroContent) heroContent.style.opacity = String(1 - clamp(sy / (vh * 0.45)));
    if (heroTitle) { heroTitle.style.opacity = String(1 - ss(hp)); heroTitle.style.transform = `translate(-50%,-50%) scale(${1 - 0.1 * hp})`; heroTitle.style.letterSpacing = `${-0.02 + hp * 0.06}em`; }
    if (scrollLine) scrollLine.style.transform = `scaleY(${(now / 1600) % 1})`;

    // manifesto
    if (words.length && secs['s-manifesto']) { const f = clamp((prog('s-manifesto', sy) - 0.06) / 0.72) * words.length * 1.02; words.forEach((w, i) => (w.style.opacity = String(0.14 + 0.86 * clamp(f - i)))); }

    // reveals
    for (const r of reveals) {
      if (!secs[r.sec]) continue;
      const p = prog(r.sec, sy), inn = clamp((p - r.a) / 0.07), out = r.b >= 1 ? 1 : clamp((r.b - p) / 0.07);
      const v = ss(inn * out);
      r.el.style.opacity = String(v);
      r.el.style.transform = `translate3d(0,${(1 - v) * 26}px,0)`;
    }

    // moon & editions
    if (secs['s-moon']) { const pm = clamp((prog('s-moon', sy) - 0.12) / 0.8); const day = (lunarAge + pm * 29.530588) % 29.530588; watch && watch.setMoon(day); if (moonDay) moonDay.textContent = day.toFixed(1).padStart(4, '0'); }
    if (secs['s-editions']) { const pe = prog('s-editions', sy); setEdition(Math.min(2, Math.floor(clamp((pe - 0.05) / 0.9) * 3))); }

    // interlude
    if (interImg && secs['s-interlude']) { const s = secs['s-interlude']; const pi = clamp((sy - (s.top - vh)) / (s.h + vh)); interImg.style.transform = `scale(${1.22 - 0.22 * pi})`; }
    if (track && secs['s-atelier']) { const pa = prog('s-atelier', sy); const ex = Math.max(0, track.scrollWidth - docW()); track.style.transform = `translate3d(${-ex * pa}px,0,0)`; }
    if (clockWrap) clockWrap.style.opacity = (mob() || !secs['s-interlude'] || sy < vh * 0.6 || sy > secs['s-interlude'].top - vh) ? '0' : '1';

    // watch
    if (!dragging) { yaw += yawV * dt * 0.02 * 60 * 0.016; yawV *= Math.pow(0.02, dt); if (!dragOK()) yaw *= Math.pow(0.15, dt); }
    const visible = secs['s-interlude'] ? sy < secs['s-interlude'].top + 4 : true;
    if (watch && keys.length) {
      const pose = poseAt(sy); pose.ry += yaw;
      const intro = clamp((now - introStart) / 2600);
      const out = watch.frame({ pose, dt, mx: fine ? smx : 0, my: fine ? smy : 0, intro, visible });
      if (out && glow) { glow.style.transform = `translate3d(${out.center[0]}px,${out.center[1]}px,0) translate(-50%,-50%) scale(${0.6 + out.center[2] * 0.5})`; glow.style.opacity = String(0.9 * clamp((now - introStart) / 2000)); }
      const lo = out && out.labels ? clamp((pose.e - 0.6) / 0.3) : 0;
      if (labelsWrap) labelsWrap.style.opacity = String(lo);
      if (lo > 0) {
        const m = mob(), gap = m ? 30 : 46, col = docW() - (m ? 150 : 300);
        const arr = out.labels.map((p, i) => ({ i, x: p[0], y: p[1] })).sort((a, b) => a.y - b.y);
        for (let k = 1; k < arr.length; k++) if (arr[k].y < arr[k - 1].y + gap) arr[k].y = arr[k - 1].y + gap;
        arr.forEach(({ i, x, y }) => { const l = labels[i]; l.style.transform = `translate3d(${x}px,${y}px,0) translate(0,-50%)`; const line = l.children[1]; if (line) line.style.width = Math.max(16, col - x) + 'px'; });
      }
    }

    // cursor
    if (fine && cur) { rx += (cx - rx) * (1 - Math.exp(-dt * 18)); ry += (cy - ry) * (1 - Math.exp(-dt * 18));
      const dl = dragOK() && !curHover ? 'Drag' : curText; const big = curHover || !!dl;
      cur.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      cur.style.width = cur.style.height = big ? '72px' : '30px';
      cur.style.background = big ? 'rgba(214,185,138,0.12)' : 'transparent';
      if (curLabel && curLabel.textContent !== dl) curLabel.textContent = dl;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
