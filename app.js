'use strict';
// Striking Coach v2: one-user, offline, hands-free audio coach. See PLAN.md.

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const SIM = Q.has('sim'); // ?sim: run a whole session instantly with no audio and print the call trace
const LS = {
  get(k, d) { try { const v = localStorage.getItem('sc.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sc.' + k, JSON.stringify(v)); } catch {} },
};
const DEFAULTS = { defPct: 15, sayAnswer: true, headKicks: true, quick: false, roundMin: 10, restMin: 2, rounds: 3, camera: false,
  warmMin: 2, voice: 'clips', custom: { mode: 'hard', themes: ['mc_straight', 'ad_feints'] } };
const settings = Object.assign({}, DEFAULTS, LS.get('settings', {}));
if (Q.has('quick')) settings.quick = true;
const saveSettings = () => { if (!SIM) LS.set('settings', settings); };

let LIB = null, SPRITE = null;

// ---------- seeded random (so a ?sim&seed= trace is reproducible) ----------
let seed = (+Q.get('seed') || Date.now()) % 2147483647;
function rand() {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = a => a[Math.floor(rand() * a.length)];
const lerp = (a, b, p) => a + (b - a) * Math.min(1, Math.max(0, p));

// ---------- pausable clock (virtual in ?sim mode) ----------
let vnow = 0;
const clock = {
  t0: 0, offset: 0, pausedAt: null,
  now() { return SIM ? vnow : (this.pausedAt ?? performance.now()) - this.t0 - this.offset; },
  reset() { vnow = 0; this.t0 = performance.now(); this.offset = 0; this.pausedAt = null; },
  pause() { if (this.pausedAt == null) this.pausedAt = performance.now(); },
  resume() { if (this.pausedAt != null) { this.offset += performance.now() - this.pausedAt; this.pausedAt = null; } },
};
let run = null; // current session state
class Abort extends Error {}
class Skip extends Error {} // the Skip button: jump to the next part of the session
const tick = ms => SIM ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
function checkRun() {
  if (!run) return;
  if (run.aborted) throw new Abort();
  if (run.skip) throw new Skip();
}
async function waitUntil(t) {
  if (SIM) { checkRun(); if (vnow < t) vnow = t; return; }
  while (clock.now() < t) {
    checkRun();
    await tick(Math.max(5, Math.min(50, t - clock.now())));
  }
  checkRun();
}
const wait = ms => waitUntil(clock.now() + ms);

// ---------- audio: ONE <audio> element playing a sprite (iOS-safe) ----------
const audio = { el: null, ok: false, ctx: null };
const VOICES = { coach: null, incoming: null };

function initAudio() {
  audio.el = new Audio('audio/sprite.m4a');
  audio.el.preload = 'auto';
  audio.el.setAttribute('playsinline', '');
  if ('speechSynthesis' in window) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
}

// Fallback voices for lines missing from the sprite. Incoming attacks get a different (female, US) voice.
function pickVoices() {
  const vs = speechSynthesis.getVoices();
  const fem = /female|samantha|aria|jenny|zira|allison|ava|susan|karen|victoria|moira|tessa|serena|google us english/i;
  VOICES.incoming = vs.find(v => /en.US/i.test(v.lang) && fem.test(v.name)) || vs.find(v => /en.US/i.test(v.lang)) || null;
  VOICES.coach = vs.find(v => /en.GB/i.test(v.lang) && /daniel|arthur|ryan|george|oliver|male/i.test(v.name) && !/female/i.test(v.name))
    || vs.find(v => /en.GB/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}

// Must be called synchronously inside the Start tap.
function unlockAudio() {
  if (SIM) return Promise.resolve();
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch {}
  try { speechSynthesis.speak(new SpeechSynthesisUtterance(' ')); } catch {}
  const el = audio.el;
  el.currentTime = 0; // sprite starts with half a second of silence
  const p = el.play();
  return Promise.resolve(p).then(() => { el.pause(); audio.ok = !!SPRITE; })
    .catch(e => { audio.ok = false; console.warn('audio unlock failed', e); });
}

function speak(text, who) {
  if (!text || !('speechSynthesis' in window)) return tick(estimate(text) * 1000);
  audio.lastSpeech = performance.now();
  return new Promise(res => {
    const u = new SpeechSynthesisUtterance(text);
    const inc = who === 'incoming';
    const v = inc ? VOICES.incoming : VOICES.coach;
    if (v) u.voice = v;
    u.lang = inc ? 'en-US' : 'en-GB';
    u.rate = inc ? 1.15 : 1.1;
    u.pitch = inc ? 1.35 : 0.9; // keep the two voices apart even if the phone only has one
    let done = false;
    const end = () => { if (done) return; done = true; clearTimeout(t); clearInterval(iv); audio.lastSpeech = performance.now(); res(); };
    const t = setTimeout(end, 1000 + text.length * 120);
    // Stop and Skip cut the phone voice off at once instead of waiting for the sentence to finish.
    const iv = setInterval(() => { if (run && (run.aborted || run.skip)) { try { speechSynthesis.cancel(); } catch {} end(); } }, 100);
    u.onend = u.onerror = end;
    speechSynthesis.speak(u);
  });
}

function beep(freq, ms) { // only used if the sprite is missing (Web Audio is muted by the iOS silent switch)
  try {
    audio.ctx = audio.ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
    o.frequency.value = freq; g.gain.value = 0.3; o.connect(g).connect(audio.ctx.destination);
    o.start(); o.stop(audio.ctx.currentTime + ms / 1000);
  } catch {}
  return tick(ms);
}
const FX_FALLBACK = { 'fx:bell': [830, 900], 'fx:bell3': [830, 1200], 'fx:beep': [880, 150], 'fx:clack': [1800, 300], 'fx:alert': [1500, 250] };
const estimate = text => 0.25 + (text || '').split(/\s+/).length * 0.3; // seconds, for lines not in the sprite

function trace(who, text) {
  if (run && run.trace) run.trace.push({ t: +(clock.now() / 1000).toFixed(1), who, text });
}

// Plays one clip. A clip is used only if the sprite has it with exactly this text; otherwise speechSynthesis.
const hasClip = (id, text) => { const c = SPRITE && SPRITE.clips[id]; return !!c && (!text || !c.text || c.text === text); };
async function clip(id, text, who = 'coach') {
  checkRun();
  const c = SPRITE && SPRITE.clips[id];
  const fresh = hasClip(id, text) && (settings.voice !== 'phone' || id.startsWith('fx:'));
  trace(id.startsWith('fx:') ? 'fx' : who, text || id);
  if (SIM) { vnow += (fresh ? c.d : id.startsWith('fx:') ? 0.4 : estimate(text)) * 1000; return; }
  if (!fresh || !audio.ok) {
    if (id.startsWith('fx:')) return FX_FALLBACK[id] ? beep(...FX_FALLBACK[id]) : undefined;
    await speak(text, who);
    return checkRun();
  }
  const el = audio.el, end = c.s + c.d, started = clock.now();
  // Start a little early, inside the silence before the clip: iPhone can swallow the first few hundred ms
  // after a seek (worse after the phone's own voice was used), and short words like "One." vanished.
  // Start inside the silence before the clip: iPhone swallows the first moments after a seek, which turned
  // "up jab" into "jab" and made short words like "teep" vanish. Newer sprites have 0.6 s of silence between clips.
  const pre = Math.max(0.1, Math.min(0.45, (SPRITE.gap || 0.35) - 0.08));
  el.currentTime = Math.max(0, c.s - pre);
  // A play() that never settles (or a sprite the browser can't decode) must not freeze the session.
  const played = await Promise.race([el.play().then(() => true, () => false), tick(1500).then(() => false)]);
  if (!played || el.error) {
    el.pause();
    if (el.error) audio.ok = false; // stop trying the sprite for the rest of the session
    return id.startsWith('fx:') ? (FX_FALLBACK[id] ? beep(...FX_FALLBACK[id]) : undefined) : speak(text, who);
  }
  for (;;) {
    await tick(15);
    if (run && (run.aborted || run.skip)) { el.pause(); checkRun(); }
    if (clock.pausedAt != null) { if (!el.paused) el.pause(); continue; }
    if (el.paused && !el.ended) { try { await el.play(); } catch {} }
    if (el.currentTime >= end || el.ended) break;
    if (clock.now() - started > c.d * 1000 + 1800) break; // safety net
  }
  el.pause();
  audio.lastSprite = performance.now();
}

const NUM = { 1: 'one', 2: 'two', 3: 'three', 4: 'four' };
const sayToken = t => { const s = t.split(' ').map(w => NUM[w] || w).join(' '); return s[0].toUpperCase() + s.slice(1) + '.'; };
// A whole combo as one sentence; must match say_step() in tools/build_audio.py.
const sayStep = ts => { const s = ts.map(t => t.split(' ').map(w => NUM[w] || w).join(' ')).join(', '); return s[0].toUpperCase() + s.slice(1) + '.'; };
async function sayTokens(tokens) {
  // Best: the whole combo as ONE recorded clip ("Up jab, two."), one seek, said fluently.
  const key = 's:' + tokens.join(', '), text = sayStep(tokens);
  if (hasClip(key, text) && settings.voice !== 'phone' && (audio.ok || SIM)) {
    if (camOn()) { // spread the calls over the clip so the camera knows roughly when each strike starts
      const d = SPRITE.clips[key].d * 1000 / tokens.length, t0 = performance.now();
      tokens.forEach((t, i) => Cam.coach.onCall(t, t0 + i * d));
    }
    return clip(key, text);
  }
  // If any call in this combo isn't in the recorded clips (or the phone voice is chosen), say the whole combo
  // in one sentence with the phone voice. Switching between the clips and the phone voice mid-combo is what
  // made numbers disappear on iPhone.
  const whole = !SIM && (settings.voice === 'phone' || !audio.ok || !tokens.every(t => hasClip('t:' + t, sayToken(t))));
  if (whole) {
    if (camOn()) for (const t of tokens) Cam.coach.onCall(t, performance.now());
    const text = tokens.map(t => t.split(' ').map(w => NUM[w] || w).join(' ')).join(', ') + '.';
    trace('coach', text);
    await speak(text[0].toUpperCase() + text.slice(1), 'coach');
    return checkRun();
  }
  for (const t of tokens) {
    if (camOn()) Cam.coach.onCall(t, performance.now()); // the camera knows exactly what was called and when
    await clip('t:' + t, sayToken(t));
  }
}
const say = text => clip('x:' + text, text);
const sayIncoming = attack => clip('in:' + attack, `Incoming ${attack}!`, 'incoming');

// ---------- library ----------
const SPIN = /back kick|wheel kick|spinning|flying knee/;
const HEAD = /head kick|question mark kick|wheel kick/;
const MOVE = /^(pull|slip|roll|parry|check|catch|block|step back|step out|step in|pivot out|angle out|shoulder roll|hop back|sprawl|circle left|circle right)$|feint/;
const parse = s => s.split('|').map(st => st.split(',').map(t => t.trim()).filter(Boolean));
function prepLibrary() {
  for (const k of ['combos', 'traps']) for (const e of LIB[k]) {
    e.kind = k === 'traps' ? 'trap' : 'combo';
    e.steps = parse(e.calls);
    e.tags = e.tags || [];
    e.spins = (e.calls.match(new RegExp(SPIN, 'g')) || []).length;
    e.short = e.kind === 'combo' && e.steps[0].length <= 3 && e.steps[0].every(t => /^(1|2|3|4|body 2|body jab|up jab)$/.test(t));
  }
  for (const d of LIB.defence) {
    d.kind = 'def';
    d.answerSteps = parse(d.answer)[0];
    d.group = /kick|teep/.test(d.attack) ? 'kick' : 'punch';
    d.spins = 0;
  }
  LIB.byId = {};
  for (const e of [...LIB.combos, ...LIB.traps, ...LIB.defence]) LIB.byId[e.id] = e;
}

const allowed = e => settings.headKicks || !HEAD.test(e.calls || e.answer);
const weightOf = (e, w) => e.tags.reduce((s, t) => s + (w[t] || 0), 0);
function pickWeighted(list, wfn) {
  const ws = list.map(wfn), sum = ws.reduce((a, b) => a + b, 0);
  if (!sum) return null;
  let x = rand() * sum;
  for (let i = 0; i < list.length; i++) { x -= ws[i]; if (x <= 0) return list[i]; }
  return list[list.length - 1];
}

// ---------- pacing ----------
// exec: seconds per strike to throw it; rec: recovery after a combo, [start of round, end of round] (intensity rises);
// react: time to defend after "Incoming ..."; preDef: forced silence before an incoming call.
const PACE = {
  warm:      { exec: 0.5,  rec: [1.8, 1.1],  react: 1.2, preDef: 1.5 },
  hard:      { exec: 0.3,  rec: [1.3, 0.45], react: 0.7, preDef: 1.2 },
  technical: { exec: 0.5,  rec: [2.2, 1.5],  react: 1.1, preDef: 1.6 },
  slow:      { exec: 0.9,  rec: [3.6, 3.0],  react: 1.5, preDef: 2.0 },
};
const strikes = ts => ts.reduce((n, t) => n + (MOVE.test(t) ? 0.6 : 1), 0);
const recNow = p => lerp(p.rec[0], p.rec[1], run.st ? run.st.prog() : 0);
const stepGap = (ts, p) => (strikes(ts) * p.exec + recNow(p)) * 1000;
function estimateItem(e, p) { // ms, rough: ~0.45 s of speech per token
  if (e.kind === 'def') return (p.preDef + 1.6 + p.react + e.answerSteps.length * 0.45) * 1000 + stepGap(e.answerSteps, p);
  if (e.kind === 'string') return e.list.reduce((ms, c) => ms + c.steps[0].length * 450 + strikes(c.steps[0]) * p.exec * 1000 + 250, 800);
  const steps = e.kind === 'callback' ? [e.trap.steps[0], e.trap.steps.at(-1)] : e.steps;
  return steps.reduce((ms, s) => ms + s.length * 450 + stepGap(s, p), e.kind === 'callback' ? 2000 : 0);
}

// ---------- UI during a run ----------
function showCall(text, def) { if (SIM) return; $('call').textContent = text; $('call').classList.toggle('def', !!def); $('answer').textContent = ''; }
function setPhase(label, durMs, focus) {
  run.phase = { label, end: clock.now() + durMs };
  if (SIM) return;
  $('phase').textContent = label;
  $('focus').textContent = focus || '';
  showCall('');
}
function renderClock() {
  if (!run || !run.phase) return;
  const s = Math.max(0, Math.ceil((run.phase.end - clock.now()) / 1000));
  $('clock').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Gap waits double as the 10-second-warning hook.
async function gapWait(ms) {
  const until = clock.now() + ms;
  while (clock.now() < until) {
    if (!run.st.warned && run.phase.end - clock.now() <= 10500) { run.st.warned = true; await clip('fx:clack'); }
    await waitUntil(Math.min(until, clock.now() + 100));
  }
}

async function doItem(e, p) {
  const st = run.st;
  st.spins += e.spins || 0;
  if (e.kind === 'def') {
    await gapWait(p.preDef * 1000); // never straight after a combo: a clear silence first
    showCall('INCOMING · ' + e.attack, true);
    const ic = SPRITE && SPRITE.clips['in:' + e.attack];
    if (!(ic && ic.alert && audio.ok && settings.voice !== 'phone')) await clip('fx:alert');
    await sayIncoming(e.attack);
    await gapWait(p.react * 1000);
    if (settings.sayAnswer) { if (!SIM) $('answer').textContent = '→ ' + e.answer; await sayTokens(e.answerSteps); }
    await gapWait(stepGap(e.answerSteps, p));
    return;
  }
  if (e.kind === 'string') { // rapid fire: short punch combos back to back, almost no recovery
    await say(LIB.phrases.rapid);
    for (const c of e.list) {
      showCall(c.calls);
      await sayTokens(c.steps[0]);
      await gapWait(strikes(c.steps[0]) * p.exec * 1000 + 250);
    }
    await gapWait(recNow(p) * 1000);
    return;
  }
  let steps = e.steps, trap = e;
  if (e.kind === 'callback') { // the pattern once, then the break: they were conditioned earlier
    trap = e.trap;
    steps = [trap.steps[0], trap.steps.at(-1)];
    st.spins += trap.spins;
    await say(e.from === run.roundNo ? LIB.phrases.callbackSame : LIB.phrases.callback[e.from - 1]);
  }
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    showCall(s.join(', ') + (steps.length > 1 ? `  (${i + 1}/${steps.length})` : ''), false);
    await sayTokens(s);
    await gapWait(stepGap(s, p));
  }
  if (trap.kind === 'trap' && !run.trapsDone.some(x => x.id === trap.id)) run.trapsDone.push({ id: trap.id, round: run.roundNo });
}

// ---------- choosing calls ----------
function pickCore(w, st, opts = {}) {
  const ok = e => allowed(e) && !st.recent.includes(e.id) && (!e.spins || st.spins + e.spins <= st.spinMax)
    && (!opts.short || e.short);
  return pickWeighted(LIB.combos.filter(ok), e => weightOf(e, w)) || pickWeighted(LIB.combos.filter(e => e.short), () => 1);
}
function pickTrap(th, st) {
  const tags = Object.keys(th.weights);
  return pickWeighted(LIB.traps.filter(t => allowed(t) && !st.recent.includes(t.id) && t.spins + st.spins <= st.spinMax),
    t => (th.family.includes(t.id) ? 3 : 0) + t.tags.filter(x => tags.includes(x)).length * 0.3);
}
function pickDef(groups, st, prefer = []) {
  return pickWeighted(LIB.defence.filter(d => allowed(d) && groups.includes(d.group) && !st.recent.includes(d.id)),
    d => prefer.includes(d.id) ? 4 : 1);
}
function pickFamily(th, st) {
  const fam = th.family.map(id => LIB.byId[id]).filter(e => allowed(e) && !st.recent.includes(e.id) && st.spins + e.spins <= st.spinMax);
  return fam.length ? pick(fam) : null;
}
function makeString(th, st) {
  const list = [];
  for (let i = 0, n = 3 + Math.floor(rand() * 2); i < n; i++) list.push(pickCore({ snipe: 3, jab: 2, pull: 0.5 }, st, { short: true }));
  return { kind: 'string', id: 'string', list, spins: 0 };
}
function makeCallback(st) {
  // At most 3 per round, 60 s apart, and prefer traps from earlier rounds.
  if (st.callbacks >= 3 || clock.now() - st.lastCallback < 60000) return null;
  const old = run.trapsDone.filter(x => !st.recent.includes(x.id) && (x.round < run.roundNo || !st.recent.includes('cb:' + x.id)));
  const earlier = old.filter(x => x.round < run.roundNo);
  const x = earlier.length ? pick(earlier) : old.length ? pick(old) : null;
  const trap = x && LIB.byId[x.id];
  if (!trap || st.spins + trap.spins > st.spinMax || !allowed(trap)) return null;
  st.callbacks++; st.lastCallback = clock.now();
  return { kind: 'callback', id: 'cb:' + x.id, trap, from: x.round, spins: 0 };
}

function pickThemed(th, st, phase, mode) {
  const setup = LIB.byId[th.setup];
  const defP = Math.min(0.55, (settings.defPct / 100) * th.def);
  if (rand() < defP) { const d = pickDef(th.defTags, st, th.family); if (d) return d; }
  const r = rand(), hard = mode === 'hard';
  const or = (...fns) => { for (const f of fns) { const e = f(); if (e) return e; } return pickCore(th.weights, st); };
  const core = () => pickCore(th.weights, st);
  const fam = () => pickFamily(th, st);
  const su = () => allowed(setup) && !st.recent.slice(-2).includes(setup.id) && setup.spins + st.spins <= st.spinMax ? setup : null;
  if (phase === 'mix') {
    if (r < 0.22) return or(su, fam);
    if (r < 0.55) return or(fam);
    if (r < 0.62) return or(() => pickTrap(th, st));
    if (r < (hard ? 0.7 : 0.65)) return makeString(th, st);
    return core();
  }
  if (phase === 'hide') {
    if (r < 0.1) return or(su, fam);
    if (r < 0.25) return or(fam);
    if (r < 0.35) return or(() => makeCallback(st), () => pickTrap(th, st));
    if (r < 0.42) return or(() => pickTrap(th, st));
    if (r < (hard ? 0.54 : 0.48)) return makeString(th, st);
    return core();
  }
  // push: last stretch of a technical round
  if (r < 0.5) return or(su, fam);
  if (r < 0.7) return or(fam);
  return core();
}

// ---------- camera coach (optional) ----------
const camOn = () => !SIM && run && run.cam && Cam.running && Cam.coach && Cam.coach.base;
async function camCue() { // between combos only
  if (!camOn() || !run.inRound) return;
  const type = Cam.coach.takeCue(performance.now());
  if (type) { showCall('CAMERA · ' + LIB.phrases.camCue[type]); await say(LIB.phrases.camCue[type]); }
}
function camPause(p) { if (camOn()) Cam.coach.pause(p); }
async function camCheckin() { // a third into the round: say whether it can actually see the work
  const n = Cam.coach.judged();
  if (n < 3) await say(LIB.phrases.camBlind);
  else if (Cam.coach.goodSoFar()) await say(LIB.phrases.camGood);
}
async function camCalibrate() {
  const P = LIB.phrases;
  setPhase('Camera check', 45000, 'Phone diagonal in front of you, 2–3 m away, head to feet in view');
  run.st = newRoundState(45000, 0); run.st.warned = true;
  const fail = async () => { await say(P.camFail); Cam.stop(); run.cam = false; $('camBox').classList.add('hidden'); return false; };
  if (!(await run.camStart)) { $('camInfo').textContent = 'Camera coach off: ' + (Cam.error || 'not available'); return fail(); }
  const c = Cam.coach;
  await say(P.camSetup);
  await wait(4000);
  for (let attempt = 0; ; attempt++) {
    c.startStep('seen'); await wait(3000);
    const seen = c.endStep();
    if (seen === 'ok') break;
    if (attempt === 2) return fail();
    await say(P['cam_' + seen] || P.cam_noperson);
    await wait(6000);
  }
  await say(P.camSeeYou);
  await say(P.camGuard); c.startStep('guard'); await wait(5000);
  if (c.endStep() !== 'ok') return fail();
  await say(P.camJabs); c.startStep('jabs'); await wait(5000); c.endStep();
  await say(P.camTwos); c.startStep('twos'); await wait(6000);
  if (c.endStep() === 'nohip') await say(P.camNoHip);
  await say(P.camDone);
  return true;
}

// ---------- rounds ----------
function newRoundState(dur, spinMax) {
  const start = clock.now();
  return { recent: [], warned: false, spins: 0, spinMax, start, dur, callbacks: 0, lastCallback: -1e9, prog: () => (clock.now() - start) / dur };
}
const remember = (st, e) => { st.recent.push(e.id); if (st.recent.length > 6) st.recent.shift(); };

async function flurry(ms, kind, opener) {
  camPause(true); // all-out flurries aren't judged
  showCall('FLURRY · ' + kind.toUpperCase());
  const end = clock.now() + ms;
  await say(opener || (ms > 17500 ? LIB.phrases.flurry20 : LIB.phrases.flurry15));
  await say(LIB.flurries[kind].say);
  let i = 0;
  while (end - clock.now() > 3500) {
    await gapWait(Math.min(4500, end - clock.now() - 3000));
    if (end - clock.now() > 2500) await say(LIB.phrases.pushes[i++ % LIB.phrases.pushes.length]);
  }
  await gapWait(Math.max(0, end - clock.now()));
  run.flurries++;
  if (run.inRound) camPause(false);
}

async function themedRound(spec) {
  const { theme: th, n, dur, mode } = spec;
  const p = PACE[mode];
  const hard = mode === 'hard';
  run.roundNo = n;
  setPhase(`Round ${n} of ${run.nRounds}`, dur, th.name);
  const st = run.st = newRoundState(dur, th.spinMax && hard ? th.spinMax : th.spinMax ? th.spinMax - 1 : 1);
  const end = run.phase.end;
  await clip('fx:bell');
  await say(LIB.phrases.round[n - 1] || LIB.phrases.round.at(-1));
  await say(th.focus);
  await say(th.teach);
  if (camOn()) Cam.coach.startRound(n, th.name);
  run.inRound = true;
  run.camCheckin = false;

  // 1. Teach: drill the setup (technical pace even on hard days, so the shape is right first).
  // About 45 s, mixed with related calls from the 3rd rep, and the Skip button skips just this lesson.
  const setup = LIB.byId[th.setup];
  const teachEnd = st.start + Math.min(dur * 0.12, Math.max(30000, dur * 0.075));
  run.partName = 'lesson';
  try {
  const teachPace = hard ? { ...PACE.technical, rec: [2.2, 1.6] } : PACE.technical;
  for (let rep = 0; clock.now() < teachEnd; rep++) {
    if (rep === 2 && setup.cue) await say(setup.cue);
    else if (rep === 4) await say(th.cues[0]);
    // Straight reps first; after 6, every third rep is a related call so it stays a drill, not a loop.
    // Spinning setups are drilled every other rep, with straights in between.
    const e = !allowed(setup) ? pickFamily(th, st) || pickCore(th.weights, st)
      : setup.spins && rep % 2 ? pickCore({ snipe: 3, jab: 2 }, st, { short: true })
      : rep >= 2 && rep % 2 === 0 ? pickFamily(th, st) || setup : setup;
    if (estimateItem(e, teachPace) > end - clock.now() - 5000) break;
    remember(st, e);
    await doItem(e, teachPace);
  }
  } catch (err) {
    if (!(err instanceof Skip)) throw err;
    run.skip = false; audio.el.pause(); try { speechSynthesis.cancel(); } catch {}
    await say(LIB.phrases.lessonSkipped);
  }
  run.partName = 'round';
  st.spins = 0; // drilling the setup doesn't count against the round's spin limit

  // 2-4. Mix it in, hide it, push. Flurries on hard days; coaching cues throughout.
  const finalMs = hard ? Math.min(20000, dur * 0.12) : 0;
  const flurryAt = (hard ? [0.36, 0.66] : [0.62]).map(f => st.start + dur * f);
  let challengeAt = st.start + dur * (0.42 + rand() * 0.1);
  const kinds = [th.flurry, ...LIB.burnout[planOf(run.sess)]];
  let phase = 'mix', nextCue = clock.now() + (hard ? 50000 : 40000), cueI = 0;
  await say(LIB.phrases.mix);
  for (;;) {
    const now = clock.now(), prog = st.prog();
    const stopAt = end - finalMs - 2500;
    if (now >= stopAt) break;
    if (phase === 'mix' && prog >= 0.5) { phase = 'hide'; await say(LIB.phrases.hide); }
    if (phase === 'hide' && !hard && prog >= 0.88) { phase = 'push'; await say(LIB.phrases.lastMin); }
    if (flurryAt.length && now >= flurryAt[0]) {
      flurryAt.shift();
      const ms = Math.min(hard ? 15000 + Math.floor(rand() * 2) * 5000 : 15000, stopAt - now - 6000);
      if (ms >= 8000) { await flurry(ms, kinds[run.flurries % kinds.length]); await say(LIB.phrases.time); await gapWait(3000); }
      continue;
    }
    if (now >= challengeAt) { // a short challenge: something different to chase
      challengeAt = Infinity;
      const ch = pick(LIB.phrases.challenges);
      if (stopAt - now > ch.dur * 1000 + 8000) {
        camPause(true);
        showCall('CHALLENGE');
        const until = clock.now() + ch.dur * 1000;
        await say(ch.say);
        await gapWait(Math.max(0, until - clock.now()));
        await clip('fx:beep');
        await say(LIB.phrases.challengeEnd);
        camPause(false);
      }
      continue;
    }
    if (camOn() && !run.camCheckin && st.prog() > 0.3) { run.camCheckin = true; await camCheckin(); }
    if (now >= nextCue) {
      const pool = cueI % 3 === 1 ? (hard ? LIB.phrases.cuesHard : LIB.phrases.cuesTech) : th.cues;
      await say(pool[Math.floor(cueI / 3) % pool.length] || pick(pool));
      cueI++;
      nextCue = clock.now() + (hard ? 55000 : 45000) * (0.8 + rand() * 0.4);
    }
    let e = pickThemed(th, st, phase, mode);
    for (let tries = 0; estimateItem(e, p) > stopAt - clock.now() && tries < 12; tries++) e = pickCore(th.weights, st, { short: true });
    if (estimateItem(e, p) > stopAt - clock.now()) break;
    remember(st, e);
    run.counts[e.kind] = (run.counts[e.kind] || 0) + 1;
    await doItem(e, p);
    // "Again!": throw the same combo straight away, sometimes faster.
    if (e.kind === 'combo' && phase !== 'push' && rand() < (hard ? 0.16 : 0.1) && estimateItem(e, p) < stopAt - clock.now()) {
      await say(pick(LIB.phrases.again));
      await doItem(e, p);
    }
    await camCue();
  }
  if (finalMs) {
    await gapWait(Math.max(0, end - finalMs - clock.now()));
    await flurry(Math.max(0, end - clock.now()), kinds[run.flurries % kinds.length], LIB.phrases.last20);
  }
  showCall('');
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:bell3');
  run.inRound = false;
  if (camOn()) run.camReport = Cam.coach.endRound();
  run.roundsDone++;
}

async function warmupRound(dur) {
  run.roundNo = 0;
  setPhase('Warm-up', dur, 'Light combos, then kicks, then incoming');
  const st = run.st = newRoundState(dur, 0);
  const end = run.phase.end;
  await clip('fx:bell');
  const segs = LIB.warmup.segments;
  let si = -1;
  for (;;) {
    if (end - clock.now() < 4000) break;
    const next = segs[si + 1];
    if (next && st.prog() >= next.at) { si++; await say(next.say); continue; }
    const seg = segs[Math.max(0, si)];
    let e = seg.def && rand() < seg.def ? pickDef(['punch'], st) : pickCore(seg.weights, st);
    if (estimateItem(e, PACE.warm) > end - clock.now() - 1500) e = pickCore({ foot: 1, warm: 1 }, st, {});
    if (estimateItem(e, PACE.warm) > end - clock.now() - 1500) break;
    remember(st, e);
    await doItem(e, PACE.warm);
  }
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:bell3');
  run.roundsDone++;
}

async function burnout(dur) {
  run.roundNo = run.nRounds + 1;
  setPhase('Finisher', dur, 'Burnout: 20 on, 10 off');
  run.st = newRoundState(dur, 0);
  const end = run.phase.end;
  await clip('fx:bell');
  const kinds = LIB.burnout[planOf(run.sess)];
  const n = Math.max(1, Math.floor(dur / 30000));
  for (let i = 0; i < n; i++) {
    const on = Math.min(20000, (end - clock.now()) * 2 / 3);
    await flurry(on, kinds[i % kinds.length], i === n - 1 ? LIB.phrases.burnLast : LIB.phrases.burnGo);
    if (i < n - 1) { showCall('ease off'); await say(LIB.phrases.burnOff); await gapWait(Math.max(0, end - clock.now() - (n - i - 1) * 30000)); }
  }
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:bell3');
  run.roundsDone++;
}

async function techFinisher(dur, themes) {
  run.roundNo = run.nRounds + 1;
  setPhase('Finisher', dur, "Slow and perfect: today's setups");
  const st = run.st = newRoundState(dur, 2);
  const end = run.phase.end;
  await clip('fx:bell');
  await say(LIB.phrases.techFinal);
  const queue = [];
  for (const th of themes) {
    const su = LIB.byId[th.setup];
    queue.push(...(su.spins ? [su] : [su, su])); // spinning setups once: straights stay the bulk
    const done = run.trapsDone.find(x => th.family.includes(x.id));
    if (done) queue.push({ kind: 'callback', id: 'cb:' + done.id, trap: LIB.byId[done.id], from: done.round, spins: 0 });
  }
  for (;;) {
    const e = queue.length ? queue.shift() : pickCore({ snipe: 3, pull: 1, jab: 1 }, st);
    if (!allowed(e.trap || e)) continue;
    if (estimateItem(e, PACE.slow) > end - clock.now() - 3000) break;
    remember(st, e);
    await doItem(e, PACE.slow);
  }
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:bell3');
  run.roundsDone++;
}

async function runRest(dur, tip) {
  setPhase('Rest', dur, tip || '');
  run.st = newRoundState(dur, 0);
  run.st.warned = true;
  const end = run.phase.end;
  await say(LIB.phrases.rest);
  if (run.camReport) {
    const r = run.camReport; run.camReport = null;
    run.camReports.push(r.text);
    if (!SIM) $('answer').textContent = r.text;
    await say(LIB.phrases.camReport);
    await clip('x:' + r.say, r.say); // has numbers in it: spoken by the phone's voice
  }
  if (tip) { await wait(Math.min(4000, dur / 6)); await say(tip); }
  if (end - clock.now() > 10500) { await waitUntil(end - 10000); await say(LIB.phrases.ten); }
  await countIn(end);
}

async function countIn(end) {
  for (const s of [3, 2, 1]) { if (end - s * 1000 > clock.now()) await waitUntil(end - s * 1000); await clip('fx:beep'); }
  await waitUntil(end);
}

function timings() {
  return settings.quick
    ? { warm: settings.warmMin ? 40e3 : 0, round: 90e3, rest: 15e3, fin: 45e3 }
    : { warm: settings.warmMin * 60e3, round: settings.roundMin * 60e3, rest: settings.restMin * 60e3, fin: 3 * 60e3 };
}
const themesOf = s => s.themes ? s.themes.map(id => LIB.themes[id]) : Array.from({ length: settings.rounds }, (_, i) => LIB.themes[LIB.plans[s.plan][i % 3]]);
const planOf = s => s.plan || Object.keys(LIB.plans).find(p => LIB.plans[p].includes(s.themes[0])) || 'snipe';
const totalMin = (s = LIB.sessions[chosen]) => {
  const T = timings(), n = themesOf(s).length;
  return Math.round((T.warm + n * T.round + T.fin + (n + (T.warm ? 1 : 0)) * T.rest) / 60e3);
};

// Runs one part of the session; the Skip button ends just that part.
async function part(name, fn) {
  run.partName = name;
  try { await fn(); }
  catch (e) {
    if (!(e instanceof Skip)) throw e;
    run.skip = false;
    audio.el.pause();
    try { speechSynthesis.cancel(); } catch {}
    run.inRound = false;
    if (camOn() && Cam.coach.round) run.camReport = Cam.coach.endRound();
    if (run.cam && Cam.coach && !Cam.coach.base) { Cam.stop(); run.cam = false; } // calibration skipped: no camera
    showCall('');
  }
}

async function runSession(sess) {
  const T = timings();
  const themes = themesOf(sess);
  const rounds = themes.map((theme, i) => ({ theme, n: i + 1, dur: T.round, mode: sess.mode }));
  run.nRounds = rounds.length;
  run.totalRounds = rounds.length + 1 + (T.warm ? 1 : 0);
  await part('countdown', async () => {
    setPhase('Get ready', 10000, sess.name + ' · ' + sess.mode);
    run.st = newRoundState(10000, 0); run.st.warned = true;
    await say(sess.intro);
    await countIn(run.phase.end);
  });
  if (run.cam) await part('camera check', camCalibrate);
  if (T.warm) await part('warm-up', () => warmupRound(T.warm));
  for (const r of rounds) {
    if ((T.warm || r.n > 1) && T.rest) await part('rest', () => runRest(T.rest, r.theme.tip));
    await part('round', () => themedRound(r));
  }
  if (T.rest) await part('rest', () => runRest(T.rest, sess.mode === 'hard' ? LIB.phrases.nextBurn : LIB.phrases.nextTech));
  await part('finisher', () => sess.mode === 'hard' ? burnout(T.fin) : techFinisher(T.fin, themes));
  run.partName = null;
  if (run.camReport) { run.camReports.push(run.camReport.text); run.camReport = null; }
  setPhase('Done', 0, '');
  await say(LIB.phrases.done);
}

// ---------- screen wake ----------
let wakeLock = null;
async function keepAwake() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      $('wakeInfo').textContent = 'Screen kept awake (Wake Lock).';
      return;
    }
  } catch (e) { console.warn('wake lock', e); }
  try { await $('keepAwake').play(); $('wakeInfo').textContent = 'Screen kept awake (video fallback).'; }
  catch { $('wakeInfo').textContent = 'Could not keep the screen awake: set Auto-Lock to Never.'; }
}
function releaseAwake() {
  try { wakeLock && wakeLock.release(); } catch {}
  wakeLock = null;
  $('keepAwake').pause();
}
document.addEventListener('visibilitychange', () => {
  if (run && !run.finished && !run.test && document.visibilityState === 'visible') keepAwake();
});

