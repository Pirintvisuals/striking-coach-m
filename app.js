'use strict';
// Striking Coach v2: one-user, offline, hands-free audio coach. See PLAN.md.

const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const SIM = Q.has('sim'); // ?sim: run a whole session instantly with no audio and print the call trace
const LS = {
  get(k, d) { try { const v = localStorage.getItem('sc.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('sc.' + k, JSON.stringify(v)); } catch {} },
};
const DEFAULTS = { sayAnswer: true, headKicks: true, quick: false, roundMin: 10, restMin: 2, rounds: 3, camera: false,
  warmMin: 2, voice: 'clips', defPct: 25, camCues: false, camRecord: true };
const settings = Object.assign({}, DEFAULTS, LS.get('settings', {}));
delete settings.custom;
if (settings.defPct === 15) settings.defPct = 25; // v6: more incoming attacks (old default was 15%)
if (Q.has('quick')) settings.quick = true;
const saveSettings = () => { if (!SIM) LS.set('settings', settings); };
if (!settings.m7) { settings.defPct = Math.max(25, settings.defPct); settings.m7 = 1; saveSettings(); } // more incoming attacks (v7)

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
const MOVE = /^(pull|slip|roll|parry|check|catch|block|step back|step out|step in|pivot out|angle out|shoulder roll|hop back|sprawl|circle left|circle right|clinch|frame out)$|feint/;
const parse = s => s.split('|').map(st => st.split(',').map(t => t.trim()).filter(Boolean));
function prepLibrary() {
  for (const k of ['combos', 'traps']) for (const e of LIB[k]) {
    e.kind = k === 'traps' ? 'trap' : 'combo';
    e.steps = parse(e.calls);
    e.tags = e.tags || [];
    e.spins = (e.calls.match(new RegExp(SPIN, 'g')) || []).length;
    e.short = e.kind === 'combo' && e.steps[0].length <= 3 && e.steps[0].every(t => /^(1|2|3|4|body 2|body jab|up jab|liver shot|lead uppercut|rear uppercut)$/.test(t));
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
  hard:      { exec: 0.28, rec: [1.1, 0.4],  react: 0.7, preDef: 1.1 },
  technical: { exec: 0.5,  rec: [2.2, 1.5],  react: 1.1, preDef: 1.6 },
  slow:      { exec: 0.9,  rec: [3.6, 3.0],  react: 1.5, preDef: 2.0 },
};
const strikes = ts => ts.reduce((n, t) => n + (MOVE.test(t) ? 0.6 : 1), 0);
const recNow = p => lerp(p.rec[0], p.rec[1], run.st ? run.st.prog() : 0);
const tempo = () => 1; // (the v6 tempo buttons were replaced by "+10 s")
const stepGap = (ts, p) => (strikes(ts) * p.exec + recNow(p)) * 1000 / tempo();
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
    // In opponent mode nobody tells you the defence: you read it and answer yourself.
    if (settings.sayAnswer && !(run.opp && run.inRound)) { if (!SIM) $('answer').textContent = '→ ' + e.answer; await sayTokens(e.answerSteps); }
    else {
      const t0 = performance.now();
      await gapWait(1800);
      if (camOn() && Cam.coach.round && !Cam.coach.judgeDefence(t0 - p.react * 1000, 1800 + p.react * 1000, 'incoming ' + e.attack)) await say(LIB.phrases.gotHit);
    }
    await gapWait(stepGap(e.answerSteps, p));
    return;
  }
  if (e.kind === 'string') { // rapid fire: short punch combos back to back, almost no recovery
    await say(LIB.phrases.rapid);
    for (const c of e.list) {
      showCall(c.calls);
      await sayTokens(c.steps[0]);
      await gapWait((strikes(c.steps[0]) * p.exec * 1000 + 250) / tempo());
    }
    await gapWait(recNow(p) * 1000 / tempo());
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
function pickTrap(w, st, prefer = []) {
  return pickWeighted(LIB.traps.filter(t => allowed(t) && !st.recent.includes(t.id) && t.spins + st.spins <= st.spinMax),
    t => (prefer.includes(t.id) ? 4 : 0) + weightOf(t, w) * 0.3 + 0.2);
}
function pickDef(st, kickShare = 0.35) {
  const group = rand() < kickShare ? 'kick' : 'punch';
  return pickWeighted(LIB.defence.filter(d => allowed(d) && d.group === group && !st.recent.includes(d.id)), () => 1);
}
function pickSpot(sp, st) {
  const fam = [sp.setup, ...sp.family].map(id => LIB.byId[id])
    .filter(e => allowed(e) && !st.recent.slice(-3).includes(e.id) && st.spins + (e.spins || 0) <= st.spinMax);
  return fam.length ? pick(fam) : null;
}
function makeString(st) { // rapid fire: 3-4 short punch combos back to back
  const list = [];
  for (let i = 0, n = 3 + Math.floor(rand() * 2); i < n; i++) list.push(pickCore({ snipe: 3, jab: 2, hook: 2, liver: 1.5, upper: 1 }, st, { short: true }));
  return { kind: 'string', id: 'string', list, spins: 0 };
}
function makeCallback(st) {
  // At most 3 per round, 60 s apart, and prefer traps from earlier rounds.
  if (st.callbacks >= 3 || clock.now() - st.lastCallback < 60000) return null;
  const old = run.trapsDone.filter(x => !st.recent.includes(x.id));
  const earlier = old.filter(x => x.round < run.roundNo);
  const x = earlier.length ? pick(earlier) : old.length ? pick(old) : null;
  const trap = x && LIB.byId[x.id];
  if (!trap || st.spins + trap.spins > st.spinMax || !allowed(trap)) return null;
  st.callbacks++; st.lastCallback = clock.now();
  return { kind: 'callback', id: 'cb:' + x.id, trap, from: x.round, spins: 0 };
}
// Everything is in the mix; the current spotlight just comes up more often.
function pickMix(sess, st, spot) {
  const defP = Math.min(0.55, (settings.defPct / 100) * sess.def);
  if (rand() < defP) {
    const fromSpot = spot && rand() < 0.5 && LIB.byId[spot.setup].kind === 'def' ? pickSpot(spot, st) : null;
    const d = (fromSpot && fromSpot.kind === 'def' && fromSpot) || pickDef(st, sess.defKick ?? 0.35);
    if (d) return d;
  }
  const r = rand();
  const or = (...fns) => { for (const f of fns) { const e = f(); if (e) return e; } return pickCore(sess.weights, st); };
  if (spot && r < 0.25) return or(() => pickSpot(spot, st));
  if (r < 0.3) return or(() => makeCallback(st), () => pickTrap(sess.weights, st, spot ? spot.family : []));
  if (r < 0.37) return or(() => pickTrap(sess.weights, st, spot ? spot.family : []));
  if (r < 0.37 + (sess.rapid ?? 0.15)) return makeString(st);
  return pickCore(sess.weights, st);
}

// ---------- camera coach (optional) ----------
const camOn = () => !SIM && run && run.cam && Cam.running && Cam.coach && Cam.coach.base;
async function camCue() { // between combos only, and only if live cues are switched on
  if (!camOn() || !run.inRound || !settings.camCues) return;
  const type = Cam.coach.takeCue(performance.now());
  if (type) { showCall('CAMERA · ' + LIB.phrases.camCue[type]); await say(LIB.phrases.camCue[type]); }
}
function camPause(p) { if (camOn()) Cam.coach.pause(p); }
// End of a round (or a skipped one): report, and save the recording with its marked moments.
function camEndRound() {
  if (!camOn() || !Cam.coach.round) return;
  const roundNo = run.roundNo, sess = run.sess.name, date = new Date().toISOString();
  run.camReport = Cam.coach.endRound();
  const rep = run.camReport;
  if (!run.recording) return;
  run.recording = false;
  run.saving = Cam.stopRec().then(rec => {
    if (!rec || !rec.blob.size) return;
    const moments = rep.moments.map(m => ({ s: Math.max(0, (m.t - rec.t0) / 1000), type: m.type, text: m.text })).filter(m => m.s > 0);
    return VDB.save({ id: date, date, sess, round: roundNo, blob: rec.blob, mime: rec.blob.type, moments, report: rep.text });
  }).catch(e => console.warn('saving video', e));
}
async function camCheckin() { // a third into the round: say whether it can actually see the work
  if (!settings.camCues && Cam.coach.judged() >= 3) return; // quiet mode: only speak up if it can't see
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
  await say(P.camKicks); c.startStep('kicks'); await wait(7000); c.endStep();
  await say(P.camDone);
  return true;
}

// ---------- rounds ----------
function newRoundState(dur, spinMax) {
  const start = clock.now();
  return { recent: [], warned: false, spins: 0, spinMax, start, dur, callbacks: 0, lastCallback: -1e9, prog: () => (clock.now() - start) / dur };
}
const remember = (st, e) => { st.recent.push(e.id); if (st.recent.length > 8) st.recent.shift(); };
const setFocus = t => { if (!SIM) $('focus').textContent = t; };

async function startBeep() { // explanation is done: "Ready." then the beep, and the clock starts on the beep
  await say(LIB.phrases.ready);
  await gapWait(400);
  await clip('fx:beep');
  showCall('GO!');
}
async function flurry(ms, kind, opener, endAt = Infinity) {
  camPause(true); // all-out flurries aren't judged
  showCall('FLURRY · ' + kind.toUpperCase());
  await say(opener || (ms > 17500 ? LIB.phrases.flurry20 : LIB.phrases.flurry15));
  await say(LIB.flurries[kind].say);
  await startBeep();
  const end = Math.min(clock.now() + ms, endAt);
  let i = 0;
  while (end - clock.now() > 3500) {
    await gapWait(Math.min(4500, end - clock.now() - 3000));
    if (end - clock.now() > 2500) await say(LIB.phrases.pushes[i++ % LIB.phrases.pushes.length]);
  }
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:beep');
  run.flurries++;
  if (run.inRound) camPause(false);
}

async function challenge() {
  const ch = pick(LIB.phrases.challenges);
  camPause(true);
  showCall('CHALLENGE');
  await say(ch.say);
  await startBeep();
  const until = clock.now() + ch.dur * 1000;
  await gapWait(Math.max(0, until - clock.now()));
  await clip('fx:beep');
  await say(LIB.phrases.challengeEnd);
  camPause(false);
}

// One round: everything mixed, a new spotlight every ~2 minutes, flurries, a challenge, rapid fire, incoming attacks.
async function mixRound(spec) {
  const { n, dur, sess, spots } = spec;
  const p = PACE.hard;
  run.roundNo = n;
  setPhase(`Round ${n} of ${run.nRounds}`, dur, '');
  const st = run.st = newRoundState(dur, 1);
  const end = run.phase.end;
  await clip('fx:bell');
  await say(LIB.phrases.round[n - 1] || LIB.phrases.round.at(-1));
  if (camOn()) {
    Cam.coach.startRound(n, spots.map(x => x.name).join(', '));
    run.recording = settings.camRecord && Cam.startRec();
  }
  run.inRound = true;
  run.camCheckin = false;
  const finalMs = Math.min(20000, dur * 0.1);
  const flurryAt = [0.33, 0.66].map(f => st.start + dur * f);
  let challengeAt = st.start + dur * (0.45 + rand() * 0.1);
  const spotLen = (dur - finalMs) / spots.length;
  let si = -1, spot = null, nextCue = clock.now() + 50000, cueI = 0;
  const kinds = LIB.burnout;
  for (;;) {
    const now = clock.now();
    const stopAt = end - finalMs - 2500;
    if (now >= stopAt) break;
    const want = Math.min(spots.length - 1, Math.floor((now - st.start) / spotLen));
    if (want !== si) { // new spotlight: one short line, then show it once straight away
      si = want; spot = spots[si];
      st.spinMax = 2 + (spot.spin || 0);
      setFocus(spot.name);
      await say(spot.say);
      const su = LIB.byId[spot.setup];
      if (allowed(su) && estimateItem(su, p) < stopAt - clock.now()) { remember(st, su); await doItem(su, p); }
      continue;
    }
    if (flurryAt.length && now >= flurryAt[0]) {
      flurryAt.shift();
      const ms = Math.min(15000 + Math.floor(rand() * 2) * 5000, stopAt - now - 6000);
      if (ms >= 8000) { await flurry(ms, kinds[run.flurries % kinds.length]); await say(LIB.phrases.time); await gapWait(2500); }
      continue;
    }
    if (now >= challengeAt) {
      challengeAt = Infinity;
      if (stopAt - now > 25000) await challenge();
      continue;
    }
    if (camOn() && !run.camCheckin && st.prog() > 0.3) { run.camCheckin = true; await camCheckin(); }
    if (now >= nextCue) {
      await say(LIB.phrases.cuesHard[cueI++ % LIB.phrases.cuesHard.length]);
      nextCue = clock.now() + 70000 * (0.8 + rand() * 0.4);
    }
    let e = pickMix(sess, st, spot);
    for (let tries = 0; estimateItem(e, p) > stopAt - clock.now() && tries < 12; tries++) e = pickCore(sess.weights, st, { short: true });
    if (estimateItem(e, p) > stopAt - clock.now()) break;
    remember(st, e);
    run.counts[e.kind] = (run.counts[e.kind] || 0) + 1;
    await doItem(e, p);
    if (e.kind === 'combo' && rand() < 0.15 && estimateItem(e, p) < stopAt - clock.now()) { // "Again!"
      await say(pick(LIB.phrases.again));
      await doItem(e, p);
    }
    await camCue();
  }
  await gapWait(Math.max(0, end - finalMs - 5000 - clock.now()));
  await flurry(finalMs, kinds[run.flurries % kinds.length], LIB.phrases.last20, end);
  showCall('');
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:bell3');
  run.inRound = false;
  camEndRound();
  run.roundsDone++;
}

// Opponent mode: the coach describes what the opponent does; Milan chooses the answer.
// Round 1 names the habits and gives an answer afterwards; round 2 only the short tell; round 3 he adapts.
async function oppSituation(h, full, p) {
  run.lastSit = h;
  // Only the situation. No answers, spoken or on screen: Milan decides what to throw.
  showCall(full ? h.tell : h.short, true);
  await say(full ? h.tell : h.short);
  const longest = Math.max(...h.answers.map(x => parse(x)[0].length));
  const win = (1800 + longest * 450) / tempo();
  const t0 = performance.now();
  await gapWait(win); // your window: the camera watches what you do with it
  if (camOn() && Cam.coach.round) {
    const res = Cam.coach.judgeAnswer(t0, win, h.expect || 'any', h.short);
    if (res && res.ok) await say(LIB.phrases.point);
    else if (res && !res.answered) await say(LIB.phrases.tooLate);
  }
  await gapWait(recNow(p) * 1000);
}

async function opponentRound(spec) {
  const { n, dur, opp, sess } = spec;
  const p = PACE.hard, P = LIB.phrases;
  run.roundNo = n;
  setPhase(`Round ${n} of ${run.nRounds}`, dur, opp.name);
  const st = run.st = newRoundState(dur, 2);
  const end = run.phase.end;
  await clip('fx:bell');
  await say(P.round[n - 1] || P.round.at(-1));
  await say(n === 1 ? opp.intro : n === 2 ? P.oppRound2 : P.oppRound3);
  if (camOn()) { Cam.coach.startRound(n, opp.name); run.recording = settings.camRecord && Cam.startRec(); }
  run.inRound = true;
  run.camCheckin = false;
  const seen = run.oppSeen || (run.oppSeen = new Map()); // habit -> times called this session
  const habits = n >= 3 ? [...opp.habits, opp.adapt] : opp.habits;
  const finalMs = Math.min(20000, dur * 0.1);
  let hurtAt = st.start + dur * (0.45 + rand() * 0.1), nextCue = clock.now() + 60000;
  const attacks = LIB.defence.filter(d => opp.attacks.includes(d.attack) && allowed(d));
  for (;;) {
    const now = clock.now(), stopAt = end - finalMs - 7000;
    if (now >= stopAt) break;
    if (now >= hurtAt) { // he's hurt: a flurry, started on the beep
      hurtAt = Infinity;
      if (stopAt - now > 30000) { await flurry(15000, 'straights', LIB.situations[4].tell); await say(P.time); await gapWait(2000); }
      continue;
    }
    if (camOn() && !run.camCheckin && st.prog() > 0.3) { run.camCheckin = true; await camCheckin(); }
    if (now >= nextCue) { await say(n === 1 ? pick(P.cuesHard) : P.oppHint); nextCue = clock.now() + 70000; }
    const r = rand();
    if (r < 0.4) { // one of his habits
      // Round 3: his new habit comes up a lot, and is named the first time.
      let h = n >= 3 && rand() < 0.45 ? opp.adapt : pick(habits);
      if (h === run.lastSit) h = pick(habits.filter(x => x !== h)) || h; // never the same call twice in a row
      const times = seen.get(h) || 0;
      const full = (n === 1 && times < 2) || (h === opp.adapt && times < 1);
      seen.set(h, times + 1);
      await oppSituation(h, full, p);
      run.counts.habit = (run.counts.habit || 0) + 1;
    } else if (r < 0.7 && attacks.length) { // he attacks with his own weapons
      const d = pick(attacks.filter(x => !st.recent.includes(x.id))) || pick(attacks);
      remember(st, d);
      await doItem(d, p);
    } else { // a general fight situation (not "he's hurt": that one is the flurry)
      await oppSituation(pick(LIB.situations.slice(0, 4).filter(x => x !== run.lastSit)), true, p);
    }
    await camCue();
  }
  await gapWait(Math.max(0, end - finalMs - 6000 - clock.now()));
  await flurry(finalMs, 'straights', LIB.situations[4].tell, end);
  showCall('');
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:bell3');
  run.inRound = false;
  camEndRound();
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
    let e = seg.def && rand() < seg.def ? pickDef(st) : pickCore(seg.weights, st);
    if (estimateItem(e, PACE.warm) > end - clock.now() - 1500) e = pickCore({ warm: 1 }, st, { short: true });
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
  const kinds = LIB.burnout;
  const n = Math.max(1, Math.floor(dur / 30000));
  for (let i = 0; i < n; i++) {
    const on = Math.min(20000, (end - clock.now()) * 2 / 3);
    await flurry(on, kinds[i % kinds.length], i === n - 1 ? LIB.phrases.burnLast : LIB.phrases.burnGo, end);
    if (i < n - 1) { showCall('ease off'); await say(LIB.phrases.burnOff); await gapWait(Math.max(0, end - clock.now() - (n - i - 1) * 30000)); }
  }
  await gapWait(Math.max(0, end - clock.now()));
  await clip('fx:bell3');
  run.roundsDone++;
}

async function runRest(dur, line) {
  setPhase('Rest', dur, '');
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
  if (line) await say(line);
  if (end - clock.now() > 10500) { await waitUntil(end - 10000); await say(LIB.phrases.ten); }
  await countIn(end);
}

async function countIn(end) {
  for (const s of [3, 2, 1]) { if (end - s * 1000 > clock.now()) await waitUntil(end - s * 1000); await clip('fx:beep'); }
  await waitUntil(end);
}

function timings() {
  return settings.quick
    ? { warm: settings.warmMin ? 40e3 : 0, round: 120e3, rest: 15e3, fin: 45e3 }
    : { warm: settings.warmMin * 60e3, round: settings.roundMin * 60e3, rest: settings.restMin * 60e3, fin: 3 * 60e3 };
}
const totalMin = () => {
  const T = timings(), n = settings.rounds;
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
    camEndRound();
    if (run.cam && Cam.coach && !Cam.coach.base) { Cam.stop(); run.cam = false; } // calibration skipped: no camera
    showCall('');
  }
}

// Spotlights continue where the last session of this type stopped, so every session is different.
function spotlightsFor(sess, nRounds, roundMs) {
  const per = Math.max(1, Math.round(roundMs / 120000));
  const pool = sess.spotlights, key = 'spot.' + sess.id;
  const off = SIM ? Math.floor(rand() * pool.length) : LS.get(key, 0);
  if (!SIM) LS.set(key, (off + nRounds * per) % pool.length);
  return Array.from({ length: nRounds }, (_, i) => Array.from({ length: per }, (_, j) => LIB.spotlights[pool[(off + i * per + j) % pool.length]]));
}

const nextOpponent = () => LIB.opponents[LS.get('opp', 0) % LIB.opponents.length];

async function runSession(sess) {
  const T = timings();
  const opp = sess.kind === 'opponent' ? (SIM ? LIB.opponents[(+Q.get('opp') || 0) % LIB.opponents.length] : nextOpponent()) : null;
  if (opp && !SIM) LS.set('opp', (LIB.opponents.indexOf(opp) + 1) % LIB.opponents.length);
  run.opp = opp;
  const spots = opp ? Array.from({ length: settings.rounds }, () => []) : spotlightsFor(sess, settings.rounds, T.round);
  const rounds = spots.map((sp, i) => ({ n: i + 1, dur: T.round, sess, spots: sp, opp }));
  run.nRounds = rounds.length;
  run.totalRounds = rounds.length + 1 + (T.warm ? 1 : 0);
  await part('countdown', async () => {
    setPhase('Get ready', 8000, sess.name);
    run.st = newRoundState(8000, 0); run.st.warned = true;
    await say(sess.intro);
    await countIn(run.phase.end);
  });
  if (run.cam) await part('camera check', camCalibrate);
  if (T.warm) await part('warm-up', () => warmupRound(T.warm));
  for (const r of rounds) {
    if ((T.warm || r.n > 1) && T.rest) await part('rest', () => runRest(T.rest));
    await part('round', () => r.opp ? opponentRound(r) : mixRound(r));
  }
  if (T.rest) await part('rest', () => runRest(T.rest, LIB.phrases.nextBurn));
  await part('finisher', () => burnout(T.fin));
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
const fmtSession = s => s.kind === 'opponent' && run && run.opp ? `${s.name} vs ${run.opp.name.replace(/^The /, '')}` : s.name;
const fmtCfg = () => (settings.quick ? 'quick test' : `${settings.rounds}×${settings.roundMin} min, ${settings.restMin} min rest`) +
  (settings.camera ? ', camera coach' : '');

function previewSpots(sess) {
  if (!sess.spotlights) return [];
  const pool = sess.spotlights, off = LS.get('spot.' + sess.id, 0);
  const per = Math.max(1, Math.round(timings().round / 120000));
  return Array.from({ length: Math.min(6, pool.length, settings.rounds * per) }, (_, i) => LIB.spotlights[pool[(off + i) % pool.length]].name);
}

function renderHome() {
  const next = LS.get('next', 0) % LIB.sessions.length;
  const s = LIB.sessions[chosen], T = timings();
  $('nextName').textContent = s.name;
  $('nextMode').textContent = 'Hard · everything mixed';
  $('nextRounds').textContent = (chosen === next ? 'Next in rotation. ' : 'Picked manually. ') +
    (settings.quick ? 'QUICK TEST MODE is on.' : `${T.warm ? `Warm-up ${settings.warmMin} · ` : 'No warm-up · '}${settings.rounds} × ${settings.roundMin} min · burnout 3 · ${settings.restMin ? settings.restMin + ' min rest' : 'no rest'} · about ${totalMin()} min.`);
  if (s.kind === 'opponent') {
    const o = nextOpponent();
    $('nextMode').textContent = 'Hard · you read him, you choose';
    $('nextThemes').textContent = `Opponent: ${o.name}. ${o.style}`;
  } else $('nextThemes').textContent = 'Coming up: ' + previewSpots(s).join(' → ') + ' …';
  $('oppPick').classList.toggle('hidden', s.kind !== 'opponent');
  if (s.kind === 'opponent') {
    $('oppPick').innerHTML = '';
    LIB.opponents.forEach((o, i) => {
      const b = document.createElement('button');
      b.textContent = o.name.replace(/^The /, '');
      b.classList.toggle('on', o === nextOpponent());
      b.onclick = () => { LS.set('opp', i); renderHome(); };
      $('oppPick').appendChild(b);
    });
  }
  $('pickList').innerHTML = '';
  LIB.sessions.forEach((x, i) => {
    const b = document.createElement('button');
    b.textContent = `${i + 1}. ${x.name}`;
    b.classList.toggle('on', i === chosen);
    b.onclick = () => { chosen = i; renderHome(); };
    $('pickList').appendChild(b);
  });
  show('home');
}

// Combo list: everything the coach can call, with why it works.
function renderCombos() {
  const esc = t => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const FN = { mcgregor: 'McGregor', adesanya: 'Adesanya', ruffy: 'Ruffy' };
  const row = (call, why, who) => `<div class="hist"><b>${esc(call)}</b>${who ? ` <span class="small">${FN[who]}</span>` : ''}<div class="small">${esc(why)}</div></div>`;
  $('comboList').innerHTML =
    `<h3>Combos (${LIB.combos.length})</h3>` + LIB.combos.map(e => row(e.calls, e.why, e.fighter)).join('') +
    `<h3>Traps (${LIB.traps.length})</h3><p class="small">Repeat the pattern, then break it.</p>` + LIB.traps.map(e => row(e.calls.replace(/ \| /g, '  →  '), e.why, e.fighter)).join('') +
    `<h3>Incoming attacks (${LIB.defence.length})</h3>` + LIB.defence.map(d => row(`${d.attack} → ${d.answer}`, d.why, d.fighter)).join('');
  show('combos');
}
$('combosBtn').onclick = renderCombos;

function newRun(sess, idx) {
  return { sess, idx, aborted: false, finished: false, roundsDone: 0, totalRounds: 5, started: new Date(),
    trace: [], trapsDone: [], flurries: 0, counts: {}, roundNo: 0, cam: false, camReports: [], inRound: false };
}

$('startBtn').onclick = () => {
  const sess = LIB.sessions[chosen];
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
    const label = run.partName ? 'Skip ' + run.partName : 'Skip';
    if ($('skipBtn').textContent !== label) $('skipBtn').textContent = label;
    if (camOn() && run.inRound && Cam.coach.round) $('camStats').textContent = Cam.coach.liveStats();
  }, 200);
  unlocked.then(() => runSession(sess)).then(() => finish(true), e => { if (!(e instanceof Abort)) console.error(e); finish(false); });
};
// +10 s: jump the session clock forward, like skipping ahead in a video.
$('fwdBtn').onclick = () => { if (!run || run.finished || SIM) return; clock.offset -= 10000; renderClock(); };
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
  if (run.cam) { if (Cam.coach && Cam.coach.round) camEndRound(); Promise.resolve(run.saving).finally(() => Cam.stop()); }
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
  LS.set('next', (run.idx + 1) % LIB.sessions.length);
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
  for (const sp of Object.values(LIB.spotlights)) out.push(['x:' + sp.say, sp.say]);
  for (const t of LIB.techniques || []) for (const p of t.pointers) if (p.cue) out.push(['x:' + p.cue, p.cue]);
  const walk = v => typeof v === 'string' ? out.push(['x:' + v, v]) : Object.values(v).forEach(walk);
  walk(LIB.phrases);
  return out;
}
function renderSettings() {
  $('defPct').value = settings.defPct; $('defVal').textContent = settings.defPct + '%';
  $('sayAnswer').checked = settings.sayAnswer; $('headKicks').checked = settings.headKicks; $('quick').checked = settings.quick; $('camera').checked = settings.camera;
  $('camCues').checked = settings.camCues; $('camRecord').checked = settings.camRecord;
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
$('camCues').onchange = e => { settings.camCues = e.target.checked; saveSettings(); };
$('camRecord').onchange = e => { settings.camRecord = e.target.checked; saveSettings(); };
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

// ---------- recorded rounds (camera coach) ----------
// Videos stay on the phone (IndexedDB). Only the last 6 rounds are kept.
const VDB = {
  db: null,
  open() {
    return this.db || (this.db = new Promise((res, rej) => {
      const r = indexedDB.open('sc-videos', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('v', { keyPath: 'id' });
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
  },
  async tx(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => { const t = db.transaction('v', mode); const q = fn(t.objectStore('v')); t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); });
  },
  all() { return this.tx('readonly', s => s.getAll()); },
  get(id) { return this.tx('readonly', s => s.get(id)); },
  put(v) { return this.tx('readwrite', s => s.put(v)); },
  del(id) { return this.tx('readwrite', s => s.delete(id)); },
  async save(v) {
    await this.tx('readwrite', s => s.put(v));
    const all = (await this.all()).filter(x => !x.ref).sort((a, b) => a.id < b.id ? 1 : -1);
    for (const old of all.slice(8)) await this.del(old.id);
  },
};
const MOMENT = { rearDrop: 'Rear hand slow / dropped', leadDrop: 'Lead hand dropped low', hip: 'Weak hip on the 2',
  kickGuard: 'Other hand dropped on a kick', kickHip: 'Weak hip on a kick', kickHigh: 'Head kick too low',
  kickReturn: 'Kicking leg slow back', chin: 'Chin up / standing tall', square: 'Stance turned square', still: 'Feet still' };
const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let videoURL = null;
async function renderVideos() {
  show('videos');
  $('videoBox').classList.add('hidden');
  let all = [];
  try { all = (await VDB.all()).filter(x => !x.ref).sort((a, b) => a.id < b.id ? 1 : -1); } catch (e) { $('videoList').textContent = 'Could not open saved videos: ' + e.message; return; }
  $('videoList').innerHTML = all.length ? '' : '<p class="small">No recorded rounds yet. Turn on Settings → Camera coach and Record rounds.</p>';
  for (const v of all) {
    const b = document.createElement('button');
    b.className = 'hist';
    b.innerHTML = `<b>${v.sess}${v.round ? ' · round ' + v.round : ''}</b><div class="small">${new Date(v.date).toLocaleString('en-GB')} · ${(v.blob.size / 1e6).toFixed(0)} MB · ${v.moments.length} moments</div>`;
    b.onclick = () => playVideo(v);
    $('videoList').appendChild(b);
  }
}
let refURL = null, rate = 1;
async function showRef(v) {
  const box = $('refBox'), el = $('refPlayer');
  box.classList.toggle('hidden', !v.tech);
  if (!v.tech) return null;
  const ref = await VDB.get('ref:' + v.tech).catch(() => null);
  if (refURL) { URL.revokeObjectURL(refURL); refURL = null; }
  if (ref) { refURL = URL.createObjectURL(ref.blob); el.src = refURL; }
  el.classList.toggle('hidden', !ref);
  $('refInfo').textContent = ref ? (ref.impact != null ? `Reference impact at ${ref.impact.toFixed(1)} s.` : 'Scrub the reference to the moment of impact and tap "Mark impact".')
    : 'Import a clip from your phone (e.g. a saved Adesanya kick) to watch it next to your reps.';
  $('refMark').classList.toggle('hidden', !ref);
  $('refFile').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    await VDB.put({ id: 'ref:' + v.tech, ref: true, blob: f, impact: null });
    showRef(v);
  };
  $('refMark').onclick = async () => { const r = await VDB.get('ref:' + v.tech); r.impact = el.currentTime; await VDB.put(r); showRef(v); };
  return ref;
}
function setRate(r) {
  rate = r;
  $('videoPlayer').playbackRate = r; $('refPlayer').playbackRate = r;
  for (const b of document.querySelectorAll('#rateBtns button')) b.classList.toggle('on', +b.dataset.r === r);
}
for (const b of document.querySelectorAll('#rateBtns button')) b.onclick = () => setRate(+b.dataset.r);
async function playVideo(v) {
  if (videoURL) URL.revokeObjectURL(videoURL);
  videoURL = URL.createObjectURL(v.blob);
  const el = $('videoPlayer');
  el.src = videoURL;
  const ref = await showRef(v);
  setRate(v.tech ? 0.25 : 1);
  $('videoBox').classList.remove('hidden');
  $('videoReport').textContent = v.report || '';
  // Group moments of the same kind that are close together, so the list stays readable.
  const list = [];
  for (const m of [...v.moments].sort((a, b) => a.s - b.s)) {
    const last = list.findLast(x => x.type === m.type);
    if (last && m.s - last.s < 8 && !m.text) continue;
    list.push(m);
  }
  $('momentList').innerHTML = list.length ? '' : '<p class="small">No problems marked in this round.</p>';
  for (const m of list) {
    const b = document.createElement('button');
    b.textContent = `${mmss(m.s)}  ${m.text || MOMENT[m.type] || m.type}`;
    b.onclick = async () => {
      const lead = v.tech ? 0.4 : 2.5; // lab reps: jump to just before the rep; rounds: a bit earlier
      el.currentTime = Math.max(0, m.s - lead); el.playbackRate = rate; el.play();
      const r = v.tech && await VDB.get('ref:' + v.tech).catch(() => null);
      if (r && r.impact != null) { const re = $('refPlayer'); re.currentTime = Math.max(0, r.impact - 0.8); re.playbackRate = rate; re.play(); }
    };
    $('momentList').appendChild(b);
  }
  $('saveVideo').onclick = async () => {
    const ext = (v.mime || '').includes('mp4') ? 'mp4' : 'webm';
    const file = new File([v.blob], `striking-round${v.round}-${v.id.slice(0, 16).replace(/[:T]/g, '-')}.${ext}`, { type: v.mime || 'video/mp4' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return; }
    } catch (e) { if (e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = videoURL; a.download = file.name; a.click();
  };
  $('delVideo').onclick = async () => { if (confirm('Delete this video?')) { await VDB.del(v.id); renderVideos(); } };
  if (v.labTable) $('videoReport').innerHTML = v.labTable;
  $('videoBox').scrollIntoView({ behavior: 'smooth' });
}
$('videosBtn').onclick = renderVideos;

// ---------- Technique lab: pick a move, 5 reps on the beep, the camera checks the pointers ----------
let labTech = null;
function renderLab() {
  $('labList').innerHTML = '';
  for (const t of LIB.techniques) {
    const b = document.createElement('button');
    b.textContent = t.name; b.classList.toggle('on', t === labTech);
    b.onclick = () => { labTech = t; renderLab(); };
    $('labList').appendChild(b);
  }
  $('labDetail').classList.toggle('hidden', !labTech);
  if (labTech) {
    $('labPointers').innerHTML = labTech.pointers.map(p => `<li>${p.text}${p.check ? '' : ' <span class="small">(you check this in slow motion)</span>'}</li>`).join('');
  }
  $('labStatus').textContent = ''; $('labTable').innerHTML = '';
  show('lab');
}
const MARK = v => v === true ? '✔' : v === false ? '✘' : '–';
function labTableHTML(tech, results) {
  const head = '<tr><th></th>' + results.map((_, i) => `<th>${i + 1}</th>`).join('') + '</tr>';
  const rows = tech.pointers.filter(p => p.check).map(p => `<tr><td>${p.text.split(':')[0]}</td>` +
    results.map(r => `<td>${r.seen ? MARK(r.checks[p.check]) : '·'}</td>`).join('') + '</tr>').join('');
  return `<table class="labtable">${head}${rows}</table><p class="small">✔ good · ✘ fix it · – couldn't measure · · rep not seen</p>`;
}
$('labBtn').onclick = () => renderLab();
$('labStart').onclick = () => {
  const tech = labTech; if (!tech) return;
  const unlocked = unlockAudio();
  if (!Cam.supported()) { $('labStatus').textContent = 'This browser has no camera access.'; return; }
  const camOK = Cam.start($('labVideo')); // inside the tap: camera permission
  run = newRun({ id: 'lab', name: 'Technique lab' }, -1);
  run.lab = true;
  clock.reset();
  $('labStart').disabled = true; $('labStop').classList.remove('hidden');
  const P = LIB.phrases, results = [];
  (async () => {
    await unlocked;
    await say(P.labIntro);
    if (!(await camOK)) { $('labStatus').textContent = 'Camera could not start: ' + (Cam.error || 'unknown'); await say(P.camFail); return; }
    const c = Cam.coach;
    $('labStatus').textContent = 'Stand in your stance';
    await say(P.labStance); c.startStep('guard'); await wait(3000);
    for (let i = 0; i < 10 && c.cal.guard.filter(x => x.f).length < 12; i++) await wait(300); // slow phone: wait for enough frames
    if (c.endStep() !== 'ok') { $('labStatus').textContent = "Couldn't see you: head to feet in view, decent light."; await say(P.camFail); return; }
    c.paused = false;
    const recOn = Cam.startRec(), marks = [];
    for (let i = 0; i < 5; i++) {
      $('labStatus').textContent = `Rep ${i + 1} of 5: ${tech.name}`;
      await say(P.labRep[i]);
      await sayTokens([tech.call]);
      await wait(500);
      await clip('fx:beep');
      const t0 = performance.now();
      await wait(2600);
      const res = c.labRep(t0, performance.now(), tech);
      results.push(res);
      const fail = res.seen && tech.pointers.find(p => p.check && res.checks[p.check] === false);
      marks.push({ t: t0, type: 'rep', text: `Rep ${i + 1}: ` + (!res.seen ? 'not seen' : fail ? fail.cue : 'good') });
      $('labTable').innerHTML = labTableHTML(tech, results);
      await say(!res.seen ? P.labMissed : fail ? fail.cue : P.labGood);
      await wait(1200);
    }
    await say(P.labDone);
    if (recOn) {
      const rec = await Cam.stopRec();
      if (rec && rec.blob.size) {
        const date = new Date().toISOString();
        await VDB.save({ id: date, date, sess: 'Technique lab: ' + tech.name, round: 0, tech: tech.id, blob: rec.blob, mime: rec.blob.type,
          moments: marks.map(m => ({ s: Math.max(0, (m.t - rec.t0) / 1000), type: m.type, text: m.text })),
          report: '', labTable: labTableHTML(tech, results) });
        $('labStatus').innerHTML = 'Saved. <button id="labWatch">Watch the reps in slow motion</button>';
        $('labWatch').onclick = async () => { const all = await VDB.all(); renderVideos().then(() => playVideo(all.find(x => x.id === date))); };
      }
    }
  })().catch(e => { if (!(e instanceof Abort)) { console.error(e); $('labStatus').textContent = 'Error: ' + e.message; } })
    .finally(() => { Cam.stop(); run = null; $('labStart').disabled = false; $('labStop').classList.add('hidden'); });
};
$('labStop').onclick = () => { if (run && run.lab) run.aborted = true; };

// ---------- ?sim: whole session in virtual time, trace on screen and in window.__trace ----------
async function simulate() {
  const idx = (+Q.get('session') || 1) - 1;
  const sess = LIB.sessions[idx];
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
