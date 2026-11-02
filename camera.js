'use strict';
// Camera coach (experimental, optional). Tracks the body with MediaPipe Pose on the phone itself;
// no video leaves the device. It never assumes a textbook guard: a short calibration learns
// Milan's own guard (bladed, lead hand low/extended), which hand is the lead, and how far his
// hips turn on his best 2s. During themed rounds it compares him with that.
//
// The analysis (Coach) is plain JS with no browser APIs so it can be tested with synthetic frames.

const POSE = { nose: 0, ls: 11, rs: 12, lw: 15, rw: 16, lh: 23, rh: 24, la: 27, ra: 28 };
const LEAD_TOKENS = new Set(['1', 'body jab', 'up jab', '3', 'body 3', 'check hook', 'lead elbow']);
const REAR_TOKENS = new Set(['2', 'body 2', '4', 'rear elbow']);
const HIP_TOKENS = new Set(['2', 'body 2']);

const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: ((a.z || 0) + (b.z || 0)) / 2 });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const median = a => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const pct = (a, p) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };
const angDiff = (a, b) => { let d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return Math.abs(d); };
const yaw = (l, r) => Math.atan2((r.z || 0) - (l.z || 0), r.x - l.x) * 180 / Math.PI;

// One camera frame -> the few numbers the coach needs, in "torso units" so distance to the phone doesn't matter.
function features(lm, world) {
  if (!lm) return null;
  const g = i => lm[i], vis = i => (lm[i].visibility ?? 1) > 0.5;
  const sh = mid(g(POSE.ls), g(POSE.rs)), hip = mid(g(POSE.lh), g(POSE.rh));
  const torso = dist(sh, hip);
  if (!(torso > 0.02) || !vis(POSE.ls) || !vis(POSE.rs) || !vis(POSE.lh) || !vis(POSE.rh)) return null;
  const n = g(POSE.nose);
  const rel = i => ({ x: (g(i).x - n.x) / torso, y: (g(i).y - n.y) / torso });
  const w = world || lm;
  const ank = mid(g(POSE.la), g(POSE.ra));
  return {
    lw: rel(POSE.lw), rw: rel(POSE.rw),
    wristsSeen: vis(POSE.lw) && vis(POSE.rw),
    feetSeen: vis(POSE.la) && vis(POSE.ra),
    headSeen: vis(POSE.nose),
    chin: (sh.y - n.y) / torso,            // head height above the shoulders (bigger = chin up)
    height: (ank.y - n.y) / torso,          // nose above the feet (bigger = standing tall)
    hipYaw: yaw(w[POSE.lh], w[POSE.rh]),
    shYaw: yaw(w[POSE.ls], w[POSE.rs]),
    hipX: hip.x / torso, hipY: hip.y / torso,
    footX: (g(POSE.la).x + g(POSE.ra).x) / 2 / torso,
  };
}

class Coach {
  constructor(opts = {}) {
    this.cueGap = opts.cueGap ?? 20000;      // ms between live cues
    this.frames = [];                         // recent {t, f}
    this.base = null;
    this.calls = [];                          // pending strike checks
    this.round = null;
    this.cues = [];
    this.lastCue = -1e9;
    this.lastCueByType = {};
    this.paused = true;
    this.cal = { guard: [], jabs: [], twos: [], seen: [] };
    this.calStep = null;
  }

  // ---- input ----
  addFrame(t, lm, world) {
    const f = features(lm, world);
    if (this.calStep) this.cal[this.calStep].push({ t, f, lm });
    if (!f) return;
    this.frames.push({ t, f });
    while (this.frames.length && this.frames[0].t < t - 8000) this.frames.shift();
    if (this.base && this.round && !this.paused) { this.checkCalls(t); this.checkGap(t, f); }
  }
  onCall(token, t) {
    if (!this.base || !this.round || this.paused) return;
    this.lastCallT = t;
    const hand = LEAD_TOKENS.has(token) ? this.base.lead : REAR_TOKENS.has(token) ? this.base.rear : null;
    // A new strike with the same hand closes the previous check for that hand at this moment.
    if (hand) for (const c of this.calls) if (c.hand === hand && !c.done && c.until == null) c.until = t;
    this.calls.push({ token, t, hand, hip: HIP_TOKENS.has(token) && this.base.hipRot >= 8 });
  }