// ---------- screens ----------
function show(id) {
  for (const s of document.querySelectorAll('.screen')) s.classList.toggle('hidden', s.id !== id);
  window.scrollTo(0, 0);
}
let chosen = 0;
const fmtSession = s => `${s.name} — ${s.mode}`;
const fmtCfg = () => (settings.quick ? 'quick test' : `${settings.rounds}×${settings.roundMin} min, ${settings.restMin} min rest`) + (settings.camera ? ', camera coach' : '');

// The 7th session: Milan's own mix of round themes (not part of the rotation).
function customSession() {
  const c = settings.custom;
  return { id: 'custom', themes: c.themes, mode: c.mode, name: 'Own mix',
    intro: c.mode === 'hard' ? LIB.phrases.customHard : LIB.phrases.customTech };
}
const sessionAt = i => i === LIB.sessions.length ? customSession() : LIB.sessions[i];

function renderCustom() {
  const c = settings.custom;
  $('cMode').value = c.mode;
  const opts = Object.entries(LIB.plans).map(([plan, ids]) => `<optgroup label="${plan[0].toUpperCase() + plan.slice(1)}">` +
    ids.map(id => `<option value="${id}">${LIB.themes[id].name}</option>`).join('') + '</optgroup>').join('');
  $('cRounds').innerHTML = '';
  c.themes.forEach((id, i) => {
    const l = document.createElement('label');
    l.innerHTML = `Round ${i + 1}<select>${opts}</select>`;
    const sel = l.querySelector('select');
    sel.value = id;
    sel.onchange = () => { c.themes[i] = sel.value; saveSettings(); renderHome(); };
    $('cRounds').appendChild(l);
  });
  $('cAdd').disabled = c.themes.length >= 5;
  $('cDel').disabled = c.themes.length <= 1;
}
$('cMode').onchange = e => { settings.custom.mode = e.target.value; saveSettings(); renderHome(); };
$('cAdd').onclick = () => { const t = settings.custom.themes; t.push(t[t.length - 1]); saveSettings(); renderHome(); };
$('cDel').onclick = () => { settings.custom.themes.pop(); saveSettings(); renderHome(); };

function renderHome() {
  const next = LS.get('next', 0) % LIB.sessions.length;
  const s = sessionAt(chosen);
  $('nextName').textContent = s.name;
  $('nextMode').textContent = s.mode === 'hard' ? 'Hard day' : 'Technical day';
  const th = themesOf(s).map(t => t.name), T = timings();
  $('nextRounds').textContent = (s.id === 'custom' ? 'Your own mix (does not move the rotation). ' : chosen === next ? 'Next in rotation. ' : 'Picked manually. ') +
    (settings.quick ? 'QUICK TEST MODE is on.' : `${T.warm ? `Warm-up ${settings.warmMin} · ` : 'No warm-up · '}${th.length} × ${settings.roundMin} min · finisher 3 · ${settings.restMin} min rest · about ${totalMin(s)} min.`);
  $('nextThemes').textContent = 'Rounds: ' + th.join(' → ');
  $('customBox').classList.toggle('hidden', s.id !== 'custom');
  if (s.id === 'custom') renderCustom();
  $('pickList').innerHTML = '';
  [...LIB.sessions, customSession()].forEach((x, i) => {
    const b = document.createElement('button');
    b.textContent = x.id === 'custom' ? '7. Build your own' : `${i + 1}. ${x.name} (${x.mode === 'hard' ? 'hard' : 'tech'})`;
    b.classList.toggle('on', i === chosen);
    b.onclick = () => { chosen = i; renderHome(); };
    $('pickList').appendChild(b);
  });
  show('home');
}