  // ---- calibration ----
  startStep(step) { this.calStep = step; this.cal[step] = []; }
  endStep() {
    const step = this.calStep; this.calStep = null;
    const fr = this.cal[step];
    if (step === 'seen') {
      const ok = fr.filter(x => x.f).length / Math.max(1, fr.length);
      const feet = fr.filter(x => x.f && x.f.feetSeen).length / Math.max(1, fr.length);
      const wrists = fr.filter(x => x.f && x.f.wristsSeen).length / Math.max(1, fr.length);
      return !fr.length ? 'nocamera' : ok < 0.5 ? 'noperson' : wrists < 0.5 ? 'nohands' : feet < 0.5 ? 'nofeet' : 'ok';
    }
    const fs = fr.map(x => x.f).filter(Boolean);
    if (step === 'guard') {
      if (fs.length < 10) return 'fail';
      const m = k => median(fs.map(f => f[k]));
      const pos = h => ({ x: median(fs.map(f => f[h].x)), y: median(fs.map(f => f[h].y)) });
      const lw = pos('lw'), rw = pos('rw');
      const jitter = Math.max(pct(fs.map(f => dist(f.lw, lw)), 0.9), pct(fs.map(f => dist(f.rw, rw)), 0.9));
      this.base = { lw, rw, chin: m('chin'), height: m('height'), hipYaw: m('hipYaw'), shYaw: m('shYaw'),
        R: Math.max(0.3, jitter * 2.5), lead: 'lw', rear: 'rw', reach: { lw: 1, rw: 1 }, hipRot: 0 };
      return 'ok';
    }
    if (!this.base || fs.length < 6) return 'fail';
    const ext = h => pct(fs.map(f => dist(f[h], this.base[h])), 0.95);
    if (step === 'jabs') {
      // Whichever wrist travelled furthest on "three jabs" is the lead hand (also handles a mirrored camera).
      const l = ext('lw'), r = ext('rw');
      if (Math.max(l, r) < 0.4) return 'weak'; // jabs not clear: keep orthodox default (left lead)
      this.base.lead = l >= r ? 'lw' : 'rw';
      this.base.rear = l >= r ? 'rw' : 'lw';
      this.base.reach[this.base.lead] = Math.max(0.6, l, r);
      return Math.max(l, r) > 0.4 ? 'ok' : 'weak';
    }
    if (step === 'twos') {
      this.base.reach[this.base.rear] = Math.max(0.6, ext(this.base.rear)); // floor: noise must never look like a punch
      this.base.hipRot = pct(fs.map(f => angDiff(f.hipYaw, this.base.hipYaw)), 0.92);
      this.base.shRot = pct(fs.map(f => angDiff(f.shYaw, this.base.shYaw)), 0.92);
      return this.base.hipRot >= 8 ? 'ok' : 'nohip';
    }
  }

  // ---- rounds ----
  startRound(n, name) {
    this.round = { n, name, t0: null, rear: { n: 0, home: 0, slow: [] }, lead: { n: 0, home: 0, slow: [] },
      hip: [], events: { rearDrop: [], leadDrop: [], chin: [], square: [], still: [] } };
    this.calls = []; this.cues = []; this.gap = {}; this.paused = false;
  }
  endRound() {
    const r = this.round; this.round = null; this.paused = true;
    return r ? report(r, this.base) : null;
  }
  pause(p) { this.paused = p; if (p) this.gap = {}; }

  // ---- live checks ----
  checkCalls(t) {
    for (const c of this.calls) {
      const until = Math.min(c.until ?? Infinity, c.t + 1600);
      if (c.done || t < until) continue;
      c.done = true;
      const r = this.round;
      if (r.t0 == null) r.t0 = c.t;
      const win = this.frames.filter(x => x.t >= c.t && x.t <= until);
      if (win.length < 4) continue;
      if (c.hand && until - c.t >= 1000) { // quick doubles (1, 1) aren't judged on the return
        const g = this.base[c.hand];
        const d = win.map(x => dist(x.f[c.hand], g));
        const iPeak = d.indexOf(Math.max(...d));
        if (d[iPeak] < 0.45 * this.base.reach[c.hand]) continue; // couldn't see the punch clearly: don't judge it
        const back = win.findIndex((x, i) => i > iPeak && d[i] < this.base.R * 1.3);
        const ms = back < 0 ? Infinity : win[back].t - win[iPeak].t;
        const s = c.hand === this.base.rear ? r.rear : r.lead;
        s.n++;
        if (ms <= 650) s.home++;
        else { s.slow.push(c.t); this.flag(c.hand === this.base.rear ? 'rearDrop' : 'leadDrop', c.t, true); }
      }
      if (c.hip) {
        const y0 = median(win.slice(0, 3).map(x => x.f.hipYaw));
        const rot = Math.max(...win.map(x => angDiff(x.f.hipYaw, y0)));
        r.hip.push({ t: c.t, ratio: rot / this.base.hipRot });
        const recent = r.hip.slice(-4);
        if (recent.length >= 4 && median(recent.map(h => h.ratio)) < 0.55) this.flag('hip', c.t, true);
      }
    }
    this.calls = this.calls.filter(c => !c.done);
  }