function newRun(sess, idx) {
  return { sess, idx, aborted: false, finished: false, roundsDone: 0, totalRounds: 5, started: new Date(),
    trace: [], trapsDone: [], flurries: 0, counts: {}, roundNo: 0, cam: false, camReports: [], inRound: false };
}

$('startBtn').onclick = () => {
  const sess = sessionAt(chosen);
  const unlocked = unlockAudio(); // synchronous part runs inside the tap
  keepAwake();
  run = newRun(sess, chosen);
  window.__run = run;
  if (settings.camera && Cam.supported()) { // ask for the camera inside the tap
    run.cam = true;
    $('camBox').classList.remove('hidden');
    $('camInfo').textContent = 'Camera starting…';
    run.camStart = Cam.start($('camVideo'));
    run.camTimer = setInterval(() => {
      if (Cam.running) $('camInfo').textContent = !Cam.coach.base ? `Camera: ${Cam.fps} fps, calibrating`
        : Cam.coach.paused ? 'Camera coach: waiting for the next themed round' : `Camera coach: watching (${Cam.fps} fps)`;
    }, 1000);
  } else $('camBox').classList.add('hidden');
  clock.reset();
  $('pauseBtn').textContent = 'Pause';
  $('stopBtn').textContent = 'Stop';
  show('run');
  run.timer = setInterval(() => {
    renderClock();
    const label = run.partName ? 'Skip ' + run.partName + ' ⏭' : 'Skip ⏭';
    if ($('skipBtn').textContent !== label) $('skipBtn').textContent = label;
    if (camOn() && run.inRound && Cam.coach.round) $('camStats').textContent = Cam.coach.liveStats();
  }, 200);
  unlocked.then(() => runSession(sess)).then(() => finish(true), e => { if (!(e instanceof Abort)) console.error(e); finish(false); });
};
$('pauseBtn').onclick = () => {
  if (clock.pausedAt == null) { clock.pause(); camPause(true); $('pauseBtn').textContent = 'Resume'; }
  else { clock.resume(); if (run.inRound) camPause(false); $('pauseBtn').textContent = 'Pause'; }
};
// Stop: tap twice (no pop-up). Works at any moment, including the countdown, and stops the voice at once.
$('stopBtn').onclick = () => {
  if (!run || run.finished) return;
  if (!run.stopArmed) {
    run.stopArmed = true;
    $('stopBtn').textContent = 'Tap again to stop';
    setTimeout(() => { if (run && !run.finished) { run.stopArmed = false; $('stopBtn').textContent = 'Stop'; } }, 3000);
    return;
  }
  clock.resume();
  run.aborted = true;
  finish(false);
};
$('skipBtn').onclick = () => {
  if (!run || run.finished) return;
  clock.resume(); $('pauseBtn').textContent = 'Pause';
  run.skip = true;
  audio.el.pause();
  try { speechSynthesis.cancel(); } catch {}
};

function finish(completed) {
  if (!run || run.finished) return;
  run.finished = true;
  clearInterval(run.timer);
  clearInterval(run.camTimer);
  if (run.cam) Cam.stop();
  audio.el.pause();
  try { speechSynthesis.cancel(); } catch {}
  releaseAwake();
  run.completed = completed;
  $('logSummary').textContent = `${fmtSession(run.sess)} · ${run.roundsDone}/${run.totalRounds} rounds · ${fmtCfg()}` + (completed ? '' : ' (stopped early)');
  rating = 0; renderStars(); $('note').value = '';
  show('logScreen');
}

let rating = 0;
function renderStars() {
  $('stars').innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const b = document.createElement('button');
    b.textContent = i; b.classList.toggle('on', i === rating);
    b.onclick = () => { rating = i; renderStars(); };
    $('stars').appendChild(b);
  }
}
$('saveLog').onclick = () => {
  if (!rating && !confirm('Save without a rating?')) return;
  const log = LS.get('log', []);
  log.push({
    date: run.started.toISOString(), session: run.sess.id, name: fmtSession(run.sess),
    rounds: `${run.roundsDone}/${run.totalRounds}`, completed: run.completed, cfg: fmtCfg(),
    rating, note: $('note').value.trim(), defPct: settings.defPct, quick: settings.quick,
    cam: run.camReports.length ? run.camReports : undefined,
  });
  LS.set('log', log);
  if (run.sess.id !== 'custom') LS.set('next', (run.idx + 1) % LIB.sessions.length);
  chosen = LS.get('next', 0); run = null; renderHome();
};
$('discardLog').onclick = () => { run = null; renderHome(); };