  // Between combos: no call in the last 1.6 s.
  checkGap(t, f) {
    if (t - (this.lastCallT ?? -1e9) < 1600) { this.gap = {}; return; }
    const b = this.base, g = this.gap;
    const hold = (key, bad, ms, ev) => {
      if (!bad) { g[key] = null; return; }
      if (g[key] == null) g[key] = t;
      else if (g[key] !== -1 && t - g[key] >= ms) { g[key] = -1; this.round.events[ev].push(t); this.flag(ev, t); }
    };
    if (f.wristsSeen) {
      hold('rear', dist(f[b.rear], b[b.rear]) > b.R * 1.8, 900, 'rearDrop');
      // His lead hand lives low/extended: only flag it when it drops well below his own guard spot.
      hold('lead', f[b.lead].y - b[b.lead].y > 0.6, 1200, 'leadDrop');
    }
    if (f.headSeen) hold('chin', f.chin - b.chin > 0.18 || (f.feetSeen && f.height / b.height > 1.08), 1000, 'chin');
    hold('square', angDiff(f.shYaw, b.shYaw) > 32, 1500, 'square');
    // Feet: barely any hip or foot movement for 2.5 s between combos.
    const w = this.frames.filter(x => x.t > t - 2500);
    if (w.length > 10 && t - w[0].t > 2200) {
      const sd = k => { const v = w.map(x => x.f[k]); const m = v.reduce((a, c) => a + c, 0) / v.length; return Math.sqrt(v.reduce((a, c) => a + (c - m) ** 2, 0) / v.length); };
      hold('still', sd('hipY') < 0.015 && sd('hipX') < 0.03 && sd('footX') < 0.03, 0, 'still');
    }
  }

  flag(type, t, counted) {
    if (counted && this.round.events[type]) this.round.events[type].push(t);
    if (t - this.lastCue < this.cueGap || t - (this.lastCueByType[type] ?? -1e9) < 45000) return;
    this.cues.push(type);
  }
  // The engine asks between combos; returns a cue type or null.
  takeCue(t) {
    if (!this.cues.length || t - this.lastCue < this.cueGap) return null;
    const counts = this.round ? this.round.events : {};
    this.cues.sort((a, b) => (counts[b]?.length || 0) - (counts[a]?.length || 0));
    const type = this.cues.shift();
    this.cues = [];
    this.lastCue = t; this.lastCueByType[type] = t;
    return type;
  }
}