// ---------- history / export ----------
function exportText() {
  const log = LS.get('log', []);
  const day = d => d.toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' });
  const lines = [
    `STRIKING COACH LOG — exported ${new Date().toISOString().slice(0, 10)} — ${log.length} sessions`,
    `Settings: ${fmtCfg()}, defence calls ${settings.defPct}%, say answer ${settings.sayAnswer ? 'on' : 'off'}, head kicks ${settings.headKicks ? 'on' : 'off'}`,
    `Next in rotation: ${fmtSession(LIB.sessions[LS.get('next', 0)])}`, '',
  ];
  for (const x of log) {
    const d = new Date(x.date);
    lines.push(`${day(d)} ${d.toTimeString().slice(0, 5)} | ${x.name} | ${x.rounds} rounds${x.completed ? '' : ' (stopped)'}${x.quick ? ' (quick test)' : ''}${x.cfg ? ' | ' + x.cfg : ''} | rating ${x.rating || '-'}/5 | def ${x.defPct}%`);
    if (x.note) lines.push('  Note: ' + x.note.replace(/\n+/g, ' / '));
    for (const c of x.cam || []) lines.push('  Camera: ' + c);
  }
  return lines.join('\n');
}
function renderHistory() {
  const log = LS.get('log', []);
  $('histList').innerHTML = log.length ? '' : '<p class="small">No sessions logged yet.</p>';
  for (const x of [...log].reverse()) {
    const div = document.createElement('div');
    div.className = 'hist';
    div.innerHTML = `<div><b>${x.rating || '–'}/5</b> ${x.name}</div><div class="small">${new Date(x.date).toLocaleString('en-GB')} · ${x.rounds} rounds${x.cfg ? ' · ' + x.cfg : ''}</div>`;
    if (x.note) { const p = document.createElement('div'); p.textContent = x.note; div.appendChild(p); }
    for (const c of x.cam || []) { const p = document.createElement('div'); p.className = 'small'; p.textContent = 'Camera: ' + c; div.appendChild(p); }
    $('histList').appendChild(div);
  }
  $('exportMsg').textContent = ''; $('exportBox').classList.add('hidden');
  show('history');
}
$('histBtn').onclick = renderHistory;
$('exportBtn').onclick = async () => {
  const text = exportText();
  try { await navigator.clipboard.writeText(text); $('exportMsg').textContent = 'Copied. Paste it to Claude.'; }
  catch {
    const box = $('exportBox'); box.value = text; box.classList.remove('hidden'); box.select();
    $('exportMsg').textContent = 'Clipboard blocked: select the text below and copy it.';
  }
};

// ---------- settings ----------
function spriteInfo() {
  if (!SPRITE) return 'No voice clips found: using the phone\'s built-in voices.';
  const missing = neededClips().filter(([id, text]) => !SPRITE.clips[id] || SPRITE.clips[id].text !== text).length;
  return `Voice clips loaded (${Object.keys(SPRITE.clips).length}).` +
    (missing ? ` ${missing} lines are not in the clips yet and use the phone's voice: run tools/build_audio.py.` : ' All lines covered.');
}
function neededClips() { // [id, text] the app can say; mirrors collect() in tools/build_audio.py
  const out = [];
  const tok = s => parse(s).flat().forEach(t => out.push(['t:' + t, sayToken(t)]));
  LIB.combos.forEach(e => tok(e.calls)); LIB.traps.forEach(e => tok(e.calls));
  LIB.defence.forEach(d => { out.push(['in:' + d.attack, `Incoming ${d.attack}!`]); tok(d.answer); });
  for (const th of Object.values(LIB.themes)) [th.focus, th.teach, th.tip, ...th.cues].forEach(t => out.push(['x:' + t, t]));
  const walk = v => typeof v === 'string' ? out.push(['x:' + v, v]) : Object.values(v).forEach(walk);
  walk(LIB.phrases);
  return out;
}
function renderSettings() {
  $('defPct').value = settings.defPct; $('defVal').textContent = settings.defPct + '%';
  $('sayAnswer').checked = settings.sayAnswer; $('headKicks').checked = settings.headKicks; $('quick').checked = settings.quick; $('camera').checked = settings.camera;
  $('camera').disabled = !Cam.supported();
  $('roundMin').value = settings.roundMin; $('restMin').value = settings.restMin; $('roundsN').value = settings.rounds;
  $('warmMin').value = settings.warmMin; $('voiceSel').value = settings.voice;
  $('totalInfo').textContent = `Rotation sessions: about ${totalMin(LIB.sessions[0])} min (warm-up and 3 min finisher included).`;
  $('rotSel').innerHTML = LIB.sessions.map((s, i) => `<option value="${i}">${i + 1}. ${fmtSession(s)}</option>`).join('');
  $('rotSel').value = LS.get('next', 0);
  $('audioInfo').textContent = spriteInfo();
  show('settings');
}
$('setBtn').onclick = renderSettings;
$('defPct').oninput = e => { settings.defPct = +e.target.value; $('defVal').textContent = settings.defPct + '%'; saveSettings(); };
$('sayAnswer').onchange = e => { settings.sayAnswer = e.target.checked; saveSettings(); };
$('headKicks').onchange = e => { settings.headKicks = e.target.checked; saveSettings(); };
$('quick').onchange = e => { settings.quick = e.target.checked; saveSettings(); };
$('camera').onchange = e => { settings.camera = e.target.checked; saveSettings(); };
$('voiceSel').onchange = e => { settings.voice = e.target.value; saveSettings(); };
for (const [id, key] of [['roundMin', 'roundMin'], ['restMin', 'restMin'], ['roundsN', 'rounds'], ['warmMin', 'warmMin']]) {
  $(id).onchange = e => { settings[key] = +e.target.value; saveSettings(); renderSettings(); };
}
$('rotSel').onchange = e => { LS.set('next', +e.target.value); chosen = +e.target.value; };
$('testSound').onclick = () => {
  const done = unlockAudio();
  run = { aborted: false, test: true, st: { prog: () => 0 } };
  done.then(async () => {
    await clip('fx:bell'); await sayTokens(['1', '2', 'lead head kick']);
    await tick(1200);
    await clip('fx:alert'); await sayIncoming('cross'); await sayTokens(['pull', '2']);
    $('audioInfo').textContent = (audio.ok ? 'Played from voice clips. ' : 'Played with the built-in voices (no clips). ') + spriteInfo();
    run = null;
  });
};
for (const b of document.querySelectorAll('.back')) b.onclick = renderHome;