// Round summary: spoken (short) and written (for the log). Worst thing first, one positive at the end.
function report(r, base) {
  const parts = [], notes = [];
  const late = ts => { if (ts.length < 3 || r.t0 == null) return ''; const span = Math.max(...ts) - r.t0; return ts.filter(t => t - r.t0 > span * 0.66).length > ts.length / 2 ? ', mostly late in the round' : ''; };
  const hand = (s, name, ev) => {
    if (s.n >= 5) {
      const p = Math.round(100 * s.home / s.n);
      notes.push(`${name} hand came home fast on ${s.home} of ${s.n} punches I could see (${p}%)`);
      if (p < 80) parts.push({ w: 100 - p, say: `${name} hand stayed out after ${s.n - s.home} of ${s.n} punches${late(s.slow)}.` });
    }
    const gaps = ev.length - s.slow.length;
    if (gaps >= 3) { notes.push(`${name} hand dropped between combos ${gaps} times`); parts.push({ w: gaps * 4, say: `${name} hand dropped between combos ${gaps} times.` }); }
  };
  hand(r.rear, 'Rear', r.events.rearDrop);
  hand(r.lead, 'Lead', r.events.leadDrop);
  if (r.hip.length >= 5) {
    const p = Math.round(100 * median(r.hip.map(h => h.ratio)));
    const first = median(r.hip.slice(0, Math.ceil(r.hip.length / 2)).map(h => h.ratio)), second = median(r.hip.slice(Math.ceil(r.hip.length / 2)).map(h => h.ratio));
    const fade = second < first * 0.8 ? ' It faded as you got tired.' : '';
    notes.push(`hip turn on the 2: ${p}% of your calibration 2s (${r.hip.length} measured)`);
    if (p < 75 || fade) parts.push({ w: 100 - p + (fade ? 15 : 0), say: `Hip turn on the 2 was ${p} percent of your best.${fade}` });
  }
  const ev = (k, n, say) => { const c = r.events[k].length; if (c >= n) { notes.push(say.replace('#', c)); parts.push({ w: c * 5, say: say.replace('#', c) + '.' }); } };
  ev('chin', 2, 'Chin came up or you stood tall # times');
  ev('square', 2, 'Stance turned square # times');
  ev('still', 3, 'Feet went still between combos # times');
  parts.sort((a, b) => b.w - a.w);
  let say = parts.slice(0, 2).map(p => p.say).join(' ');
  if (!say) say = r.rear.n + r.lead.n >= 5 ? 'Clean round. Hands came home and the stance held.' : "I couldn't see enough to judge this round.";
  const good = r.rear.n >= 5 && r.rear.home / r.rear.n >= 0.85 ? ' Rear hand discipline was good.' : '';
  if (parts.length && good && !parts.slice(0, 2).some(p => p.say.startsWith('Rear'))) say += good;
  return { say, text: `Round ${r.n} (${r.name}): ` + (notes.length ? notes.join('; ') : 'not enough tracking to judge') + '.' };
}

// ---------------- browser side: camera + MediaPipe ----------------
const Cam = {
  coach: null, landmarker: null, stream: null, video: null, running: false, fps: 0, error: '',
  supported: () => typeof navigator !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),

  // Call inside the Start tap (camera permission).
  async start(video) {
    this.coach = new Coach();
    this.video = video;
    this.error = '';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      video.srcObject = this.stream;
      video.muted = true; video.setAttribute('playsinline', '');
      await video.play();
      const vision = await import('./vendor/mediapipe/vision_bundle.mjs');
      const files = await vision.FilesetResolver.forVisionTasks(new URL('vendor/mediapipe/wasm', location.href).href);
      const make = delegate => vision.PoseLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: new URL('vendor/mediapipe/pose_landmarker_lite.task', location.href).href, delegate },
        runningMode: 'VIDEO', numPoses: 1,
      });
      try { this.landmarker = await make('GPU'); } catch { this.landmarker = await make('CPU'); }
      this.running = true;
      this.loop();
      return true;
    } catch (e) {
      this.error = e && e.message || String(e);
      console.warn('camera coach', e);
      this.stop();
      return false;
    }
  },
  loop() {
    let last = 0, n = 0, t0 = performance.now();
    const step = () => {
      if (!this.running) return;
      const now = performance.now();
      // ~15 fps, and only when something is listening (calibration or a round).
      if (now - last >= 66 && this.video.readyState >= 2 && (this.coach.calStep || !this.coach.paused)) {
        last = now;
        try {
          const res = this.landmarker.detectForVideo(this.video, now);
          this.coach.addFrame(now, res.landmarks && res.landmarks[0], res.worldLandmarks && res.worldLandmarks[0]);
          n++;
        } catch (e) { console.warn(e); }
        if (now - t0 > 2000) { this.fps = Math.round(n * 1000 / (now - t0)); n = 0; t0 = now; }
      }
      if (this.video.requestVideoFrameCallback) this.video.requestVideoFrameCallback(step); else setTimeout(step, 33);
    };
    step();
  },
  stop() {
    this.running = false;
    try { this.stream && this.stream.getTracks().forEach(t => t.stop()); } catch {}
    try { this.landmarker && this.landmarker.close(); } catch {}
    this.stream = null; this.landmarker = null;
    if (this.video) this.video.srcObject = null;
  },
};

if (typeof module !== 'undefined') module.exports = { Coach, features, report, POSE };