// ---------- ?sim: whole session in virtual time, trace on screen and in window.__trace ----------
async function simulate() {
  const idx = (+Q.get('session') || 1) - 1;
  const sess = sessionAt(idx);
  run = newRun(sess, idx);
  clock.reset();
  await runSession(sess);
  const tr = run.trace;
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  window.__trace = tr;
  window.__run = run;
  const pre = document.createElement('pre');
  pre.id = 'simOut';
  pre.textContent = `SIM ${fmtSession(sess)} seed=${Q.get('seed') || '(time)'} ${fmtCfg()} total ${mmss(clock.now() / 1000)}\n` +
    tr.map(x => `${mmss(x.t).padStart(5)} ${x.who === 'incoming' ? '>>>' : x.who === 'fx' ? ' ~ ' : '   '} ${x.text}`).join('\n');
  document.body.innerHTML = '';
  document.body.appendChild(pre);
}

// ---------- boot ----------
(async function boot() {
  LIB = await fetch('library.json').then(r => r.json());
  prepLibrary();
  try { SPRITE = await fetch('audio/sprite.json').then(r => r.ok ? r.json() : null); } catch { SPRITE = null; }
  initAudio();
  if (SIM) { simulate().catch(e => { console.error(e); document.body.textContent = 'SIM ERROR ' + e.stack; }); return; }
  chosen = LS.get('next', 0) % LIB.sessions.length;
  renderHome();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
